import React, { useState } from 'react';
import { GraduationCap, Sparkles, Copy, Check, RefreshCw, AlertCircle, HelpCircle, Layers, BookOpen, CheckCircle2, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { generateAiText, ApiError } from '../services/api.ts';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Flashcard {
  front: string;
  back: string;
}

export const StudyAssistantView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Undergraduate');
  const [mode, setMode] = useState<'notes' | 'quiz' | 'flashcards' | 'explain'>('notes');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results for notes & explain
  const [textResult, setTextResult] = useState('');

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  // Flashcard state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setTextResult('');
    setQuizQuestions([]);
    setUserAnswers({});
    setSubmittedQuiz(false);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);

    try {
      if (mode === 'quiz') {
        const systemInstruction = `You are Nexora AI Academic Examiner. Output exactly 4 multiple-choice questions on the topic in strict JSON format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this option is correct"
    }
  ]
}
Only output raw JSON without markdown code fences.`;

        const raw = await generateAiText(`Create an educational multiple-choice quiz for ${level} students on: "${topic}"`, {
          systemInstruction,
          temperature: 0.3,
        });

        const cleanJson = raw.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed.questions)) {
          setQuizQuestions(parsed.questions);
        } else {
          throw new Error('Invalid quiz response structure');
        }
      } else if (mode === 'flashcards') {
        const systemInstruction = `You are Nexora AI Study Coach. Create 6 high-yield flashcards in strict JSON format:
{
  "flashcards": [
    {
      "front": "Term or Key Concept / Question",
      "back": "Clear definition, formula, or concise explanation"
    }
  ]
}
Only output raw JSON without markdown code fences.`;

        const raw = await generateAiText(`Generate 6 high-yield revision flashcards for ${level} level on: "${topic}"`, {
          systemInstruction,
          temperature: 0.3,
        });

        const cleanJson = raw.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed.flashcards)) {
          setFlashcards(parsed.flashcards);
        } else {
          throw new Error('Invalid flashcard response structure');
        }
      } else {
        // 'notes' or 'explain'
        const prompt =
          mode === 'notes'
            ? `Create comprehensive revision and study notes for a ${level} student on "${topic}". Include:
1. Executive Summary & Big Picture
2. Core Definitions & Principles
3. In-Depth Breakdown with Examples
4. Common Exam Pitfalls & Misconceptions
5. Quick Review Checklist`
            : `Explain the concept "${topic}" for a ${level} audience. Use intuitive real-world analogies, step-by-step logic, and address the "why it matters" factor.`;

        const output = await generateAiText(prompt, {
          systemInstruction: 'You are Nexora AI Master Academic Tutor, celebrated for clarity, visual structure, and pedagogical brilliance.',
          temperature: 0.4,
        });
        setTextResult(output);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Study materials generation failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    if (submittedQuiz) return;
    setUserAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <GraduationCap className="w-4 h-4" />
          <span>Interactive Learning Suite</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Study Assistant</h2>
        <p className="text-sm text-slate-500 mt-1">
          Generate structured notes, interactive practice quizzes with grading, digital flashcards, and deep explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topic or Exam Subject <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis light reactions, TCP/IP handshake, Microeconomics elasticity"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
              />
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="High School">High School / AP Prep</option>
                <option value="Undergraduate">Undergraduate College</option>
                <option value="Graduate / Professional">Graduate / Professional</option>
                <option value="Beginner / Layperson">Beginner / Plain Language</option>
              </select>
            </div>

            {/* Study Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Study Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'notes', label: 'Study Notes', icon: BookOpen },
                  { id: 'quiz', label: 'Interactive Quiz', icon: HelpCircle },
                  { id: 'flashcards', label: 'Flashcard Deck', icon: Layers },
                  { id: 'explain', label: 'Concept Deep Dive', icon: Sparkles },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
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
                  <span>Preparing Study Material...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Study Material</span>
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
                {mode === 'quiz' ? 'Interactive Practice Quiz' : mode === 'flashcards' ? 'Digital Flashcard Deck' : 'Curated Study Guide'}
              </span>
              {textResult && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(textResult);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Notes</span>
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
                    Constructing syllabus modules and pedagogical aids...
                  </p>
                </div>
              ) : mode === 'quiz' && quizQuestions.length > 0 ? (
                // Interactive Quiz View
                <div className="space-y-6">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 flex items-start gap-2">
                        <span className="text-blue-600 font-bold">{qIdx + 1}.</span>
                        <span>{q.question}</span>
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;
                          let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                          if (submittedQuiz) {
                            if (isCorrect) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'border-rose-500 bg-rose-50 text-rose-800 line-through';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-blue-600 bg-blue-50 text-blue-700 font-medium';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {submittedQuiz && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                              {submittedQuiz && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {submittedQuiz && (
                        <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-900 mt-2">
                          <span className="font-semibold block mb-0.5">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    {!submittedQuiz ? (
                      <button
                        onClick={() => setSubmittedQuiz(true)}
                        disabled={Object.keys(userAnswers).length < quizQuestions.length}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        Submit & Grade Quiz
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="text-sm font-bold text-slate-900">
                          Score: {calculateScore()} / {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                        </div>
                        <button
                          onClick={() => {
                            setSubmittedQuiz(false);
                            setUserAnswers({});
                          }}
                          className="px-3 py-1.5 text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Retry Quiz
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : mode === 'flashcards' && flashcards.length > 0 ? (
                // Interactive Flip Flashcard View
                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full max-w-md h-64 cursor-pointer perspective rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-center select-none"
                  >
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                      </span>
                    </div>

                    <div className="my-auto">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {isFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
                      </h4>
                    </div>

                    <div className="text-xs text-slate-400">
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                        setIsFlipped(false);
                      }}
                      disabled={currentCardIndex === 0}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-700"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Flip Card
                    </button>

                    <button
                      onClick={() => {
                        setCurrentCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                        setIsFlipped(false);
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-700"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : textResult ? (
                <div className="text-slate-800 text-sm">
                  <MarkdownRenderer content={textResult} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <GraduationCap className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No study materials created yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Enter any exam topic or textbook chapter to generate practice quizzes, flashcards, or revision notes.
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
