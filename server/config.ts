/**
 * Qubixa AI — Central Server-Side Configuration
 *
 * This file houses the central configuration for Google Gemini AI models and API credentials.
 * No client/browser code ever has access to this file or any secrets stored here.
 */

// ==============================================================================
// 🇧🇩 PASTE YOUR GOOGLE GEMINI API KEY HERE — THIS IS THE ONLY PLACE TO ADD IT. DO NOT CHANGE OTHER CODE.
// File: server/config.ts (Line 11)
// If you do not use a .env file, replace the placeholder below with your Gemini API key:
// ==============================================================================
export const MANUAL_GEMINI_API_KEY = "PASTE_YOUR_API_KEY_HERE";

/**
 * Centrally configured Gemini Models
 * Change model aliases here to update all tools across the entire platform.
 */
export const AI_MODELS = {
  // General chat & multi-turn conversational intelligence
  chat: 'gemini-3.8-flash',
  
  // High-performance coding and debugging
  code: 'gemini-3.8-flash',
  
  // Step-by-step mathematical problem solving
  math: 'gemini-3.8-flash',
  
  // Multimodal visual recognition & image analysis
  vision: 'gemini-3.8-flash',
  
  // Writing, essay, summary, and translation assistants
  writing: 'gemini-3.8-flash',
  translator: 'gemini-3.8-flash',
  
  // Native image generation and editing
  imageGen: 'gemini-3.1-flash-lite-image',
  
  // Video generation model (Veo preview)
  videoGen: 'veo-3.1-lite-generate-preview',
};

/**
 * Securely retrieves the active Gemini API key from environment variables
 * or falls back to the manual configuration line above.
 */
export function getGeminiApiKey(): string {
  const envKey = process.env.GEMINI_API_KEY?.trim();
  if (envKey && envKey !== "MY_GEMINI_API_KEY" && envKey !== "PASTE_YOUR_API_KEY_HERE") {
    return envKey;
  }
  
  const manualKey = MANUAL_GEMINI_API_KEY?.trim();
  if (manualKey && manualKey !== "PASTE_YOUR_API_KEY_HERE") {
    return manualKey;
  }
  
  return "";
}

/**
 * Checks whether a valid API key has been configured.
 */
export function isApiKeyConfigured(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 5);
}
