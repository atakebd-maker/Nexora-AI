import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  X,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  FileCode,
  PenTool,
  Lightbulb,
  Compass,
} from 'lucide-react';
import { ChatMessage, Conversation } from '../types.ts';
import { sendChatMessage, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

interface ChatViewProps {
  conversation: Conversation | null;
  onUpdateConversation: (conv: Conversation) => void;
  onNewChat: () => void;
  onNavigateToSetup: () => void;
}

const STARTER_SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: 'Brainstorm Startup Ideas',
    prompt: 'Brainstorm 5 innovative SaaS product ideas combining artificial intelligence with everyday workflow efficiency.',
  },
  {
    icon: FileCode,
    title: 'Debug & Write Code',
    prompt: 'Write a clean TypeScript debounce hook and explain how to handle cleanup on unmount.',
  },
  {
    icon: PenTool,
    title: 'Draft a Strategic Email',
    prompt: 'Draft a compelling business partnership proposal email to a prospective enterprise client.',
  },
  {
    icon: Compass,
    title: 'Explain Complex Topics',
    prompt: 'Explain how modern large language models process multimodal inputs step-by-step for a beginner.',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  onUpdateConversation,
  onNewChat,
  onNavigateToSetup,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; setupInstruction?: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    previewUrl: string;
    mimeType: string;
    data: string;
  } | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = conversation?.messages || [];

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage({
        file,
        previewUrl: URL.createObjectURL(file),
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be re-selected if needed
    e.target.value = '';
  };

  const removeSelectedImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || input).trim();
    if ((!content && !selectedImage) || isLoading) return;

    setErrorInfo(null);

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now() + '_user',
      role: 'user',
      content,
      timestamp: Date.now(),
      image: selectedImage
        ? {
            mimeType: selectedImage.mimeType,
            data: selectedImage.data,
            previewUrl: selectedImage.previewUrl,
          }
        : undefined,
    };

    const newMessages = [...messages, userMessage];

    // Optimistically update conversation
    const updatedConv: Conversation = {
      id: conversation?.id || 'conv_' + Date.now(),
      title: conversation?.title && conversation.title !== 'New Conversation'
        ? conversation.title
        : content.slice(0, 36) || 'Image Discussion',
      createdAt: conversation?.createdAt || Date.now(),
      updatedAt: Date.now(),
      messages: newMessages,
    };

    onUpdateConversation(updatedConv);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(newMessages);

      const assistantMessage: ChatMessage = {
        id: 'msg_' + Date.now() + '_assistant',
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      const finalConv: Conversation = {
        ...updatedConv,
        updatedAt: Date.now(),
        messages: [...newMessages, assistantMessage],
      };

      onUpdateConversation(finalConv);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      let message = 'Failed to generate a response. Please try again.';
      let setupInstruction: string | undefined;

      if (err instanceof ApiError) {
        message = err.message;
        setupInstruction = err.setupInstruction;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setErrorInfo({ message, setupInstruction });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRegenerate = async (lastUserIndex: number) => {
    if (isLoading) return;
    const historyUntilUser = messages.slice(0, lastUserIndex + 1);
    setIsLoading(true);
    setErrorInfo(null);

    try {
      const reply = await sendChatMessage(historyUntilUser);
      const assistantMessage: ChatMessage = {
        id: 'msg_' + Date.now() + '_assistant',
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      const finalConv: Conversation = {
        ...conversation!,
        updatedAt: Date.now(),
        messages: [...historyUntilUser, assistantMessage],
      };
      onUpdateConversation(finalConv);
    } catch (err: unknown) {
      let message = 'Regeneration failed.';
      let setupInstruction: string | undefined;
      if (err instanceof ApiError) {
        message = err.message;
        setupInstruction = err.setupInstruction;
      }
      setErrorInfo({ message, setupInstruction });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-3 sm:px-6">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pt-4 pb-6 space-y-6">
        {messages.length === 0 ? (
          // Welcome Screen when empty
          <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              What can I help you with?
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md">
              Nexora AI is ready to chat, write code, analyze images, draft documents, or solve complex problems.
            </p>

            {/* Quick Starter Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8 text-left">
              {STARTER_SUGGESTIONS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3.5 rounded-xl border border-slate-200/90 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all text-left shadow-xs hover:shadow-sm group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-800">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="w-full max-w-2xl mt-6">
              <AdBanner placement="inline" />
            </div>
          </div>
        ) : (
          // Message Thread
          <div className="space-y-6 pt-2">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Attached Image if any */}
                    {msg.image && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-slate-200 shadow-xs max-w-xs">
                        <img
                          src={msg.image.previewUrl || `data:${msg.image.mimeType};base64,${msg.image.data}`}
                          alt="Attachment"
                          className="w-full h-auto object-cover max-h-60"
                        />
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs w-full'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>

                    {/* Action Controls for Assistant Messages */}
                    {!isUser && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="p-1 hover:text-slate-700 rounded transition-colors flex items-center gap-1"
                          title="Copy response"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-[11px] text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>

                        {/* Regenerate if this is the last message */}
                        {index === messages.length - 1 && !isLoading && (
                          <button
                            onClick={() => handleRegenerate(index - 1)}
                            className="p-1 hover:text-slate-700 rounded transition-colors flex items-center gap-1 ml-2"
                            title="Regenerate response"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Regenerate</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 sm:gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200/90 px-4 py-3 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-2 text-xs text-slate-400 font-medium">Nexora is thinking...</span>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorInfo && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Unable to complete request</span>
                </div>
                <p className="leading-relaxed">{errorInfo.message}</p>
                {errorInfo.setupInstruction && (
                  <div className="mt-2 pt-2 border-t border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-rose-900 bg-rose-100/60 px-2 py-1 rounded">
                      {errorInfo.setupInstruction}
                    </span>
                    <button
                      onClick={onNavigateToSetup}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs transition-colors"
                    >
                      View Instructions
                    </button>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box Area (Pinned at bottom) */}
      <div className="pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent">
        <div className="relative rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          {/* Selected Image Thumbnail Preview */}
          {selectedImage && (
            <div className="p-2 border-b border-slate-100 flex items-center gap-2">
              <div className="relative rounded-lg overflow-hidden border border-slate-200 w-12 h-12 flex-shrink-0">
                <img
                  src={selectedImage.previewUrl}
                  alt="Attachment preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={removeSelectedImage}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs text-slate-500 truncate max-w-xs font-medium">
                {selectedImage.file.name}
              </span>
            </div>
          )}

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything, write code, or attach an image..."
            rows={1}
            disabled={isLoading}
            className="w-full resize-none px-4 pt-3.5 pb-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent max-h-44 disabled:opacity-60"
          />

          {/* Control Bar: Attachment & Send Button */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Attach image (PNG, JPEG, WEBP)"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 hidden sm:inline ml-1">
                Enter to send, Shift+Enter for new line
              </span>
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                input.trim() || selectedImage
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="Send Message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-[11px] text-slate-400">
            Nexora AI runs on server-side Gemini 3.8 Flash · Responses should be verified
          </p>
        </div>
      </div>
    </div>
  );
};
