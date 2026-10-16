import React from 'react';
import { HelpCircle, Sparkles, Key, Keyboard, Shield, Globe, Terminal, FileCode, CheckCircle2, ChevronRight } from 'lucide-react';
import { AdBanner } from '../components/AdBanner.tsx';

export const HelpAboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Documentation & Architecture</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Help & About Qubixa AI</h2>
        <p className="text-sm text-slate-500 mt-1">
          Everything you need to know about setting up, configuring, and deploying Qubixa AI.
        </p>
      </div>

      {/* Beginner 3-Step Setup Guide with 🇧🇩 Banner */}
      <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🇧🇩</span>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Beginner's 3-Step API Key Setup Guide
            </h3>
            <p className="text-xs text-slate-500">
              Follow these simple steps to connect your Gemini API key directly in source code.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900">Get Your Free Key</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Google AI Studio</a>, click <strong>Create API Key</strong>, and copy your key.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900">Open Configuration File</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              In your project files, open <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">server/config.ts</code> at line 11 (marked with 🇧🇩), or edit <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">.env</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900">Paste Your Key</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Replace <code className="text-blue-600 font-mono text-[10px]">"PASTE_YOUR_API_KEY_HERE"</code> with your actual key and save. All 16 AI tools immediately use this key!
            </p>
          </div>
        </div>

        {/* Code Visual */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
          <span className="text-amber-400">// 🇧🇩 File: server/config.ts (Line 11)</span><br />
          <span className="text-blue-400">export const</span> <span className="text-emerald-300">MANUAL_GEMINI_API_KEY</span> = <span className="text-amber-200">"AIzaSy..."</span>;
        </div>
      </div>

      {/* Feature & Tools Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Unified AI Capabilities (16 Specialized Tools)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">1. AI Chat</span>
            <span className="text-slate-500">General purpose conversational assistant with image attachment support.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">2. AI Writing Assistant</span>
            <span className="text-slate-500">Drafts articles, executive emails, essays, and descriptions with tone control.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">3. AI Image Prompt Generator</span>
            <span className="text-slate-500">Transforms rough concepts into master-grade English prompts with 1-click generator transfer.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">4. AI Image Analyzer</span>
            <span className="text-slate-500">Multimodal vision recognition, document OCR, object catalog, and photo critique.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">5. AI Image Generator</span>
            <span className="text-slate-500">Generates high-res artwork in 5 aspect ratios with instant image download.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">6. AI Photo Editing Assistant</span>
            <span className="text-slate-500">Transforms photos using natural language edit instructions with before/after comparisons.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">7. AI Code Assistant</span>
            <span className="text-slate-500">Generate, explain, debug, optimize code, and synthesize complete unit test suites.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">8. PDF Assistant</span>
            <span className="text-slate-500">Upload documents or text to extract executive summaries and run custom Q&A.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">9. Document Summarizer</span>
            <span className="text-slate-500">Condenses text with word count metrics, reduction percentages, and action item lists.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">10. Language Translator</span>
            <span className="text-slate-500">Translates between Bengali (বাংলা 🇧🇩), English, and 15+ world languages with phonetics.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">11. AI Math Assistant</span>
            <span className="text-slate-500">Step-by-step calculus, algebra, and physics derivations with verification checks.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">12. Study Assistant</span>
            <span className="text-slate-500">Produces revision notes, interactive graded practice quizzes, and 3D flashcards.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">13. YouTube Script Generator</span>
            <span className="text-slate-500">Creates retention hooks, visual cues, complete spoken scripts, descriptions, and tags.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">14. Social Media Caption Generator</span>
            <span className="text-slate-500">Tailors copy for LinkedIn, Instagram, X, TikTok, and Facebook with hashtag clusters.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">15. AI Video Tools</span>
            <span className="text-slate-500">Director storyboard studio and camera motion choreography for Google Veo 3.1.</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="font-semibold text-slate-800 block">16. Chat History</span>
            <span className="text-slate-500">Full conversation archive with keyword search, JSON export, and conversation resume.</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-blue-600" />
          <span>Keyboard Shortcuts</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-600">Send chat message</span>
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[11px] shadow-2xs font-semibold">
              Enter
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-600">Insert new line in input</span>
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[11px] shadow-2xs font-semibold">
              Shift + Enter
            </kbd>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3 text-xs leading-relaxed text-slate-600 divide-y divide-slate-100">
          <div className="pt-2 space-y-1">
            <p className="font-bold text-slate-900">Is my Gemini API key secure?</p>
            <p>
              Yes. The API key is stored exclusively on your backend server (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">server/config.ts</code> or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code>). It is never sent to or bundled with the website frontend code.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <p className="font-bold text-slate-900">Does Qubixa AI support Bengali (বাংলা 🇧🇩)?</p>
            <p>
              Yes! The Language Translator and Conversational AI have deep multilingual comprehension for Bengali (বাংলা) as well as English, Hindi, Arabic, Spanish, French, and over 20 world languages with national flags.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <p className="font-bold text-slate-900">Is Qubixa AI 100% free?</p>
            <p>
              Yes! All 16 AI tools, multimodal vision analyzer, code assistant, and chat capabilities are completely free to use without subscriptions.
            </p>
          </div>
        </div>
      </div>

      <AdBanner placement="footer" />
    </div>
  );
};
