import React from 'react';
import { Menu, Plus, Sparkles } from 'lucide-react';
import { NavigationItemId } from '../types.ts';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeItem: NavigationItemId;
  onNewChat: () => void;
  isConfigured: boolean;
  onOpenHelp: () => void;
}

const TOOL_TITLES: Record<NavigationItemId, string> = {
  'new-chat': 'New Conversation',
  'chat': 'AI Chat',
  'writing-assistant': 'AI Writing Assistant',
  'prompt-generator': 'AI Image Prompt Generator',
  'image-analyzer': 'AI Image Analyzer',
  'image-generator': 'AI Image Generator',
  'photo-editor': 'AI Photo Editing Assistant',
  'code-assistant': 'AI Code Assistant',
  'pdf-assistant': 'PDF Assistant',
  'document-summarizer': 'Document Summarizer',
  'language-translator': 'Language Translator',
  'math-assistant': 'AI Math Assistant',
  'study-assistant': 'Study Assistant',
  'youtube-script': 'YouTube Script Generator',
  'social-media': 'Social Media Caption Generator',
  'video-tools': 'AI Video Tools',
  'chat-history': 'Chat History',
  'settings': 'Settings',
  'help-about': 'Help and About',
};

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeItem,
  onNewChat,
  isConfigured,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger + Active Tool */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            {TOOL_TITLES[activeItem] || 'Qubixa AI'}
          </h1>
          {activeItem === 'chat' && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <Sparkles className="w-3 h-3 text-blue-600" />
              100% Free AI
            </span>
          )}
        </div>
      </div>

      {/* Right side: Status and New Chat Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!isConfigured && (
          <button
            type="button"
            onClick={onOpenHelp}
            className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
            title="Click to view API key setup instructions"
          >
            <span>🇧🇩 Setup Required</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Start a new chat conversation"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
