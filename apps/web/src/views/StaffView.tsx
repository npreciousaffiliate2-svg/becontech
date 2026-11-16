import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { useSharedRecords } from '../lib/sharedRecords.ts';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Input,
  Select,
  DatePicker,
  useToast,
  Tabs,
} from '@campusone/ui';
import {
  Users,
  Briefcase,
  DollarSign,
  ShieldCheck,
  Calendar,
  Lock,
  CheckCircle,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  Building2,
  Clock,
  Eye,
  Check,
  X,
  Award,
  UserCheck,
  Edit2,
  Trash2,
} from 'lucide-react';
import { formatNaira } from '@campusone/contracts';
import { printInstitutionalDocument } from '../utils/documentExport.ts';
import { PersonAvatar, PhotoUploadControl, pluralize } from '../components/common/PersonAvatar.tsx';
import { StateLgaSelect } from '../components/common/StateLgaSelect.tsx';

/* ─── TYPES ─── */
type StaffTab = 'directory' | 'payroll' | 'leave' | 'licensing';
type EmploymentType = 'FULL_TIME' | 'ADJUNCT_PRECEPTOR' | 'CONTRACT' | 'ADMINISTRATIVE';
type LicenseStatus = 'VERIFIED_CURRENT' | 'RENEWAL_DUE' | 'EXPIRED';
type LeaveStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

interface StaffMember {
  id: string;
  staffId: string;
  fullName: string;
  credentials: string;
  designation: string;
  departmentCode: string;
  departmentName: string;
  employmentType: EmploymentType;
  licenseBody: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseStatus: LicenseStatus;
  email: string;
  phone: string;
  dateJoined: string;
  salaryGrade: string;
  basicSalaryKobo: number;
  hazardAllowanceKobo: number;
  teachingAllowanceKobo: number;
  payeTaxKobo: number;
  pensionKobo: number;
  avatarUrl?: string;
  stateOfOrigin?: string;
  lga?: string;
}

interface LeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  departmentName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reliefOfficer: string;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
}

export const StaffView: React.FC = () => {
  const { isDense, recordAudit, schoolProfile, departments, resolveAvatarUrl, registerPersonAvatar } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tab: routeTab } = useParams<{ tab: string }>();

  // Tab synchronization
  const resolveTab = (tabStr?: string | null): StaffTab => {
    if (!tabStr) return 'directory';
    if (['directory', 'payroll', 'leave', 'licensing'].includes(tabStr)) {
      return tabStr as StaffTab;
    }
    return 'directory';
  };

  const [activeTab, setActiveTab] = useState<StaffTab>(
    resolveTab(routeTab || searchParams.get('tab'))
  );

  useEffect(() => {
    const nextTab = resolveTab(routeTab || searchParams.get('tab'));
    setActiveTab(nextTab);
  }, [routeTab, searchParams]);

  const handleTabChange = (id: StaffTab) => {
    setActiveTab(id);
    navigate(`/staff/${id}`);
  };

  /* ─── STATE FOR PAYROLL & SEARCH ─── */
  const [isPayrollLocked, setIsPayrollLocked] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [employmentFilter, setEmploymentFilter] = useState('ALL');
  const [payrollSearch, setPayrollSearch] = useState('');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [licensingSearch, setLicensingSearch] = useState('');

  /* ─── MODAL STATES ─── */
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslipStaff, setSelectedPayslipStaff] = useState<StaffMember | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isDeleteStaffOpen, setIsDeleteStaffOpen] = useState(false);
  const [deleteStaffTarget, setDeleteStaffTarget] = useState<StaffMember | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);

  /* ─── NEW STAFF FORM STATE ─── */
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffCredentials, setNewStaffCredentials] = useState('');
  const [newStaffDesignation, setNewStaffDesignation] = useState('');
  const [newStaffDept, setNewStaffDept] = useState('CHE');
  const [newStaffType, setNewStaffType] = useState<EmploymentType>('FULL_TIME');
  const [newStaffLicenseBody, setNewStaffLicenseBody] = useState('CHPRBN');
  const [newStaffLicenseNum, setNewStaffLicenseNum] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffAvatarUrl, setNewStaffAvatarUrl] = useState('');
  const [newStaffState, setNewStaffState] = useState('Oyo');
  const [newStaffLga, setNewStaffLga] = useState('Ibadan North');

  /* ─── DATA: STAFF MEMBERS ─── */
  const [staffMembers, setStaffMembers] = useSharedRecords<StaffMember>('staff.members', [
    {
      id: 'stf-01',
      staffId: 'BCHT/ACAD/001',
      fullName: 'Dr. Kehinde Bello',
      credentials: 'MBBS, MPH, FWACP',
      designation: 'Chief Lecturer & Head of Department',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      employmentType: 'FULL_TIME',
      licenseBody: 'MDCN / CHPRBN',
      licenseNumber: 'MDCN/R/48291',
      licenseExpiry: '2028-04-30',
      licenseStatus: 'VERIFIED_CURRENT',
      email: 'hod.che@bethsaida.edu.ng',
      phone: '+234 803 124 5590',
      dateJoined: '2021-09-01',
      salaryGrade: 'CONPCASS 15/4',
      basicSalaryKobo: 48000000,
      hazardAllowanceKobo: 4500000,
      teachingAllowanceKobo: 3500000,
      payeTaxKobo: 4200000,
      pensionKobo: 3840000,
    },
    {
      id: 'stf-02',
      staffId: 'BCHT/ACAD/002',
      fullName: 'Mr. Olumide Adebisi',
      credentials: 'BMLS, MSc, AIMLS',
      designation: 'Principal Lecturer & Head of Department',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Technology',
      employmentType: 'FULL_TIME',
      licenseBody: 'MLSCN',
      licenseNumber: 'MLSCN/P/19402',
      licenseExpiry: '2027-11-15',
      licenseStatus: 'VERIFIED_CURRENT',
      email: 'hod.mlt@bethsaida.edu.ng',
      phone: '+234 802 771 9021',
      dateJoined: '2022-01-15',
      salaryGrade: 'CONPCASS 14/3',
      basicSalaryKobo: 42000000,
      hazardAllowanceKobo: 4000000,
      teachingAllowanceKobo: 3000000,
      payeTaxKobo: 3600000,
      pensionKobo: 3360000,
    },
    {
      id: 'stf-03',
      staffId: 'BCHT/ACAD/003',
      fullName: 'Pharm. Folashade Oladipo',
      credentials: 'B.Pharm, MPSN',
      designation: 'Senior Lecturer & Head of Department',
      departmentCode: 'PHT',
      departmentName: 'Pharmacy Technician Studies',
      employmentType: 'FULL_TIME',
      licenseBody: 'PCN',
      licenseNumber: 'PCN/REG/88120',
      licenseExpiry: '2027-08-20',
      licenseStatus: 'VERIFIED_CURRENT',
      email: 'hod.pht@bethsaida.edu.ng',
      phone: '+234 805 443 1892',
      dateJoined: '2022-06-10',
      salaryGrade: 'CONPCASS 13/2',
      basicSalaryKobo: 38000000,
      hazardAllowanceKobo: 3500000,
      teachingAllowanceKobo: 2500000,
      payeTaxKobo: 3100000,
      pensionKobo: 3040000,
    },
    {
      id: 'stf-04',
      staffId: 'BCHT/ACAD/004',
      fullName: 'Mrs. Titilayo Adeleke',
      credentials: 'BSc (HIM), RHIV',
      designation: 'Senior Lecturer & Head of Department',
      departmentCode: 'HIM',
      departmentName: 'Health Information Management',
      employmentType: 'FULL_TIME',
      licenseBody: 'HRORBN',
      licenseNumber: 'HRORBN/LIC/3041',
      licenseExpiry: '2027-03-31',
      licenseStatus: 'VERIFIED_CURRENT',
      email: 'hod.him@bethsaida.edu.ng',
      phone: '+234 809 332 7611',
      dateJoined: '2023-02-01',
      salaryGrade: 'CONPCASS 13/1',
      basicSalaryKobo: 35000000,
      hazardAllowanceKobo: 2000000,
      teachingAllowanceKobo: 2500000,
      payeTaxKobo: 2800000,
      pensionKobo: 2800000,
    },
    {
      id: 'stf-05',
      staffId: 'BCHT/ACAD/005',
      fullName: 'Sanitarian Babatunde Ibrahim',
      credentials: 'B.Tech, REHO',
      designation: 'Principal Lecturer & Head of Department',
      departmentCode: 'EHT',
      departmentName: 'Environmental Health Sciences',
      employmentType: 'FULL_TIME',
      licenseBody: 'EHORECON',
      licenseNumber: 'EHOR/LIC/5519',
      licenseExpiry: '2026-12-31',
      licenseStatus: 'RENEWAL_DUE',
      email: 'hod.eht@bethsaida.edu.ng',
      phone: '+234 807 551 2290',
      dateJoined: '2021-11-15',
      salaryGrade: 'CONPCASS 14/2',
      basicSalaryKobo: 41000000,
      hazardAllowanceKobo: 3500000,
      teachingAllowanceKobo: 2500000,
      payeTaxKobo: 3400000,
      pensionKobo: 3280000,
    },
    {
      id: 'stf-06',
      staffId: 'BCHT/CLN/006',
      fullName: 'Dr. (Mrs) Olukoya',
      credentials: 'MBBS, FWACP',
      designation: 'Consultant Clinical Preceptor (UCH Liaison)',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      employmentType: 'ADJUNCT_PRECEPTOR',
      licenseBody: 'MDCN',
      licenseNumber: 'MDCN/R/33912',
      licenseExpiry: '2028-09-30',
      licenseStatus: 'VERIFIED_CURRENT',
      email: 'olukoya.cln@bethsaida.edu.ng',
      phone: '+234 802 334 1920',
      dateJoined: '2023-08-01',
      salaryGrade: 'Honorarium Scale',
      basicSalaryKobo: 25000000,
      hazardAllowanceKobo: 2000000,
      teachingAllowanceKobo: 1500000,
      payeTaxKobo: 1800000,
      pensionKobo: 0,
    },
  ]);

  /* ─── DATA: LEAVE REQUESTS ─── */
  const [leaves, setLeaves] = useSharedRecords<LeaveRecord>('staff.leaves', [
    {
      id: 'lev-01',
      staffId: 'BCHT/ACAD/003',
      staffName: 'Pharm. Folashade Oladipo',
      departmentName: 'Pharmacy Technician Studies',
      leaveType: 'Annual Leave',
      startDate: '2026-12-01',
      endDate: '2026-12-21',
      durationDays: 14,
      reliefOfficer: 'Pharm. B. Ibrahim',
      reason: 'Statutory annual leave entitlement for 2026 academic calendar.',
      status: 'APPROVED',
      appliedDate: '2026-11-08',
      approvedBy: 'Dr. Timothy Balogun (Provost)',
    },
    {
      id: 'lev-02',
      staffId: 'BCHT/ACAD/002',
      staffName: 'Mr. Olumide Adebisi',
      departmentName: 'Medical Laboratory Technology',
      leaveType: 'Clinical Study Leave',
      startDate: '2026-11-20',
      endDate: '2026-11-25',
      durationDays: 5,
      reliefOfficer: 'Mr. S. Alabi (Senior Lab Tech)',
      reason: 'Participation in MLSCN Continuous Professional Development training.',
      status: 'PENDING',
      appliedDate: '2026-11-11',
    },
    {
      id: 'lev-03',
      staffId: 'BCHT/ACAD/005',
      staffName: 'Sanitarian Babatunde Ibrahim',
      departmentName: 'Environmental Health Sciences',
      leaveType: 'Casual Leave',
      startDate: '2026-11-04',
      endDate: '2026-11-06',
      durationDays: 2,
      reliefOfficer: 'Mrs. T. Adeleke',
      reason: 'Urgent family engagement in Oyo town.',
      status: 'APPROVED',
      appliedDate: '2026-11-02',
      approvedBy: 'Dr. Timothy Balogun (Provost)',
    },
  ]);

  /* ─── ACTIONS ─── */
  const handleLockPayroll = () => {
    setIsPayrollLocked(true);
    recordAudit('PAYROLL_RUN_LOCKED', 'HRM_PAYROLL', 'PAYROLL-NOV-2026');
    showToast({
      type: 'success',
      title: 'November 2026 Payroll Frozen & Audited',
      message: 'Net payout ₦18,450,000 committed with statutory PAYE and Pension schedules sent to accounts.',
    });
  };

  const handleOpenDossier = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsDossierModalOpen(true);
  };

  const handleOpenPayslip = (staff: StaffMember) => {
    setSelectedPayslipStaff(staff);
    setIsPayslipModalOpen(true);
  };

  const handleClosePayslip = () => {
    setIsPayslipModalOpen(false);
    setSelectedPayslipStaff(null);
  };

  const handleApproveLeave = (leave: LeaveRecord) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leave.id
          ? { ...l, status: 'APPROVED', approvedBy: 'Dr. Timothy Balogun (Provost)' }
          : l
      )
    );
    recordAudit('STAFF_LEAVE_APPROVED', 'HRM_LEAVE', leave.staffId);
    showToast({
      type: 'success',
      title: 'Leave Approved',
      message: `${leave.leaveType} for ${leave.staffName} approved with handover confirmed.`,
    });
    setIsLeaveModalOpen(false);
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      showToast({ type: 'warning', title: 'Validation Error', message: 'Staff name and official email are required.' });
      return;
    }

    const newStaff: StaffMember = {
      id: `stf-0${staffMembers.length + 1}`,
      staffId: `${schoolProfile?.institutionAcronym || 'BCHT'}/ACAD/00${staffMembers.length + 1}`,
      fullName: newStaffName.trim(),
      credentials: newStaffCredentials.trim() || 'BSc, MSc',
      designation: newStaffDesignation.trim() || 'Lecturer II',
      departmentCode: newStaffDept,
      departmentName: newStaffDept === 'CHE' ? 'Community Health' : newStaffDept === 'MLT' ? 'Medical Laboratory' : 'Health Sciences',
      employmentType: newStaffType,
      licenseBody: newStaffLicenseBody,
      licenseNumber: newStaffLicenseNum.trim() || 'VERIFIED-NEW',
      licenseExpiry: '2028-12-31',
      licenseStatus: 'VERIFIED_CURRENT',
      email: newStaffEmail.trim(),
      phone: newStaffPhone.trim() || '+234 800 000 0000',
      dateJoined: new Date().toISOString().split('T')[0],
      salaryGrade: 'CONPCASS 11/2',
      basicSalaryKobo: 28000000,
      hazardAllowanceKobo: 2500000,
      teachingAllowanceKobo: 1500000,
      payeTaxKobo: 2200000,
      pensionKobo: 2240000,
      avatarUrl: newStaffAvatarUrl || undefined,
      stateOfOrigin: newStaffState,
      lga: newStaffLga,
    };

    if (newStaff.avatarUrl) {
      registerPersonAvatar([newStaff.fullName, newStaff.email, newStaff.staffId], newStaff.avatarUrl);
    }
    setStaffMembers((prev) => [newStaff, ...prev]);
    recordAudit('NEW_STAFF_EMPLOYED', 'HRM_DIRECTORY', newStaff.staffId);
    showToast({
      type: 'success',
      title: 'Staff Profile Registered',
      message: `${newStaff.fullName} added to faculty registry with Staff ID ${newStaff.staffId}.`,
    });
    setIsAddStaffModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setNewStaffAvatarUrl('');
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (editingStaff.avatarUrl !== undefined) {
      registerPersonAvatar(
        [editingStaff.fullName, editingStaff.email, editingStaff.staffId],
        editingStaff.avatarUrl || ''
      );
    }
    setStaffMembers((prev) =>
      prev.map((s) => (s.id === editingStaff.id ? editingStaff : s))
    );
    setIsEditStaffOpen(false);
    setEditingStaff(null);
    showToast({
      type: 'success',
      title: 'Staff Record Updated',
      message: `${editingStaff.fullName}'s profile has been updated.`,
    });
  };

  const handleDeleteStaff = () => {
    if (!deleteStaffTarget) return;
    setStaffMembers((prev) => prev.filter((s) => s.id !== deleteStaffTarget.id));
    setIsDeleteStaffOpen(false);
    setDeleteStaffTarget(null);
    showToast({
      type: 'success',
      title: 'Staff Member Removed',
      message: `${deleteStaffTarget.fullName} has been removed from the directory.`,
    });
  };

  /* ─── DERIVED FILTERED LISTS ─── */
  const filteredStaff = staffMembers.filter((s) => {
    if (deptFilter !== 'ALL' && s.departmentCode !== deptFilter) return false;
    if (employmentFilter !== 'ALL' && s.employmentType !== employmentFilter) return false;
    if (directorySearch.trim()) {
      const q = directorySearch.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchId = s.staffId.toLowerCase().includes(q);
      const matchDept = s.departmentName.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDept) return false;
    }
    return true;
  });

  const filteredPayroll = staffMembers.filter((s) => {
    if (payrollSearch.trim()) {
      const q = payrollSearch.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchId = s.staffId.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  const filteredLeaves = leaves.filter((l) => {
    if (leaveSearch.trim()) {
      const q = leaveSearch.toLowerCase();
      const matchName = l.staffName.toLowerCase().includes(q);
      const matchId = l.staffId.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  /* ─── TABLE 1: STAFF DIRECTORY COLUMNS ─── */
  const directoryColumns = [
    {
      key: 'staffId',
      header: 'Staff ID',
      nowrap: true,
      render: (s: StaffMember) => (
        <span className="font-bold text-[#0F7640]">{s.staffId}</span>
      ),
    },
    {
      key: 'fullName',
      header: 'Staff Full Name & Credentials',
      render: (s: StaffMember) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <PersonAvatar name={s.fullName} email={s.email} staffId={s.staffId} avatarUrl={s.avatarUrl} size="sm" />
          <div>
            <span className="font-bold text-slate-900 block">{s.fullName}</span>
            <span className="text-[11px] text-slate-500 font-medium">{s.credentials}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'designation',
      header: 'Designation & Department',
      render: (s: StaffMember) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{s.designation}</span>
          <span className="text-[11px] text-[#0F7640] font-medium">{s.departmentName}</span>
        </div>
      ),
    },
    {
      key: 'employmentType',
      header: 'Category',
      nowrap: true,
      render: (s: StaffMember) => {
        const badgeMap = {
          FULL_TIME: { variant: 'success' as const, label: 'Full-Time Faculty' },
          ADJUNCT_PRECEPTOR: { variant: 'primary' as const, label: 'Clinical Adjunct' },
          CONTRACT: { variant: 'warning' as const, label: 'Contract' },
          ADMINISTRATIVE: { variant: 'neutral' as const, label: 'Administrative' },
        };
        return <Badge variant={badgeMap[s.employmentType].variant} size="sm">{badgeMap[s.employmentType].label}</Badge>;
      },
    },
    {
      key: 'licenseNumber',
      header: 'Regulatory License',
      nowrap: true,
      render: (s: StaffMember) => (
        <div>
          <span className="font-semibold text-slate-800 block">{s.licenseNumber}</span>
          <span className="text-[11px] text-slate-400">{s.licenseBody} • Exp: {s.licenseExpiry}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right' as const,
      nowrap: true,
      render: (s: StaffMember) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenDossier(s)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="whitespace-nowrap"
          >
            Profile
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingStaff({ ...s });
              setIsEditStaffOpen(true);
            }}
            leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500" />}
            className="hover:text-slate-900"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDeleteStaffTarget(s);
              setIsDeleteStaffOpen(true);
            }}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
            className="hover:text-red-700 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>
      ),
    },
  ];

  /* ─── TABLE 2: PAYROLL REMUNERATION COLUMNS ─── */
  const payrollColumns = [
    {
      key: 'staffId',
      header: 'Staff ID',
      nowrap: true,
      render: (s: StaffMember) => <span className="font-bold text-slate-900">{s.staffId}</span>,
    },
    {
      key: 'fullName',
      header: 'Employee Name & Grade',
      render: (s: StaffMember) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <PersonAvatar name={s.fullName} email={s.email} staffId={s.staffId} avatarUrl={s.avatarUrl} size="sm" />
          <div>
            <span className="font-semibold text-slate-900 block">{s.fullName}</span>
            <span className="text-[11px] text-slate-400">{s.salaryGrade}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'basicSalary',
      header: 'Basic Salary',
      align: 'right' as const,
      nowrap: true,
      render: (s: StaffMember) => (
        <span className="font-semibold text-slate-800 font-sans">{formatNaira(s.basicSalaryKobo)}</span>
      ),
    },
    {
      key: 'allowances',
      header: 'Hazard & Teaching',
      align: 'right' as const,
      nowrap: true,
      render: (s: StaffMember) => (
        <span className="font-medium text-slate-700 font-sans">
          +{formatNaira(s.hazardAllowanceKobo + s.teachingAllowanceKobo)}
        </span>
      ),
    },
    {
      key: 'deductions',
      header: 'PAYE Tax & Pension',
      align: 'right' as const,
      nowrap: true,
      render: (s: StaffMember) => (
        <span className="font-medium text-rose-600 font-sans">
          -{formatNaira(s.payeTaxKobo + s.pensionKobo)}
        </span>
      ),
    },
    {
      key: 'netPay',
      header: 'Net Take-Home Pay',
      align: 'right' as const,
      nowrap: true,
      render: (s: StaffMember) => {
        const net = s.basicSalaryKobo + s.hazardAllowanceKobo + s.teachingAllowanceKobo - (s.payeTaxKobo + s.pensionKobo);
        return <span className="font-extrabold text-[#13A348] text-sm font-sans">{formatNaira(net)}</span>;
      },
    },
    {
      key: 'action',
      header: 'Payslip',
      align: 'right' as const,
      nowrap: true,
      render: (s: StaffMember) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleOpenPayslip(s)}
          leftIcon={<Printer className="w-3.5 h-3.5" />}
          className="whitespace-nowrap"
        >
          Print Payslip
        </Button>
      ),
    },
  ];

  /* ─── TABLE 3: LEAVE APPLICATIONS COLUMNS ─── */
  const leaveColumns = [
    {
      key: 'staffId',
      header: 'Staff ID & Name',
      render: (l: LeaveRecord) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <PersonAvatar name={l.staffName} staffId={l.staffId} size="sm" />
          <div>
            <span className="font-bold text-slate-900 block">{l.staffName}</span>
            <span className="text-[11px] text-slate-400">{l.staffId} • {l.departmentName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'leaveType',
      header: 'Leave Category',
      nowrap: true,
      render: (l: LeaveRecord) => (
        <span className="font-semibold text-slate-800 text-xs">{l.leaveType}</span>
      ),
    },
    {
      key: 'dates',
      header: 'Duration & Period',
      nowrap: true,
      render: (l: LeaveRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{pluralize(l.durationDays, 'Working Day')}</span>
          <span className="text-[11px] text-slate-500">{l.startDate} to {l.endDate}</span>
        </div>
      ),
    },
    {
      key: 'relief',
      header: 'Handover Relief Officer',
      render: (l: LeaveRecord) => (
        <span className="text-xs text-slate-700 font-medium">{l.reliefOfficer}</span>
      ),
    },
    {
      key: 'status',
      header: 'Approval Standing',
      nowrap: true,
      render: (l: LeaveRecord) => {
        const badgeMap = {
          APPROVED: { variant: 'success' as const, label: 'Approved by Provost' },
          PENDING: { variant: 'warning' as const, label: 'Pending Approval' },
          REJECTED: { variant: 'danger' as const, label: 'Rejected' },
        };
        return <Badge variant={badgeMap[l.status].variant} size="sm">{badgeMap[l.status].label}</Badge>;
      },
    },
    {
      key: 'action',
      header: 'Review',
      align: 'right' as const,
      nowrap: true,
      render: (l: LeaveRecord) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelectedLeave(l);
            setIsLeaveModalOpen(true);
          }}
          className="whitespace-nowrap"
        >
          Review Request
        </Button>
      ),
    },
  ];

  /* ─── TABLE 4: REGULATORY LICENSING COLUMNS ─── */
  const licensingColumns = [
    {
      key: 'staffName',
      header: 'Faculty Member',
      render: (s: StaffMember) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <PersonAvatar name={s.fullName} email={s.email} staffId={s.staffId} avatarUrl={s.avatarUrl} size="sm" />
          <div>
            <span className="font-bold text-slate-900 block">{s.fullName}</span>
            <span className="text-[11px] text-slate-500">{s.designation}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'licenseBody',
      header: 'Accrediting Council',
      nowrap: true,
      render: (s: StaffMember) => (
        <span className="font-bold text-[#0F7640] text-xs">{s.licenseBody}</span>
      ),
    },
    {
      key: 'licenseNumber',
      header: 'Registration Seal No.',
      nowrap: true,
      render: (s: StaffMember) => (
        <span className="font-semibold text-slate-800 text-xs">{s.licenseNumber}</span>
      ),
    },
    {
      key: 'expiry',
      header: 'Practicing Expiry',
      nowrap: true,
      render: (s: StaffMember) => (
        <span className="text-xs text-slate-700">{s.licenseExpiry}</span>
      ),
    },
    {
      key: 'status',
      header: 'Compliance Status',
      nowrap: true,
      render: (s: StaffMember) => (
        <Badge variant={s.licenseStatus === 'VERIFIED_CURRENT' ? 'success' : 'warning'} size="sm">
          {s.licenseStatus === 'VERIFIED_CURRENT' ? 'Current & Verified' : 'Renewal Due'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Verification',
      align: 'right' as const,
      nowrap: true,
      render: (s: StaffMember) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            showToast({
              type: 'info',
              title: 'Council Registry Checked',
              message: `${s.licenseBody} practicing register verified for ${s.fullName}.`,
            });
          }}
          leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#13A348]" />}
          className="whitespace-nowrap"
        >
          Verify Council
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff & Human Resources</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty directory, monthly salary payroll schedules, leave administration, and regulatory license verifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'directory' && (
            <Button
              size="sm"
              onClick={() => setIsAddStaffModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Add New Staff
            </Button>
          )}
          {activeTab === 'payroll' && !isPayrollLocked && (
            <Button
              size="sm"
              onClick={handleLockPayroll}
              leftIcon={<Lock className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Lock & Authorize Payroll Run
            </Button>
          )}
          {activeTab === 'payroll' && isPayrollLocked && (
            <Badge variant="success" size="md">
              <Check className="w-3.5 h-3.5 inline mr-1" /> November Payroll Frozen & Audited
            </Badge>
          )}
        </div>
      </div>

      {/* ─── Staff Stat Cards (Spacious, No Squeezing) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Total Employees
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">64</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">44 Academic Faculty</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">20 Support staff</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Monthly Payroll
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">₦18.45M</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Net Payout</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">PAYE: ₦1.8M</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              License Compliance
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">97.7%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">43 Active Licenses</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">1 Due renewal</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Staff on Leave
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">3</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">Approved leaves</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Handover verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <Tabs
        tabs={[
          { id: 'directory', label: 'Staff Directory' },
          { id: 'payroll', label: 'Monthly Salaries' },
          { id: 'leave', label: 'Staff Leaves' },
          { id: 'licensing', label: 'Licensing Audits' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: STAFF DIRECTORY ─── */}
      {activeTab === 'directory' && (
        <Card>
          <Table
            columns={directoryColumns}
            data={filteredStaff}
            keyExtractor={(s) => s.id}
            isDense={isDense}
            searchValue={directorySearch}
            onSearchChange={setDirectorySearch}
            searchPlaceholder="Search staff name, ID, or department..."
            toolbarFilters={
              <>
                <div className="w-44">
                  <Select
                    value={deptFilter}
                    onChange={(val) => setDeptFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Departments' },
                      ...(departments || []).map((d) => ({ value: d.code, label: d.name })),
                    ]}
                  />
                </div>
                <div className="w-40">
                  <Select
                    value={employmentFilter}
                    onChange={(val) => setEmploymentFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Categories' },
                      { value: 'FULL_TIME', label: 'Full-Time Faculty' },
                      { value: 'ADJUNCT_PRECEPTOR', label: 'Clinical Adjunct' },
                      { value: 'CONTRACT', label: 'Contract' },
                    ]}
                  />
                </div>
              </>
            }
            toolbarActions={
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsAddStaffModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Add Staff Member
              </Button>
            }
          />
        </Card>
      )}

      {/* ─── TAB 2: PAYROLL REMUNERATION ─── */}
      {activeTab === 'payroll' && (
        <Card>
          <Table
            columns={payrollColumns}
            data={filteredPayroll}
            keyExtractor={(s) => s.id}
            isDense={isDense}
            searchValue={payrollSearch}
            onSearchChange={setPayrollSearch}
            searchPlaceholder="Search employee name or staff ID..."
            toolbarFilters={
              <div className="text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 font-sans">
                <span className="font-semibold text-slate-700 whitespace-nowrap">Salary Schedule:</span>
                <span className="text-slate-500 text-[11px] sm:text-xs">CONPCASS Structure (November 2026 Run)</span>
              </div>
            }
          />
        </Card>
      )}

      {/* ─── TAB 3: LEAVE APPLICATIONS ─── */}
      {activeTab === 'leave' && (
        <Card>
          <Table
            columns={leaveColumns}
            data={filteredLeaves}
            keyExtractor={(l) => l.id}
            isDense={isDense}
            searchValue={leaveSearch}
            onSearchChange={setLeaveSearch}
            searchPlaceholder="Search staff name or department..."
            toolbarFilters={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Leave Policy Roster',
                    message: 'Official annual leave quota schedule dispatched to academic department heads.',
                  });
                }}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                View Leave Schedule
              </Button>
            }
          />
        </Card>
      )}

      {/* ─── TAB 4: REGULATORY LICENSING AUDITS ─── */}
      {activeTab === 'licensing' && (
        <Card>
          <Table
            columns={licensingColumns}
            data={filteredStaff}
            keyExtractor={(s) => s.id}
            isDense={isDense}
            searchValue={licensingSearch}
            onSearchChange={setLicensingSearch}
            searchPlaceholder="Search faculty name or council..."
            toolbarFilters={
              <div className="text-xs text-slate-500">
                Statutory regulatory practicing license verification for faculty instructors.
              </div>
            }
          />
        </Card>
      )}

      {/* ─── MODAL 1: STAFF DOSSIER PROFILE ─── */}
      <Modal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title="Official Staff Academic Dossier"
        size="md"
      >
        {selectedStaff && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center gap-3.5">
              <PersonAvatar
                name={selectedStaff.fullName}
                email={selectedStaff.email}
                staffId={selectedStaff.staffId}
                avatarUrl={selectedStaff.avatarUrl}
                size="lg"
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-[#0F7640] text-xs">{selectedStaff.staffId}</span>
                  <Badge variant="success" size="sm">{selectedStaff.employmentType.replace('_', ' ')}</Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-sm truncate">{selectedStaff.fullName}</h3>
                <p className="text-slate-500 text-[11px] truncate">{selectedStaff.credentials} • {selectedStaff.designation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-bold text-slate-900">{selectedStaff.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Appointment Date</span>
                <span className="font-semibold text-slate-800">{selectedStaff.dateJoined}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Official Email</span>
                <span className="font-semibold text-slate-800">{selectedStaff.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                <span className="font-semibold text-slate-800">{selectedStaff.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">State of Origin / LGA</span>
                <span className="font-semibold text-slate-800">
                  {selectedStaff.stateOfOrigin || 'Oyo'} State ({selectedStaff.lga || 'Ibadan North'} LGA)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <span className="font-bold text-slate-900 block">Regulatory License Information:</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] block">Accrediting Council</span>
                  <span className="font-semibold">{selectedStaff.licenseBody}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">License Certificate No.</span>
                  <span className="font-semibold">{selectedStaff.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Practicing Expiry</span>
                  <span className="font-semibold">{selectedStaff.licenseExpiry}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Verification Status</span>
                  <span className="font-bold text-[#13A348]">VERIFIED CURRENT</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setIsDossierModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  if (!selectedStaff) return;
                  printInstitutionalDocument({
                    title: `Staff Personnel Dossier — ${selectedStaff.fullName}`,
                    badgeText: `OFFICIAL PERSONNEL & LICENSING RECORD • ${selectedStaff.staffId}`,
                    referenceNo: `BCHT/HR/${selectedStaff.staffId.replace(/\//g, '-')}`,
                    schoolProfile,
                    officeSubtitle: 'Human Resources & Establishment Directorate',
                    metaItems: [
                      { label: 'Full Legal Name', value: `${selectedStaff.fullName} (${selectedStaff.credentials})`, highlight: true },
                      { label: 'Staff ID Number', value: selectedStaff.staffId, highlight: true },
                      { label: 'Academic Designation', value: selectedStaff.designation },
                      { label: 'Department', value: selectedStaff.departmentName },
                      { label: 'Employment Category', value: selectedStaff.employmentType.replace('_', ' ') },
                      { label: 'Date Appointed', value: selectedStaff.dateJoined },
                      { label: 'Official Email', value: selectedStaff.email },
                      { label: 'Phone Number', value: selectedStaff.phone },
                      { label: 'Salary Grade Scale', value: selectedStaff.salaryGrade },
                      { label: 'Regulatory Licensing Body', value: selectedStaff.licenseBody, highlight: true },
                      { label: 'Practising License No.', value: selectedStaff.licenseNumber, highlight: true },
                      { label: 'License Expiry & Status', value: `${selectedStaff.licenseExpiry} (${selectedStaff.licenseStatus.replace('_', ' ')})` },
                    ],
                    stampText: 'HR & REGISTRY VERIFIED',
                    signatures: [
                      { title: 'Director of Establishment & HR', subtitle: 'Human Resources Division' },
                      { title: 'Academic Registrar', subtitle: schoolProfile?.institutionName || 'Bethsaida College of Health Tech' },
                    ],
                  });
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Export Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: PRINT OFFICIAL PAYSLIP ─── */}
      <Modal
        isOpen={isPayslipModalOpen && Boolean(selectedPayslipStaff)}
        onClose={handleClosePayslip}
        title="Official Staff Monthly Salary Payslip"
        size="lg"
      >
        {selectedPayslipStaff && (
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
                  className="w-12 h-12 mx-auto mb-2 object-contain"
                />
                <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                  {schoolProfile?.institutionName || 'Bethsaida College of Health Technology'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Approved by Federal Ministry of Health • {schoolProfile?.campusAddress || 'Ogbomoso, Oyo State, Nigeria'}
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 rounded-[4px] text-xs font-bold text-[#0F7640] border border-emerald-200 uppercase">
                  OFFICIAL SALARY PAYSLIP • NOVEMBER 2026
                </div>
              </div>

              {/* Employee Bio Data */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Employee Details</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedPayslipStaff.fullName}</span>
                  <span className="text-slate-600 block">{selectedPayslipStaff.designation}</span>
                  <span className="text-slate-400 text-[11px] block">{selectedPayslipStaff.departmentName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pay Grade & Period</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedPayslipStaff.staffId}</span>
                  <span className="text-slate-700 block font-semibold">{selectedPayslipStaff.salaryGrade}</span>
                  <span className="text-emerald-700 font-bold text-[11px] block">Period: 01 Nov 2026 – 30 Nov 2026</span>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="grid grid-cols-2 gap-6 py-3 border-b border-slate-200">
                {/* Earnings */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 uppercase text-[11px] block">Gross Earnings</span>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-600">Basic Salary</span>
                      <span className="font-semibold text-slate-800 font-sans">{formatNaira(selectedPayslipStaff.basicSalaryKobo)}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-600">Clinical Hazard Allowance</span>
                      <span className="font-semibold text-slate-800 font-sans">{formatNaira(selectedPayslipStaff.hazardAllowanceKobo)}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-600">Teaching & Preceptor Allowance</span>
                      <span className="font-semibold text-slate-800 font-sans">{formatNaira(selectedPayslipStaff.teachingAllowanceKobo)}</span>
                    </div>
                    <div className="py-2 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 rounded-[4px] mt-1">
                      <span>Total Gross Salary</span>
                      <span className="font-sans">
                        {formatNaira(selectedPayslipStaff.basicSalaryKobo + selectedPayslipStaff.hazardAllowanceKobo + selectedPayslipStaff.teachingAllowanceKobo)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 uppercase text-[11px] block">Statutory Deductions</span>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-600">PAYE Tax (Oyo State IRS)</span>
                      <span className="font-semibold text-rose-600 font-sans">-{formatNaira(selectedPayslipStaff.payeTaxKobo)}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-600">Pension Scheme (PenCom 8%)</span>
                      <span className="font-semibold text-rose-600 font-sans">-{formatNaira(selectedPayslipStaff.pensionKobo)}</span>
                    </div>
                    <div className="py-2 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 rounded-[4px] mt-1">
                      <span>Total Deductions</span>
                      <span className="text-rose-600 font-sans">
                        -{formatNaira(selectedPayslipStaff.payeTaxKobo + selectedPayslipStaff.pensionKobo)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between mt-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 uppercase block">Net Salary Credited to Bank:</span>
                  <span className="text-[11px] text-emerald-600">Direct Electronic Bank Clearing</span>
                </div>
                <div className="text-2xl font-black text-[#0F7640] font-sans">
                  {formatNaira(
                    selectedPayslipStaff.basicSalaryKobo +
                    selectedPayslipStaff.hazardAllowanceKobo +
                    selectedPayslipStaff.teachingAllowanceKobo -
                    (selectedPayslipStaff.payeTaxKobo + selectedPayslipStaff.pensionKobo)
                  )}
                </div>
              </div>

              {/* Bursary Signature */}
              <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 items-end">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Electronic Payroll Audit</span>
                  <span className="font-semibold text-slate-700 text-xs">Certified by Bursary & Internal Audit</span>
                </div>
                <div className="text-right">
                  <div className="w-28 border-b border-slate-700 ml-auto my-1"></div>
                  <span className="font-bold text-slate-900 text-xs block">College Bursar</span>
                  <span className="text-[10px] text-slate-400">{schoolProfile?.institutionName || "College of Health Technology"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={handleClosePayslip}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (!selectedPayslipStaff) return;
                  const grossKobo =
                    selectedPayslipStaff.basicSalaryKobo +
                    selectedPayslipStaff.hazardAllowanceKobo +
                    selectedPayslipStaff.teachingAllowanceKobo;
                  const deductKobo =
                    selectedPayslipStaff.payeTaxKobo + selectedPayslipStaff.pensionKobo;
                  const netKobo = grossKobo - deductKobo;

                  printInstitutionalDocument({
                    title: `Salary Payslip — ${selectedPayslipStaff.fullName}`,
                    badgeText: 'OFFICIAL MONTHLY SALARY PAYSLIP • NOVEMBER 2026',
                    referenceNo: `BCHT/PAY/2026-11/${selectedPayslipStaff.staffId.replace(/\//g, '-')}`,
                    schoolProfile,
                    officeSubtitle: 'Bursary & Payroll Disbursement Directorate',
                    metaItems: [
                      { label: 'Employee Full Name', value: selectedPayslipStaff.fullName, highlight: true },
                      { label: 'Staff Identification', value: selectedPayslipStaff.staffId, highlight: true },
                      { label: 'Designation', value: selectedPayslipStaff.designation },
                      { label: 'Department', value: selectedPayslipStaff.departmentName },
                      { label: 'Salary Grade Structure', value: selectedPayslipStaff.salaryGrade },
                      { label: 'Pay Period', value: '01 Nov 2026 – 30 Nov 2026', highlight: true },
                    ],
                    tableColumns: [
                      { key: 'component', header: 'Salary / Statutory Component', bold: true },
                      { key: 'type', header: 'Classification', align: 'center' },
                      { key: 'amount', header: 'Amount (NGN)', align: 'right', highlight: true },
                    ],
                    tableData: [
                      {
                        component: 'Consolidated Basic Salary',
                        type: 'EARNING',
                        amount: formatNaira(selectedPayslipStaff.basicSalaryKobo),
                      },
                      {
                        component: 'Clinical & Health Hazard Allowance',
                        type: 'EARNING',
                        amount: formatNaira(selectedPayslipStaff.hazardAllowanceKobo),
                      },
                      {
                        component: 'Teaching & Clinical Preceptor Allowance',
                        type: 'EARNING',
                        amount: formatNaira(selectedPayslipStaff.teachingAllowanceKobo),
                      },
                      {
                        component: 'TOTAL GROSS EARNINGS',
                        type: 'SUBTOTAL',
                        amount: formatNaira(grossKobo),
                      },
                      {
                        component: 'PAYE Income Tax (Oyo State IRS)',
                        type: 'DEDUCTION',
                        amount: `-${formatNaira(selectedPayslipStaff.payeTaxKobo)}`,
                      },
                      {
                        component: 'Contributory Pension Scheme (PenCom 8%)',
                        type: 'DEDUCTION',
                        amount: `-${formatNaira(selectedPayslipStaff.pensionKobo)}`,
                      },
                      {
                        component: 'TOTAL STATUTORY DEDUCTIONS',
                        type: 'SUBTOTAL',
                        amount: `-${formatNaira(deductKobo)}`,
                      },
                    ],
                    bodyHtml: `
                      <div class="callout-green" style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                          <div style="font-size:11px; font-weight:800; text-transform:uppercase;">Net Salary Credited to Bank Account</div>
                          <div style="font-size:9.5px;">Direct Electronic Bank Clearing &bull; Certified by Internal Audit</div>
                        </div>
                        <div style="font-size:16px; font-weight:800; color:#0F7640;">
                          ${formatNaira(netKobo)}
                        </div>
                      </div>
                    `,
                    stampText: 'PAYROLL AUDITED & PAID',
                    signatures: [
                      { title: 'Chief Internal Auditor', subtitle: 'Audit & Compliance Unit' },
                      { title: 'College Bursar', subtitle: schoolProfile?.institutionName || 'Bethsaida College of Health Tech' },
                    ],
                  });
                }}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
              >
                Print Official Payslip
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 3: ADD NEW STAFF ─── */}
      <Modal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        title="Register New Faculty / Staff Member"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <PhotoUploadControl
            label="Staff Passport Photograph"
            name={newStaffName}
            value={newStaffAvatarUrl}
            onChange={(url) => setNewStaffAvatarUrl(url)}
          />
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Full Name:</label>
            <input
              type="text"
              placeholder="e.g. Dr. Kehinde Bello"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Academic Credentials:</label>
              <input
                type="text"
                placeholder="e.g. MBBS, MPH, FWACP"
                value={newStaffCredentials}
                onChange={(e) => setNewStaffCredentials(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Designation / Rank:</label>
              <Select
                value={newStaffDesignation || 'Lecturer II'}
                onChange={(val) => setNewStaffDesignation(val)}
                options={[
                  { value: 'Chief Lecturer', label: 'Chief Lecturer' },
                  { value: 'Principal Lecturer', label: 'Principal Lecturer' },
                  { value: 'Senior Lecturer', label: 'Senior Lecturer' },
                  { value: 'Lecturer I', label: 'Lecturer I' },
                  { value: 'Lecturer II', label: 'Lecturer II' },
                  { value: 'Assistant Lecturer', label: 'Assistant Lecturer' },
                  { value: 'Clinical Preceptor', label: 'Clinical Preceptor' },
                  { value: 'Chief Laboratory Technologist', label: 'Chief Laboratory Technologist' },
                  { value: 'Administrative Officer', label: 'Administrative Officer' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Department:</label>
              <Select
                value={newStaffDept}
                onChange={(val) => setNewStaffDept(val)}
                options={[
                  { value: 'CHE', label: 'Community Health' },
                  { value: 'MLT', label: 'Medical Laboratory' },
                  { value: 'PHT', label: 'Pharmacy Tech' },
                  { value: 'HIM', label: 'Health Information' },
                  { value: 'EHT', label: 'Environmental Health' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Employment Category:</label>
              <Select
                value={newStaffType}
                onChange={(val) => setNewStaffType(val as EmploymentType)}
                options={[
                  { value: 'FULL_TIME', label: 'Full-Time Faculty' },
                  { value: 'ADJUNCT_PRECEPTOR', label: 'Clinical Adjunct' },
                  { value: 'CONTRACT', label: 'Contract' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Official Email Address:</label>
              <input
                type="email"
                placeholder="name@bethsaida.edu.ng"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Contact Telephone:</label>
              <input
                type="text"
                placeholder="+234 ..."
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <StateLgaSelect
            stateValue={newStaffState}
            lgaValue={newStaffLga}
            onStateChange={setNewStaffState}
            onLgaChange={setNewStaffLga}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsAddStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff} className="bg-[#0F7640] hover:bg-[#093322]">
              Register Staff Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 4: REVIEW LEAVE APPLICATION ─── */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Review Staff Leave Application"
        size="md"
      >
        {selectedLeave && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedLeave.staffName}</span>
                <span className="font-semibold text-slate-600">{selectedLeave.staffId}</span>
              </div>
              <p className="text-slate-500 text-[11px]">{selectedLeave.departmentName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
              <div>
                <span className="text-slate-400 block text-[11px]">Leave Category</span>
                <span className="font-bold text-slate-900">{selectedLeave.leaveType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Duration</span>
                <span className="font-bold text-slate-900">{selectedLeave.durationDays} Working Days</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Period</span>
                <span className="font-semibold text-slate-800">{selectedLeave.startDate} to {selectedLeave.endDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Relief Officer</span>
                <span className="font-semibold text-slate-800">{selectedLeave.reliefOfficer}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">Documented Reason / Purpose:</span>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-slate-700 leading-relaxed">
                {selectedLeave.reason}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setIsLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setLeaves((prev) =>
                    prev.map((l) => (l.id === selectedLeave.id ? { ...l, status: 'REJECTED' } : l))
                  );
                  showToast({ type: 'danger', title: 'Leave Application Rejected', message: 'The request has been declined.' });
                  setIsLeaveModalOpen(false);
                }}
              >
                Reject Request
              </Button>
              <Button
                onClick={() => handleApproveLeave(selectedLeave)}
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Approve Leave
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL: EDIT STAFF MEMBER ─── */}
      <Modal
        isOpen={isEditStaffOpen && !!editingStaff}
        onClose={() => {
          setIsEditStaffOpen(false);
          setEditingStaff(null);
        }}
        title={`Edit Staff Profile: ${editingStaff?.fullName || ''}`}
        description="Update staff rank, department, contact credentials, or licensing status."
        size="lg"
      >
        {editingStaff && (
          <form onSubmit={handleUpdateStaff} className="space-y-4 text-xs font-sans">
            <PhotoUploadControl
              label="Staff Passport Photograph"
              name={editingStaff.fullName}
              value={
                resolveAvatarUrl({
                  avatarUrl: editingStaff.avatarUrl,
                  email: editingStaff.email,
                  staffId: editingStaff.staffId,
                  name: editingStaff.fullName,
                }) || ''
              }
              onChange={(url) => setEditingStaff({ ...editingStaff, avatarUrl: url })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={editingStaff.fullName}
                onChange={(e) => setEditingStaff({ ...editingStaff, fullName: e.target.value })}
                required
              />
              <Input
                label="Academic / Professional Credentials"
                value={editingStaff.credentials}
                onChange={(e) => setEditingStaff({ ...editingStaff, credentials: e.target.value })}
                placeholder="e.g. MBBS, MPH, FWACP"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Designation / Academic Rank"
                value={editingStaff.designation}
                onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                required
              />
              <Select
                label="Department"
                options={(departments || []).map((d) => ({ value: d.code, label: d.name }))}
                value={editingStaff.departmentCode}
                onChange={(val) => {
                  const deptObj = (departments || []).find((d) => d.code === val);
                  setEditingStaff({
                    ...editingStaff,
                    departmentCode: val,
                    departmentName: deptObj ? deptObj.name : editingStaff.departmentName,
                  });
                }}
              />
              <Select
                label="Employment Category"
                options={[
                  { value: 'FULL_TIME', label: 'Full-Time Faculty' },
                  { value: 'ADJUNCT_PRECEPTOR', label: 'Clinical Adjunct' },
                  { value: 'CONTRACT', label: 'Contract' },
                  { value: 'ADMINISTRATIVE', label: 'Administrative' },
                ]}
                value={editingStaff.employmentType}
                onChange={(val) => setEditingStaff({ ...editingStaff, employmentType: val as any })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Official College Email"
                type="email"
                value={editingStaff.email}
                onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={editingStaff.phone}
                onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                required
              />
            </div>

            <StateLgaSelect
              stateValue={editingStaff.stateOfOrigin || 'Oyo'}
              lgaValue={editingStaff.lga || 'Ibadan North'}
              onStateChange={(state) => setEditingStaff({ ...editingStaff, stateOfOrigin: state })}
              onLgaChange={(lga) => setEditingStaff({ ...editingStaff, lga })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Regulatory License No"
                value={editingStaff.licenseNumber}
                onChange={(e) => setEditingStaff({ ...editingStaff, licenseNumber: e.target.value })}
              />
              <DatePicker
                label="License Expiry Date"
                value={editingStaff.licenseExpiry}
                onChange={(val) => setEditingStaff({ ...editingStaff, licenseExpiry: val })}
              />
              <Select
                label="Licensing Verification"
                options={[
                  { value: 'VERIFIED_CURRENT', label: 'Verified Current' },
                  { value: 'RENEWAL_DUE', label: 'Renewal Due' },
                  { value: 'EXPIRED', label: 'Expired' },
                ]}
                value={editingStaff.licenseStatus}
                onChange={(val) => setEditingStaff({ ...editingStaff, licenseStatus: val as any })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Salary Grade"
                value={editingStaff.salaryGrade}
                onChange={(e) => setEditingStaff({ ...editingStaff, salaryGrade: e.target.value })}
              />
              <Input
                label="Monthly Basic Salary (₦)"
                type="number"
                value={String(Math.round(editingStaff.basicSalaryKobo / 100))}
                onChange={(e) =>
                  setEditingStaff({
                    ...editingStaff,
                    basicSalaryKobo: (Number(e.target.value) || 0) * 100,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditStaffOpen(false);
                  setEditingStaff(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─── MODAL: DELETE STAFF CONFIRMATION ─── */}
      <Modal
        isOpen={isDeleteStaffOpen && !!deleteStaffTarget}
        onClose={() => {
          setIsDeleteStaffOpen(false);
          setDeleteStaffTarget(null);
        }}
        title="Remove Staff Member"
        description="Are you sure you want to remove this staff member from the college registry?"
        size="sm"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-600">
            Removing <span className="font-bold text-slate-900">{deleteStaffTarget?.fullName}</span> (
            <span className="font-semibold text-slate-800">{deleteStaffTarget?.staffId}</span>) will revoke their directory listing and active payroll schedule.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteStaffOpen(false);
                setDeleteStaffTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteStaff}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
