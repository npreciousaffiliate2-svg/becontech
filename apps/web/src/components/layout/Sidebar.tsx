import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
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
  LifeBuoy,
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
  const { session, persona, schoolProfile, isImpersonating, signOut } = useApp();
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

  const isStudent = session.activeRole === 'STU' || session.activeRole === 'SPON';

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
          name: isStudent ? 'My Grades & Transcripts' : 'Academics & Exams',
          path: '/academics',
          icon: <GraduationCap size={19} />,
          subItems: isStudent
            ? [
                { name: 'My Broadsheet Results', path: '/academics/broadsheet' },
                { name: 'Official Transcript', path: '/academics/transcript' },
              ]
            : [
                { name: 'Score Entry', path: '/academics/scores' },
                { name: 'Broadsheets', path: '/academics/broadsheet' },
                { name: 'Transcripts', path: '/academics/transcript' },
                { name: 'Curriculum & Courses', path: '/academics/curriculum' },
              ],
        },
        {
          name: isStudent ? 'My Attendance' : 'Attendance Register',
          path: '/attendance',
          icon: <CalendarCheck size={19} />,
          subItems: isStudent
            ? [
                { name: 'My Class Attendance', path: '/attendance/register' },
                { name: 'My Course Summaries', path: '/attendance/courses' },
                { name: 'My Exam Clearance', path: '/attendance/clearance' },
              ]
            : [
                { name: 'Daily Class Register', path: '/attendance/register' },
                { name: 'Course Summaries', path: '/attendance/courses' },
                { name: 'Exam Clearance', path: '/attendance/clearance' },
                { name: 'Medical Waivers', path: '/attendance/waivers' },
              ],
        },
        {
          name: isStudent ? 'My Clinical Posting' : 'Clinical Postings',
          path: '/postings',
          icon: <Stethoscope size={19} />,
          subItems: isStudent
            ? [
                { name: 'My Hospital Posting', path: '/postings/allocations' },
                { name: 'My Clinical Logbook', path: '/postings/logbooks' },
                { name: 'Posting Clearance', path: '/postings/clearance' },
              ]
            : [
                { name: 'Hospital Allocations', path: '/postings/allocations' },
                { name: 'Training Hospitals', path: '/postings/sites' },
                { name: 'Logbook Grading', path: '/postings/logbooks' },
                { name: 'Final Clearance', path: '/postings/clearance' },
              ],
        },
        {
          name: isStudent ? 'Course Materials & CBT' : 'E-Learning',
          path: '/learning',
          icon: <BookOpen size={19} />,
          subItems: isStudent
            ? [
                { name: 'Course Materials & Library', path: '/learning/materials' },
                { name: 'Take Practice Exams', path: '/learning/cbt' },
                { name: 'My Test Results', path: '/learning/results' },
              ]
            : [
                { name: 'Course Materials', path: '/learning/materials' },
                { name: 'Practice Tests', path: '/learning/cbt' },
                { name: 'Question Bank', path: '/learning/questions' },
                { name: 'Student Results', path: '/learning/results' },
              ],
        },
      ],
    },
    {
      group: 'Finance & Operations',
      items: [
        {
          name: isStudent ? 'My Tuition & Fees' : 'Fees & Bursary',
          path: '/bursary',
          icon: <CreditCard size={19} />,
          subItems: isStudent
            ? [
                { name: 'My Tuition Account', path: '/bursary/ledger' },
                { name: 'My Payment Receipts', path: '/bursary/receipts' },
              ]
            : [
                { name: 'Student Master Ledger', path: '/bursary/ledger' },
                { name: 'Payment Receipts', path: '/bursary/receipts' },
                { name: 'Fee Schedules', path: '/bursary/structure' },
                { name: 'Debtors & Installments', path: '/bursary/debtors' },
                { name: 'Bank Reconciliation', path: '/bursary/reconciliation' },
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
            { name: 'Licensing Audits', path: '/staff/licensing' },
          ],
        },
        {
          name: isStudent ? 'My Accommodation' : 'Hostels',
          path: '/hostels',
          icon: <Building2 size={19} />,
          subItems: isStudent
            ? [
                { name: 'My Bed Space Pass', path: '/hostels/allocations' },
                { name: 'Check-In Clearance', path: '/hostels/checkin' },
              ]
            : [
                { name: 'Room Inventory', path: '/hostels/inventory' },
                { name: 'Bed Allocations', path: '/hostels/allocations' },
                { name: 'Check-In & Clearance', path: '/hostels/checkin' },
                { name: 'Maintenance & Repairs', path: '/hostels/maintenance' },
              ],
        },
        {
          name: isStudent ? 'My Timetable' : 'Timetable',
          path: '/timetable',
          icon: <Calendar size={19} />,
          subItems: isStudent
            ? [
                { name: 'Class Timetables', path: '/timetable/classes' },
                { name: 'Practical & Lab Sessions', path: '/timetable/practicals' },
              ]
            : [
                { name: 'Class Timetables', path: '/timetable/classes' },
                { name: 'Practical & Lab Sessions', path: '/timetable/practicals' },
                { name: 'Lecture Halls & Venues', path: '/timetable/venues' },
                { name: 'Faculty Teaching Load', path: '/timetable/faculty' },
              ],
        },
      ],
    },
    {
      group: 'Administration & System',
      items: [
        {
          name: 'Reports & Accreditation',
          path: '/reports',
          icon: <FileCheck size={19} />,
          subItems: [
            { name: 'Accreditation Dossiers', path: '/reports/accreditation' },
            { name: 'Council Exam Rosters', path: '/reports/rosters' },
            { name: 'Standard Reports', path: '/reports/repository' },
            { name: 'Custom Report Builder', path: '/reports/builder' },
          ],
        },
        {
          name: isStudent ? 'College Notice Board' : 'Messages & Notices',
          path: '/messages',
          icon: <MessageSquare size={19} />,
          subItems: isStudent
            ? [
                { name: 'Official Circulars', path: '/messages/notices' },
              ]
            : [
                { name: 'Broadcast Dispatch', path: '/messages/broadcasts' },
                { name: 'Official Circulars', path: '/messages/notices' },
                { name: 'Delivery Logs', path: '/messages/logs' },
                { name: 'Automated Triggers', path: '/messages/triggers' },
              ],
        },
        {
          name: 'Help & Support',
          path: '/support',
          icon: <LifeBuoy size={19} />,
          subItems: [
            { name: 'Support Tickets', path: '/support?tab=tickets' },
            { name: 'Knowledge Base & FAQ', path: '/support?tab=faq' },
            { name: 'Help Directory', path: '/support?tab=directory' },
          ],
        },
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
        {
          name: 'My Profile',
          path: '/profile',
          icon: <User size={19} />,
        },
      ],
    },
  ];

  // Filter navigation groups based on active persona's allowedModules
  const allowedPaths = new Set(persona?.allowedModules || ['/']);
  const filteredNavGroups: NavGroup[] = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => allowedPaths.has(item.path)),
    }))
    .filter((group) => group.items.length > 0);

  const handleSignOut = () => {
    signOut().finally(() => navigate('/login'));
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

      {/* ─── SIDEBAR (Health Green — Bethsaida Identity) ─── */}
      <aside
        style={{
          width: isCollapsed ? '68px' : '260px',
          top: isImpersonating || Boolean(schoolProfile?.maintenanceMode) ? '36px' : '0',
          background: 'linear-gradient(180deg, #093322 0%, #052015 100%)',
          boxShadow: 'none',
          borderRadius: '0px',
        }}
        className={`fixed bottom-0 left-0 z-40 flex flex-col justify-between text-white transition-all duration-200 select-none rounded-none overflow-x-hidden ${
          isMobileOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto border-r border-white/10 visible'
            : '-translate-x-full opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto lg:translate-x-0 lg:border-r lg:border-white/10 lg:visible invisible'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 w-full overflow-x-hidden">
          {/* Brand Header */}
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between shrink-0 w-full overflow-hidden">
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
                  alt="BeonTech Platform Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                  }}
                  className="w-8 h-8 rounded-[4px] bg-white object-contain p-0.5 shrink-0 shadow-sm"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-extrabold tracking-wider text-white uppercase font-sans leading-tight">
                    CampusOne
                  </span>
                  <span className="text-[10px] text-emerald-200/80 truncate font-sans">
                    {schoolProfile?.institutionName || 'Bethsaida College of Health Tech'}
                  </span>
                </div>
              </div>
            ) : (
              <img
                src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
                alt="BeonTech Platform Logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                }}
                className="w-8 h-8 bg-white rounded-[4px] object-contain p-0.5 mx-auto border border-white/20 shadow-sm"
              />
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
          <nav className="flex-1 overflow-y-auto overflow-x-hidden w-full px-2 py-3 pb-10 space-y-4">
            {filteredNavGroups.map((group) => (
              <div key={group.group} className="space-y-1 w-full min-w-0">
                {!isCollapsed ? (
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300/60 px-3.5 py-1 select-none truncate">
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
                    <div key={item.path} className="space-y-0.5 w-full min-w-0">
                      <div className="flex items-center w-full min-w-0">
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
                            return `flex-1 min-w-0 flex items-center justify-between px-3.5 py-2.5 rounded-[4px] text-[14px] transition-all duration-150 ${
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
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className={`${isCurrentActive ? 'text-[#0F7640]' : 'text-white/90'} shrink-0`}>
                                  {item.icon}
                                </span>
                                {!isCollapsed && <span className="truncate flex-1 min-w-0">{item.name}</span>}
                              </div>
                            );
                          }}
                        </NavLink>

                        {/* Expand/Collapse Chevron */}
                        {!isCollapsed && hasSubItems && (
                          <button
                            type="button"
                            onClick={(e) => toggleSubmenu(item.path, e)}
                            className="p-2 text-emerald-200/70 hover:text-white hover:bg-white/10 rounded-[4px] ml-1 transition-colors shrink-0"
                            aria-label={`Toggle ${item.name} sub-menu`}
                          >
                            {isMenuOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                        )}
                      </div>

                      {/* Clean Sub-Menu Items (Subtle Low-Opacity Background, No Left Line) */}
                      {!isCollapsed && hasSubItems && isMenuOpen && (
                        <div className="py-1 space-y-0.5 w-full min-w-0 overflow-x-hidden">
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
                                className={`block w-full min-w-0 pl-10 pr-3 py-2 text-[13px] rounded-[4px] transition-colors truncate ${
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

        {/* User Profile Footer (Synchronized with Header Profile & Navigation to /profile) */}
        <div className="border-t border-white/10 p-3 bg-black/20 shrink-0 w-full overflow-x-hidden">
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => {
                onCloseMobile();
                navigate('/profile');
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:bg-white/[0.08] p-1.5 -m-1.5 rounded-[4px] transition-colors flex-1"
              title="View & Edit My Profile"
            >
              <div className="w-8 h-8 rounded-[4px] bg-[#107C41] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/30 overflow-hidden">
                {persona?.avatarUrl ? (
                  <img
                    src={persona.avatarUrl}
                    alt={persona.fullName || session.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  persona?.initials || 'C1'
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-white truncate leading-tight">
                    {persona.fullName || session.fullName}
                  </p>
                  <p className="text-[11px] text-emerald-300/80 truncate leading-tight">
                    {persona?.scopeBadge || session.activeRole}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-1 shrink-0">
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
