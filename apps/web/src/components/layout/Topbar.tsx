import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.tsx';

interface TopbarProps {
  onOpenMobile: () => void;
  isSidebarCollapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile, isSidebarCollapsed }) => {
  const { session } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header
      className={`h-14 fixed top-0 right-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 transition-all duration-200 rounded-none ${
        isSidebarCollapsed ? 'left-[68px]' : 'left-0 lg:left-[260px]'
      }`}
    >
      {/* Left side: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 rounded-[4px] text-slate-600 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, staff, ledger..."
            className="w-full h-8 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0A77FE] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right side: Notifications & User Profile (XIROLY Executive Style) */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-[4px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0A77FE]" />
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-[4px] hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-[4px] bg-[#0A77FE] text-white flex items-center justify-center text-xs font-bold shrink-0">
              TB
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {session.fullName}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {session.email}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-[4px] border border-slate-200 bg-white shadow-lg py-1 z-50 text-xs">
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
