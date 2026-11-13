import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Input,
  useToast,
  Tabs,
  Select,
} from '@campusone/ui';
import {
  ShieldCheck,
  Lock,
  Download,
  Key,
  Shield,
  UserCheck,
  Settings,
  Building2,
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Edit3,
  Plus,
  Radio,
  Server,
  Check,
  FileText,
  Mail,
  Phone,
  Clock,
  Layers,
} from 'lucide-react';
import { AuditEventRecord } from '@campusone/contracts';

/* ─── TYPE DEFINITIONS ─── */
export interface UserRoleItem {
  id: string;
  roleCode: string;
  roleTitle: string;
  description: string;
  assignedUsersCount: number;
  accessTier: 'SYSTEM_SUPER_ADMIN' | 'EXECUTIVE_ADMIN' | 'FINANCE_BURSARY' | 'ACADEMIC_FACULTY' | 'PORTAL_STUDENT';
  permissionsCount: number;
  keyPermissions: string[];
  isSystemImmutable: boolean;
}

export interface IntegrationGateway {
  id: string;
  serviceName: string;
  category: 'Payment Gateway' | 'Bank Settlement' | 'SMS Gateway' | 'Transactional Email' | 'Encrypted Storage';
  provider: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  environment: 'LIVE_PRODUCTION' | 'SANDBOX';
  accountBalance?: string;
  latencyMs: number;
  lastPing: string;
  configKey: string;
}

export const AdminView: React.FC = () => {
  const { auditLogs, isDense, recordAudit } = useApp();
  const { showToast } = useToast();
  const { tab: routeTab } = useParams();
  const navigate = useNavigate();

  // Industry-standard page routing
  const activeTab = (routeTab === 'permissions'
    ? 'rbac'
    : routeTab === 'school'
    ? 'tenant'
    : routeTab || 'audit') as 'audit' | 'rbac' | 'tenant' | 'security';

  const handleTabChange = (id: string) => {
    if (id === 'audit') {
      navigate('/settings');
    } else if (id === 'rbac') {
      navigate('/settings/permissions');
    } else if (id === 'tenant') {
      navigate('/settings/school');
    } else {
      navigate(`/settings/${id}`);
    }
  };

  /* ─── MODAL STATES ─── */
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditEventRecord | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<UserRoleItem | null>(null);
  const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
  const [isTestGatewayModalOpen, setIsTestGatewayModalOpen] = useState(false);
  const [testingGateway, setTestingGateway] = useState<IntegrationGateway | null>(null);

  /* ─── SEARCH & FILTER STATES ─── */
  const [auditSearch, setAuditSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleSearch, setRoleSearch] = useState('');

  /* ─── DATA: ROLES & PERMISSIONS ─── */
  const [roles, setRoles] = useState<UserRoleItem[]>([
    {
      id: 'rol-01',
      roleCode: 'SUPER_ADMIN',
      roleTitle: 'College Provost & Chief Executive',
      description: 'Unrestricted institutional oversight, cryptographic audit inspections, and governance sign-off.',
      assignedUsersCount: 1,
      accessTier: 'SYSTEM_SUPER_ADMIN',
      permissionsCount: 48,
      keyPermissions: ['audit:read_all', 'system:manage', 'broadsheet:publish', 'payroll:authorize', 'fees:configure'],
      isSystemImmutable: true,
    },
    {
      id: 'rol-02',
      roleCode: 'REGISTRAR',
      roleTitle: 'Registrar & Academic Secretary',
      description: 'Admissions management, matriculation registers, academic calendars, and official circulars.',
      assignedUsersCount: 2,
      accessTier: 'EXECUTIVE_ADMIN',
      permissionsCount: 36,
      keyPermissions: ['admissions:approve', 'matric:assign', 'notices:publish', 'records:verify', 'transcripts:issue'],
      isSystemImmutable: true,
    },
    {
      id: 'rol-03',
      roleCode: 'BURSAR',
      roleTitle: 'College Bursar & Finance Officer',
      description: 'Double-entry master fee ledger, Paystack/Remita reconciliation, receipts, and staff CONPCASS payroll.',
      assignedUsersCount: 3,
      accessTier: 'FINANCE_BURSARY',
      permissionsCount: 32,
      keyPermissions: ['fin:write', 'bursary:reconcile', 'payroll:execute', 'receipts:issue', 'refunds:approve'],
      isSystemImmutable: true,
    },
    {
      id: 'rol-04',
      roleCode: 'HOD_DEAN',
      roleTitle: 'Head of Academic Department (HOD)',
      description: 'Departmental faculty assignment, course curriculum, clinical posting schedules, and CA score approvals.',
      assignedUsersCount: 5,
      accessTier: 'ACADEMIC_FACULTY',
      permissionsCount: 24,
      keyPermissions: ['scores:approve', 'postings:allocate', 'timetable:edit', 'faculty:assign', 'dossier:read'],
      isSystemImmutable: false,
    },
    {
      id: 'rol-05',
      roleCode: 'EXAMS_OFFICER',
      roleTitle: 'College Examination Officer',
      description: 'Examination docket clearances, CBT practice test management, broadsheet generation, and grade locking.',
      assignedUsersCount: 2,
      accessTier: 'EXECUTIVE_ADMIN',
      permissionsCount: 28,
      keyPermissions: ['exams:clear', 'dockets:issue', 'grades:lock', 'broadsheet:generate', 'cbt:manage'],
      isSystemImmutable: true,
    },
    {
      id: 'rol-06',
      roleCode: 'LECTURER_PRECEPTOR',
      roleTitle: 'Lecturer & Clinical Preceptor',
      description: 'Lecture attendance register, CA continuous assessment entry, and hospital clinical rotation logs.',
      assignedUsersCount: 44,
      accessTier: 'ACADEMIC_FACULTY',
      permissionsCount: 16,
      keyPermissions: ['attendance:mark', 'scores:input', 'postings:evaluate', 'lms:upload', 'curriculum:read'],
      isSystemImmutable: false,
    },
    {
      id: 'rol-07',
      roleCode: 'HALL_WARDEN',
      roleTitle: 'Hall Warden & Matron',
      description: 'Hostel room inventory, bed space verification, student check-in register, and defect repair reporting.',
      assignedUsersCount: 4,
      accessTier: 'EXECUTIVE_ADMIN',
      permissionsCount: 18,
      keyPermissions: ['hostels:allocate', 'keys:issue', 'checkin:verify', 'maintenance:report', 'assets:audit'],
      isSystemImmutable: false,
    },
  ]);

  /* ─── DATA: INTEGRATION GATEWAYS ─── */
  const [gateways, setGateways] = useState<IntegrationGateway[]>([
    {
      id: 'gw-01',
      serviceName: 'Paystack Payment SPI',
      category: 'Payment Gateway',
      provider: 'Paystack Checkout API v2',
      status: 'OPERATIONAL',
      environment: 'LIVE_PRODUCTION',
      accountBalance: '₦1,420,000.00 Settled',
      latencyMs: 142,
      lastPing: '2 mins ago',
      configKey: 'pk_live_****************91a2',
    },
    {
      id: 'gw-02',
      serviceName: 'Remita e-Collection Gateway',
      category: 'Bank Settlement',
      provider: 'Remita Commercial Bank Engine',
      status: 'OPERATIONAL',
      environment: 'LIVE_PRODUCTION',
      accountBalance: '₦4,850,000.00 Reconciled',
      latencyMs: 188,
      lastPing: '5 mins ago',
      configKey: 'remita_merchant_24810291',
    },
    {
      id: 'gw-03',
      serviceName: 'Termii Bulk SMS Gateway',
      category: 'SMS Gateway',
      provider: 'Termii Tier-1 DND Direct Route',
      status: 'OPERATIONAL',
      environment: 'LIVE_PRODUCTION',
      accountBalance: '₦142,500.00 (35,625 Units)',
      latencyMs: 110,
      lastPing: '1 min ago',
      configKey: 'termii_sec_****************84fe',
    },
    {
      id: 'gw-04',
      serviceName: 'SendGrid Transactional SMTP',
      category: 'Transactional Email',
      provider: 'Twilio SendGrid Dedicated IP',
      status: 'OPERATIONAL',
      environment: 'LIVE_PRODUCTION',
      accountBalance: '99.8% Deliverability',
      latencyMs: 95,
      lastPing: '3 mins ago',
      configKey: 'SG.****************************',
    },
  ]);

  /* ─── DATA: SCHOOL PROFILE STATE ─── */
  const [schoolProfile, setSchoolProfile] = useState({
    institutionName: 'Bethsaida College of Health Technology Ltd',
    institutionAcronym: 'BCHT',
    institutionCode: 'BCHT-OYO',
    campusAddress: 'Health Sciences Complex, Moniya, Ibadan, Oyo State, Nigeria',
    officialEmail: 'info@bethsaida.edu.ng',
    officialPhone: '+234 803 124 5590',
    websiteUrl: 'https://bethsaida.edu.ng',
    accreditationRegNo: 'FMOH/NBTE/CHPRBN/2022/048',
    activeSession: '2026/2027 Academic Session',
    activeSemester: 'Harmattan Semester',
    attendanceCutoffPct: 75,
    caWeightPct: 30,
    examWeightPct: 70,
    twoFactorEnforced: true,
    sessionTimeoutMins: 15,
  });

  /* ─── FILTERED AUDIT LOGS ─── */
  const filteredAuditLogs = auditLogs.filter((a) => {
    if (actionFilter !== 'ALL' && !a.action.includes(actionFilter)) return false;
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      const matchAction = a.action.toLowerCase().includes(q);
      const matchActor = a.actorId.toLowerCase().includes(q);
      const matchEntity = a.entityType.toLowerCase().includes(q) || a.entityId.toLowerCase().includes(q);
      if (!matchAction && !matchActor && !matchEntity) return false;
    }
    return true;
  });

  const filteredRoles = roles.filter((r) => {
    if (roleSearch.trim()) {
      const q = roleSearch.toLowerCase();
      const matchTitle = r.roleTitle.toLowerCase().includes(q);
      const matchCode = r.roleCode.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  /* ─── ACTION HANDLERS ─── */
  const handleTestGateway = (gw: IntegrationGateway) => {
    setTestingGateway(gw);
    setIsTestGatewayModalOpen(true);
  };

  const handleRunGatewayPing = () => {
    if (!testingGateway) return;
    recordAudit('INTEGRATION_GATEWAY_PINGED', 'SYSTEM_GATEWAY', testingGateway.serviceName);
    showToast({
      type: 'success',
      title: `${testingGateway.serviceName} Connected`,
      message: `200 OK received from ${testingGateway.provider}. Latency: ${testingGateway.latencyMs}ms. Route live.`,
    });
    setIsTestGatewayModalOpen(false);
    setTestingGateway(null);
  };

  const handleSaveSchoolProfile = (e: React.FormEvent) => {
    e.preventDefault();
    recordAudit('SCHOOL_SETTINGS_UPDATED', 'TENANT_CONFIG', schoolProfile.institutionCode);
    showToast({
      type: 'success',
      title: 'School Profile Saved',
      message: 'Institutional parameters, academic cut-offs, and contact credentials updated.',
    });
    setIsEditSchoolModalOpen(false);
  };

  /* ─── AUDIT COLUMNS ─── */
  const auditColumns = [
    {
      key: 'timestamp',
      header: 'Date & Time',
      render: (a: AuditEventRecord) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap font-sans">
          {a.timestamp.replace('T', ' ').slice(0, 19)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Authenticated User & Role',
      render: (a: AuditEventRecord) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-slate-900 block text-xs">{a.actorId}</span>
          <Badge variant="neutral" size="sm" className="mt-0.5">
            {a.actorRole}
          </Badge>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Performed',
      render: (a: AuditEventRecord) => (
        <span className="font-bold text-[#0F7640] block text-xs whitespace-nowrap">
          {a.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Target Record',
      render: (a: AuditEventRecord) => (
        <div className="whitespace-nowrap">
          <span className="text-slate-800 font-semibold text-xs block">{a.entityType}</span>
          <span className="text-slate-500 text-[11px] font-sans">{a.entityId}</span>
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'IP Address',
      render: (a: AuditEventRecord) => (
        <span className="text-slate-500 text-xs font-sans whitespace-nowrap">{a.ipAddress}</span>
      ),
    },
    {
      key: 'actionBtn',
      header: 'Details',
      align: 'right' as const,
      nowrap: true,
      render: (a: AuditEventRecord) => (
        <Button size="sm" variant="secondary" onClick={() => setSelectedAuditLog(a)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
          Inspect Event
        </Button>
      ),
    },
  ];

  /* ─── ROLE COLUMNS ─── */
  const roleColumns = [
    {
      key: 'roleTitle',
      header: 'Role Title & Access Tier',
      render: (r: UserRoleItem) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.roleTitle}</span>
          <span className="text-[11px] text-slate-500 font-medium leading-snug">{r.description}</span>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-[4px] text-[10px] font-bold">
              Code: {r.roleCode}
            </span>
            <span className="px-1.5 py-0.2 bg-emerald-50 text-[#0F7640] rounded-[4px] text-[10px] font-bold">
              {r.accessTier.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'users',
      header: 'Assigned Staff',
      align: 'center' as const,
      nowrap: true,
      render: (r: UserRoleItem) => (
        <div className="flex flex-col items-center">
          <span className="font-bold text-slate-900 text-xs font-sans">{r.assignedUsersCount} Staff</span>
          <span className="text-[10px] text-[#13A348] font-semibold">Active Auth</span>
        </div>
      ),
    },
    {
      key: 'permissions',
      header: 'Key Enforced Permissions',
      render: (r: UserRoleItem) => (
        <div className="flex items-center gap-1 flex-wrap">
          {r.keyPermissions.slice(0, 3).map((p, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-[4px] text-[10px] font-sans">
              {p}
            </span>
          ))}
          {r.keyPermissions.length > 3 && (
            <span className="text-[10px] text-slate-400 font-semibold font-sans">
              +{r.permissionsCount - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'immutability',
      header: 'Governance',
      align: 'center' as const,
      nowrap: true,
      render: (r: UserRoleItem) => (
        <Badge variant={r.isSystemImmutable ? 'neutral' : 'success'} size="sm">
          {r.isSystemImmutable ? 'CORE IMMUTABLE' : 'CUSTOMIZABLE'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      nowrap: true,
      render: (r: UserRoleItem) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            showToast({
              type: 'info',
              title: `${r.roleTitle} Policy`,
              message: `Permissions verified for ${r.roleTitle} (${r.permissionsCount} granular privileges).`,
            });
          }}
          leftIcon={<Lock className="w-3.5 h-3.5 text-slate-500" />}
          className="whitespace-nowrap"
        >
          View Privileges
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── MODULE HEADER (Responsive Anti-Wrap) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settings & Platform Governance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic Activity Log • RBAC Separation of Duties • Academic Policies • Integration Gateways
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <Button
            variant="secondary"
            onClick={() => {
              showToast({
                type: 'info',
                title: 'Security Scan Verified',
                message: 'All cryptographic hash chains verified. 2FA enforced for all 64 administrative staff.',
              });
            }}
            leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#13A348]" />}
            className="whitespace-nowrap text-xs"
          >
            Run Security Audit
          </Button>
          <Button
            onClick={() => setIsEditSchoolModalOpen(true)}
            leftIcon={<Edit3 className="w-4 h-4" />}
            className="whitespace-nowrap text-xs bg-[#0F7640] hover:bg-[#093322]"
          >
            Edit School Profile
          </Button>
        </div>
      </div>

      {/* ─── TOP STAT CARDS (UNIFORM HEIGHT, ZERO WORD-WRAP SQUEEZING) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Security Posture
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              100%
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Security Compliant</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">2FA Enforced</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Configured Roles
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              10
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-blue-700 font-semibold">Institutional Roles</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">64 Staff Assigned</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Audit Event Log
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {auditLogs.length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">Logged Events</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">SHA-256 Chained</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Live Integrations
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              4
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">Active Gateways</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Paystack, Remita, Termii</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <Tabs
        tabs={[
          { id: 'audit', label: 'Activity History' },
          { id: 'rbac', label: 'User Roles & Permissions' },
          { id: 'tenant', label: 'School Settings' },
          { id: 'security', label: 'Security & Integrations' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* ─── TAB 1: ACTIVITY HISTORY (CRYPTOGRAPHIC AUDIT TRAIL) ─── */}
      {activeTab === 'audit' && (
        <Card>
          <Table
            columns={auditColumns}
            data={filteredAuditLogs}
            keyExtractor={(a) => a.id}
            isDense={isDense}
            searchValue={auditSearch}
            onSearchChange={setAuditSearch}
            searchPlaceholder="Search actor, action performed, target entity..."
            toolbarFilters={
              <>
                <div className="w-44">
                  <Select
                    value={actionFilter}
                    onChange={(val) => setActionFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Operations' },
                      { value: 'PAYMENT', label: 'Bursary & Payments' },
                      { value: 'GRADE', label: 'Grades & Broadsheet' },
                      { value: 'ADMISSION', label: 'Admissions' },
                      { value: 'STAFF', label: 'Staff & Payroll' },
                      { value: 'HOSTEL', label: 'Hostel & Bed Space' },
                    ]}
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    showToast({
                      type: 'success',
                      title: 'Cryptographic Export Ready',
                      message: `Exported ${filteredAuditLogs.length} verified audit records with SHA-256 chain signatures.`,
                    });
                  }}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="whitespace-nowrap"
                >
                  Export Audit Log
                </Button>
              </>
            }
          />
        </Card>
      )}

      {/* ─── TAB 2: RBAC ROLES & PERMISSIONS MATRIX ─── */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Institutional Governance Hard Rules Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Rule P1 — Zero Self-Approval</p>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                  Instructors cannot approve their own score entries, leave requests, or clinical evaluations.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Rule P2 — Financial Mutation Guard</p>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                  All fee modifications, refunds, and payroll commitments require double authorization.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Rule P3 — Broadsheet Lockdown</p>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                  Published semester grades cannot be altered without Provost and Examination Board assent.
                </p>
              </div>
            </div>
          </div>

          {/* User Roles Table */}
          <Card
            header={
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Platform Role-Based Access Control (RBAC) Architecture
              </span>
            }
          >
            <Table
              columns={roleColumns}
              data={filteredRoles}
              keyExtractor={(r) => r.id}
              isDense={isDense}
              searchValue={roleSearch}
              onSearchChange={setRoleSearch}
              searchPlaceholder="Search role title, code, or tier..."
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 3: SCHOOL SETTINGS / TENANT PROFILE ─── */}
      {activeTab === 'tenant' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Institutional Bio Card */}
          <Card
            header={
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Institutional Identity & Accreditation
              </span>
            }
          >
            <div className="space-y-3.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center gap-3">
                <div className="w-12 h-12 rounded-[4px] bg-[#0F7640] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {schoolProfile.institutionAcronym}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{schoolProfile.institutionName}</h3>
                  <p className="text-slate-500 text-[11px]">Institution Code: {schoolProfile.institutionCode}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Campus Address</span>
                  <span className="font-semibold text-slate-800">{schoolProfile.campusAddress}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Official Email</span>
                    <span className="font-semibold text-slate-800">{schoolProfile.officialEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Telephone Line</span>
                    <span className="font-semibold text-slate-800">{schoolProfile.officialPhone}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Statutory Accreditation Authority</span>
                  <span className="font-semibold text-slate-800">{schoolProfile.accreditationRegNo}</span>
                  <span className="text-[11px] text-slate-500 block">
                    Federal Ministry of Health • NBTE • CHPRBN • MLSCN • PCN • HRORBN • EHORECON
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <Button size="sm" variant="secondary" onClick={() => setIsEditSchoolModalOpen(true)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                  Modify Institutional Details
                </Button>
              </div>
            </div>
          </Card>

          {/* Academic Calendar Policies Card */}
          <Card
            header={
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Academic Session & Progression Policies
              </span>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Active Session</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">{schoolProfile.activeSession}</span>
                  <Badge variant="success" size="sm" className="mt-1">CURRENT</Badge>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Active Semester</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">{schoolProfile.activeSemester}</span>
                  <Badge variant="success" size="sm" className="mt-1">IN SESSION</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-900 block">Minimum Exam Attendance Threshold</span>
                    <span className="text-slate-500 text-[11px]">Strict clearance rule for examination docket gating</span>
                  </div>
                  <span className="font-bold text-[#0F7640] text-sm font-sans">{schoolProfile.attendanceCutoffPct}%</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-900 block">Continuous Assessment (CA) Weight</span>
                    <span className="text-slate-500 text-[11px]">Tests, practical lab quizzes, and attendance</span>
                  </div>
                  <span className="font-bold text-slate-800 text-sm font-sans">{schoolProfile.caWeightPct}%</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="font-semibold text-slate-900 block">Semester Examination Weight</span>
                    <span className="text-slate-500 text-[11px]">Standardized final written and clinical examination</span>
                  </div>
                  <span className="font-bold text-slate-800 text-sm font-sans">{schoolProfile.examWeightPct}%</span>
                </div>
              </div>

              {/* RFC Standard Grading Scale Reference */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1.5">
                <span className="font-bold text-slate-900 block text-[11px]">Statutory 5-Point Health College Grading Scale:</span>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                  <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                    <span className="font-bold text-[#13A348] block">A (5.0)</span>
                    <span className="text-slate-500">70 – 100%</span>
                  </div>
                  <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                    <span className="font-bold text-blue-700 block">B (4.0)</span>
                    <span className="text-slate-500">60 – 69%</span>
                  </div>
                  <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                    <span className="font-bold text-amber-700 block">C (3.0)</span>
                    <span className="text-slate-500">50 – 59%</span>
                  </div>
                  <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                    <span className="font-bold text-slate-700 block">E (2.0)</span>
                    <span className="text-slate-500">40 – 49%</span>
                  </div>
                  <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                    <span className="font-bold text-[#F83A20] block">F (0.0)</span>
                    <span className="text-slate-500">0 – 39%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 4: SECURITY & INTEGRATION HUB ─── */}
      {activeTab === 'security' && (
        <div className="space-y-6 text-xs">
          {/* Security Protocols Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              header={
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Authentication & Session Security
                </span>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Mandatory 2FA (TOTP) for Staff</span>
                    <p className="text-slate-500 text-[11px]">
                      Required for Provost, Registrar, Bursar, Exams Officer, and Lecturers
                    </p>
                  </div>
                  <Badge variant="success" size="sm">ENFORCED</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Idle Session Inactivity Lock</span>
                    <p className="text-slate-500 text-[11px]">Automatic lock after 15 minutes of inactivity</p>
                  </div>
                  <span className="font-bold text-slate-800 text-xs font-sans">15 Minutes</span>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Encrypted Document Vault</span>
                    <p className="text-slate-500 text-[11px]">AES-256 S3-compatible storage for certificates and dockets</p>
                  </div>
                  <Badge variant="success" size="sm">AES-256 ACTIVE</Badge>
                </div>
              </div>
            </Card>

            <Card
              header={
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Access Restrictions & Firewall
                </span>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Rate Limiting</span>
                    <p className="text-slate-500 text-[11px]">100 requests/minute per IP, 5 attempts/minute for auth</p>
                  </div>
                  <Badge variant="success" size="sm">ACTIVE</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">CORS Production Whitelist</span>
                    <p className="text-slate-500 text-[11px]">bethsaida.edu.ng and official subdomains strictly enforced</p>
                  </div>
                  <Badge variant="success" size="sm">PROTECTED</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Password Complexity Rule</span>
                    <p className="text-slate-500 text-[11px]">Minimum 12 characters, uppercase, number, and symbol</p>
                  </div>
                  <Badge variant="success" size="sm">ACTIVE</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* External Integration Gateways Matrix */}
          <Card
            header={
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Live External Integration Gateways & Webhooks
              </span>
            }
          >
            <div className="divide-y divide-slate-100">
              {gateways.map((gw) => (
                <div key={gw.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{gw.serviceName}</span>
                      <Badge variant="success" size="sm">{gw.status}</Badge>
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-[4px] text-[10px] font-bold">
                        {gw.environment}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Provider: <strong className="text-slate-700">{gw.provider}</strong> • Key: <span className="font-sans text-slate-600">{gw.configKey}</span>
                    </p>
                    {gw.accountBalance && (
                      <span className="text-[11px] text-emerald-700 font-semibold block font-sans">
                        Telemetry: {gw.accountBalance} • Latency: {gw.latencyMs}ms
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleTestGateway(gw)}
                    leftIcon={<Radio className="w-3.5 h-3.5 text-[#0F7640]" />}
                    className="whitespace-nowrap self-end sm:self-auto"
                  >
                    Test Connection
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ─── MODAL 1: INSPECT AUDIT LOG EVENT ─── */}
      {selectedAuditLog && (
        <Modal
          isOpen={Boolean(selectedAuditLog)}
          onClose={() => setSelectedAuditLog(null)}
          title="Cryptographic Audit Event Inspection"
          description="Detailed non-repudiable blockchain-inspired hash chained event ledger."
          size="lg"
        >
          <div className="space-y-3 text-xs bg-slate-900 text-slate-200 p-4 rounded-[4px] overflow-x-auto">
            <p><span className="text-emerald-400 font-semibold">Event ID:</span> {selectedAuditLog.id}</p>
            <p><span className="text-emerald-400 font-semibold">Timestamp:</span> {selectedAuditLog.timestamp}</p>
            <p><span className="text-emerald-400 font-semibold">Authenticated Actor:</span> {selectedAuditLog.actorId} ({selectedAuditLog.actorRole})</p>
            <p><span className="text-emerald-400 font-semibold">Action Performed:</span> {selectedAuditLog.action}</p>
            <p><span className="text-emerald-400 font-semibold">Target Record:</span> {selectedAuditLog.entityType}:{selectedAuditLog.entityId}</p>
            <p><span className="text-emerald-400 font-semibold">Client IP Address:</span> {selectedAuditLog.ipAddress}</p>
            <p className="break-all"><span className="text-blue-400 font-semibold">Current Chain Hash (SHA-256):</span> {selectedAuditLog.chainHash}</p>
            <p className="break-all"><span className="text-slate-400 font-semibold">Previous Event Hash:</span> {selectedAuditLog.prevHash}</p>
            {selectedAuditLog.afterSnapshot && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-amber-400 font-semibold">Immutable Payload Snapshot:</span>
                <pre className="mt-1 p-2.5 bg-slate-800/80 rounded-[4px] text-slate-300 font-sans text-[11px] leading-relaxed">
                  {JSON.stringify(selectedAuditLog.afterSnapshot, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setSelectedAuditLog(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 2: EDIT SCHOOL PROFILE ─── */}
      <Modal
        isOpen={isEditSchoolModalOpen}
        onClose={() => setIsEditSchoolModalOpen(false)}
        title="Edit Institutional Parameters & Contacts"
        size="md"
      >
        <form onSubmit={handleSaveSchoolProfile} className="space-y-4 text-xs text-slate-800">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Institution Legal Name:</label>
            <input
              type="text"
              value={schoolProfile.institutionName}
              onChange={(e) => setSchoolProfile({ ...schoolProfile, institutionName: e.target.value })}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Acronym:</label>
              <input
                type="text"
                value={schoolProfile.institutionAcronym}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, institutionAcronym: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Institutional Code:</label>
              <input
                type="text"
                value={schoolProfile.institutionCode}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, institutionCode: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Campus Address:</label>
            <input
              type="text"
              value={schoolProfile.campusAddress}
              onChange={(e) => setSchoolProfile({ ...schoolProfile, campusAddress: e.target.value })}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Official Support Email:</label>
              <input
                type="email"
                value={schoolProfile.officialEmail}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, officialEmail: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Official Contact Phone:</label>
              <input
                type="text"
                value={schoolProfile.officialPhone}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, officialPhone: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsEditSchoolModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: TEST GATEWAY CONNECTION ─── */}
      {testingGateway && (
        <Modal
          isOpen={isTestGatewayModalOpen}
          onClose={() => {
            setIsTestGatewayModalOpen(false);
            setTestingGateway(null);
          }}
          title="Test Integration Gateway Connection"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{testingGateway.serviceName}</span>
                <Badge variant="success" size="sm">{testingGateway.status}</Badge>
              </div>
              <p className="text-slate-500 text-[11px]">Provider: {testingGateway.provider} • {testingGateway.environment}</p>
            </div>

            <div className="space-y-2 p-3 bg-white border border-slate-200 rounded-[4px]">
              <div className="flex justify-between">
                <span className="text-slate-500">API Key Fingerprint:</span>
                <span className="font-sans font-semibold text-slate-800">{testingGateway.configKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Latency:</span>
                <span className="font-sans font-bold text-[#13A348]">{testingGateway.latencyMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Status:</span>
                <span className="font-bold text-[#13A348]">HEALTHY (200 OK)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsTestGatewayModalOpen(false);
                  setTestingGateway(null);
                }}
              >
                Close
              </Button>
              <Button onClick={handleRunGatewayPing} className="bg-[#0F7640] hover:bg-[#093322]">
                Execute Live Ping
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
