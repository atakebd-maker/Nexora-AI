import React, { useState, useRef } from 'react';
import { FileText, Upload, Sparkles, Copy, Check, RefreshCw, AlertCircle, MessageSquare, Search, BookOpen } from 'lucide-react';
import { summarizeDocument, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

export const PdfAssistantView: React.FC = () => {
  const [docTitle, setDocTitle] = useState('');
  const [docText, setDocText] = useState('');
  const [question, setQuestion] = useState('');
  const [summaryMode, setSummaryMode] = useState<'bullet_points' | 'executive' | 'tldr' | 'qa'>('bullet_points');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocTitle(file.name);
    setError(null);

    // Read text from text/plain, markdown, json, or csv
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = () => {
        setDocText(reader.result as string);
      };
      reader.readAsText(file);
    } else {
      // For binary PDF/DOC files, read readable string slices
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        // Clean binary characters to preserve readable ASCII/Unicode text
        const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
        setDocText(cleaned.slice(0, 40000));
      };
      reader.readAsText(file);
    }
  };

  const handleProcess = async (format: 'bullet_points' | 'executive' | 'tldr' | 'qa' = summaryMode) => {
    if (!docText.trim()) return;

    setIsLoading(true);
    setError(null);
    setSummaryMode(format);

    try {
      const output = await summarizeDocument(
        docText,
        docTitle || 'Document',
        format,
        format === 'qa' ? question : undefined
      );
      setResult(output);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Document processing failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Document & PDF Intelligence</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">PDF Assistant</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload documents or paste lengthy reports to extract key takeaways, summarize findings, or ask targeted questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Upload or Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Document Source <span className="text-blue-600">*</span>
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.csv,.doc"
                className="hidden"
                onChange={handleFileUpload}
              />

              {docTitle && (
                <div className="mb-2 p-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-blue-800 truncate">{docTitle}</span>
                  <button
                    onClick={() => {
                      setDocTitle('');
                      setDocText('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-[11px]"
                  >
                    Clear
                  </button>
                </div>
              )}

              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                rows={6}
                placeholder="Or paste document text, research papers, legal agreements, or meeting notes here..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none font-mono"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>{docText ? `${docText.length} characters` : 'No text entered'}</span>
                <span>Max 50,000 chars per pass</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Document Actions
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleProcess('bullet_points')}
                  disabled={!docText.trim() || isLoading}
                  className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-slate-700 text-xs font-medium text-center transition-all disabled:opacity-50"
                >
                  Key Bullets
                </button>
                <button
                  type="button"
                  onClick={() => handleProcess('executive')}
                  disabled={!docText.trim() || isLoading}
                  className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-slate-700 text-xs font-medium text-center transition-all disabled:opacity-50"
                >
                  Executive
                </button>
                <button
                  type="button"
                  onClick={() => handleProcess('tldr')}
                  disabled={!docText.trim() || isLoading}
                  className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-slate-700 text-xs font-medium text-center transition-all disabled:opacity-50"
                >
                  TL;DR
                </button>
              </div>
            </div>

            {/* Targeted Document Q&A */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ask a Specific Question
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What is the cancellation policy in this contract?"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
                />
                <button
                  onClick={() => handleProcess('qa')}
                  disabled={!docText.trim() || !question.trim() || isLoading}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <AdBanner placement="inline" />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex-1 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-semibold text-slate-800">
                Document Synthesis
              </span>
              {result && (
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Synthesis</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs font-medium text-slate-500">
                    Ingesting document and extracting core insights...
                  </p>
                </div>
              ) : result ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={result} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No document processed yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Upload a file or paste document content on the left to extract bullet points, executive briefings, or answers.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
