import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Copy,
  Upload,
  Download,
  Edit2,
  Trash2,
  Search,
  Clock,
  CheckCircle2,
  Layers,
  FileText,
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select, useToast } from '@campusone/ui';
import { useApp } from '../../context/AppContext.tsx';
import { loadRecords, persistRecords, useSharedRecords } from '../../lib/sharedRecords.ts';
import {
  DEFAULT_ENTRANCE_EXAM_SUITES,
  ENTRANCE_CBT_SUBJECTS,
  EntranceCbtQuestion,
  EntranceExamSuite,
  normalizeSessionLabel,
  parseImportedEntranceQuestions,
} from '../../lib/entranceCbt.ts';

const SEEDED_FLAG_KEY = 'campusone_entrance_cbt_seeded_v1';

export const EntranceExamCbtTab: React.FC = () => {
  const { schoolProfile, updateSchoolProfile, departments, recordAudit } = useApp();
  const { showToast } = useToast();

  const [suites, setSuites] = useSharedRecords<EntranceExamSuite>(
    'admissions.cbt_suites',
    DEFAULT_ENTRANCE_EXAM_SUITES
  );

  // Auto-seed the 15-question Entrance Exam Suite once if none exists yet in DB/local (stays deleted if user deletes it)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await loadRecords<EntranceExamSuite>('admissions.cbt_suites');
      if (cancelled) return;
      if (existing && existing.length > 0) {
        try {
          localStorage.setItem(SEEDED_FLAG_KEY, '1');
        } catch {}
        return;
      }
      let alreadySeeded = false;
      try {
        alreadySeeded = localStorage.getItem(SEEDED_FLAG_KEY) === '1';
      } catch {}
      if (!alreadySeeded) {
        try {
          localStorage.setItem(SEEDED_FLAG_KEY, '1');
        } catch {}
        await persistRecords('admissions.cbt_suites', DEFAULT_ENTRANCE_EXAM_SUITES);
        if (!cancelled) {
          setSuites(DEFAULT_ENTRANCE_EXAM_SUITES);
          setSelectedSuiteId(DEFAULT_ENTRANCE_EXAM_SUITES[0].id);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSchoolSession = normalizeSessionLabel(schoolProfile?.activeSession || '2026/2027');

  const sessionOptions = useMemo(() => {
    const base = [
      activeSchoolSession,
      ...(schoolProfile?.academicSessions || []).map((s) => normalizeSessionLabel(s)),
      ...suites.map((s) => normalizeSessionLabel(s.session)),
      '2025/2026',
      '2026/2027',
      '2027/2028',
      '2028/2029',
    ];
    return Array.from(new Set(base.filter(Boolean))).sort().reverse();
  }, [activeSchoolSession, schoolProfile?.academicSessions, suites]);

  const departmentOptions = useMemo(() => {
    const list = [
      { value: 'ALL', label: 'All Departments (General Exam)' },
      ...departments.map((d) => ({
        value: d.code,
        label: `${d.code} — ${d.name}`,
      })),
    ];
    return list;
  }, [departments]);

  const [sessionFilter, setSessionFilter] = useState<string>('ALL_SESSIONS');
  const [deptFilter, setDeptFilter] = useState<string>('ALL_FILTER');
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>(suites[0]?.id || '');
  const [questionSearch, setQuestionSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  const filteredSuites = useMemo(() => {
    return suites.filter((s) => {
      if (sessionFilter !== 'ALL_SESSIONS' && normalizeSessionLabel(s.session) !== sessionFilter) {
        return false;
      }
      if (deptFilter !== 'ALL_FILTER' && s.departmentCode !== deptFilter) {
        return false;
      }
      return true;
    });
  }, [suites, sessionFilter, deptFilter]);

  const selectedSuite = useMemo(
    () => suites.find((s) => s.id === selectedSuiteId) || filteredSuites[0] || suites[0] || null,
    [suites, filteredSuites, selectedSuiteId]
  );

  useEffect(() => {
    if (selectedSuite && selectedSuite.id !== selectedSuiteId) {
      setSelectedSuiteId(selectedSuite.id);
    }
  }, [selectedSuite, selectedSuiteId]);

  // Editable form state synced to selected suite
  const [editTitle, setEditTitle] = useState('');
  const [editSession, setEditSession] = useState(activeSchoolSession);
  const [editDept, setEditDept] = useState('ALL');
  const [editDuration, setEditDuration] = useState('20');
  const [editCutoff, setEditCutoff] = useState(String(schoolProfile?.minimumCutoffScore || 50));
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [editInstructions, setEditInstructions] = useState('');

  useEffect(() => {
    if (!selectedSuite) return;
    setEditTitle(selectedSuite.examTitle);
    setEditSession(normalizeSessionLabel(selectedSuite.session));
    setEditDept(selectedSuite.departmentCode || 'ALL');
    setEditDuration(String(selectedSuite.durationMinutes || 20));
    setEditCutoff(String(selectedSuite.cutoffScore || schoolProfile?.minimumCutoffScore || 50));
    setEditStatus(selectedSuite.status || 'ACTIVE');
    setEditInstructions(selectedSuite.instructions || '');
  }, [selectedSuite?.id]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    session: activeSchoolSession,
    departmentCode: 'ALL',
    examTitle: '',
    durationMinutes: '20',
    cutoffScore: String(schoolProfile?.minimumCutoffScore || 50),
    instructions:
      'Answer all questions carefully within the allotted time. You have a single official screening attempt.',
  });

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateForm, setDuplicateForm] = useState({
    targetSession: '2027/2028',
    targetDepartmentCode: 'ALL',
    newTitle: '',
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'APPEND' | 'REPLACE'>('APPEND');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState({
    subject: 'Biology',
    question: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctIndex: '0',
  });

  const handleSaveSuiteSettings = async () => {
    if (!selectedSuite) return;
    const duration = Math.min(180, Math.max(5, parseInt(editDuration, 10) || 20));
    const cutoff = Math.min(100, Math.max(1, parseInt(editCutoff, 10) || 50));
    const updated: EntranceExamSuite = {
      ...selectedSuite,
      examTitle: editTitle.trim() || `${editSession} Entrance Screening CBT`,
      session: editSession,
      departmentCode: editDept,
      durationMinutes: duration,
      cutoffScore: cutoff,
      status: editStatus,
      instructions: editInstructions.trim(),
    };
    setSuites((prev) => prev.map((s) => (s.id === selectedSuite.id ? updated : s)));
    if (editDept === 'ALL' && editStatus === 'ACTIVE') {
      await updateSchoolProfile({ minimumCutoffScore: cutoff });
    }
    recordAudit('ENTRANCE_EXAM_SUITE_UPDATED', 'ADMISSIONS_CBT', updated.id, {
      session: updated.session,
      departmentCode: updated.departmentCode,
      cutoffScore: updated.cutoffScore,
      durationMinutes: updated.durationMinutes,
      status: updated.status,
    });
    showToast({
      type: 'success',
      title: 'Entrance Exam Saved',
      message: `${updated.examTitle} (${updated.session}) updated and synced live.`,
    });
  };

  const handleCreateSuite = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = Math.min(180, Math.max(5, parseInt(createForm.durationMinutes, 10) || 20));
    const cutoff = Math.min(100, Math.max(1, parseInt(createForm.cutoffScore, 10) || 50));
    const deptLabel = createForm.departmentCode === 'ALL' ? 'General' : createForm.departmentCode;
    const created: EntranceExamSuite = {
      id: `suite-${Date.now()}`,
      session: createForm.session,
      departmentCode: createForm.departmentCode,
      examTitle: createForm.examTitle.trim() || `${createForm.session} ${deptLabel} Entrance CBT`,
      durationMinutes: duration,
      cutoffScore: cutoff,
      instructions: createForm.instructions.trim(),
      randomizeQuestions: true,
      status: 'ACTIVE',
      questions: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuites((prev) => [created, ...prev]);
    setSelectedSuiteId(created.id);
    setSessionFilter('ALL_SESSIONS');
    setDeptFilter('ALL_FILTER');
    setIsCreateModalOpen(false);
    recordAudit('ENTRANCE_EXAM_SUITE_CREATED', 'ADMISSIONS_CBT', created.id, {
      session: created.session,
      departmentCode: created.departmentCode,
    });
    showToast({
      type: 'success',
      title: 'Entrance Exam Created',
      message: `${created.examTitle} created. Add or import questions to activate it.`,
    });
  };

  const handleOpenDuplicate = () => {
    if (!selectedSuite) return;
    const nextSession =
      sessionOptions.find((s) => s !== normalizeSessionLabel(selectedSuite.session)) || '2027/2028';
    setDuplicateForm({
      targetSession: nextSession,
      targetDepartmentCode: selectedSuite.departmentCode,
      newTitle: `${nextSession} ${
        selectedSuite.departmentCode === 'ALL' ? 'General Health Technology' : selectedSuite.departmentCode
      } Entrance CBT`,
    });
    setIsDuplicateModalOpen(true);
  };

  const handleConfirmDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuite) return;
    const clonedQuestions: EntranceCbtQuestion[] = selectedSuite.questions.map((q, idx) => ({
      ...q,
      id: `dup-q-${Date.now()}-${idx}`,
      options: [...q.options] as [string, string, string, string],
    }));
    const duplicated: EntranceExamSuite = {
      ...selectedSuite,
      id: `suite-${Date.now()}`,
      session: duplicateForm.targetSession,
      departmentCode: duplicateForm.targetDepartmentCode,
      examTitle:
        duplicateForm.newTitle.trim() ||
        `${duplicateForm.targetSession} ${duplicateForm.targetDepartmentCode} Entrance CBT`,
      status: 'DRAFT',
      questions: clonedQuestions,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuites((prev) => [duplicated, ...prev]);
    setSelectedSuiteId(duplicated.id);
    setSessionFilter('ALL_SESSIONS');
    setDeptFilter('ALL_FILTER');
    setIsDuplicateModalOpen(false);
    recordAudit('ENTRANCE_EXAM_SUITE_DUPLICATED', 'ADMISSIONS_CBT', duplicated.id, {
      sourceSuiteId: selectedSuite.id,
      targetSession: duplicated.session,
      questionCount: clonedQuestions.length,
    });
    showToast({
      type: 'success',
      title: 'Entrance Exam Duplicated',
      message: `Cloned ${clonedQuestions.length} question(s) into ${duplicated.session} as DRAFT. Set status to ACTIVE when ready.`,
    });
  };

  const handleDeleteSuite = (suite: EntranceExamSuite) => {
    const remaining = suites.filter((s) => s.id !== suite.id);
    setSuites(remaining);
    if (selectedSuiteId === suite.id) {
      setSelectedSuiteId(remaining[0]?.id || '');
    }
    recordAudit('ENTRANCE_EXAM_SUITE_DELETED', 'ADMISSIONS_CBT', suite.id, { title: suite.examTitle });
    showToast({
      type: 'info',
      title: 'Entrance Exam Deleted',
      message: `${suite.examTitle} has been removed.`,
    });
  };

  const handleDownloadCsvTemplate = () => {
    const template = [
      'Subject,Question,Option A,Option B,Option C,Option D,Correct (A-D)',
      'Biology,"Which organelle is known as the powerhouse of the cell?","Nucleus","Mitochondrion","Ribosome","Golgi body",B',
      'Health Science,"What is the normal resting body temperature of a healthy adult in Celsius?","35.0 C","37.0 C","39.5 C","40.0 C",B',
    ].join('\n');
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CampusOne_Entrance_CBT_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImportText(String(reader.result || ''));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuite) return;
    const parsed = parseImportedEntranceQuestions(importText);
    if (parsed.length === 0) {
      showToast({
        type: 'danger',
        title: 'No Valid Questions Found',
        message: 'Check your CSV/JSON format. Download the CSV template to see the exact column layout.',
      });
      return;
    }

    setSuites((prev) =>
      prev.map((s) => {
        if (s.id !== selectedSuite.id) return s;
        return {
          ...s,
          questions: importMode === 'REPLACE' ? parsed : [...s.questions, ...parsed],
        };
      })
    );
    setImportText('');
    setIsImportModalOpen(false);
    recordAudit('ENTRANCE_CBT_QUESTIONS_IMPORTED', 'ADMISSIONS_CBT', selectedSuite.id, {
      count: parsed.length,
      mode: importMode,
    });
    showToast({
      type: 'success',
      title: 'Questions Imported',
      message: `Imported ${parsed.length} question(s) into ${selectedSuite.examTitle}.`,
    });
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      subject: 'Biology',
      question: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctIndex: '0',
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: EntranceCbtQuestion) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      subject: q.subject || 'Biology',
      question: q.question || '',
      optA: q.options[0] || '',
      optB: q.options[1] || '',
      optC: q.options[2] || '',
      optD: q.options[3] || '',
      correctIndex: String(q.correctIndex ?? 0),
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuite) return;
    if (
      !questionForm.question.trim() ||
      !questionForm.optA.trim() ||
      !questionForm.optB.trim() ||
      !questionForm.optC.trim() ||
      !questionForm.optD.trim()
    ) {
      showToast({
        type: 'danger',
        title: 'Incomplete Question',
        message: 'Please fill in the question stem and all 4 options (A–D).',
      });
      return;
    }

    const payload: EntranceCbtQuestion = {
      id: editingQuestionId || `ent-q-${Date.now()}`,
      subject: questionForm.subject,
      question: questionForm.question.trim(),
      options: [
        questionForm.optA.trim(),
        questionForm.optB.trim(),
        questionForm.optC.trim(),
        questionForm.optD.trim(),
      ],
      correctIndex: Math.min(3, Math.max(0, parseInt(questionForm.correctIndex, 10) || 0)),
    };

    setSuites((prev) =>
      prev.map((s) => {
        if (s.id !== selectedSuite.id) return s;
        const nextQuestions = editingQuestionId
          ? s.questions.map((item) => (item.id === editingQuestionId ? payload : item))
          : [...s.questions, payload];
        return { ...s, questions: nextQuestions };
      })
    );

    recordAudit('ENTRANCE_CBT_QUESTION_SAVED', 'ADMISSIONS_CBT', payload.id, {
      suiteId: selectedSuite.id,
      subject: payload.subject,
    });
    showToast({
      type: 'success',
      title: editingQuestionId ? 'Question Updated' : 'Question Added',
      message: editingQuestionId
        ? 'Entrance CBT question updated.'
        : `Added question to ${selectedSuite.examTitle}.`,
    });
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedSuite) return;
    setSuites((prev) =>
      prev.map((s) =>
        s.id === selectedSuite.id ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) } : s
      )
    );
    recordAudit('ENTRANCE_CBT_QUESTION_DELETED', 'ADMISSIONS_CBT', questionId, { suiteId: selectedSuite.id });
    showToast({ type: 'info', title: 'Question Deleted', message: 'Removed question from this exam suite.' });
  };

  const handleClearSuiteQuestions = () => {
    if (!selectedSuite) return;
    setSuites((prev) => prev.map((s) => (s.id === selectedSuite.id ? { ...s, questions: [] } : s)));
    recordAudit('ENTRANCE_CBT_QUESTIONS_CLEARED', 'ADMISSIONS_CBT', selectedSuite.id);
    showToast({
      type: 'info',
      title: 'Question Bank Cleared',
      message: `All questions removed from ${selectedSuite.examTitle}. You can now add or import new ones.`,
    });
  };

  const visibleQuestions = useMemo(() => {
    if (!selectedSuite) return [];
    const qLower = questionSearch.trim().toLowerCase();
    return (selectedSuite.questions || []).filter((q) => {
      if (subjectFilter !== 'ALL' && q.subject !== subjectFilter) return false;
      if (qLower) {
        return (
          q.question.toLowerCase().includes(qLower) ||
          q.subject.toLowerCase().includes(qLower) ||
          q.options.some((o) => o.toLowerCase().includes(qLower))
        );
      }
      return true;
    });
  }, [selectedSuite, questionSearch, subjectFilter]);

  return (
    <div className="space-y-5">
      {/* ─── TOP CONTROL BAR ─── */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-[4px] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-emerald-950 text-sm">
            Entrance Exam CBT Manager (By Admission Session &amp; Department)
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Create one general exam for <strong>All Departments</strong> or dedicated department-specific exams per admission session. Applicants automatically receive the active exam matching their session and department.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant={schoolProfile?.onlineCbtEnabled !== false ? 'primary' : 'secondary'}
            className={schoolProfile?.onlineCbtEnabled !== false ? 'bg-[#0F7640] hover:bg-[#093322]' : ''}
            onClick={async () => {
              const next = !(schoolProfile?.onlineCbtEnabled !== false);
              await updateSchoolProfile({ onlineCbtEnabled: next });
              recordAudit('ONLINE_CBT_TOGGLED', 'ADMISSIONS_CBT', 'default', { enabled: next });
              showToast({
                type: 'success',
                title: next ? 'Online Entrance CBT Enabled' : 'Online Entrance CBT Disabled',
                message: next
                  ? 'Applicants can now take their full-screen Entrance CBT from the Applicant Portal.'
                  : 'Online Entrance CBT hidden from applicants. Officers can record physical CBT scores instead.',
              });
            }}
          >
            Online CBT: {schoolProfile?.onlineCbtEnabled !== false ? 'Enabled' : 'Disabled'}
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setCreateForm({
                session: activeSchoolSession,
                departmentCode: 'ALL',
                examTitle: '',
                durationMinutes: '20',
                cutoffScore: String(schoolProfile?.minimumCutoffScore || 50),
                instructions:
                  'Answer all questions carefully within the allotted time. You have a single official screening attempt.',
              });
              setIsCreateModalOpen(true);
            }}
          >
            Create New Exam
          </Button>
        </div>
      </div>

      {/* ─── SESSION & DEPARTMENT FILTER BAR ─── */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              value={sessionFilter}
              onChange={(val) => setSessionFilter(val)}
              options={[
                { value: 'ALL_SESSIONS', label: 'All Admission Sessions' },
                ...sessionOptions.map((s) => ({ value: s, label: `${s} Session` })),
              ]}
            />
          </div>
          <div className="w-60">
            <Select
              value={deptFilter}
              onChange={(val) => setDeptFilter(val)}
              options={[{ value: 'ALL_FILTER', label: 'All Department Scopes' }, ...departmentOptions]}
            />
          </div>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredSuites.length} of {suites.length} entrance exam suite(s)
        </span>
      </div>

      {/* ─── EXAM SUITES SELECTOR GRID ─── */}
      {filteredSuites.length === 0 ? (
        <Card className="bg-white border border-slate-200 rounded-[4px]">
          <div className="py-14 px-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-[4px] bg-emerald-50 border border-emerald-200 text-[#0F7640] flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <p className="text-sm font-bold text-slate-900">No Entrance Exam Suites for This Filter</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create a new Entrance Exam for this admission session, switch your session filter, or load the seeded 15-question Health Technology entrance exam.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <Button
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create New Exam
              </Button>
              {suites.length === 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await persistRecords('admissions.cbt_suites', DEFAULT_ENTRANCE_EXAM_SUITES);
                    setSuites(DEFAULT_ENTRANCE_EXAM_SUITES);
                    setSelectedSuiteId(DEFAULT_ENTRANCE_EXAM_SUITES[0].id);
                    showToast({
                      type: 'success',
                      title: 'Seeded Exam Loaded',
                      message: 'Loaded 2026/2027 General Entrance CBT with 15 questions.',
                    });
                  }}
                >
                  Load Seeded Exam (15 Questions)
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredSuites.map((suite) => {
            const isSelected = selectedSuite?.id === suite.id;
            return (
              <div
                key={suite.id}
                onClick={() => setSelectedSuiteId(suite.id)}
                className={`p-4 rounded-[4px] border cursor-pointer transition-colors space-y-2.5 ${
                  isSelected
                    ? 'bg-emerald-50/50 border-[#0F7640] ring-1 ring-[#0F7640]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="primary" size="sm">{suite.session}</Badge>
                    <Badge variant="neutral" size="sm">
                      {suite.departmentCode === 'ALL' ? 'All Departments' : suite.departmentCode}
                    </Badge>
                  </div>
                  <Badge
                    variant={suite.status === 'ACTIVE' ? 'success' : suite.status === 'DRAFT' ? 'warning' : 'neutral'}
                    size="sm"
                  >
                    {suite.status}
                  </Badge>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug">{suite.examTitle}</h4>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {suite.questions.length} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {suite.durationMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7640]" />
                    {suite.cutoffScore}% Cut-Off
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── SELECTED SUITE EDITOR & QUESTION BANK ─── */}
      {selectedSuite && (
        <Card
          header={
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
              <div>
                <span className="font-bold text-slate-900 block">
                  {selectedSuite.examTitle}
                </span>
                <span className="text-[11px] text-slate-500">
                  {selectedSuite.session} Session &bull;{' '}
                  {selectedSuite.departmentCode === 'ALL'
                    ? 'Applies to All Departments'
                    : `Dedicated to ${selectedSuite.departmentCode} Applicants`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                  onClick={handleOpenDuplicate}
                >
                  Duplicate to Session
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                  onClick={() => setIsImportModalOpen(true)}
                >
                  Import CSV / JSON
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => handleDeleteSuite(selectedSuite)}
                >
                  Delete Exam
                </Button>
              </div>
            </div>
          }
        >
          <div className="p-4 space-y-5">
            {/* Suite Settings Form */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  label="Exam Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <Select
                  label="Admission Session"
                  value={editSession}
                  onChange={(val) => setEditSession(val)}
                  options={sessionOptions.map((s) => ({ value: s, label: s }))}
                />
                <Select
                  label="Department Scope"
                  value={editDept}
                  onChange={(val) => setEditDept(val)}
                  options={departmentOptions}
                />
                <Select
                  label="Exam Status"
                  value={editStatus}
                  onChange={(val) => setEditStatus(val as 'ACTIVE' | 'DRAFT' | 'ARCHIVED')}
                  options={[
                    { value: 'ACTIVE', label: 'ACTIVE (Live for Applicants)' },
                    { value: 'DRAFT', label: 'DRAFT (Hidden)' },
                    { value: 'ARCHIVED', label: 'ARCHIVED (Past Session)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <Input
                  label="Minimum Cut-Off (%)"
                  type="number"
                  min={1}
                  max={100}
                  value={editCutoff}
                  onChange={(e) => setEditCutoff(e.target.value)}
                />
                <Input
                  label="Duration (Minutes)"
                  type="number"
                  min={5}
                  max={180}
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                />
                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-[4px] text-xs h-10">
                  <span className="font-semibold text-slate-700">Randomize Questions</span>
                  <Button
                    size="sm"
                    variant={selectedSuite.randomizeQuestions ? 'primary' : 'secondary'}
                    onClick={() =>
                      setSuites((prev) =>
                        prev.map((s) =>
                          s.id === selectedSuite.id ? { ...s, randomizeQuestions: !s.randomizeQuestions } : s
                        )
                      )
                    }
                  >
                    {selectedSuite.randomizeQuestions ? 'On' : 'Off'}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full h-10 bg-[#0F7640] hover:bg-[#093322]"
                  onClick={handleSaveSuiteSettings}
                >
                  Save Exam Settings
                </Button>
              </div>

              <Input
                label="Candidate Instructions (Displayed inside Full-Screen Entrance CBT)"
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
              />
            </div>

            {/* Question Bank Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                  />
                </div>
                <div className="w-44">
                  <Select
                    value={subjectFilter}
                    onChange={(val) => setSubjectFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Subjects' },
                      ...ENTRANCE_CBT_SUBJECTS.map((s) => ({ value: s, label: s })),
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedSuite.questions.length > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleClearSuiteQuestions}
                  >
                    Clear All Questions
                  </Button>
                )}
                <Button
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenAddQuestion}
                >
                  Add Question
                </Button>
              </div>
            </div>

            {/* Questions List */}
            {visibleQuestions.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-300 rounded-[4px] text-center space-y-2 bg-slate-50/50">
                <Layers className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-900">No Questions in This Exam Yet</p>
                <p className="text-xs text-slate-500">
                  Click <strong>Add Question</strong> or <strong>Import CSV / JSON</strong> to populate this entrance exam.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-[4px] bg-white">
                {visibleQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50/60"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400">Q{idx + 1}</span>
                        <Badge variant="neutral" size="sm">{q.subject}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`px-2.5 py-1 rounded-[4px] border flex items-center gap-1.5 ${
                              optIdx === q.correctIndex
                                ? 'bg-emerald-50 border-emerald-300 text-[#0F7640] font-semibold'
                                : 'bg-slate-50/60 border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                            <span className="truncate">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Edit2 className="w-3 h-3" />}
                        onClick={() => handleOpenEditQuestion(q)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<Trash2 className="w-3 h-3" />}
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ─── MODAL 1: CREATE NEW ENTRANCE EXAM ─── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Entrance Exam Suite"
        description="Configure a new session-specific Entrance CBT for all departments or a single department."
        size="lg"
      >
        <form onSubmit={handleCreateSuite} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Admission Session"
              value={createForm.session}
              onChange={(val) => setCreateForm((p) => ({ ...p, session: val }))}
              options={sessionOptions.map((s) => ({ value: s, label: `${s} Academic Session` }))}
            />
            <Select
              label="Department Scope"
              value={createForm.departmentCode}
              onChange={(val) => setCreateForm((p) => ({ ...p, departmentCode: val }))}
              options={departmentOptions}
            />
          </div>

          <Input
            label="Exam Title"
            required
            value={createForm.examTitle}
            onChange={(e) => setCreateForm((p) => ({ ...p, examTitle: e.target.value }))}
            placeholder="e.g., 2027/2028 Community Health Entrance CBT"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Duration (Minutes)"
              type="number"
              min={5}
              max={180}
              value={createForm.durationMinutes}
              onChange={(e) => setCreateForm((p) => ({ ...p, durationMinutes: e.target.value }))}
            />
            <Input
              label="Minimum Cut-Off Score (%)"
              type="number"
              min={1}
              max={100}
              value={createForm.cutoffScore}
              onChange={(e) => setCreateForm((p) => ({ ...p, cutoffScore: e.target.value }))}
            />
          </div>

          <Input
            label="Candidate Instructions"
            value={createForm.instructions}
            onChange={(e) => setCreateForm((p) => ({ ...p, instructions: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#0F7640] hover:bg-[#093322]">
              Create Exam Suite
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: DUPLICATE EXAM TO ANOTHER SESSION / DEPARTMENT ─── */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="Duplicate Entrance Exam to Another Session"
        description={`Clone all ${selectedSuite?.questions.length || 0} questions and settings from "${selectedSuite?.examTitle || ''}".`}
        size="md"
      >
        <form onSubmit={handleConfirmDuplicate} className="space-y-4">
          <Select
            label="Target Admission Session"
            value={duplicateForm.targetSession}
            onChange={(val) => setDuplicateForm((p) => ({ ...p, targetSession: val }))}
            options={sessionOptions.map((s) => ({ value: s, label: `${s} Academic Session` }))}
          />
          <Select
            label="Target Department Scope"
            value={duplicateForm.targetDepartmentCode}
            onChange={(val) => setDuplicateForm((p) => ({ ...p, targetDepartmentCode: val }))}
            options={departmentOptions}
          />
          <Input
            label="New Exam Title"
            required
            value={duplicateForm.newTitle}
            onChange={(e) => setDuplicateForm((p) => ({ ...p, newTitle: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsDuplicateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#0F7640] hover:bg-[#093322]">
              Duplicate Exam
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: IMPORT QUESTIONS (CSV / JSON) ─── */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Entrance Exam Questions (CSV or JSON)"
        description="Upload a CSV/JSON file or paste rows below to bulk-load questions into this exam suite."
        size="lg"
      >
        <form onSubmit={handleConfirmImport} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleImportFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose CSV / JSON File
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleDownloadCsvTemplate}
              >
                Download CSV Template
              </Button>
            </div>
            <div className="w-48">
              <Select
                value={importMode}
                onChange={(val) => setImportMode(val as 'APPEND' | 'REPLACE')}
                options={[
                  { value: 'APPEND', label: 'Append to Existing' },
                  { value: 'REPLACE', label: 'Replace Existing Questions' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              CSV Columns: Subject, Question, Option A, Option B, Option C, Option D, Correct (A-D)
            </label>
            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={'Biology,"Which cell carries oxygen?","Leukocyte","Erythrocyte","Platelet","Neuron",B'}
              className="w-full p-3 text-xs border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#0F7640] hover:bg-[#093322]">
              Import Questions
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 4: ADD / EDIT SINGLE QUESTION ─── */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestionId ? 'Edit Entrance CBT Question' : 'Add Entrance CBT Question'}
        description={`Target Exam: ${selectedSuite?.examTitle || ''}`}
        size="lg"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Subject Area"
              value={questionForm.subject}
              onChange={(val) => setQuestionForm((prev) => ({ ...prev, subject: val }))}
              options={ENTRANCE_CBT_SUBJECTS.map((s) => ({ value: s, label: s }))}
            />
            <Select
              label="Correct Answer"
              value={questionForm.correctIndex}
              onChange={(val) => setQuestionForm((prev) => ({ ...prev, correctIndex: val }))}
              options={[
                { value: '0', label: 'Option A' },
                { value: '1', label: 'Option B' },
                { value: '2', label: 'Option C' },
                { value: '3', label: 'Option D' },
              ]}
            />
          </div>

          <Input
            label="Question Stem"
            required
            value={questionForm.question}
            onChange={(e) => setQuestionForm((prev) => ({ ...prev, question: e.target.value }))}
            placeholder="Enter the exact entrance exam question..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Option A"
              required
              value={questionForm.optA}
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, optA: e.target.value }))}
            />
            <Input
              label="Option B"
              required
              value={questionForm.optB}
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, optB: e.target.value }))}
            />
            <Input
              label="Option C"
              required
              value={questionForm.optC}
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, optC: e.target.value }))}
            />
            <Input
              label="Option D"
              required
              value={questionForm.optD}
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, optD: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#0F7640] hover:bg-[#093322]">
              {editingQuestionId ? 'Save Changes' : 'Add Question'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
