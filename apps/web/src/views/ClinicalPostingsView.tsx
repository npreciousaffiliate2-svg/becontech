import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Input,
  Select,
  useToast,
  Tabs,
} from '@campusone/ui';
import {
  Stethoscope,
  Building,
  CheckCircle2,
  BookOpen,
  Award,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface PostingSite {
  id: string;
  name: string;
  type: 'TEACHING_HOSPITAL' | 'STATE_GENERAL' | 'PRIMARY_HEALTH_CENTRE' | 'SPECIALIST_LAB';
  location: string;
  capacity: number;
  allocatedCount: number;
  supervisorName: string;
}

interface AllocationRecord {
  id: string;
  studentName: string;
  matricNumber: string;
  programme: string;
  siteName: string;
  rotationPeriod: string;
  feeSettled: boolean;
  logbookStatus: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  supervisorScore?: number;
  clearanceGenerated: boolean;
}

export const ClinicalPostingsView: React.FC = () => {
  const { session, recordAudit, isDense } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'allocations' | 'sites' | 'clearance'>('allocations');

  const [sites, setSites] = useState<PostingSite[]>([
    {
      id: 'site-01',
      name: 'University College Hospital (UCH) Ibadan',
      type: 'TEACHING_HOSPITAL',
      location: 'Queen Elizabeth Rd, Ibadan',
      capacity: 40,
      allocatedCount: 36,
      supervisorName: 'Dr. (Mrs) Olukoya, FWACP',
    },
    {
      id: 'site-02',
      name: 'Adeoyo State Hospital, Yemetu',
      type: 'STATE_GENERAL',
      location: 'Yemetu, Ibadan',
      capacity: 30,
      allocatedCount: 28,
      supervisorName: 'Matron A. Adediran',
    },
    {
      id: 'site-03',
      name: 'Ona-Ara Primary Health Care Centre',
      type: 'PRIMARY_HEALTH_CENTRE',
      location: 'Akanran, Oyo State',
      capacity: 25,
      allocatedCount: 22,
      supervisorName: 'Chief CHO S. Oladipo',
    },
  ]);

  const [allocations, setAllocations] = useState<AllocationRecord[]>([
    {
      id: 'alc-01',
      studentName: 'Blessing Adeyemi',
      matricNumber: 'CHE/2026/0014',
      programme: 'CHEW 200L',
      siteName: 'Ona-Ara Primary Health Care Centre',
      rotationPeriod: '24 Nov 2026 – 19 Dec 2026',
      feeSettled: true,
      logbookStatus: 'COMPLETED',
      supervisorScore: 84,
      clearanceGenerated: true,
    },
    {
      id: 'alc-02',
      studentName: 'Emmanuel Chukwuma',
      matricNumber: 'MLT/2026/0029',
      programme: 'MLT 100L',
      siteName: 'Adeoyo State Hospital, Yemetu',
      rotationPeriod: '24 Nov 2026 – 19 Dec 2026',
      feeSettled: true,
      logbookStatus: 'IN_PROGRESS',
      supervisorScore: undefined,
      clearanceGenerated: false,
    },
    {
      id: 'alc-03',
      studentName: 'Khadijat Sani',
      matricNumber: 'PHT/2026/0009',
      programme: 'PharmTech 100L',
      siteName: 'University College Hospital (UCH) Ibadan',
      rotationPeriod: '24 Nov 2026 – 19 Dec 2026',
      feeSettled: false,
      logbookStatus: 'PENDING',
      supervisorScore: undefined,
      clearanceGenerated: false,
    },
  ]);

  const handleGenerateClearance = (recordId: string) => {
    const record = allocations.find((a) => a.id === recordId);
    if (!record) return;

    if (!record.feeSettled) {
      showToast({
        type: 'danger',
        title: 'Clearance Blocked',
        message: 'Posting fee must be settled on the financial ledger before clearance generation (PRD §5.5).',
      });
      return;
    }
    if (record.logbookStatus !== 'COMPLETED' || record.supervisorScore === undefined) {
      showToast({
        type: 'warning',
        title: 'Clearance Prerequisites Incomplete',
        message: 'Supervisor logbook assessment must be finalized first.',
      });
      return;
    }

    setAllocations((prev) =>
      prev.map((a) => (a.id === recordId ? { ...a, clearanceGenerated: true } : a))
    );
    recordAudit('CLINICAL_CLEARANCE_ISSUED', 'CLN_ROTATION', record.matricNumber);
    showToast({
      type: 'success',
      title: 'Clinical Clearance Certificate Issued',
      message: `Verified and registered for ${record.studentName}`,
    });
  };

  const allocationColumns = [
    { key: 'matricNumber', header: 'Matric No.', render: (a: AllocationRecord) => <span className="font-semibold">{a.matricNumber}</span> },
    { key: 'studentName', header: 'Student Name' },
    { key: 'programme', header: 'Programme' },
    { key: 'siteName', header: 'Clinical Site Assigned' },
    { key: 'rotationPeriod', header: 'Rotation Window' },
    {
      key: 'feeSettled',
      header: 'Fee Clearance',
      render: (a: AllocationRecord) => (
        <Badge variant={a.feeSettled ? 'success' : 'danger'}>
          {a.feeSettled ? 'PAID' : 'UNPAID'}
        </Badge>
      ),
    },
    {
      key: 'logbookStatus',
      header: 'E-Logbook',
      render: (a: AllocationRecord) => (
        <Badge variant={a.logbookStatus === 'COMPLETED' ? 'success' : a.logbookStatus === 'IN_PROGRESS' ? 'warning' : 'neutral'}>
          {a.logbookStatus}
        </Badge>
      ),
    },
    {
      key: 'supervisorScore',
      header: 'Assessed Score',
      align: 'right' as const,
      render: (a: AllocationRecord) => (
        a.supervisorScore !== undefined ? (
          <span className="font-bold text-slate-900 font-tabular">{a.supervisorScore}%</span>
        ) : (
          <span className="text-slate-400">Pending</span>
        )
      ),
    },
    {
      key: 'action',
      header: 'Clearance Status',
      align: 'right' as const,
      render: (a: AllocationRecord) =>
        a.clearanceGenerated ? (
          <Badge variant="success">CERTIFIED</Badge>
        ) : (
          <Button size="sm" onClick={() => handleGenerateClearance(a.id)}>
            Generate Clearance
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clinical Postings & SIWES (CLN)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching Hospitals & PHC Registry • Cohort Rotation Engine • E-Logbooks • Regulatory Clearance
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'allocations', label: 'Cohort Rotation Allocations' },
          { id: 'sites', label: 'Clinical Sites Registry' },
          { id: 'clearance', label: 'Board Clearance Dashboard' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => setActiveTab(id)}
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Harmattan 2026/2027 Clinical Posting Allocations
          </span>
          <span className="text-xs text-slate-500">
            Enforces Fee Check, Supervisor Audit & Rule P1
          </span>
        </div>
        <Table
          columns={allocationColumns}
          data={allocations}
          keyExtractor={(a) => a.id}
          isDense={isDense}
        />
      </Card>
    </div>
  );
};
