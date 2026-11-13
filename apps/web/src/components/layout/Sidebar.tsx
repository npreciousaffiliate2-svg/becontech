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

  // Expanded parent menus state (WordPress-style)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    '/admissions': false,
    '/students': false,
    '/bursary': false,
    '/academics': false,
    '/postings': false,
    '/staff': false,
    '/admin': false,
  });

  // Auto-expand the menu corresponding to the active path
  useEffect(() => {
    const currentBasePath = '/' + location.pathname.split('/')[1];
    setExpandedMenus((prev) => ({
      ...prev,
      [currentBasePath]: true,
    }));
  }, [location.pathname]);

  const toggleSubmenu = (basePath: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMenus((prev) => ({
      ...prev,
      [basePath]: !prev[basePath],
    }));
  };

  const navGroups: NavGroup[] = [
    {
      group: 'Core',
      items: [
        { name: 'Dashboard Overview', path: '/', icon: <LayoutDashboard size={19} /> },
        {
          name: 'Platform Admin',
          path: '/admin',
          icon: <ShieldAlert size={19} />,
          subItems: [
            { name: 'Audit Trail', path: '/admin?tab=audit' },
            { name: 'User Permissions', path: '/admin?tab=rbac' },
            { name: 'School Settings', path: '/admin?tab=tenant' },
            { name: 'Security & 2FA', path: '/admin?tab=security' },
          ],
        },
      ],
    },
    {
      group: 'Academics & Students',
      items: [
        {
          name: 'Admissions',
          path: '/admissions',
          icon: <UserPlus size={19} />,
          subItems: [
            { name: 'All Applications', path: '/admissions?tab=applications' },
            { name: 'Screening & Tests', path: '/admissions?tab=screening' },
            { name: 'Admission Lists', path: '/admissions?tab=admission_lists' },
          ],
        },
        {
          name: 'Students (SIS)',
          path: '/students',
          icon: <Users size={19} />,
          subItems: [
            { name: 'Student Directory', path: '/students?tab=directory' },
            { name: 'Status Lifecycle', path: '/students?tab=lifecycle' },
            { name: 'Student ID Cards', path: '/students?tab=id_cards' },
          ],
        },
        {
          name: 'Academics & Exams',
          path: '/academics',
          icon: <GraduationCap size={19} />,
          subItems: [
            { name: 'Score Entry Grid', path: '/academics?tab=scores' },
            { name: 'Broadsheets', path: '/academics?tab=broadsheet' },
            { name: 'Transcripts', path: '/academics?tab=transcript' },
            { name: 'Curriculum & Courses', path: '/academics?tab=curriculum' },
          ],
        },
        {
          name: 'Attendance Register',
          path: '/attendance',
          icon: <CalendarCheck size={19} />,
        },
        {
          name: 'Clinical Postings',
          path: '/postings',
          icon: <Stethoscope size={19} />,
          subItems: [
            { name: 'Hospital Allocations', path: '/postings?tab=allocations' },
            { name: 'Training Hospitals', path: '/postings?tab=sites' },
            { name: 'Final Clearance', path: '/postings?tab=clearance' },
          ],
        },
        {
          name: 'E-Learning (LMS)',
          path: '/learning',
          icon: <BookOpen size={19} />,
          subItems: [
            { name: 'Lecture Notes', path: '/learning?tab=materials' },
            { name: 'Practice Tests', path: '/learning?tab=cbt' },
          ],
        },
      ],
    },
    {
      group: 'Operations & Finance',
      items: [
        {
          name: 'Fees & Bursary',
          path: '/bursary',
          icon: <CreditCard size={19} />,
          subItems: [
            { name: 'Student Master Ledger', path: '/bursary?tab=ledger' },
            { name: 'Payment Receipts', path: '/bursary?tab=receipts' },
            { name: 'Fee Structures', path: '/bursary?tab=structure' },
            { name: 'Overdue Debts', path: '/bursary?tab=debtors' },
          ],
        },
        {
          name: 'Staff & HR',
          path: '/staff',
          icon: <Briefcase size={19} />,
          subItems: [
            { name: 'Staff Directory', path: '/staff?tab=directory' },
            { name: 'Monthly Salaries', path: '/staff?tab=payroll' },
            { name: 'Staff Leaves', path: '/staff?tab=leave' },
          ],
        },
        { name: 'Hostels', path: '/hostels', icon: <Building2 size={19} /> },
        { name: 'Timetable', path: '/timetable', icon: <Calendar size={19} /> },
      ],
    },
    {
      group: 'Communications & Reports',
      items: [
        { name: 'Messages & Notices', path: '/messages', icon: <MessageSquare size={19} /> },
        { name: 'Reports & Accreditation', path: '/reports', icon: <BarChart3 size={19} /> },
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

      {/* ─── SIDEBAR (Strictly 0px Outer Radius — XIROLY Executive Navy) ─── */}
      <aside
        style={{
          width: isCollapsed ? '68px' : '260px',
          background: 'linear-gradient(180deg, #093774 0%, #06234d 100%)',
          boxShadow: '2px 0 16px rgba(6, 35, 77, 0.25)',
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
                <span className="text-[11px] text-white/70 truncate font-sans">
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
              {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>
          </div>

          {/* Grouped Navigation Links with WordPress-style Submenus */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                {!isCollapsed ? (
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/50 px-3.5 py-1 select-none">
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
                  const isMenuOpen = expandedMenus[item.path] || false;
                  const hasSubItems = item.subItems && item.subItems.length > 0;

                  return (
                    <div key={item.path} className="space-y-0.5">
                      <div className="flex items-center">
                        <NavLink
                          to={item.path}
                          end={item.path === '/'}
                          onClick={() => {
                            if (!isCollapsed && hasSubItems) {
                              setExpandedMenus((prev) => ({
                                ...prev,
                                [item.path]: true,
                              }));
                            }
                            onCloseMobile();
                          }}
                          className={({ isActive }) =>
                            `flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-[4px] text-[14px] transition-all duration-150 ${
                              isActive || (isBasePathActive && !hasSubItems)
                                ? 'bg-white text-[#093774] font-bold shadow-sm'
                                : 'text-white/90 hover:text-white hover:bg-white/10 font-medium'
                            } ${isCollapsed ? 'justify-center px-0' : ''}`
                          }
                          title={isCollapsed ? item.name : undefined}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={isBasePathActive && !hasSubItems ? 'text-[#093774]' : 'text-white/90'}>
                              {item.icon}
                            </span>
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                          </div>
                        </NavLink>

                        {/* Expand/Collapse Chevron (WordPress Style) */}
                        {!isCollapsed && hasSubItems && (
                          <button
                            type="button"
                            onClick={(e) => toggleSubmenu(item.path, e)}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-[4px] ml-1 transition-colors"
                            aria-label={`Toggle ${item.name} sub-menu`}
                          >
                            {isMenuOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                        )}
                      </div>

                      {/* WordPress-Style Indented Sub-Menu Items */}
                      {!isCollapsed && hasSubItems && isMenuOpen && (
                        <div className="pl-9 pr-1 py-1 space-y-1 border-l-2 border-white/15 ml-4">
                          {item.subItems!.map((sub) => {
                            const isSubActive =
                              location.pathname + location.search === sub.path ||
                              (location.search === '' && sub.path.includes('tab=') && sub.path.endsWith(item.subItems![0].path.split('?')[1]));

                            return (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                onClick={onCloseMobile}
                                className={`block px-2.5 py-1.5 text-[13px] rounded-[4px] transition-colors truncate ${
                                  isSubActive
                                    ? 'text-white bg-white/20 font-bold'
                                    : 'text-white/75 hover:text-white hover:bg-white/10 font-normal'
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

        {/* User Profile Footer (XIROLY & UseOneID Style) */}
        <div className="border-t border-white/10 p-3 bg-black/15 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[4px] bg-white text-[#0A77FE] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                TB
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-white truncate leading-tight">
                    {session.fullName}
                  </p>
                  <p className="text-[11px] text-white/70 truncate leading-tight">
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
