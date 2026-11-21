import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Info,
  X,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Button, Badge, Modal } from '@campusone/ui';
import { ACCREDITED_COLLEGE_DEPARTMENTS, ACCREDITED_HEALTH_PROGRAMMES } from '@campusone/contracts';
import { useApp } from '../context/AppContext.tsx';

export const PortalHomeView: React.FC = () => {
  const navigate = useNavigate();
  const { schoolProfile } = useApp();

  const [showBanner, setShowBanner] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedDeptCode, setSelectedDeptCode] = useState(
    ACCREDITED_COLLEGE_DEPARTMENTS[0]?.code || 'CHD'
  );

  const institutionName =
    schoolProfile?.institutionName?.replace(' Ltd', '') ||
    'Bethsaida College of Health Technology';
  const activeSession = schoolProfile?.activeSession || '2026/2027';
  const officialPhone = schoolProfile?.officialPhone || '+234 907 578 9045';
  const officialEmail = schoolProfile?.officialEmail || 'info@becohtech.edu.ng';

  const activeDepartment =
    ACCREDITED_COLLEGE_DEPARTMENTS.find((d) => d.code === selectedDeptCode) ||
    ACCREDITED_COLLEGE_DEPARTMENTS[0];

  const departmentProgrammes = ACCREDITED_HEALTH_PROGRAMMES.filter(
    (p) => p.departmentCode === activeDepartment?.code
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
              alt="College Crest"
              className="w-9 h-9 rounded-[4px] object-contain border border-slate-200 p-0.5 bg-white shrink-0"
            />
            <div className="min-w-0">
              <span className="text-sm font-extrabold text-slate-900 block leading-tight truncate">
                {institutionName}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                Official Institutional Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link to="/" className="text-[#0F7640] font-bold">
              Home
            </Link>
            <Link to="/check-admission" className="hover:text-[#0F7640] transition-colors">
              Check Admission Status
            </Link>
            <Link to="/apply" className="hover:text-[#0F7640] transition-colors">
              Online Application
            </Link>
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(true)}
              className="hover:text-[#0F7640] transition-colors"
            >
              General Notices
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="bg-[#0F7640] hover:bg-[#093322] text-xs font-bold px-4 rounded-[4px]"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Top Announcement Ticker */}
      {showBanner && (
        <div className="bg-[#093322] text-white border-b border-emerald-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <Info className="w-4 h-4 text-emerald-300 shrink-0" />
              <p className="truncate text-emerald-50">
                <strong className="font-bold text-white uppercase tracking-wide mr-1.5">
                  NOTICE ({activeSession} ADMISSIONS):
                </strong>
                Online screening applications and O&apos;Level verification for newly admitted trainees are now open.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(true)}
                className="px-2.5 py-1 border border-emerald-400/50 rounded-[4px] text-[11px] font-semibold text-emerald-100 hover:bg-white/10 transition-colors"
              >
                Read more
              </button>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                aria-label="Dismiss notice"
                className="p-1 text-emerald-300 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #093322 0%, #0F7640 60%, #052015 100%)',
        }}
        className="text-white py-14 sm:py-20 px-4 sm:px-6"
      >
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge
            variant="neutral"
            className="bg-white/10 text-emerald-100 border border-white/20 text-[11px] px-3 py-1 rounded-[4px]"
          >
            {activeSession} Academic Session &bull; Admissions Open
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Welcome to {institutionName} Portal
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Access accredited health technology programmes, submit your online admission application, check screening status, manage semester course registrations, and settle fees securely.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto bg-white text-[#0F7640] hover:bg-emerald-50 border-white font-bold text-xs px-5 h-10 rounded-[4px]"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/apply')}
            >
              Start {activeSession} Application
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto text-white border border-white/30 hover:bg-white/10 font-bold text-xs px-5 h-10 rounded-[4px]"
              leftIcon={<GraduationCap className="w-4 h-4" />}
              onClick={() => navigate('/check-admission')}
            >
              Check Admission Status
            </Button>
          </div>
        </div>
      </section>

      {/* Main Programmes Explorer (FUTO-Style Clean Tabbed Panel) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Our Accredited Programmes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Select a department below to view accredited programmes, statutory boards, and admission guidelines.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Department Tabs */}
          <div className="md:col-span-4 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 divide-y divide-slate-200/70">
            {ACCREDITED_COLLEGE_DEPARTMENTS.map((dept) => {
              const isActive = dept.code === activeDepartment?.code;
              return (
                <button
                  key={dept.code}
                  type="button"
                  onClick={() => setSelectedDeptCode(dept.code)}
                  className={`w-full text-left px-5 py-3.5 text-xs font-bold transition-colors flex items-center justify-between gap-2 border-l-4 ${
                    isActive
                      ? 'bg-white text-[#0F7640] border-l-[#0F7640]'
                      : 'text-slate-700 border-l-transparent hover:bg-slate-100/80'
                  }`}
                >
                  <span className="truncate">{dept.name}</span>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    {dept.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Programme Details */}
          <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F7640] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Department of {activeDepartment?.name}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                    {activeSession} Admission Screening &amp; Programmes
                  </h3>
                </div>
                <Badge variant="success" size="sm" className="rounded-[4px]">
                  {departmentProgrammes.length}{' '}
                  {departmentProgrammes.length === 1 ? 'Programme' : 'Programmes'}
                </Badge>
              </div>

              {/* Programmes List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Available Courses under this Department:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {departmentProgrammes.map((prog) => (
                    <div
                      key={prog.code}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {prog.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Code: {prog.code} &bull; Regulatory Board: {prog.regulatoryBody}
                        </span>
                      </div>
                      <Badge variant="neutral" size="sm" className="rounded-[4px] shrink-0">
                        {prog.regulatoryBody}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entry Requirements */}
              <div className="space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block">
                  General Admission Eligibility:
                </span>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7640] shrink-0 mt-0.5" />
                    <span>
                      Minimum of five (5) O&apos;Level credit passes in English Language, Mathematics, Biology, Chemistry, and Physics (WAEC, NECO, or NABTEB) in not more than two sittings.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7640] shrink-0 mt-0.5" />
                    <span>
                      Candidates must participate in the College Entrance CBT Screening Exercise and meet the {schoolProfile?.minimumCutoffScore || 50}% minimum cut-off score.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7640] shrink-0 mt-0.5" />
                    <span>
                      Fast-track your bio-data entry and national identity clearance with UseOneID 1-Click Auto-Fill during registration.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Direct Action Links */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-bold">
              <Link
                to="/apply"
                className="text-[#0F7640] hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                Online Application Form
              </Link>
              <Link
                to="/check-admission"
                className="text-[#0F7640] hover:underline flex items-center gap-1"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Check Admission Status
              </Link>
              <Link
                to="/login"
                className="text-slate-700 hover:text-[#0F7640] hover:underline flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Returning Student / Staff Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Phone className="w-3.5 h-3.5 text-[#0F7640]" />
              Need help? {officialPhone}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Mail className="w-3.5 h-3.5 text-[#0F7640]" />
              {officialEmail}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span>
              &copy; {new Date().getFullYear()} {institutionName}. All rights reserved.
            </span>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-[#0F7640] font-semibold">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-[#0F7640] font-semibold">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

      {/* General Notice Modal */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="General Institutional Notices"
        description={`Official admissions & academic directives for the ${activeSession} session.`}
        size="lg"
      >
        <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm">ALL PROSPECTIVE CANDIDATES</Badge>
              <span className="text-[11px] text-slate-400">{activeSession} Session</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              NOTICE: ONLINE ADMISSION APPLICATION &amp; SCREENING
            </h3>
            <p>
              Prospective candidates seeking admission into any accredited health technology programme should complete the online application form, print their CBT Screening Slip, and await official screening dates.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm">NEWLY ADMITTED STUDENTS</Badge>
              <span className="text-[11px] text-slate-400">Admissions Office</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              STEPS FOR NEWLY ADMITTED TRAINEES
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Click <strong>Check Admission Status</strong> on the portal homepage and enter your Application Number.</li>
              <li>Once confirmed admitted, click <strong>Login</strong> to sign in with your registered email and password.</li>
              <li>Download your Provisional Admission Letter and complete Acceptance Fee clearance.</li>
              <li>Upon clearance, your official Matriculation Number, course registration, and timetable will unlock automatically.</li>
            </ol>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              className="bg-[#0F7640] hover:bg-[#093322] rounded-[4px]"
              onClick={() => setIsNoticeModalOpen(false)}
            >
              Close Notices
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
