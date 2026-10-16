import React, { useState } from 'react';
import { PenTool, Copy, Check, Download, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

const CONTENT_TYPES = [
  { id: 'article', label: 'Full Article' },
  { id: 'blog', label: 'Blog Post' },
  { id: 'email', label: 'Professional Email' },
  { id: 'product', label: 'Product Description' },
  { id: 'essay', label: 'Academic Essay' },
  { id: 'press_release', label: 'Press Release' },
];

const TONES = [
  'Professional',
  'Persuasive',
  'Conversational',
  'Academic',
  'Inspirational',
  'Casual',
];

const LENGTHS = [
  { id: 'short', label: 'Concise (~150 words)' },
  { id: 'medium', label: 'Standard (~400 words)' },
  { id: 'long', label: 'Comprehensive (~800+ words)' },
];

export const WritingAssistantView: React.FC = () => {
  const [contentType, setContentType] = useState('article');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('medium');
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    const lengthDesc =
      length === 'short'
        ? 'around 150 words, punchy and direct'
        : length === 'long'
        ? 'around 800-1000 words, highly detailed with subheadings'
        : 'around 400-500 words, well structured';

    const prompt = `Write a high-quality ${contentType.replace('_', ' ')} on the following topic:
Topic/Title: ${topic}
Tone: ${tone}
Target Length: ${lengthDesc}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${keyPoints ? `Specific Key Points to Include:\n${keyPoints}` : ''}

Format using clean markdown with attractive headings, bullet points where suitable, and compelling paragraphs.`;

    try {
      const output = await generateAiText(prompt, {
        systemInstruction: `You are Qubixa AI Writing Assistant, a master copywriter and editorial writer known for engaging, error-free, and persuasive content.`,
        modelType: 'writing',
      });
      setResult(output);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Writing generation failed. Please try again.');
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

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qubixa-writing-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = result ? result.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Title & Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <PenTool className="w-4 h-4" />
          <span>Editorial & Copywriting Suite</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Writing Assistant</h2>
        <p className="text-sm text-slate-500 mt-1">
          Draft articles, blogs, executive emails, essays, and descriptions with tailored tone and structure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                      contentType === type.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topic or Title <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The Future of Renewable Energy Storage"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800"
              />
            </div>

            {/* Tone & Length Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  {LENGTHS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. C-level executives, tech founders, students"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
              />
            </div>

            {/* Key Points */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Key Points or Subtopics (Optional)
              </label>
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                rows={3}
                placeholder="Bullet points, statistics, specific keywords or constraints..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                topic.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Content</span>
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
            {/* Output Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-800">Generated Output</span>
                {result && (
                  <span className="text-[11px] text-slate-400">
                    {wordCount} words · ~{readingTime} min read
                  </span>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Copy text"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Download Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              )}
            </div>

            {/* Output Body */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs font-medium text-slate-500">
                    Crafting {contentType.replace('_', ' ')} with Qubixa AI...
                  </p>
                </div>
              ) : result ? (
                <div className="prose prose-slate max-w-none text-slate-800 text-sm">
                  <MarkdownRenderer content={result} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <PenTool className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No content generated yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Choose a format, provide a topic, and click "Generate Content" to draft your document.
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
