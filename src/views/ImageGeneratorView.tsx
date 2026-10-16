import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, RefreshCw, AlertCircle, Maximize2, X, SlidersHorizontal } from 'lucide-react';
import { generateAiImage, ApiError } from '../services/api.ts';
import { AdBanner } from '../components/AdBanner.tsx';

interface ImageGeneratorViewProps {
  initialPrompt?: string;
  initialAspectRatio?: string;
}

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square' },
  { id: '16:9', label: '16:9 Landscape' },
  { id: '9:16', label: '9:16 Portrait' },
  { id: '4:3', label: '4:3 Standard' },
  { id: '3:4', label: '3:4 Vertical' },
];

const STYLES = [
  { id: 'cinematic', label: 'Cinematic Hyper-real', promptSuffix: ', cinematic lighting, 8k resolution, shot on 35mm lens, photorealistic, intricate textures' },
  { id: 'anime', label: 'Anime & Manga', promptSuffix: ', vibrant anime style, studio animation key visual, Makoto Shinkai aesthetic, high detail' },
  { id: '3d', label: '3D Pixar/Octane', promptSuffix: ', 3d character render, unreal engine 5, ray tracing, subsurface scattering, octane render' },
  { id: 'watercolor', label: 'Watercolor Painting', promptSuffix: ', delicate watercolor painting, soft pigment washes, textured paper, artistic brush strokes' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', promptSuffix: ', cyberpunk aesthetic, neon cyan and magenta rim light, dark reflections, futuristic' },
  { id: 'none', label: 'Raw Prompt', promptSuffix: '' },
];

export const ImageGeneratorView: React.FC<ImageGeneratorViewProps> = ({
  initialPrompt = '',
  initialAspectRatio = '1:1',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    const styleObj = STYLES.find((s) => s.id === selectedStyle);
    const finalPrompt = prompt.trim() + (styleObj?.promptSuffix || '');

    try {
      const data = await generateAiImage(finalPrompt, aspectRatio);
      setGeneratedImage(data.imageUrl);
      setImageDescription(data.description || null);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Image generation failed. Please check your Gemini image generation model access.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `nexora-image-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <ImageIcon className="w-4 h-4" />
          <span>Generative Visual Studio</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Image Generator</h2>
        <p className="text-sm text-slate-500 mt-1">
          Transform descriptive words into high-resolution imagery powered by Gemini's native visual engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Image Description Prompt <span className="text-blue-600">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="e.g. A futuristic glass greenhouse in the Swiss Alps during sunrise with floating holographic botanicals..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Artistic Style Preset
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                      selectedStyle === st.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      aspectRatio === ar.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                prompt.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Pixels...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Image</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Generation Notice</p>
                  <p>{error}</p>
                  <p className="text-[11px] text-rose-600/80">
                    Image generation utilizes Gemini's visual models (gemini-3.1-flash-lite-image).
                  </p>
                </div>
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
                Rendered Artwork
              </span>
              {generatedImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="View fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Enlarge</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    title="Download image"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center text-slate-400 py-16 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">Rendering your image</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Calculating diffusion noise, spatial coherence, and lighting passes...
                    </p>
                  </div>
                </div>
              ) : generatedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-[480px] shadow-sm bg-slate-900 group">
                    <img
                      src={generatedImage}
                      alt={prompt}
                      className="max-h-[460px] w-auto object-contain cursor-pointer"
                      onClick={() => setLightboxOpen(true)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                        Click to expand
                      </span>
                    </div>
                  </div>

                  {imageDescription && (
                    <p className="text-xs text-slate-500 italic text-center max-w-md">
                      "{imageDescription}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <ImageIcon className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No artwork rendered yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Enter a creative prompt, choose an aspect ratio, and click "Generate Image" to create brand new artwork.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && generatedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={generatedImage}
            alt={prompt}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
