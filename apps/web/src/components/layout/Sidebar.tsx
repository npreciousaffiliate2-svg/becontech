import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CreditCard,
  GraduationCap,
  CalendarCheck,
  Stethoscope,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  moduleCode: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { session } = useApp();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4 shrink-0" />, moduleCode: 'CORE' },
    { name: 'Admissions & Enrollment', path: '/admissions', icon: <UserPlus className="w-4 h-4 shrink-0" />, moduleCode: 'ADM' },
    { name: 'Students (SIS)', path: '/students', icon: <Users className="w-4 h-4 shrink-0" />, moduleCode: 'SIS' },
    { name: 'Fees & Bursary', path: '/bursary', icon: <CreditCard className="w-4 h-4 shrink-0" />, moduleCode: 'FIN' },
    { name: 'Academics & Exams', path: '/academics', icon: <GraduationCap className="w-4 h-4 shrink-0" />, moduleCode: 'EXM' },
    { name: 'Attendance Register', path: '/attendance', icon: <CalendarCheck className="w-4 h-4 shrink-0" />, moduleCode: 'ATT' },
    { name: 'Clinical Postings', path: '/postings', icon: <Stethoscope className="w-4 h-4 shrink-0" />, moduleCode: 'CLN' },
    { name: 'E-Learning (LMS)', path: '/learning', icon: <BookOpen className="w-4 h-4 shrink-0" />, moduleCode: 'LMS' },
    { name: 'Staff & HR', path: '/staff', icon: <Briefcase className="w-4 h-4 shrink-0" />, moduleCode: 'HRM' },
    { name: 'Hostels & Accommodation', path: '/hostels', icon: <Building2 className="w-4 h-4 shrink-0" />, moduleCode: 'HST' },
    { name: 'Timetable & Scheduling', path: '/timetable', icon: <Calendar className="w-4 h-4 shrink-0" />, moduleCode: 'TTS' },
    { name: 'Communications', path: '/messages', icon: <MessageSquare className="w-4 h-4 shrink-0" />, moduleCode: 'COM' },
    { name: 'Reports & Analytics', path: '/reports', icon: <BarChart3 className="w-4 h-4 shrink-0" />, moduleCode: 'RPT' },
    { name: 'Platform Admin', path: '/admin', icon: <ShieldAlert className="w-4 h-4 shrink-0" />, moduleCode: 'CORE' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Institutional Header */}
        <div className="h-14 border-b border-slate-800 px-4 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                CampusOne
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Bethsaida College of Health Tech
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-[4px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0A77FE] text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              {item.icon}
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* Tenant & Integrity Footer */}
        <div className="border-t border-slate-800 p-3">
          <div className="rounded-[4px] bg-slate-800/60 p-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#13A348] shrink-0" />
            {!isCollapsed && (
              <div className="text-[10px] text-slate-300 leading-tight min-w-0">
                <p className="font-semibold text-white">NDPA 2023 Compliant</p>
                <p className="text-slate-400 truncate">Single-Tenant Instance</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
