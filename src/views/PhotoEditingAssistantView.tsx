import React, { useState, useRef } from 'react';
import { Sliders, Upload, Sparkles, Download, RefreshCw, AlertCircle, ArrowRight, Wand2 } from 'lucide-react';
import { editAiImage, ApiError } from '../services/api.ts';
import { AdBanner } from '../components/AdBanner.tsx';

const EDIT_PRESETS = [
  { label: 'Add Golden Sunset Sky', prompt: 'Replace the background sky with a warm, dramatic golden hour sunset with rich orange and violet clouds.' },
  { label: 'Cinematic Studio Lighting', prompt: 'Add dramatic cinematic rim lighting, volumetric soft shadows, and high-end studio portrait lighting.' },
  { label: 'Convert to Watercolor Art', prompt: 'Transform this photograph into a loose, expressive watercolor painting with organic paper texture.' },
  { label: 'Cyberpunk Neon Glow', prompt: 'Add subtle cyberpunk neon accents, vibrant cyan and magenta glow reflections onto the subjects.' },
  { label: 'Vintage 1970s Film Grain', prompt: 'Apply warm 1970s analog film color grading, soft vignette, nostalgic Kodachrome tones, and subtle grain.' },
];

export const PhotoEditingAssistantView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<{
    previewUrl: string;
    mimeType: string;
    data: string;
    name: string;
  } | null>(null);

  const [editPrompt, setEditPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedFile({
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        mimeType: file.type,
        data: base64Data,
      });
      setEditedImage(null);
      setEditNotes(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!selectedFile || !editPrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await editAiImage(
        { mimeType: selectedFile.mimeType, data: selectedFile.data },
        editPrompt
      );
      if (data.imageUrl) {
        setEditedImage(data.imageUrl);
      }
      if (data.message) {
        setEditNotes(data.message);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Photo editing instruction failed. Please verify API model access.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!editedImage) return;
    const a = document.createElement('a');
    a.href = editedImage;
    a.download = `qubixa-edited-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" />
          <span>Multimodal Photo Transformation</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Photo Editing Assistant</h2>
        <p className="text-sm text-slate-500 mt-1">
          Modify existing photos using natural language instructions to adjust lighting, backgrounds, or artistic style.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Original Image <span className="text-blue-600">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all"
                >
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800">Choose a photo to edit</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WEBP</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={selectedFile.previewUrl}
                    alt="Original"
                    className="w-full h-44 object-contain mx-auto"
                  />
                  <div className="p-2 bg-white border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-600 truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quick Edit Presets
              </label>
              <div className="space-y-1.5">
                {EDIT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditPrompt(p.prompt)}
                    className="w-full text-left px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 text-xs text-slate-700 hover:bg-blue-50/30 transition-all truncate"
                  >
                    ⚡ {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Edit Prompt Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Edit Instructions <span className="text-blue-600">*</span>
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={3}
                placeholder="Describe what to add, remove, change, or enhance in this photo..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleEdit}
              disabled={!selectedFile || !editPrompt.trim() || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedFile && editPrompt.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Applying Visual Edits...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Edits</span>
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
                Edited Result
              </span>
              {editedImage && (
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Edited</span>
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center text-slate-400 py-16 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs font-medium text-slate-500">
                    Applying image transformations via Gemini image model...
                  </p>
                </div>
              ) : editedImage ? (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {selectedFile && (
                      <div className="space-y-1 text-center">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Before
                        </span>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 h-56 flex items-center justify-center">
                          <img
                            src={selectedFile.previewUrl}
                            alt="Before"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-1 text-center">
                      <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                        After
                      </span>
                      <div className="rounded-xl overflow-hidden border border-blue-200 bg-slate-900 h-56 flex items-center justify-center shadow-xs">
                        <img
                          src={editedImage}
                          alt="After"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {editNotes && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md text-center">
                      {editNotes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <Wand2 className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No edits applied yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Upload a base photo, type your desired modifications, and Qubixa will render the edited version.
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
