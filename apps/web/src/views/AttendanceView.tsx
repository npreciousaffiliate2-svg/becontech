import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
  Input,
  Select,
  Modal,
} from '@campusone/ui';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  Search,
  Filter,
  Printer,
  Download,
  AlertTriangle,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Award,
  UserCheck,
  Stethoscope,
  Building2,
  Calendar,
  BookOpen,
} from 'lucide-react';

/* ─── TYPES ─── */
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';
type ClearanceStatus = 'CLEARED' | 'PROVISIONAL' | 'BARRED';
type WaiverStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

interface AttendanceStudent {
  id: string;
  matricNumber: string;
  fullName: string;
  departmentCode: string;
  departmentName: string;
  level: string;
  courseCode: string;
  attendedSessions: number;
  totalSessions: number;
  statusToday: AttendanceStatus;
  bursaryStatus: 'CLEARED' | 'PARTIAL' | 'OVERDUE';
  clinicalStatus: 'CLEARED' | 'PENDING' | 'NOT_APPLICABLE';
  waiverGranted?: boolean;
}

interface CourseSummary {
  courseCode: string;
  courseTitle: string;
  departmentCode: string;
  lecturer: string;
  totalLecturesHeld: number;
  enrolledStudents: number;
  avgAttendanceRate: number;
  eligibleCount: number;
  barredCount: number;
  lectureHall: string;
}

interface MedicalWaiver {
  id: string;
  matricNumber: string;
  fullName: string;
  departmentCode: string;
  courseCode: string;
  preWaiverRate: number;
  documentedReason: string;
  medicalFacility: string;
  supportingDocument: string;
  status: WaiverStatus;
  dateFiled: string;
  reviewedBy?: string;
}

export const AttendanceView: React.FC = () => {
  const { recordAudit, isDense } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { tab: routeTab } = useParams<{ tab: string }>();
  const searchTab = searchParams.get('tab');
  
  const resolveTab = (tabStr?: string | null): 'register' | 'courses' | 'clearance' | 'waivers' => {
    if (!tabStr) return 'register';
    if (tabStr === 'eligibility') return 'clearance';
    if (['register', 'courses', 'clearance', 'waivers'].includes(tabStr)) {
      return tabStr as 'register' | 'courses' | 'clearance' | 'waivers';
    }
    return 'register';
  };

  const [activeTab, setActiveTab] = useState<'register' | 'courses' | 'clearance' | 'waivers'>(
    resolveTab(routeTab || searchTab)
  );

  useEffect(() => {
    const nextTab = resolveTab(routeTab || searchTab);
    setActiveTab(nextTab);
  }, [routeTab, searchTab]);

  const handleTabChange = (id: 'register' | 'courses' | 'clearance' | 'waivers') => {
    setActiveTab(id);
    navigate(`/attendance/${id}`);
  };

  /* ─── FILTERS STATE ─── */
  const [selectedCourse, setSelectedCourse] = useState('CHE 201');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [clearanceFilter, setClearanceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionDate, setSessionDate] = useState('2026-11-13');
  const [sessionTopic, setSessionTopic] = useState('Maternal Child Health & Immunization Schedules');

  /* ─── MODAL STATES ─── */
  const [isDocketModalOpen, setIsDocketModalOpen] = useState(false);
  const [selectedDocketStudent, setSelectedDocketStudent] = useState<AttendanceStudent | null>(null);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [selectedWaiver, setSelectedWaiver] = useState<MedicalWaiver | null>(null);

  /* ─── ATTENDANCE ROSTER DATA ─── */
  const [students, setStudents] = useState<AttendanceStudent[]>([
    {
      id: 'att-01',
      matricNumber: 'CHE/2026/0014',
      fullName: 'Blessing Adeyemi',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      courseCode: 'CHE 201',
      attendedSessions: 22,
      totalSessions: 24,
      statusToday: 'PRESENT',
      bursaryStatus: 'CLEARED',
      clinicalStatus: 'CLEARED',
    },
    {
      id: 'att-02',
      matricNumber: 'CHE/2026/0015',
      fullName: 'Oluwaseun Bakare',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      courseCode: 'CHE 201',
      attendedSessions: 20,
      totalSessions: 24,
      statusToday: 'PRESENT',
      bursaryStatus: 'CLEARED',
      clinicalStatus: 'CLEARED',
    },
    {
      id: 'att-03',
      matricNumber: 'CHE/2026/0016',
      fullName: 'Fatima Ibrahim',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      courseCode: 'CHE 201',
      attendedSessions: 23,
      totalSessions: 24,
      statusToday: 'PRESENT',
      bursaryStatus: 'CLEARED',
      clinicalStatus: 'CLEARED',
    },
    {
      id: 'att-04',
      matricNumber: 'CHE/2026/0017',
      fullName: 'Chinedu Eze',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      courseCode: 'CHE 201',
      attendedSessions: 14,
      totalSessions: 24,
      statusToday: 'ABSENT', // 14/24 = 58.3% < 75% threshold
      bursaryStatus: 'OVERDUE',
      clinicalStatus: 'PENDING',
    },
    {
      id: 'att-05',
      matricNumber: 'CHE/2026/0018',
      fullName: 'Amina Danjuma',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      courseCode: 'CHE 201',
      attendedSessions: 21,
      totalSessions: 24,
      statusToday: 'PRESENT',
      bursaryStatus: 'CLEARED',
      clinicalStatus: 'CLEARED',
    },
    {
      id: 'att-06',
      matricNumber: 'MLT/2026/0009',
      fullName: 'Tunde Olatunji',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Technology',
      level: '200L',
      courseCode: 'MLT 201',
      attendedSessions: 24,
      totalSessions: 24,
      statusToday: 'PRESENT',
      bursaryStatus: 'CLEARED',
      clinicalStatus: 'CLEARED',
    },
    {
      id: 'att-07',
      matricNumber: 'MLT/2026/0010',
      fullName: 'Halima Yusuf',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Technology',
      level: '200L',
      courseCode: 'MLT 201',
      attendedSessions: 16,
      totalSessions: 24,
      statusToday: 'EXCUSED', // 16/24 = 66.7% has waiver
      bursaryStatus: 'CLEARED',
      clinicalStatus: 'CLEARED',
      waiverGranted: true,
    },
    {
      id: 'att-08',
      matricNumber: 'PHT/2026/0022',
      fullName: 'Ifeanyi Okoro',
      departmentCode: 'PHT',
      departmentName: 'Pharmacy Technician',
      level: '200L',
      courseCode: 'PHT 201',
      attendedSessions: 19,
      totalSessions: 24,
      statusToday: 'PRESENT',
      bursaryStatus: 'PARTIAL',
      clinicalStatus: 'CLEARED',
    },
    {
      id: 'att-09',
      matricNumber: 'HIM/2026/0005',
      fullName: 'Rukayat Sanusi',
      departmentCode: 'HIM',
      departmentName: 'Health Information Management',
      level: '200L',
      courseCode: 'HIM 201',
      attendedSessions: 22,
      totalSessions: 24,
      statusToday: 'PRESENT',
      bursaryStatus: 'CLEARED',
      clinicalStatus: 'CLEARED',
    },
    {
      id: 'att-10',
      matricNumber: 'EHT/2026/0012',
      fullName: 'Solomon Giwa',
      departmentCode: 'EHT',
      departmentName: 'Environmental Health Sciences',
      level: '200L',
      courseCode: 'EHT 201',
      attendedSessions: 13,
      totalSessions: 24,
      statusToday: 'ABSENT', // 13/24 = 54.2% < 75%
      bursaryStatus: 'OVERDUE',
      clinicalStatus: 'PENDING',
    },
  ]);

  /* ─── COURSE SUMMARIES DATA ─── */
  const [courses] = useState<CourseSummary[]>([
    {
      courseCode: 'CHE 201',
      courseTitle: 'Primary Health Care & Community Mobilization',
      departmentCode: 'CHE',
      lecturer: 'Dr. K. Bello',
      totalLecturesHeld: 24,
      enrolledStudents: 142,
      avgAttendanceRate: 88.4,
      eligibleCount: 134,
      barredCount: 8,
      lectureHall: 'Hall 2 (Health Sciences Wing)',
    },
    {
      courseCode: 'CHE 203',
      courseTitle: 'Maternal & Child Health Practice',
      departmentCode: 'CHE',
      lecturer: 'Mrs. F. Oladipo',
      totalLecturesHeld: 22,
      enrolledStudents: 142,
      avgAttendanceRate: 89.1,
      eligibleCount: 136,
      barredCount: 6,
      lectureHall: 'Clinical Skills Lab B',
    },
    {
      courseCode: 'MLT 201',
      courseTitle: 'Clinical Chemistry & Laboratory Diagnostics',
      departmentCode: 'MLT',
      lecturer: 'Mr. O. Adebisi',
      totalLecturesHeld: 24,
      enrolledStudents: 98,
      avgAttendanceRate: 91.5,
      eligibleCount: 94,
      barredCount: 4,
      lectureHall: 'Diagnostics Science Lab 1',
    },
    {
      courseCode: 'MLT 205',
      courseTitle: 'Medical Parasitology & Entomology',
      departmentCode: 'MLT',
      lecturer: 'Dr. A. Mensah',
      totalLecturesHeld: 20,
      enrolledStudents: 98,
      avgAttendanceRate: 86.8,
      eligibleCount: 89,
      barredCount: 9,
      lectureHall: 'Microbiology Suite 3',
    },
    {
      courseCode: 'PHT 201',
      courseTitle: 'Pharmacology for Health Technicians',
      departmentCode: 'PHT',
      lecturer: 'Pharm. B. Ibrahim',
      totalLecturesHeld: 23,
      enrolledStudents: 85,
      avgAttendanceRate: 84.2,
      eligibleCount: 76,
      barredCount: 9,
      lectureHall: 'Pharma Lab P1',
    },
    {
      courseCode: 'HIM 201',
      courseTitle: 'Health Care Statistics & Biostatistics',
      departmentCode: 'HIM',
      lecturer: 'Mrs. T. Adeleke',
      totalLecturesHeld: 22,
      enrolledStudents: 64,
      avgAttendanceRate: 92.4,
      eligibleCount: 62,
      barredCount: 2,
      lectureHall: 'Computing Center 2',
    },
    {
      courseCode: 'EHT 201',
      courseTitle: 'Environmental Sanitation & Water Hygiene',
      departmentCode: 'EHT',
      lecturer: 'Sanitarian E. Audu',
      totalLecturesHeld: 21,
      enrolledStudents: 45,
      avgAttendanceRate: 79.6,
      eligibleCount: 38,
      barredCount: 7,
      lectureHall: 'Public Health Pavilion',
    },
  ]);

  /* ─── MEDICAL WAIVERS DATA ─── */
  const [waivers, setWaivers] = useState<MedicalWaiver[]>([
    {
      id: 'wvr-01',
      matricNumber: 'MLT/2026/0010',
      fullName: 'Halima Yusuf',
      departmentCode: 'MLT',
      courseCode: 'MLT 201',
      preWaiverRate: 66.7,
      documentedReason: 'Acute typhoid enteritis with 10 days inpatient admission.',
      medicalFacility: 'State Specialist Hospital, Moniya, Ibadan',
      supportingDocument: 'MED-BCHT-2026-0889.pdf',
      status: 'APPROVED',
      dateFiled: '2026-11-04',
      reviewedBy: 'Dr. Timothy Balogun (Provost)',
    },
    {
      id: 'wvr-02',
      matricNumber: 'CHE/2026/0017',
      fullName: 'Chinedu Eze',
      departmentCode: 'CHE',
      courseCode: 'CHE 201',
      preWaiverRate: 58.3,
      documentedReason: 'Severe malaria infection requiring clinical observation.',
      medicalFacility: 'College Health Centre, Bethsaida',
      supportingDocument: 'CHC-REC-2026-1402.pdf',
      status: 'PENDING',
      dateFiled: '2026-11-10',
    },
    {
      id: 'wvr-03',
      matricNumber: 'EHT/2026/0012',
      fullName: 'Solomon Giwa',
      departmentCode: 'EHT',
      courseCode: 'EHT 201',
      preWaiverRate: 54.2,
      documentedReason: 'Uncertified personal absence without hospital verification.',
      medicalFacility: 'Private Clinic (Unaccredited)',
      supportingDocument: 'NOT_VERIFIED.pdf',
      status: 'REJECTED',
      dateFiled: '2026-11-08',
      reviewedBy: 'Academic Board Committee',
    },
  ]);

  /* ─── ACTIONS ─── */
  const handleToggleStatus = (id: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, statusToday: status } : s))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, statusToday: status })));
    showToast({
      type: 'info',
      title: 'Roll Call Updated',
      message: `All enrolled students marked as ${status.toLowerCase()} for today's session.`,
    });
  };

  const handleSaveRegister = () => {
    recordAudit(
      'ATTENDANCE_REGISTER_COMMITTED',
      'ATTENDANCE_SESSION',
      `${selectedCourse}-${sessionDate}`
    );
    showToast({
      type: 'success',
      title: 'Daily Register Saved',
      message: `Attendance committed for ${selectedCourse} (${sessionDate}). Statutory eligibility calculations recalculated.`,
    });
  };

  const handleApproveWaiver = (waiver: MedicalWaiver) => {
    setWaivers((prev) =>
      prev.map((w) =>
        w.id === waiver.id
          ? { ...w, status: 'APPROVED', reviewedBy: 'Dr. Timothy Balogun (Provost)' }
          : w
      )
    );
    // Update student's waiver status in student roster
    setStudents((prev) =>
      prev.map((s) =>
        s.matricNumber === waiver.matricNumber && s.courseCode === waiver.courseCode
          ? { ...s, waiverGranted: true }
          : s
      )
    );
    recordAudit(
      'MEDICAL_ATTENDANCE_WAIVER_APPROVED',
      'ATTENDANCE_WAIVER',
      waiver.matricNumber
    );
    showToast({
      type: 'success',
      title: 'Waiver Ratified',
      message: `Statutory examination waiver granted for ${waiver.fullName} (${waiver.matricNumber}).`,
    });
    setIsWaiverModalOpen(false);
  };

  const handleRejectWaiver = (waiver: MedicalWaiver) => {
    setWaivers((prev) =>
      prev.map((w) =>
        w.id === waiver.id
          ? { ...w, status: 'REJECTED', reviewedBy: 'Dr. Timothy Balogun (Provost)' }
          : w
      )
    );
    recordAudit(
      'MEDICAL_ATTENDANCE_WAIVER_REJECTED',
      'ATTENDANCE_WAIVER',
      waiver.matricNumber
    );
    showToast({
      type: 'danger',
      title: 'Waiver Rejected',
      message: `Statutory examination waiver rejected for ${waiver.fullName}. Student remains barred under the 75% rule.`,
    });
    setIsWaiverModalOpen(false);
  };

  const openExamDocket = (student: AttendanceStudent) => {
    setSelectedDocketStudent(student);
    setIsDocketModalOpen(true);
  };

  /* ─── DERIVED FILTERED STUDENTS ─── */
  const filteredStudents = students.filter((s) => {
    if (activeTab === 'register' && s.courseCode !== selectedCourse) return false;
    if (selectedDept !== 'ALL' && s.departmentCode !== selectedDept) return false;
    if (selectedLevel !== 'ALL' && s.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchMatric = s.matricNumber.toLowerCase().includes(q);
      if (!matchName && !matchMatric) return false;
    }
    if (clearanceFilter !== 'ALL') {
      const pct = Math.round((s.attendedSessions / s.totalSessions) * 100);
      const isEligible = pct >= 75 || s.waiverGranted;
      const isFeeCleared = s.bursaryStatus === 'CLEARED';
      const isClinicalCleared = s.clinicalStatus === 'CLEARED' || s.clinicalStatus === 'NOT_APPLICABLE';
      const status: ClearanceStatus = isEligible && isFeeCleared && isClinicalCleared
        ? 'CLEARED'
        : (!isEligible ? 'BARRED' : 'PROVISIONAL');
      if (status !== clearanceFilter) return false;
    }
    return true;
  });

  /* ─── STATS ─── */
  const totalEnrolled = students.length;
  const eligibleCount = students.filter(
    (s) => Math.round((s.attendedSessions / s.totalSessions) * 100) >= 75 || s.waiverGranted
  ).length;
  const barredCount = totalEnrolled - eligibleCount;
  const overallPct = Math.round((eligibleCount / totalEnrolled) * 100);

  /* ─── TABLE COLUMNS: DAILY REGISTER ─── */
  const registerColumns = [
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      render: (s: AttendanceStudent) => (
        <span className="font-semibold text-slate-900">{s.matricNumber}</span>
      ),
    },
    {
      key: 'fullName',
      header: 'Student Name',
      render: (s: AttendanceStudent) => (
        <div>
          <span className="font-semibold text-slate-800 block">{s.fullName}</span>
          <span className="text-[11px] text-slate-400">{s.departmentName} • {s.level}</span>
        </div>
      ),
    },
    {
      key: 'cumulative',
      header: 'Course Attendance Rate',
      render: (s: AttendanceStudent) => {
        const pct = Math.round((s.attendedSessions / s.totalSessions) * 100);
        const isEligible = pct >= 75 || s.waiverGranted;
        return (
          <div className="flex items-center gap-2">
            <div>
              <span className="font-semibold text-slate-800 block">
                {s.attendedSessions} of {s.totalSessions} lectures ({pct}%)
              </span>
              <div className="w-24 bg-slate-200 h-1.5 rounded-[4px] overflow-hidden mt-1">
                <div
                  className={`h-full ${pct >= 75 ? 'bg-[#13A348]' : 'bg-[#F83A20]'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
            {s.waiverGranted ? (
              <Badge variant="primary" size="sm">
                Waiver Approved
              </Badge>
            ) : (
              <Badge variant={isEligible ? 'success' : 'danger'} size="sm">
                {isEligible ? 'Eligible (>=75%)' : 'Barred (<75%)'}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'marking',
      header: "Today's Attendance",
      align: 'right' as const,
      nowrap: true,
      render: (s: AttendanceStudent) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
          <button
            type="button"
            onClick={() => handleToggleStatus(s.id, 'PRESENT')}
            className={`px-2.5 py-1 text-xs rounded-[4px] border font-semibold flex items-center gap-1 whitespace-nowrap transition-colors ${
              s.statusToday === 'PRESENT'
                ? 'bg-[#13A348] text-white border-[#13A348]'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Check className="w-3 h-3 shrink-0" /> Present
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(s.id, 'ABSENT')}
            className={`px-2.5 py-1 text-xs rounded-[4px] border font-semibold flex items-center gap-1 whitespace-nowrap transition-colors ${
              s.statusToday === 'ABSENT'
                ? 'bg-[#F83A20] text-white border-[#F83A20]'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <X className="w-3 h-3 shrink-0" /> Absent
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(s.id, 'EXCUSED')}
            className={`px-2.5 py-1 text-xs rounded-[4px] border font-semibold flex items-center gap-1 whitespace-nowrap transition-colors ${
              s.statusToday === 'EXCUSED'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3 h-3 shrink-0" /> Excused
          </button>
        </div>
      ),
    },
  ];

  /* ─── TABLE COLUMNS: COURSE SUMMARIES ─── */
  const courseColumns = [
    {
      key: 'courseCode',
      header: 'Course Code & Title',
      render: (c: CourseSummary) => (
        <div>
          <span className="font-bold text-slate-900 block">{c.courseCode}</span>
          <span className="text-xs text-slate-600">{c.courseTitle}</span>
        </div>
      ),
    },
    {
      key: 'lecturer',
      header: 'Course Lecturer & Venue',
      render: (c: CourseSummary) => (
        <div>
          <span className="font-semibold text-slate-800 block">{c.lecturer}</span>
          <span className="text-[11px] text-slate-400">{c.lectureHall}</span>
        </div>
      ),
    },
    {
      key: 'lectures',
      header: 'Lectures Held',
      render: (c: CourseSummary) => (
        <span className="font-semibold text-slate-800">{c.totalLecturesHeld} Sessions</span>
      ),
    },
    {
      key: 'avgRate',
      header: 'Avg. Attendance',
      render: (c: CourseSummary) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{c.avgAttendanceRate}%</span>
          <Badge variant={c.avgAttendanceRate >= 85 ? 'success' : 'warning'} size="sm">
            {c.avgAttendanceRate >= 85 ? 'High Compliance' : 'Average'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'clearanceStats',
      header: 'Exam Eligibility',
      render: (c: CourseSummary) => (
        <div className="text-xs">
          <span className="text-[#13A348] font-semibold">{c.eligibleCount} Eligible</span>
          <span className="text-slate-300 mx-1">|</span>
          <span className="text-[#F83A20] font-semibold">{c.barredCount} Barred</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      nowrap: true,
      render: (c: CourseSummary) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedCourse(c.courseCode);
            handleTabChange('register');
          }}
        >
          Open Register
        </Button>
      ),
    },
  ];

  /* ─── TABLE COLUMNS: EXAM CLEARANCE & DOCKETS ─── */
  const clearanceColumns = [
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      render: (s: AttendanceStudent) => (
        <span className="font-semibold text-slate-900">{s.matricNumber}</span>
      ),
    },
    {
      key: 'fullName',
      header: 'Student Name',
      render: (s: AttendanceStudent) => (
        <div>
          <span className="font-semibold text-slate-800 block">{s.fullName}</span>
          <span className="text-[11px] text-slate-400">{s.departmentName} • {s.level}</span>
        </div>
      ),
    },
    {
      key: 'attendanceCheck',
      header: 'Attendance (75% Rule)',
      render: (s: AttendanceStudent) => {
        const pct = Math.round((s.attendedSessions / s.totalSessions) * 100);
        const isEligible = pct >= 75 || s.waiverGranted;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{pct}%</span>
              {s.waiverGranted && (
                <span className="text-[10px] px-1 py-0.5 rounded-[4px] bg-blue-50 text-blue-700 font-bold">
                  WAIVER
                </span>
              )}
            </div>
            <span className={`text-[11px] font-semibold ${isEligible ? 'text-[#13A348]' : 'text-[#F83A20]'}`}>
              {isEligible ? 'Qualified' : 'Barred (<75%)'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'bursaryCheck',
      header: 'Fee Clearance',
      render: (s: AttendanceStudent) => {
        const colors = {
          CLEARED: 'bg-emerald-50 text-[#13A348] border-emerald-200',
          PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
          OVERDUE: 'bg-rose-50 text-[#F83A20] border-rose-200',
        };
        return (
          <span className={`text-xs px-2 py-0.5 rounded-[4px] border font-bold ${colors[s.bursaryStatus]}`}>
            {s.bursaryStatus}
          </span>
        );
      },
    },
    {
      key: 'overallStatus',
      header: 'Final Docket Status',
      render: (s: AttendanceStudent) => {
        const pct = Math.round((s.attendedSessions / s.totalSessions) * 100);
        const isAttendanceEligible = pct >= 75 || s.waiverGranted;
        const isFeeCleared = s.bursaryStatus === 'CLEARED';
        const isClinicalCleared = s.clinicalStatus === 'CLEARED' || s.clinicalStatus === 'NOT_APPLICABLE';

        const status: ClearanceStatus = isAttendanceEligible && isFeeCleared && isClinicalCleared
          ? 'CLEARED'
          : (!isAttendanceEligible ? 'BARRED' : 'PROVISIONAL');

        const badgeMap = {
          CLEARED: { variant: 'success' as const, label: 'Cleared for Exams' },
          PROVISIONAL: { variant: 'warning' as const, label: 'Pending Bursary' },
          BARRED: { variant: 'danger' as const, label: 'Barred from Exams' },
        };

        return (
          <Badge variant={badgeMap[status].variant}>
            {badgeMap[status].label}
          </Badge>
        );
      },
    },
    {
      key: 'action',
      header: 'Examination Docket',
      align: 'right' as const,
      nowrap: true,
      render: (s: AttendanceStudent) => {
        const pct = Math.round((s.attendedSessions / s.totalSessions) * 100);
        const isAttendanceEligible = pct >= 75 || s.waiverGranted;

        return (
          <Button
            variant={isAttendanceEligible ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => openExamDocket(s)}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="whitespace-nowrap"
          >
            Print Docket
          </Button>
        );
      },
    },
  ];

  /* ─── TABLE COLUMNS: MEDICAL WAIVERS ─── */
  const waiverColumns = [
    {
      key: 'matricNumber',
      header: 'Student & Matric',
      render: (w: MedicalWaiver) => (
        <div>
          <span className="font-semibold text-slate-900 block">{w.fullName}</span>
          <span className="text-[11px] text-slate-500">{w.matricNumber} • {w.departmentCode}</span>
        </div>
      ),
    },
    {
      key: 'courseCode',
      header: 'Course & Attendance',
      render: (w: MedicalWaiver) => (
        <div>
          <span className="font-bold text-slate-800 block">{w.courseCode}</span>
          <span className="text-[11px] text-[#F83A20] font-semibold">{w.preWaiverRate}% (Below 75%)</span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Documented Clinical Reason',
      render: (w: MedicalWaiver) => (
        <div className="max-w-xs">
          <p className="text-xs text-slate-800 truncate" title={w.documentedReason}>
            {w.documentedReason}
          </p>
          <span className="text-[11px] text-slate-400 block">{w.medicalFacility}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Review Status',
      render: (w: MedicalWaiver) => {
        const badgeMap = {
          APPROVED: { variant: 'success' as const, label: 'Waiver Ratified' },
          PENDING: { variant: 'warning' as const, label: 'Pending Provost' },
          REJECTED: { variant: 'danger' as const, label: 'Waiver Denied' },
        };
        return (
          <div>
            <Badge variant={badgeMap[w.status].variant}>
              {badgeMap[w.status].label}
            </Badge>
            {w.reviewedBy && (
              <span className="text-[10px] text-slate-400 block mt-0.5">{w.reviewedBy}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      nowrap: true,
      render: (w: MedicalWaiver) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedWaiver(w);
            setIsWaiverModalOpen(true);
          }}
        >
          Review Appeal
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Class Attendance & Exam Clearance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional lecture roll-call registers, statutory 75% attendance rule compliance, and official examination dockets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'register' && (
            <Button size="sm" onClick={handleSaveRegister} className="flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5" />
              Save Class Register
            </Button>
          )}
          {activeTab === 'clearance' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Batch Docket Export',
                  message: 'Preparing PDF examination docket bundle for all cleared trainees.',
                });
              }}
              className="flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Cleared Dockets
            </Button>
          )}
        </div>
      </div>

      {/* ─── Institutional Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-white border border-slate-200 rounded-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Rate
            </span>
            <div className="w-7 h-7 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{overallPct}%</span>
            <span className="text-xs text-[#13A348] font-semibold">+1.8% vs last month</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">First Semester 2026/2027 session</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Exam Cleared
            </span>
            <div className="w-7 h-7 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{eligibleCount}</span>
            <span className="text-xs text-slate-500">of {totalEnrolled} trainees</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Qualified under 75% rule & fees</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Barred From Exams
            </span>
            <div className="w-7 h-7 rounded-[4px] bg-rose-50 text-[#F83A20] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F83A20]">{barredCount}</span>
            <span className="text-xs text-[#F83A20] font-semibold">Under 75% threshold</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Subject to academic review or waiver</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Courses
            </span>
            <div className="w-7 h-7 rounded-[4px] bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">7</span>
            <span className="text-xs text-slate-500">Accredited curricula</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 5 health departments</p>
        </Card>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <Tabs
        tabs={[
          { id: 'register', label: 'Daily Class Register' },
          { id: 'courses', label: 'Course Attendance Summaries' },
          { id: 'clearance', label: 'Exam Clearance & Dockets' },
          { id: 'waivers', label: 'Medical Appeals & Waivers' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: DAILY CLASS REGISTER ─── */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          {/* Lecture Session Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {selectedCourse}: Primary Health Care & Community Mobilization
                </span>
                <Badge variant="primary" size="sm">Session 24</Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-3">
                <span>Lecture Hall 2 • Instructor: Dr. K. Bello</span>
                <span>•</span>
                <span>Date: {sessionDate}</span>
                <span>•</span>
                <span className="text-[#0F7640] font-semibold">Statutory 75% Requirement</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleMarkAll('PRESENT')}
                className="text-xs"
              >
                Mark All Present
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleMarkAll('ABSENT')}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-48">
                <Select
                  value={selectedCourse}
                  onChange={(val) => setSelectedCourse(val)}
                  options={[
                    { value: 'CHE 201', label: 'CHE 201 (Community Health)' },
                    { value: 'MLT 201', label: 'MLT 201 (Med Laboratory)' },
                    { value: 'PHT 201', label: 'PHT 201 (Pharmacy Tech)' },
                    { value: 'HIM 201', label: 'HIM 201 (Health Info)' },
                    { value: 'EHT 201', label: 'EHT 201 (Environmental)' },
                  ]}
                />
              </div>
              <div className="w-36">
                <Select
                  value={selectedLevel}
                  onChange={(val) => setSelectedLevel(val)}
                  options={[
                    { value: 'ALL', label: 'All Levels' },
                    { value: '100L', label: '100 Level' },
                    { value: '200L', label: '200 Level' },
                    { value: '300L', label: '300 Level' },
                  ]}
                />
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search trainee name or matric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          {/* Register Table */}
          <Card>
            <Table
              columns={registerColumns}
              data={filteredStudents}
              keyExtractor={(s) => s.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 2: COURSE ATTENDANCE SUMMARIES ─── */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Departmental cohort attendance rates across all accredited courses for First Semester 2026/2027.
            </p>
          </div>
          <Card>
            <Table
              columns={courseColumns}
              data={courses}
              keyExtractor={(c) => c.courseCode}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 3: EXAM CLEARANCE & DOCKETS ─── */}
      {activeTab === 'clearance' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-40">
                <Select
                  value={selectedDept}
                  onChange={(val) => setSelectedDept(val)}
                  options={[
                    { value: 'ALL', label: 'All Departments' },
                    { value: 'CHE', label: 'Community Health' },
                    { value: 'MLT', label: 'Medical Laboratory' },
                    { value: 'PHT', label: 'Pharmacy Tech' },
                    { value: 'HIM', label: 'Health Information' },
                    { value: 'EHT', label: 'Environmental Health' },
                  ]}
                />
              </div>
              <div className="w-44">
                <Select
                  value={clearanceFilter}
                  onChange={(val) => setClearanceFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'CLEARED', label: 'Cleared for Exams' },
                    { value: 'PROVISIONAL', label: 'Pending Bursary' },
                    { value: 'BARRED', label: 'Barred (<75%)' },
                  ]}
                />
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search matric or trainee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <Card>
            <Table
              columns={clearanceColumns}
              data={filteredStudents}
              keyExtractor={(s) => s.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 4: MEDICAL APPEALS & WAIVERS ─── */}
      {activeTab === 'waivers' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-[4px] flex items-center gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Statutory Exception Rule:</strong> Trainees falling below 75% class attendance due to verified hospitalization, clinical emergency, or bereavement may be cleared only via ratified Provost waiver.
            </span>
          </div>

          <Card>
            <Table
              columns={waiverColumns}
              data={waivers}
              keyExtractor={(w) => w.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── MODAL 1: OFFICIAL EXAMINATION DOCKET / CLEARANCE SLIP ─── */}
      <Modal
        isOpen={isDocketModalOpen}
        onClose={() => setIsDocketModalOpen(false)}
        title="Official Examination Docket & Clearance Pass"
        size="lg"
      >
        {selectedDocketStudent && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Docket Header & Letterhead */}
            <div className="border border-slate-200 p-5 rounded-[4px] bg-white relative">
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="w-12 h-12 mx-auto mb-2 rounded-[4px] bg-[#0F7640] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  BCHT
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                  Bethsaida College of Health Technology
                </h2>
                <p className="text-[11px] text-slate-500">
                  Approved by Federal Ministry of Health • Moniya, Ibadan, Oyo State, Nigeria
                </p>
                <div className="inline-block mt-2 px-3 py-0.5 rounded-[4px] bg-emerald-50 text-[#0F7640] border border-emerald-200 font-extrabold uppercase text-[11px]">
                  Official Examination Clearance Docket • 2026/2027 Session
                </div>
              </div>

              {/* Trainee Profile & Photo Card */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center bg-slate-50/70 p-3 rounded-[4px] border border-slate-100">
                <div className="sm:col-span-1 flex flex-col items-center justify-center">
                  <div className="w-20 h-24 rounded-[4px] bg-slate-200 border border-slate-300 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold">
                    <span>PASSPORT</span>
                    <span>PHOTO</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold mt-1">VERIFIED</span>
                </div>
                <div className="sm:col-span-3 space-y-1.5 min-w-0">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Candidate Full Name</span>
                      <span className="font-bold text-slate-900 text-sm truncate block">
                        {selectedDocketStudent.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Matriculation No.</span>
                      <span className="font-bold text-[#0F7640] text-sm block">
                        {selectedDocketStudent.matricNumber}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Department / Track</span>
                      <span className="font-semibold text-slate-800 text-xs block truncate">
                        {selectedDocketStudent.departmentName} ({selectedDocketStudent.level})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Clearance Status</span>
                      <span className="font-extrabold text-[#13A348] text-xs block">
                        CLEARED FOR ALL EXAMINATIONS
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Registration & Verified Attendance Table */}
              <div className="mt-5 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Registered Courses & Attendance Sign-off
                </span>
                <div className="border border-slate-200 rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2">Course Code</th>
                        <th className="p-2">Course Title</th>
                        <th className="p-2 text-center">Attendance %</th>
                        <th className="p-2 text-center">Eligibility</th>
                        <th className="p-2 text-right">Invigilator Sign</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 font-bold text-slate-900">{selectedDocketStudent.courseCode}</td>
                        <td className="p-2 text-slate-700">Primary Health Care & Community Mobilization</td>
                        <td className="p-2 text-center font-bold text-slate-900">
                          {Math.round((selectedDocketStudent.attendedSessions / selectedDocketStudent.totalSessions) * 100)}%
                        </td>
                        <td className="p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-100 text-[#0F7640] font-bold text-[10px]">
                            CLEARED
                          </span>
                        </td>
                        <td className="p-2 text-right text-slate-400 font-light">_________________</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-slate-900">CHE 203</td>
                        <td className="p-2 text-slate-700">Maternal & Child Health Practice</td>
                        <td className="p-2 text-center font-bold text-slate-900">92%</td>
                        <td className="p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-100 text-[#0F7640] font-bold text-[10px]">
                            CLEARED
                          </span>
                        </td>
                        <td className="p-2 text-right text-slate-400 font-light">_________________</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-slate-900">GNS 201</td>
                        <td className="p-2 text-slate-700">Medical Ethics & Health Law</td>
                        <td className="p-2 text-center font-bold text-slate-900">88%</td>
                        <td className="p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-100 text-[#0F7640] font-bold text-[10px]">
                            CLEARED
                          </span>
                        </td>
                        <td className="p-2 text-right text-slate-400 font-light">_________________</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statutory Exam Rules */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Examination Instructions:</span>
                <p>1. Candidates must arrive at the examination venue at least 15 minutes prior to commencement.</p>
                <p>2. Electronic devices, smartwatches, and unauthorized materials are strictly prohibited.</p>
                <p>3. This docket must be presented alongside the official College Student ID Card.</p>
              </div>

              {/* Seal & Verification Signature */}
              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 items-end">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Bursary Clearance Stamp</span>
                  <div className="w-28 h-10 border border-dashed border-emerald-600 rounded-[4px] flex items-center justify-center text-[10px] font-bold text-[#0F7640] bg-emerald-50/50 mt-1">
                    FEES CLEARED
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-32 border-b border-slate-800 ml-auto mb-1"></div>
                  <span className="font-bold text-slate-900 text-xs block">Registrar & Academic Secretary</span>
                  <span className="text-[10px] text-slate-400">Bethsaida College of Health Tech</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setIsDocketModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Official Docket
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: MEDICAL WAIVER REVIEW ─── */}
      <Modal
        isOpen={isWaiverModalOpen}
        onClose={() => setIsWaiverModalOpen(false)}
        title="Statutory Attendance Waiver Review"
        size="md"
      >
        {selectedWaiver && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedWaiver.fullName}</span>
                <span className="font-semibold text-slate-600">{selectedWaiver.matricNumber}</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Department: {selectedWaiver.departmentCode} • Course: {selectedWaiver.courseCode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
              <div>
                <span className="text-slate-400 block text-[11px]">Recorded Attendance Rate</span>
                <span className="font-bold text-rose-600 text-sm">
                  {selectedWaiver.preWaiverRate}% (Barred)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date Application Filed</span>
                <span className="font-semibold text-slate-800">{selectedWaiver.dateFiled}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">Documented Clinical Grounds:</span>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-slate-700 leading-relaxed">
                {selectedWaiver.documentedReason}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">Attending Medical Facility:</span>
              <p className="text-slate-700 font-medium">{selectedWaiver.medicalFacility}</p>
              <div className="flex items-center gap-1.5 text-[#0F7640] font-semibold pt-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Supporting Attachment: {selectedWaiver.supportingDocument}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setIsWaiverModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleRejectWaiver(selectedWaiver)}
              >
                Reject Waiver
              </Button>
              <Button
                onClick={() => handleApproveWaiver(selectedWaiver)}
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Grant Provost Waiver
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
