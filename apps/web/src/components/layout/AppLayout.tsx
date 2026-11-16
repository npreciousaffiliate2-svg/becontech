import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Topbar } from './Topbar.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { ShieldAlert, LogOut } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isImpersonating, stopImpersonating, session, persona, schoolProfile, authReady, isAuthenticated } = useApp();

  if (!authReady) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
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
        className={`flex-1 ${isImpersonating ? 'pt-24' : 'pt-14'} w-full max-w-full overflow-x-hidden transition-all duration-200 ${
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
