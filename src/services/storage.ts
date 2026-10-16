/**
 * Qubixa AI — Local Conversation Storage
 * Provides persistent local state for conversations and user preferences.
 */

import { Conversation, ChatMessage } from '../types.ts';

const STORAGE_KEY = 'qubixa_conversations_v1';
const FALLBACK_KEY = 'nexora_conversations_v1';
const ACTIVE_CONV_KEY = 'qubixa_active_conversation_id';

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(FALLBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load conversations from storage:', err);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations to storage:', err);
  }
}

export function getActiveConversationId(): string | null {
  return localStorage.getItem(ACTIVE_CONV_KEY);
}

export function setActiveConversationId(id: string): void {
  localStorage.setItem(ACTIVE_CONV_KEY, id);
}

export function createNewConversation(title: string = 'New Conversation'): Conversation {
  const newConv: Conversation = {
    id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };

  const current = getStoredConversations();
  const updated = [newConv, ...current];
  saveConversations(updated);
  setActiveConversationId(newConv.id);
  return newConv;
}

export function appendMessageToConversation(
  conversationId: string,
  message: ChatMessage
): Conversation[] {
  const current = getStoredConversations();
  const target = current.find((c) => c.id === conversationId);

  if (!target) {
    // If not found, create new one
    const newConv: Conversation = {
      id: conversationId,
      title: message.content.slice(0, 32) || 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [message],
    };
    const updated = [newConv, ...current];
    saveConversations(updated);
    return updated;
  }

  // Update title if this was the first user message
  let title = target.title;
  if (target.messages.length === 0 && message.role === 'user' && message.content) {
    title = message.content.slice(0, 36).trim() + (message.content.length > 36 ? '...' : '');
  }

  const updatedTarget: Conversation = {
    ...target,
    title,
    updatedAt: Date.now(),
    messages: [...target.messages, message],
  };

  const updated = current.map((c) => (c.id === conversationId ? updatedTarget : c));
  saveConversations(updated);
  return updated;
}

export function deleteConversation(id: string): Conversation[] {
  const current = getStoredConversations();
  const updated = current.filter((c) => c.id !== id);
  saveConversations(updated);

  if (getActiveConversationId() === id) {
    if (updated.length > 0) {
      setActiveConversationId(updated[0].id);
    } else {
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }
  }
  return updated;
}

export function renameConversation(id: string, newTitle: string): Conversation[] {
  const current = getStoredConversations();
  const updated = current.map((c) =>
    c.id === id ? { ...c, title: newTitle.trim() || 'Untitled Chat', updatedAt: Date.now() } : c
  );
  saveConversations(updated);
  return updated;
}

export function clearAllConversations(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_CONV_KEY);
}
