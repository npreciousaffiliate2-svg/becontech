import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { PERSONA_PROFILES } from '../context/personas.ts';
import {
  Users,
  CreditCard,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Stethoscope,
  Bed,
  CheckCircle2,
  Clock,
  Download,
  UserCheck,
  Building2,
  FileText,
  Sparkles,
  Award,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Check,
  Printer,
  Lock,
} from 'lucide-react';
import { Button, Badge, Card } from '@campusone/ui';
import { useNavigate } from 'react-router-dom';
import { PersonAvatar } from '../components/common/PersonAvatar.tsx';
import { printInstitutionalDocument } from '../utils/documentExport.ts';

export const DashboardView: React.FC = () => {
  const { session, persona, receipts, ledgerEntries, schoolProfile, departments, candidates } = useApp();
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState<'30D' | '90D' | 'Session'>('30D');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredDeptIndex, setHoveredDeptIndex] = useState<number | null>(null);

  const activeRole = session?.activeRole || 'PROVOST';
  const currentPersona = persona || PERSONA_PROFILES[activeRole] || PERSONA_PROFILES.PROVOST;

  /* ──────────────────────────────────────────────────────────────────────────
   * 1. STUDENT & SPONSOR PORTAL DASHBOARD (STU / SPON)
   * ────────────────────────────────────────────────────────────────────────── */
  if (activeRole === 'STU' || activeRole === 'SPON') {
    const userEmail = (currentPersona.email || session?.email || '').toLowerCase();
    const matchingCandidate = candidates.find(
      (c) => c.email && c.email.toLowerCase() === userEmail
    );

    // If logged in user is an Applicant (not yet matriculated/enrolled)
    if (matchingCandidate && (matchingCandidate.status === 'APPLIED' || matchingCandidate.status === 'SCREENED' || matchingCandidate.status === 'ADMITTED')) {
      const isAdmitted = matchingCandidate.status === 'ADMITTED';
      const isScreened = matchingCandidate.status === 'SCREENED' || isAdmitted;

      return (
        <div className="flex flex-col gap-6 font-sans">
          {/* Executive Overview Banner without profile image */}
          <div className="bg-gradient-to-r from-[#0F7640] to-[#093322] rounded-[4px] p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-200 block">
                {schoolProfile?.activeSession || '2026/2027'} Admission &amp; Screening Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {matchingCandidate.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium flex items-center gap-2 flex-wrap">
                <span>Application No: <strong className="text-white font-bold">{matchingCandidate.applicationNumber}</strong></span>
                <span>&bull; {matchingCandidate.programme}</span>
                <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[11px] text-emerald-100">
                  {matchingCandidate.regulatoryBody}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-[#0F7640] hover:bg-emerald-50 border-white text-xs font-bold"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => {
                  printInstitutionalDocument({
                    title: `Admission Application Slip — ${matchingCandidate.fullName}`,
                    badgeText: `OFFICIAL ONLINE APPLICATION & CBT SCREENING SLIP`,
                    referenceNo: matchingCandidate.applicationNumber,
                    issuedDate: matchingCandidate.cbtDate,
                    schoolProfile,
                    officeSubtitle: 'Office of the Registrar • Admissions & Screening Division',
                    metaItems: [
                      { label: 'Application Number', value: matchingCandidate.applicationNumber, highlight: true },
                      { label: 'Applicant Full Name', value: matchingCandidate.fullName, highlight: true },
                      { label: 'Chosen Programme', value: matchingCandidate.programme },
                      { label: 'Regulatory Council', value: matchingCandidate.regulatoryBody },
                      { label: "O'Level Examination", value: `${matchingCandidate.olevelExamBody} (${matchingCandidate.olevelExamYear})` },
                      { label: 'Application Fee Status', value: matchingCandidate.applicationFeePaid ? 'PAID & VERIFIED' : 'PENDING' },
                    ],
                    summaryNoteHtml: `
                      <strong>Next Steps for Applicant:</strong><br/>
                      1. Present this slip at the College CBT Centre for your Entrance Screening Examination.<br/>
                      2. Upon scoring at least ${schoolProfile?.minimumCutoffScore || 50}% and O'Level verification, your provisional admission letter will be issued.<br/>
                      3. After admission, pay the Acceptance Fee in the Bursary portal to receive your official Matriculation Number.
                    `,
                    stampText: 'APPLICATION REGISTERED',
                  });
                }}
              >
                Print Application Slip
              </Button>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Application Status</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 font-sans">
                  {isAdmitted ? 'ADMITTED' : isScreened ? 'SCREENED' : 'SUBMITTED'}
                </span>
                <Badge variant={isAdmitted ? 'success' : isScreened ? 'success' : 'warning'} size="sm">
                  {matchingCandidate.status}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                {isAdmitted ? 'Provisional offer published' : 'Application in screening pool'}
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>O'Level Verification</span>
                <CheckCircle2 className="w-4 h-4 text-[#0F7640]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 font-sans">
                  {matchingCandidate.olevelStatus}
                </span>
                <Badge variant="success" size="sm">5 CREDITS</Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                {matchingCandidate.olevelExamBody} ({matchingCandidate.olevelExamYear}) Verified
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>CBT Screening Score</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 font-sans">
                  {matchingCandidate.cbtScore || 75}%
                </span>
                <span className="text-xs text-emerald-700 font-semibold font-sans">Pass Cut-off ≥ 50%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                CBT entrance score
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Application Fee</span>
                <CreditCard className="w-4 h-4 text-[#0F7640]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#0F7640] font-sans">SETTLED</span>
                <Badge variant="success" size="sm">PAID</Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                Ref: {matchingCandidate.applicationFeeRef || 'PAY-ONLINE-001'}
              </p>
            </Card>
          </div>

          {/* Admission Progress Stepper */}
          <Card
            header={
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Admission Screening &amp; Enrollment Progression
              </span>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Stage 1</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7640]" />
                </div>
                <span className="font-bold text-slate-900 text-xs block">Application Submission</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">Bio-data &amp; choice submitted</span>
              </div>

              <div className={`p-3 border rounded-[4px] ${isScreened ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase">Stage 2</span>
                  {isScreened ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7640]" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <span className="font-bold text-slate-900 text-xs block">Entrance &amp; O'Level Review</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">{isScreened ? 'Passed statutory criteria' : 'Reviewing exam results'}</span>
              </div>

              <div className={`p-3 border rounded-[4px] ${isAdmitted ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase">Stage 3</span>
                  {isAdmitted ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7640]" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                <span className="font-bold text-slate-900 text-xs block">Admission Offer</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">{isAdmitted ? 'Provisional offer granted' : 'Pending batch publication'}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Stage 4</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="font-bold text-slate-900 text-xs block">Acceptance &amp; Matric</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Matric number generation</span>
              </div>
            </div>
          </Card>

          {/* O'Level Breakdown Table */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Submitted O'Level Science Subjects ({matchingCandidate.olevelExamBody} {matchingCandidate.olevelExamYear})
                </span>
                <Badge variant="success" size="sm">CREDITS VERIFIED</Badge>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Examination Body</th>
                    <th className="px-4 py-2.5">Grade</th>
                    <th className="px-4 py-2.5">Statutory Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(matchingCandidate.olevelSubjects || []).map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{s.subject}</td>
                      <td className="px-4 py-2.5 text-slate-600">{matchingCandidate.olevelExamBody}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">{s.grade}</td>
                      <td className="px-4 py-2.5 text-[#0F7640] font-semibold">Credit Pass</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Institutional Note */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-200/80 rounded-[4px] text-xs text-slate-700 space-y-1">
            <span className="font-bold text-[#0F7640] block">Official Academic Board Screening Notice:</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your application credentials have been validated for <strong>{matchingCandidate.programme}</strong> under the <strong>{matchingCandidate.department}</strong>.
              Upon Academic Board review and provisional offer ratification, your official Admission Letter and Bursary Acceptance Fee portal will unlock here.
            </p>
          </div>
        </div>
      );
    }

    const studentData = {
      fullName: currentPersona.fullName || 'Blessing Adeyemi',
      matricNumber: currentPersona.matricNumber || 'CHE/2026/0014',
      department: currentPersona.department || 'Community Health Extension (CHEW)',
      level: '200 Level',
      session: `${schoolProfile?.activeSession || '2026/2027'} ${schoolProfile?.activeSemester || 'Harmattan Semester'}`,
      status: 'Active Trainee (In Good Standing)',
      cgpa: 3.82,
      maxGpa: 4.00,
      classRank: 'Top 5% of Class',
      unitsCompleted: 34,
      totalUnitsRequired: 72,
      tuitionTotal: 210000,
      tuitionPaid: 185000,
      tuitionBalance: 25000,
      bursaryStatus: 'PARTIAL_CLEARED',
      overallAttendance: 88.5,
      attendanceThreshold: 75.0,
      attendanceStatus: 'CLEARED',
      clinicalHospital: 'General Hospital Ijebu-Ode',
      clinicalWard: 'Maternal & Child Health / Immunization Clinic',
      clinicalShift: 'Morning Duty (07:30 – 14:00)',
      proceduresVerified: 14,
      proceduresTotal: 20,
      hostelHall: 'Florence Nightingale Hall (Block B)',
      hostelRoom: 'Room 104 • Bed A',
      hostelStatus: 'Keys Issued & Inventory Cleared',
    };

    const registeredCourses = [
      { code: 'CHE 211', title: 'Reproductive Health & Family Planning', units: 3, caScore: 26, attendance: 92, status: 'On Track' },
      { code: 'CHE 212', title: 'Maternal & Child Nutrition', units: 3, caScore: 24, attendance: 88, status: 'On Track' },
      { code: 'CHE 213', title: 'Primary Healthcare Practical & Triage', units: 4, caScore: 28, attendance: 95, status: 'Exemplary' },
      { code: 'CHE 214', title: 'Epidemiology of Communicable Diseases', units: 3, caScore: 22, attendance: 82, status: 'Cleared' },
      { code: 'CHE 215', title: 'Community Health Mobilization', units: 3, caScore: 25, attendance: 85, status: 'Cleared' },
    ];

    const todayLectures = [
      {
        code: 'CHE 211',
        title: 'Reproductive Health & Family Planning',
        time: '10:00 AM – 12:00 PM',
        venue: 'Lecture Hall 2 (LH-2)',
        lecturer: 'Mr. Olumide Johnson',
        status: 'Upcoming',
      },
      {
        code: 'CHE 213',
        title: 'Primary Healthcare Practical: Resuscitation Drill',
        time: '02:00 PM – 04:00 PM',
        venue: 'Clinical Skills Lab B',
        lecturer: 'Dr. Kehinde Bello',
        status: 'Scheduled',
      },
    ];

    return (
      <div className="flex flex-col gap-6 font-sans">
        {/* Trainee Welcome & Identification Banner */}
        <div className="bg-gradient-to-r from-[#0F7640] to-[#093322] rounded-[4px] p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-200 block">
              {studentData.session}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {studentData.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium flex items-center gap-2 flex-wrap">
              <span>Matric: <strong className="text-white font-bold">{studentData.matricNumber}</strong></span>
              {studentData.department && <span>— {studentData.department}</span>}
              <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[11px] text-emerald-100">{studentData.level}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              className="bg-white text-[#0F7640] hover:bg-emerald-50 border-white text-xs font-bold"
              onClick={() => navigate('/bursary')}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              Pay Fees (₦{studentData.tuitionBalance.toLocaleString()})
            </Button>
            <Button
              variant="ghost"
              className="text-white border border-white/40 hover:bg-white/10 text-xs font-semibold"
              onClick={() => navigate('/attendance')}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Exam Gate Pass
            </Button>
          </div>
        </div>

        {/* 4 Core Scoped Student Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Academic Performance */}
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Academic Standing
              </span>
              <div className="w-8 h-8 rounded bg-emerald-50 text-[#0F7640] flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {studentData.cgpa.toFixed(2)} <span className="text-xs text-slate-400 font-semibold">/ {studentData.maxGpa.toFixed(2)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#13A348] border border-emerald-200">
                  Distinction Track
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500">{studentData.unitsCompleted} Units Passed</span>
              </div>
            </div>
          </div>

          {/* 2. Tuition Fee Ledger */}
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tuition & Fees
              </span>
              <div className="w-8 h-8 rounded bg-emerald-50 text-[#0F7640] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-extrabold text-[#13A348] tracking-tight">
                ₦{studentData.tuitionPaid.toLocaleString()}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  ₦{studentData.tuitionBalance.toLocaleString()} Due
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500">88% Cleared</span>
              </div>
            </div>
          </div>

          {/* 3. Class Attendance Gate Pass */}
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Lecture Attendance
              </span>
              <div className="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {studentData.overallAttendance}%
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#13A348] border border-emerald-200">
                  Exam Cleared
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500">&ge; 75% NBTE Rule</span>
              </div>
            </div>
          </div>

          {/* 4. Clinical Hospital Rotation */}
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Clinical Logbook
              </span>
              <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {studentData.proceduresVerified} <span className="text-xs text-slate-400 font-semibold">/ {studentData.proceduresTotal}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  70% Completed
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500">Gen Hosp Ijebu-Ode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Academic Journey & Graduation Progression Bar */}
        <div className="bg-white rounded-[4px] border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                My Academic Journey &amp; Graduation Progress
              </h2>
              <p className="text-xs text-slate-500">
                {studentData.unitsCompleted} of {studentData.totalUnitsRequired} Credit Units Completed (47%) &bull; Projected Diploma Class: <strong className="text-[#0F7640]">Distinction</strong>
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/reports')}
              leftIcon={<Award className="w-3.5 h-3.5" />}
            >
              View Transcript &amp; Standing
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { step: '1. Matriculated', desc: studentData.matricNumber, state: 'done' },
              { step: '2. 100 Level', desc: '18 Units Passed (GPA 3.78)', state: 'done' },
              { step: '3. 200 Level', desc: '16 Units Active (CGPA 3.82)', state: 'active' },
              { step: '4. 300L & Clinicals', desc: 'Hospital Logbook 70%', state: 'upcoming' },
              { step: '5. Graduation', desc: 'CHPRBN Diploma & License', state: 'upcoming' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-[4px] border ${
                  item.state === 'done'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : item.state === 'active'
                    ? 'bg-[#0F7640] border-[#0F7640] text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span>{item.step}</span>
                  {item.state === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7640]" />}
                </div>
                <span className={`block text-[10px] mt-0.5 truncate ${item.state === 'active' ? 'text-emerald-100' : ''}`}>
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Two-Column Grid: Today's Classes & Exam Clearance Voucher */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Today's Lectures & Registered Course Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Lectures Schedule */}
            <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#0F7640]/10 text-[#0F7640] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Today's Lecture Schedule
                    </h2>
                    <p className="text-xs text-slate-500">Classes and clinical laboratories scheduled for today</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/timetable')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Full Timetable
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {todayLectures.map((lec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-[4px] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F7640] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {lec.code}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                          {lec.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {lec.venue}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          {lec.lecturer}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200">
                        {lec.time}
                      </span>
                      <Badge variant="primary" size="sm">
                        {lec.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registered Semester Courses Summary */}
            <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    My Registered Courses & Assessment Scores
                  </h2>
                  <p className="text-xs text-slate-500">{schoolProfile?.activeSemester || "Harmattan"} continuous assessment score tracking</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/academics')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Full Broadsheet
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Course Code</th>
                      <th className="py-2.5 px-3">Course Title</th>
                      <th className="py-2.5 px-3 text-center">Units</th>
                      <th className="py-2.5 px-3 text-center">CA Score (/30)</th>
                      <th className="py-2.5 px-3 text-center">Attendance</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {registeredCourses.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-[#0F7640]">{c.code}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{c.title}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{c.units}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">{c.caScore}</td>
                        <td className="py-3 px-3 text-center font-semibold text-emerald-700">{c.attendance}%</td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant="success" size="sm">
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Examination Clearance Pass & Hospital Details */}
          <div className="space-y-6">
            {/* Examination Gate Pass Verification Card */}
            <div className="bg-white rounded-[4px] border border-emerald-200 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-70" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F7640] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#13A348]" />
                    Exam Hall Gate Pass
                  </span>
                  <Badge variant="success" size="sm">
                    Verified Cleared
                  </Badge>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-[4px] border border-emerald-200 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Bursary Clearance:</span>
                    <span className="font-bold text-[#13A348] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Minimum 75% Met
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Lecture Attendance:</span>
                    <span className="font-bold text-[#13A348] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 88.5% (Threshold 75%)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Clinical Quota:</span>
                    <span className="font-bold text-[#13A348] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Hospital Logbook Cleared
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Your biometric profile and examination docket are active. Present your verified digital gate pass or print docket at the examination hall.
                </p>

                <Button
                  variant="primary"
                  className="w-full text-xs flex items-center justify-center gap-1.5"
                  onClick={() => navigate('/attendance')}
                >
                  <Download className="w-3.5 h-3.5" />
                  View & Print Official Gate Pass
                </Button>
              </div>
            </div>

            {/* Hostel Accommodation Pass Card */}
            <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-[#0F7640]" />
                  Residential Space
                </span>
                <Badge variant="neutral" size="sm">
                  Active Bed Slot
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-slate-900 text-sm">
                  {studentData.hostelHall}
                </p>
                <p className="text-slate-600 font-semibold flex items-center gap-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">{studentData.hostelRoom}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">Bursary Cleared</span>
                </p>
                <p className="text-[11px] text-slate-400 pt-1">
                  Key tag verified. Bedspace allocated for 2026/2027 Session.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/hostels')}
              >
                View Hostel Pass & Defect Form
              </Button>
            </div>

            {/* Quick Self-Service Links */}
            <div className="bg-slate-50 rounded-[4px] border border-slate-200 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Quick Student Actions
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => navigate('/bursary')}
                  className="p-2.5 bg-white rounded border border-slate-200 hover:border-[#0F7640] hover:text-[#0F7640] transition-colors text-left font-semibold text-slate-800 flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Fee Receipts
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/postings')}
                  className="p-2.5 bg-white rounded border border-slate-200 hover:border-[#0F7640] hover:text-[#0F7640] transition-colors text-left font-semibold text-slate-800 flex items-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                  Clinical Log
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/learning')}
                  className="p-2.5 bg-white rounded border border-slate-200 hover:border-[#0F7640] hover:text-[#0F7640] transition-colors text-left font-semibold text-slate-800 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  CBT Practice
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/messages')}
                  className="p-2.5 bg-white rounded border border-slate-200 hover:border-[#0F7640] hover:text-[#0F7640] transition-colors text-left font-semibold text-slate-800 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Notices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * 2. LECTURER & FACULTY WORKSPACE DASHBOARD (INSTR)
   * ────────────────────────────────────────────────────────────────────────── */
  if (activeRole === 'INSTR') {
    const facultyCourses = [
      { code: 'CHE 211', title: 'Reproductive Health & Family Planning', enrolled: 48, caSubmitted: 48, caTotal: 48, attendanceSessions: 18, nextLecture: 'Today 10:00 AM' },
      { code: 'CHE 213', title: 'Primary Healthcare Practical: Resuscitation Drill', enrolled: 48, caSubmitted: 24, caTotal: 48, attendanceSessions: 14, nextLecture: 'Today 02:00 PM' },
    ];

    return (
      <div className="flex flex-col gap-6 font-sans">
        <div className="bg-gradient-to-r from-[#0F7640] to-[#093322] rounded-[4px] p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs text-emerald-200 font-medium block">
              {[schoolProfile?.activeSession || '2026/2027', schoolProfile?.activeSemester || 'Harmattan Semester']
                .filter(Boolean)
                .join(' — ')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {currentPersona.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              {[currentPersona.title, currentPersona.department].filter(Boolean).join(' — ')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="bg-white text-[#0F7640] hover:bg-emerald-50 text-xs font-bold"
              onClick={() => navigate('/academics')}
            >
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Enter CA Scores
            </Button>
            <Button
              variant="ghost"
              className="text-white border border-white/40 hover:bg-white/10 text-xs font-semibold"
              onClick={() => navigate('/attendance')}
            >
              <CalendarCheck className="w-3.5 h-3.5 mr-1.5" />
              Take Attendance
            </Button>
          </div>
        </div>

        {/* 4 Scoped Faculty Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Assigned Courses</span>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">2 Courses</div>
            <p className="mt-1 text-xs text-slate-500 font-medium">96 Enrolled Trainees Total</p>
          </div>
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Today's Lectures</span>
            <div className="mt-2 text-2xl font-extrabold text-[#0F7640]">2 Sessions</div>
            <p className="mt-1 text-xs text-emerald-600 font-medium">LH-2 & Skills Lab B</p>
          </div>
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">CA Scores Pending</span>
            <div className="mt-2 text-2xl font-extrabold text-amber-600">24 Trainees</div>
            <p className="mt-1 text-xs text-amber-700 font-medium">CHE 213 Practical CA1</p>
          </div>
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Attendance</span>
            <div className="mt-2 text-2xl font-extrabold text-teal-700">89.4%</div>
            <p className="mt-1 text-xs text-teal-600 font-medium">&ge; 75% NBTE Compliance</p>
          </div>
        </div>

        {/* Faculty Courses Table */}
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned Courses & Continuous Assessment</h2>
              <p className="text-xs text-slate-500">Track grade submissions and class registers for active teaching modules</p>
            </div>
            <Button size="sm" onClick={() => navigate('/academics')}>
              Manage All Scores
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3 text-center">Enrolled</th>
                  <th className="py-2.5 px-3 text-center">Scores Entered</th>
                  <th className="py-2.5 px-3 text-center">Sessions Held</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {facultyCourses.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-bold text-[#0F7640]">{c.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{c.title}</td>
                    <td className="py-3 px-3 text-center">{c.enrolled}</td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span className={c.caSubmitted === c.caTotal ? 'text-emerald-700' : 'text-amber-600'}>
                        {c.caSubmitted} / {c.caTotal}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">{c.attendanceSessions}</td>
                    <td className="py-3 px-3 text-center">
                      <Button size="sm" variant="secondary" onClick={() => navigate('/academics')}>
                        Enter Scores
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * 3. EXECUTIVE DASHBOARD (PROVOST, BURSAR, REG, EXAM, HOD, SADMIN)
   * ────────────────────────────────────────────────────────────────────────── */
  const activeStudentCount = departments.reduce((sum, dept) => sum + (Number(dept.studentsCount) || 0), 0);
  const collectedKobo = receipts.reduce((sum, receipt) => sum + (Number(receipt.amountKobo) || 0), 0);
  const latestBalance = new Map<string, { at: string; balance: number }>();
  ledgerEntries.forEach((entry) => {
    const previous = latestBalance.get(entry.studentId);
    if (!previous || String(entry.createdAt) >= previous.at) {
      latestBalance.set(entry.studentId, {
        at: String(entry.createdAt),
        balance: Number(entry.balanceAfterKobo) || 0,
      });
    }
  });
  let outstandingKobo = 0;
  latestBalance.forEach((entry) => {
    if (entry.balance > 0) outstandingKobo += entry.balance;
  });
  const formatKobo = (kobo: number) => {
    const naira = kobo / 100;
    if (naira >= 1000000) return `₦${(naira / 1000000).toFixed(1)}M`;
    return `₦${Math.round(naira).toLocaleString()}`;
  };

  const kpis = useMemo(() => {
    if (timeframe === '30D') {
      return [
        {
          title: 'Active Students Enrolled',
          value: activeStudentCount.toLocaleString(),
          trend: '98.2% attendance this month',
          subtext: 'Across 5 health departments',
          isPositive: true,
          icon: <Users className="w-5 h-5 text-slate-400" />,
        },
        {
          title: 'School Fees Collected',
          value: formatKobo(collectedKobo),
          trend: '88 verified payments (30D)',
          subtext: '+12.4% vs previous 30 days',
          isPositive: true,
          icon: <CreditCard className="w-5 h-5 text-slate-400" />,
        },
        {
          title: 'Assessment Pass Rate',
          value: '89.2%',
          trend: '+2.4% CA test improvement',
          subtext: 'Continuous Assessment Tests',
          isPositive: true,
          icon: <GraduationCap className="w-5 h-5 text-slate-400" />,
        },
        {
          title: 'Outstanding Fees',
          value: formatKobo(outstandingKobo),
          trend: '142 students pending',
          subtext: 'Current installment balances',
          isPositive: false,
          icon: <AlertCircle className="w-5 h-5 text-slate-400" />,
        },
      ];
    }
    if (timeframe === '90D') {
      return [
        {
          title: 'Active Students Enrolled',
          value: activeStudentCount.toLocaleString(),
          trend: '+8.4% quarterly growth',
          subtext: 'Full-time trainees in session',
          isPositive: true,
          icon: <Users className="w-5 h-5 text-slate-400" />,
        },
        {
          title: 'School Fees Collected',
          value: formatKobo(collectedKobo),
          trend: '312 verified payments (90D)',
          subtext: 'Quarterly bursary target reached',
          isPositive: true,
          icon: <CreditCard className="w-5 h-5 text-slate-400" />,
        },
        {
          title: 'Examination Pass Rate',
          value: '88.8%',
          trend: 'Academic Senate verified',
          subtext: 'Mid-semester performance average',
          isPositive: true,
          icon: <GraduationCap className="w-5 h-5 text-slate-400" />,
        },
        {
          title: 'Outstanding Fees',
          value: formatKobo(outstandingKobo),
          trend: '142 students with balances',
          subtext: 'Pre-exam docket clearance',
          isPositive: false,
          icon: <AlertCircle className="w-5 h-5 text-slate-400" />,
        },
      ];
    }
    // Session (Full Academic Session)
    return [
      {
        title: 'Active Students Enrolled',
        value: activeStudentCount.toLocaleString(),
        trend: '+8.4% this session',
        subtext: 'Capacity: 1,400 across 5 depts',
        isPositive: true,
        icon: <Users className="w-5 h-5 text-slate-400" />,
      },
      {
        title: 'School Fees Collected',
          value: formatKobo(collectedKobo),
        trend: '74% of session target',
        subtext: 'Target: ₦114M for session',
        isPositive: true,
        icon: <CreditCard className="w-5 h-5 text-slate-400" />,
      },
      {
        title: 'Examination Pass Rate',
        value: '88.4%',
        trend: '+2.1% improvement',
        subtext: `${schoolProfile?.activeSemester || 'Semester'} Senate results`,
        isPositive: true,
        icon: <GraduationCap className="w-5 h-5 text-slate-400" />,
      },
      {
        title: 'Outstanding Fees',
        value: formatKobo(outstandingKobo),
        trend: '142 students in arrears',
        subtext: 'Session uncollected receivables',
        isPositive: false,
        icon: <AlertCircle className="w-5 h-5 text-slate-400" />,
      },
    ];
  }, [timeframe, schoolProfile, activeStudentCount, collectedKobo, outstandingKobo]);

  const monthlyRevenue = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const colors = ['#0F7640', '#13A348', '#093322'];
    const totals = months.map(() => 0);
    receipts.forEach((receipt) => {
      const date = new Date(receipt.paidAt);
      if (Number.isNaN(date.getTime())) return;
      totals[date.getMonth()] += Number(receipt.amountKobo) || 0;
    });
    return months.map((month, index) => {
      const naira = totals[index] / 100;
      return {
        month,
        amount: naira / 1000000,
        label: naira >= 1000000 ? `₦${(naira / 1000000).toFixed(1)}M` : `₦${Math.round(naira).toLocaleString()}`,
        color: colors[index % colors.length],
        fullName: month,
        focus: 'Recorded receipts',
      };
    });
  }, [receipts]);
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((bar) => bar.amount));

  const departmentEnrollment = useMemo(() => {
    if (departments && departments.length > 0) {
      const totalStudents = departments.reduce((acc, d) => acc + (d.studentsCount || 0), 0) || 1248;
      const palette = [
        'bg-[#0F7640]',
        'bg-[#13A348]',
        'bg-teal-600',
        'bg-[#093322]',
        'bg-amber-500',
        'bg-emerald-700',
        'bg-slate-600',
      ];
      return departments.map((d, idx) => ({
        name: d.name.replace('Department of ', '').replace(' Department', ''),
        count: d.studentsCount || 0,
        percentage: Math.round(((d.studentsCount || 0) / totalStudents) * 100),
        color: palette[idx % palette.length],
      }));
    }
    return [
      { name: 'Community Health', count: 380, percentage: 30, color: 'bg-[#0F7640]' },
      { name: 'Pharmacy Technician', count: 230, percentage: 18, color: 'bg-[#13A348]' },
      { name: 'Environmental Health', count: 198, percentage: 16, color: 'bg-teal-600' },
      { name: 'Dental Health', count: 185, percentage: 15, color: 'bg-[#093322]' },
      { name: 'Health Information (HIM)', count: 172, percentage: 14, color: 'bg-amber-500' },
      { name: 'Health Technician', count: 145, percentage: 12, color: 'bg-emerald-700' },
      { name: 'Health Assistant', count: 135, percentage: 11, color: 'bg-slate-600' },
    ];
  }, [departments]);

  const recentPayments = [
    {
      date: 'Today, 11:20 AM',
      student: 'Blessing Adeyemi',
      program: 'Community Health 200L',
      item: 'First Semester Tuition',
      channel: 'Paystack Card',
      amount: '₦100,000.00',
    },
    {
      date: 'Today, 09:45 AM',
      student: 'Emmanuel Chukwuma',
      program: 'Medical Laboratory 100L',
      item: 'Tuition Fee Balance',
      channel: 'Remita Bank',
      amount: '₦140,000.00',
    },
    {
      date: 'Yesterday',
      student: 'Khadijat Sani',
      program: 'Pharmacy Technician 100L',
      item: 'Clinical Posting Levy',
      channel: 'Paystack Card',
      amount: '₦35,000.00',
    },
    {
      date: 'Yesterday',
      student: 'Amina Yusuf',
      program: 'Applicant Screening',
      item: 'Admission Application Fee',
      channel: 'Bank Transfer',
      amount: '₦15,000.00',
    },
    {
      date: '11 Nov 2026',
      student: 'David Adeleke',
      program: 'Medical Laboratory 100L',
      item: 'Laboratory Consumables',
      channel: 'Paystack Card',
      amount: '₦20,000.00',
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Personalized Officer Welcome & Role Workspace Header */}
      <div className="bg-gradient-to-r from-[#093322] to-[#0F7640] rounded-[4px] p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-emerald-200 font-medium block">
            {[schoolProfile?.activeSession || '2026/2027', schoolProfile?.activeSemester || 'Harmattan Semester']
              .filter(Boolean)
              .join(' — ')}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
            Welcome back, {currentPersona.fullName}
          </h1>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            {[currentPersona.title, currentPersona.department].filter(Boolean).join(' — ')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeRole === 'REG' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-[#0F7640] hover:bg-emerald-50 border-white font-bold"
                onClick={() => navigate('/admissions')}
              >
                Admissions Queue
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white border border-white/40 hover:bg-white/10"
                onClick={() => navigate('/students/lifecycle')}
              >
                Issue Certificates
              </Button>
            </>
          )}
          {activeRole === 'BURSAR' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-[#0F7640] hover:bg-emerald-50 border-white font-bold"
                onClick={() => navigate('/bursary')}
              >
                Fee &amp; Tuition Account
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white border border-white/40 hover:bg-white/10"
                onClick={() => navigate('/bursary/receipts')}
              >
                Official Receipts
              </Button>
            </>
          )}
          {activeRole === 'EXAM' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-[#0F7640] hover:bg-emerald-50 border-white font-bold"
                onClick={() => navigate('/academics/broadsheets')}
              >
                Senate Broadsheets
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white border border-white/40 hover:bg-white/10"
                onClick={() => navigate('/learning/cbt')}
              >
                CBT Exam Center
              </Button>
            </>
          )}
          {activeRole === 'HOD' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-[#0F7640] hover:bg-emerald-50 border-white font-bold"
                onClick={() => navigate('/departments')}
              >
                My Department
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white border border-white/40 hover:bg-white/10"
                onClick={() => navigate('/academics')}
              >
                Approve CA Scores
              </Button>
            </>
          )}
          {activeRole === 'CLINSUP' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-[#0F7640] hover:bg-emerald-50 border-white font-bold"
                onClick={() => navigate('/postings')}
              >
                Hospital Postings
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white border border-white/40 hover:bg-white/10"
                onClick={() => navigate('/postings/logbooks')}
              >
                Grade Logbooks
              </Button>
            </>
          )}
          {(activeRole === 'PROVOST' || activeRole === 'SADMIN') && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-[#0F7640] hover:bg-emerald-50 border-white font-bold"
                onClick={() => navigate('/analytics')}
              >
                Executive Analytics
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white border border-white/40 hover:bg-white/10"
                onClick={() => navigate('/settings/school')}
              >
                College Settings
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {timeframe === '30D'
              ? `Last 30 Days Activity — ${schoolProfile?.activeSession || '2026/2027'}`
              : timeframe === '90D'
              ? `Last 90 Days (Quarterly Assessment) — ${schoolProfile?.activeSession || '2026/2027'}`
              : `${schoolProfile?.activeSession || '2026/2027'} Full Academic Session`}
          </p>
        </div>

        {/* Clean Segmented Timeframe Toggle */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-200/70 rounded-[4px] inline-flex items-center gap-1">
            {(['30D', '90D', 'Session'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-all ${
                  timeframe === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-150 min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <span className="shrink-0">{kpi.icon}</span>
            </div>

            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {kpi.value}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-xs">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] whitespace-nowrap shrink-0 ${
                    kpi.isPositive
                      ? 'bg-emerald-50 text-[#13A348] border border-emerald-200'
                      : 'bg-rose-50 text-[#F83A20] border border-rose-200'
                  }`}
                >
                  {kpi.trend}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 truncate">
                  {kpi.subtext}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Revenue & Fee Collections Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[4px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly School Fee Collections
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total fees received across online card payments and bank transfers
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-[#13A348] font-sans">
                {timeframe === '30D' ? '₦14,250,000' : timeframe === '90D' ? '₦50,500,000' : '₦128,500,000'}
              </span>
              <span className="text-xs text-slate-400 block font-sans">
                {timeframe === '30D' ? 'Collected in Last 30 Days' : timeframe === '90D' ? 'Collected in Last 90 Days' : 'Session Total to Date'}
              </span>
            </div>
          </div>

          <div className="h-10 mt-4 flex items-center justify-between gap-3 rounded-[4px] border border-slate-200 bg-slate-50 px-3 text-xs">
            {hoveredBarIndex !== null ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                    style={{ backgroundColor: monthlyRevenue[hoveredBarIndex].color }}
                  />
                  <span className="font-semibold text-slate-900 truncate">
                    {monthlyRevenue[hoveredBarIndex].fullName}
                  </span>
                  <span className="text-slate-500 truncate hidden sm:inline">
                    {monthlyRevenue[hoveredBarIndex].focus}
                  </span>
                </div>
                <span className="font-bold text-[#0F7640] shrink-0">
                  {monthlyRevenue[hoveredBarIndex].label}
                </span>
              </>
            ) : (
              <span className="text-slate-500">Point at a month to read that collection.</span>
            )}
          </div>

          <div className="pt-4">
            <div className="h-52 w-full flex items-end gap-1.5 sm:gap-2 border-b border-slate-200">
              {monthlyRevenue.map((bar, i) => {
                const heightPercent = Math.round((bar.amount / maxRevenue) * 100);
                const isHovered = hoveredBarIndex === i;
                const isBarActive =
                  timeframe === 'Session' ||
                  (timeframe === '30D' && bar.month === 'Nov') ||
                  (timeframe === '90D' && ['Sep', 'Oct', 'Nov'].includes(bar.month));

                return (
                  <div
                    key={bar.month}
                    className="flex-1 min-w-0 h-full flex flex-col justify-end cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    <div className="flex-1 flex items-end">
                      <div
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: bar.color,
                          opacity: isHovered || isBarActive ? 1 : 0.45,
                        }}
                        className="w-full rounded-t-[4px]"
                      />
                    </div>
                    <span className={`block text-center text-[10px] sm:text-[11px] pt-1.5 truncate ${isHovered ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                      {bar.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (1/3): Student Enrollment by Department */}
        <div className="bg-white rounded-[4px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Students by Department
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution across accredited training programmes
              </p>
            </div>

            <div className="space-y-3 pt-4">
              {departmentEnrollment.map((dept, i) => {
                const isDeptHovered = hoveredDeptIndex === i;
                return (
                  <div
                    key={dept.name}
                    className={`rounded-[4px] px-2 py-1.5 -mx-2 ${isDeptHovered ? 'bg-slate-50' : ''}`}
                    onMouseEnter={() => setHoveredDeptIndex(i)}
                    onMouseLeave={() => setHoveredDeptIndex(null)}
                  >
                    <div className="flex items-baseline justify-between gap-3 text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 truncate">{dept.name}</span>
                      <span className="font-semibold text-slate-900 shrink-0">{dept.count} · {dept.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-[4px] overflow-hidden">
                      <div
                        style={{ width: `${Math.min(dept.percentage, 100)}%` }}
                        className={`h-full ${dept.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Enrollment</span>
            <span className="font-bold text-slate-900 text-sm">{activeStudentCount.toLocaleString()} Students</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent School Payments & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Recent School Payments */}
        <div className="lg:col-span-2 bg-white rounded-[4px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Student Fee Payments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time verified settlements processed through school accounts
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/bursary')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View Full Fee Account
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department / Level</th>
                  <th className="py-3 px-4">Fee Item</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {recentPayments.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{p.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{p.student}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{p.program}</td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{p.item}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="primary" size="sm">{p.channel}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#13A348] whitespace-nowrap">
                      {p.amount}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Badge variant="success" size="sm">Verified</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1/3): Action Required Workflow Items */}
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tasks Awaiting Approval
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Items requiring sign-off</p>
              </div>
              <Badge variant="warning">3 Pending</Badge>
            </div>

            <div className="space-y-3.5 pt-4">
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Official Exam Results Broadsheet
                  </span>
                  <Badge variant="warning" size="sm">Review</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Community Health (CHEW 200L) scores submitted by department for final publication.
                </p>
                <div className="pt-1 flex justify-end">
                  <Button size="sm" onClick={() => navigate('/academics')}>
                    Review & Publish Results
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Batch 2026 Admission List
                  </span>
                  <Badge variant="neutral" size="sm">45 Students</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Entrance test completed. Screened candidates ready for admission letter issuance.
                </p>
                <div className="pt-1 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => navigate('/admissions')}>
                    Approve Admission List
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Hospital Clinical Postings
                  </span>
                  <Badge variant="neutral" size="sm">60 Students</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Trainees allocated to UCH Ibadan and Adeoyo State Hospital for rural fieldwork.
                </p>
                <div className="pt-1 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => navigate('/postings')}>
                    Open Allocations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
