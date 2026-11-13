import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
} from '@campusone/ui';
import { Download } from 'lucide-react';

interface Candidate {
  id: string;
  applicationNumber: string;
  fullName: string;
  programme: string;
  olevelStatus: 'VERIFIED' | 'PENDING' | 'DEFICIENT';
  cbtScore: number;
  status: 'APPLIED' | 'SCREENED' | 'ADMITTED' | 'MATRICULATED';
  matricNumber?: string;
}

export const AdmissionsView: React.FC = () => {
  const { recordAudit, isDense } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as 'applications' | 'screening' | 'admission_lists' | null;
  const [activeTab, setActiveTab] = useState<'applications' | 'screening' | 'admission_lists'>(tabParam || 'applications');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (id: string) => {
    setActiveTab(id as any);
    setSearchParams({ tab: id });
  };

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 'app-01',
      applicationNumber: 'APP/2026/0142',
      fullName: 'Amina Yusuf',
      programme: 'Community Health Extension Worker (CHEW)',
      olevelStatus: 'VERIFIED',
      cbtScore: 78,
      status: 'SCREENED',
    },
    {
      id: 'app-02',
      applicationNumber: 'APP/2026/0143',
      fullName: 'David Adeleke',
      programme: 'Medical Laboratory Technician (MLT)',
      olevelStatus: 'VERIFIED',
      cbtScore: 82,
      status: 'SCREENED',
    },
    {
      id: 'app-03',
      applicationNumber: 'APP/2026/0144',
      fullName: 'Zainab Bello',
      programme: 'Pharmacy Technician',
      olevelStatus: 'VERIFIED',
      cbtScore: 71,
      status: 'ADMITTED',
      matricNumber: 'PHT/2026/0018',
    },
    {
      id: 'app-04',
      applicationNumber: 'APP/2026/0145',
      fullName: 'Sunday Okon',
      programme: 'Health Information Management (HIM)',
      olevelStatus: 'PENDING',
      cbtScore: 54,
      status: 'APPLIED',
    },
  ]);

  const handleAdmitCandidate = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const serial = Math.floor(10 + Math.random() * 89);
          const progCode = c.programme.includes('CHEW') ? 'CHE' : c.programme.includes('MLT') ? 'MLT' : 'PHT';
          const matricNumber = `${progCode}/2026/00${serial}`;
          recordAudit('CANDIDATE_ADMITTED', 'ADM_CANDIDATE', c.applicationNumber, { matricNumber });
          return { ...c, status: 'ADMITTED', matricNumber };
        }
        return c;
      })
    );
    showToast({
      type: 'success',
      title: 'Candidate Admitted',
      message: 'Matriculation number generated and acceptance fee invoice emitted.',
    });
  };

  const columns = [
    { key: 'applicationNumber', header: 'App No.', render: (c: Candidate) => <span className="font-semibold text-slate-900">{c.applicationNumber}</span> },
    { key: 'fullName', header: 'Applicant Full Name' },
    { key: 'programme', header: 'Applied Programme' },
    {
      key: 'olevelStatus',
      header: "O'Level Check",
      render: (c: Candidate) => (
        <Badge variant={c.olevelStatus === 'VERIFIED' ? 'success' : c.olevelStatus === 'PENDING' ? 'warning' : 'danger'}>
          {c.olevelStatus}
        </Badge>
      ),
    },
    { key: 'cbtScore', header: 'CBT Score', align: 'right' as const, render: (c: Candidate) => <span className="font-bold text-slate-900">{c.cbtScore}%</span> },
    {
      key: 'status',
      header: 'Status',
      render: (c: Candidate) => (
        <Badge variant={c.status === 'ADMITTED' ? 'primary' : 'neutral'}>
          {c.status}
        </Badge>
      ),
    },
    {
      key: 'matricNumber',
      header: 'Matric No.',
      render: (c: Candidate) => (
        c.matricNumber ? <span className="font-bold text-[#0A77FE]">{c.matricNumber}</span> : <span className="text-slate-400">—</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      render: (c: Candidate) =>
        c.status === 'SCREENED' ? (
          <Button size="sm" onClick={() => handleAdmitCandidate(c.id)}>
            Grant Admission
          </Button>
        ) : (
          <Button size="sm" variant="ghost" disabled>
            Processed
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admissions & Enrollment</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Student applications, screening tests, and admission lists
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => showToast({ type: 'info', title: 'Export Generated', message: 'Batch 2026 Admission List exported to Excel/CSV' })}
          >
            Export List
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'applications', label: 'All Applications' },
          { id: 'screening', label: 'Screening & Tests' },
          { id: 'admission_lists', label: 'Admission Lists' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            2026/2027 Admission Screening Queue
          </span>
          <span className="text-xs text-slate-500">
            Rule §5.1: Serialized &lt;PROGRAMME&gt;/&lt;YEAR&gt;/&lt;SERIAL&gt;
          </span>
        </div>
        <Table
          columns={columns}
          data={candidates}
          keyExtractor={(c) => c.id}
          isDense={isDense}
        />
      </Card>
    </div>
  );
};
