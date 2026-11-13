import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Maximize2,
  Minimize2,
  User,
  Shield,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import type { RoleCode } from '@campusone/contracts';
import { Badge } from '@campusone/ui';

interface TopbarProps {
  onOpenMobile: () => void;
  isSidebarCollapsed: boolean;
}

const ROLES_LIST: { code: RoleCode; label: string; desc: string }[] = [
  { code: 'PROVOST', label: 'Provost / Rector', desc: 'College-wide, read-everything, approvals' },
  { code: 'REG', label: 'Registrar', desc: 'Admissions, student records, status changes' },
  { code: 'BURSAR', label: 'Bursar', desc: 'Fees, payments, reconciliation, debtor aging' },
  { code: 'HOD', label: 'Head of Department', desc: 'Curriculum, grade approvals, attendance' },
  { code: 'INSTR', label: 'Instructor / Lecturer', desc: 'Own courses, score entry, registers' },
  { code: 'EXAM', label: 'Exams Officer', desc: 'Broadsheets, publishing, transcripts' },
  { code: 'CLINSUP', label: 'Clinical Supervisor', desc: 'Posting sites, logbooks, clearance' },
  { code: 'SADMIN', label: 'System Administrator', desc: 'Configuration, RBAC, tamper-evident audit' },
  { code: 'STU', label: 'Student', desc: 'Ledger, registration, results, logbook' },
  { code: 'SPON', label: 'Sponsor / Parent', desc: 'Ward-scoped fees, results, notices' },
];

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile, isSidebarCollapsed }) => {
  const { session, switchRole, isDense, toggleDense } = useApp();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <header
      className={`h-14 fixed top-0 right-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-4 transition-all duration-200 ${
        isSidebarCollapsed ? 'left-16' : 'left-0 lg:left-64'
      }`}
    >
      {/* Left side: Hamburger & Global search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 rounded-[4px] text-slate-500 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, courses, staff, receipts..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0A77FE] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right side: Persona Switcher, Dense mode, Notifications, Profile */}
      <div className="flex items-center gap-2">
        {/* Dense mode toggle */}
        <button
          onClick={toggleDense}
          className={`p-1.5 rounded-[4px] border border-slate-200 text-xs flex items-center gap-1.5 hover:bg-slate-50 transition-colors ${
            isDense ? 'bg-blue-50 text-[#0A77FE] border-blue-200 font-semibold' : 'text-slate-600 bg-white'
          }`}
          title="Toggle Dense / Compact Mode"
        >
          {isDense ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isDense ? 'Dense Mode' : 'Standard'}</span>
        </button>

        {/* Persona / Role Simulator Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="h-8 px-2.5 rounded-[4px] border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-medium text-slate-800 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#0A77FE]" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold text-slate-900">{session.activeRole}</span>
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1 w-72 rounded-[4px] border border-slate-200 bg-white shadow-xl z-50 p-1 flex flex-col max-h-96 overflow-y-auto">
              <div className="px-2.5 py-1.5 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Active Persona (PRD Roles)
              </div>
              {ROLES_LIST.map((r) => {
                const isCurrent = r.code === session.activeRole;
                return (
                  <button
                    key={r.code}
                    onClick={() => {
                      switchRole(r.code);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 text-left text-xs rounded-[4px] flex items-start justify-between transition-colors ${
                      isCurrent ? 'bg-blue-50 text-[#0A77FE]' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>{r.code}</span>
                        <span className="font-normal text-slate-500">— {r.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-[#0A77FE] shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          className="relative p-1.5 rounded-[4px] text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-[4px] bg-[#0A77FE]" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-[4px] bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
            TB
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-800 truncate leading-tight">
              {session.fullName}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">bethsaida.edu.ng</span>
          </div>
        </div>
      </div>
    </header>
  );
};
