/**
 * Nexora AI — Core Type Definitions
 */

export type NavigationItemId =
  | 'new-chat'
  | 'chat'
  | 'writing-assistant'
  | 'prompt-generator'
  | 'image-analyzer'
  | 'image-generator'
  | 'photo-editor'
  | 'code-assistant'
  | 'pdf-assistant'
  | 'document-summarizer'
  | 'language-translator'
  | 'math-assistant'
  | 'study-assistant'
  | 'youtube-script'
  | 'social-media'
  | 'video-tools'
  | 'chat-history'
  | 'settings'
  | 'help-about';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: {
    mimeType: string;
    data: string; // base64 string without data: prefix
    previewUrl: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  systemInstruction?: string;
}

export interface ServerStatus {
  status: string;
  appName: string;
  configured: boolean;
  models: Record<string, string>;
  setupFile: string;
}
