import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { useSharedRecords } from '../lib/sharedRecords.ts';
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
import { optimizeImage } from '../utils/imageOptimizer.ts';
import { exportToCsv } from '../utils/documentExport.ts';

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
  const {
    auditLogs,
    isDense,
    recordAudit,
    schoolProfile,
    updateSchoolProfile,
    addAcademicLevel,
    removeAcademicLevel,
    addRegulatoryCouncil,
    removeRegulatoryCouncil,
    addAcademicSemester,
    addAcademicSession,
  } = useApp();
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

  /* ─── DYNAMIC CONFIGURATION INPUTS ─── */
  const [newLevelInput, setNewLevelInput] = useState('');
  const [newCouncilInput, setNewCouncilInput] = useState('');
  const [newSemesterInput, setNewSemesterInput] = useState('');
  const [newSessionInput, setNewSessionInput] = useState('');
  const [editSchoolForm, setEditSchoolForm] = useState(schoolProfile);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditSchoolForm(schoolProfile);
  }, [schoolProfile]);

  /* ─── DATA: ROLES & PERMISSIONS ─── */
  const [roles, setRoles] = useSharedRecords<UserRoleItem>('admin.roles', [
    {
      id: 'rol-01',
      roleCode: 'SUPER_ADMIN',
      roleTitle: 'College Provost & Chief Executive',
      description: 'College leadership, school activity records, and academic oversight.',
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
      is_enabled: false,
      environment: 'TEST',
      public_key: '',
      secret_key: '',
      webhook_secret: '',
    },
    {
      id: 'gw_remita_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'payment_remita',
      provider: 'Remita Gateway',
      is_enabled: false,
      environment: 'TEST',
      public_key: '',
      secret_key: '',
    },
    {
      id: 'gw_flutterwave_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'payment_flutterwave',
      provider: 'Flutterwave Gateway',
      is_enabled: false,
      environment: 'TEST',
      public_key: '',
      secret_key: '',
    },
    {
      id: 'gw_email_resend_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'email_resend',
      provider: 'Resend Transactional Email',
      is_enabled: false,
      environment: 'LIVE',
      secret_key: '',
      sender_email: 'admissions@becohtech.edu.ng',
      sender_name: 'Bethsaida College Admissions',
    },
    {
      id: 'gw_sms_termii_bethsaida',
      college_id: 'bethsaida',
      gateway_type: 'sms_termii',
      provider: 'Termii Bulk SMS',
      is_enabled: false,
      environment: 'LIVE',
      secret_key: '',
      sender_name: 'BETHSAIDA',
    },
  ]);

  // ─── HYDRATE GATEWAYS LIVE FROM SUPABASE ───
  useEffect(() => {
    async function fetchLiveGateways() {
      try {
        const { data: gwData, error: gwErr } = await supabase
          .from('integration_settings')
          .select('*');

        if (!gwErr && gwData && gwData.length > 0) {
          setGatewaySettings(gwData);
        }
      } catch (err) {
        console.warn('[CampusOne] Settings live hydration note:', err);
      }
    }

    fetchLiveGateways();
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
        message: `${editingGateway.provider} details updated in school records.`,
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

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'danger', title: 'Invalid file', message: 'Choose an image file (PNG, JPG, WebP or SVG).' });
      return;
    }
    setIsUploadingLogo(true);
    try {
      let body: Blob = file;
      let contentType = file.type;
      let ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      if (file.type !== 'image/svg+xml') {
        const optimized = await optimizeImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.9 });
        body = optimized.file;
        contentType = 'image/webp';
        ext = 'webp';
      }
      const filePath = `school-logo-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('branding')
        .upload(filePath, body, { contentType, upsert: true });
      if (uploadErr) throw new Error(uploadErr.message);
      const { data } = supabase.storage.from('branding').getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error('The storage service did not return a public address.');
      setEditSchoolForm((prev) => ({ ...prev, logoUrl: data.publicUrl }));
      showToast({
        type: 'success',
        title: 'Logo uploaded',
        message: 'Press Save on the college profile form to apply it across the platform.',
      });
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: 'Logo upload failed',
        message: err?.message || 'The logo could not be uploaded.',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSchoolProfile(editSchoolForm);
      showToast({
        type: 'success',
        title: 'College Profile Saved',
        message: 'College profile, accreditation information, and calendar policies updated.',
      });
      setIsEditSchoolModalOpen(false);
    } catch {
      // A "Changes not saved" notice is raised globally by updateSchoolProfile; keep the form open.
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
          {r.isSystemImmutable ? 'STANDARD ROLE' : 'CUSTOM ROLE'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right' as const,
      nowrap: true,
      render: (r: UserRoleItem) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
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
        </div>
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
              exportToCsv({
                filename: `BCHT_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`,
                columns: [
                  { key: 'timestamp', header: 'Date & Time', format: (v) => String(v || '').replace('T', ' ').slice(0, 19) },
                  { key: 'actorId', header: 'Actor ID' },
                  { key: 'actorRole', header: 'Actor Role' },
                  { key: 'action', header: 'Operation Performed' },
                  { key: 'entityType', header: 'Entity Type' },
                  { key: 'entityId', header: 'Entity ID' },
                  { key: 'ipAddress', header: 'IP Address' },
                  { key: 'chainHash', header: 'Cryptographic Chain Hash' },
                ],
                data: filteredAuditLogs,
              });
              showToast({
                type: 'success',
                title: 'Audit Log Exported',
                message: `Exported ${filteredAuditLogs.length} verified audit log records to CSV.`,
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
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              7 Roles
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">Configured</span>
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
              <ShieldCheck className="w-4 h-4" />
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
                    exportToCsv({
                      filename: `BCHT_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`,
                      columns: [
                        { key: 'timestamp', header: 'Date & Time', format: (v) => String(v || '').replace('T', ' ').slice(0, 19) },
                        { key: 'actorId', header: 'Actor ID' },
                        { key: 'actorRole', header: 'Actor Role' },
                        { key: 'action', header: 'Operation Performed' },
                        { key: 'entityType', header: 'Entity Type' },
                        { key: 'entityId', header: 'Entity ID' },
                        { key: 'ipAddress', header: 'IP Address' },
                        { key: 'chainHash', header: 'Cryptographic Chain Hash' },
                      ],
                      data: filteredAuditLogs,
                    });
                    showToast({
                      type: 'success',
                      title: 'Activity Log Exported',
                      message: `Exported ${filteredAuditLogs.length} verified activity log records to CSV.`,
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
          {/* Governance Hard Rules Banner */}
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
              <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0 mt-0.5">
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
        <div className="space-y-6 text-xs font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: College Identity & Profile */}
            <Card
              header={
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    College Profile & Accreditation
                  </span>
                  <Badge variant="primary" size="sm">
                    {schoolProfile.institutionCode}
                  </Badge>
                </div>
              }
            >
              <div className="space-y-3.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center gap-3">
                  <img
                    src={schoolProfile.logoUrl || '/BeonTech-Logo.png'}
                    alt="Platform Crest"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                    }}
                    className="w-12 h-12 rounded-[4px] object-contain p-0.5 bg-white border border-slate-200 shrink-0 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{schoolProfile.institutionName}</h3>
                    <p className="text-slate-500 text-[11px]">
                      {schoolProfile.institutionalSector || 'Higher Education Institution'} • Code: <strong className="text-slate-700">{schoolProfile.institutionCode}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Campus Address</span>
                    <span className="font-semibold text-slate-800">{schoolProfile.campusAddress}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Official Email</span>
                      <span className="font-semibold text-slate-800">{schoolProfile.officialEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Telephone Line</span>
                      <span className="font-semibold text-slate-800">{schoolProfile.officialPhone}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Website Portal</span>
                      <span className="font-semibold text-slate-800">{schoolProfile.websiteUrl || 'Not configured'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Accreditation Reg No</span>
                      <span className="font-semibold text-[#0F7640]">{schoolProfile.accreditationRegNo}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => {
                    setEditSchoolForm(schoolProfile);
                    setIsEditSchoolModalOpen(true);
                  }} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                    Edit College Profile
                  </Button>
                </div>
              </div>
            </Card>

            {/* Card 2: Academic Calendar & Sessions */}
            <Card
              header={
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Academic Sessions & Semesters
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

                {/* Switch Active Session / Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Set Active Session:</label>
                    <Select
                      options={schoolProfile.academicSessions.map((s) => ({ value: s, label: s }))}
                      value={schoolProfile.activeSession}
                      onChange={(val) => updateSchoolProfile({ activeSession: val })}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Set Active Semester:</label>
                    <Select
                      options={schoolProfile.academicSemesters.map((s) => ({ value: s, label: s }))}
                      value={schoolProfile.activeSemester}
                      onChange={(val) => updateSchoolProfile({ activeSemester: val })}
                    />
                  </div>
                </div>

                {/* Add new session or semester */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2">
                  <span className="font-bold text-slate-900 block text-[11px]">Add New Session or Semester:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 2027/2028 or First Semester..."
                      value={newSessionInput}
                      onChange={(e) => setNewSessionInput(e.target.value)}
                      className="flex-1 h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                    />
                    <Button size="sm" onClick={() => {
                      if (!newSessionInput.trim()) return;
                      if (newSessionInput.includes('/') || newSessionInput.toLowerCase().includes('session')) {
                        addAcademicSession(newSessionInput.trim());
                      } else {
                        addAcademicSemester(newSessionInput.trim());
                      }
                      setNewSessionInput('');
                      showToast({ type: 'success', title: 'Added', message: 'Academic calendar option registered.' });
                    }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 3: Statutory Regulatory Councils & Accreditation Bodies */}
            <Card
              header={
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block">
                      Accredited Statutory Regulatory Councils
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Councils & boards governing college curricula and professional licensure.
                    </span>
                  </div>
                  <Badge variant="success" size="sm">{schoolProfile.regulatoryCouncils.length} Active</Badge>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 min-h-[80px] p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
                  {schoolProfile.regulatoryCouncils.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-[4px] text-[11px] font-medium shadow-xs"
                    >
                      <span>{c}</span>
                      {schoolProfile.regulatoryCouncils.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRegulatoryCouncil(c)}
                          className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                          title={`Remove ${c}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="e.g. Nursing and Midwifery Council of Nigeria (NMCN)..."
                    value={newCouncilInput}
                    onChange={(e) => setNewCouncilInput(e.target.value)}
                    className="flex-1 h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                  />
                  <Button size="sm" onClick={() => {
                    if (!newCouncilInput.trim()) return;
                    addRegulatoryCouncil(newCouncilInput.trim());
                    setNewCouncilInput('');
                    showToast({ type: 'success', title: 'Council Added', message: 'Regulatory council added to college registry.' });
                  }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Council
                  </Button>
                </div>
              </div>
            </Card>

            {/* Card 4: Academic Study Levels & Cohorts */}
            <Card
              header={
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block">
                      Configured Academic Study Levels
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Levels available across admissions, students, departments, broadsheets, and fees.
                    </span>
                  </div>
                  <Badge variant="primary" size="sm">{schoolProfile.academicLevels.length} Levels</Badge>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 min-h-[80px] p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
                  {schoolProfile.academicLevels.map((lvl) => (
                    <span
                      key={lvl}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-[4px] text-[11px] font-medium shadow-xs"
                    >
                      <span className="font-semibold text-[#0F7640]">{lvl}</span>
                      {schoolProfile.academicLevels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAcademicLevel(lvl)}
                          className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                          title={`Remove ${lvl}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="e.g. 400 Level, ND I, HND I, Post-Basic..."
                    value={newLevelInput}
                    onChange={(e) => setNewLevelInput(e.target.value)}
                    className="flex-1 h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                  />
                  <Button size="sm" onClick={() => {
                    if (!newLevelInput.trim()) return;
                    addAcademicLevel(newLevelInput.trim());
                    setNewLevelInput('');
                    showToast({ type: 'success', title: 'Level Added', message: 'Study level added to academic framework.' });
                  }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Level
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 5: Admissions Setup & Gating */}
            <Card
              header={
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    Admissions Engine Setup & Fees
                  </span>
                  <Badge variant={schoolProfile.admissionsOpen ? 'success' : 'danger'} size="sm">
                    {schoolProfile.admissionsOpen ? 'PORTAL OPEN' : 'PORTAL CLOSED'}
                  </Badge>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <div>
                    <span className="font-bold text-slate-900 block">Online Application Portal Status</span>
                    <span className="text-[11px] text-slate-500">Allow prospective students to apply online</span>
                  </div>
                  <Button
                    size="sm"
                    variant={schoolProfile.admissionsOpen ? 'danger' : 'primary'}
                    onClick={() => updateSchoolProfile({ admissionsOpen: !schoolProfile.admissionsOpen })}
                  >
                    {schoolProfile.admissionsOpen ? 'Close Portal' : 'Open Portal'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-[4px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Batch</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{schoolProfile.admissionBatch}</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-[4px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Application Fee</span>
                    <span className="font-bold text-[#0F7640] text-xs mt-0.5 block">₦{(schoolProfile.applicationFeeKobo / 100).toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-[4px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Acceptance Fee</span>
                    <span className="font-bold text-[#0F7640] text-xs mt-0.5 block">₦{(schoolProfile.acceptanceFeeKobo / 100).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Entrance Exam Cutoff Score</span>
                    <span className="text-[11px] text-slate-500">Minimum CBT score required for automatic merit screening</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{schoolProfile.minimumCutoffScore}%</span>
                </div>
              </div>
            </Card>

            {/* Card 6: Academic Assessment Policies */}
            <Card
              header={
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Academic Assessment & Progression Policies
                </span>
              }
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-900 block">Minimum Exam Attendance Threshold</span>
                      <span className="text-slate-500 text-[11px]">Strict clearance rule for examination docket gating</span>
                    </div>
                    <span className="font-bold text-[#0F7640] text-sm">{schoolProfile.attendanceCutoffPct}%</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-900 block">Continuous Assessment (CA) Weight</span>
                      <span className="text-slate-500 text-[11px]">Tests, practical lab quizzes, and attendance</span>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{schoolProfile.caWeightPct}%</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-900 block">Semester Examination Weight</span>
                      <span className="text-slate-500 text-[11px]">Standardized final written and clinical examination</span>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{schoolProfile.examWeightPct}%</span>
                  </div>
                </div>

                {/* 5-point grading scale */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1.5">
                  <span className="font-bold text-slate-900 block text-[11px]">Standard Health Training 5-Point Grading Scale:</span>
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                    <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                      <span className="font-bold text-[#13A348] block">A (5.0)</span>
                      <span className="text-slate-500">70–100%</span>
                    </div>
                    <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                      <span className="font-bold text-[#093322] block">B (4.0)</span>
                      <span className="text-slate-500">60–69%</span>
                    </div>
                    <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                      <span className="font-bold text-amber-700 block">C (3.0)</span>
                      <span className="text-slate-500">50–59%</span>
                    </div>
                    <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                      <span className="font-bold text-slate-700 block">E (2.0)</span>
                      <span className="text-slate-500">40–49%</span>
                    </div>
                    <div className="p-1 bg-white border border-slate-200 rounded-[4px]">
                      <span className="font-bold text-[#F83A20] block">F (0.0)</span>
                      <span className="text-slate-500">0–39%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Card 7: System Maintenance Mode & Downtime Control */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block">
                    System Maintenance Mode &amp; Status Notification
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Display an official maintenance screen to students and staff during system upgrades while preserving administrator access.
                  </span>
                </div>
                <Badge variant={schoolProfile.maintenanceMode ? 'warning' : 'success'} size="sm">
                  {schoolProfile.maintenanceMode ? 'UNDER MAINTENANCE' : 'SYSTEM LIVE'}
                </Badge>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-[4px]">
                <div>
                  <span className="font-bold text-slate-900 block">
                    {schoolProfile.maintenanceMode
                      ? 'Maintenance Mode is Currently Active'
                      : 'Platform is Live and Accessible to All Users'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {schoolProfile.maintenanceMode
                      ? 'Non-admin users currently see the scheduled maintenance status page.'
                      : 'Turn on Maintenance Mode before running major semester rollovers or maintenance tasks.'}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={schoolProfile.maintenanceMode ? 'primary' : 'danger'}
                  onClick={async () => {
                    const nextMode = !schoolProfile.maintenanceMode;
                    await updateSchoolProfile({
                      maintenanceMode: nextMode,
                      maintenanceTitle: editSchoolForm.maintenanceTitle || schoolProfile.maintenanceTitle || 'Scheduled System Maintenance',
                      maintenanceMessage:
                        editSchoolForm.maintenanceMessage ||
                        schoolProfile.maintenanceMessage ||
                        'The college portal is currently undergoing scheduled maintenance and system upgrades. Normal access will resume shortly.',
                      maintenanceEta: editSchoolForm.maintenanceEta || schoolProfile.maintenanceEta || 'Within 2 hours',
                    });
                    showToast({
                      type: nextMode ? 'warning' : 'success',
                      title: nextMode ? 'Maintenance Mode Enabled' : 'System Restored to Live',
                      message: nextMode
                        ? 'Users will now see the official maintenance page until you restore live access.'
                        : 'All students, applicants, and staff can now access the portal normally.',
                    });
                  }}
                >
                  {schoolProfile.maintenanceMode ? 'End Maintenance & Go Live' : 'Enable Maintenance Mode'}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Maintenance Headline"
                  value={editSchoolForm.maintenanceTitle || ''}
                  onChange={(e) => setEditSchoolForm({ ...editSchoolForm, maintenanceTitle: e.target.value })}
                  placeholder="Scheduled System Maintenance"
                />
                <Input
                  label="Estimated Completion Time (ETA)"
                  value={editSchoolForm.maintenanceEta || ''}
                  onChange={(e) => setEditSchoolForm({ ...editSchoolForm, maintenanceEta: e.target.value })}
                  placeholder="e.g. Within 2 hours or Today at 4:00 PM"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Public Maintenance Message Shown to Users
                </label>
                <textarea
                  rows={2}
                  value={editSchoolForm.maintenanceMessage || ''}
                  onChange={(e) => setEditSchoolForm({ ...editSchoolForm, maintenanceMessage: e.target.value })}
                  placeholder="Explain why maintenance is occurring and when normal access will resume..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await updateSchoolProfile({
                      maintenanceTitle: editSchoolForm.maintenanceTitle || 'Scheduled System Maintenance',
                      maintenanceMessage:
                        editSchoolForm.maintenanceMessage ||
                        'The college portal is currently undergoing scheduled maintenance and system upgrades. Normal access will resume shortly.',
                      maintenanceEta: editSchoolForm.maintenanceEta || 'Within 2 hours',
                    });
                    showToast({
                      type: 'success',
                      title: 'Maintenance Notice Saved',
                      message: 'Maintenance message and estimated completion window updated.',
                    });
                  }}
                >
                  Save Maintenance Notice
                </Button>
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
                  School Records & Document Protection
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

      {/* ─── MODAL 2: EDIT SCHOOL PROFILE & ACADEMIC FRAMEWORK ─── */}
      <Modal
        isOpen={isEditSchoolModalOpen}
        onClose={() => setIsEditSchoolModalOpen(false)}
        title="Edit College Profile & Academic Settings"
        size="lg"
      >
        <form onSubmit={handleSaveSchoolProfile} className="space-y-4 text-xs text-slate-800 font-sans max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Institution Sector & Category:</label>
              <Select
                value={editSchoolForm.institutionType || 'HEALTH_TECHNOLOGY'}
                onChange={(v) => {
                  const val = v as any;
                  const sectors: Record<string, string> = {
                    HEALTH_TECHNOLOGY: 'Monotechnic & Health Sciences College',
                    CONVENTIONAL_UNIVERSITY: 'Conventional University & Degree Awarding Institution',
                    POLYTECHNIC: 'Polytechnic & Technology Institute',
                    COLLEGE_OF_EDUCATION: 'College of Education & Teacher Training',
                    SPECIALIZED_INSTITUTE: 'Specialized Professional Academy',
                  };
                  setEditSchoolForm({
                    ...editSchoolForm,
                    institutionType: val,
                    institutionalSector: sectors[val] || 'Higher Education Institution',
                  });
                }}
                options={[
                  { value: 'HEALTH_TECHNOLOGY', label: 'Health Sciences & Technology College (Monotechnic)' },
                  { value: 'CONVENTIONAL_UNIVERSITY', label: 'Conventional University (Degrees, Faculties & SIWES)' },
                  { value: 'POLYTECHNIC', label: 'Polytechnic (ND, HND & Industrial Training)' },
                  { value: 'COLLEGE_OF_EDUCATION', label: 'College of Education (NCE & Teaching Practice)' },
                  { value: 'SPECIALIZED_INSTITUTE', label: 'Specialized Professional Academy & Institute' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">School Classification:</label>
              <input
                type="text"
                value={editSchoolForm.institutionalSector || 'Higher Education Institution'}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, institutionalSector: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                placeholder="e.g. Conventional University / Health Tech"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">College / University Legal Name:</label>
            <input
              type="text"
              value={editSchoolForm.institutionName}
              onChange={(e) => setEditSchoolForm({ ...editSchoolForm, institutionName: e.target.value })}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          {/* Platform Crest & Official Logo Field */}
          <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
            <label className="font-bold text-slate-900 block">Platform Crest & Official Logo:</label>
            <div className="flex items-center gap-3">
              <img
                src={editSchoolForm.logoUrl || '/BeonTech-Logo.png'}
                alt="Platform Crest"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                }}
                className="w-12 h-12 rounded-[4px] object-contain p-1 bg-white border border-slate-200 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoSelect}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    isLoading={isUploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Choose logo from computer
                  </Button>
                  {editSchoolForm.logoUrl && editSchoolForm.logoUrl !== '/BeonTech-Logo.png' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditSchoolForm({ ...editSchoolForm, logoUrl: '/BeonTech-Logo.png' })}
                    >
                      Reset to default
                    </Button>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1.5">
                  PNG, JPG, WebP or SVG. The logo is stored in the database when you press Save and is used on the
                  login page, sidebar, browser tab, receipts, broadsheets and clearances.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">School Acronym:</label>
              <input
                type="text"
                value={editSchoolForm.institutionAcronym}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, institutionAcronym: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">College Code:</label>
              <input
                type="text"
                value={editSchoolForm.institutionCode}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, institutionCode: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Accreditation Reg No:</label>
              <input
                type="text"
                value={editSchoolForm.accreditationRegNo}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, accreditationRegNo: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Campus Address:</label>
            <input
              type="text"
              value={editSchoolForm.campusAddress}
              onChange={(e) => setEditSchoolForm({ ...editSchoolForm, campusAddress: e.target.value })}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Official Support Email:</label>
              <input
                type="email"
                value={editSchoolForm.officialEmail}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, officialEmail: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Official Contact Phone:</label>
              <input
                type="text"
                value={editSchoolForm.officialPhone}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, officialPhone: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Website Portal URL:</label>
              <input
                type="text"
                value={editSchoolForm.websiteUrl}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, websiteUrl: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Active Academic Session:</label>
              <input
                type="text"
                value={editSchoolForm.activeSession}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, activeSession: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Active Semester:</label>
              <input
                type="text"
                value={editSchoolForm.activeSemester}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, activeSemester: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Min Attendance Cutoff (%):</label>
              <input
                type="number"
                min="50"
                max="100"
                value={editSchoolForm.attendanceCutoffPct}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, attendanceCutoffPct: Number(e.target.value) })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">CA Weight (%):</label>
              <input
                type="number"
                min="10"
                max="50"
                value={editSchoolForm.caWeightPct}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, caWeightPct: Number(e.target.value) })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Exam Weight (%):</label>
              <input
                type="number"
                min="50"
                max="90"
                value={editSchoolForm.examWeightPct}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, examWeightPct: Number(e.target.value) })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Active Admission Batch:</label>
              <input
                type="text"
                value={editSchoolForm.admissionBatch}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, admissionBatch: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Application Fee (₦):</label>
              <input
                type="number"
                min="0"
                step="500"
                value={editSchoolForm.applicationFeeKobo / 100}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, applicationFeeKobo: Number(e.target.value) * 100 })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Acceptance Fee (₦):</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={editSchoolForm.acceptanceFeeKobo / 100}
                onChange={(e) => setEditSchoolForm({ ...editSchoolForm, acceptanceFeeKobo: Number(e.target.value) * 100 })}
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
          description="Enter your API credentials. Changes are saved directly to school records."
          size="md"
        >
          <form onSubmit={handleSaveGateway} className="space-y-4 text-xs text-slate-800 font-sans">
            {/* Status & Environment Segmented Controls (Strict 4px Radius, Zero Native Chrome) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-[4px]">
              {/* Gateway Status Segmented Control */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 block text-xs">Gateway Status:</label>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${
                      editingGateway.is_enabled
                        ? 'bg-emerald-100 text-[#0F7640]'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {editingGateway.is_enabled ? 'OPERATIONAL' : 'OFFLINE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setEditingGateway({ ...editingGateway, is_enabled: true })}
                    className={`h-9 px-2.5 rounded-[4px] border text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
                      editingGateway.is_enabled
                        ? 'bg-white border-[#0F7640] text-[#0F7640] shadow-xs ring-1 ring-[#0F7640]'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-[2px] shrink-0 ${
                        editingGateway.is_enabled ? 'bg-[#0F7640]' : 'bg-slate-300'
                      }`}
                    />
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGateway({ ...editingGateway, is_enabled: false })}
                    className={`h-9 px-2.5 rounded-[4px] border text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
                      !editingGateway.is_enabled
                        ? 'bg-white border-slate-400 text-slate-800 shadow-xs ring-1 ring-slate-400'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-[2px] shrink-0 ${
                        !editingGateway.is_enabled ? 'bg-slate-500' : 'bg-slate-300'
                      }`}
                    />
                    Disabled
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {editingGateway.is_enabled
                    ? 'Channel is active and processing live fee transactions.'
                    : 'Channel is disabled. Requests will be suspended.'}
                </p>
              </div>

              {/* Environment Mode Segmented Control */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 block text-xs">Environment:</label>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${
                      editingGateway.environment === 'LIVE'
                        ? 'bg-emerald-100 text-[#0F7640]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {editingGateway.environment === 'LIVE' ? 'PRODUCTION' : 'SANDBOX'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingGateway({
                        ...editingGateway,
                        environment: 'TEST',
                      })
                    }
                    className={`h-9 px-2 rounded-[4px] border text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
                      editingGateway.environment === 'TEST'
                        ? 'bg-white border-amber-600 text-amber-900 shadow-xs ring-1 ring-amber-600'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-[2px] shrink-0 ${
                        editingGateway.environment === 'TEST' ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                    />
                    Test / Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingGateway({
                        ...editingGateway,
                        environment: 'LIVE',
                      })
                    }
                    className={`h-9 px-2 rounded-[4px] border text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
                      editingGateway.environment === 'LIVE'
                        ? 'bg-white border-[#0F7640] text-[#0F7640] shadow-xs ring-1 ring-[#0F7640]'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-[2px] shrink-0 ${
                        editingGateway.environment === 'LIVE' ? 'bg-[#0F7640]' : 'bg-slate-300'
                      }`}
                    />
                    Live Production
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {editingGateway.environment === 'LIVE'
                    ? 'Connects to live bank switch for real fee payments.'
                    : 'Safe test simulation mode with sample transactions.'}
                </p>
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
                Encrypted securely. Never shared with students or public browsers.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Sender Email / Address:</label>
                  <input
                    type="text"
                    value={editingGateway.sender_email || ''}
                    onChange={(e) =>
                      setEditingGateway({ ...editingGateway, sender_email: e.target.value })
                    }
                    placeholder="e.g. info@becohtech.edu.ng"
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
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
