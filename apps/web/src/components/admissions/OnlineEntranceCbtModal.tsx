import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button, Badge, useToast } from '@campusone/ui';
import { supabase } from '../../lib/supabase.ts';

interface CbtQuestion {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const ENTRANCE_CBT_QUESTIONS: CbtQuestion[] = [
  {
    id: 1,
    subject: 'Biology',
    question: 'Which blood cells are primarily responsible for defending the body against infectious pathogens?',
    options: ['Erythrocytes', 'Leukocytes', 'Thrombocytes', 'Plasma cells only'],
    correctIndex: 1,
  },
  {
    id: 2,
    subject: 'Biology',
    question: 'The functional structural unit of the human kidney responsible for filtering blood is the:',
    options: ['Neuron', 'Alveolus', 'Nephron', 'Villus'],
    correctIndex: 2,
  },
  {
    id: 3,
    subject: 'Health Science',
    question: 'Which vector is responsible for transmitting the Plasmodium parasite that causes malaria?',
    options: ['Aedes aegypti mosquito', 'Female Anopheles mosquito', 'Tsetse fly', 'Housefly'],
    correctIndex: 1,
  },
  {
    id: 4,
    subject: 'Health Science',
    question: 'Oral Rehydration Solution (ORS) is primarily administered in community healthcare to treat:',
    options: ['Hypertension', 'Dehydration from acute diarrhoea', 'Fractures', 'Tuberculosis'],
    correctIndex: 1,
  },
  {
    id: 5,
    subject: 'Chemistry',
    question: 'What is the approximate normal pH range of human arterial blood?',
    options: ['5.0 – 5.5', '6.0 – 6.5', '7.35 – 7.45', '8.2 – 8.8'],
    correctIndex: 2,
  },
  {
    id: 6,
    subject: 'Chemistry',
    question: 'Which chemical element has the symbol "Na" and is essential for nerve impulse transmission?',
    options: ['Nitrogen', 'Sodium', 'Neon', 'Nickel'],
    correctIndex: 1,
  },
  {
    id: 7,
    subject: 'English Language',
    question: 'Choose the word most nearly opposite in meaning to "CONCISE" in a clinical report:',
    options: ['Brief', 'Verbose', 'Accurate', 'Clear'],
    correctIndex: 1,
  },
  {
    id: 8,
    subject: 'English Language',
    question: 'Identify the correctly punctuated institutional sentence:',
    options: [
      'The patients vitals were recorded, promptly.',
      "The patient's vitals were recorded promptly.",
      'The patients’ vital was recorded promptly.',
      'The patient vitals were record promptly.',
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    subject: 'Mathematics',
    question: 'A clinic prescribes 250 mg of a suspension twice daily for 5 days. What is the total dosage administered?',
    options: ['1,250 mg', '2,000 mg', '2,500 mg', '5,000 mg'],
    correctIndex: 2,
  },
  {
    id: 10,
    subject: 'Mathematics',
    question: 'If 18 out of 24 trainees passed a practical immunization assessment, what percentage passed?',
    options: ['65%', '70%', '75%', '80%'],
    correctIndex: 2,
  },
];

export interface OnlineEntranceCbtModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationNumber: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  cutoffScore: number;
  onCompleted: (score: number) => void;
}

export const OnlineEntranceCbtModal: React.FC<OnlineEntranceCbtModalProps> = ({
  isOpen,
  onClose,
  applicationNumber,
  candidateName,
  candidateEmail,
  cutoffScore,
  onCompleted,
}) => {
  const { showToast } = useToast();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Lock background page scroll & track native browser fullscreen state
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('fullscreenchange', onFsChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isOpen]);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    if (!isOpen || finalScore !== null) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, finalScore]);

  useEffect(() => {
    if (isOpen && secondsLeft === 0 && finalScore === null && !isSubmitting) {
      handleSubmitCbt();
    }
  }, [secondsLeft, isOpen, finalScore, isSubmitting]);

  // Keyboard navigation (ArrowLeft / ArrowRight / A-D / 1-4)
  useEffect(() => {
    if (!isOpen || finalScore !== null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIdx((i) => Math.min(ENTRANCE_CBT_QUESTIONS.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIdx((i) => Math.max(0, i - 1));
      } else {
        const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
        const idx = keyMap[e.key.toLowerCase()];
        if (idx !== undefined) {
          const q = ENTRANCE_CBT_QUESTIONS[currentIdx];
          if (q && idx < q.options.length) {
            setAnswers((prev) => ({ ...prev, [q.id]: idx }));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, finalScore, currentIdx]);

  const handleSubmitCbt = async () => {
    if (isSubmitting || finalScore !== null) return;
    setIsSubmitting(true);
    setConfirmSubmit(false);

    let correct = 0;
    for (const q of ENTRANCE_CBT_QUESTIONS) {
      if (answers[q.id] === q.correctIndex) {
        correct += 1;
      }
    }
    const pct = Math.round((correct / ENTRANCE_CBT_QUESTIONS.length) * 100);

    try {
      const { error } = await supabase.rpc('submit_online_cbt_score', {
        p_application_number: applicationNumber,
        p_email: candidateEmail,
        p_score: pct,
      });
      if (error) {
        if (error.message?.includes('ONLINE_CBT_DISABLED')) {
          setIsSubmitting(false);
          showToast({
            type: 'danger',
            title: 'Online CBT Disabled',
            message: 'The school has disabled online entrance CBT screening.',
          });
          onClose();
          return;
        }
        if (error.message?.includes('CBT_ALREADY_TAKEN')) {
          setIsSubmitting(false);
          showToast({
            type: 'warning',
            title: 'Already Submitted',
            message: 'Your entrance CBT score has already been recorded.',
          });
          onClose();
          return;
        }
      }
    } catch {
      // Continue syncing via unified AppContext
    }

    setFinalScore(pct);
    onCompleted(pct);
    setIsSubmitting(false);
    showToast({
      type: 'success',
      title: 'Entrance CBT Completed',
      message: `Your screening score (${pct}%) has been submitted to the Admissions Office.`,
    });
  };

  if (!isOpen) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const activeQ = ENTRANCE_CBT_QUESTIONS[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / ENTRANCE_CBT_QUESTIONS.length) * 100);

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden font-sans select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      role="region"
      aria-label="Full-Screen Online Entrance CBT Screening"
    >
      {/* ─── TOP INSTITUTIONAL EXAM BAR ─── */}
      <header className="bg-[#093322] text-white px-4 sm:px-6 lg:px-8 py-3 border-b border-emerald-950/60 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[4px] bg-[#0F7640] border border-emerald-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                Online Entrance CBT Screening
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-emerald-200 rounded-[4px]">
                Single Official Attempt
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 truncate">
              {candidateName} &bull; {applicationNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {finalScore === null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border text-xs sm:text-sm font-bold ${
                secondsLeft < 120
                  ? 'bg-red-950/80 border-red-400/50 text-red-200'
                  : 'bg-[#052015] border-emerald-700/60 text-amber-300'
              }`}
            >
              <Clock className={`w-4 h-4 shrink-0 ${secondsLeft < 120 ? 'animate-pulse text-red-300' : 'text-amber-400'}`} />
              <span>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleBrowserFullscreen}
            title={isFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
            aria-label={isFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
            className="px-2.5 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>

          {finalScore !== null && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Return to portal"
              className="px-2.5 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── MAIN WORKSPACE ─── */}
      {finalScore !== null ? (
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[4px] shadow-sm p-6 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-[4px] bg-emerald-50 border border-emerald-200 text-[#0F7640] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900">Entrance CBT Screening Submitted</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Your screening score has been securely recorded and forwarded to the Admissions Office.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Official Screening Score
                </span>
                <span className="text-3xl font-extrabold text-[#0F7640]">{finalScore}%</span>
              </div>
              <div className="hidden sm:block h-10 w-px bg-slate-200" />
              <Badge variant={finalScore >= cutoffScore ? 'success' : 'warning'} size="md">
                {finalScore >= cutoffScore ? 'MEETS CUT-OFF' : `BELOW ${cutoffScore}% CUT-OFF`}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Candidate: <strong>{candidateName}</strong> ({applicationNumber}). You can monitor your admission status and next steps directly on your Applicant Portal.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                className="bg-[#0F7640] hover:bg-[#093322] text-sm rounded-[4px] px-6"
                onClick={onClose}
              >
                Return to Applicant Portal
              </Button>
            </div>
          </div>
        </main>
      ) : (
        <>
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* LEFT / CENTER: QUESTION CANVAS */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
              <div className="max-w-3xl mx-auto space-y-6">
                {confirmSubmit && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 text-xs text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Submit Entrance CBT Examination?</p>
                        <p className="text-amber-800 mt-0.5">
                          You have answered {answeredCount} of {ENTRANCE_CBT_QUESTIONS.length} questions. Once submitted, this single official attempt cannot be reopened.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => setConfirmSubmit(false)}>
                        Review Questions
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isSubmitting}
                        className="bg-[#0F7640] hover:bg-[#093322]"
                        onClick={handleSubmitCbt}
                      >
                        Confirm &amp; Submit
                      </Button>
                    </div>
                  </div>
                )}

                {/* Question Card */}
                <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm p-5 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">{activeQ.subject}</Badge>
                      <span className="text-xs font-bold text-slate-600">
                        Question {currentIdx + 1} of {ENTRANCE_CBT_QUESTIONS.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Tip: Press A–D to answer, Left/Right arrows to navigate
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentIdx + 1}. {activeQ.question}
                  </p>

                  <div className="space-y-3 pt-1">
                    {activeQ.options.map((opt, idx) => {
                      const selected = answers[activeQ.id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [activeQ.id]: idx }))}
                          className={`w-full min-h-[52px] text-left px-4 py-3.5 rounded-[4px] border transition-colors flex items-center gap-3.5 ${
                            selected
                              ? 'bg-emerald-50 border-[#0F7640] text-emerald-950 font-semibold ring-1 ring-[#0F7640]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-[4px] border flex items-center justify-center text-xs font-bold shrink-0 ${
                              selected
                                ? 'bg-[#0F7640] border-[#0F7640] text-white'
                                : 'border-slate-300 text-slate-600 bg-slate-50'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-sm leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </main>

            {/* RIGHT SIDEBAR: QUESTION NAVIGATOR */}
            <aside className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 max-h-[34vh] lg:max-h-none">
              <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider">Question Palette</span>
                  <span className="font-semibold text-[#0F7640]">
                    {answeredCount}/{ENTRANCE_CBT_QUESTIONS.length} Answered
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-[4px] overflow-hidden">
                  <div
                    className="h-full bg-[#0F7640] transition-all duration-200"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-[4px] bg-[#0F7640] inline-block" /> Current
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-[4px] bg-emerald-100 border border-emerald-300 inline-block" /> Answered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-[4px] bg-white border border-slate-300 inline-block" /> Unanswered
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2">
                  {ENTRANCE_CBT_QUESTIONS.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentIdx;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-10 rounded-[4px] text-xs font-bold border transition-colors flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#0F7640] text-white border-[#0F7640] ring-2 ring-emerald-300'
                            : isAnswered
                            ? 'bg-emerald-50 text-[#0F7640] border-emerald-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:block p-5 border-t border-slate-200 bg-slate-50/70">
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  className="w-full bg-[#0F7640] hover:bg-[#093322]"
                  onClick={() => setConfirmSubmit(true)}
                >
                  Submit Entrance CBT
                </Button>
              </div>
            </aside>
          </div>

          {/* ─── STICKY BOTTOM CONTROLS ─── */}
          <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="secondary"
              disabled={currentIdx === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            >
              Previous
            </Button>

            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Question {currentIdx + 1} of {ENTRANCE_CBT_QUESTIONS.length}
            </span>

            <div className="flex items-center gap-2">
              {currentIdx < ENTRANCE_CBT_QUESTIONS.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="bg-[#0F7640] hover:bg-[#093322]"
                  onClick={() => setCurrentIdx((i) => Math.min(ENTRANCE_CBT_QUESTIONS.length - 1, i + 1))}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  className="bg-[#0F7640] hover:bg-[#093322]"
                  onClick={() => setConfirmSubmit(true)}
                >
                  Submit Entrance CBT
                </Button>
              )}
            </div>
          </footer>
        </>
      )}
    </div>
  );
};
