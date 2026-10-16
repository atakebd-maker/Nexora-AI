import React, { useState } from 'react';
import { Share2, Sparkles, Copy, Check, RefreshCw, AlertCircle, Hash, Clock, Smartphone } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', desc: 'Professional, spaced paragraphs, thought leadership' },
  { id: 'instagram', label: 'Instagram', icon: '📸', desc: 'Visual hooks, clean emojis, aesthetic line breaks' },
  { id: 'twitter', label: 'X (Twitter)', icon: '⚡', desc: 'Punchy, viral hooks, 280-character discipline' },
  { id: 'tiktok', label: 'TikTok / Reels', icon: '🎵', desc: 'Fast, casual, trend-friendly, conversational' },
  { id: 'facebook', label: 'Facebook', icon: '🌐', desc: 'Community-oriented, descriptive, high discussion' },
];

export const SocialMediaCaptionView: React.FC = () => {
  const [platform, setPlatform] = useState('linkedin');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('Thought Leadership & Insight');
  const [tone, setTone] = useState('Engaging & Relatable');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    const platformObj = PLATFORMS.find((p) => p.id === platform);

    const systemInstruction = `You are Nexora AI Viral Social Media Strategist. You write authentic, scroll-stopping copy tailored precisely to the selected social platform's algorithm and cultural norms.`;

    const prompt = `Platform: ${platformObj?.label} (${platformObj?.desc})
Post Subject: "${topic}"
Core Goal: ${goal}
Tone: ${tone}

Please produce:
1. **Option A: Punchy & High-Impact** (Concise, high-energy, scroll-stopping)
2. **Option B: Narrative & Story-Driven** (Personal anecdote or relatable observation)
3. **Option C: Conversation & Question-Driven** (Designed to maximize comment section debate)
4. **Targeted Hashtag Cluster** (Categorized into Broad, Niche, and High-Intent)
5. **Algorithm Strategy Tip** (Best time to post, initial comment advice, call-to-action placement)`;

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
        setError('Caption generation failed. Please try again.');
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
          <Share2 className="w-4 h-4" />
          <span>Social Growth & Audience Suite</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Social Media Caption Generator</h2>
        <p className="text-sm text-slate-500 mt-1">
          Craft high-engagement captions with platform-specific formatting, strategic hashtags, and algorithm tips.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Platform Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Platform
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`px-3 py-2 text-xs rounded-xl border text-left transition-all flex items-center justify-between ${
                      platform === p.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.icon}</span>
                      <span>{p.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                      {p.desc.split(',')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Post Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                What are you posting about? <span className="text-blue-600">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="e.g. Announcing our new milestone of 10,000 active users, lessons learned from 3 startup failures..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Goal and Tone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="Thought Leadership & Insight">Thought Leadership</option>
                  <option value="Drive Conversation & Comments">Drive Comments</option>
                  <option value="Product Launch / Promo">Product Launch</option>
                  <option value="Educational How-To">Educational How-To</option>
                  <option value="Behind the Scenes Story">Storytelling</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="Engaging & Relatable">Engaging & Relatable</option>
                  <option value="Authoritative & Direct">Authoritative</option>
                  <option value="Witty & Punchy">Witty & Punchy</option>
                  <option value="Vulnerable & Authentic">Authentic Story</option>
                  <option value="Urgent & Action-Oriented">Urgent / Sales</option>
                </select>
              </div>
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
                  <span>Drafting Viral Captions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Social Captions</span>
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
                Generated Captions & Hashtags
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
                    Applying algorithmic formatting and viral hook formulas...
                  </p>
                </div>
              ) : result ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={result} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <Share2 className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No captions generated yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Select a platform, enter your topic on the left, and generate multiple high-performing variations.
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
