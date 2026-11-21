import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@campusone/ui';
import { AppProvider } from './context/AppContext.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx';

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
import { DepartmentsView } from './views/DepartmentsView.tsx';
import { AnalyticsView } from './views/AnalyticsView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { SupportView } from './views/SupportView.tsx';
import { TermsView } from './views/TermsView.tsx';
import { PrivacyView } from './views/PrivacyView.tsx';
import { AdmissionStatusView } from './views/AdmissionStatusView.tsx';
import { PortalHomeView } from './views/PortalHomeView.tsx';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Portal, Auth & Legal Routes */}
            <Route path="/portal" element={<PortalHomeView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<LoginView />} />
            <Route path="/apply" element={<LoginView />} />
            <Route path="/forgot-password" element={<ForgotPasswordView />} />
            <Route path="/check-admission" element={<AdmissionStatusView />} />
            <Route path="/prospective-students" element={<AdmissionStatusView />} />
            <Route path="/terms" element={<TermsView />} />
            <Route path="/privacy" element={<PrivacyView />} />

            {/* Authenticated Application Layout */}
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute path="/" moduleName="Dashboard">
                    <DashboardView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/departments"
                element={
                  <ProtectedRoute path="/departments" moduleName="Departments & Programmes">
                    <DepartmentsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/departments/:tab"
                element={
                  <ProtectedRoute path="/departments" moduleName="Departments & Programmes">
                    <DepartmentsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admissions"
                element={
                  <ProtectedRoute path="/admissions" moduleName="Admissions & Registration">
                    <AdmissionsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admissions/:tab"
                element={
                  <ProtectedRoute path="/admissions" moduleName="Admissions & Registration">
                    <AdmissionsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students"
                element={
                  <ProtectedRoute path="/students" moduleName="Student Information System">
                    <StudentsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students/:tab"
                element={
                  <ProtectedRoute path="/students" moduleName="Student Information System">
                    <StudentsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary"
                element={
                  <ProtectedRoute path="/bursary" moduleName="Fees & Bursary">
                    <BursaryView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/:tab"
                element={
                  <ProtectedRoute path="/bursary" moduleName="Fees & Bursary">
                    <BursaryView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academics"
                element={
                  <ProtectedRoute path="/academics" moduleName="Academics & Examinations">
                    <AcademicsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academics/:tab"
                element={
                  <ProtectedRoute path="/academics" moduleName="Academics & Examinations">
                    <AcademicsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute path="/attendance" moduleName="Attendance Register">
                    <AttendanceView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance/:tab"
                element={
                  <ProtectedRoute path="/attendance" moduleName="Attendance Register">
                    <AttendanceView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/postings"
                element={
                  <ProtectedRoute path="/postings" moduleName="Clinical Postings & Rotations">
                    <ClinicalPostingsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/postings/:tab"
                element={
                  <ProtectedRoute path="/postings" moduleName="Clinical Postings & Rotations">
                    <ClinicalPostingsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning"
                element={
                  <ProtectedRoute path="/learning" moduleName="E-Learning & CBT">
                    <LearningView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning/:tab"
                element={
                  <ProtectedRoute path="/learning" moduleName="E-Learning & CBT">
                    <LearningView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute path="/staff" moduleName="Staff & Human Resources">
                    <StaffView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/:tab"
                element={
                  <ProtectedRoute path="/staff" moduleName="Staff & Human Resources">
                    <StaffView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hostels"
                element={
                  <ProtectedRoute path="/hostels" moduleName="Hostel & Accommodation">
                    <HostelsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hostels/:tab"
                element={
                  <ProtectedRoute path="/hostels" moduleName="Hostel & Accommodation">
                    <HostelsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timetable"
                element={
                  <ProtectedRoute path="/timetable" moduleName="Timetable & Scheduling">
                    <TimetableView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timetable/:tab"
                element={
                  <ProtectedRoute path="/timetable" moduleName="Timetable & Scheduling">
                    <TimetableView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute path="/analytics" moduleName="Executive Analytics">
                    <AnalyticsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/:tab"
                element={
                  <ProtectedRoute path="/analytics" moduleName="Executive Analytics">
                    <AnalyticsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute path="/reports" moduleName="Reports & Regulatory Compliance">
                    <ReportsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/:tab"
                element={
                  <ProtectedRoute path="/reports" moduleName="Reports & Regulatory Compliance">
                    <ReportsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute path="/messages" moduleName="Communications & Notices">
                    <CommunicationsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:tab"
                element={
                  <ProtectedRoute path="/messages" moduleName="Communications & Notices">
                    <CommunicationsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute path="/settings" moduleName="Settings & Platform Governance">
                    <AdminView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/:tab"
                element={
                  <ProtectedRoute path="/settings" moduleName="Settings & Platform Governance">
                    <AdminView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute path="/profile" moduleName="My Profile & Account">
                    <ProfileView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:tab"
                element={
                  <ProtectedRoute path="/profile" moduleName="My Profile & Account">
                    <ProfileView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute path="/support" moduleName="Help Desk & Support">
                    <SupportView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support/:tab"
                element={
                  <ProtectedRoute path="/support" moduleName="Help Desk & Support">
                    <SupportView />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<Navigate to="/settings" replace />} />
              <Route path="/admin/:tab" element={<Navigate to="/settings" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
};
