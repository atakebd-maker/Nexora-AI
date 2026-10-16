/**
 * Nexora AI — Full-Stack Server
 * 
 * Express backend powering all AI tools via Google Gemini SDK.
 * Mounts Vite dev server in development and serves static assets in production.
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, isApiKeyConfigured, AI_MODELS } from './server/config.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable large payloads for image and document uploads (up to 30MB base64)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

/**
 * Helper to instantiate the official Google GenAI SDK client
 */
function getAiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "MISSING_API_KEY: Gemini API Key is not configured. Please open 'server/config.ts' line 11 (marked with 🇧🇩) or add GEMINI_API_KEY to your .env file."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Format error response nicely for the client
 */
function handleApiError(err: unknown, res: express.Response) {
  console.error('[Nexora Server Error]:', err);
  const message = err instanceof Error ? err.message : String(err);
  
  if (message.includes('MISSING_API_KEY')) {
    return res.status(401).json({
      error: 'API_KEY_REQUIRED',
      message: "Google Gemini API key has not been configured yet.",
      setupInstruction: "Open 'server/config.ts' at line 11 (marked with 🇧🇩) and paste your key into MANUAL_GEMINI_API_KEY, or set GEMINI_API_KEY in .env.",
    });
  }
  
  if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
    return res.status(403).json({
      error: 'INVALID_API_KEY',
      message: "The configured Google Gemini API key is invalid.",
      setupInstruction: "Please verify your key from Google AI Studio and update 'server/config.ts' (line 11) or your .env file.",
    });
  }

  if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: "Gemini API rate limit or quota exceeded. Please wait a moment or try again later.",
    });
  }

  return res.status(500).json({
    error: 'AI_PROCESSING_ERROR',
    message: message || "An unexpected error occurred while processing your request.",
  });
}

// --------------------------------------------------------------------------
// API Endpoints
// --------------------------------------------------------------------------

/**
 * System Status & Health Check
 */
app.get('/api/status', (_req, res) => {
  const configured = isApiKeyConfigured();
  res.json({
    status: 'online',
    appName: 'Nexora AI',
    configured,
    models: AI_MODELS,
    setupFile: 'server/config.ts (Line 11)',
  });
});

/**
 * Conversational Chat Endpoint (multi-turn with optional image attachment)
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, temperature = 0.7 } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'Messages array is required.' });
    }

    const ai = getAiClient();
    
    // Convert client chat messages into Gemini contents format
    // Format: contents can be array of Content objects or string
    const contents = messages.map((m: { role: string; content: string; image?: { mimeType: string; data: string } }) => {
      const parts: any[] = [];
      if (m.image && m.image.data) {
        parts.push({
          inlineData: {
            mimeType: m.image.mimeType || 'image/jpeg',
            data: m.image.data,
          },
        });
      }
      if (m.content) {
        parts.push({ text: m.content });
      }
      return {
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts,
      };
    });

    const response = await ai.models.generateContent({
      model: AI_MODELS.chat,
      contents,
      config: {
        systemInstruction: systemInstruction || "You are Nexora AI, a brilliant, professional, helpful, and concise AI platform. Format your responses with clean Markdown, clear headings, bullet points, and code blocks with language identifiers where appropriate.",
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });

    const reply = response.text || "I was unable to generate a response. Please try asking again.";
    return res.json({ reply });
  } catch (err) {
    return handleApiError(err, res);
  }
});

/**
 * Dedicated Text Generation (Writing, Math, Code, Translator, Study, Prompts, Social)
 */
app.post('/api/generate-text', async (req, res) => {
  try {
    const { prompt, systemInstruction, modelType = 'writing', temperature = 0.7 } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'A prompt is required.' });
    }

    const ai = getAiClient();
    const modelToUse = (AI_MODELS as Record<string, string>)[modelType] || AI_MODELS.writing;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });

    const result = response.text || "No output generated.";
    return res.json({ text: result });
  } catch (err) {
    return handleApiError(err, res);
  }
});

/**
 * AI Image Analyzer (Vision multimodal inspection)
 */
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { prompt, image, analysisType = 'general' } = req.body;
    if (!image || !image.data) {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'An image with base64 data is required.' });
    }

    const ai = getAiClient();

    let systemInstruction = "You are Nexora AI Image Analyzer. Provide detailed, insightful visual analysis.";
    if (analysisType === 'ocr') {
      systemInstruction = "You are a high-precision OCR and text extraction specialist. Extract all visible text accurately with layout preservation.";
    } else if (analysisType === 'critique') {
      systemInstruction = "You are an expert photography and visual design critic. Critique lighting, composition, color harmony, and suggest improvements.";
    } else if (analysisType === 'objects') {
      systemInstruction = "You are an object detection specialist. List and categorize all prominent objects, subjects, and elements detected in the scene.";
    }

    const parts = [
      {
        inlineData: {
          mimeType: image.mimeType || 'image/jpeg',
          data: image.data,
        },
      },
      {
        text: prompt || "Analyze this image in detail and describe what you see, including key subjects, colors, context, and details.",
      },
    ];

    const response = await ai.models.generateContent({
      model: AI_MODELS.vision,
      contents: { parts },
      config: { systemInstruction },
    });

    const analysis = response.text || "No analysis could be produced.";
    return res.json({ analysis });
  } catch (err) {
    return handleApiError(err, res);
  }
});

/**
 * AI Image Generator
 */
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'A prompt is required to generate an image.' });
    }

    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: AI_MODELS.imageGen,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
        },
      },
    });

    let imageUrl = '';
    let description = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          description = part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'NO_IMAGE_RETURNED',
        message: description || 'The image generation model did not return image data. Check if your API tier supports image generation.',
      });
    }

    return res.json({ imageUrl, description, prompt });
  } catch (err) {
    return handleApiError(err, res);
  }
});

/**
 * AI Photo Editing Assistant
 */
app.post('/api/edit-image', async (req, res) => {
  try {
    const { prompt, image } = req.body;
    if (!image || !image.data) {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'Source image is required for editing.' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'Edit instructions are required.' });
    }

    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: AI_MODELS.imageGen,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: image.mimeType || 'image/jpeg',
              data: image.data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let imageUrl = '';
    let description = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          description = part.text;
        }
      }
    }

    if (!imageUrl) {
      // If image-to-image is not enabled on standard key, provide constructive editing instructions
      return res.json({
        imageUrl: null,
        message: description || "The model provided visual editing recommendations rather than rendered pixels.",
      });
    }

    return res.json({ imageUrl, description });
  } catch (err) {
    return handleApiError(err, res);
  }
});

/**
 * Document & PDF Summarizer
 */
app.post('/api/summarize-doc', async (req, res) => {
  try {
    const { text, title = 'Document', format = 'bullet_points', query } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'Document text content is required.' });
    }

    const ai = getAiClient();

    let instruction = `You are Nexora AI Document Assistant. You are analyzing "${title}". Provide a clear, highly structured summary with key takeaways and actionable insights.`;
    if (format === 'executive') {
      instruction += ' Write a concise executive summary suitable for leadership.';
    } else if (format === 'tldr') {
      instruction += ' Provide a punchy 2-3 sentence TL;DR followed by 5 bullet points.';
    } else if (format === 'qa' && query) {
      instruction = `Answer the user query based ONLY on the provided document content. User query: "${query}"`;
    }

    const prompt = query 
      ? `Document Title: ${title}\n\nDocument Text:\n${text.slice(0, 50000)}\n\nUser Question: ${query}`
      : `Document Title: ${title}\n\nDocument Text:\n${text.slice(0, 50000)}\n\nPlease summarize this document effectively in ${format} format.`;

    const response = await ai.models.generateContent({
      model: AI_MODELS.writing,
      contents: prompt,
      config: {
        systemInstruction: instruction,
        temperature: 0.3,
      },
    });

    return res.json({ summary: response.text || "No summary could be generated." });
  } catch (err) {
    return handleApiError(err, res);
  }
});

// --------------------------------------------------------------------------
// Vite integration for development & static serving for production
// --------------------------------------------------------------------------
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`[Nexora AI] Vite development middleware mounted.`);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`🚀 Nexora AI server running on http://0.0.0.0:${PORT}`);
    console.log(`🇧🇩 Gemini API key setup location: server/config.ts (Line 11)`);
    console.log(`Status: ${isApiKeyConfigured() ? '✅ API Key configured' : '⚠️ API Key pending (see server/config.ts)'}`);
    console.log(`================================================================`);
  });
});
