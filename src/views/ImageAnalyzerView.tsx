import React, { useState, useRef } from 'react';
import { Eye, Upload, Sparkles, Copy, Check, RefreshCw, AlertCircle, FileSearch, Palette, ScanText, Layers } from 'lucide-react';
import { analyzeImage, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

const MODES = [
  { id: 'general', label: 'Detailed Overview', icon: Eye, desc: 'Complete scene description and context' },
  { id: 'ocr', label: 'OCR & Text Extraction', icon: ScanText, desc: 'Extract all legible words, signs, and labels' },
  { id: 'critique', label: 'Composition Critique', icon: Palette, desc: 'Lighting, color harmony, and visual balance' },
  { id: 'objects', label: 'Object & Subject Catalog', icon: Layers, desc: 'Identify entities, materials, and positioning' },
];

export const ImageAnalyzerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    previewUrl: string;
    mimeType: string;
    data: string;
  } | null>(null);

  const [mode, setMode] = useState<'general' | 'ocr' | 'critique' | 'objects'>('general');
  const [customQuestion, setCustomQuestion] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      const sizeKb = (file.size / 1024).toFixed(1) + ' KB';

      setSelectedFile({
        name: file.name,
        size: sizeKb,
        previewUrl: URL.createObjectURL(file),
        mimeType: file.type,
        data: base64Data,
      });
      setAnalysis('');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    const promptText = customQuestion.trim()
      ? customQuestion.trim()
      : mode === 'ocr'
      ? 'Carefully extract and transcribe all visible text, letters, numerals, and signage in this image. Maintain the spatial layout where applicable.'
      : mode === 'critique'
      ? 'Perform a professional visual and artistic critique. Analyze the rule of thirds, lighting quality, focal point, color palette, and provide 3 concrete suggestions for improvement.'
      : mode === 'objects'
      ? 'List every distinct object, animal, person, structure, or background element in this image. Categorize them and describe their relative locations.'
      : 'Provide a comprehensive analysis of this image. Describe what is depicted, the setting, colors, mood, visual composition, and any notable subtleties.';

    try {
      const output = await analyzeImage(
        { mimeType: selectedFile.mimeType, data: selectedFile.data },
        promptText,
        mode
      );
      setAnalysis(output);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Image analysis failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <FileSearch className="w-4 h-4" />
          <span>Multimodal Vision Intelligence</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Image Analyzer</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload any photo, chart, or diagram to inspect fine details, extract text, and receive expert critique.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Options */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Upload Image <span className="text-blue-600">*</span>
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
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click to browse or drop image here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports PNG, JPG, WEBP up to 20MB
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={selectedFile.previewUrl}
                    alt="Upload preview"
                    className="w-full h-48 object-contain mx-auto"
                  />
                  <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between">
                    <div className="truncate text-xs font-medium text-slate-700 max-w-[200px]">
                      {selectedFile.name}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Mode Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Analysis Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold">{m.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Question */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Specific Question (Optional)
              </label>
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g. What model of camera is this? What does the sign say?"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
              />
            </div>

            {/* Run Analysis Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedFile && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inspecting Image with Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Image</span>
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

        {/* Right Column: Analysis Output */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex-1 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-semibold text-slate-800">
                Visual Intelligence Report
              </span>
              {analysis && (
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
                      <span>Copy Report</span>
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
                    Running multimodal recognition passes...
                  </p>
                </div>
              ) : analysis ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={analysis} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <Eye className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No image analyzed yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Upload a photo or diagram on the left to extract text, inspect objects, or diagnose image composition.
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
