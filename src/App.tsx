/**
 * Nexora AI — Main Application Container
 */

import React, { useState, useEffect } from 'react';
import { NavigationItemId, Conversation, ServerStatus } from './types.ts';
import {
  getStoredConversations,
  getActiveConversationId,
  setActiveConversationId,
  createNewConversation,
  deleteConversation,
  saveConversations,
} from './services/storage.ts';
import { fetchServerStatus } from './services/api.ts';

import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';

// Views
import { ChatView } from './views/ChatView.tsx';
import { WritingAssistantView } from './views/WritingAssistantView.tsx';
import { ImagePromptGeneratorView } from './views/ImagePromptGeneratorView.tsx';
import { ImageAnalyzerView } from './views/ImageAnalyzerView.tsx';
import { ImageGeneratorView } from './views/ImageGeneratorView.tsx';
import { PhotoEditingAssistantView } from './views/PhotoEditingAssistantView.tsx';
import { CodeAssistantView } from './views/CodeAssistantView.tsx';
import { PdfAssistantView } from './views/PdfAssistantView.tsx';
import { DocumentSummarizerView } from './views/DocumentSummarizerView.tsx';
import { LanguageTranslatorView } from './views/LanguageTranslatorView.tsx';
import { MathAssistantView } from './views/MathAssistantView.tsx';
import { StudyAssistantView } from './views/StudyAssistantView.tsx';
import { YouTubeScriptGeneratorView } from './views/YouTubeScriptGeneratorView.tsx';
import { SocialMediaCaptionView } from './views/SocialMediaCaptionView.tsx';
import { VideoToolsView } from './views/VideoToolsView.tsx';
import { ChatHistoryView } from './views/ChatHistoryView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { HelpAboutView } from './views/HelpAboutView.tsx';

export default function App() {
  const [activeItem, setActiveItem] = useState<NavigationItemId>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConvId] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);

  // Transfer state from Prompt Generator to Image Generator
  const [generatorPrefill, setGeneratorPrefill] = useState<{
    prompt: string;
    aspectRatio: string;
  } | null>(null);

  // Initialize storage & check server health on mount
  useEffect(() => {
    const stored = getStoredConversations();
    setConversations(stored);

    let currentId = getActiveConversationId();
    if (!currentId && stored.length > 0) {
      currentId = stored[0].id;
      setActiveConversationId(currentId);
    }
    setActiveConvId(currentId);

    // Check server connection & key status
    fetchServerStatus().then((status) => {
      setServerStatus(status);
    });
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  const handleNewChat = () => {
    const newConv = createNewConversation('New Conversation');
    setConversations(getStoredConversations());
    setActiveConvId(newConv.id);
    setActiveItem('chat');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setActiveConvId(id);
    setActiveItem('chat');
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteConversation(id);
    setConversations(updated);
    if (activeConversationId === id) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      setActiveConvId(nextId);
    }
  };

  const handleUpdateConversation = (updatedConv: Conversation) => {
    const updatedList = conversations.map((c) =>
      c.id === updatedConv.id ? updatedConv : c
    );
    // If not existing, prepend
    if (!conversations.some((c) => c.id === updatedConv.id)) {
      updatedList.unshift(updatedConv);
    }
    setConversations(updatedList);
    saveConversations(updatedList);
    setActiveConvId(updatedConv.id);
  };

  const handleTransferPromptToGenerator = (prompt: string, aspectRatio: string) => {
    setGeneratorPrefill({ prompt, aspectRatio });
    setActiveItem('image-generator');
  };

  // Metrics
  const totalMessages = conversations.reduce(
    (acc, curr) => acc + curr.messages.length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans antialiased text-slate-900">
      {/* 19-Item Responsive Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeItem={activeItem}
        onSelectItem={(item) => setActiveItem(item)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeItem={activeItem}
          onNewChat={handleNewChat}
          isConfigured={serverStatus?.configured ?? true}
          onOpenHelp={() => setActiveItem('help-about')}
        />

        {/* Dynamic Tool Content View */}
        <main className="flex-1 overflow-x-hidden">
          {activeItem === 'chat' && (
            <ChatView
              conversation={activeConversation}
              onUpdateConversation={handleUpdateConversation}
              onNewChat={handleNewChat}
              onNavigateToSetup={() => setActiveItem('help-about')}
            />
          )}

          {activeItem === 'writing-assistant' && <WritingAssistantView />}

          {activeItem === 'prompt-generator' && (
            <ImagePromptGeneratorView
              onUsePromptInGenerator={handleTransferPromptToGenerator}
            />
          )}

          {activeItem === 'image-analyzer' && <ImageAnalyzerView />}

          {activeItem === 'image-generator' && (
            <ImageGeneratorView
              initialPrompt={generatorPrefill?.prompt}
              initialAspectRatio={generatorPrefill?.aspectRatio}
            />
          )}

          {activeItem === 'photo-editor' && <PhotoEditingAssistantView />}

          {activeItem === 'code-assistant' && <CodeAssistantView />}

          {activeItem === 'pdf-assistant' && <PdfAssistantView />}

          {activeItem === 'document-summarizer' && <DocumentSummarizerView />}

          {activeItem === 'language-translator' && <LanguageTranslatorView />}

          {activeItem === 'math-assistant' && <MathAssistantView />}

          {activeItem === 'study-assistant' && <StudyAssistantView />}

          {activeItem === 'youtube-script' && <YouTubeScriptGeneratorView />}

          {activeItem === 'social-media' && <SocialMediaCaptionView />}

          {activeItem === 'video-tools' && <VideoToolsView />}

          {activeItem === 'chat-history' && (
            <ChatHistoryView
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onNewChat={handleNewChat}
              onRefreshConversations={() => setConversations(getStoredConversations())}
            />
          )}

          {activeItem === 'settings' && (
            <SettingsView
              serverStatus={serverStatus}
              totalConversations={conversations.length}
              totalMessages={totalMessages}
            />
          )}

          {activeItem === 'help-about' && <HelpAboutView />}
        </main>
      </div>
    </div>
  );
}
