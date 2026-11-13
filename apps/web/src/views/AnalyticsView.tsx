import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Badge,
  Tabs,
  useToast,
} from '@campusone/ui';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  CreditCard,
  GraduationCap,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const AnalyticsView: React.FC = () => {
  const { isDense } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'enrollment' | 'financial' | 'academic' | 'clinical'>('enrollment');
  const [timeRange, setTimeRange] = useState<'current' | '3years' | 'all'>('current');

  // Academic Pass Rate by Department
  const passRateData = [
    { department: 'Community Health (CHEW)', students: 480, passRate: 91.2, topGrade: 'A', status: 'EXCELLENT' },
    { department: 'Medical Laboratory (MLT)', students: 320, passRate: 88.5, topGrade: 'A', status: 'GOOD' },
    { department: 'Pharmacy Technician', students: 260, passRate: 85.0, topGrade: 'B', status: 'GOOD' },
    { department: 'Health Information (HIM)', students: 120, passRate: 93.3, topGrade: 'A', status: 'EXCELLENT' },
    { department: 'Environmental Health', students: 68, passRate: 82.4, topGrade: 'B', status: 'SATISFACTORY' },
  ];

  // Fee Collection Efficiency
  const feeRecoveryData = [
    { level: '100 Level (Freshers)', billed: '₦45.2M', collected: '₦38.4M', recoveryRate: 85.0 },
    { level: '200 Level', billed: '₦38.6M', collected: '₦29.5M', recoveryRate: 76.4 },
    { level: '300 Level (Final Year)', billed: '₦30.2M', collected: '₦16.3M', recoveryRate: 54.0 },
  ];

  const passRateColumns = [
    { key: 'department', header: 'Department', render: (r: any) => <span className="font-bold text-slate-900">{r.department}</span> },
    { key: 'students', header: 'Candidates Examined', align: 'right' as const, render: (r: any) => <span className="font-semibold text-slate-700">{r.students}</span> },
    { key: 'passRate', header: 'Pass Rate (%)', align: 'right' as const, render: (r: any) => <span className="font-bold text-[#0F7640]">{r.passRate}%</span> },
    { key: 'topGrade', header: 'Dominant Grade', align: 'center' as const, render: (r: any) => <span className="font-extrabold text-slate-800">{r.topGrade}</span> },
    {
      key: 'status',
      header: 'Performance Rating',
      render: (r: any) => (
        <Badge variant={r.status === 'EXCELLENT' ? 'success' : 'primary'}>
          {r.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            College intelligence, multi-year enrollment growth, financial recovery, and board pass rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() =>
              showToast({
                type: 'info',
                title: 'Analytics Report Exported',
                message: 'Executive summary report generated successfully.',
              })
            }
          >
            Export Executive Report
          </Button>
        </div>
      </div>

      {/* 4 Core Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Student Retention Rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-slate-900">94.8%</span>
            <Badge variant="success" size="sm">+1.4% vs 2025</Badge>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Low student attrition across all levels</span>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tuition Recovery Rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-[#0F7640]">74.0%</span>
            <Badge variant="primary" size="sm">₦84.2M Collected</Badge>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Target: ₦114M total session revenue</span>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Board Qualifying Average</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-slate-900">88.4%</span>
            <Badge variant="success" size="sm">First Diet</Badge>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Combined CHPRBN & MLSCN exam pass</span>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clinical Posting Rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-slate-900">96.2%</span>
            <Badge variant="success" size="sm">100% Cleared</Badge>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">640 students posted across 4 hospitals</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'enrollment', label: 'Enrollment & Demographics' },
          { id: 'financial', label: 'Fee Recovery & Collections' },
          { id: 'academic', label: 'Academic & Exam Pass Rates' },
          { id: 'clinical', label: 'Clinical Posting Compliance' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => setActiveTab(id)}
      />

      {/* Tab 1: Enrollment & Demographics */}
      {activeTab === 'enrollment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card header={<span className="font-bold text-slate-900">3-Year Enrollment Trajectory</span>}>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>2026/2027 Session (Current)</span>
                  <span className="text-[#0F7640] font-bold">1,248 Students (+8.4%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-[3px] overflow-hidden">
                  <div className="h-full bg-[#107C41] rounded-[3px] w-full" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>2025/2026 Session</span>
                  <span className="text-slate-700 font-bold">1,151 Students (+12.0%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-[3px] overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-[3px] w-[92%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>2024/2025 Session</span>
                  <span className="text-slate-700 font-bold">1,028 Students</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-[3px] overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-[3px] w-[82%]" />
                </div>
              </div>
            </div>
          </Card>

          <Card header={<span className="font-bold text-slate-900">Gender & Category Distribution</span>}>
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[4px] border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Female Students</p>
                  <span className="text-slate-500">724 Students</span>
                </div>
                <span className="text-base font-extrabold text-[#0F7640]">58%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[4px] border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Male Students</p>
                  <span className="text-slate-500">524 Students</span>
                </div>
                <span className="text-base font-extrabold text-slate-800">42%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[4px] border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Indigene vs Non-Indigene Ratio</p>
                  <span className="text-slate-500">68% Oyo State Resident / 32% Other States</span>
                </div>
                <Badge variant="primary">Balanced</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Fee Recovery */}
      {activeTab === 'financial' && (
        <Card header={<span className="font-bold text-slate-900">Fee Recovery Efficiency by Academic Level</span>}>
          <div className="space-y-4 text-xs">
            {feeRecoveryData.map((f, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900">{f.level}</span>
                  <span className="text-[#0F7640]">{f.collected} of {f.billed} ({f.recoveryRate}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-[3px] overflow-hidden">
                  <div
                    style={{ width: `${f.recoveryRate}%` }}
                    className={`h-full ${f.recoveryRate >= 75 ? 'bg-[#107C41]' : 'bg-amber-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Academic Pass Rates */}
      {activeTab === 'academic' && (
        <Card header={<span className="font-bold text-slate-900">Departmental Examination Pass Rates (Harmattan Diet)</span>}>
          <Table
            columns={passRateColumns}
            data={passRateData}
            keyExtractor={(r) => r.department}
            isDense={isDense}
          />
        </Card>
      )}

      {/* Tab 4: Clinical Posting Compliance */}
      {activeTab === 'clinical' && (
        <Card header={<span className="font-bold text-slate-900">Hospital Posting Site Allocations</span>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">University College Hospital (UCH) Ibadan</p>
                <span className="text-slate-500">220 Students Allocated • Teaching Hospital</span>
              </div>
              <Badge variant="success">100% Cleared</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">State Specialist Hospital Ring Road</p>
                <span className="text-slate-500">180 Students Allocated • General Hospital</span>
              </div>
              <Badge variant="success">100% Cleared</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Primary Health Care Centre Ido</p>
                <span className="text-slate-500">140 Students Allocated • Comprehensive PHC</span>
              </div>
              <Badge variant="success">100% Cleared</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">General Hospital Oyo Town</p>
                <span className="text-slate-500">100 Students Allocated • General Hospital</span>
              </div>
              <Badge variant="success">100% Cleared</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
