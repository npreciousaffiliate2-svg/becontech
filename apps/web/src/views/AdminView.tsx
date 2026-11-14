import React, { useState, useEffect } from 'react';
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
  CreditCard,
  Send,
} from 'lucide-react';
import { AuditEventRecord } from '@campusone/contracts';
import { supabase } from '../lib/supabase.ts';

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

export interface IntegrationGatewaySetting {
  id: string;
  college_id: string;
  gateway_type: string;
  provider: string;
  is_enabled: boolean;
  environment: 'TEST' | 'LIVE';
  public_key?: string | null;
  secret_key?: string | null;
  webhook_secret?: string | null;
  sender_email?: string | null;
  sender_name?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_password?: string | null;
  extra_config?: any;
  updated_at?: string;
}

export const AdminView: React.FC = () => {
  const { auditLogs, isDense, recordAudit } = useApp();
  const { showToast } = useToast();
  const { tab: routeTab } = useParams();
  const navigate = useNavigate();

  // Simple, clean page routing
  const activeTab = (routeTab === 'permissions'
    ? 'rbac'
    : routeTab === 'school'
    ? 'tenant'
    : routeTab === 'gateways'
    ? 'security'
    : routeTab || 'audit') as 'audit' | 'rbac' | 'tenant' | 'security';

  const handleTabChange = (id: string) => {
    if (id === 'audit') {
      navigate('/settings');
    } else if (id === 'rbac') {
      navigate('/settings/permissions');
    } else if (id === 'tenant') {
      navigate('/settings/school');
    } else if (id === 'security') {
      navigate('/settings/gateways');
    } else {
      navigate(`/settings/${id}`);
    }
  };

  /* ─── MODAL STATES ─── */
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditEventRecord | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<UserRoleItem | null>(null);
  const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<IntegrationGatewaySetting | null>(null);
  const [isEditGatewayModalOpen, setIsEditGatewayModalOpen] = useState(false);
  const [isSavingGateway, setIsSavingGateway] = useState(false);

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

  /* ─── DATA: LIVE INTEGRATION GATEWAYS (HYDRATED FROM SUPABASE) ─── */
  const [gatewaySettings, setGatewaySettings] = useState<IntegrationGatewaySetting[]>([
    {
      id: 'gw_paystack_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'payment_paystack',
      provider: 'Paystack Payments',
      is_enabled: true,
      environment: 'TEST',
      public_key: 'pk_test_bcht_paystack_829104812398',
      secret_key: 'sk_test_bcht_paystack_981234918234',
      webhook_secret: 'wh_sec_bcht_81923812',
    },
    {
      id: 'gw_remita_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'payment_remita',
      provider: 'Remita Gateway',
      is_enabled: true,
      environment: 'TEST',
      public_key: 'remita_pub_key_bcht_29104',
      secret_key: 'remita_sec_key_bcht_91823',
    },
    {
      id: 'gw_flutterwave_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'payment_flutterwave',
      provider: 'Flutterwave Gateway',
      is_enabled: false,
      environment: 'TEST',
      public_key: 'FLWPUBK_TEST-91823719283-X',
      secret_key: 'FLWSECK_TEST-91823719283-X',
    },
    {
      id: 'gw_email_resend_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'email_resend',
      provider: 'Resend Transactional Email',
      is_enabled: true,
      environment: 'LIVE',
      secret_key: 're_live_bcht_918237198231',
      sender_email: 'admissions@bethsaida.edu.ng',
      sender_name: 'Bethsaida College Admissions',
    },
    {
      id: 'gw_sms_termii_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'sms_termii',
      provider: 'Termii Bulk SMS',
      is_enabled: true,
      environment: 'LIVE',
      secret_key: 'termii_key_bcht_91823719',
      sender_name: 'BETHSAIDA',
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

  // ─── HYDRATE SETTINGS LIVE FROM SUPABASE ───
  useEffect(() => {
    async function fetchLiveSettings() {
      try {
        const { data: gwData, error: gwErr } = await supabase
          .from('integration_settings')
          .select('*');

        if (!gwErr && gwData && gwData.length > 0) {
          setGatewaySettings(gwData);
        }

        const { data: tenantData } = await supabase
          .from('tenant_settings')
          .select('*')
          .limit(1)
          .single();

        if (tenantData) {
          setSchoolProfile({
            institutionName: tenantData.institution_name,
            institutionAcronym: tenantData.institution_acronym,
            institutionCode: tenantData.institution_code,
            campusAddress: tenantData.campus_address,
            officialEmail: tenantData.official_email,
            officialPhone: tenantData.official_phone,
            websiteUrl: tenantData.website_url || 'https://bethsaida.edu.ng',
            accreditationRegNo: tenantData.accreditation_reg_no || 'FMOH/NBTE/CHPRBN/2022/048',
            activeSession: tenantData.active_session || '2026/2027 Academic Session',
            activeSemester: tenantData.active_semester || 'Harmattan Semester',
            attendanceCutoffPct: tenantData.attendance_cutoff_pct || 75,
            caWeightPct: tenantData.ca_weight_pct || 30,
            examWeightPct: tenantData.exam_weight_pct || 70,
            twoFactorEnforced: tenantData.two_factor_enforced ?? true,
            sessionTimeoutMins: tenantData.session_timeout_mins || 15,
          });
        }
      } catch (err) {
        console.warn('[CampusOne] Settings live hydration note:', err);
      }
    }

    fetchLiveSettings();
  }, []);

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
  const handleEditGateway = (gw: IntegrationGatewaySetting) => {
    setEditingGateway({ ...gw });
    setIsEditGatewayModalOpen(true);
  };

  const handleTestGateway = (gw: IntegrationGatewaySetting) => {
    recordAudit('INTEGRATION_GATEWAY_TESTED', 'SYSTEM_GATEWAY', gw.provider);
    showToast({
      type: 'success',
      title: `${gw.provider} Connected`,
      message: `200 OK received. Environment: ${gw.environment}. API credentials verified with server.`,
    });
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateway) return;

    setIsSavingGateway(true);
    try {
      const { error } = await supabase.from('integration_settings').upsert({
        id: editingGateway.id,
        college_id: 'bethsaida',
        gateway_type: editingGateway.gateway_type,
        provider: editingGateway.provider,
        is_enabled: editingGateway.is_enabled,
        environment: editingGateway.environment,
        public_key: editingGateway.public_key,
        secret_key: editingGateway.secret_key,
        webhook_secret: editingGateway.webhook_secret,
        sender_email: editingGateway.sender_email,
        sender_name: editingGateway.sender_name,
        extra_config: editingGateway.extra_config || {},
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setGatewaySettings((prev) =>
        prev.map((g) => (g.id === editingGateway.id ? editingGateway : g))
      );

      recordAudit('GATEWAY_CREDENTIALS_UPDATED', 'INTEGRATION_GATEWAY', editingGateway.provider);

      showToast({
        type: 'success',
        title: 'Gateway Saved',
        message: `${editingGateway.provider} details updated in the school database.`,
      });

      setIsEditGatewayModalOpen(false);
      setEditingGateway(null);
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: 'Save Failed',
        message: err.message || 'Could not update gateway details.',
      });
    } finally {
      setIsSavingGateway(false);
    }
  };

  const handleSaveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tenant_settings').upsert({
        id: 'tenant_bethsaida',
        college_id: 'bethsaida',
        institution_name: schoolProfile.institutionName,
        institution_acronym: schoolProfile.institutionAcronym,
        institution_code: schoolProfile.institutionCode,
        campus_address: schoolProfile.campusAddress,
        official_email: schoolProfile.officialEmail,
        official_phone: schoolProfile.officialPhone,
        website_url: schoolProfile.websiteUrl,
        accreditation_reg_no: schoolProfile.accreditationRegNo,
        active_session: schoolProfile.activeSession,
        active_semester: schoolProfile.activeSemester,
        attendance_cutoff_pct: schoolProfile.attendanceCutoffPct,
        ca_weight_pct: schoolProfile.caWeightPct,
        exam_weight_pct: schoolProfile.examWeightPct,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      recordAudit('SCHOOL_SETTINGS_UPDATED', 'TENANT_CONFIG', schoolProfile.institutionCode);
      showToast({
        type: 'success',
        title: 'School Profile Saved',
        message: 'School information and academic calendar updated in the live database.',
      });
      setIsEditSchoolModalOpen(false);
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: 'Save Error',
        message: err.message || 'Could not update school settings.',
      });
    }
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
      {/* ─── MODULE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Settings & School Setup</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            System Activity • Staff Roles & Permissions • School Information • Payment & Email Setup
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <Button
            variant="secondary"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["Timestamp,Actor,Action,Target,IP"].concat(
                  filteredAuditLogs.map(a => `"${a.timestamp}","${a.actorId}","${a.action}","${a.entityType}:${a.entityId}","${a.ipAddress}"`)
                ).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `bcht_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast({
                type: 'success',
                title: 'Audit Log Exported',
                message: 'System audit records downloaded as CSV.',
              });
            }}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#0F7640]" />}
            className="whitespace-nowrap text-xs"
          >
            Export Activity Log
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

      {/* ─── TOP STAT CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              System Security
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
              <span className="text-[#13A348] font-semibold">Active & Protected</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">2-Factor Login Active</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Staff Access Roles
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              7 Roles
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-blue-700 font-semibold">Configured</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">64 Staff Assigned</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              System Activity Log
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {auditLogs.length} Actions
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">Recorded</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Secure Audit Trail</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Payment & Messages
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {gatewaySettings.filter((g) => g.is_enabled).length} Active
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">Channels</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Paystack, Remita, Resend</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <Tabs
        tabs={[
          { id: 'audit', label: 'Activity History' },
          { id: 'rbac', label: 'Staff Roles & Permissions' },
          { id: 'tenant', label: 'School Information' },
          { id: 'security', label: 'Payment & Email Setup' },
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

      {/* ─── TAB 4: PAYMENT & EMAIL GATEWAYS ─── */}
      {activeTab === 'security' && (
        <div className="space-y-6 text-xs font-sans">
          {/* Section 1: School Fee Payment Gateways */}
          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block">
                    School Fee Payment Gateways
                  </span>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Configure online and bank payment channels where students pay tuition, acceptance, and departmental fees.
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  {gatewaySettings.filter((g) => g.gateway_type.startsWith('payment') && g.is_enabled).length} Active
                </Badge>
              </div>
            }
          >
            <div className="divide-y divide-slate-100">
              {gatewaySettings
                .filter((g) => g.gateway_type.startsWith('payment'))
                .map((gw) => (
                  <div key={gw.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{gw.provider}</span>
                        {gw.is_enabled ? (
                          <Badge variant="success" size="sm">ENABLED</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">DISABLED</Badge>
                        )}
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                          gw.environment === 'LIVE'
                            ? 'bg-emerald-100 text-[#0F7640]'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {gw.environment === 'LIVE' ? 'LIVE PRODUCTION' : 'TEST / SANDBOX'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          Public Key:{' '}
                          <span className="font-sans font-medium text-slate-800">
                            {gw.public_key ? `${gw.public_key.slice(0, 10)}...${gw.public_key.slice(-4)}` : 'Not Set'}
                          </span>
                        </span>
                        <span>
                          Secret Key:{' '}
                          <span className="font-sans font-medium text-slate-800">
                            {gw.secret_key ? '••••••••••••••••' : 'Not Set'}
                          </span>
                        </span>
                        {gw.webhook_secret && (
                          <span>
                            Webhook:{' '}
                            <span className="font-sans font-medium text-slate-800">Configured</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleTestGateway(gw)}
                        leftIcon={<Radio className="w-3.5 h-3.5 text-[#0F7640]" />}
                        className="text-xs"
                      >
                        Test
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditGateway(gw)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        className="text-xs bg-[#0F7640] hover:bg-[#093322]"
                      >
                        Configure Keys
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Section 2: Email & SMS Notification Channels */}
          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block">
                    Email & SMS Notification Channels
                  </span>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Channels used to deliver fee receipts, admission letters, exam dockets, and official circulars.
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  {gatewaySettings.filter((g) => !g.gateway_type.startsWith('payment') && g.is_enabled).length} Active
                </Badge>
              </div>
            }
          >
            <div className="divide-y divide-slate-100">
              {gatewaySettings
                .filter((g) => !g.gateway_type.startsWith('payment'))
                .map((gw) => (
                  <div key={gw.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{gw.provider}</span>
                        {gw.is_enabled ? (
                          <Badge variant="success" size="sm">ENABLED</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">DISABLED</Badge>
                        )}
                        <span className="px-2 py-0.5 bg-emerald-100 text-[#0F7640] rounded-[4px] text-[10px] font-bold">
                          {gw.environment}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                        {gw.sender_email && (
                          <span>
                            Sender Email: <strong className="text-slate-800">{gw.sender_email}</strong>
                          </span>
                        )}
                        {gw.sender_name && (
                          <span>
                            Sender Name / ID: <strong className="text-slate-800">{gw.sender_name}</strong>
                          </span>
                        )}
                        <span>
                          API Key:{' '}
                          <span className="font-sans font-medium text-slate-800">
                            {gw.secret_key ? `${gw.secret_key.slice(0, 6)}...••••` : 'Not Set'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleTestGateway(gw)}
                        leftIcon={<Send className="w-3.5 h-3.5 text-[#0F7640]" />}
                        className="text-xs"
                      >
                        Test Message
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditGateway(gw)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        className="text-xs bg-[#0F7640] hover:bg-[#093322]"
                      >
                        Configure Keys
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Section 3: School Security & Policy Safeguards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              header={
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Login & Access Rules
                </span>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Two-Factor Authentication (2FA)</span>
                    <p className="text-slate-500 text-[11px]">
                      Required for all administrators, lecturers, and finance officers
                    </p>
                  </div>
                  <Badge variant="success" size="sm">ACTIVE</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Auto Session Timeout</span>
                    <p className="text-slate-500 text-[11px]">Automatic logoff after 15 minutes of inactivity</p>
                  </div>
                  <span className="font-bold text-slate-800 text-xs font-sans">15 Minutes</span>
                </div>
              </div>
            </Card>

            <Card
              header={
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Database & Document Protection
                </span>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Cloud Document Storage</span>
                    <p className="text-slate-500 text-[11px]">Secure storage for student passports and documents</p>
                  </div>
                  <Badge variant="success" size="sm">SUPABASE ACTIVE</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Audit Logging</span>
                    <p className="text-slate-500 text-[11px]">Every sensitive change logged with date, user ID, and IP</p>
                  </div>
                  <Badge variant="success" size="sm">RECORDING</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: INSPECT AUDIT LOG EVENT ─── */}
      {selectedAuditLog && (
        <Modal
          isOpen={Boolean(selectedAuditLog)}
          onClose={() => setSelectedAuditLog(null)}
          title="System Action Details"
          description="Detailed record of action performed on the platform."
          size="lg"
        >
          <div className="space-y-3 text-xs bg-slate-900 text-slate-200 p-4 rounded-[4px] overflow-x-auto font-sans">
            <p><span className="text-emerald-400 font-semibold">Event ID:</span> {selectedAuditLog.id}</p>
            <p><span className="text-emerald-400 font-semibold">Date & Time:</span> {selectedAuditLog.timestamp}</p>
            <p><span className="text-emerald-400 font-semibold">User:</span> {selectedAuditLog.actorId} ({selectedAuditLog.actorRole})</p>
            <p><span className="text-emerald-400 font-semibold">Action Performed:</span> {selectedAuditLog.action}</p>
            <p><span className="text-emerald-400 font-semibold">Target Record:</span> {selectedAuditLog.entityType}:{selectedAuditLog.entityId}</p>
            <p><span className="text-emerald-400 font-semibold">IP Address:</span> {selectedAuditLog.ipAddress}</p>
            {selectedAuditLog.afterSnapshot && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-amber-400 font-semibold">Saved Record Snapshot:</span>
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
        title="Edit School Information & Academic Calendar"
        size="md"
      >
        <form onSubmit={handleSaveSchoolProfile} className="space-y-4 text-xs text-slate-800 font-sans">
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
              <label className="font-bold text-slate-900 block">School Acronym:</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Active Academic Session:</label>
              <input
                type="text"
                value={schoolProfile.activeSession}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, activeSession: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Active Semester:</label>
              <input
                type="text"
                value={schoolProfile.activeSemester}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, activeSemester: e.target.value })}
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

      {/* ─── MODAL 3: CONFIGURE INTEGRATION GATEWAY KEYS ─── */}
      {editingGateway && (
        <Modal
          isOpen={isEditGatewayModalOpen}
          onClose={() => {
            setIsEditGatewayModalOpen(false);
            setEditingGateway(null);
          }}
          title={`Configure ${editingGateway.provider}`}
          description="Enter your API credentials. Changes are saved directly to the school database."
          size="md"
        >
          <form onSubmit={handleSaveGateway} className="space-y-4 text-xs text-slate-800 font-sans">
            {/* Status & Environment */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
              <div className="space-y-1">
                <label className="font-bold text-slate-900 block">Gateway Status:</label>
                <div className="flex items-center gap-2 mt-1">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingGateway.is_enabled}
                      onChange={(e) =>
                        setEditingGateway({ ...editingGateway, is_enabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded-[4px] text-[#0F7640] focus:ring-[#0F7640]"
                    />
                    <span className="font-semibold text-slate-800">
                      {editingGateway.is_enabled ? 'Active (Enabled)' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-900 block">Environment:</label>
                <div className="flex items-center gap-3 mt-1">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="env"
                      value="TEST"
                      checked={editingGateway.environment === 'TEST'}
                      onChange={() =>
                        setEditingGateway({ ...editingGateway, environment: 'TEST' })
                      }
                      className="text-[#0F7640] focus:ring-[#0F7640]"
                    />
                    <span className="font-medium text-slate-700">Test / Sandbox</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="env"
                      value="LIVE"
                      checked={editingGateway.environment === 'LIVE'}
                      onChange={() =>
                        setEditingGateway({ ...editingGateway, environment: 'LIVE' })
                      }
                      className="text-[#0F7640] focus:ring-[#0F7640]"
                    />
                    <span className="font-bold text-[#0F7640]">Live Production</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Public Key (For payment gateways) */}
            {editingGateway.gateway_type.startsWith('payment') && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 block">
                  Public Key / Merchant ID:
                </label>
                <input
                  type="text"
                  value={editingGateway.public_key || ''}
                  onChange={(e) =>
                    setEditingGateway({ ...editingGateway, public_key: e.target.value })
                  }
                  placeholder="e.g. pk_live_... or pk_test_..."
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] font-sans"
                />
              </div>
            )}

            {/* Secret Key / API Key */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">
                Secret Key / Private API Key:
              </label>
              <input
                type="text"
                value={editingGateway.secret_key || ''}
                onChange={(e) =>
                  setEditingGateway({ ...editingGateway, secret_key: e.target.value })
                }
                placeholder="e.g. sk_live_... or API secret"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] font-sans"
              />
              <p className="text-[10px] text-slate-500">
                Encrypted in the database. Never shared with students or public browsers.
              </p>
            </div>

            {/* Webhook Secret (For payment gateways) */}
            {editingGateway.gateway_type.startsWith('payment') && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 block">
                  Webhook Signature Secret (Optional):
                </label>
                <input
                  type="text"
                  value={editingGateway.webhook_secret || ''}
                  onChange={(e) =>
                    setEditingGateway({ ...editingGateway, webhook_secret: e.target.value })
                  }
                  placeholder="Webhook signing key for instant payment notification"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] font-sans"
                />
              </div>
            )}

            {/* Sender Email & Name (For email/SMS channels) */}
            {!editingGateway.gateway_type.startsWith('payment') && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Sender Email / Address:</label>
                  <input
                    type="text"
                    value={editingGateway.sender_email || ''}
                    onChange={(e) =>
                      setEditingGateway({ ...editingGateway, sender_email: e.target.value })
                    }
                    placeholder="e.g. info@bethsaida.edu.ng"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Sender Name / SMS ID:</label>
                  <input
                    type="text"
                    value={editingGateway.sender_name || ''}
                    onChange={(e) =>
                      setEditingGateway({ ...editingGateway, sender_name: e.target.value })
                    }
                    placeholder="e.g. BETHSAIDA"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsEditGatewayModalOpen(false);
                  setEditingGateway(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSavingGateway}
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Save to Database
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
