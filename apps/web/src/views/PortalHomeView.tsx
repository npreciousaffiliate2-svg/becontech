import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button, Modal } from '@campusone/ui';
import { ACCREDITED_COLLEGE_DEPARTMENTS, ACCREDITED_HEALTH_PROGRAMMES } from '@campusone/contracts';
import { useApp } from '../context/AppContext.tsx';
import { PortalShell } from '../components/layout/PortalShell.tsx';

export const PortalHomeView: React.FC = () => {
  const { schoolProfile } = useApp();

  const [showBanner, setShowBanner] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedDeptCode, setSelectedDeptCode] = useState(
    ACCREDITED_COLLEGE_DEPARTMENTS[0]?.code || 'CHD'
  );

  const institutionName =
    schoolProfile?.institutionName?.replace(' Ltd', '') ||
    'Bethsaida College of Health Technology';
  const sessionYear = (schoolProfile?.activeSession || '2026/2027')
    .replace(/\s*Academic Session\s*/i, '')
    .trim();

  const activeDepartment =
    ACCREDITED_COLLEGE_DEPARTMENTS.find((d) => d.code === selectedDeptCode) ||
    ACCREDITED_COLLEGE_DEPARTMENTS[0];

  const departmentProgrammes = ACCREDITED_HEALTH_PROGRAMMES.filter(
    (p) => p.departmentCode === activeDepartment?.code
  );

  return (
    <PortalShell onOpenNotices={() => setIsNoticeModalOpen(true)}>
      {/* Subtle Top Notice Bar */}
      {showBanner && (
        <div className="bg-slate-800 text-slate-100 text-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            <p className="truncate">
              <span className="font-semibold text-white mr-2">{sessionYear} Admissions:</span>
              Online applications and screening registration are now open.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(true)}
                className="px-2.5 py-1 border border-slate-500 rounded-[4px] text-[11px] font-medium text-white hover:bg-slate-700 transition-colors"
              >
                Read more
              </button>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                aria-label="Dismiss notice"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Solid Institutional Hero */}
      <section className="bg-[#0B4D2B] text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug">
            Welcome to {institutionName} Portal
          </h1>
          <p className="text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Explore accredited health technology programmes, apply for {sessionYear} admission, and access student services.
          </p>
        </div>
      </section>

      {/* Clean Tabbed Programmes Section */}
      <main className="flex-1 bg-slate-50 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-slate-900 text-center">
            Our Programmes
          </h2>

          <div className="bg-white border border-slate-200 rounded-[4px] grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Department Tabs */}
            <div className="md:col-span-4 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 divide-y divide-slate-200/70">
              {ACCREDITED_COLLEGE_DEPARTMENTS.map((dept) => {
                const isActive = dept.code === activeDepartment?.code;
                return (
                  <button
                    key={dept.code}
                    type="button"
                    onClick={() => setSelectedDeptCode(dept.code)}
                    className={`w-full text-left px-5 py-3.5 text-xs font-semibold transition-colors border-l-[3px] ${
                      isActive
                        ? 'bg-white text-slate-900 border-l-[#0F7640]'
                        : 'text-slate-600 border-l-transparent hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {dept.name}
                  </button>
                );
              })}
            </div>

            {/* Programme Details */}
            <div className="md:col-span-8 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeDepartment?.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Applications are invited from suitably qualified candidates for admission into the following accredited programmes for the {sessionYear} academic session:
                </p>
              </div>

              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-800">
                {departmentProgrammes.map((prog) => (
                  <li key={prog.code}>
                    <span className="font-semibold">{prog.name}</span>
                    <span className="text-slate-500"> ({prog.regulatoryBody})</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Entry Requirements</p>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  <li>
                    Five (5) O&apos;Level credits in English Language, Mathematics, Biology, Chemistry, and Physics (WAEC, NECO, or NABTEB) in not more than two sittings.
                  </li>
                  <li>
                    Minimum score of {schoolProfile?.minimumCutoffScore || 50}% in the College Entrance CBT Screening Exercise.
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col items-start gap-2 text-xs font-semibold">
                <Link to="/apply" className="text-[#0F7640] hover:underline">
                  Online Application Form
                </Link>
                <Link to="/check-admission" className="text-[#0F7640] hover:underline">
                  Check Admission Status
                </Link>
                <Link to="/login" className="text-[#0F7640] hover:underline">
                  Returning Student &amp; Staff Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* General Notice Modal */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="General Notices"
        description={`Official notices for the ${sessionYear} academic session.`}
        size="lg"
      >
        <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-1.5 pb-5 border-b border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold uppercase text-slate-700">Admissions Unit</span>
              <span>{sessionYear} Session</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Online Admission Application &amp; CBT Screening
            </h3>
            <p>
              Prospective candidates seeking admission into accredited programmes should complete the Online Application Form, print their application slip, and await official CBT screening dates.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold uppercase text-slate-700">Registry &amp; ICT</span>
              <span>Newly Admitted Trainees</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Steps for Newly Admitted Students
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Click Check Admission Status on the portal homepage and enter your Application Number.</li>
              <li>Once confirmed admitted, click Login to sign in with your registered email and password.</li>
              <li>Print your Provisional Admission Letter and settle your Acceptance Fee.</li>
              <li>Once cleared, your Matriculation Number and course registration modules will be activated.</li>
            </ol>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              className="bg-[#0F7640] hover:bg-[#093322] rounded-[4px]"
              onClick={() => setIsNoticeModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </PortalShell>
  );
};
