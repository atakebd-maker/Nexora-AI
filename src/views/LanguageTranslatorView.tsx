import React, { useState } from 'react';
import { Languages, ArrowLeftRight, Copy, Check, RefreshCw, AlertCircle, Sparkles, Volume2 } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { AdBanner } from '../components/AdBanner.tsx';

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'bn', name: 'Bengali (বাংলা) 🇧🇩' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'tr', name: 'Turkish (Türkçe)' },
  { code: 'ur', name: 'Urdu (اردو)' },
];

export const LanguageTranslatorView: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('bn'); // Default target Bengali 🇧🇩 as requested!
  const [sourceText, setSourceText] = useState('');
  const [tone, setTone] = useState<'Standard' | 'Formal' | 'Casual' | 'Poetic'>('Standard');
  const [translatedText, setTranslatedText] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSwap = () => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang);
      setTargetLang('en');
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
    // Swap text if translation exists
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText('');
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    setError(null);

    const sourceName = LANGUAGES.find((l) => l.code === sourceLang)?.name || 'Auto Detect';
    const targetName = LANGUAGES.find((l) => l.code === targetLang)?.name || 'Bengali';

    const systemInstruction = `You are Nexora AI Master Polyglot and Translator. Provide accurate, culturally natural translations preserving nuance, tone, and idioms. 
Respond in strict JSON with no markdown wrapping:
{
  "translation": "translated text in target language",
  "pronunciation": "Romanized phonetic pronunciation guide (if target is non-Latin script like Bengali, Arabic, Hindi, Japanese)",
  "culturalNote": "brief note on cultural context or formality nuance"
}`;

    const prompt = `Source Language: ${sourceName}
Target Language: ${targetName}
Tone/Style: ${tone}
Text to Translate:
"${sourceText}"`;

    try {
      const output = await generateAiText(prompt, {
        systemInstruction,
        temperature: 0.2,
      });

      const cleanJson = output.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      setTranslatedText(parsed.translation || output);
      setPronunciation(parsed.pronunciation || '');
      setNotes(parsed.culturalNote || '');
    } catch (err: unknown) {
      console.warn('JSON parsing fallback for translation:', err);
      try {
        const plain = await generateAiText(
          `Translate the following text into ${targetName} in a ${tone} tone:\n"${sourceText}"\nProvide only the translated text.`,
          { temperature: 0.2 }
        );
        setTranslatedText(plain.trim());
        setPronunciation('');
        setNotes('');
      } catch (innerErr: unknown) {
        if (innerErr instanceof ApiError) {
          setError(innerErr.message);
        } else {
          setError('Translation failed. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <Languages className="w-4 h-4" />
          <span>Multilingual Natural Translation</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Language Translator</h2>
        <p className="text-sm text-slate-500 mt-1">
          Instant high-accuracy translation with cultural nuance, phonetic guides, and native support for Bengali (বাংলা 🇧🇩) and English.
        </p>
      </div>

      {/* Language Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Source Dropdown */}
        <div className="w-full sm:w-5/12">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            From
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-blue-600"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs self-center"
          title="Swap Languages"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Target Dropdown */}
        <div className="w-full sm:w-5/12">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            To
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-blue-600"
          >
            {LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tone Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium text-xs whitespace-nowrap">Register:</span>
        {(['Standard', 'Formal', 'Casual', 'Poetic'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
              tone === t
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Two Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3 text-xs text-slate-500 font-medium">
            <span>Input Text</span>
            <span>{sourceText.length} chars</span>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste text to translate..."
            rows={10}
            className="w-full flex-1 resize-none text-slate-800 text-sm leading-relaxed focus:outline-none placeholder-slate-400"
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setSourceText('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>

            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isLoading}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                sourceText.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Translation Output Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3 text-xs text-slate-500 font-medium">
            <span>Translated Translation</span>
            {translatedText && (
              <button
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
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
                  Translating with idiomatic fluency...
                </p>
              </div>
            ) : translatedText ? (
              <div className="space-y-4">
                <p className="text-slate-900 text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {translatedText}
                </p>

                {/* Pronunciation guide if present */}
                {pronunciation && (
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                    <span className="font-semibold text-blue-800 block mb-0.5">
                      Phonetic Guide:
                    </span>
                    <p className="font-mono text-slate-700 italic">{pronunciation}</p>
                  </div>
                )}

                {/* Cultural / context notes */}
                {notes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      Nuance & Context:
                    </span>
                    <p>{notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                <Languages className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-600">Translation will appear here</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Enter English or Bengali text and click "Translate" to receive fluent output.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <AdBanner placement="inline" />
    </div>
  );
};
