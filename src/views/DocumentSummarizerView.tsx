import React, { useState } from 'react';
import { FileSearch, Sparkles, Copy, Check, Download, RefreshCw, AlertCircle, TrendingDown, AlignLeft } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

const SUMMARY_FORMATS = [
  { id: 'bullet', label: 'Key Takeaways & Bullets', desc: 'Core facts organized by priority' },
  { id: 'paragraph', label: '1-Paragraph Executive Overview', desc: 'Concise high-level narrative summary' },
  { id: 'tldr', label: '3-Sentence TL;DR', desc: 'Ultra-condensed quick briefing' },
  { id: 'actions', label: 'Action Items & Decisions', desc: 'Deliverables, owners, and next steps' },
];

export const DocumentSummarizerView: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [format, setFormat] = useState('bullet');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);

    const formatDesc = SUMMARY_FORMATS.find((f) => f.id === format)?.label || 'Bullet Points';
    const prompt = `Summarize the following document into ${formatDesc}. Ensure you extract the most vital context, data, and conclusions without losing essential meaning:

Document Content:
${inputText}

Formatting Guidelines:
Use clean Markdown with bold keywords for quick reading.`;

    try {
      const output = await generateAiText(prompt, {
        systemInstruction: 'You are Qubixa AI Executive Summarizer. You distill massive articles, transcripts, and reports into clear, dense, actionable briefings.',
        temperature: 0.3,
      });
      setResult(output);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Summarization failed. Please try again.');
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

  const originalWords = inputText ? inputText.trim().split(/\s+/).length : 0;
  const summaryWords = result ? result.trim().split(/\s+/).length : 0;
  const reductionPercent =
    originalWords > 0 && summaryWords > 0
      ? Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100))
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <FileSearch className="w-4 h-4" />
          <span>Information Condenser</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Document Summarizer</h2>
        <p className="text-sm text-slate-500 mt-1">
          Condense lengthy articles, meeting transcripts, reports, and emails into structured, high-signal briefings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Paste Source Text <span className="text-blue-600">*</span>
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                placeholder="Paste the full article, transcript, research abstract, or report here..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none font-mono"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>{originalWords} words</span>
                <span>Supports multi-page text</span>
              </div>
            </div>

            {/* Format Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Summary Architecture
              </label>
              <div className="space-y-1.5">
                {SUMMARY_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      format === f.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{f.label}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summarize Button */}
            <button
              onClick={handleSummarize}
              disabled={!inputText.trim() || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Summarize Document</span>
                </>
              )}
            </button>

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
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-800">
                  Synthesized Briefing
                </span>
                {reductionPercent > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    {reductionPercent}% condensed
                  </span>
                )}
              </div>

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
                      <span>Copy Summary</span>
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
                    Extracting main ideas and condensing text...
                  </p>
                </div>
              ) : result ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={result} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <AlignLeft className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No summary generated yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Paste long-form text on the left, pick your preferred format, and click "Summarize Document".
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
