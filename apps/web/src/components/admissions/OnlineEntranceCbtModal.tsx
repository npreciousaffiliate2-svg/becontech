import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Award, AlertCircle } from 'lucide-react';
import { Modal, Button, Badge, useToast } from '@campusone/ui';
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

  const handleSubmitCbt = async () => {
    if (isSubmitting || finalScore !== null) return;
    setIsSubmitting(true);

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

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const activeQ = ENTRANCE_CBT_QUESTIONS[currentIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={finalScore !== null ? onClose : () => {}}
      title="Online Entrance CBT Screening"
      description={`${candidateName} (${applicationNumber}) — Single official screening attempt.`}
      size="lg"
    >
      {finalScore !== null ? (
        <div className="py-6 text-center space-y-4 font-sans">
          <div className="w-14 h-14 rounded-[4px] bg-emerald-50 border border-emerald-200 text-[#0F7640] flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">CBT Screening Submitted</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your score has been recorded and forwarded to the Admissions Office.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-200 rounded-[4px]">
            <span className="text-xs text-slate-500 font-semibold">Final Score:</span>
            <span className="text-2xl font-extrabold text-[#0F7640]">{finalScore}%</span>
            <Badge variant={finalScore >= cutoffScore ? 'success' : 'warning'} size="sm">
              {finalScore >= cutoffScore ? 'MEETS CUT-OFF' : `BELOW ${cutoffScore}% CUT-OFF`}
            </Badge>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              className="bg-[#0F7640] hover:bg-[#093322] text-xs rounded-[4px]"
              onClick={onClose}
            >
              Return to Admission Portal
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 text-xs font-sans">
          {/* Status & Timer Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm">{activeQ.subject}</Badge>
              <span className="font-semibold text-slate-700">
                Question {currentIdx + 1} of {ENTRANCE_CBT_QUESTIONS.length}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-600">{answeredCount} answered</span>
            </div>
            <div className={`flex items-center gap-1.5 font-bold ${secondsLeft < 120 ? 'text-red-600' : 'text-[#0F7640]'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              {currentIdx + 1}. {activeQ.question}
            </p>
            <div className="space-y-2">
              {activeQ.options.map((opt, idx) => {
                const selected = answers[activeQ.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [activeQ.id]: idx }))}
                    className={`w-full text-left p-3 rounded-[4px] border transition-colors flex items-center gap-3 ${
                      selected
                        ? 'bg-emerald-50 border-[#0F7640] text-emerald-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-[4px] border flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        selected
                          ? 'bg-[#0F7640] border-[#0F7640] text-white'
                          : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Navigator Pills */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {ENTRANCE_CBT_QUESTIONS.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-7 h-7 rounded-[4px] text-[11px] font-bold border transition-colors ${
                    isCurrent
                      ? 'bg-[#0F7640] text-white border-[#0F7640]'
                      : isAnswered
                      ? 'bg-emerald-50 text-[#0F7640] border-emerald-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {currentIdx < ENTRANCE_CBT_QUESTIONS.length - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  className="bg-[#0F7640] hover:bg-[#093322]"
                  onClick={() => setCurrentIdx((i) => Math.min(ENTRANCE_CBT_QUESTIONS.length - 1, i + 1))}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  className="bg-[#0F7640] hover:bg-[#093322]"
                  onClick={handleSubmitCbt}
                >
                  Submit Entrance CBT
                </Button>
              )}
            </div>
          </div>

          {answeredCount < ENTRANCE_CBT_QUESTIONS.length && currentIdx === ENTRANCE_CBT_QUESTIONS.length - 1 && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-[4px] text-[11px] text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                You have answered {answeredCount} of {ENTRANCE_CBT_QUESTIONS.length} questions. Review unanswered items before submitting.
              </span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
