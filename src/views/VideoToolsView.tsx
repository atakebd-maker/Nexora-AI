import React, { useState } from 'react';
import { Video, Sparkles, Copy, Check, RefreshCw, AlertCircle, Film, Camera, Clapperboard, Info, ExternalLink } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

const CAMERA_MOTIONS = [
  'Slow Cinematic Push-In (Dolly Forward)',
  'Smooth Drone Aerial Flyover',
  'Dynamic 360 Orbit Around Subject',
  'Low-Angle Tracking Tracking Shot',
  'Static Locked-Off High-End Cinema Rig',
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Cinema Landscape' },
  { id: '9:16', label: '9:16 Vertical Shorts / Reels' },
];

export const VideoToolsView: React.FC = () => {
  const [videoConcept, setVideoConcept] = useState('');
  const [cameraMotion, setCameraMotion] = useState(CAMERA_MOTIONS[0]);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [sceneCount, setSceneCount] = useState(3);
  const [storyboardOutput, setStoryboardOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateStoryboard = async () => {
    if (!videoConcept.trim()) return;

    setIsLoading(true);
    setError(null);

    const systemInstruction = `You are Qubixa AI Executive Cinematographer and Video Prompt Director. You write high-precision video generation prompts compatible with state-of-the-art models like Google Veo 3.1, Runway Gen-3, and Sora.`;

    const prompt = `Video Concept: "${videoConcept}"
Camera Motion: ${cameraMotion}
Aspect Ratio: ${aspectRatio}
Requested Scene Count: ${sceneCount}

Please generate:
1. **Master Video Prompt** (A single comprehensive cinematic prompt for AI video generators like Veo)
2. **Shot-by-Shot Storyboard (${sceneCount} Scenes)**:
   - For each scene specify: [Duration], [Visual Subject], [Camera Movement], [Lighting/Atmosphere], [Motion Direction]
3. **Negative Video Prompt** (To prevent morphing, jitter, warped limbs, text overlays)
4. **Cinematography Notes** (Focal length, frame rate 24fps, color grade)`;

    try {
      const output = await generateAiText(prompt, {
        systemInstruction,
        temperature: 0.6,
      });
      setStoryboardOutput(output);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Video storyboard synthesis failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!storyboardOutput) return;
    navigator.clipboard.writeText(storyboardOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <Film className="w-4 h-4" />
          <span>Cinematography & Video Synthesis</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Video Tools</h2>
        <p className="text-sm text-slate-500 mt-1">
          Architect multi-scene video sequences, camera choreographies, and prompts for Google Veo 3.1 and leading video engines.
        </p>
      </div>

      {/* Model Provider Notice as required in Section 5 */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950">
            Provider Integration Status: Google Veo 3.1 & Video Engines
          </p>
          <p className="leading-relaxed text-blue-800/90">
            Direct video rendering requires a Google Cloud project with Google Veo (<code className="font-mono text-blue-900">veo-3.1-generate-preview</code>) enabled and paid quota allocation. This tool provides the real-time AI storyboard director, temporal movement script, and master prompt synthesis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Video Scene Concept <span className="text-blue-600">*</span>
              </label>
              <textarea
                value={videoConcept}
                onChange={(e) => setVideoConcept(e.target.value)}
                rows={3}
                placeholder="e.g. A high-speed electric hypercar drifting through a rain-slicked Tokyo boulevard with neon reflections and steam rising from manholes..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Camera Motion */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Camera Choreography
              </label>
              <select
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
              >
                {CAMERA_MOTIONS.map((cm) => (
                  <option key={cm} value={cm}>
                    {cm}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio & Scene Count */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  {ASPECT_RATIOS.map((ar) => (
                    <option key={ar.id} value={ar.id}>
                      {ar.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Storyboard Scenes
                </label>
                <select
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value={2}>2 Scenes</option>
                  <option value={3}>3 Scenes</option>
                  <option value={4}>4 Scenes</option>
                  <option value={5}>5 Scenes</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateStoryboard}
              disabled={!videoConcept.trim() || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                videoConcept.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Directing Storyboard...</span>
                </>
              ) : (
                <>
                  <Clapperboard className="w-4 h-4" />
                  <span>Generate Video Storyboard</span>
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
                Cinematographic Blueprint & Prompts
              </span>
              {storyboardOutput && (
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
                      <span>Copy Storyboard</span>
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
                    Choreographing camera lenses, motion vectors, and scene lighting...
                  </p>
                </div>
              ) : storyboardOutput ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={storyboardOutput} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <Film className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No video storyboard directed yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Input a scene description, camera motion, and scene count to generate complete Veo 3.1 compatible prompts.
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
