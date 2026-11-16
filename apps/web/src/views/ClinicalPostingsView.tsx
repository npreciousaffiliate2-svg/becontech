import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { useSharedRecords } from '../lib/sharedRecords.ts';
import { PERSONA_PROFILES } from '../context/personas.ts';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
  Input,
  Select,
  DatePicker,
  Modal,
} from '@campusone/ui';
import {
  Stethoscope,
  Building2,
  FileCheck,
  CheckCircle2,
  Printer,
  Download,
  Search,
  Filter,
  Plus,
  Clock,
  ShieldCheck,
  Award,
  AlertTriangle,
  UserCheck,
  MapPin,
  Phone,
  FileText,
  Check,
  X,
} from 'lucide-react';

/* ─── TYPES ─── */
type FacilityType = 'TEACHING_HOSPITAL' | 'STATE_GENERAL_HOSPITAL' | 'PRIMARY_HEALTH_CENTRE' | 'SPECIALIST_LAB';
type AllocationStatus = 'ACTIVE' | 'COMPLETED' | 'PENDING_FEE';
type LogbookStatus = 'COMPLETED' | 'IN_PROGRESS' | 'DEFICIENT';
type FinalClearanceStatus = 'CERTIFIED' | 'PROVISIONAL' | 'INCOMPLETE';

interface PostingSite {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  capacity: number;
  allocatedCount: number;
  supervisorName: string;
  supervisorRole: string;
  contactPhone: string;
  accreditedBoards: string[];
}

interface AllocationRecord {
  id: string;
  studentName: string;
  matricNumber: string;
  departmentCode: string;
  departmentName: string;
  level: string;
  siteId: string;
  siteName: string;
  clinicalUnit: string;
  rotationPeriod: string;
  status: AllocationStatus;
  feeSettled: boolean;
  logbookStatus: LogbookStatus;
  proceduresCompleted: number;
  totalProceduresRequired: number;
  supervisorScore?: number;
  clearanceGenerated: boolean;
  clearanceDate?: string;
  preceptorRemarks?: string;
}

export const ClinicalPostingsView: React.FC = () => {
  const { recordAudit, isDense, session, schoolProfile, departments } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tab: routeTab } = useParams<{ tab: string }>();

  const currentPersona = PERSONA_PROFILES[session?.activeRole || 'PROVOST'] || PERSONA_PROFILES.STU;
  const isStudent = session?.activeRole === 'STU' || session?.activeRole === 'SPON';
  const studentMatric = currentPersona.matricNumber || 'CHE/2026/0014';

  // Tab state synced with URL path and search params
  const resolveTab = (tabStr?: string | null): 'allocations' | 'sites' | 'logbooks' | 'clearance' => {
    if (!tabStr) return 'allocations';
    if (['allocations', 'sites', 'logbooks', 'clearance'].includes(tabStr)) {
      return tabStr as 'allocations' | 'sites' | 'logbooks' | 'clearance';
    }
    return 'allocations';
  };

  const [activeTab, setActiveTab] = useState<'allocations' | 'sites' | 'logbooks' | 'clearance'>(
    resolveTab(routeTab || searchParams.get('tab'))
  );

  useEffect(() => {
    const nextTab = resolveTab(routeTab || searchParams.get('tab'));
    setActiveTab(nextTab);
  }, [routeTab, searchParams]);

  const handleTabChange = (id: 'allocations' | 'sites' | 'logbooks' | 'clearance') => {
    setActiveTab(id);
    navigate(`/postings/${id}`);
  };

  /* ─── FILTERS STATE ─── */
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  /* ─── MODAL STATES ─── */
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedLetterRecord, setSelectedLetterRecord] = useState<AllocationRecord | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCertRecord, setSelectedCertRecord] = useState<AllocationRecord | null>(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedGradingRecord, setSelectedGradingRecord] = useState<AllocationRecord | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(85);
  const [remarksInput, setRemarksInput] = useState<string>('Candidate demonstrated exceptional diagnostic accuracy and patient bed manners.');
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  // Edit & Delete Site States
  const [editingSite, setEditingSite] = useState<PostingSite | null>(null);
  const [isEditSiteOpen, setIsEditSiteOpen] = useState(false);
  const [deletingSite, setDeletingSite] = useState<PostingSite | null>(null);
  const [isDeleteSiteOpen, setIsDeleteSiteOpen] = useState(false);

  // New Placement Allocation Modal
  const [isAddAllocationOpen, setIsAddAllocationOpen] = useState(false);
  const [newAllocMatric, setNewAllocMatric] = useState('CHE/2026/0014');
  const [newAllocStudentName, setNewAllocStudentName] = useState('Blessing Adeyemi');
  const [newAllocDept, setNewAllocDept] = useState('Community Health');
  const [newAllocSiteId, setNewAllocSiteId] = useState('site-01');
  const [newAllocUnit, setNewAllocUnit] = useState('Community Ward & Outpatient Clinic');
  const [newAllocStart, setNewAllocStart] = useState('2026-11-20');
  const [newAllocEnd, setNewAllocEnd] = useState('2027-01-20');

  /* ─── NEW SITE FORM STATE ─── */
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteType, setNewSiteType] = useState<FacilityType>('STATE_GENERAL_HOSPITAL');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [newSiteCapacity, setNewSiteCapacity] = useState('30');
  const [newSiteSupervisor, setNewSiteSupervisor] = useState('');
  const [newSitePhone, setNewSitePhone] = useState('');

  /* ─── DATA: TRAINING HOSPITALS ─── */
  const [sites, setSites] = useSharedRecords<PostingSite>('clinical.sites', [
    {
      id: 'site-01',
      name: 'University College Hospital (UCH) Ibadan',
      type: 'TEACHING_HOSPITAL',
      location: 'Queen Elizabeth Rd, Ibadan',
      capacity: 50,
      allocatedCount: 46,
      supervisorName: 'Dr. (Mrs) Olukoya, FWACP',
      supervisorRole: 'Director of Clinical Training & Senior Consultant',
      contactPhone: '+234 802 334 1920',
      accreditedBoards: ['MLSCN', 'PCN', 'CHPRBN'],
    },
    {
      id: 'site-02',
      name: 'Adeoyo State Hospital, Yemetu',
      type: 'STATE_GENERAL_HOSPITAL',
      location: 'Yemetu, Ibadan, Oyo State',
      capacity: 40,
      allocatedCount: 38,
      supervisorName: 'Matron A. Adediran',
      supervisorRole: 'Chief Nursing Officer & Clinical Preceptor',
      contactPhone: '+234 803 451 9081',
      accreditedBoards: ['CHPRBN', 'HRORBN'],
    },
    {
      id: 'site-03',
      name: 'State Specialist Hospital, Moniya',
      type: 'STATE_GENERAL_HOSPITAL',
      location: 'Moniya Express, Akinyele, Ibadan',
      capacity: 35,
      allocatedCount: 32,
      supervisorName: 'Dr. B. Adekunle, MBBS',
      supervisorRole: 'Chief Medical Superintendent',
      contactPhone: '+234 805 119 4432',
      accreditedBoards: ['CHPRBN', 'MLSCN', 'PCN'],
    },
    {
      id: 'site-04',
      name: 'Ona-Ara Primary Health Care Centre',
      type: 'PRIMARY_HEALTH_CENTRE',
      location: 'Akanran, Oyo State',
      capacity: 30,
      allocatedCount: 26,
      supervisorName: 'Chief CHO S. Oladipo',
      supervisorRole: 'District Community Health Officer',
      contactPhone: '+234 807 551 2290',
      accreditedBoards: ['CHPRBN', 'EHORECON'],
    },
    {
      id: 'site-05',
      name: 'Oni Memorial Children Hospital',
      type: 'SPECIALIST_LAB',
      location: 'Ring Road, Ibadan',
      capacity: 25,
      allocatedCount: 22,
      supervisorName: 'Dr. (Mrs) T. Falade',
      supervisorRole: 'Consultant Pediatrician',
      contactPhone: '+234 809 332 7611',
      accreditedBoards: ['CHPRBN', 'PCN'],
    },
    {
      id: 'site-06',
      name: 'Jericho Specialist Hospital',
      type: 'STATE_GENERAL_HOSPITAL',
      location: 'Jericho GRA, Ibadan',
      capacity: 25,
      allocatedCount: 24,
      supervisorName: 'Pharm. K. Alabi',
      supervisorRole: 'Head of Pharmacy & Quality Assurance',
      contactPhone: '+234 802 998 1234',
      accreditedBoards: ['PCN', 'HRORBN'],
    },
  ]);

  /* ─── DATA: ALLOCATION ROSTER ─── */
  const [allocations, setAllocations] = useSharedRecords<AllocationRecord>('clinical.allocations', [
    {
      id: 'alc-01',
      studentName: 'Blessing Adeyemi',
      matricNumber: 'CHE/2026/0014',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      siteId: 'site-04',
      siteName: 'Ona-Ara Primary Health Care Centre',
      clinicalUnit: 'Maternal & Child Health / Immunization Clinic',
      rotationPeriod: '03 Nov 2026 – 24 Dec 2026 (8 Weeks)',
      status: 'COMPLETED',
      feeSettled: true,
      logbookStatus: 'COMPLETED',
      proceduresCompleted: 120,
      totalProceduresRequired: 120,
      supervisorScore: 88,
      clearanceGenerated: true,
      clearanceDate: '2026-11-12',
      preceptorRemarks: 'Exemplary clinical competence in pediatric triage and rural family planning delivery.',
    },
    {
      id: 'alc-02',
      studentName: 'Emmanuel Chukwuma',
      matricNumber: 'MLT/2026/0029',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Technology',
      level: '200L',
      siteId: 'site-01',
      siteName: 'University College Hospital (UCH) Ibadan',
      clinicalUnit: 'Clinical Hematology & Blood Transfusion Services',
      rotationPeriod: '03 Nov 2026 – 24 Dec 2026 (8 Weeks)',
      status: 'ACTIVE',
      feeSettled: true,
      logbookStatus: 'IN_PROGRESS',
      proceduresCompleted: 98,
      totalProceduresRequired: 120,
      supervisorScore: 82,
      clearanceGenerated: false,
      preceptorRemarks: 'High proficiency in blood film staining and cross-matching protocols.',
    },
    {
      id: 'alc-03',
      studentName: 'Khadijat Sani',
      matricNumber: 'PHT/2026/0009',
      departmentCode: 'PHT',
      departmentName: 'Pharmacy Technician',
      level: '200L',
      siteId: 'site-06',
      siteName: 'Jericho Specialist Hospital',
      clinicalUnit: 'Inpatient Drug Dispensing & Inventory Logistics',
      rotationPeriod: '03 Nov 2026 – 24 Dec 2026 (8 Weeks)',
      status: 'PENDING_FEE',
      feeSettled: false,
      logbookStatus: 'IN_PROGRESS',
      proceduresCompleted: 74,
      totalProceduresRequired: 100,
      supervisorScore: undefined,
      clearanceGenerated: false,
      preceptorRemarks: 'Posting fee overdue on bursary master ledger.',
    },
    {
      id: 'alc-04',
      studentName: 'David Adeleke',
      matricNumber: 'MLT/2026/0014',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Technology',
      level: '200L',
      siteId: 'site-03',
      siteName: 'State Specialist Hospital, Moniya',
      clinicalUnit: 'Medical Microbiology & Parasitology Wing',
      rotationPeriod: '03 Nov 2026 – 24 Dec 2026 (8 Weeks)',
      status: 'COMPLETED',
      feeSettled: true,
      logbookStatus: 'COMPLETED',
      proceduresCompleted: 110,
      totalProceduresRequired: 110,
      supervisorScore: 91,
      clearanceGenerated: true,
      clearanceDate: '2026-11-10',
      preceptorRemarks: 'Accurate stool microscopy and aseptic antimicrobial susceptibility testing.',
    },
    {
      id: 'alc-05',
      studentName: 'Fatima Ibrahim',
      matricNumber: 'CHE/2026/0016',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      siteId: 'site-02',
      siteName: 'Adeoyo State Hospital, Yemetu',
      clinicalUnit: 'General Outpatient Department (GOPD)',
      rotationPeriod: '03 Nov 2026 – 24 Dec 2026 (8 Weeks)',
      status: 'COMPLETED',
      feeSettled: true,
      logbookStatus: 'COMPLETED',
      proceduresCompleted: 120,
      totalProceduresRequired: 120,
      supervisorScore: 86,
      clearanceGenerated: true,
      clearanceDate: '2026-11-11',
      preceptorRemarks: 'Reliable history taking and vital signs monitoring under high patient loads.',
    },
    {
      id: 'alc-06',
      studentName: 'Rukayat Sanusi',
      matricNumber: 'HIM/2026/0005',
      departmentCode: 'HIM',
      departmentName: 'Health Information Management',
      level: '200L',
      siteId: 'site-02',
      siteName: 'Adeoyo State Hospital, Yemetu',
      clinicalUnit: 'Health Records & ICD-11 Diagnostic Coding',
      rotationPeriod: '03 Nov 2026 – 24 Dec 2026 (8 Weeks)',
      status: 'ACTIVE',
      feeSettled: true,
      logbookStatus: 'IN_PROGRESS',
      proceduresCompleted: 88,
      totalProceduresRequired: 100,
      supervisorScore: undefined,
      clearanceGenerated: false,
      preceptorRemarks: 'Diligently digitizing master patient indexes into the hospital EMR system.',
    },
    {
      id: 'alc-07',
      studentName: 'Solomon Giwa',
      matricNumber: 'EHT/2026/0012',
      departmentCode: 'EHT',
      departmentName: 'Environmental Health Sciences',
      level: '200L',
      siteId: 'site-04',
      siteName: 'Ona-Ara Primary Health Care Centre',
      clinicalUnit: 'Public Health Sanitation & Water Quality Monitoring',
      rotationPeriod: '03 Nov 2026 – 24 Dec 2026 (8 Weeks)',
      status: 'ACTIVE',
      feeSettled: true,
      logbookStatus: 'DEFICIENT',
      proceduresCompleted: 45,
      totalProceduresRequired: 100,
      supervisorScore: 52,
      clearanceGenerated: false,
      preceptorRemarks: 'Logbook signatures incomplete. Additional field inspections required.',
    },
  ]);

  /* ─── DERIVED FILTERED ALLOCATIONS (Scoped by Student Role) ─── */
  const filteredAllocations = allocations.filter((a) => {
    if (isStudent && a.matricNumber !== studentMatric) return false;
    if (selectedHospitalFilter !== 'ALL' && a.siteId !== selectedHospitalFilter) return false;
    if (selectedDeptFilter !== 'ALL' && a.departmentCode !== selectedDeptFilter) return false;
    if (selectedStatusFilter !== 'ALL' && a.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.studentName.toLowerCase().includes(q);
      const matchMatric = a.matricNumber.toLowerCase().includes(q);
      const matchSite = a.siteName.toLowerCase().includes(q);
      if (!matchName && !matchMatric && !matchSite) return false;
    }
    return true;
  });

  /* ─── STATS COMPUTATION ─── */
  const totalAllocated = isStudent ? 1 : allocations.length;
  const completedCount = isStudent ? 1 : allocations.filter((a) => a.status === 'COMPLETED').length;
  const logbooksCompleted = isStudent ? 1 : allocations.filter((a) => a.logbookStatus === 'COMPLETED').length;
  const certifiedCount = isStudent ? 1 : allocations.filter((a) => a.clearanceGenerated).length;
  const logbookPct = isStudent ? 100 : Math.round((logbooksCompleted / totalAllocated) * 100);

  /* ─── ACTIONS ─── */
  const handleOpenPostingLetter = (record: AllocationRecord) => {
    setSelectedLetterRecord(record);
    setIsLetterModalOpen(true);
  };

  const handleOpenClearanceCert = (record: AllocationRecord) => {
    setSelectedCertRecord(record);
    setIsCertModalOpen(true);
  };

  const handleOpenGradingModal = (record: AllocationRecord) => {
    setSelectedGradingRecord(record);
    setGradeInput(record.supervisorScore || 85);
    setRemarksInput(record.preceptorRemarks || '');
    setIsGradingModalOpen(true);
  };

  const handleSaveGrade = () => {
    if (!selectedGradingRecord) return;
    setAllocations((prev) =>
      prev.map((a) =>
        a.id === selectedGradingRecord.id
          ? {
              ...a,
              supervisorScore: gradeInput,
              preceptorRemarks: remarksInput,
              logbookStatus: gradeInput >= 50 ? 'COMPLETED' : 'DEFICIENT',
            }
          : a
      )
    );
    recordAudit(
      'CLINICAL_LOGBOOK_GRADED',
      'CLINICAL_ROTATION',
      selectedGradingRecord.matricNumber
    );
    showToast({
      type: 'success',
      title: 'Logbook Assessment Saved',
      message: `Score of ${gradeInput}% recorded for ${selectedGradingRecord.studentName}.`,
    });
    setIsGradingModalOpen(false);
  };

  const handleIssueClearance = (recordId: string) => {
    const record = allocations.find((a) => a.id === recordId);
    if (!record) return;

    if (!record.feeSettled) {
      showToast({
        type: 'danger',
        title: 'Clearance Blocked',
        message: 'Posting fee must be cleared on the bursary ledger first.',
      });
      return;
    }

    if (record.logbookStatus !== 'COMPLETED' || record.supervisorScore === undefined || record.supervisorScore < 50) {
      showToast({
        type: 'warning',
        title: 'Prerequisites Incomplete',
        message: 'Supervisor logbook assessment (>=50%) must be completed first.',
      });
      return;
    }

    setAllocations((prev) =>
      prev.map((a) =>
        a.id === recordId
          ? {
              ...a,
              clearanceGenerated: true,
              status: 'COMPLETED',
              clearanceDate: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );

    recordAudit('CLINICAL_CLEARANCE_ISSUED', 'CLINICAL_ROTATION', record.matricNumber);
    showToast({
      type: 'success',
      title: 'Clearance Certificate Issued',
      message: `Clinical training clearance generated for ${record.studentName}.`,
    });
  };

  const handleAddSite = () => {
    if (!newSiteName.trim() || !newSiteSupervisor.trim()) {
      showToast({
        type: 'warning',
        title: 'Validation Error',
        message: 'Hospital name and preceptor supervisor are required.',
      });
      return;
    }

    const newSite: PostingSite = {
      id: `site-0${sites.length + 1}`,
      name: newSiteName.trim(),
      type: newSiteType,
      location: newSiteLocation.trim() || 'Oyo State, Nigeria',
      capacity: parseInt(newSiteCapacity) || 30,
      allocatedCount: 0,
      supervisorName: newSiteSupervisor.trim(),
      supervisorRole: 'Chief Clinical Preceptor',
      contactPhone: newSitePhone.trim() || '+234 800 000 0000',
      accreditedBoards: ['CHPRBN', 'MLSCN'],
    };

    setSites((prev) => [...prev, newSite]);
    recordAudit('TRAINING_HOSPITAL_ADDED', 'CLINICAL_FACILITY', newSite.name);
    showToast({
      type: 'success',
      title: 'Hospital Facility Added',
      message: `${newSite.name} added to accredited clinical sites registry.`,
    });
    setIsAddSiteModalOpen(false);
    setNewSiteName('');
    setNewSiteSupervisor('');
    setNewSiteLocation('');
  };

  const handleSaveEditSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    setSites((prev) =>
      prev.map((s) => (s.id === editingSite.id ? editingSite : s))
    );

    recordAudit('HOSPITAL_FACILITY_UPDATED', 'CLINICAL_FACILITY', editingSite.name, {
      capacity: editingSite.capacity,
      supervisor: editingSite.supervisorName,
    });

    setIsEditSiteOpen(false);
    setEditingSite(null);
    showToast({
      type: 'success',
      title: 'Facility Saved',
      message: `${editingSite.name} details have been updated.`,
    });
  };

  const handleConfirmDeleteSite = () => {
    if (!deletingSite) return;

    setSites((prev) => prev.filter((s) => s.id !== deletingSite.id));

    recordAudit('HOSPITAL_FACILITY_DELETED', 'CLINICAL_FACILITY', deletingSite.name);

    setIsDeleteSiteOpen(false);
    setDeletingSite(null);
    showToast({
      type: 'success',
      title: 'Facility Removed',
      message: `${deletingSite.name} removed from partner hospital registry.`,
    });
  };

  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAllocStart && newAllocEnd && newAllocEnd < newAllocStart) {
      showToast({
        type: 'danger',
        title: 'Invalid Posting Dates',
        message: 'The posting end date must be on or after the start date.',
      });
      return;
    }
    const siteObj = sites.find((s) => s.id === newAllocSiteId) || sites[0];
    if (!siteObj) {
      showToast({
        type: 'danger',
        title: 'No Hospital Selected',
        message: 'Add a training hospital before allocating a trainee.',
      });
      return;
    }
    const matchedDept = (departments || []).find((d) => d.name === newAllocDept);

    const newAlloc: AllocationRecord = {
      id: `alloc-${Date.now()}`,
      studentName: newAllocStudentName,
      matricNumber: newAllocMatric,
      departmentCode: matchedDept?.code || 'GEN',
      departmentName: newAllocDept,
      level: '200L',
      siteId: siteObj.id,
      siteName: siteObj.name,
      clinicalUnit: newAllocUnit,
      rotationPeriod: `${newAllocStart} – ${newAllocEnd}`,
      status: 'ACTIVE',
      feeSettled: false,
      logbookStatus: 'IN_PROGRESS',
      proceduresCompleted: 0,
      totalProceduresRequired: 40,
      clearanceGenerated: false,
    };

    setAllocations((prev) => [newAlloc, ...prev]);
    recordAudit('CLINICAL_PLACEMENT_ALLOCATED', 'CLINICAL_ROTATION', newAlloc.matricNumber, {
      hospital: siteObj.name,
      unit: newAlloc.clinicalUnit,
    });

    setIsAddAllocationOpen(false);
    showToast({
      type: 'success',
      title: 'Trainee Placement Allocated',
      message: `${newAlloc.studentName} assigned to ${siteObj.name} (${newAlloc.clinicalUnit}).`,
    });
  };

  /* ─── TABLE 1: ALLOCATION COLUMNS ─── */
  const allocationColumns = [
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      nowrap: true,
      render: (a: AllocationRecord) => (
        <span className="font-semibold text-slate-900">{a.matricNumber}</span>
      ),
    },
    {
      key: 'studentName',
      header: 'Trainee Name',
      render: (a: AllocationRecord) => (
        <div>
          <span className="font-semibold text-slate-800 block">{a.studentName}</span>
          <span className="text-[11px] text-slate-400">{a.departmentName} • {a.level}</span>
        </div>
      ),
    },
    {
      key: 'siteName',
      header: 'Clinical Site & Ward',
      render: (a: AllocationRecord) => (
        <div>
          <span className="font-semibold text-slate-800 block">{a.siteName}</span>
          <span className="text-[11px] text-[#0F7640] font-medium block truncate max-w-xs">
            {a.clinicalUnit}
          </span>
        </div>
      ),
    },
    {
      key: 'rotationPeriod',
      header: 'Rotation Duration',
      nowrap: true,
      render: (a: AllocationRecord) => (
        <span className="text-xs text-slate-700">{a.rotationPeriod}</span>
      ),
    },
    {
      key: 'feeSettled',
      header: 'Posting Fee',
      nowrap: true,
      render: (a: AllocationRecord) => (
        <Badge variant={a.feeSettled ? 'success' : 'danger'} size="sm">
          {a.feeSettled ? 'Settled' : 'Unpaid'}
        </Badge>
      ),
    },
    {
      key: 'logbookStatus',
      header: 'Logbook Audit',
      nowrap: true,
      render: (a: AllocationRecord) => {
        const badgeMap = {
          COMPLETED: { variant: 'success' as const, label: '100% Verified' },
          IN_PROGRESS: { variant: 'warning' as const, label: `${a.proceduresCompleted}/${a.totalProceduresRequired} Signed` },
          DEFICIENT: { variant: 'danger' as const, label: 'Incomplete' },
        };
        return (
          <Badge variant={badgeMap[a.logbookStatus].variant} size="sm">
            {badgeMap[a.logbookStatus].label}
          </Badge>
        );
      },
    },
    {
      key: 'action',
      header: 'Letter & Details',
      align: 'right' as const,
      nowrap: true,
      render: (a: AllocationRecord) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenPostingLetter(a)}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            className="whitespace-nowrap"
          >
            Posting Letter
          </Button>
          {a.clearanceGenerated && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenClearanceCert(a)}
              leftIcon={<Award className="w-3.5 h-3.5" />}
              className="whitespace-nowrap text-[#0F7640] border-emerald-200"
            >
              Certificate
            </Button>
          )}
        </div>
      ),
    },
  ];

  /* ─── TABLE 2: SITES COLUMNS ─── */
  const siteColumns = [
    {
      key: 'name',
      header: 'Accredited Hospital Facility',
      render: (s: PostingSite) => (
        <div>
          <span className="font-bold text-slate-900 block">{s.name}</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            {s.location}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Facility Category',
      nowrap: true,
      render: (s: PostingSite) => {
        const labels: Record<FacilityType, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
          TEACHING_HOSPITAL: { label: 'Teaching Hospital', variant: 'primary' },
          STATE_GENERAL_HOSPITAL: { label: 'State General Hospital', variant: 'success' },
          PRIMARY_HEALTH_CENTRE: { label: 'Primary Health Center', variant: 'warning' },
          SPECIALIST_LAB: { label: 'Specialist Clinic', variant: 'neutral' },
        };
        return (
          <Badge variant={labels[s.type].variant} size="sm">
            {labels[s.type].label}
          </Badge>
        );
      },
    },
    {
      key: 'supervisor',
      header: 'Chief Preceptor Supervisor',
      render: (s: PostingSite) => (
        <div>
          <span className="font-semibold text-slate-800 block">{s.supervisorName}</span>
          <span className="text-[11px] text-slate-400 block">{s.supervisorRole}</span>
          <span className="text-[11px] text-slate-500 font-medium block">{s.contactPhone}</span>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Trainees Hosted / Quota',
      nowrap: true,
      render: (s: PostingSite) => {
        const pct = Math.round((s.allocatedCount / s.capacity) * 100);
        return (
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span>{s.allocatedCount} of {s.capacity}</span>
              <span className="text-xs text-slate-500 font-normal">({pct}%)</span>
            </div>
            <div className="w-24 bg-slate-200 h-1.5 rounded-[4px] overflow-hidden mt-1">
              <div
                className={`h-full ${pct >= 90 ? 'bg-[#0F7640]' : 'bg-[#13A348]'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'boards',
      header: 'Regulatory Accreditation',
      render: (s: PostingSite) => (
        <div className="flex flex-wrap gap-1">
          {s.accreditedBoards.map((b) => (
            <span
              key={b}
              className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200"
            >
              {b}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      nowrap: true,
      render: (s: PostingSite) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingSite({ ...s });
              setIsEditSiteOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setDeletingSite(s);
              setIsDeleteSiteOpen(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  /* ─── TABLE 3: LOGBOOK GRADING COLUMNS ─── */
  const logbookColumns = [
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      nowrap: true,
      render: (a: AllocationRecord) => (
        <span className="font-semibold text-slate-900">{a.matricNumber}</span>
      ),
    },
    {
      key: 'studentName',
      header: 'Trainee & Site',
      render: (a: AllocationRecord) => (
        <div>
          <span className="font-semibold text-slate-800 block">{a.studentName}</span>
          <span className="text-[11px] text-slate-400">{a.siteName}</span>
        </div>
      ),
    },
    {
      key: 'procedures',
      header: 'Clinical Procedures Signed',
      nowrap: true,
      render: (a: AllocationRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {a.proceduresCompleted} / {a.totalProceduresRequired} Signed
          </span>
          <span className="text-[11px] text-slate-500">
            {Math.round((a.proceduresCompleted / a.totalProceduresRequired) * 100)}% Complete
          </span>
        </div>
      ),
    },
    {
      key: 'supervisorScore',
      header: 'Preceptor Score',
      nowrap: true,
      render: (a: AllocationRecord) => (
        a.supervisorScore !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900">{a.supervisorScore}%</span>
            <Badge variant={a.supervisorScore >= 75 ? 'success' : a.supervisorScore >= 50 ? 'warning' : 'danger'} size="sm">
              {a.supervisorScore >= 75 ? 'Distinction' : a.supervisorScore >= 50 ? 'Credit' : 'Fail'}
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-[4px] border border-amber-200">
            Awaiting Score
          </span>
        )
      ),
    },
    {
      key: 'remarks',
      header: 'Preceptor Clinical Assessment',
      render: (a: AllocationRecord) => (
        <p className="text-xs text-slate-700 max-w-sm truncate" title={a.preceptorRemarks}>
          {a.preceptorRemarks || 'Assessment pending supervisor sign-off.'}
        </p>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      nowrap: true,
      render: (a: AllocationRecord) =>
        isStudent ? (
          <Badge variant="success">Verified by Preceptor</Badge>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenGradingModal(a)}
            className="whitespace-nowrap"
          >
            Grade Logbook
          </Button>
        ),
    },
  ];

  /* ─── TABLE 4: FINAL CLEARANCES COLUMNS ─── */
  const clearanceColumns = [
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      nowrap: true,
      render: (a: AllocationRecord) => (
        <span className="font-semibold text-slate-900">{a.matricNumber}</span>
      ),
    },
    {
      key: 'studentName',
      header: 'Trainee Name',
      render: (a: AllocationRecord) => (
        <div>
          <span className="font-semibold text-slate-800 block">{a.studentName}</span>
          <span className="text-[11px] text-slate-400">{a.departmentName}</span>
        </div>
      ),
    },
    {
      key: 'siteName',
      header: 'Hospital Rotated',
      render: (a: AllocationRecord) => (
        <span className="font-medium text-slate-800">{a.siteName}</span>
      ),
    },
    {
      key: 'score',
      header: 'Assessed Score',
      nowrap: true,
      render: (a: AllocationRecord) => (
        a.supervisorScore !== undefined ? (
          <span className="font-bold text-slate-900">{a.supervisorScore}%</span>
        ) : (
          <span className="text-slate-400">Pending</span>
        )
      ),
    },
    {
      key: 'feeCheck',
      header: 'Posting Fee',
      nowrap: true,
      render: (a: AllocationRecord) => (
        <span className={`text-xs px-2 py-0.5 rounded-[4px] border font-bold ${a.feeSettled ? 'bg-emerald-50 text-[#13A348] border-emerald-200' : 'bg-rose-50 text-[#F83A20] border-rose-200'}`}>
          {a.feeSettled ? 'PAID' : 'UNPAID'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Clearance Status',
      nowrap: true,
      render: (a: AllocationRecord) => (
        <Badge variant={a.clearanceGenerated ? 'success' : 'warning'}>
          {a.clearanceGenerated ? 'Certified Cleared' : 'Pending Sign-off'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Official Certificate',
      align: 'right' as const,
      nowrap: true,
      render: (a: AllocationRecord) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          {a.clearanceGenerated ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenClearanceCert(a)}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="whitespace-nowrap"
            >
              Print Certificate
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleIssueClearance(a.id)}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Issue Clearance
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clinical Hospital Postings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching hospital allocations, clinical unit rotations, preceptor logbook assessments, and statutory board clearances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'allocations' && !isStudent && (
            <Button
              size="sm"
              onClick={() => setIsAddAllocationOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Allocate Placement
            </Button>
          )}
          {activeTab === 'sites' && (
            <Button
              size="sm"
              onClick={() => setIsAddSiteModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="whitespace-nowrap"
            >
              Add Hospital Partner
            </Button>
          )}
          {activeTab === 'clearance' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Batch Certificate Export',
                  message: 'Exporting clinical training clearance dossier for statutory boards.',
                });
              }}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="whitespace-nowrap"
            >
              Export Clearance Dossier
            </Button>
          )}
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trainees on Rotation
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">640</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">+14% vs 2025</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Across 6 teaching hospitals</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Partner Hospitals
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{sites.length}</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-600 font-semibold">Clinical sites</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">CHPRBN, MLSCN, PCN approved</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Logbook Completion
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{logbookPct}%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-600 font-semibold">598 completed</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Preceptor signed off</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Certified Clearances
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{certifiedCount}</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Ready for Boards</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">National licensing eligible</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <Tabs
        tabs={
          isStudent
            ? [
                { id: 'allocations', label: 'My Hospital Placement' },
                { id: 'logbooks', label: 'My Clinical Logbook' },
                { id: 'clearance', label: 'My Clinical Clearance' },
              ]
            : [
                { id: 'allocations', label: 'Hospital Allocations' },
                { id: 'sites', label: 'Training Hospitals' },
                { id: 'logbooks', label: 'Logbook Grading' },
                { id: 'clearance', label: 'Final Clearance' },
              ]
        }
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: HOSPITAL ALLOCATIONS ─── */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-56">
                <Select
                  value={selectedHospitalFilter}
                  onChange={(val) => setSelectedHospitalFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Hospitals' },
                    ...sites.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
              </div>
              <div className="w-40">
                <Select
                  value={selectedDeptFilter}
                  onChange={(val) => setSelectedDeptFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Programmes' },
                    ...(departments || []).map((d) => ({ value: d.code, label: d.name })),
                  ]}
                />
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search trainee, matric, or site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <Card>
            <Table
              columns={allocationColumns}
              data={filteredAllocations}
              searchable={false}
              keyExtractor={(a) => a.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 2: TRAINING HOSPITALS ─── */}
      {activeTab === 'sites' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Accredited health facilities partnered with Bethsaida College of Health Technology for statutory student clinical postings.
          </p>
          <Card>
            <Table
              columns={siteColumns}
              data={sites}
              keyExtractor={(s) => s.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 3: LOGBOOK GRADING ─── */}
      {activeTab === 'logbooks' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Preceptor Assessment Mandate:</strong> Trainees must achieve at least 50% in clinical practical logbooks and complete 100% of required clinical procedures to be cleared for the National Board Qualifying Exam.
            </span>
          </div>

          <Card>
            <Table
              columns={logbookColumns}
              data={filteredAllocations}
              searchable={false}
              keyExtractor={(a) => a.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 4: FINAL CLEARANCES ─── */}
      {activeTab === 'clearance' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-[4px] text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F7640] shrink-0" />
            <span>
              <strong>Clearance Requirements:</strong> Clearances require 100% posting duration completed, assessed score of 50% or higher, and full payment of posting fees.
            </span>
          </div>

          <Card>
            <Table
              columns={clearanceColumns}
              data={filteredAllocations}
              searchable={false}
              keyExtractor={(a) => a.id}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── MODAL 1: OFFICIAL POSTING LETTER / INTRODUCTION LETTER ─── */}
      <Modal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
        title="Official Clinical Posting Introduction Letter"
        size="lg"
      >
        {selectedLetterRecord && (
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
                  Approved by Federal Ministry of Health • {schoolProfile?.campusAddress || 'Ogbomoso, Oyo State, Nigeria'}
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-[4px] bg-slate-100 text-slate-800 font-bold text-[10px] uppercase">
                  Ref: {schoolProfile?.institutionAcronym || "BCHT"}/CLN/POST/{schoolProfile?.activeSession?.split("/")[0] || "2026"}/0491
                </div>
              </div>

              {/* Addressee */}
              <div className="mt-4 space-y-1">
                <span className="font-bold text-slate-900 block">The Chief Medical Director / Superintendent,</span>
                <span className="font-semibold text-slate-800 block">{selectedLetterRecord.siteName}</span>
                <span className="text-slate-500 block">Oyo State, Nigeria</span>
              </div>

              {/* Subject */}
              <div className="mt-4 pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Subject: Clinical Hospital Rotation & Trainee Placement — {selectedLetterRecord.studentName.toUpperCase()} ({selectedLetterRecord.matricNumber})
                </h3>
              </div>

              {/* Body */}
              <div className="mt-3 space-y-3 text-slate-700 leading-relaxed text-[12px]">
                <p>
                  We write to formally introduce <strong>{selectedLetterRecord.studentName}</strong> with Matriculation Number <strong>{selectedLetterRecord.matricNumber}</strong>, a bona fide {selectedLetterRecord.level} student of the <strong>{selectedLetterRecord.departmentName}</strong> at Bethsaida College of Health Technology.
                </p>
                <p>
                  The candidate has been duly allocated to your esteemed institution for mandatory clinical practical rotation in the specialty unit of <strong>{selectedLetterRecord.clinicalUnit}</strong> for the period spanning <strong>{selectedLetterRecord.rotationPeriod}</strong>.
                </p>
                <p>
                  This rotation is an indispensable requirement of the statutory regulatory curriculum. The trainee has been briefed on clinical ethics, patient confidentiality, infection control, and professional hospital conduct. Kindly grant the trainee access to practical clinical exposure and assign a qualified clinical preceptor to verify daily e-logbook entries.
                </p>
              </div>

              {/* Signatures */}
              <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <div className="w-32 border-b border-slate-800 mb-1"></div>
                  <span className="font-bold text-slate-900 text-xs block">Dr. K. Bello, FWACP</span>
                  <span className="text-[10px] text-slate-500">Director of Clinical Training & Postings</span>
                </div>
                <div className="text-right">
                  <div className="w-32 border-b border-slate-800 ml-auto mb-1"></div>
                  <span className="font-bold text-slate-900 text-xs block">Dr. Timothy Balogun</span>
                  <span className="text-[10px] text-slate-500">College Provost, {schoolProfile?.institutionAcronym || "BCHT"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setIsLetterModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Print Official Letter
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: CLINICAL CLEARANCE CERTIFICATE ─── */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title="Official Clinical Rotation Completion Certificate"
        size="lg"
      >
        {selectedCertRecord && (
          <div className="space-y-6 text-xs text-slate-800">
            <div className="border-4 border-double border-emerald-700/60 p-6 rounded-[4px] bg-white relative">
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
                  Approved by Federal Ministry of Health • {schoolProfile?.campusAddress || 'Ogbomoso, Oyo State, Nigeria'}
                </p>
                <div className="mt-3 inline-block px-4 py-1 rounded-[4px] bg-emerald-50 text-[#0F7640] border border-emerald-300 font-extrabold uppercase text-xs tracking-wider">
                  Certificate of Clinical Training Completion
                </div>
              </div>

              <div className="mt-6 text-center space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-widest">This is to certify that</p>
                <h3 className="text-xl font-extrabold text-slate-900 underline decoration-[#0F7640] decoration-2 underline-offset-4">
                  {selectedCertRecord.studentName}
                </h3>
                <p className="text-xs text-slate-600">
                  Matriculation Number: <strong className="text-slate-900">{selectedCertRecord.matricNumber}</strong>
                </p>
                <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed pt-2">
                  has satisfactorily completed the prescribed clinical hospital rotation in <strong>{selectedCertRecord.departmentName}</strong> at <strong>{selectedCertRecord.siteName}</strong> during the period of <strong>{selectedCertRecord.rotationPeriod}</strong>, having completed all mandatory clinical competencies with an assessed score of:
                </p>
                <div className="inline-block px-4 py-1.5 rounded-[4px] bg-slate-50 border border-slate-200">
                  <span className="text-lg font-black text-[#0F7640]">
                    {selectedCertRecord.supervisorScore || 85}% (DISTINCTION)
                  </span>
                </div>
                <p className="text-[11px] text-[#13A348] font-bold">
                  DULY CLEARED FOR THE NATIONAL PROFESSIONAL LICENSING BOARD EXAMINATION
                </p>
              </div>

              {/* Signatures & Security Stamp */}
              <div className="mt-10 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 items-end">
                <div>
                  <div className="w-28 border-b border-slate-800 mb-1"></div>
                  <span className="font-bold text-slate-900 text-[11px] block">Hospital Preceptor</span>
                  <span className="text-[10px] text-slate-500">{selectedCertRecord.siteName}</span>
                </div>
                <div className="text-center">
                  <div className="w-24 h-12 mx-auto border border-dashed border-emerald-600 rounded-[4px] flex items-center justify-center text-[10px] font-bold text-[#0F7640] bg-emerald-50/50">
                    SEAL CERTIFIED
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-28 border-b border-slate-800 ml-auto mb-1"></div>
                  <span className="font-bold text-slate-900 text-[11px] block">Dr. Timothy Balogun</span>
                  <span className="text-[10px] text-slate-500">Provost, {schoolProfile?.institutionAcronym || "BCHT"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setIsCertModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Print Certificate
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 3: PRECEPTOR LOGBOOK GRADING ─── */}
      <Modal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        title="Clinical Preceptor Logbook Assessment"
        size="md"
      >
        {selectedGradingRecord && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedGradingRecord.studentName}</span>
                <span className="font-semibold text-slate-600">{selectedGradingRecord.matricNumber}</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Hospital: {selectedGradingRecord.siteName} • Unit: {selectedGradingRecord.clinicalUnit}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
              <div>
                <span className="text-slate-400 block text-[11px]">Procedures Completed</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedGradingRecord.proceduresCompleted} of {selectedGradingRecord.totalProceduresRequired} Signed
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Score</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedGradingRecord.supervisorScore !== undefined ? `${selectedGradingRecord.supervisorScore}%` : 'Pending'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">
                Preceptor Assessed Score (0 - 100%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={gradeInput}
                onChange={(e) => setGradeInput(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] font-bold text-slate-900"
              />
              <span className="text-[11px] text-slate-400">
                Minimum 50% required for professional board statutory clearance.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">
                Preceptor Clinical Remarks & Competency Evaluation:
              </label>
              <textarea
                rows={3}
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] text-slate-800"
                placeholder="Enter remarks regarding clinical conduct, asepsis, and technical procedures..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setIsGradingModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGrade} className="bg-[#0F7640] hover:bg-[#093322]">
                Save Assessment Score
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 4: ADD HOSPITAL FACILITY ─── */}
      <Modal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        title="Add Accredited Clinical Training Hospital"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Hospital / Facility Name:</label>
            <input
              type="text"
              placeholder="e.g. Jericho Specialist Hospital, Ibadan"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Facility Category:</label>
              <Select
                value={newSiteType}
                onChange={(val) => setNewSiteType(val as FacilityType)}
                options={[
                  { value: 'TEACHING_HOSPITAL', label: 'Teaching Hospital' },
                  { value: 'STATE_GENERAL_HOSPITAL', label: 'State General Hospital' },
                  { value: 'PRIMARY_HEALTH_CENTRE', label: 'Primary Health Centre' },
                  { value: 'SPECIALIST_LAB', label: 'Specialist Clinic' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Trainee Quota Capacity:</label>
              <input
                type="number"
                value={newSiteCapacity}
                onChange={(e) => setNewSiteCapacity(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Facility Physical Location:</label>
            <input
              type="text"
              placeholder="Street Address, City, State"
              value={newSiteLocation}
              onChange={(e) => setNewSiteLocation(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Chief Preceptor Supervisor:</label>
              <input
                type="text"
                placeholder="Name & Title"
                value={newSiteSupervisor}
                onChange={(e) => setNewSiteSupervisor(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Liaison Contact Phone:</label>
              <input
                type="text"
                placeholder="+234 ..."
                value={newSitePhone}
                onChange={(e) => setNewSitePhone(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsAddSiteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSite} className="bg-[#0F7640] hover:bg-[#093322]">
              Register Hospital Site
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 5: ALLOCATE TRAINEE PLACEMENT ─── */}
      <Modal
        isOpen={isAddAllocationOpen}
        onClose={() => setIsAddAllocationOpen(false)}
        title="Allocate Clinical Trainee Placement"
        description="Assign a health trainee to an accredited partner teaching hospital and ward rotation."
        size="md"
      >
        <form onSubmit={handleCreateAllocation} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Trainee Matric No."
              value={newAllocMatric}
              onChange={(e) => setNewAllocMatric(e.target.value)}
              required
            />
            <Input
              label="Trainee Full Name"
              value={newAllocStudentName}
              onChange={(e) => setNewAllocStudentName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Partner Hospital Facility"
              options={sites.map((s) => ({ value: s.id, label: s.name }))}
              value={newAllocSiteId}
              onChange={(val) => setNewAllocSiteId(val)}
            />
            <Select
              label="Department / Programme"
              options={(departments || []).map((d) => ({ value: d.name, label: d.name }))}
              value={newAllocDept}
              onChange={(val) => setNewAllocDept(val)}
            />
          </div>

          <Input
            label="Clinical Rotation Unit / Ward"
            value={newAllocUnit}
            onChange={(e) => setNewAllocUnit(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Posting Start Date"
              value={newAllocStart}
              onChange={setNewAllocStart}
            />
            <DatePicker
              label="Posting End Date"
              value={newAllocEnd}
              onChange={setNewAllocEnd}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setIsAddAllocationOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Confirm Placement
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 6: EDIT HOSPITAL PARTNER ─── */}
      {editingSite && (
        <Modal
          isOpen={isEditSiteOpen}
          onClose={() => {
            setIsEditSiteOpen(false);
            setEditingSite(null);
          }}
          title={`Edit Facility: ${editingSite.name}`}
          description="Update partner hospital specifications, ward capacity, and preceptor contact."
          size="md"
        >
          <form onSubmit={handleSaveEditSite} className="space-y-4 text-xs font-sans">
            <Input
              label="Hospital Facility Name"
              value={editingSite.name}
              onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Facility Tier"
                options={[
                  { value: 'TEACHING_HOSPITAL', label: 'Federal Teaching Hospital' },
                  { value: 'STATE_GENERAL_HOSPITAL', label: 'State General Hospital' },
                  { value: 'PRIMARY_HEALTH_CARE', label: 'Primary Healthcare Center' },
                  { value: 'SPECIALIST_CLINIC', label: 'Accredited Specialist Clinic' },
                ]}
                value={editingSite.type}
                onChange={(val) => setEditingSite({ ...editingSite, type: val as FacilityType })}
              />
              <Input
                label="Bed / Trainee Capacity"
                type="number"
                value={String(editingSite.capacity)}
                onChange={(e) => setEditingSite({ ...editingSite, capacity: parseInt(e.target.value) || 10 })}
                required
              />
            </div>

            <Input
              label="Physical Location / Address"
              value={editingSite.location}
              onChange={(e) => setEditingSite({ ...editingSite, location: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Chief Clinical Preceptor"
                value={editingSite.supervisorName}
                onChange={(e) => setEditingSite({ ...editingSite, supervisorName: e.target.value })}
                required
              />
              <Input
                label="Liaison Phone"
                value={editingSite.contactPhone}
                onChange={(e) => setEditingSite({ ...editingSite, contactPhone: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsEditSiteOpen(false);
                  setEditingSite(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 7: DELETE HOSPITAL CONFIRMATION ─── */}
      {deletingSite && (
        <Modal
          isOpen={isDeleteSiteOpen}
          onClose={() => {
            setIsDeleteSiteOpen(false);
            setDeletingSite(null);
          }}
          title="Remove Hospital Partner"
          size="sm"
        >
          <div className="space-y-3 text-xs text-slate-700 font-sans">
            <p>
              Are you sure you want to remove <strong>{deletingSite.name}</strong> from accredited hospital partners?
            </p>
            <p className="text-[11px] text-slate-500">
              Active postings at this facility must be reassigned before final de-accreditation.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsDeleteSiteOpen(false);
                  setDeletingSite(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="button"
                onClick={handleConfirmDeleteSite}
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
