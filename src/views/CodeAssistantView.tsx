import React, { useState } from 'react';
import { Code, Play, Copy, Check, Download, RefreshCw, AlertCircle, Bug, Sparkles, BookOpen, ShieldCheck, TestTube } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'HTML / CSS',
  'React (TSX)',
  'SQL',
  'Java',
  'C++',
  'Go',
  'Rust',
];

const MODES = [
  { id: 'generate', label: 'Generate', icon: Sparkles, desc: 'Write new code from requirements' },
  { id: 'explain', label: 'Explain', icon: BookOpen, desc: 'Line-by-line pedagogical walkthrough' },
  { id: 'debug', label: 'Debug & Fix', icon: Bug, desc: 'Find syntax & runtime bugs with fixes' },
  { id: 'review', label: 'Optimize', icon: ShieldCheck, desc: 'Performance, security & best practices' },
  { id: 'test', label: 'Unit Tests', icon: TestTube, desc: 'Generate complete unit test suites' },
];

export const CodeAssistantView: React.FC = () => {
  const [language, setLanguage] = useState('TypeScript');
  const [mode, setMode] = useState<'generate' | 'explain' | 'debug' | 'review' | 'test'>('generate');
  const [prompt, setPrompt] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!prompt.trim() && !codeSnippet.trim()) return;

    setIsLoading(true);
    setError(null);

    let instruction = `You are Qubixa AI Senior Software Engineer. You write clean, type-safe, maintainable, modern, and production-ready code with concise explanations.`;
    
    let userPrompt = `Language: ${language}\nTask: ${mode.toUpperCase()}\n`;
    if (prompt) userPrompt += `Instructions/Requirements:\n${prompt}\n\n`;
    if (codeSnippet) userPrompt += `Provided Code:\n\`\`\`${language.toLowerCase()}\n${codeSnippet}\n\`\`\`\n`;

    if (mode === 'debug') {
      instruction += ` Identify bugs, security flaws, or edge-case failures. Provide the corrected code first, followed by a bulleted explanation of what was broken and how it was fixed.`;
    } else if (mode === 'explain') {
      instruction += ` Explain this code clearly for a developer, breaking down architectural choices, algorithms, and complexity (Big-O).`;
    } else if (mode === 'review') {
      instruction += ` Perform an in-depth code review assessing performance, readability, modern idiom usage, and edge case safety. Suggest concrete refactorings.`;
    } else if (mode === 'test') {
      instruction += ` Write comprehensive unit tests covering happy paths, edge cases, and failure modes using the standard testing framework for ${language}.`;
    }

    try {
      const output = await generateAiText(userPrompt, {
        systemInstruction: instruction,
        modelType: 'code',
        temperature: 0.2, // low temperature for accurate code
      });
      setResult(output);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Code generation failed. Please try again.');
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
          <Code className="w-4 h-4" />
          <span>Engineering & Developer Suite</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Code Assistant</h2>
        <p className="text-sm text-slate-500 mt-1">
          Generate production-grade code, debug frustrating errors, write unit tests, and optimize algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Engineering Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id as any)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isActive
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-xs">{m.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {mode === 'generate' ? 'Feature Requirements / Description' : 'Questions / Context'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={
                  mode === 'generate'
                    ? 'e.g. Implement an LRU cache with O(1) get and put methods, with full TypeScript types...'
                    : 'e.g. Why is this function triggering infinite re-renders?'
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Optional Source Code Input */}
            {mode !== 'generate' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Code Snippet
                </label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={5}
                  placeholder="// Paste your code here..."
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none bg-slate-50/50"
                />
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleRun}
              disabled={(!prompt.trim() && !codeSnippet.trim()) || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                (prompt.trim() || codeSnippet.trim()) && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Code Analysis...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute {mode.toUpperCase()}</span>
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
                Code Output & Analysis
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
                    Compiling logic and reviewing constraints...
                  </p>
                </div>
              ) : result ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={result} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <Code className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No code generated yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Select a mode, enter instructions or paste your code snippet, and click "Execute".
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
