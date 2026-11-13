import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from '@campusone/ui';
import {
  ShieldCheck,
  Lock,
  Download,
} from 'lucide-react';
import { AuditEventRecord } from '@campusone/contracts';

export const AdminView: React.FC = () => {
  const { auditLogs, isDense } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as 'audit' | 'rbac' | 'tenant' | 'security' | null;
  const [activeTab, setActiveTab] = useState<'audit' | 'rbac' | 'tenant' | 'security'>(tabParam || 'audit');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditEventRecord | null>(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (id: string) => {
    setActiveTab(id as any);
    setSearchParams({ tab: id });
  };

  const auditColumns = [
    {
      key: 'timestamp',
      header: 'Date & Time',
      render: (a: AuditEventRecord) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">{a.timestamp.replace('T', ' ').slice(0, 19)}</span>
      ),
    },
    {
      key: 'actor',
      header: 'User & Role',
      render: (a: AuditEventRecord) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-slate-900">{a.actorId}</span>
          <Badge variant="neutral" size="sm" className="ml-1.5">{a.actorRole}</Badge>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Performed',
      render: (a: AuditEventRecord) => <span className="font-semibold text-slate-800 whitespace-nowrap">{a.action.replace(/_/g, ' ')}</span>,
    },
    {
      key: 'entity',
      header: 'Target Record',
      render: (a: AuditEventRecord) => (
        <span className="text-slate-600 font-medium text-xs whitespace-nowrap">{a.entityType}: {a.entityId}</span>
      ),
    },
    {
      key: 'actionBtn',
      header: 'Details',
      align: 'right' as const,
      render: (a: AuditEventRecord) => (
        <Button size="sm" variant="secondary" onClick={() => setSelectedAuditLog(a)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Administration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            System activity history, staff permissions, and school configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            System Verified & Secure
          </Badge>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'audit', label: 'Activity History' },
          { id: 'rbac', label: 'User Roles & Permissions' },
          { id: 'tenant', label: 'School Settings' },
          { id: 'security', label: 'Security & Logins' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab 1: Audit Explorer */}
      {activeTab === 'audit' && (
        <Card>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-sm font-bold text-slate-900">
                System Activity Log
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanent log of all academic, financial, and administrative actions performed across the school.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => showToast({ type: 'info', title: 'Activity Log Exported', message: 'Activity log records exported successfully.' })}
            >
              Export Activity Log
            </Button>
          </div>
          <Table
            columns={auditColumns}
            data={auditLogs}
            keyExtractor={(a) => a.id}
            isDense={isDense}
          />
        </Card>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Enforced Permissions & Hard Rules Matrix
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Governed by PRD Section 3 (Rules P1, P2, P3, P4, P5)
            </p>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-[4px] border border-slate-200 bg-slate-50 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#0A77FE] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Rule P1 — Zero Self-Approval</p>
                <p className="text-slate-500 text-[11px]">
                  A user MUST NOT approve their own score entry, posting evaluation, or leave request.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-[4px] border border-slate-200 bg-slate-50 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#13A348] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Rule P2 — Financial Mutating Operations</p>
                <p className="text-slate-500 text-[11px]">
                  All fee structure changes, reversals, and refunds require explicit <code>fin.write</code> and produce immutable audit events.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-[4px] border border-slate-200 bg-slate-50 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#F83A20] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Rule P3 — Post-Publication Grade Lockdown</p>
                <p className="text-slate-500 text-[11px]">
                  Grades cannot be modified after broadsheet publication without official Exams Officer amendment reason.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Tenant Configuration */}
      {activeTab === 'tenant' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <Card
            header={
              <span className="font-semibold text-slate-900 uppercase tracking-wider">
                Academic Calendar Settings
              </span>
            }
          >
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Active Session</label>
                <Input value="2026/2027 Academic Session" disabled />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Active Semester</label>
                <Input value="Harmattan Semester" disabled />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Exam Eligibility Attendance Cut-off</label>
                <Input value="75% minimum course attendance" disabled />
              </div>
            </div>
          </Card>

          <Card
            header={
              <span className="font-semibold text-slate-900 uppercase tracking-wider">
                Regulatory & Integration Hub Status
              </span>
            }
          >
            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-700">Paystack Payment SPI</span>
                <Badge variant="success">Operational (Live)</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-700">Remita Settlement SPI</span>
                <Badge variant="success">Operational (Live)</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-700">Termii SMS Gateway</span>
                <Badge variant="success">Operational (Live)</Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700">Encrypted Document Vault</span>
                <Badge variant="success">AES-256 S3-Compatible</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              2FA & Authentication Policy
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
              <div>
                <span className="font-semibold text-slate-900">Mandatory 2FA (TOTP) for Staff</span>
                <p className="text-slate-500 text-[11px]">Enforced for Provost, Registrar, Bursar, Exams Officer and Instructors</p>
              </div>
              <Badge variant="success">ENFORCED</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-[4px] bg-slate-50">
              <div>
                <span className="font-semibold text-slate-900">Session Max Inactivity Timeout</span>
                <p className="text-slate-500 text-[11px]">Automatic lock after 15 minutes of inactivity</p>
              </div>
              <Badge variant="neutral">15 MINS</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Inspect Event Modal */}
      {selectedAuditLog && (
        <Modal
          isOpen={!!selectedAuditLog}
          onClose={() => setSelectedAuditLog(null)}
          title="Audit Log Event Inspection"
          description="Detailed immutable cryptographic record of the privileged state transition."
        >
          <div className="space-y-3 text-xs bg-slate-900 text-slate-200 p-4 rounded-[4px] overflow-x-auto">
            <p><span className="text-blue-400 font-semibold">Event ID:</span> {selectedAuditLog.id}</p>
            <p><span className="text-blue-400 font-semibold">Timestamp:</span> {selectedAuditLog.timestamp}</p>
            <p><span className="text-blue-400 font-semibold">Actor:</span> {selectedAuditLog.actorId} ({selectedAuditLog.actorRole})</p>
            <p><span className="text-blue-400 font-semibold">Action:</span> {selectedAuditLog.action}</p>
            <p><span className="text-blue-400 font-semibold">Target:</span> {selectedAuditLog.entityType}:{selectedAuditLog.entityId}</p>
            <p><span className="text-blue-400 font-semibold">IP Address:</span> {selectedAuditLog.ipAddress}</p>
            <p className="break-all"><span className="text-emerald-400 font-semibold">Chain Hash:</span> {selectedAuditLog.chainHash}</p>
            <p className="break-all"><span className="text-slate-400 font-semibold">Prev Hash:</span> {selectedAuditLog.prevHash}</p>
            {selectedAuditLog.afterSnapshot && (
              <div>
                <span className="text-amber-400 font-semibold">Payload Snapshot:</span>
                <pre className="mt-1 p-2 bg-slate-800 rounded-[4px] text-slate-300 font-sans">
                  {JSON.stringify(selectedAuditLog.afterSnapshot, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
