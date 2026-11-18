import React, { useState } from 'react';
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
  DatePicker,
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
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { useSharedRecords } from '../lib/sharedRecords.ts';
import { PersonAvatar, PhotoUploadControl, pluralize } from '../components/common/PersonAvatar.tsx';

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  departmentCode: string;
  email: string;
  phone: string;
  coursesCount: number;
  qualification: string;
  avatarUrl?: string;
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
  hodAvatarUrl?: string;
  office: string;
  approvedQuota: number;
  programmesCount: number;
  studentsCount: number;
  facultyCount: number;
  accreditationStatus: 'FULL' | 'PROVISIONAL' | 'RENEWAL_DUE';
  accreditationValidUntil: string;
  regulatoryBody: string;
  regulatoryBodyFull: string;
  isArchived?: boolean;
  programmes?: { name: string; duration: string; students: number }[];
  courses?: any[];
}

export const DepartmentsView: React.FC = () => {
  const {
    isDense,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    schoolProfile,
    resolveAvatarUrl,
    registerPersonAvatar,
  } = useApp();
  const { showToast } = useToast();
  const { tab: routeTab } = useParams();
  const navigate = useNavigate();

  // Clean page routing (/departments, /departments/programmes, /departments/hods, etc.)
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
  const [progSearch, setProgSearch] = useState('');
  const [progDeptFilter, setProgDeptFilter] = useState('ALL');
  const [hodSearch, setHodSearch] = useState('');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('ALL');
  const [courseDeptFilter, setCourseDeptFilter] = useState('ALL');
  const [courseLevelFilter, setCourseLevelFilter] = useState('ALL');

  /* ──────────────────────────────────────────────────────────────────────────
   * 1. DEPARTMENT MANAGEMENT STATE
   * ────────────────────────────────────────────────────────────────────────── */
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isDeleteDeptOpen, setIsDeleteDeptOpen] = useState(false);
  const [deleteDeptTarget, setDeleteDeptTarget] = useState<Department | null>(null);
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
    hodAvatarUrl: '',
    office: '',
    approvedQuota: '150',
  });

  // Reassign HOD Form State
  const [reassignForm, setReassignForm] = useState({
    selectedFacultyId: '',
    newHodName: '',
    newHodTitle: 'Dr.',
    newHodEmail: '',
    newHodPhone: '',
    newHodAvatarUrl: '',
    effectiveDate: '2026-11-15',
    memoRef: 'BCHT/PROV/HOD/2026/04',
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 2. PROGRAMMES STATE & MANAGEMENT
   * ────────────────────────────────────────────────────────────────────────── */
  const initialProgrammes: Programme[] = [
    {
      id: 'prog-01',
      name: 'Dental Health Technician (DHT)',
      code: 'DHT',
      departmentCode: 'DHD',
      departmentName: 'Dental Health Department',
      duration: '3 Years (6 Semesters)',
      studentsCount: 105,
      boardQuota: 120,
      credentialAwarded: 'Professional Diploma in Dental Health',
      regulatoryBody: 'DTRBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-02',
      name: 'Dental Surgery Technician (DST)',
      code: 'DST',
      departmentCode: 'DHD',
      departmentName: 'Dental Health Department',
      duration: '3 Years (6 Semesters)',
      studentsCount: 80,
      boardQuota: 100,
      credentialAwarded: 'Professional Diploma in Dental Surgery',
      regulatoryBody: 'DTRBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-03',
      name: 'Environmental Health Technician (EHT)',
      code: 'EHT',
      departmentCode: 'EHD',
      departmentName: 'Environmental Health Department',
      duration: '3 Years (6 Semesters)',
      studentsCount: 130,
      boardQuota: 150,
      credentialAwarded: 'Professional National Diploma',
      regulatoryBody: 'EHORECON',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-04',
      name: 'Environmental Health Assistant (EHA)',
      code: 'EHA',
      departmentCode: 'EHD',
      departmentName: 'Environmental Health Department',
      duration: '2 Years (4 Semesters)',
      studentsCount: 68,
      boardQuota: 100,
      credentialAwarded: 'Professional Certificate',
      regulatoryBody: 'EHORECON',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-05',
      name: 'National Diploma (ND) in Health Information Management',
      code: 'HIM-ND',
      departmentCode: 'HIM',
      departmentName: 'Health Information Management Department',
      duration: '2 Years (4 Semesters)',
      studentsCount: 102,
      boardQuota: 120,
      credentialAwarded: 'National Diploma (ND)',
      regulatoryBody: 'HRORBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-06',
      name: 'Higher National Diploma (HND) in Health Information Management',
      code: 'HIM-HND',
      departmentCode: 'HIM',
      departmentName: 'Health Information Management Department',
      duration: '2 Years (4 Semesters)',
      studentsCount: 70,
      boardQuota: 80,
      credentialAwarded: 'Higher National Diploma (HND)',
      regulatoryBody: 'HRORBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-07',
      name: 'Health Technician (HT)',
      code: 'HT',
      departmentCode: 'HTD',
      departmentName: 'Health Technician Department',
      duration: '3 Years (6 Semesters)',
      studentsCount: 145,
      boardQuota: 160,
      credentialAwarded: 'Professional Diploma in Health Technology',
      regulatoryBody: 'FMOH',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-08',
      name: 'Pharmacy Technician (PHT)',
      code: 'PHT',
      departmentCode: 'PHT',
      departmentName: 'Pharmacy Technician Department',
      duration: '3 Years (6 Semesters)',
      studentsCount: 230,
      boardQuota: 250,
      credentialAwarded: 'Professional Diploma in Pharmacy Practice',
      regulatoryBody: 'PCN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-09',
      name: 'Health Assistant (HA)',
      code: 'HA',
      departmentCode: 'HAD',
      departmentName: 'Health Assistant Department',
      duration: '2 Years (4 Semesters)',
      studentsCount: 135,
      boardQuota: 150,
      credentialAwarded: 'Professional Certificate in Primary Health Support',
      regulatoryBody: 'FMOH',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-10',
      name: 'Community Health Extension Worker (CHEW)',
      code: 'CHEW',
      departmentCode: 'CHD',
      departmentName: 'Community Health Department',
      duration: '3 Years (6 Semesters)',
      studentsCount: 260,
      boardQuota: 300,
      credentialAwarded: 'Professional National Diploma',
      regulatoryBody: 'CHPRBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-11',
      name: 'Junior Community Health Extension Worker (JCHEW)',
      code: 'JCHEW',
      departmentCode: 'CHD',
      departmentName: 'Community Health Department',
      duration: '2 Years (4 Semesters)',
      studentsCount: 120,
      boardQuota: 150,
      credentialAwarded: 'Professional Certificate',
      regulatoryBody: 'CHPRBN',
      status: 'Full Accreditation',
    },
    {
      id: 'prog-12',
      name: 'Medical Laboratory Technician (MLT)',
      code: 'MLT',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Science Department',
      duration: '3 Years (6 Semesters)',
      studentsCount: 165,
      boardQuota: 180,
      credentialAwarded: 'Professional Diploma in Medical Laboratory Technology',
      regulatoryBody: 'MLSCN',
      status: 'Full Accreditation',
    },
  ];

  const [programmesList, setProgrammesList] = useSharedRecords<Programme>('registry.programmes', initialProgrammes);

  const setProgrammes = (updater: (prev: Programme[]) => Programme[]) => {
    setProgrammesList(updater);
  };

  const [isAddProgOpen, setIsAddProgOpen] = useState(false);
  const [isEditProgOpen, setIsEditProgOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<Programme | null>(null);
  const [isDeleteProgOpen, setIsDeleteProgOpen] = useState(false);
  const [deleteProgTarget, setDeleteProgTarget] = useState<Programme | null>(null);

  const [newProgForm, setNewProgForm] = useState({
    name: '',
    code: '',
    departmentCode: 'CHD',
    duration: '3 Years (6 Semesters)',
    boardQuota: '150',
    credentialAwarded: 'Professional National Diploma',
    regulatoryBody: 'CHPRBN',
    status: 'Full Accreditation' as const,
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 3. FACULTY STATE & MANAGEMENT
   * ────────────────────────────────────────────────────────────────────────── */
  const initialFaculty: FacultyMember[] = [
    { id: 'fac-01', name: 'Dr. A. O. Adeleke', title: 'Consultant Dental Surgeon & HOD', departmentCode: 'DHD', email: 'hod.dhd@becohtech.edu.ng', phone: '+234 907 578 9045', coursesCount: 2, qualification: 'BDS, FWACS Oral Health' },
    { id: 'fac-02', name: 'Sanitarian B. Ibrahim', title: 'Chief Environmental Officer & HOD', departmentCode: 'EHD', email: 'hod.ehd@becohtech.edu.ng', phone: '+234 907 451 7476', coursesCount: 2, qualification: 'M.Sc Public Health, REHO' },
    { id: 'fac-03', name: 'Mrs. T. Adeleke', title: 'Principal Lecturer & HOD', departmentCode: 'HIM', email: 'hod.him@becohtech.edu.ng', phone: '+234 907 578 9045', coursesCount: 2, qualification: 'M.Sc Health Info, RHRO' },
    { id: 'fac-04', name: 'Mr. S. O. Alabi', title: 'Senior Lecturer & HOD', departmentCode: 'HTD', email: 'hod.htd@becohtech.edu.ng', phone: '+234 907 451 7476', coursesCount: 2, qualification: 'B.Sc Health Technology' },
    { id: 'fac-05', name: 'Pharm. F. Oladipo', title: 'Chief Pharmacist & HOD', departmentCode: 'PHT', email: 'hod.pht@becohtech.edu.ng', phone: '+234 907 578 9045', coursesCount: 2, qualification: 'B.Pharm, M.Sc Pharmaceutics' },
    { id: 'fac-06', name: 'Nurse E. O. Okon', title: 'Chief Nursing Officer & HOD', departmentCode: 'HAD', email: 'hod.had@becohtech.edu.ng', phone: '+234 907 451 7476', coursesCount: 2, qualification: 'RN, RM, RPHN Primary Care' },
    { id: 'fac-07', name: 'Dr. K. Bello', title: 'Chief Lecturer & HOD', departmentCode: 'CHD', email: 'hod.chd@becohtech.edu.ng', phone: '+234 907 578 9045', coursesCount: 2, qualification: 'Ph.D Public Health, FWACN' },
    { id: 'fac-08', name: 'Mrs. R. Ajayi', title: 'Senior Lecturer', departmentCode: 'CHD', email: 'r.ajayi@becohtech.edu.ng', phone: '+234 907 578 9045', coursesCount: 2, qualification: 'M.Sc Community Health' },
  ];

  const [facultyList, setFacultyList] = useSharedRecords<FacultyMember>('registry.faculty', initialFaculty);

  const setFaculty = (updater: (prev: FacultyMember[]) => FacultyMember[]) => {
    setFacultyList(updater);
  };

  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [isEditFacultyOpen, setIsEditFacultyOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [isDeleteFacultyOpen, setIsDeleteFacultyOpen] = useState(false);
  const [deleteFacultyTarget, setDeleteFacultyTarget] = useState<FacultyMember | null>(null);

  const [newFacultyForm, setNewFacultyForm] = useState({
    name: '',
    title: 'Lecturer II',
    departmentCode: 'CHE',
    email: '',
    phone: '',
    coursesCount: '0',
    qualification: 'B.Sc, M.Sc',
    avatarUrl: '',
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 4. CURRICULUM COURSES STATE & MANAGEMENT
   * ────────────────────────────────────────────────────────────────────────── */
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<any | null>(null);

  const [newCourseForm, setNewCourseForm] = useState({
    code: '',
    title: '',
    departmentCode: 'CHE',
    creditUnits: '3',
    level: '100 Level',
    semester: 'Harmattan Semester',
    lecturer: 'Dr. K. Bello',
  });

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

  /* ──────────────────────────────────────────────────────────────────────────
   * HANDLERS: DEPARTMENTS CRUD
   * ────────────────────────────────────────────────────────────────────────── */
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

    const fullHod = newDeptForm.hodName.startsWith(newDeptForm.hodTitle)
      ? newDeptForm.hodName
      : `${newDeptForm.hodTitle} ${newDeptForm.hodName}`;
    const created: any = {
      id: `dept-${Date.now().toString().slice(-4)}`,
      name: newDeptForm.name,
      code: newDeptForm.code.toUpperCase(),
      hod: fullHod,
      hodTitle: 'Head of Department',
      hodEmail: newDeptForm.hodEmail || `hod.${newDeptForm.code.toLowerCase()}@bethsaida.edu.ng`,
      hodPhone: newDeptForm.hodPhone || '+234 800 000 0000',
      hodAvatarUrl: newDeptForm.hodAvatarUrl || undefined,
      office: newDeptForm.office || 'Main Academic Wing',
      approvedQuota: parseInt(newDeptForm.approvedQuota) || 100,
      programmesCount: 1,
      studentsCount: 0,
      facultyCount: 1,
      accreditationStatus: 'FULL',
      accreditationValidUntil: 'November 2029',
      regulatoryBody: newDeptForm.regulatoryBody,
      regulatoryBodyFull: newDeptForm.regulatoryBody,
      isArchived: false,
      programmes: [{ name: `${newDeptForm.name} Diploma`, duration: '3-Year Diploma', students: 0 }],
      courses: [
        {
          code: `${newDeptForm.code.toUpperCase()} 101`,
          title: `Introduction to ${newDeptForm.name}`,
          units: 3,
          semester: schoolProfile?.activeSemester || 'Harmattan Semester',
          level: '100 Level',
          lecturer: `${newDeptForm.hodTitle} ${newDeptForm.hodName}`,
        },
      ],
    };

    if (created.hodAvatarUrl) {
      registerPersonAvatar([created.hod, created.hodEmail], created.hodAvatarUrl);
    }
    addDepartment(created);
    setIsAddDeptOpen(false);
    showToast({
      type: 'success',
      title: 'Department Created',
      message: `${created.name} (${created.code}) successfully added to college registry.`,
    });
  };

  const handleOpenEditDept = (d: Department) => {
    setEditingDept({ ...d });
    setIsEditDeptOpen(true);
  };

  const handleUpdateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    updateDepartment(editingDept.id, {
      name: editingDept.name,
      code: editingDept.code.toUpperCase(),
      regulatoryBody: editingDept.regulatoryBody,
      regulatoryBodyFull: editingDept.regulatoryBodyFull || editingDept.regulatoryBody,
      office: editingDept.office,
      approvedQuota: Number(editingDept.approvedQuota),
      accreditationStatus: editingDept.accreditationStatus,
      hod: editingDept.hod,
      hodTitle: editingDept.hodTitle,
      hodEmail: editingDept.hodEmail,
      hodPhone: editingDept.hodPhone,
      hodAvatarUrl: editingDept.hodAvatarUrl,
    });
    if (editingDept.hodAvatarUrl !== undefined) {
      registerPersonAvatar([editingDept.hod, editingDept.hodEmail], editingDept.hodAvatarUrl || '');
    }
    setIsEditDeptOpen(false);
    showToast({
      type: 'success',
      title: 'Department Updated',
      message: `${editingDept.name} (${editingDept.code}) changes have been saved.`,
    });
  };

  const handleDeleteDepartment = () => {
    if (!deleteDeptTarget) return;
    deleteDepartment(deleteDeptTarget.id);
    setIsDeleteDeptOpen(false);
    showToast({
      type: 'success',
      title: 'Department Removed',
      message: `${deleteDeptTarget.name} has been removed.`,
    });
    setDeleteDeptTarget(null);
  };

  const handleToggleArchiveDept = (d: Department) => {
    const nextArchived = !d.isArchived;
    updateDepartment(d.id, { isArchived: nextArchived });
    showToast({
      type: 'info',
      title: nextArchived ? 'Department Archived' : 'Department Restored',
      message: `${d.name} has been ${nextArchived ? 'moved to archive' : 'restored to active directory'}.`,
    });
  };

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

    const fullNewHod = reassignForm.newHodName.startsWith(reassignForm.newHodTitle)
      ? reassignForm.newHodName
      : `${reassignForm.newHodTitle} ${reassignForm.newHodName}`;
    const targetDept = departments.find((d) => d.code === hodFormDeptCode);
    if (targetDept) {
      updateDepartment(targetDept.id, {
        hod: fullNewHod,
        hodEmail: reassignForm.newHodEmail || targetDept.hodEmail,
        hodPhone: reassignForm.newHodPhone || targetDept.hodPhone,
        hodAvatarUrl: reassignForm.newHodAvatarUrl || targetDept.hodAvatarUrl,
      });
    }
    if (reassignForm.newHodAvatarUrl) {
      registerPersonAvatar([fullNewHod, reassignForm.newHodEmail], reassignForm.newHodAvatarUrl);
    }

    if (selectedDept && selectedDept.code === hodFormDeptCode) {
      setSelectedDept((prev) =>
        prev
          ? {
              ...prev,
              hod: fullNewHod,
              hodEmail: reassignForm.newHodEmail || prev.hodEmail,
              hodPhone: reassignForm.newHodPhone || prev.hodPhone,
              hodAvatarUrl: reassignForm.newHodAvatarUrl || prev.hodAvatarUrl,
            }
          : null
      );
    }

    setIsReassignHODOpen(false);
    showToast({
      type: 'success',
      title: 'HOD Appointment Updated',
      message: `${fullNewHod} recorded as Head of Department for ${hodFormDeptCode}.`,
    });
  };

  /* ──────────────────────────────────────────────────────────────────────────
   * HANDLERS: PROGRAMMES CRUD
   * ────────────────────────────────────────────────────────────────────────── */
  const handleAddProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgForm.name || !newProgForm.code) {
      showToast({
        type: 'danger',
        title: 'Missing Fields',
        message: 'Please specify the programme name and code.',
      });
      return;
    }

    const dept = departments.find((d) => d.code === newProgForm.departmentCode);
    const newProg: Programme = {
      id: `prog-${Date.now().toString().slice(-4)}`,
      name: newProgForm.name,
      code: newProgForm.code.toUpperCase(),
      departmentCode: newProgForm.departmentCode,
      departmentName: dept?.name || 'Academic Department',
      duration: newProgForm.duration,
      studentsCount: 0,
      boardQuota: parseInt(newProgForm.boardQuota, 10) || 100,
      credentialAwarded: newProgForm.credentialAwarded,
      regulatoryBody: newProgForm.regulatoryBody,
      status: newProgForm.status,
    };

    setProgrammes((prev) => [newProg, ...prev]);
    setIsAddProgOpen(false);
    showToast({
      type: 'success',
      title: 'Programme Added',
      message: `${newProg.name} (${newProg.code}) registered under ${newProg.departmentName}.`,
    });
  };

  const handleUpdateProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProg) return;
    setProgrammes((prev) => prev.map((p) => (p.id === editingProg.id ? editingProg : p)));
    setIsEditProgOpen(false);
    showToast({
      type: 'success',
      title: 'Programme Updated',
      message: `${editingProg.name} details have been updated.`,
    });
  };

  const handleDeleteProgramme = () => {
    if (!deleteProgTarget) return;
    setProgrammes((prev) => prev.filter((p) => p.id !== deleteProgTarget.id));
    setIsDeleteProgOpen(false);
    showToast({
      type: 'success',
      title: 'Programme Removed',
      message: `${deleteProgTarget.name} has been removed.`,
    });
    setDeleteProgTarget(null);
  };

  /* ──────────────────────────────────────────────────────────────────────────
   * HANDLERS: FACULTY CRUD
   * ────────────────────────────────────────────────────────────────────────── */
  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyForm.name) {
      showToast({
        type: 'danger',
        title: 'Missing Name',
        message: 'Please provide the faculty member name.',
      });
      return;
    }

    const parsedCourses = parseInt(newFacultyForm.coursesCount, 10);
    const newFac: FacultyMember = {
      id: `fac-${Date.now().toString().slice(-4)}`,
      name: newFacultyForm.name,
      title: newFacultyForm.title,
      departmentCode: newFacultyForm.departmentCode,
      email: newFacultyForm.email || `${newFacultyForm.name.toLowerCase().replace(/[^a-z]/g, '')}@bethsaida.edu.ng`,
      phone: newFacultyForm.phone || '+234 800 000 0000',
      coursesCount: Number.isNaN(parsedCourses) ? 0 : Math.max(0, parsedCourses),
      qualification: newFacultyForm.qualification,
      avatarUrl: newFacultyForm.avatarUrl || undefined,
    };

    if (newFac.avatarUrl) {
      registerPersonAvatar([newFac.name, newFac.email], newFac.avatarUrl);
    }
    setFaculty((prev) => [newFac, ...prev]);
    setIsAddFacultyOpen(false);
    showToast({
      type: 'success',
      title: 'Faculty Added',
      message: `${newFac.name} added to ${newFac.departmentCode} roster.`,
    });
  };

  const handleUpdateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    if (editingFaculty.avatarUrl !== undefined) {
      registerPersonAvatar([editingFaculty.name, editingFaculty.email], editingFaculty.avatarUrl || '');
    }
    setFaculty((prev) => prev.map((f) => (f.id === editingFaculty.id ? editingFaculty : f)));
    setIsEditFacultyOpen(false);
    showToast({
      type: 'success',
      title: 'Faculty Updated',
      message: `${editingFaculty.name} profile has been saved.`,
    });
  };

  const handleDeleteFaculty = () => {
    if (!deleteFacultyTarget) return;
    setFaculty((prev) => prev.filter((f) => f.id !== deleteFacultyTarget.id));
    setIsDeleteFacultyOpen(false);
    showToast({
      type: 'success',
      title: 'Faculty Member Removed',
      message: `${deleteFacultyTarget.name} removed from faculty roster.`,
    });
    setDeleteFacultyTarget(null);
  };

  /* ──────────────────────────────────────────────────────────────────────────
   * HANDLERS: CURRICULUM COURSES CRUD
   * ────────────────────────────────────────────────────────────────────────── */
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseForm.code || !newCourseForm.title) {
      showToast({
        type: 'danger',
        title: 'Missing Course Details',
        message: 'Please enter both course code and title.',
      });
      return;
    }

    const dept = departments.find((d) => d.code === newCourseForm.departmentCode);
    const newCourse = {
      code: newCourseForm.code.toUpperCase(),
      title: newCourseForm.title,
      departmentCode: newCourseForm.departmentCode,
      departmentName: dept?.name || 'Department',
      creditUnits: parseInt(newCourseForm.creditUnits, 10) || 3,
      theoryHours: 2,
      practicalHours: 3,
      level: newCourseForm.level,
      semester: newCourseForm.semester,
      lecturer: newCourseForm.lecturer,
    };

    addCourse(newCourse);
    setIsAddCourseOpen(false);
    showToast({
      type: 'success',
      title: 'Course Added',
      message: `${newCourse.code}: ${newCourse.title} added to curriculum.`,
    });
  };

  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    updateCourse(editingCourse.code, editingCourse);
    setIsEditCourseOpen(false);
    showToast({
      type: 'success',
      title: 'Course Updated',
      message: `${editingCourse.code} curriculum updated successfully.`,
    });
  };

  const handleDeleteCourse = () => {
    if (!deleteCourseTarget) return;
    deleteCourse(deleteCourseTarget.code);
    setIsDeleteCourseOpen(false);
    showToast({
      type: 'success',
      title: 'Course Removed',
      message: `${deleteCourseTarget.code} deleted from curriculum.`,
    });
    setDeleteCourseTarget(null);
  };

  /* ──────────────────────────────────────────────────────────────────────────
   * TABLE COLUMNS
   * ────────────────────────────────────────────────────────────────────────── */
  const departmentColumns = [
    {
      key: 'code',
      header: 'Code',
      render: (d: Department) => (
        <span className="font-extrabold text-[#0F7640] text-sm tracking-wide font-sans">{d.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Department Name',
      render: (d: Department) => (
        <div className="whitespace-nowrap">
          <p className="font-bold text-slate-900">{d.name}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            Council: {d.regulatoryBody} • Office: {d.office}
          </span>
        </div>
      ),
    },
    {
      key: 'hod',
      header: 'Head of Department',
      render: (d: Department) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <PersonAvatar name={d.hod} email={d.hodEmail} avatarUrl={d.hodAvatarUrl} size="sm" />
          <div>
            <p className="font-semibold text-slate-800">{d.hod}</p>
            <span className="text-[11px] text-slate-500">{d.hodEmail}</span>
          </div>
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
        <span className="font-semibold text-slate-700 whitespace-nowrap">{pluralize(d.facultyCount, 'Lecturer')}</span>
      ),
    },
    {
      key: 'accreditationStatus',
      header: 'Accreditation Status',
      render: (d: Department) => (
        <div className="flex items-center gap-1.5 flex-wrap">
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
          {d.isArchived && (
            <Badge variant="neutral" size="sm">
              ARCHIVED
            </Badge>
          )}
        </div>
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
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Edit2 className="w-3 h-3" />}
            onClick={() => handleOpenEditDept(d)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setHodFormDeptCode(d.code);
              setReassignForm({
                selectedFacultyId: '',
                newHodName: '',
                newHodTitle: 'Dr.',
                newHodEmail: '',
                newHodPhone: '',
                newHodAvatarUrl: '',
                effectiveDate: new Date().toISOString().slice(0, 10),
                memoRef: `BCHT/PROV/HOD/2026/${d.code}`,
              });
              setIsReassignHODOpen(true);
            }}
          >
            HOD
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={d.isArchived ? "text-emerald-600 hover:bg-emerald-50" : "text-amber-600 hover:bg-amber-50"}
            onClick={() => handleToggleArchiveDept(d)}
            title={d.isArchived ? "Restore Department" : "Archive Department"}
          >
            {d.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            onClick={() => {
              setDeleteDeptTarget(d);
              setIsDeleteDeptOpen(true);
            }}
            title="Delete Department"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header with Dynamic Contextual Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            Departments & Programmes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Academic departments, accredited training programmes, teaching faculties, and course curriculums.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'directory' && (
            <>
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
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Add Department
              </Button>
            </>
          )}
          {activeTab === 'programmes' && (
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setNewProgForm({
                  name: '',
                  code: '',
                  departmentCode: departments[0]?.code || 'CHE',
                  duration: '3 Years (6 Semesters)',
                  boardQuota: '150',
                  credentialAwarded: 'Professional National Diploma',
                  regulatoryBody: departments[0]?.regulatoryBody || 'CHPRBN',
                  status: 'Full Accreditation',
                });
                setIsAddProgOpen(true);
              }}
              className="bg-[#0F7640] hover:bg-[#093322]"
            >
              Add Programme
            </Button>
          )}
          {activeTab === 'faculty' && (
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setNewFacultyForm({
                  name: '',
                  title: 'Lecturer II',
                  departmentCode: departments[0]?.code || 'CHE',
                  email: '',
                  phone: '',
                  coursesCount: '0',
                  qualification: 'B.Sc, M.Sc',
                  avatarUrl: '',
                });
                setIsAddFacultyOpen(true);
              }}
              className="bg-[#0F7640] hover:bg-[#093322]"
            >
              Add Lecturer
            </Button>
          )}
          {activeTab === 'courses' && (
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setNewCourseForm({
                  code: '',
                  title: '',
                  departmentCode: departments[0]?.code || 'CHE',
                  creditUnits: '3',
                  level: schoolProfile?.academicLevels[0] || '100 Level',
                  semester: schoolProfile?.academicSemesters[0] || 'Harmattan Semester',
                  lecturer: facultyList[0]?.name || 'Dr. K. Bello',
                });
                setIsAddCourseOpen(true);
              }}
              className="bg-[#0F7640] hover:bg-[#093322]"
            >
              Add Course
            </Button>
          )}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Departments
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{departments.length}</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-600 font-semibold">Academic units</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Accredited disciplines</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Health Programmes
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0F7640] font-sans tracking-tight">{programmesList.length}</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Diploma & Certificate</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Approved curriculum</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Academic Faculty
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0F7640] font-sans tracking-tight">
              {facultyList.length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">Lecturers & Preceptors</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Teaching cadre</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Curriculum Courses
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {courses.length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Active semester subjects</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Accredited course list</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Nav Tabs */}
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search department, code, or HOD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F7640] focus:border-[#0F7640] font-sans"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">Regulatory Council:</span>
              <div className="w-56 shrink-0">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Regulatory Councils' },
                    ...schoolProfile.regulatoryCouncils.map((c) => {
                      const match = c.match(/\(([^)]+)\)/);
                      const code = match ? match[1] : c;
                      return { value: code, label: c };
                    }),
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
                <span className="font-bold text-slate-900">Enrolled Academic Departments</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search programme, code, or council..."
                  value={progSearch}
                  onChange={(e) => setProgSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F7640] font-sans"
                />
              </div>
              <div className="w-full sm:w-56">
                <Select
                  value={progDeptFilter}
                  onChange={(val) => setProgDeptFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Departments' },
                    ...departments.map((d) => ({ value: d.code, label: `${d.name} (${d.code})` })),
                  ]}
                />
              </div>
            </div>
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setNewProgForm({
                  name: '',
                  code: '',
                  departmentCode: departments[0]?.code || 'CHE',
                  duration: '3 Years (6 Semesters)',
                  boardQuota: '150',
                  credentialAwarded: 'Professional National Diploma',
                  regulatoryBody: departments[0]?.regulatoryBody || 'CHPRBN',
                  status: 'Full Accreditation',
                });
                setIsAddProgOpen(true);
              }}
              className="bg-[#0F7640] hover:bg-[#093322] shrink-0"
            >
              Add Programme
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programmesList
              .filter((p) => {
                if (progDeptFilter !== 'ALL' && p.departmentCode !== progDeptFilter) return false;
                if (!progSearch.trim()) return true;
                const q = progSearch.toLowerCase();
                return (
                  p.name.toLowerCase().includes(q) ||
                  p.code.toLowerCase().includes(q) ||
                  p.departmentName.toLowerCase().includes(q) ||
                  p.regulatoryBody.toLowerCase().includes(q)
                );
              })
              .map((p) => {
              const quotaPercent = Math.round((p.studentsCount / p.boardQuota) * 100);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
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
                        <span className="text-slate-400 block text-[11px]">Regulatory Council</span>
                        <span className="font-semibold text-slate-800">{p.regulatoryBody}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Approved Quota</span>
                        <span className="font-semibold text-slate-800">{pluralize(p.boardQuota, 'Candidate')}</span>
                      </div>
                    </div>

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

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Edit2 className="w-3 h-3" />}
                      onClick={() => {
                        setEditingProg({ ...p });
                        setIsEditProgOpen(true);
                      }}
                    >
                      Edit Programme
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setDeleteProgTarget(p);
                        setIsDeleteProgOpen(true);
                      }}
                    >
                      Delete
                    </Button>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search HOD name, department, or email..."
                value={hodSearch}
                onChange={(e) => setHodSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F7640] font-sans"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {pluralize(departments.length, 'Appointed Department Head')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments
              .filter((d) => {
                if (!hodSearch.trim()) return true;
                const q = hodSearch.toLowerCase();
                return (
                  d.hod.toLowerCase().includes(q) ||
                  d.name.toLowerCase().includes(q) ||
                  d.code.toLowerCase().includes(q) ||
                  d.hodEmail.toLowerCase().includes(q)
                );
              })
              .map((d) => (
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
                    <PersonAvatar name={d.hod} email={d.hodEmail} avatarUrl={d.hodAvatarUrl} size="md" />
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

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setSelectedDept(d)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setHodFormDeptCode(d.code);
                      setReassignForm({
                        selectedFacultyId: '',
                        newHodName: '',
                        newHodTitle: 'Dr.',
                        newHodEmail: '',
                        newHodPhone: '',
                        newHodAvatarUrl: '',
                        effectiveDate: new Date().toISOString().slice(0, 10),
                        memoRef: `BCHT/PROV/HOD/2026/${d.code}`,
                      });
                      setIsReassignHODOpen(true);
                    }}
                  >
                    Reassign HOD
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
              <span className="font-bold text-slate-900">Teaching Faculty Roster</span>
              <Button
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setNewFacultyForm({
                    name: '',
                    title: 'Lecturer II',
                    departmentCode: departments[0]?.code || 'CHE',
                    email: '',
                    phone: '',
                    coursesCount: '0',
                    qualification: 'B.Sc, M.Sc',
                    avatarUrl: '',
                  });
                  setIsAddFacultyOpen(true);
                }}
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Add Lecturer
              </Button>
            </div>
          }
        >
          <Table
            searchPlaceholder="Search lecturer name, qualification, rank, or email..."
            toolbarFilters={
              <div className="w-56">
                <Select
                  value={facultyDeptFilter}
                  onChange={(val) => setFacultyDeptFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Departments' },
                    ...departments.map((d) => ({ value: d.code, label: `${d.name} (${d.code})` })),
                  ]}
                />
              </div>
            }
            columns={[
              {
                key: 'name',
                header: 'Faculty Name',
                render: (f: FacultyMember) => (
                  <div className="flex items-center gap-2.5 whitespace-nowrap">
                    <PersonAvatar name={f.name} email={f.email} avatarUrl={f.avatarUrl} size="sm" />
                    <div>
                      <p className="font-bold text-slate-900">{f.name}</p>
                      <span className="text-[11px] text-slate-500">{f.qualification}</span>
                    </div>
                  </div>
                ),
              },
              {
                key: 'departmentCode',
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
                render: (f: FacultyMember) => {
                  const normName = f.name
                    .replace(/^(Dr\.|Pharm\.|Prof\.|Mrs\.|Mr\.|Ms\.|Miss|Nurse|Sanitarian)\s+/i, '')
                    .trim()
                    .toLowerCase();
                  const assignedCourses = courses.filter((c) => {
                    if (!c.lecturer) return false;
                    const cNorm = c.lecturer
                      .replace(/^(Dr\.|Pharm\.|Prof\.|Mrs\.|Mr\.|Ms\.|Miss|Nurse|Sanitarian)\s+/i, '')
                      .trim()
                      .toLowerCase();
                    return cNorm === normName || c.lecturer.toLowerCase().trim() === f.name.toLowerCase().trim();
                  });
                  const count = assignedCourses.length > 0 ? assignedCourses.length : (f.coursesCount ?? 0);
                  return (
                    <span className="font-semibold text-slate-900 whitespace-nowrap">
                      {pluralize(count, 'Course')}
                    </span>
                  );
                },
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right' as const,
                render: (f: FacultyMember) => (
                  <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Edit2 className="w-3 h-3" />}
                      onClick={() => {
                        setEditingFaculty({ ...f });
                        setIsEditFacultyOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setDeleteFacultyTarget(f);
                        setIsDeleteFacultyOpen(true);
                      }}
                      title="Remove Faculty Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={
              facultyDeptFilter === 'ALL'
                ? facultyList
                : facultyList.filter((f) => f.departmentCode === facultyDeptFilter)
            }
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
              <Button
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setNewCourseForm({
                    code: '',
                    title: '',
                    departmentCode: departments[0]?.code || 'CHE',
                    creditUnits: '3',
                    level: schoolProfile?.academicLevels[0] || '100 Level',
                    semester: schoolProfile?.academicSemesters[0] || 'Harmattan Semester',
                    lecturer: facultyList[0]?.name || 'Dr. K. Bello',
                  });
                  setIsAddCourseOpen(true);
                }}
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Add Course
              </Button>
            </div>
          }
        >
          <Table
            searchPlaceholder="Search course code, title, or lecturer..."
            toolbarFilters={
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-48">
                  <Select
                    value={courseDeptFilter}
                    onChange={(val) => setCourseDeptFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Departments' },
                      ...departments.map((d) => ({ value: d.code, label: `${d.name} (${d.code})` })),
                    ]}
                  />
                </div>
                <div className="w-40">
                  <Select
                    value={courseLevelFilter}
                    onChange={(val) => setCourseLevelFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Levels' },
                      ...(schoolProfile?.academicLevels || ['100 Level', '200 Level', '300 Level']).map((l) => ({
                        value: l,
                        label: l,
                      })),
                    ]}
                  />
                </div>
              </div>
            }
            columns={[
              {
                key: 'code',
                header: 'Course Code',
                render: (c: any) => (
                  <span className="font-extrabold text-[#0F7640] text-sm tracking-wide font-sans">
                    {c.code}
                  </span>
                ),
              },
              {
                key: 'title',
                header: 'Course Title',
                render: (c: any) => (
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
                render: (c: any) => (
                  <span className="font-bold text-slate-800">
                    {pluralize(Number(c.creditUnits ?? c.units ?? 0), 'Unit')}
                  </span>
                ),
              },
              {
                key: 'level',
                header: 'Level',
                render: (c: any) => (
                  <Badge variant="neutral" size="sm">
                    {c.level}
                  </Badge>
                ),
              },
              {
                key: 'semester',
                header: 'Semester',
                render: (c: any) => (
                  <span className="text-xs font-semibold text-slate-700">{c.semester}</span>
                ),
              },
              {
                key: 'lecturer',
                header: 'Assigned Lecturer',
                render: (c: any) => {
                  const fac = facultyList.find(
                    (f) => f.name.toLowerCase().trim() === String(c.lecturer || '').toLowerCase().trim()
                  );
                  return (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <PersonAvatar name={c.lecturer} email={fac?.email} avatarUrl={fac?.avatarUrl} size="xs" />
                      <span className="text-xs text-slate-800 font-medium">{c.lecturer}</span>
                    </div>
                  );
                },
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right' as const,
                render: (c: any) => (
                  <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Edit2 className="w-3 h-3" />}
                      onClick={() => {
                        setEditingCourse({ ...c });
                        setIsEditCourseOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setDeleteCourseTarget(c);
                        setIsDeleteCourseOpen(true);
                      }}
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={courses.filter((c) => {
              if (courseDeptFilter !== 'ALL' && c.departmentCode !== courseDeptFilter) return false;
              if (courseLevelFilter !== 'ALL' && c.level !== courseLevelFilter) return false;
              return true;
            })}
            keyExtractor={(c) => c.code}
            isDense={isDense}
          />
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 1: VIEW DEPARTMENT DETAILS
       * ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedDept}
        onClose={() => setSelectedDept(null)}
        title={selectedDept?.name || 'Department Details'}
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
            <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Regulatory Council</span>
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
                <span className="font-bold text-slate-900">{pluralize(selectedDept.studentsCount, 'Student')}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Approved Quota</span>
                <span className="font-bold text-slate-900">{pluralize(selectedDept.approvedQuota, 'Candidate')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Departmental Leadership
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PersonAvatar
                    name={selectedDept.hod}
                    email={selectedDept.hodEmail}
                    avatarUrl={selectedDept.hodAvatarUrl}
                    size="md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedDept.hod}</h4>
                    <p className="text-xs text-slate-500">{selectedDept.hodTitle}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {selectedDept.hodEmail} • {selectedDept.hodPhone}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block">Office Location</span>
                  <span className="font-semibold text-slate-800 text-xs">{selectedDept.office}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 2: ADD DEPARTMENT
       * ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddDeptOpen}
        onClose={() => setIsAddDeptOpen(false)}
        title="Register Department"
        description="Establish a new academic department in the college registry."
        size="md"
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
              label="Regulatory Council"
              options={schoolProfile.regulatoryCouncils.map((c) => {
                const match = c.match(/\(([^)]+)\)/);
                const code = match ? match[1] : c;
                return { value: code, label: c };
              })}
              value={newDeptForm.regulatoryBody}
              onChange={(val) => setNewDeptForm({ ...newDeptForm, regulatoryBody: val })}
            />
          </div>

          <Select
            label="Select HOD from Existing Academic Faculty (Optional)"
            placeholder="Search & select lecturer to auto-fill..."
            options={facultyList.map((f) => ({
              value: f.id,
              label: f.name,
              description: `${f.title} • ${f.departmentCode} • ${f.qualification}`,
              avatarUrl: resolveAvatarUrl({ avatarUrl: f.avatarUrl, email: f.email, name: f.name }) || '',
            }))}
            value=""
            onChange={(facId) => {
              const fac = facultyList.find((f) => f.id === facId);
              if (fac) {
                setNewDeptForm((prev) => ({
                  ...prev,
                  hodName: fac.name,
                  hodEmail: fac.email,
                  hodPhone: fac.phone,
                  hodAvatarUrl: resolveAvatarUrl({ avatarUrl: fac.avatarUrl, email: fac.email, name: fac.name }) || '',
                }));
              }
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Title"
              options={[
                { value: 'Dr.', label: 'Dr.' },
                { value: 'Pharm.', label: 'Pharm.' },
                { value: 'Sanitarian', label: 'Sanitarian' },
                { value: 'Nurse', label: 'Nurse' },
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

          <PhotoUploadControl
            label="HOD Profile Photograph"
            name={newDeptForm.hodName}
            value={newDeptForm.hodAvatarUrl}
            onChange={(url) => setNewDeptForm({ ...newDeptForm, hodAvatarUrl: url })}
          />

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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddDeptOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Register Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 3: EDIT DEPARTMENT
       * ────────────────────────────────────────────────────────────────────────── */}
      {editingDept && (
        <Modal
          isOpen={isEditDeptOpen}
          onClose={() => setIsEditDeptOpen(false)}
          title={`Edit ${editingDept.name}`}
          description="Update department records, office location, and approved quotas."
          size="md"
        >
          <form onSubmit={handleUpdateDepartment} className="space-y-3.5 text-xs">
            <Input
              label="Department Name"
              value={editingDept.name}
              onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Department Code"
                value={editingDept.code}
                onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value.toUpperCase() })}
                required
              />
              <Select
                label="Regulatory Council"
                options={schoolProfile.regulatoryCouncils.map((c) => {
                  const match = c.match(/\(([^)]+)\)/);
                  const code = match ? match[1] : c;
                  return { value: code, label: c };
                })}
                value={editingDept.regulatoryBody}
                onChange={(val) => setEditingDept({ ...editingDept, regulatoryBody: val })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Approved Student Quota"
                type="number"
                value={String(editingDept.approvedQuota)}
                onChange={(e) => setEditingDept({ ...editingDept, approvedQuota: parseInt(e.target.value, 10) || 0 })}
              />
              <Input
                label="Office Location"
                value={editingDept.office}
                onChange={(e) => setEditingDept({ ...editingDept, office: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Accreditation Status"
                options={[
                  { value: 'FULL', label: 'Full Accreditation' },
                  { value: 'PROVISIONAL', label: 'Provisional' },
                  { value: 'RENEWAL_DUE', label: 'Renewal Due' },
                ]}
                value={editingDept.accreditationStatus}
                onChange={(val: any) => setEditingDept({ ...editingDept, accreditationStatus: val })}
              />
              <Input
                label="Valid Until"
                value={editingDept.accreditationValidUntil}
                onChange={(e) => setEditingDept({ ...editingDept, accreditationValidUntil: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditDeptOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 4: DELETE DEPARTMENT CONFIRMATION
       * ────────────────────────────────────────────────────────────────────────── */}
      {deleteDeptTarget && (
        <Modal
          isOpen={isDeleteDeptOpen}
          onClose={() => setIsDeleteDeptOpen(false)}
          title="Delete Department"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">{deleteDeptTarget.name} ({deleteDeptTarget.code})</strong>?
              This will remove the department from the academic directory.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteDeptOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteDepartment}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 5: REASSIGN HOD
       * ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isReassignHODOpen}
        onClose={() => setIsReassignHODOpen(false)}
        title="Reassign Head of Department (HOD)"
        description="Formal provost appointment of an academic department head."
        size="md"
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

          <Select
            label="Appoint from Faculty Roster (Search by Name, Rank, or Dept)"
            placeholder="Search & select lecturer to appoint as HOD..."
            options={[...facultyList]
              .sort((a, b) => Number(b.departmentCode === hodFormDeptCode) - Number(a.departmentCode === hodFormDeptCode))
              .map((f) => ({
                value: f.id,
                label: f.name,
                description: `${f.title} • ${f.departmentCode} • ${f.qualification}`,
                avatarUrl: resolveAvatarUrl({ avatarUrl: f.avatarUrl, email: f.email, name: f.name }) || '',
              }))}
            value={reassignForm.selectedFacultyId}
            onChange={(facId) => {
              const fac = facultyList.find((f) => f.id === facId);
              if (fac) {
                setReassignForm((prev) => ({
                  ...prev,
                  selectedFacultyId: fac.id,
                  newHodName: fac.name,
                  newHodEmail: fac.email,
                  newHodPhone: fac.phone,
                  newHodAvatarUrl: resolveAvatarUrl({ avatarUrl: fac.avatarUrl, email: fac.email, name: fac.name }) || '',
                }));
              }
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Title"
              options={[
                { value: 'Dr.', label: 'Dr.' },
                { value: 'Pharm.', label: 'Pharm.' },
                { value: 'Sanitarian', label: 'Sanitarian' },
                { value: 'Nurse', label: 'Nurse' },
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

          <PhotoUploadControl
            label="Appointed HOD Photograph"
            name={reassignForm.newHodName}
            value={reassignForm.newHodAvatarUrl}
            onChange={(url) => setReassignForm({ ...reassignForm, newHodAvatarUrl: url })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DatePicker
              label="Effective Appointment Date"
              value={reassignForm.effectiveDate}
              onChange={(val) => setReassignForm({ ...reassignForm, effectiveDate: val })}
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsReassignHODOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Approve Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 6: ADD PROGRAMME
       * ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddProgOpen}
        onClose={() => setIsAddProgOpen(false)}
        title="Add Training Programme"
        description="Register an accredited certificate, diploma, or national diploma programme."
        size="md"
      >
        <form onSubmit={handleAddProgramme} className="space-y-3.5 text-xs">
          <Input
            label="Programme Title"
            placeholder="e.g. Community Health Extension Worker (CHEW)"
            value={newProgForm.name}
            onChange={(e) => setNewProgForm({ ...newProgForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Programme Code"
              placeholder="e.g. CHEW"
              value={newProgForm.code}
              onChange={(e) => setNewProgForm({ ...newProgForm, code: e.target.value.toUpperCase() })}
              required
            />
            <Select
              label="Department"
              options={departments.map((d) => ({ value: d.code, label: d.name }))}
              value={newProgForm.departmentCode}
              onChange={(val) => setNewProgForm({ ...newProgForm, departmentCode: val })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Duration"
              placeholder="e.g. 3 Years (6 Semesters)"
              value={newProgForm.duration}
              onChange={(e) => setNewProgForm({ ...newProgForm, duration: e.target.value })}
            />
            <Input
              label="Approved Student Quota"
              type="number"
              placeholder="e.g. 150"
              value={newProgForm.boardQuota}
              onChange={(e) => setNewProgForm({ ...newProgForm, boardQuota: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Credential Awarded"
              placeholder="e.g. Professional National Diploma"
              value={newProgForm.credentialAwarded}
              onChange={(e) => setNewProgForm({ ...newProgForm, credentialAwarded: e.target.value })}
            />
            <Select
              label="Regulatory Council"
              options={schoolProfile.regulatoryCouncils.map((c) => {
                const match = c.match(/\(([^)]+)\)/);
                const code = match ? match[1] : c;
                return { value: code, label: c };
              })}
              value={newProgForm.regulatoryBody}
              onChange={(val) => setNewProgForm({ ...newProgForm, regulatoryBody: val })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddProgOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Add Programme
            </Button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 7: EDIT PROGRAMME
       * ────────────────────────────────────────────────────────────────────────── */}
      {editingProg && (
        <Modal
          isOpen={isEditProgOpen}
          onClose={() => setIsEditProgOpen(false)}
          title={`Edit ${editingProg.name}`}
          size="md"
        >
          <form onSubmit={handleUpdateProgramme} className="space-y-3.5 text-xs">
            <Input
              label="Programme Title"
              value={editingProg.name}
              onChange={(e) => setEditingProg({ ...editingProg, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Programme Code"
                value={editingProg.code}
                onChange={(e) => setEditingProg({ ...editingProg, code: e.target.value.toUpperCase() })}
                required
              />
              <Input
                label="Duration"
                value={editingProg.duration}
                onChange={(e) => setEditingProg({ ...editingProg, duration: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Approved Student Quota"
                type="number"
                value={String(editingProg.boardQuota)}
                onChange={(e) => setEditingProg({ ...editingProg, boardQuota: parseInt(e.target.value, 10) || 0 })}
              />
              <Input
                label="Credential Awarded"
                value={editingProg.credentialAwarded}
                onChange={(e) => setEditingProg({ ...editingProg, credentialAwarded: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditProgOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 8: DELETE PROGRAMME CONFIRMATION
       * ────────────────────────────────────────────────────────────────────────── */}
      {deleteProgTarget && (
        <Modal
          isOpen={isDeleteProgOpen}
          onClose={() => setIsDeleteProgOpen(false)}
          title="Delete Programme"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">{deleteProgTarget.name} ({deleteProgTarget.code})</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteProgOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteProgramme}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 9: ADD FACULTY MEMBER
       * ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddFacultyOpen}
        onClose={() => setIsAddFacultyOpen(false)}
        title="Add Academic Lecturer"
        size="md"
      >
        <form onSubmit={handleAddFaculty} className="space-y-3.5 text-xs">
          <PhotoUploadControl
            label="Lecturer Passport Photograph"
            name={newFacultyForm.name}
            value={newFacultyForm.avatarUrl}
            onChange={(url) => setNewFacultyForm({ ...newFacultyForm, avatarUrl: url })}
          />
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Samuel Adebayo"
            value={newFacultyForm.name}
            onChange={(e) => setNewFacultyForm({ ...newFacultyForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Rank / Designation"
              options={[
                { value: 'Chief Lecturer', label: 'Chief Lecturer' },
                { value: 'Principal Lecturer', label: 'Principal Lecturer' },
                { value: 'Senior Lecturer', label: 'Senior Lecturer' },
                { value: 'Lecturer I', label: 'Lecturer I' },
                { value: 'Lecturer II', label: 'Lecturer II' },
                { value: 'Assistant Lecturer', label: 'Assistant Lecturer' },
                { value: 'Clinical Preceptor', label: 'Clinical Preceptor' },
              ]}
              value={newFacultyForm.title}
              onChange={(val) => setNewFacultyForm({ ...newFacultyForm, title: val })}
            />
            <Select
              label="Department"
              options={departments.map((d) => ({ value: d.code, label: d.name }))}
              value={newFacultyForm.departmentCode}
              onChange={(val) => setNewFacultyForm({ ...newFacultyForm, departmentCode: val })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Official Email"
              type="email"
              placeholder="e.g. s.adebayo@bethsaida.edu.ng"
              value={newFacultyForm.email}
              onChange={(e) => setNewFacultyForm({ ...newFacultyForm, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +234 803 111 2233"
              value={newFacultyForm.phone}
              onChange={(e) => setNewFacultyForm({ ...newFacultyForm, phone: e.target.value })}
            />
          </div>

          <Input
            label="Academic Qualifications"
            placeholder="e.g. Ph.D Public Health, M.Sc Community Health"
            value={newFacultyForm.qualification}
            onChange={(e) => setNewFacultyForm({ ...newFacultyForm, qualification: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddFacultyOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Save Lecturer
            </Button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 10: EDIT FACULTY MEMBER
       * ────────────────────────────────────────────────────────────────────────── */}
      {editingFaculty && (
        <Modal
          isOpen={isEditFacultyOpen}
          onClose={() => setIsEditFacultyOpen(false)}
          title={`Edit ${editingFaculty.name}`}
          size="md"
        >
          <form onSubmit={handleUpdateFaculty} className="space-y-3.5 text-xs">
            <PhotoUploadControl
              label="Lecturer Passport Photograph"
              name={editingFaculty.name}
              value={resolveAvatarUrl({ avatarUrl: editingFaculty.avatarUrl, email: editingFaculty.email, name: editingFaculty.name }) || ''}
              onChange={(url) => setEditingFaculty({ ...editingFaculty, avatarUrl: url })}
            />
            <Input
              label="Full Name"
              value={editingFaculty.name}
              onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Designation / Rank"
                value={editingFaculty.title}
                onChange={(e) => setEditingFaculty({ ...editingFaculty, title: e.target.value })}
              />
              <Select
                label="Department"
                options={departments.map((d) => ({ value: d.code, label: d.name }))}
                value={editingFaculty.departmentCode}
                onChange={(val) => setEditingFaculty({ ...editingFaculty, departmentCode: val })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Official Email"
                value={editingFaculty.email}
                onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={editingFaculty.phone}
                onChange={(e) => setEditingFaculty({ ...editingFaculty, phone: e.target.value })}
              />
            </div>

            <Input
              label="Academic Qualifications"
              value={editingFaculty.qualification}
              onChange={(e) => setEditingFaculty({ ...editingFaculty, qualification: e.target.value })}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditFacultyOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 11: DELETE FACULTY CONFIRMATION
       * ────────────────────────────────────────────────────────────────────────── */}
      {deleteFacultyTarget && (
        <Modal
          isOpen={isDeleteFacultyOpen}
          onClose={() => setIsDeleteFacultyOpen(false)}
          title="Remove Faculty Member"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-slate-900">{deleteFacultyTarget.name}</strong> from the academic faculty?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteFacultyOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteFaculty}>
                Confirm Remove
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 12: ADD COURSE
       * ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
        title="Add Curriculum Course"
        size="md"
      >
        <form onSubmit={handleAddCourse} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Course Code"
              placeholder="e.g. CHE 202"
              value={newCourseForm.code}
              onChange={(e) => setNewCourseForm({ ...newCourseForm, code: e.target.value.toUpperCase() })}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Course Title"
                placeholder="e.g. Community Health Nutrition & Dietetics"
                value={newCourseForm.title}
                onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Department"
              options={departments.map((d) => ({ value: d.code, label: d.name }))}
              value={newCourseForm.departmentCode}
              onChange={(val) => setNewCourseForm({ ...newCourseForm, departmentCode: val })}
            />
            <Input
              label="Credit Units"
              type="number"
              value={newCourseForm.creditUnits}
              onChange={(e) => setNewCourseForm({ ...newCourseForm, creditUnits: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Target Level"
              options={schoolProfile.academicLevels.map((l) => ({ value: l, label: l }))}
              value={newCourseForm.level}
              onChange={(val) => setNewCourseForm({ ...newCourseForm, level: val })}
            />
            <Select
              label="Semester"
              options={schoolProfile.academicSemesters.map((s) => ({ value: s, label: s }))}
              value={newCourseForm.semester}
              onChange={(val) => setNewCourseForm({ ...newCourseForm, semester: val })}
            />
          </div>

          <Select
            label="Assigned Lecturer"
            placeholder="Search & select lecturer..."
            options={[...facultyList]
              .sort((a, b) => Number(b.departmentCode === newCourseForm.departmentCode) - Number(a.departmentCode === newCourseForm.departmentCode))
              .map((f) => ({
                value: f.name,
                label: f.name,
                description: `${f.title} • ${f.departmentCode} (${f.qualification})`,
                avatarUrl: resolveAvatarUrl({ avatarUrl: f.avatarUrl, email: f.email, name: f.name }) || '',
              }))}
            value={newCourseForm.lecturer}
            onChange={(val) => setNewCourseForm({ ...newCourseForm, lecturer: val })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddCourseOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Add Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 13: EDIT COURSE
       * ────────────────────────────────────────────────────────────────────────── */}
      {editingCourse && (
        <Modal
          isOpen={isEditCourseOpen}
          onClose={() => setIsEditCourseOpen(false)}
          title={`Edit ${editingCourse.code}`}
          size="md"
        >
          <form onSubmit={handleUpdateCourse} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Course Code"
                value={editingCourse.code}
                readOnly
              />
              <div className="sm:col-span-2">
                <Input
                  label="Course Title"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Credit Units"
                type="number"
                value={String(editingCourse.creditUnits || editingCourse.units)}
                onChange={(e) => setEditingCourse({ ...editingCourse, creditUnits: parseInt(e.target.value, 10) || 0 })}
                required
              />
              <Select
                label="Assigned Lecturer"
                placeholder="Search & select lecturer..."
                options={[...facultyList]
                  .sort((a, b) => Number(b.departmentCode === editingCourse.departmentCode) - Number(a.departmentCode === editingCourse.departmentCode))
                  .map((f) => ({
                    value: f.name,
                    label: f.name,
                    description: `${f.title} • ${f.departmentCode} (${f.qualification})`,
                    avatarUrl: resolveAvatarUrl({ avatarUrl: f.avatarUrl, email: f.email, name: f.name }) || '',
                  }))}
                value={editingCourse.lecturer}
                onChange={(val) => setEditingCourse({ ...editingCourse, lecturer: val })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Target Level"
                options={schoolProfile.academicLevels.map((l) => ({ value: l, label: l }))}
                value={editingCourse.level}
                onChange={(val) => setEditingCourse({ ...editingCourse, level: val })}
              />
              <Select
                label="Semester"
                options={schoolProfile.academicSemesters.map((s) => ({ value: s, label: s }))}
                value={editingCourse.semester}
                onChange={(val) => setEditingCourse({ ...editingCourse, semester: val })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditCourseOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * MODAL 14: DELETE COURSE CONFIRMATION
       * ────────────────────────────────────────────────────────────────────────── */}
      {deleteCourseTarget && (
        <Modal
          isOpen={isDeleteCourseOpen}
          onClose={() => setIsDeleteCourseOpen(false)}
          title="Delete Course"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">{deleteCourseTarget.code}: {deleteCourseTarget.title}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteCourseOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteCourse}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
