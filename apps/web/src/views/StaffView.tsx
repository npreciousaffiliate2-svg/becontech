import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
} from '@campusone/ui';
import { Briefcase, FileCheck, Lock, CheckCircle } from 'lucide-react';
import { formatNaira } from '@campusone/contracts';

export const StaffView: React.FC = () => {
  const { isDense, recordAudit } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'directory' | 'payroll' | 'leave'>('directory');
  const [isPayrollLocked, setIsPayrollLocked] = useState(false);

  const staffMembers = [
    {
      id: 'stf-01',
      fullName: 'Dr. Kehinde Bello, MBBS, MPH',
      designation: 'Senior Lecturer & HOD Community Health',
      licenseBody: 'MDCN / CHPRBN',
      licenseNumber: 'MDCN/R/48291',
      licenseExpiry: '2028-04-30',
      status: 'ACTIVE',
    },
    {
      id: 'stf-02',
      fullName: 'Mr. Olumide Adebisi, AIMLS',
      designation: 'Chief Medical Lab Scientist & HOD MLT',
      licenseBody: 'MLSCN',
      licenseNumber: 'MLSCN/P/19402',
      licenseExpiry: '2027-11-15',
      status: 'ACTIVE',
    },
    {
      id: 'stf-03',
      fullName: 'Pharm. Grace Okoro, B.Pharm',
      designation: 'Lecturer I, Pharmacy Technician Dept',
      licenseBody: 'PCN',
      licenseNumber: 'PCN/REG/88120',
      licenseExpiry: '2027-08-20',
      status: 'ACTIVE',
    },
  ];

  const handleLockPayroll = () => {
    setIsPayrollLocked(true);
    recordAudit('PAYROLL_RUN_LOCKED', 'HRM_PAYROLL', 'PAYROLL-NOV-2026');
    showToast({
      type: 'success',
      title: 'November 2026 Payroll Run Locked & Audited',
      message: 'Net payout ₦18,450,000 computed with PAYE & Pension statutory schedules generated.',
    });
  };

  const staffColumns = [
    { key: 'fullName', header: 'Staff Full Name & Credentials' },
    { key: 'designation', header: 'Designation / Department' },
    { key: 'licenseBody', header: 'Regulatory Body' },
    {
      key: 'licenseNumber',
      header: 'License Number',
      render: (s: any) => <span className="font-mono font-semibold">{s.licenseNumber}</span>,
    },
    { key: 'licenseExpiry', header: 'Expiry Date' },
    {
      key: 'status',
      header: 'Status',
      render: (s: any) => <Badge variant="success">{s.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff & Human Resources (HRM)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty Directory • Professional Health Licenses • Leave Approvals • Locked Payroll Runs
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'directory', label: 'Faculty & Administrative Staff' },
          { id: 'payroll', label: 'Monthly Payroll Runs' },
          { id: 'leave', label: 'Staff Leave Ledger' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => setActiveTab(id)}
      />

      {activeTab === 'directory' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Accredited Health Science Instructors
            </span>
            <span className="text-xs text-slate-500">
              Regulatory Registration Verification (MDCN, MLSCN, PCN)
            </span>
          </div>
          <Table
            columns={staffColumns}
            data={staffMembers}
            keyExtractor={(s) => s.id}
            isDense={isDense}
          />
        </Card>
      )}

      {activeTab === 'payroll' && (
        <Card>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                November 2026 Salary Schedule & PAYE Deductions
              </span>
              <p className="text-[11px] text-slate-500">
                Statutory deductions: PAYE (Oyo State IRS) • Pension (PenCom 8%/10%) • NHF
              </p>
            </div>
            {!isPayrollLocked ? (
              <Button size="sm" onClick={handleLockPayroll} leftIcon={<Lock className="w-3.5 h-3.5" />}>
                Lock & Authorize Payroll Run
              </Button>
            ) : (
              <Badge variant="success" size="md">
                <CheckCircle className="w-3 h-3 inline mr-1" /> Run Approved & Frozen
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
              <span className="text-slate-500 block uppercase text-[10px]">Gross Salary Payout</span>
              <span className="text-base font-bold text-slate-900 font-tabular">₦22,180,000.00</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
              <span className="text-slate-500 block uppercase text-[10px]">PAYE & Pension Deductions</span>
              <span className="text-base font-bold text-[#F83A20] font-tabular">₦3,730,000.00</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
              <span className="text-slate-500 block uppercase text-[10px]">Net Disbursement</span>
              <span className="text-base font-bold text-[#13A348] font-tabular">₦18,450,000.00</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
