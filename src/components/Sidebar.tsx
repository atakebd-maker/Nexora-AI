import React from 'react';
import {
  MessageSquare,
  Plus,
  PenTool,
  Sparkles,
  Eye,
  Image as ImageIcon,
  Sliders,
  Code,
  FileText,
  FileSearch,
  Languages,
  Calculator,
  GraduationCap,
  Youtube,
  Share2,
  Video,
  History,
  Settings,
  HelpCircle,
  X,
  Trash2,
} from 'lucide-react';
import { NavigationItemId, Conversation } from '../types.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: NavigationItemId;
  onSelectItem: (item: NavigationItemId) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
}

interface NavItemConfig {
  id: NavigationItemId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  category?: 'primary' | 'tools' | 'system';
}

const NAV_ITEMS: NavItemConfig[] = [
  // Core Chat
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, category: 'primary' },
  
  // Creation & Writing
  { id: 'writing-assistant', label: 'AI Writing Assistant', icon: PenTool, category: 'tools' },
  { id: 'prompt-generator', label: 'AI Image Prompt Generator', icon: Sparkles, category: 'tools' },
  { id: 'image-analyzer', label: 'AI Image Analyzer', icon: Eye, category: 'tools' },
  { id: 'image-generator', label: 'AI Image Generator', icon: ImageIcon, category: 'tools' },
  { id: 'photo-editor', label: 'AI Photo Editing Assistant', icon: Sliders, category: 'tools' },
  { id: 'code-assistant', label: 'AI Code Assistant', icon: Code, category: 'tools' },
  
  // Documents & Study
  { id: 'pdf-assistant', label: 'PDF Assistant', icon: FileText, category: 'tools' },
  { id: 'document-summarizer', label: 'Document Summarizer', icon: FileSearch, category: 'tools' },
  { id: 'language-translator', label: 'Language Translator', icon: Languages, category: 'tools' },
  { id: 'math-assistant', label: 'AI Math Assistant', icon: Calculator, category: 'tools' },
  { id: 'study-assistant', label: 'Study Assistant', icon: GraduationCap, category: 'tools' },
  
  // Media & Video
  { id: 'youtube-script', label: 'YouTube Script Generator', icon: Youtube, category: 'tools' },
  { id: 'social-media', label: 'Social Media Caption Generator', icon: Share2, category: 'tools' },
  { id: 'video-tools', label: 'AI Video Tools', icon: Video, category: 'tools' },
  
  // History & System
  { id: 'chat-history', label: 'Chat History', icon: History, category: 'system' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'system' },
  { id: 'help-about', label: 'Help and About', icon: HelpCircle, category: 'system' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeItem,
  onSelectItem,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}) => {
  const handleItemClick = (id: NavigationItemId) => {
    if (id === 'new-chat') {
      onNewChat();
    } else {
      onSelectItem(id);
    }
    // On mobile screens, automatically close drawer
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleChatSelect = (id: string) => {
    onSelectConversation(id);
    onSelectItem('chat');
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out shadow-lg lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header with Brand */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tight">
              N
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-1.5">
                Nexora <span className="text-blue-600">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                All-in-One Platform
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action: New Chat */}
        <div className="p-3 border-b border-slate-100">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Core & Tools
            </div>
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((item) => item.category !== 'system').map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Conversations */}
          {conversations.length > 0 && (
            <div>
              <div className="px-3 mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <span>Recent Chats</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {conversations.length}
                </span>
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                {conversations.slice(0, 10).map((conv) => {
                  const isSelected = activeConversationId === conv.id && activeItem === 'chat';
                  return (
                    <div
                      key={conv.id}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      onClick={() => handleChatSelect(conv.id)}
                    >
                      <span className="truncate pr-2">{conv.title || 'Untitled conversation'}</span>
                      <button
                        onClick={(e) => onDeleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* System & Settings */}
          <div>
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Account & Info
            </div>
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((item) => item.category === 'system').map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <span className="font-medium">Gemini 3.8 Flash</span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
