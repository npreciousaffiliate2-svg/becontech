import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@campusone/ui';
import { useApp } from '../../context/AppContext.tsx';

interface PortalShellProps {
  children: React.ReactNode;
  onOpenNotices?: () => void;
}

export const PortalShell: React.FC<PortalShellProps> = ({ children, onOpenNotices }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { schoolProfile } = useApp();

  const institutionName =
    schoolProfile?.institutionName?.replace(' Ltd', '') ||
    'Bethsaida College of Health Technology';
  const officialPhone = schoolProfile?.officialPhone || '+234 907 578 9045';
  const officialEmail = schoolProfile?.officialEmail || 'info@becohtech.edu.ng';

  const isHome = location.pathname === '/' || location.pathname === '/portal';
  const isCheckStatus =
    location.pathname === '/check-admission' || location.pathname === '/prospective-students';
  const isApply = location.pathname === '/apply' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      {/* Unified Institutional Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <img
                src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
                alt={institutionName}
                className="w-8 h-8 rounded-[4px] object-contain shrink-0"
              />
              <span className="text-sm font-bold text-slate-900 leading-tight truncate">
                {institutionName}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
              <Link
                to="/"
                className={isHome ? 'text-[#0F7640] font-semibold' : 'hover:text-slate-900 transition-colors'}
              >
                Home
              </Link>
              <Link
                to="/check-admission"
                className={isCheckStatus ? 'text-[#0F7640] font-semibold' : 'hover:text-slate-900 transition-colors'}
              >
                Check Admission Status
              </Link>
              <Link
                to="/apply"
                className={isApply ? 'text-[#0F7640] font-semibold' : 'hover:text-slate-900 transition-colors'}
              >
                Online Application
              </Link>
              {onOpenNotices && (
                <button
                  type="button"
                  onClick={onOpenNotices}
                  className="hover:text-slate-900 transition-colors"
                >
                  Notices
                </button>
              )}
            </nav>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="bg-[#0F7640] hover:bg-[#093322] text-xs font-semibold px-4 rounded-[4px] shrink-0"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>
      </header>

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col">{children}</div>

      {/* Unified Institutional Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span>Need help? {officialPhone}</span>
            <span className="text-slate-300">|</span>
            <span>{officialEmail}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>
              &copy; {new Date().getFullYear()} {institutionName}
            </span>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
