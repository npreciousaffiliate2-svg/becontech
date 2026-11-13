import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  StatCard,
  Card,
  Badge,
  Button,
  Table,
} from '@campusone/ui';
import {
  Users,
  CreditCard,
  GraduationCap,
  AlertCircle,
  FileCheck2,
  Calendar,
  Stethoscope,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { formatNaira } from '@campusone/contracts';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const { session, receipts, ledgerEntries, isDense } = useApp();
  const navigate = useNavigate();

  // Role-specific rendering
  if (session.activeRole === 'STU' || session.activeRole === 'SPON') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {session.activeRole === 'STU' ? 'Student Portal' : 'Sponsor Portal (Ward View)'}
            </h1>
            <p className="text-xs text-slate-500">
              {session.activeRole === 'STU'
                ? 'Blessing Adeyemi — Matric No: CHE/2026/0014 | CHEW 200 Level'
                : 'Ward: Blessing Adeyemi (CHE/2026/0014) — Community Health Extension Worker'}
            </p>
          </div>
          <Badge variant="success" dot>Academic Status: Active</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Outstanding Fee Balance"
            value="₦55,000.00"
            secondaryText="Due for 2nd installment"
            icon={<CreditCard className="w-4 h-4 text-[#F83A20]" />}
          />
          <StatCard
            title="Registered Courses"
            value="8 Courses"
            secondaryText="22 Credit Units"
            icon={<GraduationCap className="w-4 h-4 text-[#0A77FE]" />}
          />
          <StatCard
            title="Cumulative GPA"
            value="3.89"
            secondaryText="Upper Credit Division"
            icon={<TrendingUp className="w-4 h-4 text-[#13A348]" />}
          />
          <StatCard
            title="Next Clinical Posting"
            value="PHC Ona-Ara"
            secondaryText="Commences 24 Nov 2026"
            icon={<Stethoscope className="w-4 h-4 text-[#0A77FE]" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Harmattan 2026/2027 Registered Courses
                </span>
                <Button size="sm" variant="ghost" onClick={() => navigate('/academics')}>
                  View Full Result
                </Button>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">CHE 201 — Primary Health Care I</div>
                  <div className="text-slate-400 text-[11px]">3 Credit Units | Score: 74% (A)</div>
                </div>
                <Badge variant="success">Passed (5.0)</Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">CHE 202 — Anatomy & Physiology II</div>
                  <div className="text-slate-400 text-[11px]">2 Credit Units | Score: 63% (B)</div>
                </div>
                <Badge variant="success">Passed (4.0)</Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">CHE 203 — Pharmacology for Health</div>
                  <div className="text-slate-400 text-[11px]">4 Credit Units | Score: 53% (C)</div>
                </div>
                <Badge variant="success">Passed (3.0)</Badge>
              </div>
            </div>
          </Card>

          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Payment History & Official Receipts
                </span>
                <Button size="sm" variant="ghost" onClick={() => navigate('/bursary')}>
                  Open Ledger
                </Button>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 text-xs">
              {receipts.slice(0, 3).map((r) => (
                <div key={r.receiptNumber} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{r.receiptNumber}</div>
                    <div className="text-slate-400 text-[11px]">
                      {r.formattedAmount} • {r.paymentMethod.toUpperCase()}
                    </div>
                  </div>
                  <Badge variant="primary">Verified</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Institutional Management Views (PROVOST, BURSAR, REG, HOD, EXAM, SADMIN)
  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {session.activeRole === 'PROVOST'
                ? 'Executive College Dashboard'
                : session.activeRole === 'BURSAR'
                ? 'Bursary & Financial Operations'
                : session.activeRole === 'REG'
                ? 'Registrar & Admissions Control'
                : session.activeRole === 'EXAM'
                ? 'Examinations & Broadsheets'
                : 'Departmental Academic Console'}
            </h1>
            <Badge variant="neutral">{session.activeRole}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bethsaida College of Health Tech Ltd • 2026/2027 Academic Session (Harmattan Semester)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/bursary')}
            leftIcon={<CreditCard className="w-3.5 h-3.5" />}
          >
            Bursary Ledger
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/academics')}
            leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
          >
            Grade Approvals
          </Button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled Students"
          value="1,248"
          secondaryText="Across 7 Accredited Departments"
          icon={<Users className="w-4 h-4 text-[#0A77FE]" />}
          trend={{ value: "+8.4% vs last session", isPositive: true }}
        />
        <StatCard
          title="Harmattan Collections"
          value="₦84,250,000"
          secondaryText="74.2% of target budget"
          icon={<CreditCard className="w-4 h-4 text-[#13A348]" />}
          trend={{ value: "₦14.2M collected this week", isPositive: true }}
        />
        <StatCard
          title="Academic Pass Rate"
          value="88.4%"
          secondaryText="Harmattan exam results"
          icon={<GraduationCap className="w-4 h-4 text-[#0A77FE]" />}
          trend={{ value: "+2.1% improvement", isPositive: true }}
        />
        <StatCard
          title="Defaulters / Overdue"
          value="142 Students"
          secondaryText="Installment lines past due date"
          icon={<AlertCircle className="w-4 h-4 text-[#F83A20]" />}
          trend={{ value: "Debtor policy active", isPositive: false }}
        />
      </div>

      {/* Middle Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Pending Operational Workflows (Action Required)
                </span>
                <span className="text-[11px] text-slate-500">4 items awaiting sign-off</span>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    CHEW 200L Broadsheet (CHE 201, 202, 203)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Submitted by HOD Dr. Bello • Requires Dean / Exams Officer final publishing
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate('/academics')}>
                  Review Broadsheet
                </Button>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    Batch 2026/2027 Admissions List (45 Candidates)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Entrance screening complete • Ready for matriculation number allocation
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate('/admissions')}>
                  Approve List
                </Button>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    Rural Clinical Posting Allocation (Batch B - 60 Students)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Ona-Ara, Ido & Akinyele PHCs • Supervisor rosters matched
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate('/postings')}>
                  Review Allocations
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Ledger Settlements */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Recent Verified Fee Payments & Receipts
                </span>
                <Button size="sm" variant="ghost" onClick={() => navigate('/bursary')}>
                  View All Receipts
                </Button>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 text-xs">
              {receipts.map((r) => (
                <div key={r.receiptNumber} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {r.studentName} ({r.matricNumber})
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {r.receiptNumber} • {r.programme} • {r.paidAt.split('T')[0]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-tabular">{r.formattedAmount}</div>
                    <Badge variant="success" size="sm">
                      {r.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Academic Calendar & Health Tech Milestones */}
        <div className="space-y-6">
          <Card
            header={
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Institutional Milestones
              </span>
            }
          >
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#0A77FE] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Harmattan Exams Final Week</p>
                  <p className="text-slate-500 text-[11px]">Nov 16 – Nov 21, 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Stethoscope className="w-4 h-4 text-[#13A348] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Clinical Postings Commences</p>
                  <p className="text-slate-500 text-[11px]">Nov 24, 2026 (UCH & State Hospitals)</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileCheck2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">CHPRBN Board Exam Eligibility Roster</p>
                  <p className="text-slate-500 text-[11px]">Submission deadline: Dec 05, 2026</p>
                </div>
              </div>
            </div>
          </Card>

          <Card
            header={
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Accreditation & Regulatory Posture
              </span>
            }
          >
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Community Health (CHPRBN)</span>
                <Badge variant="success">Fully Accredited</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Medical Lab Tech (MLSCN)</span>
                <Badge variant="success">Fully Accredited</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Pharmacy Technician (PCN)</span>
                <Badge variant="success">Fully Accredited</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Health Records (HRORBN)</span>
                <Badge variant="success">Fully Accredited</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
