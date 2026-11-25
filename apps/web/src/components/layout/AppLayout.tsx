import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Topbar } from './Topbar.tsx';
import { PortalHomeView } from '../../views/PortalHomeView.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { useToast } from '@campusone/ui';
import { SAVE_ERROR_EVENT } from '../../lib/sharedRecords.ts';
import { ShieldAlert, LogOut, Wrench, RefreshCw, Clock, Phone, Mail } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const {
    isImpersonating,
    stopImpersonating,
    session,
    persona,
    schoolProfile,
    updateSchoolProfile,
    isSuperAdmin,
    authReady,
    isAuthenticated,
    signOut,
  } = useApp();

  // Dynamic Browser Title Bar & Favicon Synchronization
  useEffect(() => {
    const logoUrl = schoolProfile?.logoUrl || '/BeonTech-Logo.png';
    // Update all icon link tags in document head
    const iconLinks = document.querySelectorAll("link[rel*='icon']");
    if (iconLinks.length > 0) {
      iconLinks.forEach((link) => {
        (link as HTMLLinkElement).href = logoUrl;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = logoUrl;
      document.head.appendChild(link);
    }

    // Set browser title bar text
    if (schoolProfile?.institutionName) {
      document.title = `CampusOne — ${schoolProfile.institutionName}`;
    }
  }, [schoolProfile?.logoUrl, schoolProfile?.institutionName]);

  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;

  const { showToast } = useToast();
  useEffect(() => {
    const onSaveError = (e: Event) => {
      const detail = (e as CustomEvent<{ kind: string; message: string }>).detail;
      showToast({
        type: 'danger',
        title: 'Changes not saved',
        message: `The database rejected the last change (${detail?.message || 'unknown error'}). It will be lost on refresh.`,
      });
    };
    window.addEventListener(SAVE_ERROR_EVENT, onSaveError);
    return () => window.removeEventListener(SAVE_ERROR_EVENT, onSaveError);
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const configured = Number(schoolProfile?.sessionTimeoutMins);
    const minutes = configured && configured >= 30 ? configured : 120;
    let timer = 0;
    let lastActivity = 0;

    const arm = () => {
      const now = Date.now();
      if (now - lastActivity < 15000 && timer !== 0) return;
      lastActivity = now;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void signOutRef.current();
      }, minutes * 60 * 1000);
    };

    arm();
    window.addEventListener('pointerdown', arm, { passive: true });
    window.addEventListener('keydown', arm, { passive: true });
    window.addEventListener('mousemove', arm, { passive: true });
    window.addEventListener('scroll', arm, { passive: true, capture: true });
    window.addEventListener('touchstart', arm, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
      window.removeEventListener('mousemove', arm);
      window.removeEventListener('scroll', arm, true);
      window.removeEventListener('touchstart', arm);
    };
  }, [isAuthenticated, schoolProfile?.sessionTimeoutMins]);

  if (!authReady) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!isAuthenticated) {
    if (location.pathname === '/') {
      return <PortalHomeView />;
    }
    return <Navigate to="/login" replace />;
  }

  const isMaintenanceActive = Boolean(schoolProfile?.maintenanceMode);
  const canBypassMaintenance =
    session.activeRole === 'SADMIN' || session.activeRole === 'PROVOST' || isSuperAdmin;

  // Full-Screen Industry-Standard Maintenance Gate for Regular Users
  if (isMaintenanceActive && !canBypassMaintenance) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans text-slate-800">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden">
          <div className="bg-[#093322] text-white p-6 text-center space-y-2">
            <img
              src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
              alt="College Crest"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
              }}
              className="w-14 h-14 mx-auto rounded-[4px] bg-white object-contain p-1 shadow-xs"
            />
            <h1 className="text-base font-extrabold uppercase tracking-wider">
              {schoolProfile?.institutionName?.replace(' Ltd', '') || 'Bethsaida College of Health Technology'}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-slate-950 rounded-[4px] text-[11px] font-extrabold uppercase">
              <Wrench className="w-3.5 h-3.5" />
              Scheduled Maintenance In Progress
            </div>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900">
                {schoolProfile?.maintenanceTitle || 'Scheduled System Maintenance'}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {schoolProfile?.maintenanceMessage ||
                  'The college portal is currently undergoing scheduled maintenance and system upgrades. Normal access will resume shortly.'}
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[4px] flex items-center justify-between text-amber-950">
              <span className="font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                Estimated Restoration Window:
              </span>
              <span className="font-extrabold">{schoolProfile?.maintenanceEta || 'Within 2 hours'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1.5 text-[11px] text-slate-600">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
                Need Urgent Assistance?
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#0F7640]" />
                  {schoolProfile?.officialPhone || '+234 907 578 9045'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#0F7640]" />
                  {schoolProfile?.officialEmail || 'info@becohtech.edu.ng'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3.5 py-2 bg-[#0F7640] hover:bg-[#093322] text-white rounded-[4px] font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Check System Status
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-[4px] font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasTopBanner = isImpersonating || isMaintenanceActive;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* ─── SYSTEM MAINTENANCE MODE BANNER (FOR ADMINISTRATORS) ─── */}
      {isMaintenanceActive && !isImpersonating && (
        <div className="fixed top-0 left-0 right-0 h-9 z-50 bg-amber-500 text-slate-950 px-3 sm:px-6 border-b border-amber-600 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">
              <strong>Maintenance Mode Active:</strong> Regular users currently see the maintenance notice ({schoolProfile?.maintenanceEta || 'Within 2 hours'}). You have administrator bypass access.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              void updateSchoolProfile({ maintenanceMode: false });
            }}
            className="px-2.5 py-1 bg-slate-950 text-white hover:bg-slate-800 rounded-[4px] font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs ml-3"
          >
            Restore Live Access
          </button>
        </div>
      )}

      {/* ─── ADMINISTRATIVE IMPERSONATION MODE BANNER ─── */}
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 h-9 z-50 bg-amber-500 text-slate-950 px-3 sm:px-6 border-b border-amber-600 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">
              <strong>Administrative Impersonation Mode:</strong> Currently viewing system as{' '}
              <strong>{persona.fullName}</strong> ({persona.scopeBadge || session.activeRole}).
            </span>
          </div>
          <button
            onClick={stopImpersonating}
            className="px-2.5 py-1 bg-slate-950 text-white hover:bg-slate-800 rounded-[4px] font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs ml-3"
            title="Exit impersonation and return to Super Administrator account"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Impersonation
          </button>
        </div>
      )}

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <Topbar
        onOpenMobile={() => setIsMobileOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <main
        className={`flex-1 ${hasTopBanner ? 'pt-24' : 'pt-14'} w-full max-w-full overflow-x-hidden transition-all duration-200 ${
          isSidebarCollapsed ? 'pl-0 lg:pl-[68px]' : 'pl-0 lg:pl-[260px]'
        }`}
      >
        <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
