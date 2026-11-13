import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavGroup {
  group: string;
  items: {
    name: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { session } = useApp();
  const navigate = useNavigate();

  const navGroups: NavGroup[] = [
    {
      group: 'Core',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Platform Admin', path: '/admin', icon: <ShieldAlert size={18} /> },
      ],
    },
    {
      group: 'Academics & Students',
      items: [
        { name: 'Admissions', path: '/admissions', icon: <UserPlus size={18} /> },
        { name: 'Students (SIS)', path: '/students', icon: <Users size={18} /> },
        { name: 'Academics & Exams', path: '/academics', icon: <GraduationCap size={18} /> },
        { name: 'Attendance Register', path: '/attendance', icon: <CalendarCheck size={18} /> },
        { name: 'Clinical Postings', path: '/postings', icon: <Stethoscope size={18} /> },
        { name: 'E-Learning (LMS)', path: '/learning', icon: <BookOpen size={18} /> },
      ],
    },
    {
      group: 'Operations & Finance',
      items: [
        { name: 'Fees & Bursary', path: '/bursary', icon: <CreditCard size={18} /> },
        { name: 'Staff & HR', path: '/staff', icon: <Briefcase size={18} /> },
        { name: 'Hostels', path: '/hostels', icon: <Building2 size={18} /> },
        { name: 'Timetable', path: '/timetable', icon: <Calendar size={18} /> },
      ],
    },
    {
      group: 'Communications & Reports',
      items: [
        { name: 'Messages', path: '/messages', icon: <MessageSquare size={18} /> },
        { name: 'Reports & Accreditation', path: '/reports', icon: <BarChart3 size={18} /> },
      ],
    },
  ];

  const handleSignOut = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden cursor-pointer"
          onClick={onCloseMobile}
        />
      )}

      {/* ─── SIDEBAR (Executive Dark Blue Gradient — XIROLY Style) ─── */}
      <aside
        style={{
          width: isCollapsed ? '68px' : '240px',
          background: 'linear-gradient(180deg, #093774 0%, #06234d 100%)',
          boxShadow: '2px 0 16px rgba(6, 35, 77, 0.25)',
        }}
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between text-white transition-all duration-200 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
            {!isCollapsed ? (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold tracking-wider text-white uppercase font-sans">
                  CampusOne
                </span>
                <span className="text-[10px] text-white/70 truncate font-sans">
                  Bethsaida College of Health Tech
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-white text-[#093774] font-bold text-xs rounded-[4px] flex items-center justify-center mx-auto">
                C1
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-[4px] text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                {!isCollapsed ? (
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/45 px-3 py-1 select-none">
                    {group.group}
                  </div>
                ) : (
                  <div className="h-px bg-white/10 mx-2 my-2" />
                )}

                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-[4px] text-xs transition-all duration-150 ${
                        isActive
                          ? 'bg-white text-[#093774] font-bold shadow-sm'
                          : 'text-white/90 hover:text-white hover:bg-white/10 font-medium'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={isActive ? 'text-[#093774]' : 'text-white/90'}>
                            {item.icon}
                          </span>
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!isCollapsed && isActive && (
                          <ChevronRight size={14} className="text-[#093774] shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Footer (XIROLY & UseOneID Style) */}
        <div className="border-t border-white/10 p-3 bg-black/15">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[4px] bg-white text-[#0A77FE] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                TB
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {session.fullName}
                  </p>
                  <p className="text-[10px] text-white/70 truncate leading-tight">
                    {session.activeRole} • Bethsaida
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-[4px] transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
