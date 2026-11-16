import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, AdmissionCandidateItem } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
  Modal,
  Input,
  Select,
} from '@campusone/ui';
import {
  Download,
  Plus,
  Search,
  UserCheck,
  FileText,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Layers,
  Filter,
  Edit2,
  Trash2,
} from 'lucide-react';
import { escapeHtml, exportToCsv, printInstitutionalDocument } from '../utils/documentExport.ts';
import { PersonAvatar, PhotoUploadControl, pluralize } from '../components/common/PersonAvatar.tsx';

const ADMISSION_ENTRANCE_QUESTIONS = [
  {
    id: 'adm-q1',
    subject: 'Biology & Human Anatomy',
    question: 'Which blood vessel carries oxygenated blood directly from the lungs to the left atrium of the human heart?',
    options: [
      { id: 'A', text: 'Pulmonary Artery' },
      { id: 'B', text: 'Pulmonary Vein' },
      { id: 'C', text: 'Superior Vena Cava' },
      { id: 'D', text: 'Coronary Sinus' },
    ],
    correct: 'B',
  },
  {
    id: 'adm-q2',
    subject: 'Chemistry & Clinical Lab Science',
    question: 'A solution with a pH value of 7.4 (such as normal human arterial blood) is classified chemically as:',
    options: [
      { id: 'A', text: 'Strongly acidic' },
      { id: 'B', text: 'Slightly alkaline (basic)' },
      { id: 'C', text: 'Strongly alkaline' },
      { id: 'D', text: 'Moderately acidic' },
    ],
    correct: 'B',
  },
  {
    id: 'adm-q3',
    subject: 'Use of English & Communication',
    question: 'Choose the option nearest in meaning to the emphasized word: "The Chief Medical Director ordered immediate *prophylactic* measures across the rural clinic."',
    options: [
      { id: 'A', text: 'Preventive' },
      { id: 'B', text: 'Experimental' },
      { id: 'C', text: 'Financial' },
      { id: 'D', text: 'Post-operative' },
    ],
    correct: 'A',
  },
  {
    id: 'adm-q4',
    subject: 'Physics & Diagnostic Equipment',
    question: 'Standard hospital steam sterilization in a laboratory autoclave typically operates at what temperature and pressure?',
    options: [
      { id: 'A', text: '60°C at 5 psi for 5 minutes' },
      { id: 'B', text: '121°C at 15 psi for 15–20 minutes' },
      { id: 'C', text: '100°C at atmospheric pressure for 2 minutes' },
      { id: 'D', text: '40°C at 30 psi for 60 minutes' },
    ],
    correct: 'B',
  },
  {
    id: 'adm-q5',
    subject: 'Primary Health Care & Public Health',
    question: 'According to World Health Organization (WHO) guidelines, exclusive breastfeeding of a newborn infant is recommended for the first:',
    options: [
      { id: 'A', text: '6 weeks of life' },
      { id: 'B', text: '3 months of life' },
      { id: 'C', text: '6 months of life' },
      { id: 'D', text: '18 months of life' },
    ],
    correct: 'C',
  },
];

interface OLevelSubject {
  subject: string;
  grade: string;
}

type Candidate = AdmissionCandidateItem;

export const AdmissionsView: React.FC = () => {
  const {
    recordAudit,
    isDense,
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    admitCandidate,
    enrollCandidate,
    schoolProfile,
    departments,
  } = useApp();
  const { showToast } = useToast();
  const { tab: routeTab } = useParams();
  const navigate = useNavigate();

  // Industry-standard page routing
  const activeTab = routeTab || 'applications';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'applications') {
      navigate('/admissions');
    } else {
      navigate(`/admissions/${tabId}`);
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgrammeFilter, setSelectedProgrammeFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [letterCandidate, setLetterCandidate] = useState<Candidate | null>(null);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [isBatchScreenOpen, setIsBatchScreenOpen] = useState(false);
  const [batchCutoffScore, setBatchCutoffScore] = useState(String(schoolProfile?.minimumCutoffScore || 50));

  // Edit & Delete Management State
  const [isEditCandidateOpen, setIsEditCandidateOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isDeleteCandidateOpen, setIsDeleteCandidateOpen] = useState(false);
  const [deleteCandidateTarget, setDeleteCandidateTarget] = useState<Candidate | null>(null);
  const [isBatch2ModalOpen, setIsBatch2ModalOpen] = useState(false);

  // Live Admission Entrance CBT Exam State
  const [cbtCandidate, setCbtCandidate] = useState<Candidate | null>(null);
  const [cbtQuestionIdx, setCbtQuestionIdx] = useState(0);
  const [cbtAnswers, setCbtAnswers] = useState<Record<number, string>>({});
  const [cbtSubmittedScore, setCbtSubmittedScore] = useState<number | null>(null);

  const startAdmissionCbtForCandidate = (cand: Candidate) => {
    setCbtCandidate(cand);
    setCbtQuestionIdx(0);
    setCbtAnswers({});
    setCbtSubmittedScore(null);
  };

  const handleSubmitAdmissionCbt = () => {
    if (!cbtCandidate) return;
    let correct = 0;
    ADMISSION_ENTRANCE_QUESTIONS.forEach((q, idx) => {
      if (cbtAnswers[idx] === q.correct) correct += 1;
    });
    const pct = Math.round((correct / ADMISSION_ENTRANCE_QUESTIONS.length) * 100);
    const cutoff = schoolProfile?.minimumCutoffScore || 50;
    updateCandidate(cbtCandidate.id, {
      cbtScore: pct,
      cbtDate: new Date().toISOString().split('T')[0],
      status: pct >= cutoff && cbtCandidate.olevelStatus === 'VERIFIED' ? 'SCREENED' : cbtCandidate.status,
    });
    recordAudit('ADMISSION_CBT_COMPLETED', 'ADM_CANDIDATE', cbtCandidate.applicationNumber, { cbtScore: pct });
    setCbtSubmittedScore(pct);
  };

  const handleOpenEditCandidate = (c: Candidate) => {
    setEditingCandidate({ ...c });
    setIsEditCandidateOpen(true);
  };

  const handleUpdateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    updateCandidate(editingCandidate.id, {
      fullName: editingCandidate.fullName,
      email: editingCandidate.email,
      phone: editingCandidate.phone,
      stateOfOrigin: editingCandidate.stateOfOrigin,
      department: editingCandidate.department,
      utmeScore: Number(editingCandidate.utmeScore) || 0,
      cbtScore: Number(editingCandidate.cbtScore) || 0,
      status: editingCandidate.status,
    });
    setIsEditCandidateOpen(false);
    showToast({
      type: 'success',
      title: 'Application Updated',
      message: `${editingCandidate.fullName} record has been saved.`,
    });
  };

  const handleDeleteCandidate = () => {
    if (!deleteCandidateTarget) return;
    deleteCandidate(deleteCandidateTarget.id);
    setIsDeleteCandidateOpen(false);
    showToast({
      type: 'success',
      title: 'Application Removed',
      message: `${deleteCandidateTarget.fullName} deleted from admissions registry.`,
    });
    setDeleteCandidateTarget(null);
  };

  // New Application Form State
  const [newAppForm, setNewAppForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Female',
    stateOfOrigin: 'Oyo',
    programmeCode: 'CHEW',
    cbtScore: '75',
    olevelExamBody: 'WAEC',
    olevelExamYear: '2025',
    avatarUrl: '',
  });

  // Master candidates registry is loaded from central AppContext

  // Handle Granting Admission to Individual Candidate
  const handleAdmitCandidate = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;
    const serial = Math.floor(10 + Math.random() * 89);
    const matricNumber = `${candidate.programmeCode}/2026/00${serial}`;
    admitCandidate(candidateId, matricNumber, 'Merit List (Batch 1)');
    recordAudit('CANDIDATE_ADMITTED', 'ADM_CANDIDATE', candidate.applicationNumber, { matricNumber });
    showToast({
      type: 'success',
      title: 'Admission Granted',
      message: `Provisional admission granted to ${candidate.fullName}. Matric: ${matricNumber}`,
    });
  };

  // Handle Batch Screening Qualify
  const handleBatchScreen = () => {
    const threshold = parseInt(batchCutoffScore) || (schoolProfile?.minimumCutoffScore || 50);
    let qualifiedCount = 0;

    candidates.forEach((c) => {
      if (c.status === 'APPLIED' && c.cbtScore >= threshold && c.olevelStatus === 'VERIFIED') {
        qualifiedCount++;
        updateCandidate(c.id, { status: 'SCREENED' });
      }
    });

    setIsBatchScreenOpen(false);
    showToast({
      type: 'success',
      title: 'Screening Completed',
      message: `${qualifiedCount} applicants scored ≥ ${threshold}% and met O'Level requirements. Moved to Screened status.`,
    });
  };

  // Handle New Application Form Submit
  const handleAddNewApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppForm.fullName || !newAppForm.email || !newAppForm.phone) {
      showToast({
        type: 'danger',
        title: 'Missing Required Fields',
        message: 'Please provide full name, email, and contact phone number.',
      });
      return;
    }

    const nextSerial = candidates.length + 142;
    const appNumber = `APP/2026/0${nextSerial}`;

    const matchedDept = departments.find((d) => d.code === newAppForm.programmeCode) || departments[0];
    const deptName = matchedDept ? matchedDept.name : 'Department of Health Sciences';
    const regBoard = matchedDept ? matchedDept.regulatoryBody : (schoolProfile?.regulatoryCouncils?.[0] || 'NBTE');
    const progName = matchedDept ? `${matchedDept.name} (${matchedDept.code})` : newAppForm.programmeCode;
    const score = parseInt(newAppForm.cbtScore) || (schoolProfile?.minimumCutoffScore || 70);

    const newCandidate = addCandidate({
      id: `app-${Date.now().toString().slice(-4)}`,
      cbtDate: new Date().toISOString().split('T')[0],
      applicationNumber: appNumber,
      fullName: newAppForm.fullName,
      email: newAppForm.email,
      phone: newAppForm.phone,
      gender: newAppForm.gender as 'Female' | 'Male',
      stateOfOrigin: newAppForm.stateOfOrigin,
      lga: 'Central',
      programmeCode: matchedDept ? matchedDept.code : newAppForm.programmeCode,
      programme: progName,
      department: deptName,
      regulatoryBody: regBoard,
      olevelExamBody: newAppForm.olevelExamBody as any,
      olevelExamYear: newAppForm.olevelExamYear,
      olevelStatus: 'VERIFIED',
      olevelSubjects: [
        { subject: 'English Language', grade: 'B3' },
        { subject: 'Mathematics', grade: 'C4' },
        { subject: 'Biology', grade: 'B2' },
        { subject: 'Chemistry', grade: 'C5' },
        { subject: 'Physics', grade: 'C5' },
      ],
      cbtScore: score,
      status: score >= (schoolProfile?.minimumCutoffScore || 50) ? 'SCREENED' : 'APPLIED',
      applicationFeePaid: true,
      applicationFeeRef: `PAY-APP-${Date.now().toString().slice(-6)}`,
      acceptanceFeePaid: false,
      avatarUrl: newAppForm.avatarUrl || undefined,
    });
    setIsNewAppOpen(false);
    showToast({
      type: 'success',
      title: 'Application Created',
      message: `Candidate ${newCandidate.fullName} registered under application number ${newCandidate.applicationNumber}.`,
    });
  };

  // Filtered Candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchesProg =
      selectedProgrammeFilter === 'ALL' || c.programmeCode === selectedProgrammeFilter;
    const matchesStatus =
      selectedStatusFilter === 'ALL' || c.status === selectedStatusFilter;
    return matchesSearch && matchesProg && matchesStatus;
  });

  // Table Columns for Applications Directory
  const applicationColumns = [
    {
      key: 'applicationNumber',
      header: 'App No.',
      render: (c: Candidate) => (
        <span className="font-extrabold text-[#0F7640] text-sm tracking-wide">
          {c.applicationNumber}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Applicant Full Name',
      render: (c: Candidate) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <PersonAvatar name={c.fullName} email={c.email} matricNumber={c.matricNumber} avatarUrl={c.avatarUrl} size="sm" />
          <div>
            <p className="font-bold text-slate-900">{c.fullName}</p>
            <span className="text-[11px] text-slate-500 font-medium">
              {c.gender} • {c.stateOfOrigin} State • {c.phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'programme',
      header: 'Applied Programme',
      render: (c: Candidate) => (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-slate-800">{c.programme}</p>
          <span className="text-[11px] text-slate-500 font-medium">Board: {c.regulatoryBody}</span>
        </div>
      ),
    },
    {
      key: 'olevelStatus',
      header: "O'Level Check",
      render: (c: Candidate) => (
        <Badge
          variant={
            c.olevelStatus === 'VERIFIED'
              ? 'success'
              : c.olevelStatus === 'PENDING'
              ? 'warning'
              : 'danger'
          }
        >
          {c.olevelStatus}
        </Badge>
      ),
    },
    {
      key: 'cbtScore',
      header: 'CBT Score',
      align: 'right' as const,
      render: (c: Candidate) => (
        <span className="font-extrabold text-slate-900 text-sm">{c.cbtScore}%</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: Candidate) => (
        <Badge
          variant={
            c.status === 'ENROLLED'
              ? 'success'
              : c.status === 'ADMITTED'
              ? 'primary'
              : c.status === 'SCREENED'
              ? 'warning'
              : 'neutral'
          }
        >
          {c.status}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      render: (c: Candidate) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedCandidate(c)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Edit2 className="w-3 h-3" />}
            onClick={() => handleOpenEditCandidate(c)}
          >
            Edit
          </Button>
          {c.status === 'SCREENED' && (
            <Button size="sm" onClick={() => handleAdmitCandidate(c.id)}>
              Admit
            </Button>
          )}
          {c.status === 'ADMITTED' && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => setLetterCandidate(c)}
            >
              Letter
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            onClick={() => {
              setDeleteCandidateTarget(c);
              setIsDeleteCandidateOpen(true);
            }}
            title="Delete Application"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admissions & Enrollment</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Applicant screening tests, O'Level verification, statutory quota allocation, and admission offers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            onClick={() => setIsBatchScreenOpen(true)}
          >
            Batch Screening
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewAppOpen(true)}
          >
            New Application
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Applications
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{candidates.length}</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-600 font-semibold">2026/2027 Session</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Total portal submissions</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Screened & Qualified
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0F7640] font-sans tracking-tight">
              {candidates.filter((c) => c.status !== 'APPLIED').length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">CBT & O'Level passed</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Met statutory cut-offs</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Admissions Granted
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0F7640] font-sans tracking-tight">
              {candidates.filter((c) => c.status === 'ADMITTED' || c.status === 'ENROLLED').length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">Offers published</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Provisional merit list</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {candidates.filter((c) => c.status === 'ENROLLED').length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Acceptance settled</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Matriculated & active</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Nav Tabs */}
      <Tabs
        tabs={[
          { id: 'applications', label: 'All Applications' },
          { id: 'screening', label: 'Screening & Tests' },
          { id: 'lists', label: 'Admission Lists' },
          { id: 'enrolled', label: 'Accepted & Enrolled' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* ─── TAB 1: All Applications ─── */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Search & Custom UI Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate, app no, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F7640] focus:border-[#0F7640]"
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <div className="w-48">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Programmes' },
                    ...(departments && departments.length > 0
                      ? departments.map((d) => ({ value: d.code, label: `${d.code} - ${d.name}` }))
                      : [
                          { value: 'CHEW', label: 'CHEW (Community Health)' },
                          { value: 'MLT', label: 'MLT (Medical Lab)' },
                          { value: 'PHT', label: 'PHT (Pharmacy Tech)' },
                          { value: 'HIM', label: 'HIM (Health Records)' },
                          { value: 'EHT', label: 'EHT (Environmental)' },
                        ]),
                  ]}
                  value={selectedProgrammeFilter}
                  onChange={(val) => setSelectedProgrammeFilter(val)}
                />
              </div>
              <div className="w-40">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'APPLIED', label: 'Applied' },
                    { value: 'SCREENED', label: 'Screened' },
                    { value: 'ADMITTED', label: 'Admitted' },
                    { value: 'ENROLLED', label: 'Enrolled' },
                  ]}
                  value={selectedStatusFilter}
                  onChange={(val) => setSelectedStatusFilter(val)}
                />
              </div>
            </div>
          </div>

          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="font-bold text-slate-900">2026/2027 Admission Screening Queue</span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                </span>
              </div>
            }
          >
            <Table
              columns={applicationColumns}
              data={filteredCandidates}
              searchable={false}
              keyExtractor={(c) => c.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 2: Screening & CBT Tests ─── */}
      {activeTab === 'screening' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-emerald-900 text-sm">
                2026/2027 Statutory Admission Entrance CBT Benchmark: {schoolProfile?.minimumCutoffScore || 50}% Cut-Off
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Applicants sit the college Entrance Screening CBT (English, Biology, Chemistry, Physics &amp; Health Aptitude) and present 5 O&apos;Level credit passes.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const firstApplicant = candidates.find((c) => c.status === 'APPLIED') || candidates[0];
                  if (firstApplicant) startAdmissionCbtForCandidate(firstApplicant);
                }}
              >
                Launch Entrance CBT Simulator
              </Button>
              <Button
                size="sm"
                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                onClick={() => setIsBatchScreenOpen(true)}
              >
                Evaluate Cut-Off Mark
              </Button>
            </div>
          </div>

          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="font-bold text-slate-900">Screening Evaluation &amp; Subject Verification</span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  {pluralize(candidates.filter((c) => c.cbtScore >= 50).length, 'candidate')} met threshold
                </span>
              </div>
            }
          >
            <Table
              columns={[
                {
                  key: 'applicationNumber',
                  header: 'App No.',
                  render: (c: Candidate) => (
                    <span className="font-extrabold text-[#0F7640] text-sm">{c.applicationNumber}</span>
                  ),
                },
                {
                  key: 'fullName',
                  header: 'Candidate Name',
                  render: (c: Candidate) => (
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <PersonAvatar name={c.fullName} email={c.email} matricNumber={c.matricNumber} avatarUrl={c.avatarUrl} size="sm" />
                      <div>
                        <p className="font-bold text-slate-900">{c.fullName}</p>
                        <span className="text-[11px] text-slate-500">{c.programmeCode} • {c.stateOfOrigin} State</span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'cbtScore',
                  header: 'Entrance CBT Result',
                  align: 'right' as const,
                  render: (c: Candidate) => (
                    <span className={`font-extrabold text-sm ${c.cbtScore >= 50 ? 'text-[#0F7640]' : 'text-red-600'}`}>
                      {c.cbtScore}%
                    </span>
                  ),
                },
                {
                  key: 'olevel',
                  header: "O'Level Compliance",
                  render: (c: Candidate) => (
                    <Badge variant={c.olevelStatus === 'VERIFIED' ? 'success' : 'warning'}>
                      {c.olevelExamBody} {c.olevelStatus}
                    </Badge>
                  ),
                },
                {
                  key: 'decision',
                  header: 'Screening Recommendation',
                  render: (c: Candidate) => {
                    const isQualified = c.cbtScore >= 50 && c.olevelStatus === 'VERIFIED';
                    return (
                      <span className={`font-semibold text-xs ${isQualified ? 'text-[#0F7640]' : 'text-slate-500'}`}>
                        {isQualified ? 'Qualified for Admission' : 'Review Required'}
                      </span>
                    );
                  },
                },
                {
                  key: 'action',
                  header: 'Action',
                  align: 'right' as const,
                  render: (c: Candidate) => (
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startAdmissionCbtForCandidate(c)}
                      >
                        Take CBT
                      </Button>
                      {c.status === 'APPLIED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            updateCandidate(c.id, { status: 'SCREENED' });
                            showToast({
                              type: 'success',
                              title: 'Candidate Screened',
                              message: `${c.fullName} confirmed qualified for admission list.`,
                            });
                          }}
                        >
                          Confirm Screened
                        </Button>
                      )}
                      {c.status === 'SCREENED' && (
                        <Button size="sm" onClick={() => handleAdmitCandidate(c.id)}>
                          Grant Admission
                        </Button>
                      )}
                      {(c.status === 'ADMITTED' || c.status === 'ENROLLED') && (
                        <Badge variant="primary">Admitted</Badge>
                      )}
                    </div>
                  ),
                },
              ]}
              data={candidates}
              keyExtractor={(c) => c.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 3: Admission Lists (Merit & Supplementary) ─── */}
      {activeTab === 'lists' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card header={<span className="font-bold text-slate-900">Merit Admission List (Batch 1)</span>}>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Approved by Academic Board & Provost</p>
                    <span className="text-slate-500">Published on 02 November 2026 • 210 Candidates</span>
                  </div>
                  <Badge variant="success">Published</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                  <span>Acceptance Deadline: 25 November 2026</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const admitted = candidates.filter((c) => c.status === 'ADMITTED' || c.status === 'ENROLLED');
                      exportToCsv({
                        filename: `BCHT_Admission_List_Batch1_${new Date().toISOString().slice(0, 10)}.csv`,
                        columns: [
                          { key: 'applicationNumber', header: 'Application Number' },
                          { key: 'matricNumber', header: 'Matriculation Number', format: (v) => v || 'Pending' },
                          { key: 'fullName', header: 'Candidate Full Name' },
                          { key: 'gender', header: 'Gender' },
                          { key: 'programme', header: 'Admitted Programme' },
                          { key: 'department', header: 'Department' },
                          { key: 'cbtScore', header: 'CBT Score (%)' },
                          { key: 'olevelStatus', header: "O'Level Verification" },
                          { key: 'admissionListBatch', header: 'Admission Batch', format: (v) => v || 'Merit List Batch 1' },
                          { key: 'acceptanceFeePaid', header: 'Acceptance Fee Status', format: (v) => (v ? 'Cleared (NGN 25,000)' : 'Pending') },
                          { key: 'email', header: 'Email Address' },
                          { key: 'phone', header: 'Phone Number' },
                        ],
                        data: admitted,
                      });
                      showToast({
                        type: 'success',
                        title: 'Admission List Exported',
                        message: `Exported ${admitted.length} admitted candidates to official CSV spreadsheet.`,
                      });
                    }}
                  >
                    Export Batch 1
                  </Button>
                </div>
              </div>
            </Card>

            <Card header={<span className="font-bold text-slate-900">Supplementary Admission List (Batch 2)</span>}>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Second Batch Processing</p>
                    <span className="text-slate-500">Drafted • 76 Qualified Candidates Under Quota</span>
                  </div>
                  <Badge variant="warning">Awaiting Approval</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                  <span>
                    Screened &amp; Ready: {pluralize(candidates.filter((c) => c.status === 'SCREENED').length, 'Candidate')}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsBatch2ModalOpen(true)}
                  >
                    Publish Batch 2
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="font-bold text-slate-900">Published Candidates on Official Admission Lists</span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  {candidates.filter((c) => c.status === 'ADMITTED' || c.status === 'ENROLLED').length} admitted candidates
                </span>
              </div>
            }
          >
            <Table
              columns={[
                {
                  key: 'matricNumber',
                  header: 'Matric No.',
                  render: (c: Candidate) => (
                    <span className="font-extrabold text-[#0F7640] text-sm">
                      {c.matricNumber || '—'}
                    </span>
                  ),
                },
                {
                  key: 'fullName',
                  header: 'Admitted Candidate',
                  render: (c: Candidate) => (
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <PersonAvatar name={c.fullName} email={c.email} matricNumber={c.matricNumber} avatarUrl={c.avatarUrl} size="sm" />
                      <div>
                        <p className="font-bold text-slate-900">{c.fullName}</p>
                        <span className="text-[11px] text-slate-500">{c.applicationNumber}</span>
                      </div>
                    </div>
                  ),
                },
                { key: 'programme', header: 'Admitted Programme' },
                {
                  key: 'admissionListBatch',
                  header: 'Admission Batch',
                  render: (c: Candidate) => (
                    <Badge variant="neutral" size="sm">
                      {c.admissionListBatch || 'Merit List'}
                    </Badge>
                  ),
                },
                {
                  key: 'feeStatus',
                  header: 'Acceptance Fee',
                  render: (c: Candidate) => (
                    <Badge variant={c.acceptanceFeePaid ? 'success' : 'warning'}>
                      {c.acceptanceFeePaid ? 'Cleared (₦25,000)' : 'Pending'}
                    </Badge>
                  ),
                },
                {
                  key: 'action',
                  header: 'Action',
                  align: 'right' as const,
                  render: (c: Candidate) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      onClick={() => setLetterCandidate(c)}
                    >
                      Print Letter
                    </Button>
                  ),
                },
              ]}
              data={candidates.filter((c) => c.status === 'ADMITTED' || c.status === 'ENROLLED')}
              keyExtractor={(c) => c.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 4: Accepted & Enrolled Students ─── */}
      {activeTab === 'enrolled' && (
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
              <span className="font-bold text-slate-900">Enrolled Students (Acceptance Fee Cleared)</span>
              <span className="text-xs text-slate-500 font-medium shrink-0">
                {candidates.filter((c) => c.status === 'ENROLLED').length} fully matriculated
              </span>
            </div>
          }
        >
          <Table
            columns={[
              {
                key: 'matricNumber',
                header: 'Matric No.',
                render: (c: Candidate) => (
                  <span className="font-extrabold text-[#0F7640] text-sm">{c.matricNumber}</span>
                ),
              },
              {
                key: 'fullName',
                header: 'Student Name',
                render: (c: Candidate) => (
                  <div className="flex items-center gap-2.5 whitespace-nowrap">
                    <PersonAvatar name={c.fullName} email={c.email} matricNumber={c.matricNumber} avatarUrl={c.avatarUrl} size="sm" />
                    <div>
                      <p className="font-bold text-slate-900">{c.fullName}</p>
                      <span className="text-[11px] text-slate-500">{c.email} • {c.phone}</span>
                    </div>
                  </div>
                ),
              },
              { key: 'programme', header: 'Programme of Study' },
              {
                key: 'receipt',
                header: 'Acceptance Receipt',
                render: (c: Candidate) => (
                  <span className="font-semibold text-xs text-slate-700 font-sans">
                    {c.acceptanceFeeRef || 'REC-ACC-2026-0014'}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Enrollment Status',
                render: () => <Badge variant="success">Fully Enrolled</Badge>,
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right' as const,
                render: (c: Candidate) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedCandidate(c)}
                  >
                    Open SIS File
                  </Button>
                ),
              },
            ]}
            data={candidates.filter((c) => c.status === 'ENROLLED')}
            keyExtractor={(c) => c.id}
            isDense={isDense}
          />
        </Card>
      )}

      {/* ─── MODAL 1: Candidate Application Dossier ─── */}
      <Modal
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate ? `${selectedCandidate.fullName} (${selectedCandidate.applicationNumber})` : 'Candidate Dossier'}
        description="Comprehensive application profile, verified O'Level credentials, and screening assessment."
        size="lg"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Statutory Board: {selectedCandidate?.regulatoryBody}
            </span>
            <div className="flex items-center gap-2">
              {selectedCandidate?.status === 'SCREENED' && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedCandidate) {
                      handleAdmitCandidate(selectedCandidate.id);
                      setSelectedCandidate(null);
                    }
                  }}
                >
                  Grant Admission
                </Button>
              )}
              {(selectedCandidate?.status === 'ADMITTED' || selectedCandidate?.status === 'ENROLLED') && (
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setLetterCandidate(selectedCandidate);
                    setSelectedCandidate(null);
                  }}
                >
                  View Admission Letter
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setSelectedCandidate(null)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        {selectedCandidate && (
          <div className="space-y-4 text-xs text-slate-700">
            {/* Summary Highlights */}
            <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">CBT Score</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedCandidate.cbtScore}%</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">O'Level Status</span>
                <Badge variant={selectedCandidate.olevelStatus === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                  {selectedCandidate.olevelStatus}
                </Badge>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Admission Status</span>
                <Badge variant={selectedCandidate.status === 'ADMITTED' ? 'primary' : 'neutral'} size="sm">
                  {selectedCandidate.status}
                </Badge>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Matric Number</span>
                <span className="font-bold text-[#0F7640]">{selectedCandidate.matricNumber || 'Pending'}</span>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Candidate Bio Data
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px]">Contact Email</span>
                  <span className="font-semibold text-slate-800 block truncate" title={selectedCandidate.email}>
                    {selectedCandidate.email}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="font-semibold text-slate-800 block whitespace-nowrap">
                    {selectedCandidate.phone}
                  </span>
                </div>
                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <span className="text-slate-400 block text-[11px]">State of Origin / LGA</span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {selectedCandidate.stateOfOrigin} State ({selectedCandidate.lga})
                  </span>
                </div>
              </div>
            </div>

            {/* Applied Programme */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Academic Programme
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded-[4px] flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedCandidate.programme}</p>
                  <p className="text-xs text-slate-500">{selectedCandidate.department}</p>
                </div>
                <Badge variant="neutral">{selectedCandidate.programmeCode}</Badge>
              </div>
            </div>

            {/* O'Level Results Breakdown */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Verified O'Level Subjects ({selectedCandidate.olevelExamBody} {selectedCandidate.olevelExamYear})
              </span>
              <div className="border border-slate-200 rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Grade</th>
                      <th className="px-3 py-2">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedCandidate.olevelSubjects || []).map((s: { subject: string; grade: string }, idx: number) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium text-slate-800">{s.subject}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{s.grade}</td>
                        <td className="px-3 py-2 text-[#0F7640] font-semibold">Credit Pass</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: New Candidate Application (Custom UI Select) ─── */}
      <Modal
        isOpen={isNewAppOpen}
        onClose={() => setIsNewAppOpen(false)}
        title="Register Candidate Application"
        description="Enroll a walk-in or offline candidate into the 2026/2027 admission screening pool."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsNewAppOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddNewApplication}>
              Submit Application
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddNewApplication} className="space-y-3.5 text-xs">
          <PhotoUploadControl
            label="Applicant Passport Photograph"
            name={newAppForm.fullName}
            value={newAppForm.avatarUrl}
            onChange={(url) => setNewAppForm({ ...newAppForm, avatarUrl: url })}
          />
          <Input
            label="Candidate Full Name"
            placeholder="e.g. Samuel Olawale Adeleke"
            value={newAppForm.fullName}
            onChange={(e) => setNewAppForm({ ...newAppForm, fullName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Email"
              type="email"
              placeholder="candidate@gmail.com"
              value={newAppForm.email}
              onChange={(e) => setNewAppForm({ ...newAppForm, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+234 800 000 0000"
              value={newAppForm.phone}
              onChange={(e) => setNewAppForm({ ...newAppForm, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Gender"
              options={[
                { value: 'Female', label: 'Female' },
                { value: 'Male', label: 'Male' },
              ]}
              value={newAppForm.gender}
              onChange={(val) => setNewAppForm({ ...newAppForm, gender: val })}
            />
            <Select
              label="State of Origin"
              options={[
                { value: 'Oyo', label: 'Oyo State' },
                { value: 'Osun', label: 'Osun State' },
                { value: 'Ogun', label: 'Ogun State' },
                { value: 'Lagos', label: 'Lagos State' },
                { value: 'Kwara', label: 'Kwara State' },
                { value: 'Delta', label: 'Delta State' },
                { value: 'Edo', label: 'Edo State' },
              ]}
              value={newAppForm.stateOfOrigin}
              onChange={(val) => setNewAppForm({ ...newAppForm, stateOfOrigin: val })}
            />
          </div>

          <Select
            label="Applied Health Programme"
            options={
              departments && departments.length > 0
                ? departments.map((d) => ({ value: d.code, label: `${d.name} (${d.code})` }))
                : [
                    { value: 'CHEW', label: 'Community Health Extension Worker (CHEW)' },
                    { value: 'MLT', label: 'Medical Laboratory Technician (MLT)' },
                  ]
            }
            value={newAppForm.programmeCode}
            onChange={(val) => setNewAppForm({ ...newAppForm, programmeCode: val })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="O'Level Body"
              options={[
                { value: 'WAEC', label: 'WAEC' },
                { value: 'NECO', label: 'NECO' },
                { value: 'NABTEB', label: 'NABTEB' },
              ]}
              value={newAppForm.olevelExamBody}
              onChange={(val) => setNewAppForm({ ...newAppForm, olevelExamBody: val })}
            />
            <Input
              label="Exam Year"
              value={newAppForm.olevelExamYear}
              onChange={(e) => setNewAppForm({ ...newAppForm, olevelExamYear: e.target.value })}
            />
            <Input
              label="CBT Score (%)"
              type="number"
              value={newAppForm.cbtScore}
              onChange={(e) => setNewAppForm({ ...newAppForm, cbtScore: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: Official Admission Letter Preview & Print ─── */}
      <Modal
        isOpen={Boolean(letterCandidate)}
        onClose={() => setLetterCandidate(null)}
        title="Official Provisional Admission Letter"
        description="Bethsaida College of Health Tech formal offer of provisional admission."
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-medium">
              Reference: {schoolProfile?.institutionAcronym || 'BCHT'}/ADM/{schoolProfile?.activeSession?.split('/')[0] || '2026'}/{letterCandidate?.applicationNumber.replace('APP/2026/', '')}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (!letterCandidate) return;
                  const refNo = `${schoolProfile?.institutionAcronym || 'BCHT'}/ADM/${schoolProfile?.activeSession?.split('/')[0] || '2026'}/${letterCandidate.applicationNumber.replace('APP/2026/', '')}`;
                  printInstitutionalDocument({
                    title: `Provisional Admission Letter — ${letterCandidate.fullName}`,
                    badgeText: 'OFFICE OF THE REGISTRAR • PROVISIONAL ADMISSION OFFER',
                    referenceNo: refNo,
                    issuedDate: '02 November 2026',
                    schoolProfile,
                    officeSubtitle: 'Office of the Registrar & Admissions Board',
                    metaItems: [
                      { label: 'Candidate Full Name', value: letterCandidate.fullName, highlight: true },
                      { label: 'Application Number', value: letterCandidate.applicationNumber },
                      { label: 'Matriculation Allocation', value: letterCandidate.matricNumber || 'CHE/2026/0014', highlight: true },
                      { label: 'State of Origin / LGA', value: `${letterCandidate.stateOfOrigin} State (${letterCandidate.lga})` },
                      { label: 'Screening Score', value: `${letterCandidate.cbtScore}% (${letterCandidate.olevelExamBody} Verified)` },
                      { label: 'Academic Session', value: schoolProfile?.activeSession || '2026/2027' },
                    ],
                    bodyHtml: `
                      <p style="font-weight:800; text-align:center; text-decoration:underline; text-transform:uppercase; font-size:12px; margin: 10px 0 12px 0;">
                        OFFER OF PROVISIONAL ADMISSION FOR ${escapeHtml(schoolProfile?.activeSession || '2026/2027')} ACADEMIC SESSION
                      </p>
                      <p>
                        I am pleased to inform you that following your satisfactory performance in the College Entrance &amp; Screening Examination and verification of your O'Level qualifications, the Academic Board of <strong>${escapeHtml(schoolProfile?.institutionName || 'Bethsaida College of Health Technology')}</strong> has offered you provisional admission into the:
                      </p>
                      <div class="callout-green" style="text-align:center;">
                        <div style="font-size:13px; font-weight:800; color:#093322;">${escapeHtml(letterCandidate.programme)}</div>
                        <div style="font-size:10px; margin-top:2px;">Department of ${escapeHtml(letterCandidate.department)} &bull; Regulated by ${escapeHtml(letterCandidate.regulatoryBody)}</div>
                      </div>
                      <p>This offer is subject to your acceptance of the terms and conditions governing admission into the College, including:</p>
                      <ol style="padding-left:18px; margin: 6px 0 10px 0;">
                        <li style="margin-bottom:4px;">Payment of the non-refundable Acceptance Fee of <strong>₦25,000 (Twenty-Five Thousand Naira)</strong> within two (2) weeks of this publication.</li>
                        <li style="margin-bottom:4px;">Presentation of original certificates of WAEC, NECO, or NABTEB for formal physical verification at the Academic Registry.</li>
                        <li style="margin-bottom:4px;">Submission of a Medical Fitness Certificate issued by the College Health Directorate.</li>
                        <li style="margin-bottom:4px;">Strict adherence to the professional ethics and disciplinary codes of ${escapeHtml(schoolProfile?.institutionName || 'Bethsaida College of Health Technology')}.</li>
                      </ol>
                      <p>Congratulations on your admission into the healthcare training community.</p>
                    `,
                    stampText: `OFFICIAL ${schoolProfile?.institutionAcronym || 'BCHT'} SEAL`,
                    signatures: [
                      { title: 'Mrs. A. Adeleke', subtitle: 'Registrar & Secretary to Academic Board' },
                      { title: 'Dr. Timothy Balogun', subtitle: 'College Provost' },
                    ],
                  });
                }}
              >
                Print Official Letter
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setLetterCandidate(null)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        {letterCandidate && (
          <div className="bg-white p-6 border border-slate-200 rounded-[4px] space-y-5 text-slate-800 text-xs shadow-sm font-sans">
            {/* Official Letterhead Header */}
            <div className="border-b-2 border-[#0F7640] pb-4 flex flex-col items-center text-center">
              <img
                src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
                alt="College Crest"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                }}
                className="w-14 h-14 mx-auto mb-2 rounded-[4px] object-contain shadow-xs"
              />
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                Bethsaida College of Health Technology
              </h2>
              <p className="text-[11px] text-slate-600">
                {schoolProfile?.campusAddress || 'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State'}
              </p>
              <p className="text-[10px] text-slate-500">
                Email: {schoolProfile?.officialEmail || 'info@becohtech.edu.ng'} • Phone: {schoolProfile?.officialPhone || '+234 907 578 9045, +234 907 451 7476'} • Web: {schoolProfile?.websiteUrl || 'www.becohtech.edu.ng'}
              </p>
              <div className="mt-2 text-[10px] font-bold text-[#0F7640] uppercase tracking-widest bg-emerald-50 px-3 py-0.5 rounded-[4px] border border-emerald-200">
                Office of the Registrar • Admissions Board
              </div>
            </div>

            {/* Letter Metadata */}
            <div className="flex justify-between items-start text-xs pt-1">
              <div>
                <p className="text-slate-500">Ref: <span className="font-bold text-slate-900">BCHT/ADM/2026/{letterCandidate.applicationNumber.replace('APP/2026/', '')}</span></p>
                <p className="text-slate-500 mt-0.5">Date: <span className="font-semibold text-slate-800">02 November 2026</span></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Matriculation Allocation</span>
                <span className="font-extrabold text-sm text-[#0F7640]">{letterCandidate.matricNumber || 'CHE/2026/0014'}</span>
              </div>
            </div>

            {/* Candidate Address Block */}
            <div className="space-y-0.5 pt-1">
              <p className="font-bold text-slate-900">{letterCandidate.fullName}</p>
              <p className="text-slate-600">Application Number: {letterCandidate.applicationNumber}</p>
              <p className="text-slate-600">State of Origin: {letterCandidate.stateOfOrigin} State, Nigeria</p>
            </div>

            {/* Subject */}
            <div className="pt-2">
              <p className="font-extrabold text-slate-900 underline uppercase tracking-wide text-center">
                OFFER OF PROVISIONAL ADMISSION FOR {schoolProfile?.activeSession || '2026/2027'} ACADEMIC SESSION
              </p>
            </div>

            {/* Body Text */}
            <div className="space-y-2 text-justify leading-relaxed text-slate-700">
              <p>
                I am pleased to inform you that following your satisfactory performance in the College Entrance & Screening Examination and verification of your O'Level qualifications, the Academic Board of Bethsaida College of Health Technology has offered you provisional admission into the:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-center my-2">
                <p className="font-extrabold text-slate-900 text-sm">{letterCandidate.programme}</p>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Regulated by {letterCandidate.regulatoryBody}
                </span>
              </div>
              <p>
                This offer is subject to your acceptance of the terms and conditions governing admission into Bethsaida College of Health Technology, including:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                <li>Payment of the non-refundable Acceptance Fee of <strong>₦25,000 (Twenty-Five Thousand Naira)</strong> within two (2) weeks of this publication.</li>
                <li>Presentation of original certificates of WAEC, NECO, or NABTEB for formal physical verification at the Academic Registry.</li>
                <li>Submission of a Medical Fitness Certificate issued by the College Health Directorate.</li>
                <li>Strict adherence to the professional ethics and disciplinary codes of Bethsaida College.</li>
              </ol>
              <p>
                Congratulations on your admission into the healthcare training community.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
              <div>
                <div className="w-28 border-b border-slate-400 mb-1" />
                <p className="font-bold text-slate-900">Mrs. A. Adeleke</p>
                <p className="text-[11px] text-slate-500">Registrar & Secretary to Academic Board</p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 border-2 border-dashed border-emerald-400/60 rounded-[4px] flex items-center justify-center text-[9px] text-emerald-800 font-bold uppercase text-center p-1">
                  OFFICIAL {schoolProfile?.institutionAcronym || 'BCHT'} SEAL
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 4: Batch Screening Cut-Off Evaluator ─── */}
      <Modal
        isOpen={isBatchScreenOpen}
        onClose={() => setIsBatchScreenOpen(false)}
        title="Batch Screening Evaluator"
        description="Automated cut-off score evaluator for 2026/2027 applicant screening queue."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsBatchScreenOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleBatchScreen}>
              Execute Screening
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <Input
            label="Minimum CBT Cut-Off Mark (%)"
            type="number"
            value={batchCutoffScore}
            onChange={(e) => setBatchCutoffScore(e.target.value)}
            helperText="Candidates scoring at or above this mark with verified O'Levels will be marked as SCREENED."
          />
          <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Criteria Applied:</p>
            <p>• CBT Score ≥ {batchCutoffScore}%</p>
            <p>• Minimum 5 O'Level Credit passes in WAEC/NECO</p>
            <p>• Candidate current status must be APPLIED</p>
          </div>
        </div>
      </Modal>
      {/* ─── MODAL 5: Edit Candidate Application ─── */}
      {editingCandidate && (
        <Modal
          isOpen={isEditCandidateOpen}
          onClose={() => setIsEditCandidateOpen(false)}
          title={`Edit ${editingCandidate.fullName}`}
          description="Update applicant contact details, exam scores, and department choice."
          size="md"
        >
          <form onSubmit={handleUpdateCandidate} className="space-y-3.5 text-xs">
            <Input
              label="Candidate Full Name"
              value={editingCandidate.fullName}
              onChange={(e) => setEditingCandidate({ ...editingCandidate, fullName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                value={editingCandidate.email}
                onChange={(e) => setEditingCandidate({ ...editingCandidate, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={editingCandidate.phone}
                onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="State of Origin"
                value={editingCandidate.stateOfOrigin || ''}
                onChange={(e) => setEditingCandidate({ ...editingCandidate, stateOfOrigin: e.target.value })}
              />
              <Select
                label="Programme Department"
                options={departments.map((d) => ({ value: d.name, label: d.name }))}
                value={editingCandidate.department}
                onChange={(val) => setEditingCandidate({ ...editingCandidate, department: val })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="UTME / JAMB Score"
                type="number"
                value={String(editingCandidate.utmeScore || 0)}
                onChange={(e) => setEditingCandidate({ ...editingCandidate, utmeScore: parseInt(e.target.value, 10) || 0 })}
              />
              <Input
                label="Screening CBT Score (%)"
                type="number"
                value={String(editingCandidate.cbtScore || 0)}
                onChange={(e) => setEditingCandidate({ ...editingCandidate, cbtScore: parseInt(e.target.value, 10) || 0 })}
              />
              <Select
                label="Admission Status"
                options={[
                  { value: 'APPLIED', label: 'Applied' },
                  { value: 'SCREENED', label: 'Screened' },
                  { value: 'ADMITTED', label: 'Admitted' },
                  { value: 'ENROLLED', label: 'Enrolled' },
                ]}
                value={editingCandidate.status}
                onChange={(val: any) => setEditingCandidate({ ...editingCandidate, status: val })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditCandidateOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 6: Delete Candidate Confirmation ─── */}
      {deleteCandidateTarget && (
        <Modal
          isOpen={isDeleteCandidateOpen}
          onClose={() => setIsDeleteCandidateOpen(false)}
          title="Delete Application"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to delete the application record for{' '}
              <strong className="text-slate-900">{deleteCandidateTarget.fullName}</strong> ({deleteCandidateTarget.applicationNumber})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteCandidateOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteCandidate}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 7: Supplementary Admission List (Batch 2) Publication ─── */}
      <Modal
        isOpen={isBatch2ModalOpen}
        onClose={() => setIsBatch2ModalOpen(false)}
        title="Publish Supplementary Admission List (Batch 2)"
        description="Approve and publish Batch 2 admission offers for all qualified SCREENED applicants."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button size="sm" variant="secondary" onClick={() => setIsBatch2ModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const screenedList = candidates.filter((c) => c.status === 'SCREENED');
                screenedList.forEach((c, idx) => {
                  const serial = 50 + idx;
                  const matric = `${c.programmeCode}/2026/00${serial}`;
                  admitCandidate(c.id, matric, 'Supplementary List (Batch 2)');
                });
                recordAudit('BATCH_2_ADMISSION_PUBLISHED', 'ADM_LIST', 'BATCH_2', { count: screenedList.length });
                setIsBatch2ModalOpen(false);
                showToast({
                  type: 'success',
                  title: 'Supplementary List (Batch 2) Published',
                  message:
                    screenedList.length > 0
                      ? `${screenedList.length} screened candidate(s) have been granted admission under Batch 2.`
                      : 'Supplementary List Batch 2 approved and published.',
                });
              }}
            >
              Confirm &amp; Publish Batch 2
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-700 font-sans">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-emerald-900">
            <strong>Batch 2 Senate Action:</strong> Publishing this list automatically assigns provisional matriculation
            numbers and generates admission letters for all candidates currently in <strong>SCREENED</strong> status.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
            <div className="flex justify-between">
              <span>Candidates Ready in SCREENED Queue:</span>
              <strong className="text-slate-900">{candidates.filter((c) => c.status === 'SCREENED').length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Minimum Entrance CBT Cut-Off:</span>
              <strong className="text-[#0F7640]">{schoolProfile?.minimumCutoffScore || 50}%</strong>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 8: Live Admission Entrance CBT Screening Simulator ─── */}
      <Modal
        isOpen={Boolean(cbtCandidate)}
        onClose={() => setCbtCandidate(null)}
        title={cbtCandidate ? `Admission Entrance CBT — ${cbtCandidate.fullName} (${cbtCandidate.applicationNumber})` : 'Admission Entrance CBT'}
        description="Official College Entrance Screening Examination (Biology, Chemistry, Physics, English & Health Aptitude)."
        size="lg"
      >
        {cbtCandidate && (
          <div className="space-y-4 text-xs text-slate-800 font-sans select-none">
            {cbtSubmittedScore === null ? (
              <>
                <div className="p-3 bg-slate-900 text-white rounded-[4px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#0F7640] rounded-[4px] font-bold">
                      {cbtCandidate.programmeCode} ENTRANCE CBT
                    </span>
                    <span className="text-slate-300">
                      Question {cbtQuestionIdx + 1} of {ADMISSION_ENTRANCE_QUESTIONS.length}
                    </span>
                  </div>
                  <span className="text-amber-300 font-bold">
                    Subject: {ADMISSION_ENTRANCE_QUESTIONS[cbtQuestionIdx].subject}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {ADMISSION_ENTRANCE_QUESTIONS.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCbtQuestionIdx(idx)}
                      className={`w-7 h-7 rounded-[4px] border text-xs font-bold ${
                        idx === cbtQuestionIdx
                          ? 'bg-[#0F7640] text-white border-[#0F7640]'
                          : cbtAnswers[idx]
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-[4px] space-y-3">
                  <p className="font-bold text-slate-900 text-sm leading-relaxed">
                    {ADMISSION_ENTRANCE_QUESTIONS[cbtQuestionIdx].question}
                  </p>
                  <div className="space-y-2">
                    {ADMISSION_ENTRANCE_QUESTIONS[cbtQuestionIdx].options.map((opt) => {
                      const isSel = cbtAnswers[cbtQuestionIdx] === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setCbtAnswers((prev) => ({ ...prev, [cbtQuestionIdx]: opt.id }))}
                          className={`p-3 rounded-[4px] border cursor-pointer flex items-center gap-3 ${
                            isSel
                              ? 'bg-emerald-50 border-[#0F7640] text-slate-900 font-semibold'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-[4px] flex items-center justify-center font-bold ${
                              isSel ? 'bg-[#0F7640] text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={cbtQuestionIdx === 0}
                    onClick={() => setCbtQuestionIdx((i) => Math.max(0, i - 1))}
                  >
                    Previous
                  </Button>
                  {cbtQuestionIdx < ADMISSION_ENTRANCE_QUESTIONS.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setCbtQuestionIdx((i) => Math.min(ADMISSION_ENTRANCE_QUESTIONS.length - 1, i + 1))}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleSubmitAdmissionCbt} className="bg-[#0F7640] hover:bg-[#093322]">
                      Submit Entrance CBT
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 mx-auto rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Entrance Screening CBT Completed</h3>
                  <p className="text-slate-500 mt-0.5">
                    Candidate: <strong>{cbtCandidate.fullName}</strong> ({cbtCandidate.applicationNumber})
                  </p>
                </div>
                <div className="max-w-xs mx-auto p-4 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Recorded Entrance CBT Score</span>
                  <span className="text-2xl font-extrabold text-[#0F7640]">{cbtSubmittedScore}%</span>
                </div>
                <Badge variant={cbtSubmittedScore >= (schoolProfile?.minimumCutoffScore || 50) ? 'success' : 'danger'}>
                  {cbtSubmittedScore >= (schoolProfile?.minimumCutoffScore || 50)
                    ? 'QUALIFIED & MOVED TO SCREENED'
                    : 'BELOW CUT-OFF MARK'}
                </Badge>
                <div className="pt-3 border-t border-slate-200 flex justify-center">
                  <Button size="sm" onClick={() => setCbtCandidate(null)}>
                    Return to Screening Queue
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
