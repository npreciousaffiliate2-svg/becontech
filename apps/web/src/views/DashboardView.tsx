import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Users,
  CreditCard,
  GraduationCap,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Button, Badge } from '@campusone/ui';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const { session, receipts } = useApp();
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState<'30D' | '90D' | 'Session'>('30D');
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'academics'>('overview');

  const kpis = [
    {
      title: 'Active Students Enrolled',
      value: '1,248',
      trend: '+8.4% this year',
      subtext: 'Across 5 health departments',
      isPositive: true,
      icon: <Users className="w-5 h-5 text-slate-400" />,
    },
    {
      title: 'School Fees Collected',
      value: '₦84.2M',
      trend: '74% of target',
      subtext: 'Target: ₦114M for session',
      isPositive: true,
      icon: <CreditCard className="w-5 h-5 text-slate-400" />,
    },
    {
      title: 'Examination Pass Rate',
      value: '88.4%',
      trend: '+2.1% improvement',
      subtext: 'Harmattan semester results',
      isPositive: true,
      icon: <GraduationCap className="w-5 h-5 text-slate-400" />,
    },
    {
      title: 'Outstanding Fees',
      value: '₦18.4M',
      trend: '142 students',
      subtext: 'Overdue installment payments',
      isPositive: false,
      icon: <AlertCircle className="w-5 h-5 text-slate-400" />,
    },
  ];

  // Monthly Revenue Chart Data
  const monthlyRevenue = [
    { month: 'Jun', amount: 8.5, label: '₦8.5M' },
    { month: 'Jul', amount: 14.2, label: '₦14.2M' },
    { month: 'Aug', amount: 11.0, label: '₦11.0M' },
    { month: 'Sep', amount: 22.4, label: '₦22.4M' },
    { month: 'Oct', amount: 18.1, label: '₦18.1M' },
    { month: 'Nov', amount: 10.0, label: '₦10.0M' },
  ];
  const maxRevenue = 25;

  // Department Enrollment Data
  const departmentEnrollment = [
    { name: 'Community Health (CHEW)', count: 480, percentage: 38, color: 'bg-[#107C41]' },
    { name: 'Medical Laboratory (MLT)', count: 320, percentage: 26, color: 'bg-[#13A348]' },
    { name: 'Pharmacy Technician', count: 260, percentage: 21, color: 'bg-amber-500' },
    { name: 'Health Information (HIM)', count: 120, percentage: 10, color: 'bg-teal-600' },
    { name: 'Environmental Health', count: 68, percentage: 5, color: 'bg-slate-400' },
  ];

  const recentPayments = [
    {
      date: 'Today, 11:20 AM',
      student: 'Blessing Adeyemi',
      program: 'Community Health 200L',
      item: 'First Semester Tuition',
      channel: 'Paystack Card',
      amount: '₦100,000.00',
    },
    {
      date: 'Today, 09:45 AM',
      student: 'Emmanuel Chukwuma',
      program: 'Medical Laboratory 100L',
      item: 'Tuition Fee Balance',
      channel: 'Remita Bank',
      amount: '₦140,000.00',
    },
    {
      date: 'Yesterday',
      student: 'Khadijat Sani',
      program: 'Pharmacy Technician 100L',
      item: 'Clinical Posting Levy',
      channel: 'Paystack Card',
      amount: '₦35,000.00',
    },
    {
      date: 'Yesterday',
      student: 'Amina Yusuf',
      program: 'Applicant Screening',
      item: 'Admission Application Fee',
      channel: 'Bank Transfer',
      amount: '₦15,000.00',
    },
    {
      date: '11 Nov 2026',
      student: 'David Adeleke',
      program: 'Medical Laboratory 100L',
      item: 'Laboratory Consumables',
      channel: 'Paystack Card',
      amount: '₦20,000.00',
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            2026/2027 Academic Session
          </p>
        </div>

        {/* Clean Segmented Timeframe Toggle */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-200/70 rounded-[4px] inline-flex items-center gap-1">
            {(['30D', '90D', 'Session'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-all ${
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

      {/* 4 Core Metric Cards (Responsive Grid: 1 col on mobile, 2 cols on tablet/laptop, 4 cols on wide screen) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-150 min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <span className="shrink-0">{kpi.icon}</span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-3 flex-wrap">
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight shrink-0">
                {kpi.value}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] whitespace-nowrap shrink-0 ${
                  kpi.isPositive
                    ? 'bg-emerald-50 text-[#13A348] border border-emerald-200'
                    : 'bg-rose-50 text-[#F83A20] border border-rose-200'
                }`}
              >
                {kpi.trend}
              </span>
            </div>

            <span className="text-xs text-slate-500 mt-2 block truncate">
              {kpi.subtext}
            </span>
          </div>
        ))}
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Revenue & Fee Collections Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[4px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly School Fee Collections
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total fees received across online card payments and bank transfers
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-[#13A348]">₦84,250,000</span>
              <span className="text-xs text-slate-400 block">Total Collected to Date</span>
            </div>
          </div>

          {/* Clean High-Legibility Bar Chart */}
          <div className="pt-6">
            <div className="h-56 w-full flex items-end gap-3 sm:gap-6 border-b border-slate-200 pb-2">
              {monthlyRevenue.map((bar, i) => {
                const heightPercent = Math.round((bar.amount / maxRevenue) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-bold text-slate-700 opacity-90 group-hover:text-[#107C41] transition-colors">
                      {bar.label}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#107C41] hover:bg-[#093322] rounded-[4px] transition-all duration-200 shadow-sm"
                    />
                    <span className="text-xs font-semibold text-slate-600">{bar.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
              <span>June 2026</span>
              <span>November 2026 (Harmattan Peak)</span>
            </div>
          </div>
        </div>

        {/* Right (1/3): Student Enrollment by Department */}
        <div className="bg-white rounded-[4px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Students by Department
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution across accredited training programmes
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {departmentEnrollment.map((dept, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <span className="font-bold text-slate-900">{dept.count} students</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-[4px] overflow-hidden">
                    <div
                      style={{ width: `${dept.percentage}%` }}
                      className={`h-full ${dept.color} rounded-[4px]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Enrollment</span>
            <span className="font-bold text-slate-900 text-sm">1,248 Students</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent School Payments & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Recent School Payments */}
        <div className="lg:col-span-2 bg-white rounded-[4px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Student Fee Payments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time verified settlements processed through school accounts
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/bursary')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View Full Bursary Ledger
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department / Level</th>
                  <th className="py-3 px-4">Fee Item</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {recentPayments.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{p.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{p.student}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{p.program}</td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{p.item}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="primary" size="sm">{p.channel}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#13A348] whitespace-nowrap">
                      {p.amount}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Badge variant="success" size="sm">Verified</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1/3): Action Required Workflow Items */}
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tasks Awaiting Approval
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Items requiring Provost or Admin sign-off</p>
              </div>
              <Badge variant="warning">3 Pending</Badge>
            </div>

            <div className="space-y-3.5 pt-4">
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Harmattan Exam Results Broadsheet
                  </span>
                  <Badge variant="warning" size="sm">Review</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Community Health (CHEW 200L) scores submitted by department for final publication.
                </p>
                <div className="pt-1 flex justify-end">
                  <Button size="sm" onClick={() => navigate('/academics')}>
                    Review & Publish Results
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Batch 2026 Admission List
                  </span>
                  <Badge variant="neutral" size="sm">45 Students</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Entrance test completed. Screened candidates ready for admission letter issuance.
                </p>
                <div className="pt-1 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => navigate('/admissions')}>
                    Approve Admission List
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Hospital Clinical Postings
                  </span>
                  <Badge variant="neutral" size="sm">60 Students</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Trainees allocated to UCH Ibadan and Adeoyo State Hospital for rural fieldwork.
                </p>
                <div className="pt-1 flex justify-end">
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
