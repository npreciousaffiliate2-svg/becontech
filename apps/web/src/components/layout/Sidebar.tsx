import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  LogOut,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}

interface NavGroup {
  group: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { session } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Single active submenu (when one module is selected, others are closed)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Auto-expand only the menu corresponding to the active path
  useEffect(() => {
    const currentBasePath = '/' + location.pathname.split('/')[1];
    if (currentBasePath !== '/') {
      setActiveSubmenu(currentBasePath);
    } else {
      setActiveSubmenu(null);
    }
  }, [location.pathname]);

  const toggleSubmenu = (basePath: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSubmenu((prev) => (prev === basePath ? null : basePath));
  };

  const navGroups: NavGroup[] = [
    {
      group: 'General',
      items: [
        { name: 'Overview', path: '/', icon: <LayoutDashboard size={19} /> },
        {
          name: 'Analytics',
          path: '/analytics',
          icon: <BarChart3 size={19} />,
          subItems: [
            { name: 'Enrollment & Growth', path: '/analytics' },
            { name: 'Fee Recovery', path: '/analytics/fees' },
            { name: 'Academic Pass Rates', path: '/analytics/academic' },
            { name: 'Clinical Compliance', path: '/analytics/clinical' },
          ],
        },
      ],
    },
    {
      group: 'Academics & Students',
      items: [
        {
          name: 'Departments',
          path: '/departments',
          icon: <Building2 size={19} />,
          subItems: [
            { name: 'Department Directory', path: '/departments' },
            { name: 'Accredited Programmes', path: '/departments/programmes' },
            { name: 'Heads of Department', path: '/departments/hods' },
            { name: 'Faculty Roster', path: '/departments/faculty' },
            { name: 'Curriculum & Courses', path: '/departments/courses' },
          ],
        },
        {
          name: 'Admissions',
          path: '/admissions',
          icon: <UserPlus size={19} />,
          subItems: [
            { name: 'All Applications', path: '/admissions' },
            { name: 'Screening & Tests', path: '/admissions/screening' },
            { name: 'Admission Lists', path: '/admissions/lists' },
            { name: 'Accepted & Enrolled', path: '/admissions/enrolled' },
          ],
        },
        {
          name: 'Students',
          path: '/students',
          icon: <Users size={19} />,
          subItems: [
            { name: 'Student Directory', path: '/students' },
            { name: 'Status Lifecycle', path: '/students/lifecycle' },
            { name: 'Student ID Cards', path: '/students/id-cards' },
            { name: 'Clinical Clearance', path: '/students/clinical' },
          ],
        },
        {
          name: 'Academics & Exams',
          path: '/academics',
          icon: <GraduationCap size={19} />,
          subItems: [
            { name: 'Score Entry Grid', path: '/academics/scores' },
            { name: 'Broadsheets', path: '/academics/broadsheet' },
            { name: 'Transcripts', path: '/academics/transcript' },
            { name: 'Curriculum & Courses', path: '/academics/curriculum' },
          ],
        },
        {
          name: 'Attendance Register',
          path: '/attendance',
          icon: <CalendarCheck size={19} />,
          subItems: [
            { name: 'Daily Class Register', path: '/attendance/register' },
            { name: 'Exam Clearance', path: '/attendance/eligibility' },
          ],
        },
        {
          name: 'Clinical Postings',
          path: '/postings',
          icon: <Stethoscope size={19} />,
          subItems: [
            { name: 'Hospital Allocations', path: '/postings/allocations' },
            { name: 'Training Hospitals', path: '/postings/sites' },
            { name: 'Final Clearance', path: '/postings/clearance' },
          ],
        },
        {
          name: 'E-Learning',
          path: '/learning',
          icon: <BookOpen size={19} />,
          subItems: [
            { name: 'Course Materials', path: '/learning/materials' },
            { name: 'Practice Tests', path: '/learning/cbt' },
          ],
        },
      ],
    },
    {
      group: 'Finance & Operations',
      items: [
        {
          name: 'Fees & Bursary',
          path: '/bursary',
          icon: <CreditCard size={19} />,
          subItems: [
            { name: 'Student Master Ledger', path: '/bursary/ledger' },
            { name: 'Payment Receipts', path: '/bursary/receipts' },
            { name: 'Fee Structures', path: '/bursary/structure' },
            { name: 'Overdue Debts', path: '/bursary/debtors' },
          ],
        },
        {
          name: 'Staff & HR',
          path: '/staff',
          icon: <Briefcase size={19} />,
          subItems: [
            { name: 'Staff Directory', path: '/staff/directory' },
            { name: 'Monthly Salaries', path: '/staff/payroll' },
            { name: 'Staff Leaves', path: '/staff/leave' },
          ],
        },
        { name: 'Hostels', path: '/hostels', icon: <Building2 size={19} /> },
        { name: 'Timetable', path: '/timetable', icon: <Calendar size={19} /> },
      ],
    },
    {
      group: 'Administration & System',
      items: [
        { name: 'Reports & Accreditation', path: '/reports', icon: <FileCheck size={19} /> },
        { name: 'Messages & Notices', path: '/messages', icon: <MessageSquare size={19} /> },
        {
          name: 'Settings',
          path: '/settings',
          icon: <ShieldAlert size={19} />,
          subItems: [
            { name: 'Activity History', path: '/settings/audit' },
            { name: 'User Permissions', path: '/settings/permissions' },
            { name: 'School Settings', path: '/settings/school' },
            { name: 'Security & 2FA', path: '/settings/security' },
          ],
        },
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

      {/* ─── SIDEBAR (Institutional Health Green — Bethsaida Identity) ─── */}
      <aside
        style={{
          width: isCollapsed ? '68px' : '260px',
          background: 'linear-gradient(180deg, #093322 0%, #052015 100%)',
          boxShadow: '2px 0 16px rgba(5, 32, 21, 0.35)',
          borderRadius: '0px',
        }}
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between text-white transition-all duration-200 select-none rounded-none ${
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
                <span className="text-[11px] text-emerald-200/80 truncate font-sans">
                  Bethsaida College of Health Tech
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-[#107C41] text-white font-bold text-xs rounded-[4px] flex items-center justify-center mx-auto border border-emerald-400/30">
                C1
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-[4px] text-emerald-200/70 hover:text-white hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>
          </div>

          {/* Grouped Navigation Links with WordPress-style Submenus */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 pb-10 space-y-4">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                {!isCollapsed ? (
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300/60 px-3.5 py-1 select-none">
                    {group.group}
                  </div>
                ) : (
                  <div className="h-px bg-white/10 mx-2 my-2" />
                )}

                {group.items.map((item) => {
                  const isBasePathActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);
                  const isMenuOpen = activeSubmenu === item.path;
                  const hasSubItems = item.subItems && item.subItems.length > 0;

                  return (
                    <div key={item.path} className="space-y-0.5">
                      <div className="flex items-center">
                        <NavLink
                          to={item.path}
                          end={item.path === '/'}
                          onClick={() => {
                            if (!isCollapsed && hasSubItems) {
                              setActiveSubmenu(item.path);
                            } else {
                              setActiveSubmenu(null);
                            }
                            onCloseMobile();
                          }}
                          className={({ isActive }) => {
                            const isCurrentActive = isActive || isBasePathActive;
                            return `flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-[4px] text-[14px] transition-all duration-150 ${
                              isCurrentActive
                                ? 'bg-white text-[#093322] font-bold shadow-sm'
                                : 'text-white/85 hover:text-white hover:bg-white/10 font-medium'
                            } ${isCollapsed ? 'justify-center px-0' : ''}`;
                          }}
                          title={isCollapsed ? item.name : undefined}
                        >
                          {({ isActive }) => {
                            const isCurrentActive = isActive || isBasePathActive;
                            return (
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={isCurrentActive ? 'text-[#0F7640]' : 'text-white/90'}>
                                  {item.icon}
                                </span>
                                {!isCollapsed && <span className="truncate">{item.name}</span>}
                              </div>
                            );
                          }}
                        </NavLink>

                        {/* Expand/Collapse Chevron */}
                        {!isCollapsed && hasSubItems && (
                          <button
                            type="button"
                            onClick={(e) => toggleSubmenu(item.path, e)}
                            className="p-2 text-emerald-200/70 hover:text-white hover:bg-white/10 rounded-[4px] ml-1 transition-colors"
                            aria-label={`Toggle ${item.name} sub-menu`}
                          >
                            {isMenuOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                        )}
                      </div>

                      {/* Clean Sub-Menu Items (Subtle Low-Opacity Background, No Left Line) */}
                      {!isCollapsed && hasSubItems && isMenuOpen && (
                        <div className="py-1 space-y-0.5">
                          {item.subItems!.map((sub) => {
                            const isSubActive =
                              location.pathname === sub.path ||
                              (location.pathname + location.search === sub.path) ||
                              (sub.path === item.path && location.pathname === item.path);

                            return (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                onClick={onCloseMobile}
                                className={`block pl-10 pr-3 py-2 text-[13px] rounded-[4px] transition-colors truncate ${
                                  isSubActive
                                    ? 'text-white bg-white/[0.08] font-semibold'
                                    : 'text-white/70 hover:text-white hover:bg-white/[0.05] font-normal'
                                }`}
                              >
                                {sub.name}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-white/10 p-3 bg-black/20 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[4px] bg-[#107C41] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/30">
                TB
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-white truncate leading-tight">
                    {session.fullName}
                  </p>
                  <p className="text-[11px] text-emerald-300/80 truncate leading-tight">
                    {session.activeRole}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-emerald-200/70 hover:text-white hover:bg-white/10 rounded-[4px] transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
