import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Users,
  CreditCard,
  GraduationCap,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Button, Badge } from '@campusone/ui';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const { session, receipts, ledgerEntries } = useApp();
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [semesterView, setSemesterView] = useState<'Harmattan' | 'Rain' | 'All'>('Harmattan');

  const kpis = [
    {
      title: 'Total Enrolled Students',
      value: '1,248',
      trend: '+8.4%',
      subtext: 'vs previous session',
      isPositive: true,
      icon: <Users className="w-5 h-5 text-slate-400" />,
    },
    {
      title: 'Fee Collections MTD',
      value: '₦84.2M',
      trend: '74.2%',
      subtext: 'Harmattan budget target',
      isPositive: true,
      icon: <CreditCard className="w-5 h-5 text-slate-400" />,
    },
    {
      title: 'Average Pass Rate',
      value: '88.4%',
      trend: '+2.1%',
      subtext: 'Accredited examinations',
      isPositive: true,
      icon: <GraduationCap className="w-5 h-5 text-slate-400" />,
    },
    {
      title: 'Defaulters / Overdue',
      value: '142',
      trend: 'Active',
      subtext: 'Pending 2nd installment',
      isPositive: false,
      icon: <Clock className="w-5 h-5 text-slate-400" />,
    },
  ];

  const recentTransactions = [
    {
      id: 'tx-1',
      date: '13 Nov 2026',
      entity: 'Blessing Adeyemi',
      matricNumber: 'CHE/2026/0014',
      type: 'Tuition Settlement',
      amount: '₦100,000.00',
      status: 'VERIFIED',
      channel: 'Paystack',
    },
    {
      id: 'tx-2',
      date: '12 Nov 2026',
      entity: 'Emmanuel Chukwuma',
      matricNumber: 'MLT/2026/0029',
      type: 'Tuition Settlement',
      amount: '₦140,000.00',
      status: 'VERIFIED',
      channel: 'Remita',
    },
    {
      id: 'tx-3',
      date: '12 Nov 2026',
      entity: 'Khadijat Sani',
      matricNumber: 'PHT/2026/0009',
      type: 'Clinical Posting Levy',
      amount: '₦35,000.00',
      status: 'VERIFIED',
      channel: 'Paystack',
    },
    {
      id: 'tx-4',
      date: '11 Nov 2026',
      entity: 'Amina Yusuf',
      matricNumber: 'APP/2026/0142',
      type: 'Application Fee',
      amount: '₦15,000.00',
      status: 'VERIFIED',
      channel: 'Direct Bank',
    },
  ];

  const systemServices = [
    { name: 'CHPRBN Regulatory SPI', status: 'Operational', latency: '42ms' },
    { name: 'MLSCN Examination Gateway', status: 'Operational', latency: '65ms' },
    { name: 'PCN Licensing Registry', status: 'Operational', latency: '58ms' },
    { name: 'Paystack Payment Settlement', status: 'Operational', latency: '120ms' },
    { name: 'Termii Priority SMS Gateway', status: 'Operational', latency: '84ms' },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ─── TITLE & TIMEFRAME SELECTOR (UseOneID Style) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bethsaida College of Health Tech • Harmattan 2026/2027 Session
          </p>
        </div>

        {/* UseOneID Segmented Control Switches */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 bg-slate-200/70 rounded-[4px] flex items-center gap-1">
            {(['Harmattan', 'Rain', 'All'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSemesterView(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-all ${
                  semesterView === s
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="p-1 bg-slate-200/70 rounded-[4px] flex items-center gap-1">
            {(['7D', '30D', '90D', '1Y'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-[4px] transition-all ${
                  timeframe === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── KPI METRIC CARDS ROW (UseOneID Style) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              {kpi.icon}
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {kpi.value}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] flex items-center gap-0.5 ${
                  kpi.isPositive
                    ? 'bg-emerald-50 text-[#13A348] border border-emerald-200'
                    : 'bg-rose-50 text-[#F83A20] border border-rose-200'
                }`}
              >
                {kpi.trend}
              </span>
            </div>

            <span className="text-xs text-slate-400 mt-2 block">
              {kpi.subtext}
            </span>
          </div>
        ))}
      </div>

      {/* ─── MAIN CONTENT 2/3 & 1/3 LAYOUT GRID (UseOneID Layout) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card 1: Volume Activity Trends */}
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Academic & Fee Collection Velocity
                </h2>
                <p className="text-xs text-slate-400">Weekly progression across departments</p>
              </div>
              <Badge variant="primary">Harmattan Diet</Badge>
            </div>

            {/* Custom SVG Trend Bar Chart (Clean, No External Dependencies) */}
            <div className="h-48 w-full flex items-end gap-3 pt-4 border-b border-slate-100">
              {[
                { label: 'Wk 1', height: '40%', val: '₦12M' },
                { label: 'Wk 2', height: '65%', val: '₦18M' },
                { label: 'Wk 3', height: '55%', val: '₦15M' },
                { label: 'Wk 4', height: '85%', val: '₦24M' },
                { label: 'Wk 5', height: '70%', val: '₦20M' },
                { label: 'Wk 6', height: '95%', val: '₦28M' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.val}
                  </span>
                  <div
                    style={{ height: bar.height }}
                    className="w-full bg-[#0A77FE] hover:bg-[#093774] rounded-[4px] transition-all duration-200"
                  />
                  <span className="text-[11px] font-medium text-slate-400">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Recent Ledger Settlements Table */}
          <div className="bg-white rounded-[4px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Verified Collections & Settlements
                </h2>
                <p className="text-xs text-slate-400">Directly posted to double-entry ledger</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/bursary')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Full Ledger
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Channel</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tx.entity}</div>
                        <div className="text-[11px] text-slate-400">{tx.matricNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{tx.type}</td>
                      <td className="py-3 px-4">
                        <Badge variant="primary" size="sm">
                          {tx.channel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#13A348]">
                        {tx.amount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success" size="sm">
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-6">
          {/* System Services Status (UseOneID Platform Status Card) */}
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#13A348]" />
                <h2 className="text-sm font-bold text-slate-900">Regulatory & Core Services</h2>
              </div>
              <span className="text-[10px] font-bold text-[#13A348] bg-emerald-50 px-2 py-0.5 rounded-[4px]">
                All Systems Normal
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {systemServices.map((svc, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#13A348]" />
                    <span className="font-medium text-slate-700">{svc.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{svc.latency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Required Queue */}
          <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Pending Actions</h2>
              <Badge variant="warning" size="sm">3 Items</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-[4px] border border-slate-200 flex flex-col gap-1.5">
                <span className="font-bold text-slate-800">CHEW 200L Broadsheet Sign-off</span>
                <p className="text-[11px] text-slate-500">Submitted by HOD • Requires final approval</p>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => navigate('/academics')}>
                    Review Broadsheet
                  </Button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-[4px] border border-slate-200 flex flex-col gap-1.5">
                <span className="font-bold text-slate-800">Batch Admissions Approval</span>
                <p className="text-[11px] text-slate-500">45 screened candidates ready for matriculation</p>
                <div className="flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => navigate('/admissions')}>
                    Approve List
                  </Button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-[4px] border border-slate-200 flex flex-col gap-1.5">
                <span className="font-bold text-slate-800">Rural Clinical Allocations</span>
                <p className="text-[11px] text-slate-500">60 trainees assigned to UCH & PHC centers</p>
                <div className="flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => navigate('/postings')}>
                    Open Allocations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
