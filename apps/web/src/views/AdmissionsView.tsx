import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
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
} from 'lucide-react';

interface OLevelSubject {
  subject: string;
  grade: string;
}

interface Candidate {
  id: string;
  applicationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Female' | 'Male';
  stateOfOrigin: string;
  lga: string;
  programmeCode: string;
  programme: string;
  department: string;
  regulatoryBody: string;
  olevelExamBody: 'WAEC' | 'NECO' | 'NABTEB';
  olevelExamYear: string;
  olevelStatus: 'VERIFIED' | 'PENDING' | 'DEFICIENT';
  olevelSubjects: OLevelSubject[];
  cbtScore: number;
  cbtDate: string;
  status: 'APPLIED' | 'SCREENED' | 'ADMITTED' | 'ENROLLED';
  admissionListBatch?: 'Merit List (Batch 1)' | 'Supplementary (Batch 2)';
  matricNumber?: string;
  acceptanceFeePaid: boolean;
  acceptanceFeeRef?: string;
  admittedAt?: string;
}

export const AdmissionsView: React.FC = () => {
  const { recordAudit, isDense } = useApp();
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
  const [batchCutoffScore, setBatchCutoffScore] = useState('50');

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
  });

  // Master Candidates Registry
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 'app-01',
      applicationNumber: 'APP/2026/0142',
      fullName: 'Amina Yusuf',
      email: 'amina.yusuf@gmail.com',
      phone: '+234 803 445 1190',
      gender: 'Female',
      stateOfOrigin: 'Oyo',
      lga: 'Ibadan North',
      programmeCode: 'CHEW',
      programme: 'Community Health Extension Worker (CHEW)',
      department: 'Department of Community Health',
      regulatoryBody: 'CHPRBN',
      olevelExamBody: 'WAEC',
      olevelExamYear: '2025',
      olevelStatus: 'VERIFIED',
      olevelSubjects: [
        { subject: 'English Language', grade: 'B3' },
        { subject: 'Mathematics', grade: 'C4' },
        { subject: 'Biology', grade: 'B2' },
        { subject: 'Chemistry', grade: 'B3' },
        { subject: 'Physics', grade: 'C5' },
      ],
      cbtScore: 78,
      cbtDate: '2026-10-18',
      status: 'SCREENED',
      acceptanceFeePaid: false,
    },
    {
      id: 'app-02',
      applicationNumber: 'APP/2026/0143',
      fullName: 'David Adeleke',
      email: 'david.adeleke@yahoo.com',
      phone: '+234 802 771 8820',
      gender: 'Male',
      stateOfOrigin: 'Osun',
      lga: 'Ede South',
      programmeCode: 'MLT',
      programme: 'Medical Laboratory Technician (MLT)',
      department: 'Department of Medical Laboratory Technology',
      regulatoryBody: 'MLSCN',
      olevelExamBody: 'WAEC',
      olevelExamYear: '2025',
      olevelStatus: 'VERIFIED',
      olevelSubjects: [
        { subject: 'English Language', grade: 'B2' },
        { subject: 'Mathematics', grade: 'B3' },
        { subject: 'Biology', grade: 'A1' },
        { subject: 'Chemistry', grade: 'B2' },
        { subject: 'Physics', grade: 'B3' },
      ],
      cbtScore: 82,
      cbtDate: '2026-10-18',
      status: 'SCREENED',
      acceptanceFeePaid: false,
    },
    {
      id: 'app-03',
      applicationNumber: 'APP/2026/0144',
      fullName: 'Zainab Bello',
      email: 'zainab.bello@outlook.com',
      phone: '+234 805 119 4432',
      gender: 'Female',
      stateOfOrigin: 'Oyo',
      lga: 'Oyo West',
      programmeCode: 'PHT',
      programme: 'Pharmacy Technician',
      department: 'Department of Pharmacy Technician Studies',
      regulatoryBody: 'PCN',
      olevelExamBody: 'NECO',
      olevelExamYear: '2024',
      olevelStatus: 'VERIFIED',
      olevelSubjects: [
        { subject: 'English Language', grade: 'C4' },
        { subject: 'Mathematics', grade: 'C5' },
        { subject: 'Biology', grade: 'B3' },
        { subject: 'Chemistry', grade: 'B3' },
        { subject: 'Physics', grade: 'C4' },
      ],
      cbtScore: 71,
      cbtDate: '2026-10-19',
      status: 'ADMITTED',
      admissionListBatch: 'Merit List (Batch 1)',
      matricNumber: 'PHT/2026/0018',
      acceptanceFeePaid: true,
      acceptanceFeeRef: 'REC-ACC-2026-0041',
      admittedAt: '2026-11-04',
    },
    {
      id: 'app-04',
      applicationNumber: 'APP/2026/0145',
      fullName: 'Sunday Okon',
      email: 'sunday.okon@gmail.com',
      phone: '+234 807 551 2004',
      gender: 'Male',
      stateOfOrigin: 'Akwa Ibom',
      lga: 'Uyo',
      programmeCode: 'HIM',
      programme: 'Health Information Management (HIM)',
      department: 'Department of Health Information Management',
      regulatoryBody: 'HRORBN',
      olevelExamBody: 'WAEC',
      olevelExamYear: '2025',
      olevelStatus: 'PENDING',
      olevelSubjects: [
        { subject: 'English Language', grade: 'C5' },
        { subject: 'Mathematics', grade: 'D7' },
        { subject: 'Biology', grade: 'C4' },
        { subject: 'Chemistry', grade: 'C6' },
        { subject: 'Physics', grade: 'P8' },
      ],
      cbtScore: 54,
      cbtDate: '2026-10-19',
      status: 'APPLIED',
      acceptanceFeePaid: false,
    },
    {
      id: 'app-05',
      applicationNumber: 'APP/2026/0146',
      fullName: 'Blessing Chukwuma',
      email: 'blessing.c@gmail.com',
      phone: '+234 813 902 3341',
      gender: 'Female',
      stateOfOrigin: 'Delta',
      lga: 'Aniocha South',
      programmeCode: 'CHEW',
      programme: 'Community Health Extension Worker (CHEW)',
      department: 'Department of Community Health',
      regulatoryBody: 'CHPRBN',
      olevelExamBody: 'WAEC',
      olevelExamYear: '2025',
      olevelStatus: 'VERIFIED',
      olevelSubjects: [
        { subject: 'English Language', grade: 'B3' },
        { subject: 'Mathematics', grade: 'B2' },
        { subject: 'Biology', grade: 'A1' },
        { subject: 'Chemistry', grade: 'B3' },
        { subject: 'Physics', grade: 'C4' },
      ],
      cbtScore: 88,
      cbtDate: '2026-10-20',
      status: 'ENROLLED',
      admissionListBatch: 'Merit List (Batch 1)',
      matricNumber: 'CHE/2026/0014',
      acceptanceFeePaid: true,
      acceptanceFeeRef: 'REC-ACC-2026-0014',
      admittedAt: '2026-11-02',
    },
    {
      id: 'app-06',
      applicationNumber: 'APP/2026/0147',
      fullName: 'Fatima Ibrahim',
      email: 'fatima.ibrahim@yahoo.com',
      phone: '+234 809 332 9988',
      gender: 'Female',
      stateOfOrigin: 'Kogi',
      lga: 'Lokoja',
      programmeCode: 'EHT',
      programme: 'Environmental Health Technology (EHT)',
      department: 'Department of Environmental Health Sciences',
      regulatoryBody: 'EHORECON',
      olevelExamBody: 'WAEC',
      olevelExamYear: '2024',
      olevelStatus: 'VERIFIED',
      olevelSubjects: [
        { subject: 'English Language', grade: 'C4' },
        { subject: 'Mathematics', grade: 'C4' },
        { subject: 'Biology', grade: 'B3' },
        { subject: 'Chemistry', grade: 'C5' },
        { subject: 'Physics', grade: 'C5' },
      ],
      cbtScore: 68,
      cbtDate: '2026-10-20',
      status: 'SCREENED',
      acceptanceFeePaid: false,
    },
    {
      id: 'app-07',
      applicationNumber: 'APP/2026/0148',
      fullName: 'Oluwaseun Balogun',
      email: 'seun.balogun@gmail.com',
      phone: '+234 816 772 1102',
      gender: 'Male',
      stateOfOrigin: 'Oyo',
      lga: 'Ogbomoso North',
      programmeCode: 'MLT',
      programme: 'Medical Laboratory Technician (MLT)',
      department: 'Department of Medical Laboratory Technology',
      regulatoryBody: 'MLSCN',
      olevelExamBody: 'WAEC',
      olevelExamYear: '2025',
      olevelStatus: 'VERIFIED',
      olevelSubjects: [
        { subject: 'English Language', grade: 'B2' },
        { subject: 'Mathematics', grade: 'B2' },
        { subject: 'Biology', grade: 'A1' },
        { subject: 'Chemistry', grade: 'B2' },
        { subject: 'Physics', grade: 'B3' },
      ],
      cbtScore: 84,
      cbtDate: '2026-10-21',
      status: 'ADMITTED',
      admissionListBatch: 'Merit List (Batch 1)',
      matricNumber: 'MLT/2026/0022',
      acceptanceFeePaid: true,
      acceptanceFeeRef: 'REC-ACC-2026-0055',
      admittedAt: '2026-11-05',
    },
  ]);

  // Handle Granting Admission to Individual Candidate
  const handleAdmitCandidate = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const serial = Math.floor(10 + Math.random() * 89);
          const matricNumber = `${c.programmeCode}/2026/00${serial}`;
          recordAudit('CANDIDATE_ADMITTED', 'ADM_CANDIDATE', c.applicationNumber, { matricNumber });
          return {
            ...c,
            status: 'ADMITTED',
            matricNumber,
            admissionListBatch: 'Merit List (Batch 1)',
            admittedAt: new Date().toISOString().split('T')[0],
          };
        }
        return c;
      })
    );

    const admittedCandidate = candidates.find((c) => c.id === candidateId);
    showToast({
      type: 'success',
      title: 'Admission Granted',
      message: `Provisional admission granted to ${admittedCandidate?.fullName}. Acceptance letter issued.`,
    });
  };

  // Handle Batch Screening Qualify
  const handleBatchScreen = () => {
    const threshold = parseInt(batchCutoffScore) || 50;
    let qualifiedCount = 0;

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.status === 'APPLIED' && c.cbtScore >= threshold && c.olevelStatus === 'VERIFIED') {
          qualifiedCount++;
          return { ...c, status: 'SCREENED' };
        }
        return c;
      })
    );

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

    const progMap: Record<string, { name: string; dept: string; board: string }> = {
      CHEW: { name: 'Community Health Extension Worker (CHEW)', dept: 'Department of Community Health', board: 'CHPRBN' },
      JCHEW: { name: 'Junior Community Health Extension Worker (JCHEW)', dept: 'Department of Community Health', board: 'CHPRBN' },
      MLT: { name: 'Medical Laboratory Technician (MLT)', dept: 'Department of Medical Laboratory Technology', board: 'MLSCN' },
      MLA: { name: 'Medical Laboratory Assistant (MLA)', dept: 'Department of Medical Laboratory Technology', board: 'MLSCN' },
      PHT: { name: 'Pharmacy Technician', dept: 'Department of Pharmacy Technician Studies', board: 'PCN' },
      HIM: { name: 'Health Information Management (HIM)', dept: 'Department of Health Information Management', board: 'HRORBN' },
      EHT: { name: 'Environmental Health Technology (EHT)', dept: 'Department of Environmental Health Sciences', board: 'EHORECON' },
    };

    const progInfo = progMap[newAppForm.programmeCode] || progMap.CHEW;

    const newCandidate: Candidate = {
      id: `app-${Date.now().toString().slice(-4)}`,
      applicationNumber: appNumber,
      fullName: newAppForm.fullName,
      email: newAppForm.email,
      phone: newAppForm.phone,
      gender: newAppForm.gender as 'Female' | 'Male',
      stateOfOrigin: newAppForm.stateOfOrigin,
      lga: 'Central',
      programmeCode: newAppForm.programmeCode,
      programme: progInfo.name,
      department: progInfo.dept,
      regulatoryBody: progInfo.board,
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
      cbtScore: parseInt(newAppForm.cbtScore) || 70,
      cbtDate: new Date().toISOString().split('T')[0],
      status: parseInt(newAppForm.cbtScore) >= 50 ? 'SCREENED' : 'APPLIED',
      acceptanceFeePaid: false,
    };

    setCandidates((prev) => [newCandidate, ...prev]);
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
        <div className="whitespace-nowrap">
          <p className="font-bold text-slate-900">{c.fullName}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {c.gender} • {c.stateOfOrigin} State • {c.phone}
          </span>
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
            View Dossier
          </Button>
          {c.status === 'SCREENED' && (
            <Button size="sm" onClick={() => handleAdmitCandidate(c.id)}>
              Grant Admission
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
            <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-600 font-sans tracking-tight">
              {candidates.filter((c) => c.status === 'ADMITTED' || c.status === 'ENROLLED').length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-blue-700 font-semibold">Offers published</span>
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

      {/* Institutional Nav Tabs */}
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
                    { value: 'CHEW', label: 'CHEW (Community Health)' },
                    { value: 'MLT', label: 'MLT (Medical Lab)' },
                    { value: 'PHT', label: 'PHT (Pharmacy Tech)' },
                    { value: 'HIM', label: 'HIM (Health Records)' },
                    { value: 'EHT', label: 'EHT (Environmental)' },
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
                2026/2027 Statutory Screening Benchmark: 50% Cut-Off
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Eligible candidates must achieve at least 50% in CBT screening and present 5 credit passes in WAEC/NECO (Eng, Maths, Bio, Chem, Phys).
              </p>
            </div>
            <Button
              size="sm"
              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
              onClick={() => setIsBatchScreenOpen(true)}
            >
              Evaluate Cut-Off Mark
            </Button>
          </div>

          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="font-bold text-slate-900">Screening Evaluation & Subject Verification</span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  {candidates.filter((c) => c.cbtScore >= 50).length} candidates met threshold
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
                    <div className="whitespace-nowrap">
                      <p className="font-bold text-slate-900">{c.fullName}</p>
                      <span className="text-[11px] text-slate-500">{c.programmeCode} • {c.stateOfOrigin} State</span>
                    </div>
                  ),
                },
                {
                  key: 'cbtScore',
                  header: 'CBT Result',
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
                      {c.status === 'APPLIED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setCandidates((prev) =>
                              prev.map((item) =>
                                item.id === c.id ? { ...item, status: 'SCREENED' } : item
                              )
                            );
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
                    onClick={() =>
                      showToast({
                        type: 'info',
                        title: 'List Exported',
                        message: 'Merit Admission List Batch 1 exported to official signed spreadsheet.',
                      })
                    }
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
                  <span>Quota Availability: 84 Remaining</span>
                  <Button
                    size="sm"
                    onClick={() =>
                      showToast({
                        type: 'success',
                        title: 'Supplementary List Approved',
                        message: 'Batch 2 Supplementary Admission List submitted to Provost for signing.',
                      })
                    }
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
                    <div className="whitespace-nowrap">
                      <p className="font-bold text-slate-900">{c.fullName}</p>
                      <span className="text-[11px] text-slate-500">{c.applicationNumber}</span>
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
                  <div className="whitespace-nowrap">
                    <p className="font-bold text-slate-900">{c.fullName}</p>
                    <span className="text-[11px] text-slate-500">{c.email} • {c.phone}</span>
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
                    onClick={() =>
                      showToast({
                        type: 'info',
                        title: 'Student Dossier',
                        message: `Opening academic SIS record for ${c.matricNumber}.`,
                      })
                    }
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
                    {selectedCandidate.olevelSubjects.map((s, idx) => (
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
            options={[
              { value: 'CHEW', label: 'Community Health Extension Worker (CHEW)' },
              { value: 'JCHEW', label: 'Junior Community Health Extension Worker (JCHEW)' },
              { value: 'MLT', label: 'Medical Laboratory Technician (MLT)' },
              { value: 'MLA', label: 'Medical Laboratory Assistant (MLA)' },
              { value: 'PHT', label: 'Pharmacy Technician (PHT)' },
              { value: 'HIM', label: 'Health Information Management (HIM)' },
              { value: 'EHT', label: 'Environmental Health Technology (EHT)' },
            ]}
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
              Reference: BCHT/ADM/2026/{letterCandidate?.applicationNumber.replace('APP/2026/', '')}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
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
              <div className="w-12 h-12 bg-[#0F7640] text-white font-extrabold text-sm rounded-[4px] flex items-center justify-center mb-2">
                BCHT
              </div>
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                Bethsaida College of Health Technology
              </h2>
              <p className="text-[11px] text-slate-600">
                KM 4, Old Oyo Road, Moniya, Ibadan, Oyo State, Nigeria
              </p>
              <p className="text-[10px] text-slate-500">
                Email: admissions@bethsaida.edu.ng • Phone: +234 803 124 5590 • Web: www.bethsaida.edu.ng
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
                OFFER OF PROVISIONAL ADMISSION FOR 2026/2027 ACADEMIC SESSION
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
                  OFFICIAL BCHT SEAL
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
    </div>
  );
};
