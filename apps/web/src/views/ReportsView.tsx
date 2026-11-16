import React, { useState } from 'react';
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
  Select,
} from '@campusone/ui';
import {
  FileCheck,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Search,
  Filter,
  Layers,
  Building2,
  UserCheck,
  Calendar,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { formatNaira } from '@campusone/contracts';

/* ─── TYPE DEFINITIONS ─── */
export type AccreditationStatus = 'FULL_ACCREDITATION' | 'INTERIM_ACCREDITATION' | 'RENEWAL_DUE';

export interface CouncilAccreditationItem {
  id: string;
  councilCode: 'NBTE' | 'CHPRBN' | 'MLSCN' | 'PCN' | 'HRORBN' | 'EHORECON';
  councilName: string;
  programmesCovered: string;
  status: AccreditationStatus;
  inspectionScore: number;
  accreditedDate: string;
  expiryDate: string;
  statutoryQuota: number;
  approvedLabs: string[];
  chiefInspector: string;
}

export interface CandidateRosterItem {
  id: string;
  matricNo: string;
  fullName: string;
  departmentCode: 'CHE' | 'MLT' | 'PHT' | 'HIM' | 'EHT';
  departmentName: string;
  level: string;
  cgpa: string;
  feeClearanceStatus: 'CLEARED' | 'PENDING';
  logbookStatus: 'VERIFIED' | 'PENDING';
  councilIndexNo: string;
  boardEligibility: 'QUALIFIED' | 'BARRED';
}

export interface StandardReportItem {
  id: string;
  title: string;
  domainCategory: 'Academic' | 'Financial' | 'Regulatory' | 'Clinical' | 'Human Resources' | 'Hostels';
  formats: string[];
  recordCount: number;
  description: string;
  lastGenerated: string;
}

export const ReportsView: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { isDense, recordAudit, schoolProfile } = useApp();
  const { showToast } = useToast();

  /* ─── TAB ROUTING STATE ─── */
  const validTabs = ['accreditation', 'rosters', 'repository', 'builder'];
  const activeTab = tab && validTabs.includes(tab) ? tab : 'accreditation';

  const handleTabChange = (newTab: string) => {
    navigate(`/reports/${newTab}`);
  };

  /* ─── MODAL STATES ─── */
  const [selectedAccreditation, setSelectedAccreditation] = useState<CouncilAccreditationItem | null>(null);
  const [isNominalRollModalOpen, setIsNominalRollModalOpen] = useState(false);
  const [selectedNominalDept, setSelectedNominalDept] = useState<'CHE' | 'MLT' | 'PHT' | 'HIM' | 'EHT'>('CHE');

  /* ─── SEARCH & FILTER STATES ─── */
  const [accreditationSearch, setAccreditationSearch] = useState('');
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterDeptFilter, setRosterDeptFilter] = useState('ALL');
  const [reportSearch, setReportSearch] = useState('');
  const [reportDomainFilter, setReportDomainFilter] = useState('ALL');

  /* ─── CUSTOM REPORT BUILDER FORM STATES ─── */
  const [builderDomain, setBuilderDomain] = useState('STUDENTS');
  const [builderSession, setBuilderSession] = useState('2026/2027');
  const [builderDept, setBuilderDept] = useState('ALL');
  const [builderFormat, setBuilderFormat] = useState('EXCEL');
  const [isCustomReportGenerated, setIsCustomReportGenerated] = useState(false);

  /* ─── DATA: STATUTORY ACCREDITATION DOSSIERS ─── */
  const [accreditations] = useState<CouncilAccreditationItem[]>([
    {
      id: 'acc-01',
      councilCode: 'NBTE',
      councilName: 'National Board for Technical Education',
      programmesCovered: 'College Accreditation License & National Diploma (ND) Programs',
      status: 'FULL_ACCREDITATION',
      inspectionScore: 96.5,
      accreditedDate: '2023-04-15',
      expiryDate: '2028-04-14',
      statutoryQuota: 1400,
      approvedLabs: ['Pathology Laboratory', 'Demonstration Clinic', 'Pharmaceutical Lab', 'Public Health Lab'],
      chiefInspector: 'Engr. Dr. A. Bello (NBTE Director of Monotechnics)',
    },
    {
      id: 'acc-02',
      councilCode: 'CHPRBN',
      councilName: 'Community Health Practitioners Registration Board of Nigeria',
      programmesCovered: 'Community Health Extension Worker (CHEW) Diploma & Certificate',
      status: 'FULL_ACCREDITATION',
      inspectionScore: 95.0,
      accreditedDate: '2022-11-10',
      expiryDate: '2027-11-09',
      statutoryQuota: 500,
      approvedLabs: ['Demonstration Primary Healthcare Clinic', 'Maternal & Child Health Sim Suite'],
      chiefInspector: 'Bldr. Bashir Hamza (CHPRBN National Registrar)',
    },
    {
      id: 'acc-03',
      councilCode: 'MLSCN',
      councilName: 'Medical Laboratory Science Council of Nigeria',
      programmesCovered: 'Medical Laboratory Technician (MLT) Professional Certification',
      status: 'FULL_ACCREDITATION',
      inspectionScore: 93.8,
      accreditedDate: '2023-02-18',
      expiryDate: '2028-02-17',
      statutoryQuota: 350,
      approvedLabs: ['Diagnostic Pathology Lab', 'Chemical Enzymology Wing', 'Microbiology Lab'],
      chiefInspector: 'Dr. Tosan Erhabor (Registrar / CEO MLSCN)',
    },
    {
      id: 'acc-04',
      councilCode: 'PCN',
      councilName: 'Pharmacy Council of Nigeria',
      programmesCovered: 'Pharmacy Technician Studies Professional Diploma',
      status: 'FULL_ACCREDITATION',
      inspectionScore: 91.5,
      accreditedDate: '2023-09-05',
      expiryDate: '2028-09-04',
      statutoryQuota: 300,
      approvedLabs: ['Pharmaceutical Formulations Lab', 'Dispensing Demonstration Room'],
      chiefInspector: 'Pharm. Babashehu Ahmed (Registrar PCN)',
    },
    {
      id: 'acc-05',
      councilCode: 'HRORBN',
      councilName: 'Health Records Officers Registration Board of Nigeria',
      programmesCovered: 'Health Information Management (HIM) Professional Track',
      status: 'FULL_ACCREDITATION',
      inspectionScore: 94.2,
      accreditedDate: '2022-08-20',
      expiryDate: '2027-08-19',
      statutoryQuota: 150,
      approvedLabs: ['Electronic Medical Records EMR Lab', 'Health Biostatistics Suite'],
      chiefInspector: 'Mrs. B. O. Njoku (HRORBN Council Inspectorate)',
    },
    {
      id: 'acc-06',
      councilCode: 'EHORECON',
      councilName: 'Environmental Health Officers Registration Council of Nigeria',
      programmesCovered: 'Environmental Health Sciences & Sanitation Officer Curriculum',
      status: 'FULL_ACCREDITATION',
      inspectionScore: 90.0,
      accreditedDate: '2024-01-12',
      expiryDate: '2029-01-11',
      statutoryQuota: 100,
      approvedLabs: ['Water Quality & Vector Inspection Lab', 'Public Health Sanitation Park'],
      chiefInspector: 'Dr. Dominic Abonyi (Registrar EHORECON)',
    },
  ]);

  /* ─── DATA: CANDIDATE NOMINAL ROSTER ─── */
  const [rosterCandidates] = useState<CandidateRosterItem[]>([
    {
      id: 'cnd-01',
      matricNo: 'CHE/2026/0014',
      fullName: 'Blessing Adeyemi',
      departmentCode: 'CHE',
      departmentName: 'Community Health (CHEW)',
      level: '200L',
      cgpa: '3.84',
      feeClearanceStatus: 'CLEARED',
      logbookStatus: 'VERIFIED',
      councilIndexNo: 'CHPRBN/IND/2026/0891',
      boardEligibility: 'QUALIFIED',
    },
    {
      id: 'cnd-02',
      matricNo: 'CHE/2026/0015',
      fullName: 'Oluwaseun Bakare',
      departmentCode: 'CHE',
      departmentName: 'Community Health (CHEW)',
      level: '200L',
      cgpa: '3.42',
      feeClearanceStatus: 'CLEARED',
      logbookStatus: 'VERIFIED',
      councilIndexNo: 'CHPRBN/IND/2026/0892',
      boardEligibility: 'QUALIFIED',
    },
    {
      id: 'cnd-03',
      matricNo: 'CHE/2026/0016',
      fullName: 'Fatima Ibrahim',
      departmentCode: 'CHE',
      departmentName: 'Community Health (CHEW)',
      level: '200L',
      cgpa: '3.91',
      feeClearanceStatus: 'CLEARED',
      logbookStatus: 'VERIFIED',
      councilIndexNo: 'CHPRBN/IND/2026/0893',
      boardEligibility: 'QUALIFIED',
    },
    {
      id: 'cnd-04',
      matricNo: 'CHE/2026/0017',
      fullName: 'Chinedu Eze',
      departmentCode: 'CHE',
      departmentName: 'Community Health (CHEW)',
      level: '200L',
      cgpa: '2.15',
      feeClearanceStatus: 'PENDING',
      logbookStatus: 'VERIFIED',
      councilIndexNo: 'CHPRBN/IND/2026/0894',
      boardEligibility: 'BARRED',
    },
    {
      id: 'cnd-05',
      matricNo: 'MLT/2026/0009',
      fullName: 'Tunde Olatunji',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Tech',
      level: '200L',
      cgpa: '3.75',
      feeClearanceStatus: 'CLEARED',
      logbookStatus: 'VERIFIED',
      councilIndexNo: 'MLSCN/IND/2026/0412',
      boardEligibility: 'QUALIFIED',
    },
    {
      id: 'cnd-06',
      matricNo: 'MLT/2026/0010',
      fullName: 'Halima Yusuf',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Tech',
      level: '200L',
      cgpa: '3.60',
      feeClearanceStatus: 'CLEARED',
      logbookStatus: 'VERIFIED',
      councilIndexNo: 'MLSCN/IND/2026/0413',
      boardEligibility: 'QUALIFIED',
    },
    {
      id: 'cnd-07',
      matricNo: 'PHT/2026/0022',
      fullName: 'Ifeanyi Okoro',
      departmentCode: 'PHT',
      departmentName: 'Pharmacy Technician',
      level: '200L',
      cgpa: '3.20',
      feeClearanceStatus: 'CLEARED',
      logbookStatus: 'VERIFIED',
      councilIndexNo: 'PCN/IND/2026/0188',
      boardEligibility: 'QUALIFIED',
    },
    {
      id: 'cnd-08',
      matricNo: 'HIM/2026/0005',
      fullName: 'Rukayat Sanusi',
      departmentCode: 'HIM',
      departmentName: 'Health Information Mgmt',
      level: '200L',
      cgpa: '3.68',
      feeClearanceStatus: 'CLEARED',
      logbookStatus: 'VERIFIED',
      councilIndexNo: 'HRORBN/IND/2026/0091',
      boardEligibility: 'QUALIFIED',
    },
  ]);

  /* ─── DATA: STANDARD REPORTS REPOSITORY ─── */
  const [standardReports] = useState<StandardReportItem[]>([
    {
      id: 'rpt-01',
      title: 'NBTE Monotechnic Accreditation & Staff-to-Student Ratio Audit',
      domainCategory: 'Regulatory',
      formats: ['Excel / XLSX', 'PDF Document', 'CSV'],
      recordCount: 1248,
      description: 'Comprehensive college audit: lecturer contact hours, lab infrastructure inventory, and 3-year performance metrics.',
      lastGenerated: '2026-11-12 10:30',
    },
    {
      id: 'rpt-02',
      title: 'CHPRBN National Council Board Examination Official Eligibility Nominal Roll',
      domainCategory: 'Academic',
      formats: ['Official Council CSV', 'Printable PDF'],
      recordCount: 438,
      description: 'Accredited candidates list with verified CGPA ≥ 2.00, logbook verification, and full Bursary settlement.',
      lastGenerated: '2026-11-10 14:15',
    },
    {
      id: 'rpt-03',
      title: 'Bursary Cashbook & Multi-Gateway Reconciliation Master Schedule',
      domainCategory: 'Financial',
      formats: ['Excel / XLSX', 'PDF Audit Report'],
      recordCount: 1840,
      description: 'Bank settlement audit vs Paystack and Remita automated webhooks for {schoolProfile?.activeSemester || "Harmattan"} {schoolProfile?.activeSession || "2026/2027"}.',
      lastGenerated: '2026-11-13 09:00',
    },
    {
      id: 'rpt-04',
      title: 'Clinical Hospital Rotations & Consultant Preceptor Evaluation Dossier',
      domainCategory: 'Clinical',
      formats: ['Excel / XLSX', 'PDF Report'],
      recordCount: 640,
      description: 'Secondary and specialist hospital logbooks, procedural sign-offs, and clinical attendance records.',
      lastGenerated: '2026-11-11 16:45',
    },
    {
      id: 'rpt-05',
      title: 'Faculty CONPCASS Payroll Schedule & Statutory Remittance Summary',
      domainCategory: 'Human Resources',
      formats: ['PDF Signed Letterhead', 'Excel Payroll Matrix'],
      recordCount: 64,
      description: 'Itemized salary disbursements, clinical hazard allowances, PAYE state tax, and PenCom pensions.',
      lastGenerated: '2026-11-12 18:20',
    },
    {
      id: 'rpt-06',
      title: 'Hostel Bed Space Allocation, Key Custody & Facility Maintenance Audit',
      domainCategory: 'Hostels',
      formats: ['Excel / XLSX', 'CSV'],
      recordCount: 420,
      description: 'Hall of residence room inventory, bed space verification, key tag register, and defect tickets.',
      lastGenerated: '2026-11-13 11:10',
    },
  ]);

  /* ─── FILTERED LISTS ─── */
  const filteredAccreditations = accreditations.filter((a) => {
    if (accreditationSearch.trim()) {
      const q = accreditationSearch.toLowerCase();
      const matchCode = a.councilCode.toLowerCase().includes(q);
      const matchName = a.councilName.toLowerCase().includes(q);
      const matchProg = a.programmesCovered.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchProg) return false;
    }
    return true;
  });

  const filteredRoster = rosterCandidates.filter((r) => {
    if (rosterDeptFilter !== 'ALL' && r.departmentCode !== rosterDeptFilter) return false;
    if (rosterSearch.trim()) {
      const q = rosterSearch.toLowerCase();
      const matchMatric = r.matricNo.toLowerCase().includes(q);
      const matchName = r.fullName.toLowerCase().includes(q);
      const matchIndex = r.councilIndexNo.toLowerCase().includes(q);
      if (!matchMatric && !matchName && !matchIndex) return false;
    }
    return true;
  });

  const filteredReports = standardReports.filter((r) => {
    if (reportDomainFilter !== 'ALL' && r.domainCategory !== reportDomainFilter) return false;
    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchCat = r.domainCategory.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  /* ─── ACTION HANDLERS ─── */
  const handleDownloadReport = (title: string, format: string) => {
    recordAudit('STATUTORY_REPORT_DOWNLOADED', 'ACCREDITATION_REPORT', title, { format });
    showToast({
      type: 'success',
      title: 'Report Compiled & Exported',
      message: `${title} exported in ${format} with official college seal.`,
    });
  };

  const handleGenerateCustomReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCustomReportGenerated(true);
    recordAudit('CUSTOM_REPORT_COMPILED', 'REPORT_BUILDER', builderDomain, { session: builderSession, format: builderFormat });
    showToast({
      type: 'success',
      title: 'Custom Query Compiled',
      message: `Compiled ${builderDomain} report for ${builderSession} in ${builderFormat} format.`,
    });
  };

  /* ─── TABLE 1: ACCREDITATION COLUMNS ─── */
  const accreditationColumns = [
    {
      key: 'council',
      header: 'Regulatory Body / Council',
      render: (a: CouncilAccreditationItem) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[#0F7640] text-xs block">{a.councilCode}</span>
            <span className="text-[10px] text-slate-400 font-semibold">• Quota: {a.statutoryQuota}</span>
          </div>
          <span className="font-bold text-slate-900 block text-xs">{a.councilName}</span>
          <span className="text-[11px] text-slate-500 font-medium leading-snug">{a.programmesCovered}</span>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Council Audit Score',
      align: 'center' as const,
      nowrap: true,
      render: (a: CouncilAccreditationItem) => (
        <div className="flex flex-col items-center">
          <span className="font-extrabold text-[#0F7640] text-sm font-sans">{a.inspectionScore}%</span>
          <span className="text-[10px] text-emerald-700 font-bold">Top Benchmark</span>
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Accreditation Tenure',
      nowrap: true,
      render: (a: CouncilAccreditationItem) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block font-sans">
            Valid until {a.expiryDate}
          </span>
          <span className="text-[11px] text-slate-400 font-sans">Issued: {a.accreditedDate}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Standing',
      align: 'center' as const,
      nowrap: true,
      render: (a: CouncilAccreditationItem) => (
        <Badge variant={a.status === 'FULL_ACCREDITATION' ? 'success' : 'primary'} size="sm">
          {a.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Audit Dossier',
      align: 'right' as const,
      nowrap: true,
      render: (a: CouncilAccreditationItem) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSelectedAccreditation(a)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          className="whitespace-nowrap"
        >
          View Dossier
        </Button>
      ),
    },
  ];

  /* ─── TABLE 2: NOMINAL ROSTER COLUMNS ─── */
  const rosterColumns = [
    {
      key: 'matricNo',
      header: 'Matric & Council Index No.',
      nowrap: true,
      render: (c: CandidateRosterItem) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{c.matricNo}</span>
          <span className="text-[11px] text-[#0F7640] font-semibold font-sans">{c.councilIndexNo}</span>
        </div>
      ),
    },
    {
      key: 'fullName',
      header: 'Candidate Full Name',
      render: (c: CandidateRosterItem) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{c.fullName}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            {c.departmentName} ({c.level})
          </span>
        </div>
      ),
    },
    {
      key: 'cgpa',
      header: 'Cumulative GPA',
      align: 'center' as const,
      nowrap: true,
      render: (c: CandidateRosterItem) => (
        <span className="font-bold text-slate-900 text-xs font-sans">{c.cgpa} / 4.00</span>
      ),
    },
    {
      key: 'clearance',
      header: 'Bursary & Logbook',
      align: 'center' as const,
      nowrap: true,
      render: (c: CandidateRosterItem) => (
        <div className="flex items-center justify-center gap-1.5">
          <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold ${c.feeClearanceStatus === 'CLEARED' ? 'bg-emerald-50 text-[#0F7640]' : 'bg-rose-50 text-rose-700'}`}>
            Fees: {c.feeClearanceStatus}
          </span>
          <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold ${c.logbookStatus === 'VERIFIED' ? 'bg-emerald-50 text-[#0F7640]' : 'bg-slate-100 text-slate-500'}`}>
            Log: {c.logbookStatus}
          </span>
        </div>
      ),
    },
    {
      key: 'eligibility',
      header: 'Board Eligibility',
      align: 'center' as const,
      nowrap: true,
      render: (c: CandidateRosterItem) => (
        <Badge variant={c.boardEligibility === 'QUALIFIED' ? 'success' : 'danger'} size="sm">
          {c.boardEligibility === 'QUALIFIED' ? 'QUALIFIED FOR EXAMS' : 'BARRED FROM EXAMS'}
        </Badge>
      ),
    },
  ];

  /* ─── TABLE 3: STANDARD REPORTS COLUMNS ─── */
  const reportColumns = [
    {
      key: 'title',
      header: 'Report Title & Scope',
      render: (r: StandardReportItem) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.title}</span>
          <span className="text-[11px] text-slate-500 font-medium leading-snug">{r.description}</span>
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            {r.formats.map((fmt, i) => (
              <span key={i} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-[4px] text-[10px] font-sans">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Domain Category',
      nowrap: true,
      render: (r: StandardReportItem) => (
        <Badge variant="primary" size="sm">
          {r.domainCategory}
        </Badge>
      ),
    },
    {
      key: 'records',
      header: 'Scope Records',
      align: 'center' as const,
      nowrap: true,
      render: (r: StandardReportItem) => (
        <span className="font-bold text-slate-900 text-xs font-sans">
          {r.recordCount} Records
        </span>
      ),
    },
    {
      key: 'lastGenerated',
      header: 'Last Compiled',
      nowrap: true,
      render: (r: StandardReportItem) => (
        <span className="text-xs text-slate-600 font-sans">{r.lastGenerated}</span>
      ),
    },
    {
      key: 'action',
      header: 'Export',
      align: 'right' as const,
      nowrap: true,
      render: (r: StandardReportItem) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleDownloadReport(r.title, r.formats[0])}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="whitespace-nowrap"
        >
          Generate Export
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── MODULE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Accreditation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory Council Dossiers • National Board Nominal Rolls • Standard Report Repository • Custom Query Designer
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsNominalRollModalOpen(true)}
            leftIcon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
            className="whitespace-nowrap text-xs"
          >
            Print Council Nominal Roll
          </Button>
          <Button
            size="sm"
            onClick={() => {
              showToast({
                type: 'success',
                title: 'Accreditation Packet Compiled',
                message: 'All 6 regulatory dossiers bundled into certified ZIP archive.',
              });
            }}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="whitespace-nowrap text-xs bg-[#0F7640] hover:bg-[#093322]"
          >
            Export Accreditation Bundle
          </Button>
        </div>
      </div>

      {/* ─── 4 CORE PERFORMANCE STAT CARDS (VERTICAL STACKING, STRICT 4PX BORDER RADIUS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Accreditation Rating
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              100% Full Standing
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">5 / 5 Health Tracks</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">NBTE + 5 Professional Boards</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Board Eligible Trainees
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              880 Candidates
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">CGPA ≥ 2.00 Cleared</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Fees & Logbooks verified</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Compiled Reports
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              248 Dispatches
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">Timestamped</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">{schoolProfile?.activeSemester || "Harmattan"} {schoolProfile?.activeSession || "2026/2027"}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Statutory Audit Score
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              93.8% Overall
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">Exemplary Rating</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Zero non-compliance notices</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <Tabs
        tabs={[
          { id: 'accreditation', label: 'Accreditation Dossiers' },
          { id: 'rosters', label: 'Council Exam Rosters' },
          { id: 'repository', label: 'Standard Reports' },
          { id: 'builder', label: 'Custom Report Builder' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* ─── TAB 1: ACCREDITATION DOSSIERS ─── */}
      {activeTab === 'accreditation' && (
        <Card>
          <Table
            columns={accreditationColumns}
            data={filteredAccreditations}
            keyExtractor={(a) => a.id}
            isDense={isDense}
            searchValue={accreditationSearch}
            onSearchChange={setAccreditationSearch}
            searchPlaceholder="Search council code, name, or programme..."
            toolbarFilters={
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Federal Regulatory Status:</span>
                <span>All 6 health councils verified current</span>
              </div>
            }
          />
        </Card>
      )}

      {/* ─── TAB 2: COUNCIL EXAM ROSTERS ─── */}
      {activeTab === 'rosters' && (
        <Card>
          <Table
            columns={rosterColumns}
            data={filteredRoster}
            keyExtractor={(r) => r.id}
            isDense={isDense}
            searchValue={rosterSearch}
            onSearchChange={setRosterSearch}
            searchPlaceholder="Search matric no, candidate name, or index no..."
            toolbarFilters={
              <div className="w-52">
                <Select
                  value={rosterDeptFilter}
                  onChange={(val) => setRosterDeptFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Health Disciplines' },
                    { value: 'CHE', label: 'Community Health (CHPRBN)' },
                    { value: 'MLT', label: 'Medical Laboratory (MLSCN)' },
                    { value: 'PHT', label: 'Pharmacy Tech (PCN)' },
                    { value: 'HIM', label: 'Health Information (HRORBN)' },
                  ]}
                />
              </div>
            }
          />
        </Card>
      )}

      {/* ─── TAB 3: STANDARD REPORTS REPOSITORY ─── */}
      {activeTab === 'repository' && (
        <Card>
          <Table
            columns={reportColumns}
            data={filteredReports}
            keyExtractor={(r) => r.id}
            isDense={isDense}
            searchValue={reportSearch}
            onSearchChange={setReportSearch}
            searchPlaceholder="Search report title, domain, or format..."
            toolbarFilters={
              <div className="w-48">
                <Select
                  value={reportDomainFilter}
                  onChange={(val) => setReportDomainFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Domains' },
                    { value: 'Academic', label: 'Academic & Broadsheets' },
                    { value: 'Financial', label: 'Bursary & Payments' },
                    { value: 'Regulatory', label: 'Regulatory Councils' },
                    { value: 'Clinical', label: 'Clinical Postings' },
                    { value: 'Human Resources', label: 'Staff & Payroll' },
                    { value: 'Hostels', label: 'Hostels & Accommodations' },
                  ]}
                />
              </div>
            }
          />
        </Card>
      )}

      {/* ─── TAB 4: CUSTOM REPORT BUILDER ─── */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <Card
            header={
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Interactive Custom Query Designer
              </span>
            }
          >
            <form onSubmit={handleGenerateCustomReport} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Data Domain:</label>
                  <Select
                    value={builderDomain}
                    onChange={(v) => setBuilderDomain(v)}
                    options={[
                      { value: 'STUDENTS', label: 'Student Enrolment & Profiles' },
                      { value: 'BURSARY', label: 'Bursary Fee Ledgers & Payments' },
                      { value: 'ACADEMICS', label: 'Academic Broadsheets & Grades' },
                      { value: 'CLINICAL', label: 'Hospital Rotation Logbooks' },
                      { value: 'STAFF', label: 'Staff Personnel & Payroll' },
                      { value: 'HOSTELS', label: 'Hostel Bed Space Custody' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Academic Session:</label>
                  <Select
                    value={builderSession}
                    onChange={(v) => setBuilderSession(v)}
                    options={[
                      { value: '2026/2027', label: '2026/2027 Session (Current)' },
                      { value: '2025/2026', label: '2025/2026 Session' },
                      { value: '2024/2025', label: '2024/2025 Session' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Department Filter:</label>
                  <Select
                    value={builderDept}
                    onChange={(v) => setBuilderDept(v)}
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

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Export Format:</label>
                  <Select
                    value={builderFormat}
                    onChange={(v) => setBuilderFormat(v)}
                    options={[
                      { value: 'EXCEL', label: 'Microsoft Excel (.xlsx)' },
                      { value: 'PDF', label: 'Official Signed PDF (.pdf)' },
                      { value: 'CSV', label: 'Comma-Separated Values (.csv)' },
                    ]}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button size="sm" type="submit" leftIcon={<Sparkles className="w-3.5 h-3.5" />} className="bg-[#0F7640] hover:bg-[#093322]">
                  Compile & Generate Custom Report
                </Button>
              </div>
            </form>
          </Card>

          {/* Compiled Output Preview Table */}
          {isCustomReportGenerated && (
            <Card
              header={
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    Compiled Dataset Preview ({builderDomain} • {builderSession} Session)
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownloadReport(`Custom_${builderDomain}_Report`, builderFormat)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download Compiled File
                  </Button>
                </div>
              }
            >
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-700 space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">Query Status:</span>
                  <span className="font-bold text-[#13A348]">COMPILED SUCCESSFULLY (1,248 Records matched)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Target Domain:</span>
                    <strong className="text-slate-800">{builderDomain}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Session Filter:</span>
                    <strong className="text-slate-800">{builderSession}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Output Format:</span>
                    <strong className="text-slate-800">{builderFormat}</strong>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── MODAL 1: VIEW ACCREDITATION AUDIT DOSSIER ─── */}
      <Modal
        isOpen={Boolean(selectedAccreditation)}
        onClose={() => setSelectedAccreditation(null)}
        title="Official Council Accreditation Dossier"
        size="md"
      >
        {selectedAccreditation && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0F7640] text-sm">{selectedAccreditation.councilCode}</span>
                <Badge variant="success" size="sm">FULL ACCREDITATION</Badge>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{selectedAccreditation.councilName}</h3>
              <p className="text-slate-500 text-[11px]">{selectedAccreditation.programmesCovered}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
              <div>
                <span className="text-slate-400 block text-[11px]">Audit Score</span>
                <span className="font-extrabold text-[#0F7640] text-sm font-sans">{selectedAccreditation.inspectionScore}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Approved Student Quota</span>
                <span className="font-bold text-slate-900 text-sm font-sans">{selectedAccreditation.statutoryQuota} Trainees</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Accreditation Date</span>
                <span className="font-semibold text-slate-800 font-sans">{selectedAccreditation.accreditedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Expiry & Renewal Date</span>
                <span className="font-semibold text-slate-800 font-sans">{selectedAccreditation.expiryDate}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">Council Certified Laboratories & Facilities:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedAccreditation.approvedLabs.map((lab, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-[4px] text-[11px] font-medium text-slate-700">
                    ✓ {lab}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Lead Council Verifier / Inspector</span>
              <span className="font-bold text-slate-900">{selectedAccreditation.chiefInspector}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setSelectedAccreditation(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  showToast({
                    type: 'success',
                    title: 'Dossier Exported',
                    message: `Official accreditation certificate for ${selectedAccreditation.councilCode} downloaded.`,
                  });
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Download Certificate
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: PRINT OFFICIAL COUNCIL NOMINAL ROLL ─── */}
      <Modal
        isOpen={isNominalRollModalOpen}
        onClose={() => setIsNominalRollModalOpen(false)}
        title="Official Regulatory Council Examination Nominal Roll"
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
                Directorate of Academic Planning & Regulatory Council Examination Board • {schoolProfile?.campusAddress || "Ogbomoso, Oyo State"}
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 rounded-[4px] text-xs font-bold text-[#0F7640] border border-emerald-200 uppercase">
                OFFICIAL NATIONAL BOARD CANDIDATE NOMINAL ROLL • {schoolProfile?.activeSession || "2026/2027"} SESSION
              </div>
            </div>

            {/* Candidate Summary Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">S/N</th>
                    <th className="py-2 px-2.5">Matric No.</th>
                    <th className="py-2 px-2.5">Candidate Name</th>
                    <th className="py-2 px-2.5">Council Index No.</th>
                    <th className="py-2 px-2.5 text-center">CGPA</th>
                    <th className="py-2 px-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rosterCandidates.filter(c => c.boardEligibility === 'QUALIFIED').map((cnd, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2.5 font-bold text-[#0F7640]">{cnd.matricNo}</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">{cnd.fullName}</td>
                      <td className="py-2 px-2.5 font-semibold text-slate-700 font-sans">{cnd.councilIndexNo}</td>
                      <td className="py-2 px-2.5 text-center font-bold text-slate-900 font-sans">{cnd.cgpa}</td>
                      <td className="py-2 px-2.5 text-center font-bold text-[#13A348] text-[10px] uppercase">
                        QUALIFIED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 items-end">
              <div>
                <div className="w-28 border-b border-slate-700 mb-1"></div>
                <span className="font-bold text-slate-900 text-xs block">College Examination Officer</span>
                <span className="text-[10px] text-slate-400">{schoolProfile?.institutionName || "College of Health Technology"}</span>
              </div>
              <div className="text-right">
                <div className="w-28 border-b border-slate-700 ml-auto mb-1"></div>
                <span className="font-bold text-slate-900 text-xs block">Registrar & Provost</span>
                <span className="text-[10px] text-slate-400">National Board Sign-Off Seal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsNominalRollModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Print Nominal Roll
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
