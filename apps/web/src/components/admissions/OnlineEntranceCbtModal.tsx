import React, { useEffect, useRef, useState } from 'react';
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
import { supabase } from '../../lib/supabase.ts';
import { useSharedRecords } from '../../lib/sharedRecords.ts';
import {
  DEFAULT_ENTRANCE_EXAM_SUITES,
  EntranceCbtQuestion,
  EntranceExamSuite,
  resolveApplicantEntranceExam,
} from '../../lib/entranceCbt.ts';

interface ShuffledEntranceQuestion extends EntranceCbtQuestion {
  shuffledOptions: { text: string; isCorrect: boolean }[];
}

interface PersistedExamState {
  suiteId: string;
  startedAt: number;
  durationSeconds: number;
  answers: Record<string, number>;
  proctorWarnings: number;
  violations: { type: string; at: string }[];
  questions: ShuffledEntranceQuestion[];
  verifiedByUseOneId?: boolean;
}

export interface OnlineEntranceCbtModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationNumber: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateDepartment?: string;
  candidateProgrammeCode?: string;
  activeSession?: string;
  schoolLogoUrl?: string;
  cutoffScore: number;
  onCompleted: (score: number) => void;
}

const MAX_PROCTOR_STRIKES = 3;

export const OnlineEntranceCbtModal: React.FC<OnlineEntranceCbtModalProps> = ({
  isOpen,
  onClose,
  applicationNumber,
  candidateName,
  candidateEmail,
  candidatePhone,
  candidateDepartment,
  candidateProgrammeCode,
  activeSession,
  schoolLogoUrl,
  cutoffScore,
  onCompleted,
}) => {
  const { showToast } = useToast();
  const [suites] = useSharedRecords<EntranceExamSuite>(
    'admissions.cbt_suites',
    DEFAULT_ENTRANCE_EXAM_SUITES
  );

  const lockStorageKey = `campusone_cbt_lock_${applicationNumber}`;
  const [activeSuite, setActiveSuite] = useState<EntranceExamSuite>(DEFAULT_ENTRANCE_EXAM_SUITES[0]);
  const [examQuestions, setExamQuestions] = useState<ShuffledEntranceQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [lastViolationReason, setLastViolationReason] = useState<string | null>(null);
  const [violations, setViolations] = useState<{ type: string; at: string }[]>([]);
  const [autoSubmittedByProctor, setAutoSubmittedByProctor] = useState(false);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  const lastStrikeTsRef = useRef(0);
  const submittingRef = useRef(false);
  const submitFnRef = useRef<() => Promise<void>>(async () => {});

  // Resolve and snapshot (or resume tamper-proof locked state) when opened
  useEffect(() => {
    if (!isOpen) return;
    submittingRef.current = false;
    setFinalScore(null);
    setConfirmSubmit(false);
    setIsSubmitting(false);
    setAutoSubmittedByProctor(false);
    setLastViolationReason(null);
    setIdentityError(null);

    const resolved = resolveApplicantEntranceExam(
      suites.length > 0 ? suites : DEFAULT_ENTRANCE_EXAM_SUITES,
      activeSession,
      candidateDepartment,
      candidateProgrammeCode
    );
    setActiveSuite(resolved);

    // Try resuming existing locked exam attempt ONLY if it was already verified via UseOneID
    try {
      const savedRaw = localStorage.getItem(lockStorageKey);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw) as PersistedExamState;
        if (
          saved &&
          saved.verifiedByUseOneId === true &&
          saved.suiteId === resolved.id &&
          Array.isArray(saved.questions) &&
          saved.questions.length > 0
        ) {
          const elapsedSec = Math.floor((Date.now() - saved.startedAt) / 1000);
          const remaining = Math.max(0, saved.durationSeconds - elapsedSec);
          setExamQuestions(saved.questions);
          setAnswers(saved.answers || {});
          setProctorWarnings(saved.proctorWarnings || 0);
          setViolations(saved.violations || []);
          setSecondsLeft(remaining);
          setCurrentIdx(0);
          setIsIdentityVerified(true);
          return;
        }
      }
    } catch {
      // Fall through to fresh attempt requiring UseOneID check
    }

    const validPool = (resolved.questions || []).filter(
      (q) => Boolean(q && q.question && Array.isArray(q.options) && q.options.length > 0)
    );
    const orderedPool = resolved.randomizeQuestions
      ? [...validPool].sort(() => Math.random() - 0.5)
      : validPool;

    // Shuffle A-D options per candidate to prevent side-by-side collusion
    const shuffledQuestions: ShuffledEntranceQuestion[] = orderedPool.map((q) => {
      const tagged = q.options.map((text, idx) => ({
        text,
        isCorrect: idx === q.correctIndex,
      }));
      const shuffledOptions = resolved.randomizeQuestions
        ? [...tagged].sort(() => Math.random() - 0.5)
        : tagged;
      return { ...q, shuffledOptions };
    });

    const durationSeconds = Math.max(1, Number(resolved.durationMinutes) || 20) * 60;
    setExamQuestions(shuffledQuestions);
    setCurrentIdx(0);
    setAnswers({});
    setProctorWarnings(0);
    setViolations([]);
    setSecondsLeft(durationSeconds);
    setIsIdentityVerified(false);
  }, [isOpen]);

  const handleUseOneIdExamAuthorized = (payload: any) => {
    const returnedEmail = String(payload?.email || '').trim().toLowerCase();
    const expectedEmail = String(candidateEmail || '').trim().toLowerCase();
    if (returnedEmail && expectedEmail && returnedEmail !== expectedEmail) {
      setIdentityError(
        `Impersonation Alert: The authorized UseOneID account (${returnedEmail}) does not match the registered candidate email (${expectedEmail}). Please verify with your own UseOneID wallet.`
      );
      return;
    }

    setIdentityError(null);
    const durationSeconds = Math.max(1, Number(activeSuite.durationMinutes) || 20) * 60;
    const initialState: PersistedExamState = {
      suiteId: activeSuite.id,
      startedAt: Date.now(),
      durationSeconds,
      answers: {},
      proctorWarnings: 0,
      violations: [],
      questions: examQuestions,
      verifiedByUseOneId: true,
    };
    try {
      localStorage.setItem(lockStorageKey, JSON.stringify(initialState));
    } catch {}
    setSecondsLeft(durationSeconds);
    setIsIdentityVerified(true);
    showToast({
      type: 'success',
      title: 'Identity Verified via UseOneID',
      message: 'Biometric / 1-Click identity confirmed. Your proctored Entrance CBT has started.',
    });
  };

  // Persist answers & violations continuously to anti-refresh lock
  useEffect(() => {
    if (!isOpen || finalScore !== null || examQuestions.length === 0) return;
    try {
      const savedRaw = localStorage.getItem(lockStorageKey);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw) as PersistedExamState;
        saved.answers = answers;
        saved.proctorWarnings = proctorWarnings;
        saved.violations = violations;
        localStorage.setItem(lockStorageKey, JSON.stringify(saved));
      }
    } catch {}
  }, [isOpen, finalScore, answers, proctorWarnings, violations, examQuestions.length, lockStorageKey]);

  // Lock background page scroll, track native fullscreen, and enforce anti-cheat proctoring
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const recordStrike = (type: string, label: string) => {
      if (!isIdentityVerified || submittingRef.current || finalScore !== null) return;
      const now = Date.now();
      // Debounce rapid duplicate events (e.g. blur + visibilitychange firing together)
      if (now - lastStrikeTsRef.current < 1500) return;
      lastStrikeTsRef.current = now;

      setLastViolationReason(label);
      setViolations((prev) => [...prev, { type, at: new Date().toISOString() }]);
      setProctorWarnings((prev) => {
        const next = prev + 1;
        if (next >= MAX_PROCTOR_STRIKES && !submittingRef.current) {
          setAutoSubmittedByProctor(true);
          void submitFnRef.current();
        }
        return next;
      });
    };

    const onFsChange = () => {
      const nowFs = Boolean(document.fullscreenElement);
      setIsFullscreen(nowFs);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        recordStrike('TAB_SWITCH', 'Switched browser tab or minimized examination window');
      }
    };

    const onWindowBlur = () => {
      recordStrike('WINDOW_BLUR', 'Moved focus outside the proctored examination window');
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (finalScore === null) {
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
  }, [isOpen, finalScore, isIdentityVerified]);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    if (!isOpen || !isIdentityVerified || finalScore !== null) return;
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
  }, [isOpen, isIdentityVerified, finalScore]);

  useEffect(() => {
    if (isOpen && isIdentityVerified && secondsLeft === 0 && finalScore === null && !submittingRef.current) {
      void submitFnRef.current();
    }
  }, [secondsLeft, isOpen, isIdentityVerified, finalScore]);

  // Keyboard navigation + Anti-Cheat Shortcut Blocking (DevTools, Print, View Source, Copy/Paste)
  useEffect(() => {
    if (!isOpen || finalScore !== null || examQuestions.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyLower = e.key.toLowerCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Block DevTools, Print, Save, View Source, Copy, Paste, Select All, PrintScreen
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
        setCurrentIdx((i) => Math.min(examQuestions.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIdx((i) => Math.max(0, i - 1));
      } else if (!isCtrlOrMeta && !e.altKey) {
        const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
        const idx = keyMap[keyLower];
        if (idx !== undefined) {
          const q = examQuestions[currentIdx];
          if (q && idx < q.shuffledOptions.length) {
            setAnswers((prev) => ({ ...prev, [q.id]: idx }));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, finalScore, currentIdx, examQuestions]);

  const handleSubmitCbt = async () => {
    if (submittingRef.current || finalScore !== null) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setConfirmSubmit(false);

    let correct = 0;
    for (const q of examQuestions) {
      const selectedIdx = answers[q.id];
      if (selectedIdx !== undefined && q.shuffledOptions[selectedIdx]?.isCorrect) {
        correct += 1;
      }
    }
    const pct = examQuestions.length > 0 ? Math.round((correct / examQuestions.length) * 100) : 0;

    try {
      const { error } = await supabase.rpc('submit_online_cbt_score', {
        p_application_number: applicationNumber,
        p_email: candidateEmail,
        p_score: pct,
      });
      if (error) {
        if (error.message?.includes('ONLINE_CBT_DISABLED')) {
          submittingRef.current = false;
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
          try {
            localStorage.removeItem(lockStorageKey);
          } catch {}
          submittingRef.current = false;
          setIsSubmitting(false);
          showToast({
            type: 'warning',
            title: 'Already Submitted',
            message: 'Your entrance CBT score has already been recorded.',
          });
          onClose();
          return;
        }
        submittingRef.current = false;
        setIsSubmitting(false);
        showToast({
          type: 'danger',
          title: 'Submission Failed',
          message: error.message || 'Could not record your CBT score in the database. Please try submitting again.',
        });
        return;
      }
    } catch (err: any) {
      submittingRef.current = false;
      setIsSubmitting(false);
      showToast({
        type: 'danger',
        title: 'Network Error',
        message: err?.message || 'Unable to reach the examination server. Your answers are preserved — please retry.',
      });
      return;
    }

    try {
      localStorage.removeItem(lockStorageKey);
    } catch {}

    setFinalScore(pct);
    onCompleted(pct);
    setIsSubmitting(false);
    showToast({
      type: autoSubmittedByProctor ? 'warning' : 'success',
      title: autoSubmittedByProctor ? 'Exam Auto-Submitted (Proctoring)' : 'Entrance CBT Completed',
      message: `Your screening score (${pct}%) has been submitted to the Admissions Office.`,
    });
  };

  submitFnRef.current = handleSubmitCbt;

  if (!isOpen) return null;

  const effectiveCutoff = activeSuite.cutoffScore || cutoffScore || 50;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const activeQ = examQuestions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = examQuestions.length > 0 ? Math.round((answeredCount / examQuestions.length) * 100) : 0;

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
      {/* ─── TOP INSTITUTIONAL EXAM BAR ─── */}
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
            <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
              {activeSuite.examTitle || 'Online Entrance CBT Screening'}
            </h1>
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

          {(finalScore !== null || !isIdentityVerified) && (
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

      {/* ─── PROCTORING VIOLATION STRIP ─── */}
      {isIdentityVerified && finalScore === null && proctorWarnings > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-red-900 shrink-0 z-10">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              Proctoring Alert (Strike {proctorWarnings} of {MAX_PROCTOR_STRIKES}):{' '}
              {lastViolationReason || 'Leaving the examination window is strictly prohibited.'}
            </span>
          </div>
          <Badge variant="danger" size="sm">
            Auto-Submit at {MAX_PROCTOR_STRIKES}/{MAX_PROCTOR_STRIKES}
          </Badge>
        </div>
      )}

      {/* ─── MAIN WORKSPACE ─── */}
      {!isIdentityVerified && finalScore === null ? (
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
              <div>
                <Badge variant="success" size="sm">Anti-Impersonation Gate</Badge>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Verify Identity with UseOneID to Begin Exam
                </h2>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Registered Candidate:</span>
                <span className="font-bold text-slate-900">{candidateName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Application Number:</span>
                <span className="font-bold text-[#0F7640]">{applicationNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Examination Suite:</span>
                <span className="font-semibold text-slate-800">{activeSuite.examTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Duration &amp; Questions:</span>
                <span className="font-semibold text-slate-800">
                  {activeSuite.durationMinutes} mins &bull; {examQuestions.length} Questions
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[4px] text-xs text-amber-950 space-y-1">
              <p className="font-bold">Mandatory Anti-Fraud Proctoring Rules:</p>
              <p className="text-amber-900 leading-relaxed">
                1. Your UseOneID identity must match your registered applicant email before the exam unlocks.<br />
                2. Switching browser tabs or leaving the window triggers a strike — <strong>3 strikes auto-submits</strong> your exam.<br />
                3. Copy, paste, print, DevTools, and page-refresh timer resets are disabled.
              </p>
            </div>

            {identityError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{identityError}</span>
              </div>
            )}

            <div className="pt-1 space-y-2.5">
              <UseOneIDButton
                lookupEmail={candidateEmail}
                lookupPhone={candidatePhone}
                reuseText="Verify & Unlock Exam with 1-Click UseOneID"
                firstTimeText="Verify Identity with UseOneID to Start Exam"
                theme="brand"
                onSuccess={handleUseOneIdExamAuthorized}
                onError={(err) => setIdentityError(err || 'UseOneID verification was cancelled or failed.')}
                className="w-full"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={onClose}
              >
                Cancel &amp; Return to Applicant Portal
              </Button>
            </div>
          </div>
        </main>
      ) : finalScore !== null ? (
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[4px] shadow-sm p-6 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-[4px] bg-emerald-50 border border-emerald-200 text-[#0F7640] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900">
                {autoSubmittedByProctor
                  ? 'Exam Auto-Submitted (Proctoring Limit)'
                  : 'Entrance CBT Screening Submitted'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {autoSubmittedByProctor
                  ? 'Your examination was automatically submitted after reaching the maximum proctoring violation threshold.'
                  : 'Your screening score has been securely recorded and forwarded to the Admissions Office.'}
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
              <Badge variant={finalScore >= effectiveCutoff ? 'success' : 'warning'} size="md">
                {finalScore >= effectiveCutoff ? 'MEETS CUT-OFF' : `BELOW ${effectiveCutoff}% CUT-OFF`}
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
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Subtle Anti-Leak Candidate Watermark */}
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

            {/* LEFT / CENTER: QUESTION CANVAS */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 relative z-10">
              <div className="max-w-3xl mx-auto space-y-5">
                {activeSuite.instructions && (
                  <div className="px-4 py-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-[4px] text-xs text-emerald-950">
                    <span className="font-bold text-[#0F7640]">Instructions: </span>
                    <span>{activeSuite.instructions}</span>
                  </div>
                )}

                {confirmSubmit && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 text-xs text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Submit Entrance CBT Examination?</p>
                        <p className="text-amber-800 mt-0.5">
                          You have answered {answeredCount} of {examQuestions.length} questions. Once submitted, this single official attempt cannot be reopened.
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
                {activeQ && (
                  <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm p-5 sm:p-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" size="sm">{activeQ.subject}</Badge>
                        <span className="text-xs font-bold text-slate-600">
                          Question {currentIdx + 1} of {examQuestions.length}
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
                      {activeQ.shuffledOptions.map((opt, idx) => {
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
                            <span className="text-sm leading-snug">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </main>

            {/* RIGHT SIDEBAR: QUESTION NAVIGATOR */}
            <aside className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 max-h-[34vh] lg:max-h-none relative z-10">
              <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider">Question Palette</span>
                  <span className="font-semibold text-[#0F7640]">
                    {answeredCount}/{examQuestions.length} Answered
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
                  {examQuestions.map((q, idx) => {
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
              Question {currentIdx + 1} of {examQuestions.length}
            </span>

            <div className="flex items-center gap-2">
              {currentIdx < examQuestions.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="bg-[#0F7640] hover:bg-[#093322]"
                  onClick={() => setCurrentIdx((i) => Math.min(examQuestions.length - 1, i + 1))}
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
