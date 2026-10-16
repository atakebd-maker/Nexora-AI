import React, { useState } from 'react';
import { Youtube, Sparkles, Copy, Check, Download, RefreshCw, AlertCircle, Video, ListOrdered, Tag } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

const DURATIONS = [
  { id: 'shorts', label: 'YouTube Shorts / Reels (< 60s)' },
  { id: 'standard', label: 'Standard Explainer (3–5 mins)' },
  { id: 'deep_dive', label: 'Full In-Depth Video (8–12 mins)' },
];

const TONES = [
  'High-Retention & Energetic',
  'Documentary & Cinematic',
  'Educational & Step-by-Step',
  'Conversational & Relatable',
  'Direct & No-Nonsense',
];

export const YouTubeScriptGeneratorView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('standard');
  const [tone, setTone] = useState('High-Retention & Energetic');
  const [targetAudience, setTargetAudience] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    const durDesc = DURATIONS.find((d) => d.id === duration)?.label;

    const systemInstruction = `You are Qubixa AI Viral YouTube Producer & Scriptwriter. You engineer scripts with extreme retention mechanics, pattern interrupts, sensory b-roll cues, high-CTR titles, and complete metadata.`;

    const prompt = `Generate a complete YouTube production package for the following video:
Topic/Premise: "${topic}"
Format: ${durDesc}
Pacing/Tone: ${tone}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Please organize the response with these exact sections:
1. **5 High-CTR Video Title Concepts** (Curiosity + search optimized)
2. **The 5-Second Retention Hook** (Immediate visual/verbal hook)
3. **Full Script with Visual & B-Roll Cues** [Format: [VISUAL CUE] / SPOKEN SCRIPT]
4. **Call to Action (CTA)** (Subtle & high conversion)
5. **SEO Video Description** (With timestamps and keywords)
6. **Optimized YouTube Tags** (Comma-separated for easy pasting)`;

    try {
      const output = await generateAiText(prompt, {
        systemInstruction,
        temperature: 0.7,
      });
      setResult(output);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('YouTube script generation failed. Please try again.');
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
          <Youtube className="w-4 h-4 text-red-600" />
          <span>Creator Production Suite</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">YouTube Script Generator</h2>
        <p className="text-sm text-slate-500 mt-1">
          Generate complete video packages: viral hooks, visual cues, full script, description, and high-CTR titles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Video Topic or Core Idea <span className="text-blue-600">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="e.g. Why Quantum Computing Will Break All Modern Encryption (And How to Prepare)..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Target Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Format & Duration
              </label>
              <div className="space-y-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDuration(d.id)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      duration === d.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pacing & Tone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pacing & Tone
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

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Audience Niche (Optional)
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Programmers, tech enthusiasts, beginners"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
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
                  <span>Drafting Production Package...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate YouTube Package</span>
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
              <span className="text-xs font-semibold text-slate-800">
                Complete Production Script
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
                      <span>Copy All</span>
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
                    Constructing hooks, audio-visual beats, and description metadata...
                  </p>
                </div>
              ) : result ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={result} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <Youtube className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No script generated yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Provide a video idea and format on the left to generate viral hooks, visual cues, and SEO tags.
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
