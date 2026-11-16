import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Table,
  Badge,
  Tabs,
  useToast,
  Modal,
  Select,
} from '@campusone/ui';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  CreditCard,
  GraduationCap,
  Activity,
  Printer,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  PieChart,
  FileText,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatNaira } from '@campusone/contracts';

/* ─── TYPE DEFINITIONS ─── */
export interface DepartmentPassRate {
  id: string;
  departmentCode: string;
  departmentName: string;
  accreditingCouncil: string;
  candidatesExamined: number;
  candidatesPassed: number;
  passRatePct: number;
  distinctionCount: number;
  creditCount: number;
  passCount: number;
  failCount: number;
  councilRating: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'SATISFACTORY';
}

export interface FeeRecoveryCohort {
  id: string;
  level: string;
  enrolledStudents: number;
  totalBilledKobo: number;
  totalCollectedKobo: number;
  outstandingKobo: number;
  recoveryRatePct: number;
  debtorsCount: number;
  paymentGatewayShare: string;
}

export interface HospitalCompliance {
  id: string;
  hospitalName: string;
  hospitalType: string;
  accreditedSlots: number;
  postedTrainees: number;
  logbookCompletionPct: number;
  clinicalAttendancePct: number;
  preceptorEvaluation: string;
  status: 'EXEMPLARY' | 'HIGH_COMPLIANCE' | 'COMPLIANT';
}

export const AnalyticsView: React.FC = () => {
  const { isDense, schoolProfile } = useApp();
  const { showToast } = useToast();
  const { tab: routeTab } = useParams();
  const navigate = useNavigate();

  // Industry-standard page routing
  const activeTab =
    routeTab === 'fees'
      ? 'financial'
      : routeTab === 'enrollment' || !routeTab
      ? 'enrollment'
      : routeTab;

  const handleTabChange = (tabId: string) => {
    if (tabId === 'enrollment') {
      navigate('/analytics');
    } else if (tabId === 'financial') {
      navigate('/analytics/fees');
    } else {
      navigate(`/analytics/${tabId}`);
    }
  };

  /* ─── MODAL STATES ─── */
  const [isExecutiveReportModalOpen, setIsExecutiveReportModalOpen] = useState(false);

  /* ─── SEARCH & FILTER STATES ─── */
  const [academicSearch, setAcademicSearch] = useState('');
  const [councilFilter, setCouncilFilter] = useState('ALL');
  const [hospitalSearch, setHospitalSearch] = useState('');

  /* ─── DATA: DEPARTMENTAL ACADEMIC & COUNCIL PASS RATES ─── */
  const [academicData] = useState<DepartmentPassRate[]>([
    {
      id: 'apr-01',
      departmentCode: 'CHE',
      departmentName: 'Department of Community Health (CHEW)',
      accreditingCouncil: 'CHPRBN (Community Health Practitioners)',
      candidatesExamined: 480,
      candidatesPassed: 438,
      passRatePct: 91.2,
      distinctionCount: 84,
      creditCount: 290,
      passCount: 64,
      failCount: 42,
      councilRating: 'EXCELLENT',
    },
    {
      id: 'apr-02',
      departmentCode: 'MLT',
      departmentName: 'Department of Medical Laboratory Technology',
      accreditingCouncil: 'MLSCN (Medical Laboratory Science Council)',
      candidatesExamined: 320,
      candidatesPassed: 283,
      passRatePct: 88.5,
      distinctionCount: 52,
      creditCount: 185,
      passCount: 46,
      failCount: 37,
      councilRating: 'VERY_GOOD',
    },
    {
      id: 'apr-03',
      departmentCode: 'PHT',
      departmentName: 'Department of Pharmacy Technician Studies',
      accreditingCouncil: 'PCN (Pharmacy Council of Nigeria)',
      candidatesExamined: 260,
      candidatesPassed: 221,
      passRatePct: 85.0,
      distinctionCount: 38,
      creditCount: 142,
      passCount: 41,
      failCount: 39,
      councilRating: 'GOOD',
    },
    {
      id: 'apr-04',
      departmentCode: 'HIM',
      departmentName: 'Department of Health Information Management',
      accreditingCouncil: 'HRORBN (Health Records Officers Board)',
      candidatesExamined: 120,
      candidatesPassed: 112,
      passRatePct: 93.3,
      distinctionCount: 26,
      creditCount: 74,
      passCount: 12,
      failCount: 8,
      councilRating: 'EXCELLENT',
    },
    {
      id: 'apr-05',
      departmentCode: 'EHT',
      departmentName: 'Department of Environmental Health Sciences',
      accreditingCouncil: 'EHORECON (Environmental Health Officers)',
      candidatesExamined: 68,
      candidatesPassed: 56,
      passRatePct: 82.4,
      distinctionCount: 9,
      creditCount: 34,
      passCount: 13,
      failCount: 12,
      councilRating: 'SATISFACTORY',
    },
  ]);

  /* ─── DATA: TUITION RECOVERY EFFICIENCY ─── */
  const [feeRecoveryData] = useState<FeeRecoveryCohort[]>([
    {
      id: 'frc-01',
      level: '100 Level (Freshers)',
      enrolledStudents: 492,
      totalBilledKobo: 4520000000,
      totalCollectedKobo: 3842000000,
      outstandingKobo: 678000000,
      recoveryRatePct: 85.0,
      debtorsCount: 38,
      paymentGatewayShare: '62% Paystack • 38% Remita',
    },
    {
      id: 'frc-02',
      level: '200 Level (Clinical Rotations)',
      enrolledStudents: 440,
      totalBilledKobo: 3860000000,
      totalCollectedKobo: 2950000000,
      outstandingKobo: 910000000,
      recoveryRatePct: 76.4,
      debtorsCount: 54,
      paymentGatewayShare: '51% Paystack • 49% Remita',
    },
    {
      id: 'frc-03',
      level: '300 Level (Final Year Board Candidates)',
      enrolledStudents: 316,
      totalBilledKobo: 3020000000,
      totalCollectedKobo: 1633000000,
      outstandingKobo: 1387000000,
      recoveryRatePct: 54.1,
      debtorsCount: 50,
      paymentGatewayShare: '48% Paystack • 52% Remita',
    },
  ]);

  /* ─── DATA: CLINICAL HOSPITAL ROTATION COMPLIANCE ─── */
  const [hospitalData] = useState<HospitalCompliance[]>([
    {
      id: 'hsp-01',
      hospitalName: 'State Specialist Hospital Moniya',
      hospitalType: 'Zonal Teaching & Specialist Hospital',
      accreditedSlots: 200,
      postedTrainees: 180,
      logbookCompletionPct: 98.4,
      clinicalAttendancePct: 97.2,
      preceptorEvaluation: 'Exemplary Clinical Skills (4.9 / 5.0)',
      status: 'EXEMPLARY',
    },
    {
      id: 'hsp-02',
      hospitalName: 'General Hospital Asaba',
      hospitalType: 'Public Secondary Healthcare Facility',
      accreditedSlots: 240,
      postedTrainees: 220,
      logbookCompletionPct: 98.2,
      clinicalAttendancePct: 96.5,
      preceptorEvaluation: 'High Procedural Competence (4.8 / 5.0)',
      status: 'EXEMPLARY',
    },
    {
      id: 'hsp-03',
      hospitalName: 'Adeoyo Maternity Teaching Hospital',
      hospitalType: 'Maternal & Child Health Teaching Wing',
      accreditedSlots: 120,
      postedTrainees: 100,
      logbookCompletionPct: 96.0,
      clinicalAttendancePct: 95.8,
      preceptorEvaluation: 'Strong Obstetric Palpation Skills (4.7 / 5.0)',
      status: 'HIGH_COMPLIANCE',
    },
    {
      id: 'hsp-04',
      hospitalName: 'University College Hospital (UCH) Affiliate Wing',
      hospitalType: 'Tertiary Medical Center Diagnostic Labs',
      accreditedSlots: 150,
      postedTrainees: 140,
      logbookCompletionPct: 99.1,
      clinicalAttendancePct: 98.6,
      preceptorEvaluation: 'Outstanding Histopathology & Phlebotomy (4.95 / 5.0)',
      status: 'EXEMPLARY',
    },
  ]);

  /* ─── FILTERED DATA ─── */
  const filteredAcademic = academicData.filter((a) => {
    if (councilFilter !== 'ALL' && !a.accreditingCouncil.includes(councilFilter)) return false;
    if (academicSearch.trim()) {
      const q = academicSearch.toLowerCase();
      const matchName = a.departmentName.toLowerCase().includes(q);
      const matchCode = a.departmentCode.toLowerCase().includes(q);
      const matchCouncil = a.accreditingCouncil.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCouncil) return false;
    }
    return true;
  });

  const filteredHospitals = hospitalData.filter((h) => {
    if (hospitalSearch.trim()) {
      const q = hospitalSearch.toLowerCase();
      const matchName = h.hospitalName.toLowerCase().includes(q);
      const matchType = h.hospitalType.toLowerCase().includes(q);
      if (!matchName && !matchType) return false;
    }
    return true;
  });

  /* ─── TABLE COLUMNS: ACADEMIC PASS RATES ─── */
  const passRateColumns = [
    {
      key: 'department',
      header: 'Health Discipline & Council',
      render: (r: DepartmentPassRate) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.departmentName}</span>
          <span className="text-[11px] text-slate-500 font-medium">{r.accreditingCouncil}</span>
        </div>
      ),
    },
    {
      key: 'candidates',
      header: 'Examined / Passed',
      align: 'center' as const,
      nowrap: true,
      render: (r: DepartmentPassRate) => (
        <div>
          <span className="font-bold text-slate-900 text-xs font-sans">
            {r.candidatesPassed} / {r.candidatesExamined}
          </span>
          <span className="text-[10px] text-slate-400 block">Trainees Assessed</span>
        </div>
      ),
    },
    {
      key: 'passRate',
      header: 'Council Pass Rate (%)',
      align: 'center' as const,
      nowrap: true,
      render: (r: DepartmentPassRate) => (
        <div className="flex flex-col items-center">
          <span className="font-extrabold text-[#0F7640] text-sm font-sans">{r.passRatePct}%</span>
          <span className="text-[10px] text-[#13A348] font-bold">First Diet</span>
        </div>
      ),
    },
    {
      key: 'grades',
      header: 'Grade Distribution',
      render: (r: DepartmentPassRate) => (
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-sans">
          <span className="px-1.5 py-0.2 bg-emerald-50 text-[#0F7640] rounded-[4px] font-bold">
            {r.distinctionCount} Dist
          </span>
          <span className="px-1.5 py-0.2 bg-emerald-50 text-[#0F7640] rounded-[4px] font-bold">
            {r.creditCount} Cred
          </span>
          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-[4px] font-bold">
            {r.passCount} Pass
          </span>
          {r.failCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded-[4px] font-bold">
              {r.failCount} Resit
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Council Standing',
      align: 'center' as const,
      nowrap: true,
      render: (r: DepartmentPassRate) => (
        <Badge variant={r.councilRating === 'EXCELLENT' ? 'success' : 'primary'} size="sm">
          {r.councilRating.replace(/_/g, ' ')}
        </Badge>
      ),
    },
  ];

  /* ─── TABLE COLUMNS: FEE RECOVERY ─── */
  const feeRecoveryColumns = [
    {
      key: 'level',
      header: 'Student Cohort Level',
      render: (f: FeeRecoveryCohort) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{f.level}</span>
          <span className="text-[11px] text-slate-500 font-medium font-sans">
            {f.enrolledStudents} Enrolled Trainees • {f.debtorsCount} Outstanding
          </span>
        </div>
      ),
    },
    {
      key: 'billed',
      header: 'Total Session Billed',
      align: 'right' as const,
      nowrap: true,
      render: (f: FeeRecoveryCohort) => (
        <span className="font-semibold text-slate-800 font-sans text-xs">
          {formatNaira(f.totalBilledKobo)}
        </span>
      ),
    },
    {
      key: 'collected',
      header: 'Total Settled & Reconciled',
      align: 'right' as const,
      nowrap: true,
      render: (f: FeeRecoveryCohort) => (
        <span className="font-extrabold text-[#0F7640] font-sans text-xs">
          {formatNaira(f.totalCollectedKobo)}
        </span>
      ),
    },
    {
      key: 'outstanding',
      header: 'Outstanding Balance',
      align: 'right' as const,
      nowrap: true,
      render: (f: FeeRecoveryCohort) => (
        <span className="font-bold text-rose-600 font-sans text-xs">
          {formatNaira(f.outstandingKobo)}
        </span>
      ),
    },
    {
      key: 'recoveryRate',
      header: 'Collection Rate',
      align: 'center' as const,
      nowrap: true,
      render: (f: FeeRecoveryCohort) => (
        <Badge variant={f.recoveryRatePct >= 75 ? 'success' : 'warning'} size="sm">
          {f.recoveryRatePct}%
        </Badge>
      ),
    },
    {
      key: 'gateway',
      header: 'Channel Distribution',
      render: (f: FeeRecoveryCohort) => (
        <span className="text-[11px] text-slate-600 font-sans block">{f.paymentGatewayShare}</span>
      ),
    },
  ];

  /* ─── TABLE COLUMNS: CLINICAL COMPLIANCE ─── */
  const hospitalColumns = [
    {
      key: 'hospitalName',
      header: 'Accredited Hospital Partner',
      render: (h: HospitalCompliance) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{h.hospitalName}</span>
          <span className="text-[11px] text-slate-500 font-medium">{h.hospitalType}</span>
        </div>
      ),
    },
    {
      key: 'trainees',
      header: 'Placed Trainees',
      align: 'center' as const,
      nowrap: true,
      render: (h: HospitalCompliance) => (
        <span className="font-bold text-slate-900 font-sans text-xs">
          {h.postedTrainees} / {h.accreditedSlots} Slots
        </span>
      ),
    },
    {
      key: 'logbook',
      header: 'Logbook Verification',
      align: 'center' as const,
      nowrap: true,
      render: (h: HospitalCompliance) => (
        <div className="flex flex-col items-center">
          <span className="font-extrabold text-[#0F7640] text-xs font-sans">{h.logbookCompletionPct}%</span>
          <span className="text-[10px] text-slate-400">Preceptor Certified</span>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Clinical Attendance',
      align: 'center' as const,
      nowrap: true,
      render: (h: HospitalCompliance) => (
        <span className="font-bold text-slate-900 font-sans text-xs">{h.clinicalAttendancePct}%</span>
      ),
    },
    {
      key: 'evaluation',
      header: 'Hospital Assessment Rating',
      render: (h: HospitalCompliance) => (
        <span className="text-xs text-slate-700 font-semibold">{h.preceptorEvaluation}</span>
      ),
    },
    {
      key: 'status',
      header: 'Accreditation Status',
      align: 'center' as const,
      nowrap: true,
      render: (h: HospitalCompliance) => (
        <Badge variant={h.status === 'EXEMPLARY' ? 'success' : 'primary'} size="sm">
          {h.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── MODULE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">College Analytics & Performance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            College Intelligence • 3-Year Enrollment Trajectory • Tuition Recovery Efficiency • Council Qualifying Pass Rates
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
            onClick={() => setIsExecutiveReportModalOpen(true)}
            className="whitespace-nowrap text-xs"
          >
            Print Executive Report
          </Button>
          <Button
            size="sm"
            onClick={() => {
              showToast({
                type: 'success',
                title: 'Analytics Data Synchronized',
                message: 'All metrics compiled from Bursary, Examination Broadsheets, and Clinical registers.',
              });
            }}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="whitespace-nowrap text-xs bg-[#0F7640] hover:bg-[#093322]"
          >
            Export Comprehensive Dataset
          </Button>
        </div>
      </div>

      {/* ─── 4 CORE PERFORMANCE KPI CARDS (CLEAN VERTICAL STACKING, STRICT 4PX BORDER RADIUS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Student Retention Rate
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">94.8%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">+1.4% vs 2025</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Low attrition across cohorts</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tuition Recovery Rate
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0F7640] font-sans tracking-tight">74.0%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">₦84.25M Collected</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Target: ₦114M Session</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Board Qualifying Average
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">88.4%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">First Diet Pass</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">CHPRBN, MLSCN & PCN</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Clinical Posting Rate
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">96.2%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">100% Cleared</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">640 Trainees at 4 Hospitals</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <Tabs
        tabs={[
          { id: 'enrollment', label: 'Enrollment & Demographics' },
          { id: 'financial', label: 'Fee Recovery & Collections' },
          { id: 'academic', label: 'Academic & Board Pass Rates' },
          { id: 'clinical', label: 'Clinical Posting Compliance' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* ─── TAB 1: ENROLLMENT & DEMOGRAPHICS ─── */}
      {activeTab === 'enrollment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Multi-Session Enrollment Growth */}
            <Card
              header={
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  3-Year Multi-Session Enrollment Trajectory
                </span>
              }
            >
              <div className="space-y-4 pt-2 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-900">2026/2027 Session (Current)</span>
                    <span className="text-[#0F7640] font-bold font-sans">1,248 Students (+8.4% YoY)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-[3px] overflow-hidden">
                    <div className="h-full bg-[#0F7640] rounded-[3px] w-full" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">492 Freshers (100L) • 440 (200L) • 316 (300L)</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">2025/2026 Session</span>
                    <span className="text-slate-700 font-bold font-sans">1,151 Students (+12.0% YoY)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-[3px] overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-[3px] w-[92%]" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">Expansion of Pharmacy Tech track</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">2024/2025 Session</span>
                    <span className="text-slate-700 font-bold font-sans">1,028 Students</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-[3px] overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-[3px] w-[82%]" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">Initial NBTE multi-programme accreditation</span>
                </div>
              </div>
            </Card>

            {/* Trainee Demographics & Diversity */}
            <Card
              header={
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Gender & Regional Catchment Demographics
                </span>
              }
            >
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[4px] border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">Female Trainees</p>
                    <span className="text-slate-500 font-sans">724 Students enrolled</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-[#0F7640] block font-sans">58.0%</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Majority in CHEW & Pharmacy</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[4px] border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">Male Trainees</p>
                    <span className="text-slate-500 font-sans">524 Students enrolled</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-800 block font-sans">42.0%</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Strong in Med Lab & Env Health</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[4px] border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">Catchment Residency Ratio</p>
                    <span className="text-slate-500 font-sans">68% Oyo State Indigenes / 32% Other Geopolitical Zones</span>
                  </div>
                  <Badge variant="primary">Balanced</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Departmental Quota Allocation Table */}
          <Card
            header={
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Accredited Programmatic Enrollment Quotas vs Actual Trainees
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-center">
                <span className="font-bold text-slate-900 text-xs block">Community Health</span>
                <span className="text-xl font-extrabold text-[#0F7640] block my-1 font-sans">480</span>
                <span className="text-[10px] text-slate-500 font-semibold">Quota: 500 (96.0%)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-center">
                <span className="font-bold text-slate-900 text-xs block">Medical Laboratory</span>
                <span className="text-xl font-extrabold text-[#0F7640] block my-1 font-sans">320</span>
                <span className="text-[10px] text-slate-500 font-semibold">Quota: 350 (91.4%)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-center">
                <span className="font-bold text-slate-900 text-xs block">Pharmacy Technician</span>
                <span className="text-xl font-extrabold text-amber-700 block my-1 font-sans">260</span>
                <span className="text-[10px] text-slate-500 font-semibold">Quota: 300 (86.7%)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-center">
                <span className="font-bold text-slate-900 text-xs block">Health Information</span>
                <span className="text-xl font-extrabold text-emerald-700 block my-1 font-sans">120</span>
                <span className="text-[10px] text-slate-500 font-semibold">Quota: 150 (80.0%)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-center">
                <span className="font-bold text-slate-900 text-xs block">Environmental Health</span>
                <span className="text-xl font-extrabold text-slate-800 block my-1 font-sans">68</span>
                <span className="text-[10px] text-slate-500 font-semibold">Quota: 100 (68.0%)</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: FINANCIAL FEE RECOVERY & REVENUE ─── */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <Card
            header={
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Tuition & College Fee Collection Efficiency by Level
              </span>
            }
          >
            <Table
              columns={feeRecoveryColumns}
              data={feeRecoveryData}
              keyExtractor={(r) => r.id}
              isDense={isDense}
              toolbarFilters={
                <div className="text-xs text-slate-500 flex items-center gap-1.5 font-sans">
                  <span className="font-semibold text-slate-700">Net Reconciled:</span>
                  <span className="font-bold text-[#0F7640]">₦84,250,000.00</span>
                  <span className="text-slate-300">•</span>
                  <span>Target: ₦114,000,000.00 (74.0% recovery)</span>
                </div>
              }
            />
          </Card>

          {/* Revenue Source Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Primary Online Channel</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Paystack Checkout</span>
                <span className="font-extrabold text-[#0F7640] text-sm font-sans">54.0%</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                ₦45,500,000.00 settled automatically into college commercial bank treasury.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Commercial Bank e-Collection</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Remita RRR Gateway</span>
                <span className="font-extrabold text-[#0F7640] text-sm font-sans">36.0%</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                ₦30,330,000.00 verified via direct bank branch teller settlements.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Campus Bursary Cashier</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Direct POS & Drafts</span>
                <span className="font-extrabold text-slate-700 text-sm font-sans">10.0%</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                ₦8,420,000.00 processed on campus and audited daily by internal audit desk.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ACADEMIC & PROFESSIONAL BOARD PASS RATES ─── */}
      {activeTab === 'academic' && (
        <Card
          header={
            <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Accrediting Council National Qualifying Board Examination Results
            </span>
          }
        >
          <Table
            columns={passRateColumns}
            data={filteredAcademic}
            keyExtractor={(r) => r.id}
            isDense={isDense}
            searchValue={academicSearch}
            onSearchChange={setAcademicSearch}
            searchPlaceholder="Search discipline, council, or department..."
            toolbarFilters={
              <div className="w-52">
                <Select
                  value={councilFilter}
                  onChange={(val) => setCouncilFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Regulatory Councils' },
                    { value: 'CHPRBN', label: 'CHPRBN (Community Health)' },
                    { value: 'MLSCN', label: 'MLSCN (Medical Laboratory)' },
                    { value: 'PCN', label: 'PCN (Pharmacy Tech)' },
                    { value: 'HRORBN', label: 'HRORBN (Health Records)' },
                    { value: 'EHORECON', label: 'EHORECON (Env Health)' },
                  ]}
                />
              </div>
            }
          />
        </Card>
      )}

      {/* ─── TAB 4: CLINICAL HOSPITAL POSTING COMPLIANCE ─── */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          <Card
            header={
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Hospital Clinical Postings & Logbook Performance
              </span>
            }
          >
            <Table
              columns={hospitalColumns}
              data={filteredHospitals}
              keyExtractor={(h) => h.id}
              isDense={isDense}
              searchValue={hospitalSearch}
              onSearchChange={setHospitalSearch}
              searchPlaceholder="Search hospital facility or facility type..."
              toolbarFilters={
                <div className="text-xs text-slate-500 flex items-center gap-1.5 font-sans">
                  <span className="font-semibold text-slate-700">Total Trainees Posted:</span>
                  <span className="font-bold text-[#0F7640]">640 Students</span>
                  <span className="text-slate-300">•</span>
                  <span>96.2% Overall Posting Compliance</span>
                </div>
              }
            />
          </Card>
        </div>
      )}

      {/* ─── MODAL: EXECUTIVE REPORT PRINT PREVIEW ─── */}
      <Modal
        isOpen={isExecutiveReportModalOpen}
        onClose={() => setIsExecutiveReportModalOpen(false)}
        title="Official Executive Intelligence Report"
        size="lg"
      >
        <div className="space-y-6 text-xs text-slate-800">
          <div className="border border-slate-200 p-6 rounded-[4px] bg-white relative">
            {/* Header Letterhead */}
            <div className="text-center pb-4 border-b border-slate-200">
              <img
                src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
                alt="College Crest"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                }}
                className="w-14 h-14 mx-auto mb-2 rounded-[4px] object-contain shadow-xs"
              />
              <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                {schoolProfile?.institutionName || 'Bethsaida College of Health Technology'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Directorate of Academic Planning & Quality Assurance • {schoolProfile?.campusAddress || 'Ogbomoso, Oyo State'}
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 rounded-[4px] text-xs font-bold text-[#0F7640] border border-emerald-200 uppercase">
                EXECUTIVE ACADEMIC & FINANCIAL SUMMARY • {schoolProfile?.activeSession || "2026/2027"} ACADEMIC SESSION
              </div>
            </div>

            {/* Key Findings Summary */}
            <div className="space-y-3 py-4 border-b border-slate-100 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">Executive Summary & College Standing:</h4>
              <p>
                1. <strong>Enrollment Expansion:</strong> Total college enrollment reached 1,248 students (+8.4% YoY), driven by strong demand in Community Health Extension Worker (CHEW) and Medical Laboratory Technology programs.
              </p>
              <p>
                2. <strong>Financial Performance:</strong> Revenue recovery efficiency stands at 74.0% with ₦84.25M realized out of ₦114.0M billable tuition. Final year debtors recovery protocols remain in effect.
              </p>
              <p>
                3. <strong>Board Examination Excellence:</strong> Aggregate first diet pass rate across national regulatory boards ({schoolProfile?.regulatoryCouncils?.join(", ") || "NBTE, CHPRBN, MLSCN, PCN"}) reached 88.4%, with Health Information Management leading at 93.3%.
              </p>
              <p>
                4. <strong>Clinical Hospital Postings:</strong> 640 trainees successfully deployed across 4 accredited hospital complexes with 96.2% procedural logbook completion verified by consultant preceptors.
              </p>
            </div>

            {/* Official Signatures */}
            <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 items-end">
              <div>
                <div className="w-28 border-b border-slate-700 mb-1"></div>
                <span className="font-bold text-slate-900 text-xs block">Director of Academic Planning</span>
                <span className="text-[10px] text-slate-400">Planning & Quality Assurance</span>
              </div>
              <div className="text-right">
                <div className="w-28 border-b border-slate-700 ml-auto mb-1"></div>
                <span className="font-bold text-slate-900 text-xs block">Dr. Timothy Balogun (Provost)</span>
                <span className="text-[10px] text-slate-400">Bethsaida College of Health Tech</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsExecutiveReportModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Print Executive Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
