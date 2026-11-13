import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Check,
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.tsx';

interface TopbarProps {
  onOpenMobile: () => void;
  isSidebarCollapsed: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
  type: 'success' | 'warning' | 'info';
  link: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Tuition Fee Payment Verified',
    desc: 'Emmanuel Chukwuma paid ₦140,000 for Medical Laboratory 100L via Remita.',
    time: '5 mins ago',
    isRead: false,
    type: 'success',
    link: '/bursary?tab=receipts',
  },
  {
    id: 'n2',
    title: 'Harmattan Broadsheet Submitted',
    desc: 'Community Health 200L exam results ready for Provost publication review.',
    time: '1 hour ago',
    isRead: false,
    type: 'warning',
    link: '/academics?tab=broadsheet',
  },
  {
    id: 'n3',
    title: 'Batch 2026 Admissions Ready',
    desc: '45 candidates screened and awaiting final admission letter approvals.',
    time: '3 hours ago',
    isRead: false,
    type: 'info',
    link: '/admissions?tab=admission_lists',
  },
  {
    id: 'n4',
    title: 'Clinical Logbook Clearance',
    desc: '12 hospital posting logs submitted for General Hospital Asaba.',
    time: 'Yesterday',
    isRead: true,
    type: 'info',
    link: '/postings?tab=logbooks',
  },
];

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile, isSidebarCollapsed }) => {
  const { session } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string, link: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setIsNotificationsOpen(false);
    navigate(link);
  };

  // ─── Dynamic Breadcrumbs Computation (Xiroly Style) ───
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const basePath = '/' + (pathSegments[0] || '');
    const subRoute = pathSegments[1];
    const searchParams = new URLSearchParams(location.search);
    const tabKey = subRoute || searchParams.get('tab');

    const crumbs: { label: string; path?: string }[] = [];

    if (location.pathname === '/') {
      crumbs.push({ label: 'Overview' });
      return crumbs;
    }

    const routeMap: Record<string, { module: string; tabs: Record<string, string> }> = {
      '/departments': {
        module: 'Departments',
        tabs: {
          directory: 'Department Directory',
          programmes: 'Accredited Programmes',
          hods: 'Heads of Department',
          faculty: 'Faculty Roster',
          courses: 'Curriculum & Courses',
        },
      },
      '/admissions': {
        module: 'Admissions',
        tabs: {
          applications: 'All Applications',
          screening: 'Screening & Tests',
          lists: 'Admission Lists',
          admission_lists: 'Admission Lists',
          enrolled: 'Accepted & Enrolled',
        },
      },
      '/students': {
        module: 'Students',
        tabs: {
          directory: 'Student Directory',
          lifecycle: 'Status Lifecycle',
          'id-cards': 'Student ID Cards',
          id_cards: 'Student ID Cards',
          clinical: 'Clinical Clearance',
        },
      },
      '/academics': {
        module: 'Academics & Exams',
        tabs: {
          scores: 'Score Entry',
          broadsheet: 'Broadsheets',
          transcript: 'Transcripts',
          curriculum: 'Curriculum & Courses',
        },
      },
      '/attendance': {
        module: 'Attendance Register',
        tabs: {
          register: 'Daily Class Register',
          courses: 'Course Summaries',
          clearance: 'Exam Clearance',
          eligibility: 'Exam Clearance',
          waivers: 'Medical Appeals & Waivers',
        },
      },
      '/postings': {
        module: 'Clinical Postings',
        tabs: {
          allocations: 'Hospital Allocations',
          sites: 'Training Hospitals',
          logbooks: 'Logbook Grading',
          clearance: 'Final Clearance',
        },
      },
      '/learning': {
        module: 'E-Learning',
        tabs: {
          materials: 'Course Materials',
          cbt: 'Practice Tests',
          questions: 'Question Bank',
          results: 'Student Results',
        },
      },
      '/bursary': {
        module: 'Fees & Bursary',
        tabs: {
          ledger: 'Student Master Ledger',
          receipts: 'Payment Receipts',
          structure: 'Fee Schedules',
          debtors: 'Debtors & Installments',
          reconciliation: 'Bank Reconciliation',
        },
      },
      '/staff': {
        module: 'Staff & HR',
        tabs: {
          directory: 'Staff Directory',
          payroll: 'Monthly Salaries',
          leave: 'Staff Leaves',
        },
      },
      '/hostels': {
        module: 'Hostels',
        tabs: {},
      },
      '/timetable': {
        module: 'Timetable',
        tabs: {},
      },
      '/analytics': {
        module: 'Analytics',
        tabs: {
          enrollment: 'Enrollment & Growth',
          fees: 'Fee Recovery',
          financial: 'Fee Recovery',
          academic: 'Academic Pass Rates',
          clinical: 'Clinical Compliance',
        },
      },
      '/settings': {
        module: 'Settings',
        tabs: {
          audit: 'Activity History',
          permissions: 'User Permissions',
          rbac: 'User Permissions',
          school: 'School Settings',
          tenant: 'School Settings',
          security: 'Security & 2FA',
        },
      },
      '/admin': {
        module: 'Settings',
        tabs: {
          audit: 'Activity History',
          permissions: 'User Permissions',
          rbac: 'User Permissions',
          school: 'School Settings',
          tenant: 'School Settings',
          security: 'Security & 2FA',
        },
      },
      '/reports': {
        module: 'Reports & Accreditation',
        tabs: {},
      },
      '/messages': {
        module: 'Messages & Notices',
        tabs: {},
      },
    };

    const currentRoute = routeMap[basePath];
    if (currentRoute) {
      crumbs.push({ label: currentRoute.module, path: tabKey ? basePath : undefined });
      if (tabKey && currentRoute.tabs[tabKey]) {
        crumbs.push({ label: currentRoute.tabs[tabKey] });
      }
    } else {
      crumbs.push({ label: basePath.replace('/', '').toUpperCase() });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const filteredNotifications =
    notificationTab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <header
      className={`h-14 fixed top-0 right-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 transition-all duration-200 rounded-none ${
        isSidebarCollapsed ? 'left-[68px]' : 'left-0 lg:left-[260px]'
      }`}
    >
      {/* ─── Left Side: Hamburger & Dynamic Breadcrumbs ─── */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-[4px] text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-slate-800" />
        </button>

        {/* Mobile Header: Clean & Uncluttered Logo/Title (No decorative dot) */}
        <div className="sm:hidden flex items-center min-w-0">
          <span className="text-xs font-bold text-slate-900 truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label || 'Overview'}
          </span>
        </div>

        {/* Desktop / Tablet Breadcrumbs (Xiroly Style — Clean, No Dots) */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 min-w-0">
          <Link
            to="/"
            className="text-slate-400 hover:text-[#0F7640] transition-colors shrink-0"
          >
            CampusOne
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="hover:text-[#0F7640] text-slate-600 transition-colors truncate max-w-[140px]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold truncate max-w-[180px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* ─── Right Side: Search, Notifications (UseOneID Style), Profile ─── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Desktop Search Bar (Hidden on Mobile for Zero Clutter) */}
        <div className="relative w-48 lg:w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, staff, ledger..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] focus:bg-white transition-colors"
          />
        </div>

        {/* Notifications Flyout (UseOneID Style) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-[4px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-[14px] h-[14px] rounded-[4px] bg-[#107C41] text-white text-[9px] font-extrabold flex items-center justify-center leading-none shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Floating Notifications Popover */}
          {isNotificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[4px] border border-slate-200 bg-white z-50 text-xs animate-in fade-in duration-150"
              style={{
                boxShadow: '0 2px 6px 2px rgba(60, 64, 67, 0.15), 0 1px 2px 0 rgba(60, 64, 67, 0.30)',
              }}
            >
              {/* Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-100 text-[#0F7640] text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#0F7640] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="px-3 py-1.5 border-b border-slate-100 flex gap-2 text-xs bg-white">
                <button
                  onClick={() => setNotificationTab('all')}
                  className={`px-2.5 py-1 rounded-[4px] font-semibold transition-colors ${
                    notificationTab === 'all'
                      ? 'bg-emerald-50 text-[#0F7640]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotificationTab('unread')}
                  className={`px-2.5 py-1 rounded-[4px] font-semibold transition-colors ${
                    notificationTab === 'unread'
                      ? 'bg-emerald-50 text-[#0F7640]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <p className="text-xs">No notifications to display</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id, n.link)}
                      className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                        !n.isRead ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'success' && (
                          <div className="w-6 h-6 rounded-[4px] bg-emerald-100 text-[#13A348] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {n.type === 'warning' && (
                          <div className="w-6 h-6 rounded-[4px] bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {n.type === 'info' && (
                          <div className="w-6 h-6 rounded-[4px] bg-emerald-100 text-[#0F7640] flex items-center justify-center">
                            <FileCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {n.desc}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#107C41] shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown (Brand Green Accent) */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-[4px] hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-[4px] bg-[#107C41] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              TB
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {session.fullName}
              </p>
              <p className="text-[10px] text-emerald-700 font-medium leading-tight">
                {session.activeRole}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 mt-1.5 w-52 rounded-[4px] border border-slate-200 bg-white py-1 z-50 text-xs"
              style={{
                boxShadow: '0 2px 6px 2px rgba(60, 64, 67, 0.15), 0 1px 2px 0 rgba(60, 64, 67, 0.30)',
              }}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{session.fullName}</p>
                <p className="text-slate-400 text-[11px] truncate">{session.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/admin?tab=tenant');
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                School Settings
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/login');
                }}
                className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
