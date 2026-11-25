import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ShieldAlert,
  X,
} from 'lucide-react';
import { Button, Badge, useToast } from '@campusone/ui';
import { UseOneIDButton } from '../ui/index.ts';
import type { UseOneIDPayload } from '../../lib/useOneIdService.ts';
import { useOneIdMatchesRegisteredPerson } from '../../lib/identityMatch.ts';
import { supabase } from '../../lib/supabase.ts';

type SubmitReason = 'MANUAL' | 'TIME_UP' | 'PROCTOR_LIMIT';

interface ExamQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
}

interface Violation {
  type: string;
  at: string;
}

interface ExamResult {
  score: number;
  correct: number;
  total: number;
  cutoffScore: number;
  passed: boolean;
  reason: SubmitReason;
  strikes: number;
}

interface StartResponse {
  attemptId?: string;
  examTitle?: string;
  session?: string;
  instructions?: string;
  durationSeconds?: number;
  remainingSeconds?: number;
  cutoffScore?: number;
  answers?: Record<string, number>;
  violations?: Violation[];
  questions?: ExamQuestion[];
  expired?: boolean;
  result?: ExamResult;
}

export interface OnlineEntranceCbtModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationNumber: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  schoolLogoUrl?: string;
  cutoffScore: number;
  onCompleted: (score: number, details?: { reason: SubmitReason; strikes: number }) => void;
}

const MAX_PROCTOR_STRIKES = 3;

function rpcErrorCode(message?: string): string {
  const match = /^([A-Z_]{4,}):/.exec(String(message || '').trim());
  return match ? match[1] : '';
}

function rpcErrorText(message?: string): string {
  const text = String(message || '').trim();
  return text.replace(/^[A-Z_]{4,}:\s*/, '') || 'Something went wrong. Please try again.';
}

export const OnlineEntranceCbtModal: React.FC<OnlineEntranceCbtModalProps> = ({
  isOpen,
  onClose,
  applicationNumber,
  candidateName,
  candidateEmail,
  candidatePhone,
  schoolLogoUrl,
  cutoffScore,
  onCompleted,
}) => {
  const { showToast } = useToast();

  const [phase, setPhase] = useState<'gate' | 'starting' | 'exam' | 'result'>('gate');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState('Online Entrance CBT Screening');
  const [instructions, setInstructions] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [violations, setViolations] = useState<Violation[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [lastViolationReason, setLastViolationReason] = useState<string | null>(null);

  const deadlineRef = useRef(0);
  const answersRef = useRef<Record<string, number>>({});
  const violationsRef = useRef<Violation[]>([]);
  const attemptIdRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const lastStrikeTsRef = useRef(0);
  const timeUpFiredRef = useRef(false);
  const pendingReasonRef = useRef<SubmitReason>('MANUAL');
  const submitFnRef = useRef<(reason: SubmitReason) => Promise<void>>(async () => {});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);

  // Reset everything each time the exam screen is opened (server holds the real attempt)
  useEffect(() => {
    if (!isOpen) return;
    setPhase('gate');
    setAttemptId(null);
    attemptIdRef.current = null;
    setQuestions([]);
    setAnswers({});
    setViolations([]);
    answersRef.current = {};
    violationsRef.current = [];
    setCurrentIdx(0);
    setSecondsLeft(0);
    setConfirmSubmit(false);
    setIsSubmitting(false);
    setSubmitError(null);
    setResult(null);
    setIdentityError(null);
    setStartError(null);
    setLastViolationReason(null);
    submittingRef.current = false;
    timeUpFiredRef.current = false;
  }, [isOpen]);

  const saveProgress = useCallback(async () => {
    const id = attemptIdRef.current;
    if (!id || submittingRef.current) return;
    try {
      const { data, error } = await supabase.rpc('save_cbt_progress', {
        p_attempt_id: id,
        p_email: candidateEmail,
        p_answers: answersRef.current,
        p_violations: violationsRef.current,
      });
      if (error) {
        console.warn('[CampusOne] CBT progress not saved:', error.message);
        return;
      }
      const remaining = Number((data as { remainingSeconds?: number } | null)?.remainingSeconds);
      if (Number.isFinite(remaining)) {
        deadlineRef.current = Date.now() + remaining * 1000;
      }
    } catch (err) {
      console.warn('[CampusOne] CBT progress not saved:', err);
    }
  }, [candidateEmail]);

  // Auto-save answers shortly after each change
  useEffect(() => {
    if (phase !== 'exam') return;
    const timer = window.setTimeout(() => {
      void saveProgress();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [answers, phase, saveProgress]);

  const submitExam = useCallback(
    async (reason: SubmitReason) => {
      if (submittingRef.current || !attemptIdRef.current) return;
      submittingRef.current = true;
      pendingReasonRef.current = reason;
      setIsSubmitting(true);
      setConfirmSubmit(false);
      setSubmitError(null);

      try {
        const { data, error } = await supabase.rpc('submit_online_cbt_attempt', {
          p_attempt_id: attemptIdRef.current,
          p_email: candidateEmail,
          p_answers: answersRef.current,
          p_violations: violationsRef.current,
          p_reason: reason,
        });
        if (error) throw error;

        const finalResult = data as ExamResult;
        setResult(finalResult);
        setPhase('result');
        onCompleted(finalResult.score, { reason: finalResult.reason, strikes: finalResult.strikes });
        showToast({
          type: finalResult.reason === 'MANUAL' ? 'success' : 'warning',
          title: finalResult.reason === 'MANUAL' ? 'Exam Submitted' : 'Exam Submitted Automatically',
          message: 'Your answers have been saved and sent to the Admissions Office.',
        });
      } catch (err: unknown) {
        const message = (err as { message?: string } | null)?.message;
        const code = rpcErrorCode(message);
        submittingRef.current = false;
        if (code === 'CBT_ALREADY_TAKEN') {
          showToast({
            type: 'warning',
            title: 'Already Submitted',
            message: 'Your entrance CBT has already been recorded.',
          });
          onClose();
        } else {
          setSubmitError(rpcErrorText(message));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [candidateEmail, onCompleted, onClose, showToast]
  );

  submitFnRef.current = submitExam;

  const startExam = async () => {
    setPhase('starting');
    setStartError(null);
    try {
      const { data, error } = await supabase.rpc('start_online_cbt', {
        p_application_number: applicationNumber,
        p_email: candidateEmail,
      });
      if (error) throw error;

      const res = data as StartResponse;

      if (res.expired && res.result) {
        setResult(res.result);
        setPhase('result');
        onCompleted(res.result.score, { reason: res.result.reason, strikes: res.result.strikes });
        return;
      }

      if (!res.attemptId || !Array.isArray(res.questions) || res.questions.length === 0) {
        throw new Error('The exam could not be loaded. Please try again.');
      }

      attemptIdRef.current = res.attemptId;
      setAttemptId(res.attemptId);
      setExamTitle(res.examTitle || 'Online Entrance CBT Screening');
      setInstructions(res.instructions || '');
      setDurationMinutes(Math.round((res.durationSeconds || 0) / 60));
      setQuestions(res.questions);
      setAnswers(res.answers || {});
      setViolations(res.violations || []);
      answersRef.current = res.answers || {};
      violationsRef.current = res.violations || [];
      setCurrentIdx(0);
      deadlineRef.current = Date.now() + (res.remainingSeconds || 0) * 1000;
      setSecondsLeft(res.remainingSeconds || 0);
      timeUpFiredRef.current = false;
      setPhase('exam');
    } catch (err: unknown) {
      const message = (err as { message?: string } | null)?.message;
      const code = rpcErrorCode(message);
      if (code === 'CBT_ALREADY_TAKEN') {
        showToast({
          type: 'warning',
          title: 'Already Submitted',
          message: 'Your entrance CBT has already been recorded.',
        });
        onClose();
        return;
      }
      if (code === 'ONLINE_CBT_DISABLED') {
        showToast({
          type: 'danger',
          title: 'Online CBT Disabled',
          message: 'The school has turned off the online entrance exam.',
        });
        onClose();
        return;
      }
      setPhase('gate');
      setStartError(rpcErrorText(message));
    }
  };

  const handleUseOneIdExamAuthorized = (payload: UseOneIDPayload) => {
    const { matches, returnedEmail } = useOneIdMatchesRegisteredPerson(payload, candidateEmail, candidatePhone);
    if (!matches) {
      setIdentityError(
        returnedEmail
          ? `This UseOneID account (${returnedEmail}) does not match your application. Please sign in with the UseOneID account you used to apply.`
          : 'We could not confirm who you are from UseOneID. Please try again with the UseOneID account you used to apply.'
      );
      return;
    }
    setIdentityError(null);
    showToast({
      type: 'success',
      title: 'Identity Verified via UseOneID',
      message: 'Your exam is starting.',
    });
    void startExam();
  };

  // Countdown based on the server deadline (survives slow or throttled browser tabs)
  useEffect(() => {
    if (phase !== 'exam') return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0 && !timeUpFiredRef.current) {
        timeUpFiredRef.current = true;
        void submitFnRef.current('TIME_UP');
      }
    };
    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [phase]);

  // Page lock, fullscreen tracking, and "leaving the exam screen" warnings
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const recordStrike = (type: string, label: string) => {
      if (phase !== 'exam' || submittingRef.current) return;
      const now = Date.now();
      if (now - lastStrikeTsRef.current < 1500) return;
      lastStrikeTsRef.current = now;

      const next = [...violationsRef.current, { type, at: new Date().toISOString() }];
      violationsRef.current = next;
      setViolations(next);
      setLastViolationReason(label);
      void saveProgress();

      if (next.length >= MAX_PROCTOR_STRIKES) {
        void submitFnRef.current('PROCTOR_LIMIT');
      }
    };

    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    const onVisibilityChange = () => {
      if (document.hidden) {
        recordStrike('TAB_SWITCH', 'You switched to another tab or minimized the exam.');
      }
    };
    const onWindowBlur = () => {
      recordStrike('WINDOW_BLUR', 'You left the exam screen.');
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === 'exam') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isOpen, phase, saveProgress]);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Keyboard navigation and blocked shortcuts during the exam
  useEffect(() => {
    if (!isOpen || phase !== 'exam' || questions.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyLower = e.key.toLowerCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (isCtrlOrMeta && e.shiftKey && ['i', 'j', 'c'].includes(keyLower)) ||
        (isCtrlOrMeta && ['u', 'p', 's', 'c', 'v', 'x', 'a'].includes(keyLower))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (e.key === 'ArrowRight') {
        setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIdx((i) => Math.max(0, i - 1));
      } else if (!isCtrlOrMeta && !e.altKey) {
        const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
        const idx = keyMap[keyLower];
        if (idx !== undefined) {
          const q = questions[currentIdx];
          if (q && idx < q.options.length) {
            setAnswers((prev) => ({ ...prev, [q.id]: idx }));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, phase, currentIdx, questions]);

  if (!isOpen) return null;

  const effectiveCutoff = result?.cutoffScore ?? cutoffScore ?? 50;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const activeQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const strikeCount = violations.length;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden font-sans select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      role="region"
      aria-label="Full-Screen Online Entrance CBT Screening"
    >
      {/* ─── TOP EXAM BAR ─── */}
      <header className="bg-[#093322] text-white px-4 sm:px-6 lg:px-8 py-3 border-b border-emerald-950/60 flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[4px] bg-white p-1 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <img
              src={schoolLogoUrl || '/BeonTech-Logo.png'}
              alt="College Crest"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
              }}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">{examTitle}</h1>
            <p className="text-[11px] text-emerald-200/80 truncate">
              {candidateName} &bull; {applicationNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {phase === 'exam' && (
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

          {(phase === 'gate' || phase === 'result') && (
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

      {/* ─── WARNING STRIP ─── */}
      {phase === 'exam' && strikeCount > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-red-900 shrink-0 z-10">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              Warning {Math.min(strikeCount, MAX_PROCTOR_STRIKES)} of {MAX_PROCTOR_STRIKES}:{' '}
              {lastViolationReason || 'Please stay on the exam screen.'} Leaving {MAX_PROCTOR_STRIKES} times will submit your exam.
            </span>
          </div>
          <Badge variant="danger" size="sm">
            {MAX_PROCTOR_STRIKES} Warnings = Auto-Submit
          </Badge>
        </div>
      )}

      {/* ─── SUBMIT FAILED STRIP ─── */}
      {phase === 'exam' && submitError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 shrink-0 z-10">
          <span className="font-semibold">
            Your exam could not be submitted yet: {submitError} Your answers are safe.
          </span>
          <Button
            type="button"
            size="sm"
            variant="primary"
            className="bg-[#0F7640] hover:bg-[#093322]"
            onClick={() => void submitFnRef.current(pendingReasonRef.current)}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* ─── MAIN WORKSPACE ─── */}
      {phase === 'gate' || phase === 'starting' ? (
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-[4px] shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-[4px] bg-emerald-50 border border-emerald-200 flex items-center justify-center p-1.5 shrink-0">
                <img
                  src={schoolLogoUrl || '/BeonTech-Logo.png'}
                  alt="College Crest"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                Verify Identity with UseOneID to Begin Exam
              </h2>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0">Registered Candidate:</span>
                <span className="font-bold text-slate-900 text-right">{candidateName}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0">Application Number:</span>
                <span className="font-bold text-[#0F7640] text-right">{applicationNumber}</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] text-xs text-amber-950 space-y-1.5">
              <p className="font-bold">Important Exam Rules:</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-900 leading-relaxed">
                <li>Use the same UseOneID account linked to your application email to unlock your exam.</li>
                <li>Stay on this exam screen until you finish. Leaving or switching tabs 3 times will automatically submit your exam.</li>
                <li>Your timer keeps running even if you close or refresh the page. You can only take this exam once.</li>
                <li>Copying questions or printing is not allowed.</li>
              </ol>
            </div>

            {identityError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{identityError}</span>
              </div>
            )}

            {startError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{startError}</span>
              </div>
            )}

            <div className="pt-1 space-y-2.5">
              {phase === 'starting' ? (
                <div className="space-y-2.5" aria-live="polite" aria-busy="true">
                  <div className="h-[46px] w-full rounded-[4px] bg-slate-200 animate-pulse" />
                  <p className="text-center text-xs text-slate-500">Getting your exam ready...</p>
                </div>
              ) : (
                <UseOneIDButton
                  lookupEmail={candidateEmail}
                  lookupPhone={candidatePhone}
                  reuseText="Verify with 1-Click UseOneID"
                  firstTimeText="Verify Identity with UseOneID"
                  theme="brand"
                  onSuccess={handleUseOneIdExamAuthorized}
                  onError={(err) => setIdentityError(err || 'UseOneID verification was cancelled or failed.')}
                  className="w-full"
                />
              )}
              <Button
                type="button"
                variant="secondary"
                className="w-full h-[46px] text-xs font-semibold"
                disabled={phase === 'starting'}
                onClick={onClose}
              >
                Cancel &amp; Return to Applicant Portal
              </Button>
            </div>
          </div>
        </main>
      ) : phase === 'result' && result ? (
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[4px] shadow-sm p-6 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-[4px] bg-emerald-50 border border-emerald-200 text-[#0F7640] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900">
                {result.reason === 'PROCTOR_LIMIT'
                  ? 'Exam Submitted Automatically'
                  : result.reason === 'TIME_UP'
                  ? 'Time Is Up. Exam Submitted'
                  : 'Entrance CBT Submitted'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {result.reason === 'PROCTOR_LIMIT'
                  ? 'You left the exam screen 3 times, so your exam was submitted automatically.'
                  : result.reason === 'TIME_UP'
                  ? 'Your exam time finished, so your answers were submitted automatically.'
                  : 'Your answers have been submitted and sent to the Admissions Office.'}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Your Score
                </span>
                <span className="text-3xl font-extrabold text-[#0F7640]">{result.score}%</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {result.correct} of {result.total} correct
                </span>
              </div>
              <div className="hidden sm:block h-10 w-px bg-slate-200" />
              <Badge variant={result.score >= effectiveCutoff ? 'success' : 'warning'} size="md">
                {result.score >= effectiveCutoff ? 'MEETS CUT-OFF' : `BELOW ${effectiveCutoff}% CUT-OFF`}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Candidate: <strong>{candidateName}</strong> ({applicationNumber}). You can follow your admission status on your Applicant Portal.
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
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Subtle candidate watermark */}
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 overflow-hidden opacity-[0.03] grid grid-cols-3 gap-12 p-10 -rotate-12 z-0"
            >
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="text-xs font-extrabold uppercase tracking-widest text-slate-900 whitespace-nowrap">
                  {candidateName} &bull; {applicationNumber}
                </div>
              ))}
            </div>

            {/* QUESTION AREA */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 relative z-10">
              <div className="max-w-3xl mx-auto space-y-5">
                {instructions && (
                  <div className="px-4 py-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-[4px] text-xs text-emerald-950">
                    <span className="font-bold text-[#0F7640]">Instructions: </span>
                    <span>{instructions}</span>
                  </div>
                )}

                {confirmSubmit && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 text-xs text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Submit your exam?</p>
                        <p className="text-amber-800 mt-0.5">
                          You have answered {answeredCount} of {questions.length} questions. After you submit, you cannot take this exam again.
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
                        onClick={() => void submitExam('MANUAL')}
                      >
                        Confirm &amp; Submit
                      </Button>
                    </div>
                  </div>
                )}

                {activeQ && (
                  <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm p-5 sm:p-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" size="sm">{activeQ.subject}</Badge>
                        <span className="text-xs font-bold text-slate-600">
                          Question {currentIdx + 1} of {questions.length}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Tip: Press A–D to answer, Left/Right arrows to move
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
                )}
              </div>
            </main>

            {/* QUESTION LIST */}
            <aside className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 max-h-[34vh] lg:max-h-none relative z-10">
              <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider">Your Questions</span>
                  <span className="font-semibold text-[#0F7640]">
                    {answeredCount}/{questions.length} Answered
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-[4px] overflow-hidden">
                  <div className="h-full bg-[#0F7640] transition-all duration-200" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-[4px] bg-[#0F7640] inline-block" /> Current
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-[4px] bg-emerald-100 border border-emerald-300 inline-block" /> Answered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-[4px] bg-white border border-slate-300 inline-block" /> Not answered
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
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
            </aside>
          </div>

          {/* BOTTOM BUTTONS */}
          <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 shrink-0 z-10">
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
              Question {currentIdx + 1} of {questions.length}
            </span>

            <div className="flex items-center gap-2">
              {currentIdx < questions.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="bg-[#0F7640] hover:bg-[#093322]"
                  onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
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
