import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Topbar } from './Topbar.tsx';
import { ToastProvider } from '@campusone/ui';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col">
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
          className={`flex-1 pt-14 transition-all duration-200 ${
            isSidebarCollapsed ? 'pl-16' : 'pl-0 lg:pl-64'
          }`}
        >
          <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};
