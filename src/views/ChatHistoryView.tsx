import React, { useState } from 'react';
import { History, Search, Trash2, MessageSquare, ArrowRight, Download, Plus, HardDrive, AlertCircle } from 'lucide-react';
import { Conversation } from '../types.ts';
import { clearAllConversations } from '../services/storage.ts';
import { AdBanner } from '../components/AdBanner.tsx';

interface ChatHistoryViewProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
  onRefreshConversations: () => void;
}

export const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  onRefreshConversations,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(q);
    const msgMatch = c.messages.some((m) => m.content.toLowerCase().includes(q));
    return titleMatch || msgMatch;
  });

  const handleExportAllJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexora-chat-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all conversation history? This cannot be undone.')) {
      clearAllConversations();
      onRefreshConversations();
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Chat Archives</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Conversation History</h2>
          <p className="text-sm text-slate-500 mt-1">
            Reopen previous conversations, search past messages, or backup and export your history.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={onNewChat}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {conversations.length > 0 && (
            <button
              onClick={handleExportAllJson}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
              title="Export all chats as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Clarification as requested in Section 9 */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <HardDrive className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Storage Notice: </span>
          <span>
            Conversations are stored securely in your browser's private local storage. No conversation data is shared or stored on external database servers unless optional Firebase synchronization is configured.
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversation titles or message contents..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 bg-white"
        />
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-600">
              {searchQuery ? 'No matching conversations found' : 'No saved conversations yet'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Start chatting with Nexora AI and your conversations will be automatically archived here.
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const firstMsg = conv.messages[0]?.content || '';
            return (
              <div
                key={conv.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 group cursor-pointer"
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {conv.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                      ({conv.messages.length} {conv.messages.length === 1 ? 'msg' : 'msgs'})
                    </span>
                  </div>

                  {firstMsg && (
                    <p className="text-xs text-slate-500 truncate max-w-xl">
                      {firstMsg}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400">
                    Updated {formatDate(conv.updatedAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectConversation(conv.id);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Open Conversation"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id, e);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {conversations.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Entire Chat History</span>
          </button>
        </div>
      )}

      <AdBanner placement="inline" />
    </div>
  );
};
