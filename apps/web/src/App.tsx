import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@campusone/ui';
import { AppProvider } from './context/AppContext.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';

import { LoginView } from './views/LoginView.tsx';
import { ForgotPasswordView } from './views/ForgotPasswordView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { AdmissionsView } from './views/AdmissionsView.tsx';
import { StudentsView } from './views/StudentsView.tsx';
import { BursaryView } from './views/BursaryView.tsx';
import { AcademicsView } from './views/AcademicsView.tsx';
import { AttendanceView } from './views/AttendanceView.tsx';
import { ClinicalPostingsView } from './views/ClinicalPostingsView.tsx';
import { LearningView } from './views/LearningView.tsx';
import { StaffView } from './views/StaffView.tsx';
import { HostelsView } from './views/HostelsView.tsx';
import { TimetableView } from './views/TimetableView.tsx';
import { CommunicationsView } from './views/CommunicationsView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { AdminView } from './views/AdminView.tsx';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<LoginView />} />
            <Route path="/forgot-password" element={<ForgotPasswordView />} />

            {/* Authenticated Application Layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardView />} />
              <Route path="/admissions" element={<AdmissionsView />} />
              <Route path="/students" element={<StudentsView />} />
              <Route path="/bursary" element={<BursaryView />} />
              <Route path="/academics" element={<AcademicsView />} />
              <Route path="/attendance" element={<AttendanceView />} />
              <Route path="/postings" element={<ClinicalPostingsView />} />
              <Route path="/learning" element={<LearningView />} />
              <Route path="/staff" element={<StaffView />} />
              <Route path="/hostels" element={<HostelsView />} />
              <Route path="/timetable" element={<TimetableView />} />
              <Route path="/messages" element={<CommunicationsView />} />
              <Route path="/reports" element={<ReportsView />} />
              <Route path="/admin" element={<AdminView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
};
