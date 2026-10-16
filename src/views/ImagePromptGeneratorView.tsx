import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, RefreshCw, Wand2, AlertCircle } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { AdBanner } from '../components/AdBanner.tsx';

interface ImagePromptGeneratorProps {
  onUsePromptInGenerator: (prompt: string, aspectRatio: string) => void;
}

const STYLES = [
  'Photorealistic Cinematic',
  'Digital Concept Art',
  '3D Octane Render',
  'Anime / Studio Ghibli',
  'Vintage 35mm Film',
  'Dark Gothic Fantasy',
  'Minimalist Vector Art',
  'Cyberpunk Neon Noir',
];

const LIGHTINGS = [
  'Golden Hour Sunlight',
  'Dramatic Rim Lighting',
  'Studio Softbox Diffused',
  'Neon Glow & Reflections',
  'Moody Chiaroscuro Shadows',
  'Natural Overcast Soft Light',
];

const COMPOSITIONS = [
  'Cinematic Wide Angle',
  'Close-Up Portrait',
  'Eye-Level Medium Shot',
  'Dramatic Low-Angle',
  'Aerial Drone Perspective',
  'Macro Lens Depth of Field',
];

export const ImagePromptGeneratorView: React.FC<ImagePromptGeneratorProps> = ({
  onUsePromptInGenerator,
}) => {
  const [concept, setConcept] = useState('');
  const [style, setStyle] = useState('Photorealistic Cinematic');
  const [lighting, setLighting] = useState('Golden Hour Sunlight');
  const [composition, setComposition] = useState('Cinematic Wide Angle');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  const handleGeneratePrompt = async () => {
    if (!concept.trim()) return;

    setIsLoading(true);
    setError(null);

    const systemInstruction = `You are Nexora AI Image Prompt Specialist. You engineer world-class, extremely descriptive English prompts for generative image models (Midjourney, Stable Diffusion, Gemini Imagen). 
Return your answer in the following strict JSON format:
{
  "masterPrompt": "a single detailed paragraph containing the subject, environment, atmospheric details, artistic rendering style, color palette, lighting, textures, and camera specifications",
  "negativePrompt": "list of undesirable elements to avoid, comma separated (e.g. blurry, low quality, distorted anatomy)",
  "technicalTags": ["8k resolution", "photorealistic", "ray-tracing", "cinematic lighting"]
}
Only output the valid JSON without markdown wrapping.`;

    const prompt = `Idea: "${concept}"
Style: ${style}
Lighting: ${lighting}
Shot Composition: ${composition}
Aspect Ratio: ${aspectRatio}

Synthesize this idea into a master-grade English prompt with rich visual textures, depth, and precision.`;

    try {
      const output = await generateAiText(prompt, {
        systemInstruction,
        temperature: 0.6,
      });

      // Parse JSON from output
      const cleanJson = output.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      setGeneratedPrompt(parsed.masterPrompt || output);
      setNegativePrompt(parsed.negativePrompt || 'blurry, low quality, distorted proportions, watermark, noise');
      setTags(Array.isArray(parsed.technicalTags) ? parsed.technicalTags : ['8k', 'cinematic', 'photorealistic']);
    } catch (err: unknown) {
      console.warn('JSON parse fallback for prompt generator:', err);
      // Fallback if model answered in plain text
      try {
        const plainText = await generateAiText(
          `Convert this raw idea into a single comprehensive, photorealistic English image prompt:\n"${concept}" in ${style} style with ${lighting}.`,
          { temperature: 0.7 }
        );
        setGeneratedPrompt(plainText.trim());
        setNegativePrompt('lowres, blurry, bad anatomy, overexposed, artifacting, watermark');
        setTags([style, lighting, composition, aspectRatio]);
      } catch (innerErr: unknown) {
        if (innerErr instanceof ApiError) {
          setError(innerErr.message);
        } else {
          setError('Failed to craft image prompt.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'prompt' | 'negative') => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedNegative(true);
      setTimeout(() => setCopiedNegative(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <Wand2 className="w-4 h-4" />
          <span>Prompt Engineering Laboratory</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Image Prompt Generator</h2>
        <p className="text-sm text-slate-500 mt-1">
          Turn your rough ideas into ultra-detailed, cinema-quality English prompts designed for image generators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Concept or Vision <span className="text-blue-600">*</span>
              </label>
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={3}
                placeholder="e.g. A solitary astronaut standing on the glass dunes of an alien planet at twilight with two moons in the sky..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Visual Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Aesthetic Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Lighting & Camera */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lighting
                </label>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  {LIGHTINGS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Composition
                </label>
                <select
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  {COMPOSITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['1:1', '16:9', '9:16', '4:3'].map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      aspectRatio === ar
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePrompt}
              disabled={!concept.trim() || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                concept.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Detailed Prompt</span>
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
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex-1 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-semibold text-slate-800">
                Optimized English Prompt
              </span>
              {generatedPrompt && (
                <button
                  onClick={() => onUsePromptInGenerator(generatedPrompt, aspectRatio)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>Open in Image Generator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 py-12 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs font-medium text-slate-500">
                    Engineering optimal sensory cues and lighting descriptions...
                  </p>
                </div>
              ) : generatedPrompt ? (
                <div className="space-y-4">
                  {/* Master Prompt Card */}
                  <div className="relative p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        Master Prompt
                      </span>
                      <button
                        onClick={() => copyToClipboard(generatedPrompt, 'prompt')}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-mono select-all">
                      {generatedPrompt}
                    </p>
                  </div>

                  {/* Negative Prompt Card */}
                  {negativePrompt && (
                    <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                          Negative Prompt (Exclude)
                        </span>
                        <button
                          onClick={() => copyToClipboard(negativePrompt, 'negative')}
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                        >
                          {copiedNegative ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Negative</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-mono select-all">
                        {negativePrompt}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Suggested Modifier Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
                  <Wand2 className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No prompt generated yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Type a basic idea on the left and select your desired style to generate high-fidelity prompt blueprints.
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
