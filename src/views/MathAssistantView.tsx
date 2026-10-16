import React, { useState } from 'react';
import { Calculator, Sparkles, Copy, Check, RefreshCw, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

const MATH_PRESETS = [
  'Solve for x: 3x² - 12x + 9 = 0 with full derivation',
  'Find the derivative of f(x) = ln(x² + 1) * e^(2x)',
  'Calculate the definite integral of sin²(x) dx from 0 to π',
  'Calculate the probability of drawing two aces consecutively without replacement from a standard 52-card deck',
];

export const MathAssistantView: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [mode, setMode] = useState<'step_by_step' | 'conceptual' | 'quick_answer'>('step_by_step');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSolve = async () => {
    if (!problem.trim()) return;

    setIsLoading(true);
    setError(null);

    const systemInstruction = `You are Nexora AI Senior Mathematics and STEM Specialist. 
Solve the problem with impeccable rigor.
Your answer MUST follow this exact structure:
1. **Given & Identified Variables**
2. **Step-by-Step Solution** (with formulas written in readable markdown notation)
3. **Final Result** (clearly boxed or bolded)
4. **Verification & Domain Constraints** (validate the solution by substitution, check domain restrictions, and explicitly state any assumptions or boundary uncertainties).`;

    const userPrompt = `Mode: ${mode.toUpperCase()}
Mathematical Problem:
${problem}`;

    try {
      const output = await generateAiText(userPrompt, {
        systemInstruction,
        modelType: 'math',
        temperature: 0.1,
      });
      setResult(output);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Math solver encountered an error. Please try again.');
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
          <Calculator className="w-4 h-4" />
          <span>Step-by-Step STEM & Analytical Engine</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Math Assistant</h2>
        <p className="text-sm text-slate-500 mt-1">
          Solve calculus, algebra, probability, and physics problems with step-by-step logic and explicit verification checks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Math Problem or Word Problem <span className="text-blue-600">*</span>
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={5}
                placeholder="Enter equation, matrix, calculus integral, or word problem..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800 resize-none"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sample Problems
              </label>
              <div className="space-y-1">
                {MATH_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProblem(p)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 text-xs text-slate-600 hover:bg-blue-50/20 transition-all truncate font-mono text-[11px]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Breakdown Style
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'step_by_step', label: 'Step-by-Step' },
                  { id: 'conceptual', label: 'Conceptual' },
                  { id: 'quick_answer', label: 'Concise' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as any)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      mode === m.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Solve Button */}
            <button
              onClick={handleSolve}
              disabled={!problem.trim() || isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                problem.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Derivation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Solve Step-by-Step</span>
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
                Mathematical Proof & Breakdown
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
                      <span>Copy Solution</span>
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
                    Applying mathematical theorems and validating solution constraints...
                  </p>
                </div>
              ) : result ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={result} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <Calculator className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No calculation performed yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Type an equation or select one of the sample problems to inspect complete step-by-step logic.
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
