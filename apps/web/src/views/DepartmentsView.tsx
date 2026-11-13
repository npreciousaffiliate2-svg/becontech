import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Table,
  Badge,
  Tabs,
  Modal,
  Input,
  Select,
  useToast,
} from '@campusone/ui';
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  FileText,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

interface Course {
  code: string;
  title: string;
  units: number;
  semester: 'Harmattan' | 'Rain';
  level: string;
  lecturer: string;
  departmentCode?: string;
  departmentName?: string;
}

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  departmentCode: string;
  email: string;
  phone: string;
  coursesCount: number;
  qualification: string;
}

interface Programme {
  id: string;
  name: string;
  code: string;
  departmentCode: string;
  departmentName: string;
  duration: string;
  studentsCount: number;
  boardQuota: number;
  credentialAwarded: string;
  regulatoryBody: string;
  status: 'Full Accreditation' | 'Provisional';
}

interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
  hodTitle: string;
  hodEmail: string;
  hodPhone: string;
  office: string;
  approvedQuota: number;
  programmesCount: number;
  studentsCount: number;
  facultyCount: number;
  accreditationStatus: 'FULL' | 'PROVISIONAL' | 'RENEWAL_DUE';
  accreditationValidUntil: string;
  regulatoryBody: string;
  regulatoryBodyFull: string;
  programmes: { name: string; duration: string; students: number }[];
  courses: Course[];
}

export const DepartmentsView: React.FC = () => {
  const { isDense } = useApp();
  const { showToast } = useToast();
  const { tab: routeTab } = useParams();
  const navigate = useNavigate();

  // Clean industry-standard page routing (/departments, /departments/programmes, /departments/hods, etc.)
  const activeTab = routeTab || 'directory';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'directory') {
      navigate('/departments');
    } else {
      navigate(`/departments/${tabId}`);
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoardFilter, setSelectedBoardFilter] = useState('ALL');

  // Modal State
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isReassignHODOpen, setIsReassignHODOpen] = useState(false);
  const [hodFormDeptCode, setHodFormDeptCode] = useState('CHE');

  // Add Department Form State
  const [newDeptForm, setNewDeptForm] = useState({
    name: '',
    code: '',
    regulatoryBody: 'CHPRBN',
    hodName: '',
    hodTitle: 'Dr.',
    hodEmail: '',
    hodPhone: '',
    office: '',
    approvedQuota: '150',
  });

  // Reassign HOD Form State
  const [reassignForm, setReassignForm] = useState({
    newHodName: '',
    newHodTitle: 'Dr.',
    newHodEmail: '',
    newHodPhone: '',
    effectiveDate: '2026-11-15',
    memoRef: 'BCHT/PROV/HOD/2026/04',
  });

  // Initial Master Data for 5 Accredited Departments
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: 'dept-01',
      name: 'Department of Community Health',
      code: 'CHE',
      hod: 'Dr. K. Bello',
      hodTitle: 'Chief Lecturer & Head of Department',
      hodEmail: 'hod.che@bethsaida.edu.ng',
      hodPhone: '+234 803 124 5590',
      office: 'Health Sciences Complex, Suite B101',
      approvedQuota: 500,
      programmesCount: 2,
      studentsCount: 480,
      facultyCount: 14,
      accreditationStatus: 'FULL',
      accreditationValidUntil: 'November 2028',
      regulatoryBody: 'CHPRBN',
      regulatoryBodyFull: 'Community Health Practitioners Registration Board of Nigeria',
      programmes: [
        { name: 'Community Health Extension Worker (CHEW)', duration: '3-Year Diploma', students: 340 },
        { name: 'Junior Community Health Extension Worker (JCHEW)', duration: '2-Year Certificate', students: 140 },
      ],
      courses: [
        { code: 'CHE 101', title: 'Introduction to Primary Healthcare', units: 3, semester: 'Harmattan', level: 'Year 1', lecturer: 'Dr. K. Bello' },
        { code: 'CHE 102', title: 'Community Diagnosis & Field Survey', units: 3, semester: 'Harmattan', level: 'Year 1', lecturer: 'Mrs. R. Ajayi' },
        { code: 'CHE 201', title: 'Maternal & Child Health Clinicals', units: 4, semester: 'Harmattan', level: 'Year 2', lecturer: 'Mr. D. Alabi' },
        { code: 'CHE 301', title: 'Rural Healthcare Administration', units: 3, semester: 'Harmattan', level: 'Year 3', lecturer: 'Nurse E. Okon' },
      ],
    },
    {
      id: 'dept-02',
      name: 'Department of Medical Laboratory Technology',
      code: 'MLT',
      hod: 'Mr. O. Adebisi',
      hodTitle: 'Principal Lecturer & Head of Department',
      hodEmail: 'hod.mlt@bethsaida.edu.ng',
      hodPhone: '+234 802 771 9021',
      office: 'Diagnostic Science Building, Room 204',
      approvedQuota: 350,
      programmesCount: 2,
      studentsCount: 320,
      facultyCount: 11,
      accreditationStatus: 'FULL',
      accreditationValidUntil: 'October 2027',
      regulatoryBody: 'MLSCN',
      regulatoryBodyFull: 'Medical Laboratory Science Council of Nigeria',
      programmes: [
        { name: 'Medical Laboratory Technician (MLT)', duration: '3-Year Diploma', students: 220 },
        { name: 'Medical Laboratory Assistant (MLA)', duration: '2-Year Certificate', students: 100 },
      ],
      courses: [
        { code: 'MLT 101', title: 'Basic Clinical Chemistry & Safety', units: 3, semester: 'Harmattan', level: 'Year 1', lecturer: 'Mr. O. Adebisi' },
        { code: 'MLT 102', title: 'Medical Microbiology & Parasitology', units: 4, semester: 'Harmattan', level: 'Year 1', lecturer: 'Dr. S. Nnamdi' },
        { code: 'MLT 201', title: 'Haematology & Blood Transfusion Science', units: 4, semester: 'Harmattan', level: 'Year 2', lecturer: 'Miss B. Eze' },
        { code: 'MLT 301', title: 'Histopathology Techniques & Biopsies', units: 3, semester: 'Harmattan', level: 'Year 3', lecturer: 'Mr. O. Adebisi' },
      ],
    },
    {
      id: 'dept-03',
      name: 'Department of Pharmacy Technician Studies',
      code: 'PHT',
      hod: 'Pharm. F. Oladipo',
      hodTitle: 'Senior Lecturer & Head of Department',
      hodEmail: 'hod.pht@bethsaida.edu.ng',
      hodPhone: '+234 805 443 1892',
      office: 'Pharmaceutical Sciences Wing, Lab P1',
      approvedQuota: 300,
      programmesCount: 1,
      studentsCount: 260,
      facultyCount: 8,
      accreditationStatus: 'PROVISIONAL',
      accreditationValidUntil: 'June 2027',
      regulatoryBody: 'PCN',
      regulatoryBodyFull: 'Pharmacy Council of Nigeria',
      programmes: [
        { name: 'Pharmacy Technician (PHT)', duration: '3-Year Diploma', students: 260 },
      ],
      courses: [
        { code: 'PHT 101', title: 'Dispensing Principles & Metric Calculations', units: 3, semester: 'Harmattan', level: 'Year 1', lecturer: 'Pharm. F. Oladipo' },
        { code: 'PHT 102', title: 'Pharmacology for Technicians', units: 4, semester: 'Harmattan', level: 'Year 1', lecturer: 'Pharm. T. Adele' },
        { code: 'PHT 201', title: 'Pharmaceutics & Hospital Drug Storage', units: 3, semester: 'Harmattan', level: 'Year 2', lecturer: 'Mr. K. Lawal' },
      ],
    },
    {
      id: 'dept-04',
      name: 'Department of Health Information Management',
      code: 'HIM',
      hod: 'Mrs. T. Adeleke',
      hodTitle: 'Senior Lecturer & Head of Department',
      hodEmail: 'hod.him@bethsaida.edu.ng',
      hodPhone: '+234 809 332 7611',
      office: 'Administration Annex, Room 108',
      approvedQuota: 150,
      programmesCount: 1,
      studentsCount: 120,
      facultyCount: 6,
      accreditationStatus: 'FULL',
      accreditationValidUntil: 'January 2029',
      regulatoryBody: 'HRORBN',
      regulatoryBodyFull: 'Health Records Officers Registration Board of Nigeria',
      programmes: [
        { name: 'Health Information Management (HIM)', duration: '3-Year National Diploma', students: 120 },
      ],
      courses: [
        { code: 'HIM 101', title: 'Medical Terminology & Anatomy', units: 3, semester: 'Harmattan', level: 'Year 1', lecturer: 'Mrs. T. Adeleke' },
        { code: 'HIM 102', title: 'Health Data Classification & ICD-11', units: 4, semester: 'Harmattan', level: 'Year 1', lecturer: 'Mr. J. Ogunlesi' },
        { code: 'HIM 201', title: 'Electronic Health Records & Medico-Legal Records', units: 3, semester: 'Harmattan', level: 'Year 2', lecturer: 'Mrs. T. Adeleke' },
      ],
    },
    {
      id: 'dept-05',
      name: 'Department of Environmental Health Sciences',
      code: 'EHT',
      hod: 'Sanitarian B. Ibrahim',
      hodTitle: 'Principal Lecturer & Head of Department',
      hodEmail: 'hod.eht@bethsaida.edu.ng',
      hodPhone: '+234 807 551 2290',
      office: 'Public Health Pavilion, Room 12',
      approvedQuota: 100,
      programmesCount: 1,
      studentsCount: 68,
      facultyCount: 5,
      accreditationStatus: 'FULL',
      accreditationValidUntil: 'September 2028',
      regulatoryBody: 'EHORECON',
      regulatoryBodyFull: 'Environmental Health Officers Registration Council of Nigeria',
      programmes: [
        { name: 'Environmental Health Technology (EHT)', duration: '3-Year Diploma', students: 68 },
      ],
      courses: [
        { code: 'EHT 101', title: 'Principles of Environmental Sanitation', units: 3, semester: 'Harmattan', level: 'Year 1', lecturer: 'Sanitarian B. Ibrahim' },
        { code: 'EHT 102', title: 'Water Quality & Municipal Waste Management', units: 4, semester: 'Harmattan', level: 'Year 1', lecturer: 'Sanitarian A. Bello' },
        { code: 'EHT 201', title: 'Food Hygiene, Meat Inspection & Vector Control', units: 3, semester: 'Harmattan', level: 'Year 2', lecturer: 'Sanitarian B. Ibrahim' },
      ],
    },
  ]);

  // Master Programmes Catalog
  const allProgrammes: Programme[] = [
    {
      id: 'prog-01',
      name: 'Community Health Extension Worker (CHEW)',
      code: 'CHEW',
      departmentCode: 'CHE',
      departmentName: 'Department of Community Health',
      duration: '3 Years (6 Semesters)',
      studentsCount: 340,
      boardQuota: 350,
      credentialAwarded: 'Professional National Diploma',
      regulatoryBody: 'CHPRBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-02',
      name: 'Junior Community Health Extension Worker (JCHEW)',
      code: 'JCHEW',
      departmentCode: 'CHE',
      departmentName: 'Department of Community Health',
      duration: '2 Years (4 Semesters)',
      studentsCount: 140,
      boardQuota: 150,
      credentialAwarded: 'Professional Certificate',
      regulatoryBody: 'CHPRBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-03',
      name: 'Medical Laboratory Technician (MLT)',
      code: 'MLT',
      departmentCode: 'MLT',
      departmentName: 'Department of Medical Laboratory Technology',
      duration: '3 Years (6 Semesters)',
      studentsCount: 220,
      boardQuota: 250,
      credentialAwarded: 'Professional National Diploma',
      regulatoryBody: 'MLSCN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-04',
      name: 'Medical Laboratory Assistant (MLA)',
      code: 'MLA',
      departmentCode: 'MLT',
      departmentName: 'Department of Medical Laboratory Technology',
      duration: '2 Years (4 Semesters)',
      studentsCount: 100,
      boardQuota: 100,
      credentialAwarded: 'Professional Certificate',
      regulatoryBody: 'MLSCN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-05',
      name: 'Pharmacy Technician (PHT)',
      code: 'PHT',
      departmentCode: 'PHT',
      departmentName: 'Department of Pharmacy Technician Studies',
      duration: '3 Years (6 Semesters)',
      studentsCount: 260,
      boardQuota: 300,
      credentialAwarded: 'Professional Diploma',
      regulatoryBody: 'PCN',
      status: 'Provisional',
    },
    {
      id: 'prog-06',
      name: 'Health Information Management (HIM)',
      code: 'HIM',
      departmentCode: 'HIM',
      departmentName: 'Department of Health Information Management',
      duration: '3 Years (6 Semesters)',
      studentsCount: 120,
      boardQuota: 150,
      credentialAwarded: 'National Diploma (ND)',
      regulatoryBody: 'HRORBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-07',
      name: 'Environmental Health Technology (EHT)',
      code: 'EHT',
      departmentCode: 'EHT',
      departmentName: 'Department of Environmental Health Sciences',
      duration: '3 Years (6 Semesters)',
      studentsCount: 68,
      boardQuota: 100,
      credentialAwarded: 'National Diploma (ND)',
      regulatoryBody: 'EHORECON',
      status: 'Full Accreditation',
    },
  ];

  // Faculty Roster
  const facultyMembers: FacultyMember[] = [
    { id: 'fac-01', name: 'Dr. K. Bello', title: 'Chief Lecturer & HOD', departmentCode: 'CHE', email: 'k.bello@bethsaida.edu.ng', phone: '+234 803 124 5590', coursesCount: 3, qualification: 'Ph.D Public Health, FWACN' },
    { id: 'fac-02', name: 'Mrs. R. Ajayi', title: 'Senior Lecturer', departmentCode: 'CHE', email: 'r.ajayi@bethsaida.edu.ng', phone: '+234 802 331 4455', coursesCount: 2, qualification: 'M.Sc Community Health' },
    { id: 'fac-03', name: 'Mr. D. Alabi', title: 'Lecturer I', departmentCode: 'CHE', email: 'd.alabi@bethsaida.edu.ng', phone: '+234 806 211 9081', coursesCount: 2, qualification: 'B.Sc Health Education' },
    { id: 'fac-04', name: 'Nurse E. Okon', title: 'Clinical Preceptor', departmentCode: 'CHE', email: 'e.okon@bethsaida.edu.ng', phone: '+234 807 443 1122', coursesCount: 1, qualification: 'RN, RM, RPHN' },
    { id: 'fac-05', name: 'Mr. O. Adebisi', title: 'Principal Lecturer & HOD', departmentCode: 'MLT', email: 'o.adebisi@bethsaida.edu.ng', phone: '+234 802 771 9021', coursesCount: 3, qualification: 'FMLSCN, M.Sc Med Micro' },
    { id: 'fac-06', name: 'Dr. S. Nnamdi', title: 'Senior Lecturer', departmentCode: 'MLT', email: 's.nnamdi@bethsaida.edu.ng', phone: '+234 803 881 2299', coursesCount: 2, qualification: 'Ph.D Chemical Pathology' },
    { id: 'fac-07', name: 'Miss B. Eze', title: 'Medical Lab Technologist I', departmentCode: 'MLT', email: 'b.eze@bethsaida.edu.ng', phone: '+234 805 119 4433', coursesCount: 2, qualification: 'B.MLS Haematology' },
    { id: 'fac-08', name: 'Pharm. F. Oladipo', title: 'Senior Lecturer & HOD', departmentCode: 'PHT', email: 'f.oladipo@bethsaida.edu.ng', phone: '+234 805 443 1892', coursesCount: 3, qualification: 'B.Pharm, M.Sc Pharmaceutics' },
    { id: 'fac-09', name: 'Pharm. T. Adele', title: 'Lecturer II', departmentCode: 'PHT', email: 't.adele@bethsaida.edu.ng', phone: '+234 809 662 1100', coursesCount: 2, qualification: 'B.Pharm, MPSN' },
    { id: 'fac-10', name: 'Mrs. T. Adeleke', title: 'Senior Lecturer & HOD', departmentCode: 'HIM', email: 't.adeleke@bethsaida.edu.ng', phone: '+234 809 332 7611', coursesCount: 3, qualification: 'M.Sc Health Info, RHRO' },
    { id: 'fac-11', name: 'Sanitarian B. Ibrahim', title: 'Principal Lecturer & HOD', departmentCode: 'EHT', email: 'b.ibrahim@bethsaida.edu.ng', phone: '+234 807 551 2290', coursesCount: 3, qualification: 'M.Sc Public Health, REHO' },
  ];

  // All Courses across departments
  const allCourses = departments.flatMap((d) =>
    d.courses.map((c) => ({ ...c, departmentCode: d.code, departmentName: d.name }))
  );

  // Filtered Departments
  const filteredDepartments = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBoard =
      selectedBoardFilter === 'ALL' || d.regulatoryBody === selectedBoardFilter;
    return matchesSearch && matchesBoard;
  });

  // Handle Add Department Submit
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptForm.name || !newDeptForm.code || !newDeptForm.hodName) {
      showToast({
        type: 'danger',
        title: 'Missing Required Fields',
        message: 'Please provide Department Name, Code, and appointed Head of Department.',
      });
      return;
    }

    const created: Department = {
      id: `dept-${Date.now().toString().slice(-4)}`,
      name: newDeptForm.name,
      code: newDeptForm.code.toUpperCase(),
      hod: `${newDeptForm.hodTitle} ${newDeptForm.hodName}`,
      hodTitle: 'Head of Department',
      hodEmail: newDeptForm.hodEmail || `hod.${newDeptForm.code.toLowerCase()}@bethsaida.edu.ng`,
      hodPhone: newDeptForm.hodPhone || '+234 800 000 0000',
      office: newDeptForm.office || 'Main Academic Wing',
      approvedQuota: parseInt(newDeptForm.approvedQuota) || 100,
      programmesCount: 1,
      studentsCount: 0,
      facultyCount: 1,
      accreditationStatus: 'FULL',
      accreditationValidUntil: 'November 2029',
      regulatoryBody: newDeptForm.regulatoryBody,
      regulatoryBodyFull: newDeptForm.regulatoryBody,
      programmes: [{ name: `${newDeptForm.name} Diploma`, duration: '3-Year Diploma', students: 0 }],
      courses: [
        {
          code: `${newDeptForm.code.toUpperCase()} 101`,
          title: `Introduction to ${newDeptForm.name}`,
          units: 3,
          semester: 'Harmattan',
          level: 'Year 1',
          lecturer: `${newDeptForm.hodTitle} ${newDeptForm.hodName}`,
        },
      ],
    };

    setDepartments((prev) => [...prev, created]);
    setIsAddDeptOpen(false);
    showToast({
      type: 'success',
      title: 'Department Created',
      message: `${created.name} (${created.code}) successfully added to institutional registry.`,
    });
  };

  // Handle Reassign HOD Submit
  const handleReassignHOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignForm.newHodName) {
      showToast({
        type: 'danger',
        title: 'Missing HOD Name',
        message: 'Please provide the full name of the appointed Head of Department.',
      });
      return;
    }

    const fullNewHod = `${reassignForm.newHodTitle} ${reassignForm.newHodName}`;

    setDepartments((prev) =>
      prev.map((d) => {
        if (d.code === hodFormDeptCode) {
          return {
            ...d,
            hod: fullNewHod,
            hodEmail: reassignForm.newHodEmail || d.hodEmail,
            hodPhone: reassignForm.newHodPhone || d.hodPhone,
          };
        }
        return d;
      })
    );

    if (selectedDept && selectedDept.code === hodFormDeptCode) {
      setSelectedDept((prev) => (prev ? { ...prev, hod: fullNewHod } : null));
    }

    setIsReassignHODOpen(false);
    showToast({
      type: 'success',
      title: 'HOD Reassignment Approved',
      message: `${fullNewHod} has been confirmed as HOD for ${hodFormDeptCode} via Memo ${reassignForm.memoRef}.`,
    });
  };

  // Table Columns for Department Directory
  const departmentColumns = [
    {
      key: 'code',
      header: 'Code',
      render: (d: Department) => (
        <span className="font-extrabold text-[#0F7640] text-sm tracking-wide">{d.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Department Name',
      render: (d: Department) => (
        <div className="whitespace-nowrap">
          <p className="font-bold text-slate-900">{d.name}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            Board: {d.regulatoryBody} • Office: {d.office}
          </span>
        </div>
      ),
    },
    {
      key: 'hod',
      header: 'Head of Department',
      render: (d: Department) => (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-slate-800">{d.hod}</p>
          <span className="text-[11px] text-slate-500">{d.hodEmail}</span>
        </div>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Enrollment / Quota',
      align: 'right' as const,
      render: (d: Department) => {
        const percentage = Math.round((d.studentsCount / d.approvedQuota) * 100);
        return (
          <div className="text-right whitespace-nowrap">
            <span className="font-bold text-slate-900">{d.studentsCount}</span>
            <span className="text-slate-400 text-xs"> / {d.approvedQuota}</span>
            <span className="text-[11px] text-[#0F7640] font-semibold block">{percentage}% quota</span>
          </div>
        );
      },
    },
    {
      key: 'facultyCount',
      header: 'Faculty',
      align: 'right' as const,
      render: (d: Department) => (
        <span className="font-semibold text-slate-700 whitespace-nowrap">{d.facultyCount} Lecturers</span>
      ),
    },
    {
      key: 'accreditationStatus',
      header: 'Statutory Status',
      render: (d: Department) => (
        <Badge
          variant={
            d.accreditationStatus === 'FULL'
              ? 'success'
              : d.accreditationStatus === 'PROVISIONAL'
              ? 'warning'
              : 'danger'
          }
        >
          {d.accreditationStatus === 'FULL' ? 'Full Accreditation' : 'Provisional'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      render: (d: Department) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedDept(d)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setHodFormDeptCode(d.code);
              setIsReassignHODOpen(true);
            }}
          >
            Reassign HOD
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Departments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional departments, accredited training programmes, statutory board quotas, and faculty appointments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            onClick={() => setIsReassignHODOpen(true)}
          >
            Reassign HOD
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddDeptOpen(true)}
          >
            Add Department
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Departments</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">{departments.length}</span>
          <span className="text-xs text-slate-500 mt-1 block">Accredited health disciplines</span>
        </div>
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Health Programmes</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">7</span>
          <span className="text-xs text-slate-500 mt-1 block">Full diploma & certificate tracks</span>
        </div>
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Academic Faculty</span>
          <span className="text-2xl font-extrabold text-[#0F7640] mt-2 block">
            {departments.reduce((acc, d) => acc + d.facultyCount, 0)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Full-time lecturers & preceptors</span>
        </div>
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Students</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">
            {departments.reduce((acc, d) => acc + d.studentsCount, 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Enrolled across all levels</span>
        </div>
      </div>

      {/* Institutional Nav Tabs */}
      <Tabs
        tabs={[
          { id: 'directory', label: 'Department Directory' },
          { id: 'programmes', label: 'Accredited Programmes' },
          { id: 'hods', label: 'Heads of Department' },
          { id: 'faculty', label: 'Faculty Roster' },
          { id: 'courses', label: 'Curriculum & Courses' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* ─── TAB 1: Department Directory ─── */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Custom UI Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search department, code, or HOD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F7640] focus:border-[#0F7640]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">Regulatory Board:</span>
              <div className="w-56 shrink-0">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Statutory Boards' },
                    { value: 'CHPRBN', label: 'CHPRBN (Community Health)' },
                    { value: 'MLSCN', label: 'MLSCN (Medical Lab)' },
                    { value: 'PCN', label: 'PCN (Pharmacy)' },
                    { value: 'HRORBN', label: 'HRORBN (Health Records)' },
                    { value: 'EHORECON', label: 'EHORECON (Environmental)' },
                  ]}
                  value={selectedBoardFilter}
                  onChange={(val) => setSelectedBoardFilter(val)}
                />
              </div>
            </div>
          </div>

          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="font-bold text-slate-900">Health Science Academic Departments</span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  Showing {filteredDepartments.length} of {departments.length} departments
                </span>
              </div>
            }
          >
            <Table
              columns={departmentColumns}
              data={filteredDepartments}
              keyExtractor={(d) => d.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 2: Accredited Programmes ─── */}
      {activeTab === 'programmes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allProgrammes.map((p) => {
              const quotaPercent = Math.round((p.studentsCount / p.boardQuota) * 100);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#0F7640] bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                          {p.code}
                        </span>
                        <Badge variant={p.status === 'Full Accreditation' ? 'success' : 'warning'}>
                          {p.status}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-2">{p.name}</h3>
                      <p className="text-xs text-slate-500">{p.departmentName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Duration</span>
                      <span className="font-semibold text-slate-800">{p.duration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Credential</span>
                      <span className="font-semibold text-slate-800">{p.credentialAwarded}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Regulatory Body</span>
                      <span className="font-semibold text-slate-800">{p.regulatoryBody}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Approved Quota</span>
                      <span className="font-semibold text-slate-800">{p.boardQuota} Candidates</span>
                    </div>
                  </div>

                  {/* Enrollment Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Current Enrollment</span>
                      <span className="font-bold text-slate-900">
                        {p.studentsCount} / {p.boardQuota} ({quotaPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-[4px] overflow-hidden">
                      <div
                        className="h-full bg-[#0F7640] rounded-[4px]"
                        style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: Heads of Department (HODs) ─── */}
      {activeTab === 'hods' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0F7640] bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                      {d.code}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {d.regulatoryBody}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[4px] bg-[#0F7640] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {d.hod.replace(/^(Dr\.|Pharm\.|Mrs\.|Mr\.|Sanitarian)\s*/, '').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{d.hod}</h4>
                      <p className="text-xs text-slate-500 truncate">{d.hodTitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">{d.name}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{d.hodEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{d.hodPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{d.office}</span>
                    </div>
                  </div>
                </div>

                {/* Fixed Action Buttons: Balanced flex-1 and shrink-0 so Details is NEVER squashed */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setHodFormDeptCode(d.code);
                      setIsReassignHODOpen(true);
                    }}
                  >
                    Reassign HOD
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 px-3"
                    onClick={() => setSelectedDept(d)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: Faculty Roster ─── */}
      {activeTab === 'faculty' && (
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
              <span className="font-bold text-slate-900">Academic Faculty Roster</span>
              <span className="text-xs text-slate-500 font-medium shrink-0">
                {facultyMembers.length} active lecturers & clinical tutors
              </span>
            </div>
          }
        >
          <Table
            columns={[
              {
                key: 'name',
                header: 'Faculty Name',
                render: (f: FacultyMember) => (
                  <div className="whitespace-nowrap">
                    <p className="font-bold text-slate-900">{f.name}</p>
                    <span className="text-[11px] text-slate-500">{f.qualification}</span>
                  </div>
                ),
              },
              {
                key: 'department',
                header: 'Department',
                render: (f: FacultyMember) => (
                  <span className="font-extrabold text-[#0F7640] text-xs bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                    {f.departmentCode}
                  </span>
                ),
              },
              {
                key: 'title',
                header: 'Designation / Rank',
                render: (f: FacultyMember) => (
                  <span className="font-medium text-slate-700 whitespace-nowrap">{f.title}</span>
                ),
              },
              {
                key: 'email',
                header: 'Contact Details',
                render: (f: FacultyMember) => (
                  <div className="whitespace-nowrap text-xs">
                    <p className="text-slate-800">{f.email}</p>
                    <span className="text-slate-500">{f.phone}</span>
                  </div>
                ),
              },
              {
                key: 'coursesCount',
                header: 'Course Load',
                align: 'right' as const,
                render: (f: FacultyMember) => (
                  <span className="font-semibold text-slate-900 whitespace-nowrap">
                    {f.coursesCount} Courses
                  </span>
                ),
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right' as const,
                render: (f: FacultyMember) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      showToast({
                        type: 'info',
                        title: 'Faculty Dossier',
                        message: `Viewing academic teaching timetable for ${f.name}.`,
                      })
                    }
                  >
                    View Timetable
                  </Button>
                ),
              },
            ]}
            data={facultyMembers}
            keyExtractor={(f) => f.id}
            isDense={isDense}
          />
        </Card>
      )}

      {/* ─── TAB 5: Curriculum & Courses ─── */}
      {activeTab === 'courses' && (
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
              <span className="font-bold text-slate-900">Curriculum Course Offerings</span>
              <span className="text-xs text-slate-500 font-medium shrink-0">
                {allCourses.length} accredited department courses
              </span>
            </div>
          }
        >
          <Table
            columns={[
              {
                key: 'code',
                header: 'Course Code',
                render: (c: Course) => (
                  <span className="font-extrabold text-[#0F7640] text-sm tracking-wide">
                    {c.code}
                  </span>
                ),
              },
              {
                key: 'title',
                header: 'Course Title',
                render: (c: Course) => (
                  <div className="whitespace-nowrap">
                    <p className="font-bold text-slate-900">{c.title}</p>
                    <span className="text-[11px] text-slate-500">{c.departmentName}</span>
                  </div>
                ),
              },
              {
                key: 'units',
                header: 'Credit Units',
                align: 'center' as const,
                render: (c: Course) => (
                  <span className="font-bold text-slate-800">{c.units} Units</span>
                ),
              },
              {
                key: 'level',
                header: 'Cohort Level',
                render: (c: Course) => (
                  <Badge variant="neutral" size="sm">
                    {c.level}
                  </Badge>
                ),
              },
              {
                key: 'semester',
                header: 'Semester',
                render: (c: Course) => (
                  <span className="text-xs font-semibold text-slate-700">{c.semester}</span>
                ),
              },
              {
                key: 'lecturer',
                header: 'Assigned Lecturer',
                render: (c: Course) => (
                  <span className="font-medium text-slate-800 whitespace-nowrap">{c.lecturer}</span>
                ),
              },
            ]}
            data={allCourses}
            keyExtractor={(c) => c.code}
            isDense={isDense}
          />
        </Card>
      )}

      {/* ─── MODAL 1: Department Details Drill-down ─── */}
      <Modal
        isOpen={Boolean(selectedDept)}
        onClose={() => setSelectedDept(null)}
        title={selectedDept ? `${selectedDept.name} (${selectedDept.code})` : 'Department Details'}
        description="Comprehensive statutory registry, accredited programmes, and departmental leadership."
        size="lg"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Accredited by {selectedDept?.regulatoryBodyFull}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (selectedDept) {
                    setHodFormDeptCode(selectedDept.code);
                    setIsReassignHODOpen(true);
                  }
                }}
              >
                Reassign HOD
              </Button>
              <Button size="sm" onClick={() => setSelectedDept(null)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        {selectedDept && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Header Summary Box */}
            <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Statutory Body</span>
                <span className="font-bold text-slate-900">{selectedDept.regulatoryBody}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Accreditation</span>
                <Badge variant={selectedDept.accreditationStatus === 'FULL' ? 'success' : 'warning'} size="sm">
                  {selectedDept.accreditationStatus}
                </Badge>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Enrolled Students</span>
                <span className="font-bold text-slate-900">{selectedDept.studentsCount} Students</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Approved Quota</span>
                <span className="font-bold text-slate-900">{selectedDept.approvedQuota} Candidates</span>
              </div>
            </div>

            {/* HOD Profile Section */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Departmental Leadership
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedDept.hod}</h4>
                  <p className="text-xs text-slate-500">{selectedDept.hodTitle}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {selectedDept.hodEmail} • {selectedDept.hodPhone}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block">Office Location</span>
                  <span className="font-semibold text-slate-800 text-xs">{selectedDept.office}</span>
                </div>
              </div>
            </div>

            {/* Active Programmes Under Department */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Accredited Programmes
              </span>
              <div className="space-y-2">
                {selectedDept.programmes.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-[4px] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <span className="text-slate-500 text-[11px]">{p.duration}</span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {p.students} Enrolled
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Courses */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Harmattan Semester Courses
              </span>
              <div className="border border-slate-200 rounded-[4px] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Course Title</th>
                      <th className="px-3 py-2">Units</th>
                      <th className="px-3 py-2">Lecturer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedDept.courses.map((c) => (
                      <tr key={c.code} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-bold text-[#0F7640]">{c.code}</td>
                        <td className="px-3 py-2 text-slate-800">{c.title}</td>
                        <td className="px-3 py-2 font-semibold text-slate-700">{c.units}</td>
                        <td className="px-3 py-2 text-slate-600">{c.lecturer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: Register New Department (Strict Custom UI Select) ─── */}
      <Modal
        isOpen={isAddDeptOpen}
        onClose={() => setIsAddDeptOpen(false)}
        title="Register Department"
        description="Establish a new health training department in the institutional college registry."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsAddDeptOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddDepartment}>
              Register Department
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddDepartment} className="space-y-3.5 text-xs">
          <Input
            label="Department Name"
            placeholder="e.g. Department of Dental Health Sciences"
            value={newDeptForm.name}
            onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Department Code"
              placeholder="e.g. DHS"
              value={newDeptForm.code}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, code: e.target.value.toUpperCase() })}
              required
            />
            <Select
              label="Regulatory Board"
              options={[
                { value: 'CHPRBN', label: 'CHPRBN (Community Health)' },
                { value: 'MLSCN', label: 'MLSCN (Medical Laboratory)' },
                { value: 'PCN', label: 'PCN (Pharmacy)' },
                { value: 'HRORBN', label: 'HRORBN (Health Records)' },
                { value: 'EHORECON', label: 'EHORECON (Environmental)' },
                { value: 'DHRB', label: 'DHRB (Dental Health)' },
              ]}
              value={newDeptForm.regulatoryBody}
              onChange={(val) => setNewDeptForm({ ...newDeptForm, regulatoryBody: val })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Title"
              options={[
                { value: 'Dr.', label: 'Dr.' },
                { value: 'Pharm.', label: 'Pharm.' },
                { value: 'Sanitarian', label: 'Sanitarian' },
                { value: 'Mr.', label: 'Mr.' },
                { value: 'Mrs.', label: 'Mrs.' },
              ]}
              value={newDeptForm.hodTitle}
              onChange={(val) => setNewDeptForm({ ...newDeptForm, hodTitle: val })}
            />
            <div className="sm:col-span-2">
              <Input
                label="Appointed HOD Name"
                placeholder="e.g. Samuel Adeleke"
                value={newDeptForm.hodName}
                onChange={(e) => setNewDeptForm({ ...newDeptForm, hodName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Approved Student Quota"
              type="number"
              placeholder="e.g. 150"
              value={newDeptForm.approvedQuota}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, approvedQuota: e.target.value })}
            />
            <Input
              label="Office Location"
              placeholder="e.g. Block C, Room 102"
              value={newDeptForm.office}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, office: e.target.value })}
            />
          </div>

          <Input
            label="Official HOD Email"
            type="email"
            placeholder="hod.dhs@bethsaida.edu.ng"
            value={newDeptForm.hodEmail}
            onChange={(e) => setNewDeptForm({ ...newDeptForm, hodEmail: e.target.value })}
          />
        </form>
      </Modal>

      {/* ─── MODAL 3: Reassign / Appoint HOD (Strict Custom UI Select) ─── */}
      <Modal
        isOpen={isReassignHODOpen}
        onClose={() => setIsReassignHODOpen(false)}
        title="Reassign Head of Department (HOD)"
        description="Formal provost appointment of an academic department head."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsReassignHODOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleReassignHOD}>
              Approve Appointment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleReassignHOD} className="space-y-3.5 text-xs">
          <Select
            label="Select Department"
            options={departments.map((d) => ({
              value: d.code,
              label: `${d.name} (${d.code})`,
              description: `Current: ${d.hod}`,
            }))}
            value={hodFormDeptCode}
            onChange={(val) => setHodFormDeptCode(val)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Title"
              options={[
                { value: 'Dr.', label: 'Dr.' },
                { value: 'Pharm.', label: 'Pharm.' },
                { value: 'Sanitarian', label: 'Sanitarian' },
                { value: 'Mr.', label: 'Mr.' },
                { value: 'Mrs.', label: 'Mrs.' },
              ]}
              value={reassignForm.newHodTitle}
              onChange={(val) => setReassignForm({ ...reassignForm, newHodTitle: val })}
            />
            <div className="sm:col-span-2">
              <Input
                label="New Appointed HOD Full Name"
                placeholder="e.g. Victoria Olusola"
                value={reassignForm.newHodName}
                onChange={(e) => setReassignForm({ ...reassignForm, newHodName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Effective Appointment Date"
              type="date"
              value={reassignForm.effectiveDate}
              onChange={(e) => setReassignForm({ ...reassignForm, effectiveDate: e.target.value })}
            />
            <Input
              label="Provost Memo Reference"
              placeholder="BCHT/PROV/HOD/2026/04"
              value={reassignForm.memoRef}
              onChange={(e) => setReassignForm({ ...reassignForm, memoRef: e.target.value })}
            />
          </div>

          <Input
            label="Official Email Address"
            type="email"
            placeholder="hod.new@bethsaida.edu.ng"
            value={reassignForm.newHodEmail}
            onChange={(e) => setReassignForm({ ...reassignForm, newHodEmail: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
