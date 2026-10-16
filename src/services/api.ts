/**
 * Nexora AI — Frontend API Client
 * Communicates strictly with our secure server backend at /api/*
 * Never exposes API keys or secrets to the browser.
 */

import { ChatMessage, ServerStatus } from '../types.ts';

export class ApiError extends Error {
  code?: string;
  setupInstruction?: string;
  constructor(message: string, code?: string, setupInstruction?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.setupInstruction = setupInstruction;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    throw new ApiError(errorMsg, data.error, data.setupInstruction);
  }
  return data as T;
}

export async function fetchServerStatus(): Promise<ServerStatus> {
  try {
    const res = await fetch('/api/status');
    return await handleResponse<ServerStatus>(res);
  } catch (err) {
    console.warn('Server status check failed:', err);
    return {
      status: 'offline',
      appName: 'Qubixa AI',
      configured: false,
      models: {},
      setupFile: 'server/config.ts (Line 11)',
    };
  }
}

export async function sendChatMessage(
  messages: ChatMessage[],
  systemInstruction?: string,
  temperature?: number
): Promise<string> {
  const payload = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      image: m.image
        ? {
            mimeType: m.image.mimeType,
            data: m.image.data,
          }
        : undefined,
    })),
    systemInstruction,
    temperature,
  };

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<{ reply: string }>(res);
  return data.reply;
}

export async function generateAiText(
  prompt: string,
  options?: {
    systemInstruction?: string;
    modelType?: string;
    temperature?: number;
  }
): Promise<string> {
  const res = await fetch('/api/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      systemInstruction: options?.systemInstruction,
      modelType: options?.modelType || 'writing',
      temperature: options?.temperature ?? 0.7,
    }),
  });

  const data = await handleResponse<{ text: string }>(res);
  return data.text;
}

export async function analyzeImage(
  image: { mimeType: string; data: string },
  prompt?: string,
  analysisType: 'general' | 'ocr' | 'critique' | 'objects' = 'general'
): Promise<string> {
  const res = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image,
      prompt,
      analysisType,
    }),
  });

  const data = await handleResponse<{ analysis: string }>(res);
  return data.analysis;
}

export async function generateAiImage(
  prompt: string,
  aspectRatio: string = '1:1'
): Promise<{ imageUrl: string; description?: string }> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      aspectRatio,
    }),
  });

  return await handleResponse<{ imageUrl: string; description?: string }>(res);
}

export async function editAiImage(
  image: { mimeType: string; data: string },
  prompt: string
): Promise<{ imageUrl: string | null; message?: string }> {
  const res = await fetch('/api/edit-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image,
      prompt,
    }),
  });

  return await handleResponse<{ imageUrl: string | null; message?: string }>(res);
}

export async function summarizeDocument(
  text: string,
  title: string = 'Document',
  format: 'executive' | 'bullet_points' | 'tldr' | 'qa' = 'bullet_points',
  query?: string
): Promise<string> {
  const res = await fetch('/api/summarize-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      title,
      format,
      query,
    }),
  });

  const data = await handleResponse<{ summary: string }>(res);
  return data.summary;
}
