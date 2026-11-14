import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Topbar } from './Topbar.tsx';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
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
        className={`flex-1 pt-14 w-full max-w-full overflow-x-hidden transition-all duration-200 ${
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
