import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Tabs,
  Input,
  Select,
  useToast,
} from '@campusone/ui';
import {
  IdCard,
  QrCode,
  Printer,
  UserCheck,
  Search,
  Plus,
  FileText,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Award,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface Student {
  id: string;
  matricNumber: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Female' | 'Male';
  stateOfOrigin: string;
  lga: string;
  departmentCode: string;
  department: string;
  programmeCode: string;
  programme: string;
  level: '100 Level' | '200 Level' | '300 Level';
  session: string;
  bloodGroup: 'O+' | 'A+' | 'B+' | 'AB+' | 'O-' | 'A-';
  genotype: 'AA' | 'AS' | 'AC';
  hepatitisBStatus: 'VACCINATED' | 'PENDING' | 'DOSE_1_ONLY';
  clinicalClearance: 'CLEARED' | 'PENDING' | 'INELIGIBLE';
  cgpa: number;
  academicStanding: 'Good Standing' | 'Dean’s Honor List' | 'Academic Warning';
  feesStatus: 'CLEARED' | 'PARTIAL' | 'OVERDUE';
  status: 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'DEFERRED' | 'GRADUATED';
  statusReason?: string;
  dateEnrolled: string;
}

// Industry Standard Code 128 / Code 39 Linear Barcode (Strictly font-sans)
const Barcode: React.FC<{ value: string; className?: string }> = ({ value, className = '' }) => {
  const bars = [
    2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 2, 3, 1, 2, 1, 1, 3,
    1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2,
    1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 2,
    1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 2, 3, 1, 2, 1, 1,
  ];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-end h-7 gap-[1.5px] bg-white px-2 py-0.5 rounded-[2px] border border-slate-200">
        {bars.map((width, idx) => (
          <span
            key={idx}
            className={`h-full ${idx % 2 === 0 ? 'bg-slate-900' : 'bg-transparent'}`}
            style={{ width: `${width}px` }}
          />
        ))}
      </div>
      <span className="text-[9px] font-semibold tracking-widest text-slate-700 mt-0.5 font-sans">
        *{value}*
      </span>
    </div>
  );
};

export const StudentsView: React.FC = () => {
  const { isDense, recordAudit } = useApp();
  const { showToast } = useToast();
  const { tab: routeTab } = useParams();
  const navigate = useNavigate();

  // Industry-standard page routing
  const activeTab = routeTab === 'id-cards' ? 'id_cards' : (routeTab || 'directory');

  const handleTabChange = (id: string) => {
    if (id === 'directory') {
      navigate('/students');
    } else if (id === 'id_cards') {
      navigate('/students/id-cards');
    } else {
      navigate(`/students/${id}`);
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedIdCard, setSelectedIdCard] = useState<Student | null>(null);
  const [statusStudent, setStatusStudent] = useState<Student | null>(null);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);

  // Status Mutation Form State
  const [statusForm, setStatusForm] = useState({
    newStatus: 'PROBATION',
    senateMemo: 'SENATE/2026/M04',
    effectiveDate: '2026-11-15',
    reason: 'Academic performance review or administrative action',
  });

  // New Student Enrollment Form State
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Female',
    programmeCode: 'CHEW',
    level: '100 Level',
    stateOfOrigin: 'Oyo',
    bloodGroup: 'O+',
    genotype: 'AA',
    hepatitisBStatus: 'VACCINATED',
  });

  // Master Trainees Registry
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'stu-001',
      matricNumber: 'CHE/2026/0014',
      fullName: 'Blessing Adeyemi',
      email: 'blessing.adeyemi@bethsaida.edu.ng',
      phone: '+234 803 124 5510',
      gender: 'Female',
      stateOfOrigin: 'Oyo',
      lga: 'Ibadan North',
      departmentCode: 'CHE',
      department: 'Department of Community Health',
      programmeCode: 'CHEW',
      programme: 'Community Health Extension Worker (CHEW)',
      level: '200 Level',
      session: '2026/2027',
      bloodGroup: 'O+',
      genotype: 'AA',
      hepatitisBStatus: 'VACCINATED',
      clinicalClearance: 'CLEARED',
      cgpa: 3.84,
      academicStanding: 'Good Standing',
      feesStatus: 'CLEARED',
      status: 'ACTIVE',
      dateEnrolled: '2025-10-12',
    },
    {
      id: 'stu-002',
      matricNumber: 'MLT/2026/0029',
      fullName: 'Emmanuel Chukwuma',
      email: 'emmanuel.chukwuma@bethsaida.edu.ng',
      phone: '+234 802 771 9044',
      gender: 'Male',
      stateOfOrigin: 'Delta',
      lga: 'Aniocha North',
      departmentCode: 'MLT',
      department: 'Department of Medical Laboratory Technology',
      programmeCode: 'MLT',
      programme: 'Medical Laboratory Technician (MLT)',
      level: '100 Level',
      session: '2026/2027',
      bloodGroup: 'A+',
      genotype: 'AS',
      hepatitisBStatus: 'VACCINATED',
      clinicalClearance: 'CLEARED',
      cgpa: 4.20,
      academicStanding: 'Dean’s Honor List',
      feesStatus: 'CLEARED',
      status: 'ACTIVE',
      dateEnrolled: '2026-10-05',
    },
    {
      id: 'stu-003',
      matricNumber: 'PHT/2026/0009',
      fullName: 'Khadijat Sani',
      email: 'khadijat.sani@bethsaida.edu.ng',
      phone: '+234 805 443 1899',
      gender: 'Female',
      stateOfOrigin: 'Kwara',
      lga: 'Ilorin West',
      departmentCode: 'PHT',
      department: 'Department of Pharmacy Technician Studies',
      programmeCode: 'PHT',
      programme: 'Pharmacy Technician',
      level: '100 Level',
      session: '2026/2027',
      bloodGroup: 'B+',
      genotype: 'AA',
      hepatitisBStatus: 'PENDING',
      clinicalClearance: 'PENDING',
      cgpa: 3.45,
      academicStanding: 'Good Standing',
      feesStatus: 'PARTIAL',
      status: 'ACTIVE',
      dateEnrolled: '2026-10-06',
    },
    {
      id: 'stu-004',
      matricNumber: 'HIM/2026/0004',
      fullName: 'David Adeleke',
      email: 'david.adeleke@bethsaida.edu.ng',
      phone: '+234 809 332 7655',
      gender: 'Male',
      stateOfOrigin: 'Osun',
      lga: 'Ede South',
      departmentCode: 'HIM',
      department: 'Department of Health Information Management',
      programmeCode: 'HIM',
      programme: 'Health Information Management (HIM)',
      level: '200 Level',
      session: '2026/2027',
      bloodGroup: 'O+',
      genotype: 'AA',
      hepatitisBStatus: 'VACCINATED',
      clinicalClearance: 'CLEARED',
      cgpa: 3.12,
      academicStanding: 'Good Standing',
      feesStatus: 'CLEARED',
      status: 'ACTIVE',
      dateEnrolled: '2025-10-14',
    },
    {
      id: 'stu-005',
      matricNumber: 'EHT/2026/0002',
      fullName: 'Fatima Ibrahim',
      email: 'fatima.ibrahim@bethsaida.edu.ng',
      phone: '+234 807 551 2244',
      gender: 'Female',
      stateOfOrigin: 'Kogi',
      lga: 'Lokoja',
      departmentCode: 'EHT',
      department: 'Department of Environmental Health Sciences',
      programmeCode: 'EHT',
      programme: 'Environmental Health Technology (EHT)',
      level: '300 Level',
      session: '2026/2027',
      bloodGroup: 'A+',
      genotype: 'AA',
      hepatitisBStatus: 'VACCINATED',
      clinicalClearance: 'CLEARED',
      cgpa: 3.90,
      academicStanding: 'Dean’s Honor List',
      feesStatus: 'CLEARED',
      status: 'ACTIVE',
      dateEnrolled: '2024-10-10',
    },
    {
      id: 'stu-006',
      matricNumber: 'CHE/2026/0088',
      fullName: 'Sunday Okon',
      email: 'sunday.okon@bethsaida.edu.ng',
      phone: '+234 812 334 9911',
      gender: 'Male',
      stateOfOrigin: 'Akwa Ibom',
      lga: 'Uyo',
      departmentCode: 'CHE',
      department: 'Department of Community Health',
      programmeCode: 'CHEW',
      programme: 'Community Health Extension Worker (CHEW)',
      level: '100 Level',
      session: '2026/2027',
      bloodGroup: 'O-',
      genotype: 'AS',
      hepatitisBStatus: 'DOSE_1_ONLY',
      clinicalClearance: 'PENDING',
      cgpa: 1.95,
      academicStanding: 'Academic Warning',
      feesStatus: 'OVERDUE',
      status: 'PROBATION',
      statusReason: 'CGPA below 2.00 benchmark after Harmattan results.',
      dateEnrolled: '2026-10-08',
    },
    {
      id: 'stu-007',
      matricNumber: 'MLT/2026/0061',
      fullName: 'Zainab Bello',
      email: 'zainab.bello@bethsaida.edu.ng',
      phone: '+234 816 772 3300',
      gender: 'Female',
      stateOfOrigin: 'Oyo',
      lga: 'Oyo West',
      departmentCode: 'MLT',
      department: 'Department of Medical Laboratory Technology',
      programmeCode: 'MLT',
      programme: 'Medical Laboratory Technician (MLT)',
      level: '200 Level',
      session: '2026/2027',
      bloodGroup: 'AB+',
      genotype: 'AA',
      hepatitisBStatus: 'VACCINATED',
      clinicalClearance: 'CLEARED',
      cgpa: 3.68,
      academicStanding: 'Good Standing',
      feesStatus: 'CLEARED',
      status: 'ACTIVE',
      dateEnrolled: '2025-10-15',
    },
  ]);

  // Handle Status Mutation
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusStudent) return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === statusStudent.id) {
          recordAudit('STUDENT_STATUS_MUTATED', 'STUDENT_RECORD', s.matricNumber, {
            previousStatus: s.status,
            newStatus: statusForm.newStatus,
            memo: statusForm.senateMemo,
          });
          return {
            ...s,
            status: statusForm.newStatus as any,
            statusReason: statusForm.reason,
          };
        }
        return s;
      })
    );

    const targetStudent = statusStudent;
    setStatusStudent(null);
    showToast({
      type: 'success',
      title: 'Status Updated',
      message: `${targetStudent.fullName} transitioned to ${statusForm.newStatus} via Senate Minute ${statusForm.senateMemo}.`,
    });
  };

  // Handle New Student Registration
  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.fullName || !newStudentForm.email || !newStudentForm.phone) {
      showToast({
        type: 'danger',
        title: 'Missing Required Fields',
        message: 'Please provide student name, institutional email, and phone.',
      });
      return;
    }

    const nextSerial = Math.floor(100 + Math.random() * 899);
    const matricNumber = `${newStudentForm.programmeCode}/2026/0${nextSerial}`;

    const deptMap: Record<string, { dept: string; name: string }> = {
      CHEW: { dept: 'CHE', name: 'Community Health Extension Worker (CHEW)' },
      JCHEW: { dept: 'CHE', name: 'Junior Community Health Extension Worker (JCHEW)' },
      MLT: { dept: 'MLT', name: 'Medical Laboratory Technician (MLT)' },
      MLA: { dept: 'MLT', name: 'Medical Laboratory Assistant (MLA)' },
      PHT: { dept: 'PHT', name: 'Pharmacy Technician' },
      HIM: { dept: 'HIM', name: 'Health Information Management (HIM)' },
      EHT: { dept: 'EHT', name: 'Environmental Health Technology (EHT)' },
    };

    const progInfo = deptMap[newStudentForm.programmeCode] || deptMap.CHEW;

    const newStudent: Student = {
      id: `stu-${Date.now().toString().slice(-4)}`,
      matricNumber,
      fullName: newStudentForm.fullName,
      email: newStudentForm.email,
      phone: newStudentForm.phone,
      gender: newStudentForm.gender as 'Female' | 'Male',
      stateOfOrigin: newStudentForm.stateOfOrigin,
      lga: 'Capital LGA',
      departmentCode: progInfo.dept,
      department: `Department of ${progInfo.name}`,
      programmeCode: newStudentForm.programmeCode,
      programme: progInfo.name,
      level: newStudentForm.level as any,
      session: '2026/2027',
      bloodGroup: newStudentForm.bloodGroup as any,
      genotype: newStudentForm.genotype as any,
      hepatitisBStatus: newStudentForm.hepatitisBStatus as any,
      clinicalClearance: newStudentForm.hepatitisBStatus === 'VACCINATED' ? 'CLEARED' : 'PENDING',
      cgpa: 3.50,
      academicStanding: 'Good Standing',
      feesStatus: 'CLEARED',
      status: 'ACTIVE',
      dateEnrolled: new Date().toISOString().split('T')[0],
    };

    setStudents((prev) => [newStudent, ...prev]);
    setIsNewStudentOpen(false);
    showToast({
      type: 'success',
      title: 'Trainee Enrolled',
      message: `${newStudent.fullName} registered with matriculation number ${newStudent.matricNumber}.`,
    });
  };

  // Filtered Students List
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchesDept =
      selectedDeptFilter === 'ALL' || s.departmentCode === selectedDeptFilter;
    const matchesLevel =
      selectedLevelFilter === 'ALL' || s.level === selectedLevelFilter;
    const matchesStatus =
      selectedStatusFilter === 'ALL' || s.status === selectedStatusFilter;
    return matchesSearch && matchesDept && matchesLevel && matchesStatus;
  });

  // Table Columns for Student Directory
  const studentColumns = [
    {
      key: 'matricNumber',
      header: 'Matric No.',
      render: (s: Student) => (
        <span className="font-extrabold text-[#0F7640] text-sm tracking-wide font-sans">
          {s.matricNumber}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Student Full Name',
      render: (s: Student) => (
        <div className="whitespace-nowrap">
          <p className="font-bold text-slate-900">{s.fullName}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {s.gender} • {s.stateOfOrigin} State • {s.phone}
          </span>
        </div>
      ),
    },
    {
      key: 'programme',
      header: 'Programme & Level',
      render: (s: Student) => (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-slate-800">{s.programme}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {s.level} • {s.session}
          </span>
        </div>
      ),
    },
    {
      key: 'clinicalHealth',
      header: 'Clinical Health / Serology',
      render: (s: Student) => (
        <div className="whitespace-nowrap text-xs">
          <span className="font-bold text-slate-900">{s.bloodGroup}</span>
          <span className="text-slate-400 mx-1">•</span>
          <span className="font-bold text-slate-800">{s.genotype}</span>
          <Badge
            size="sm"
            variant={s.hepatitisBStatus === 'VACCINATED' ? 'success' : 'warning'}
            className="ml-2"
          >
            HepB: {s.hepatitisBStatus === 'VACCINATED' ? 'Vaccinated' : 'Pending'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      align: 'right' as const,
      render: (s: Student) => (
        <div className="text-right whitespace-nowrap">
          <span className="font-extrabold text-slate-900 text-sm font-sans">{s.cgpa.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block">{s.academicStanding}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Lifecycle Status',
      render: (s: Student) => (
        <Badge
          variant={
            s.status === 'ACTIVE'
              ? 'success'
              : s.status === 'PROBATION'
              ? 'warning'
              : s.status === 'GRADUATED'
              ? 'primary'
              : 'danger'
          }
        >
          {s.status}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right' as const,
      render: (s: Student) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedStudent(s)}
          >
            Profile
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<IdCard className="w-3.5 h-3.5" />}
            onClick={() => setSelectedIdCard(s)}
          >
            ID
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setStatusStudent(s);
              setStatusForm({
                newStatus: s.status === 'ACTIVE' ? 'PROBATION' : 'ACTIVE',
                senateMemo: 'SENATE/2026/M04',
                effectiveDate: new Date().toISOString().split('T')[0],
                reason: s.statusReason || 'Administrative lifecycle adjustment',
              });
            }}
          >
            Status
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Students</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Student Information System (SIS), clinical serology profiles, academic lifecycles, and ID cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => {
              setSelectedIdCard(students[0]);
            }}
          >
            Print ID Card
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewStudentOpen(true)}
          >
            Enroll Student
          </Button>
        </div>
      </div>

      {/* 4 Core Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrolled
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">1,248</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-600 font-semibold">5 Health depts</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Harmattan session active</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Good Standing
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0F7640] font-sans tracking-tight">1,192</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">95.5% benchmarks met</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">CGPA &ge; 2.00</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Clinical Cleared
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-600 font-sans tracking-tight">1,140</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-blue-700 font-semibold">Hepatitis B vaccinated</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Serology verified</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Probation / Review
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 font-sans tracking-tight">
              {students.filter((s) => s.status === 'PROBATION').length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">Remediation track</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Academic advisory queue</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Institutional Nav Tabs */}
      <Tabs
        tabs={[
          { id: 'directory', label: 'Student Directory' },
          { id: 'lifecycle', label: 'Status Lifecycle' },
          { id: 'id_cards', label: 'Student ID Cards' },
          { id: 'clinical', label: 'Clinical Clearance' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* ─── TAB 1: Student Directory ─── */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Custom UI Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, matric no, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F7640] focus:border-[#0F7640] font-sans"
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <div className="w-48">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Departments' },
                    { value: 'CHE', label: 'Community Health' },
                    { value: 'MLT', label: 'Medical Laboratory' },
                    { value: 'PHT', label: 'Pharmacy Technician' },
                    { value: 'HIM', label: 'Health Information' },
                    { value: 'EHT', label: 'Environmental Health' },
                  ]}
                  value={selectedDeptFilter}
                  onChange={(val) => setSelectedDeptFilter(val)}
                />
              </div>
              <div className="w-36">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Levels' },
                    { value: '100 Level', label: '100 Level' },
                    { value: '200 Level', label: '200 Level' },
                    { value: '300 Level', label: '300 Level' },
                  ]}
                  value={selectedLevelFilter}
                  onChange={(val) => setSelectedLevelFilter(val)}
                />
              </div>
              <div className="w-36">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'PROBATION', label: 'Probation' },
                    { value: 'SUSPENDED', label: 'Suspended' },
                    { value: 'GRADUATED', label: 'Graduated' },
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
                <span className="font-bold text-slate-900">Enrolled Health Trainees Directory</span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  Showing {filteredStudents.length} of {students.length} students
                </span>
              </div>
            }
          >
            <Table
              columns={studentColumns}
              data={filteredStudents}
              keyExtractor={(s) => s.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 2: Status Lifecycle Management ─── */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-[4px] border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Active Trainees</span>
              <span className="text-2xl font-bold text-[#0F7640] block">
                {students.filter((s) => s.status === 'ACTIVE').length}
              </span>
              <span className="text-[11px] text-slate-500">In full academic attendance</span>
            </div>
            <div className="bg-white p-4 rounded-[4px] border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Academic Probation</span>
              <span className="text-2xl font-bold text-amber-600 block">
                {students.filter((s) => s.status === 'PROBATION').length}
              </span>
              <span className="text-[11px] text-slate-500">CGPA &lt; 2.00 threshold monitoring</span>
            </div>
            <div className="bg-white p-4 rounded-[4px] border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Graduated Alumni</span>
              <span className="text-2xl font-bold text-slate-900 block">
                {students.filter((s) => s.status === 'GRADUATED').length}
              </span>
              <span className="text-[11px] text-slate-500">Completed board qualifying exams</span>
            </div>
          </div>

          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="font-bold text-slate-900">Senate Student Lifecycle & Standing Registry</span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  Compliant with Health Board Regulations
                </span>
              </div>
            }
          >
            <Table
              columns={[
                {
                  key: 'matricNumber',
                  header: 'Matric No.',
                  render: (s: Student) => (
                    <span className="font-extrabold text-[#0F7640] text-sm font-sans">{s.matricNumber}</span>
                  ),
                },
                {
                  key: 'fullName',
                  header: 'Student Name',
                  render: (s: Student) => (
                    <div className="whitespace-nowrap">
                      <p className="font-bold text-slate-900">{s.fullName}</p>
                      <span className="text-[11px] text-slate-500">{s.programmeCode} • {s.level}</span>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Current Status',
                  render: (s: Student) => (
                    <Badge
                      variant={
                        s.status === 'ACTIVE'
                          ? 'success'
                          : s.status === 'PROBATION'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {s.status}
                    </Badge>
                  ),
                },
                {
                  key: 'reason',
                  header: 'Senate Reason / Memo',
                  render: (s: Student) => (
                    <span className="text-xs text-slate-600 font-sans">
                      {s.statusReason || 'In standard academic standing'}
                    </span>
                  ),
                },
                {
                  key: 'action',
                  header: 'Action',
                  align: 'right' as const,
                  render: (s: Student) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setStatusStudent(s);
                        setStatusForm({
                          newStatus: s.status === 'ACTIVE' ? 'PROBATION' : 'ACTIVE',
                          senateMemo: 'SENATE/2026/M04',
                          effectiveDate: new Date().toISOString().split('T')[0],
                          reason: s.statusReason || '',
                        });
                      }}
                    >
                      Change Status
                    </Button>
                  ),
                },
              ]}
              data={students}
              keyExtractor={(s) => s.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 3: Student ID Card Studio ─── */}
      {activeTab === 'id_cards' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-[4px] border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Print-Ready Student PVC ID Cards</h3>
              <p className="text-xs text-slate-500">
                Institutional credential conforming to clinical hospital posting and examination verification protocols.
              </p>
            </div>
            <Button
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedIdCard(students[0]);
              }}
            >
              Batch Print PVC Cards
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-[4px] border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between"
              >
                {/* ID Card Visual Representation */}
                <div className="bg-slate-50 border border-slate-200 rounded-[4px] overflow-hidden text-slate-900 shadow-sm">
                  {/* Card Green Header */}
                  <div className="bg-[#0F7640] text-white p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-[11px] uppercase tracking-wider block">
                        Bethsaida College
                      </span>
                      <span className="text-[9px] text-emerald-100 block">Health Technology</span>
                    </div>
                    <span className="text-[9px] font-bold bg-white text-[#0F7640] px-1.5 py-0.5 rounded-[2px] uppercase">
                      Student
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-slate-200 rounded-[2px] border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase shrink-0">
                        Photo
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate font-sans">{s.fullName}</p>
                        <p className="font-bold text-[11px] text-[#0F7640] font-sans">{s.matricNumber}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{s.programme}</p>
                        <p className="text-[10px] text-slate-600 font-semibold">
                          Blood: {s.bloodGroup} | Genotype: {s.genotype}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <Barcode value={s.matricNumber} className="scale-90 origin-left" />
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 block uppercase">Valid Until</span>
                        <span className="text-[10px] font-bold text-slate-700">Nov 2028</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedIdCard(s)}
                  >
                    Print Plastic Card
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: Clinical Clearance ─── */}
      {activeTab === 'clinical' && (
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
              <span className="font-bold text-slate-900">Mandatory Clinical & Serology Clearance Register</span>
              <span className="text-xs text-slate-500 font-medium shrink-0">
                Hospital Posting Prerequisite Verification
              </span>
            </div>
          }
        >
          <Table
            columns={[
              {
                key: 'matricNumber',
                header: 'Matric No.',
                render: (s: Student) => (
                  <span className="font-extrabold text-[#0F7640] text-sm font-sans">{s.matricNumber}</span>
                ),
              },
              {
                key: 'fullName',
                header: 'Trainee Name',
                render: (s: Student) => (
                  <div className="whitespace-nowrap">
                    <p className="font-bold text-slate-900">{s.fullName}</p>
                    <span className="text-[11px] text-slate-500">{s.programmeCode} • {s.level}</span>
                  </div>
                ),
              },
              {
                key: 'bloodGroup',
                header: 'Blood Group',
                align: 'center' as const,
                render: (s: Student) => (
                  <span className="font-bold text-slate-900 font-sans">{s.bloodGroup}</span>
                ),
              },
              {
                key: 'genotype',
                header: 'Genotype',
                align: 'center' as const,
                render: (s: Student) => (
                  <span className="font-bold text-slate-800 font-sans">{s.genotype}</span>
                ),
              },
              {
                key: 'hepatitisB',
                header: 'Hepatitis B Vaccination',
                render: (s: Student) => (
                  <Badge variant={s.hepatitisBStatus === 'VACCINATED' ? 'success' : 'warning'}>
                    {s.hepatitisBStatus === 'VACCINATED' ? '3 Doses Complete' : 'Dose Incomplete'}
                  </Badge>
                ),
              },
              {
                key: 'clinicalClearance',
                header: 'Hospital Posting Clearance',
                render: (s: Student) => (
                  <Badge variant={s.clinicalClearance === 'CLEARED' ? 'success' : 'danger'}>
                    {s.clinicalClearance === 'CLEARED' ? 'Eligible for Posting' : 'Posting Barred'}
                  </Badge>
                ),
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right' as const,
                render: (s: Student) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setStudents((prev) =>
                        prev.map((item) =>
                          item.id === s.id
                            ? {
                                ...item,
                                hepatitisBStatus: 'VACCINATED',
                                clinicalClearance: 'CLEARED',
                              }
                            : item
                        )
                      );
                      showToast({
                        type: 'success',
                        title: 'Serology Cleared',
                        message: `Hepatitis B vaccination and clinical clearance certified for ${s.matricNumber}.`,
                      });
                    }}
                  >
                    Clear Posting
                  </Button>
                ),
              },
            ]}
            data={students}
            keyExtractor={(s) => s.id}
            isDense={isDense}
          />
        </Card>
      )}

      {/* ─── MODAL 1: Comprehensive Student Profile Dossier ─── */}
      <Modal
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent ? `${selectedStudent.fullName} (${selectedStudent.matricNumber})` : 'Student Profile'}
        description="Official institutional student dossier, academic standing, and serology profile."
        size="lg"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Enrolled: {selectedStudent?.dateEnrolled} • Session: {selectedStudent?.session}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<IdCard className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSelectedIdCard(selectedStudent);
                  setSelectedStudent(null);
                }}
              >
                View ID Card
              </Button>
              <Button size="sm" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs text-slate-700">
            {/* Top Stat Summary */}
            <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shadow-sm">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Matriculation</span>
                <span className="font-extrabold text-[#0F7640] text-sm font-sans">{selectedStudent.matricNumber}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Level</span>
                <span className="font-bold text-slate-900">{selectedStudent.level}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Cumulative GPA</span>
                <span className="font-extrabold text-slate-900 text-sm font-sans">{selectedStudent.cgpa.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Fees Status</span>
                <Badge variant={selectedStudent.feesStatus === 'CLEARED' ? 'success' : 'warning'} size="sm">
                  {selectedStudent.feesStatus}
                </Badge>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Personal Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-semibold text-slate-800 block truncate" title={selectedStudent.email}>
                    {selectedStudent.email}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="font-semibold text-slate-800 block whitespace-nowrap">
                    {selectedStudent.phone}
                  </span>
                </div>
                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <span className="text-slate-400 block text-[11px]">State / LGA</span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {selectedStudent.stateOfOrigin} State ({selectedStudent.lga})
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Placement */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Academic Department & Programme
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded-[4px] flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedStudent.programme}</p>
                  <p className="text-xs text-slate-500">{selectedStudent.department}</p>
                </div>
                <Badge variant="neutral">{selectedStudent.programmeCode}</Badge>
              </div>
            </div>

            {/* Clinical Health & Serology */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Clinical Health & Serology Profile
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Group</span>
                  <span className="font-bold text-slate-900">{selectedStudent.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Genotype</span>
                  <span className="font-bold text-slate-900">{selectedStudent.genotype}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Hepatitis B</span>
                  <Badge variant={selectedStudent.hepatitisBStatus === 'VACCINATED' ? 'success' : 'warning'} size="sm">
                    {selectedStudent.hepatitisBStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Clinical Clearance</span>
                  <Badge variant={selectedStudent.clinicalClearance === 'CLEARED' ? 'success' : 'danger'} size="sm">
                    {selectedStudent.clinicalClearance}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: Print-Ready Plastic ID Card Preview ─── */}
      <Modal
        isOpen={Boolean(selectedIdCard)}
        onClose={() => setSelectedIdCard(null)}
        title="Print-Ready Student ID Card"
        description="Institutional credential compliant with clinical posting verification requirements."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={() => window.print()}>
              Print Plastic Card
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIdCard(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedIdCard && (
          <div className="flex flex-col items-center py-3">
            <div className="w-full max-w-sm bg-white border border-slate-300 rounded-[4px] shadow-md overflow-hidden text-slate-900 font-sans">
              {/* Card Green Top Header */}
              <div className="bg-[#0F7640] text-white p-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider">
                    Bethsaida College
                  </h3>
                  <p className="text-[10px] text-emerald-100">College of Health Technology</p>
                </div>
                <span className="text-[10px] font-bold bg-white text-[#0F7640] px-2 py-0.5 rounded-[2px] uppercase">
                  Student
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-20 bg-slate-100 border border-slate-300 rounded-[2px] flex items-center justify-center text-xs text-slate-400 font-bold uppercase shrink-0">
                    Photo
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate font-sans">{selectedIdCard.fullName}</p>
                    <p className="font-extrabold text-xs text-[#0F7640] font-sans mt-0.5">{selectedIdCard.matricNumber}</p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{selectedIdCard.programme}</p>
                    <p className="text-[11px] text-slate-700 font-semibold mt-1">
                      Blood: {selectedIdCard.bloodGroup} | Genotype: {selectedIdCard.genotype}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <Barcode value={selectedIdCard.matricNumber} />
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block uppercase">Expiration</span>
                    <span className="text-[11px] font-bold text-slate-800">2026 - 2028</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 3: Student Status Transition Workflow ─── */}
      <Modal
        isOpen={Boolean(statusStudent)}
        onClose={() => setStatusStudent(null)}
        title={statusStudent ? `Change Lifecycle Status: ${statusStudent.fullName}` : 'Change Status'}
        description="Formal senate resolution adjusting a trainee's academic or disciplinary standing."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setStatusStudent(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateStatus}>
              Approve Status Change
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
          <Select
            label="New Lifecycle Status"
            options={[
              { value: 'ACTIVE', label: 'ACTIVE - Good Standing' },
              { value: 'PROBATION', label: 'PROBATION - Academic Remediation' },
              { value: 'SUSPENDED', label: 'SUSPENDED - Disciplinary Measure' },
              { value: 'DEFERRED', label: 'DEFERRED - Approved Health/Personal Leave' },
              { value: 'GRADUATED', label: 'GRADUATED - Completed Training' },
            ]}
            value={statusForm.newStatus}
            onChange={(val) => setStatusForm({ ...statusForm, newStatus: val })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Effective Date"
              type="date"
              value={statusForm.effectiveDate}
              onChange={(e) => setStatusForm({ ...statusForm, effectiveDate: e.target.value })}
            />
            <Input
              label="Senate / Committee Reference"
              placeholder="SENATE/2026/M04"
              value={statusForm.senateMemo}
              onChange={(e) => setStatusForm({ ...statusForm, senateMemo: e.target.value })}
            />
          </div>

          <Input
            label="Official Justification & Notes"
            placeholder="e.g. CGPA below 2.00 benchmark or approved medical deferment"
            value={statusForm.reason}
            onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* ─── MODAL 4: Enroll New Student ─── */}
      <Modal
        isOpen={isNewStudentOpen}
        onClose={() => setIsNewStudentOpen(false)}
        title="Enroll Health Trainee"
        description="Register a newly matriculated student into the institutional SIS database."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsNewStudentOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddNewStudent}>
              Register Student
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddNewStudent} className="space-y-3.5 text-xs">
          <Input
            label="Student Full Name"
            placeholder="e.g. Victoria Olusola"
            value={newStudentForm.fullName}
            onChange={(e) => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Institutional Email"
              type="email"
              placeholder="v.olusola@bethsaida.edu.ng"
              value={newStudentForm.email}
              onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+234 800 000 0000"
              value={newStudentForm.phone}
              onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Academic Programme"
              options={[
                { value: 'CHEW', label: 'Community Health (CHEW)' },
                { value: 'JCHEW', label: 'Community Health (JCHEW)' },
                { value: 'MLT', label: 'Medical Laboratory (MLT)' },
                { value: 'PHT', label: 'Pharmacy Technician (PHT)' },
                { value: 'HIM', label: 'Health Information (HIM)' },
                { value: 'EHT', label: 'Environmental Health (EHT)' },
              ]}
              value={newStudentForm.programmeCode}
              onChange={(val) => setNewStudentForm({ ...newStudentForm, programmeCode: val })}
            />
            <Select
              label="Level"
              options={[
                { value: '100 Level', label: '100 Level' },
                { value: '200 Level', label: '200 Level' },
                { value: '300 Level', label: '300 Level' },
              ]}
              value={newStudentForm.level}
              onChange={(val) => setNewStudentForm({ ...newStudentForm, level: val })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Blood Group"
              options={[
                { value: 'O+', label: 'O+' },
                { value: 'A+', label: 'A+' },
                { value: 'B+', label: 'B+' },
                { value: 'AB+', label: 'AB+' },
                { value: 'O-', label: 'O-' },
                { value: 'A-', label: 'A-' },
              ]}
              value={newStudentForm.bloodGroup}
              onChange={(val) => setNewStudentForm({ ...newStudentForm, bloodGroup: val })}
            />
            <Select
              label="Genotype"
              options={[
                { value: 'AA', label: 'AA' },
                { value: 'AS', label: 'AS' },
                { value: 'AC', label: 'AC' },
              ]}
              value={newStudentForm.genotype}
              onChange={(val) => setNewStudentForm({ ...newStudentForm, genotype: val })}
            />
            <Select
              label="Hepatitis B"
              options={[
                { value: 'VACCINATED', label: 'Vaccinated' },
                { value: 'PENDING', label: 'Pending' },
              ]}
              value={newStudentForm.hepatitisBStatus}
              onChange={(val) => setNewStudentForm({ ...newStudentForm, hepatitisBStatus: val })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
