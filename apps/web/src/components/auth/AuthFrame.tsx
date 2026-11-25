import React from 'react';
import { ShieldCheck, FileCheck, LockKeyhole } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const AUTH_SECURITY_LINE =
  'Official institutional portal. Your account and personal records are kept safe and private.';

export const AuthFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { schoolProfile } = useApp();
  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      <div
        style={{
          background: 'linear-gradient(180deg, #093322 0%, #052015 100%)',
        }}
        className="hidden lg:flex w-1/2 relative items-center justify-center p-12 overflow-hidden select-none"
      >
        <div className="max-w-md flex flex-col justify-between h-full relative z-10 py-8">
          <div className="flex items-center gap-3">
            <img
              src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
              alt="School crest"
              className="w-10 h-10 rounded-[4px] bg-white object-contain p-1 shadow-md shrink-0"
            />
            <div>
              <span className="text-xl font-extrabold tracking-wider text-white uppercase block leading-none font-sans">
                {schoolProfile?.institutionAcronym || 'CampusOne'}
              </span>
              <span className="text-[11px] text-emerald-200 block mt-1 font-sans">
                {schoolProfile?.institutionName?.replace(' Ltd', '') || 'Bethsaida College of Health Technology'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 my-auto">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Welcome to Your Official College Portal.
              </h2>
              <p className="text-sm text-emerald-100/85 leading-relaxed font-normal">
                Everything you need for admissions, course registration, school fee payments, exam results, and hospital clinical postings in one easy-to-use place.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#13A348]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Admissions &amp; Course Registration</span>
                  <span className="text-emerald-100/75 leading-relaxed">
                    Apply for admission online, register your semester courses, and download lecture notes with ease.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <FileCheck className="w-4 h-4 text-[#FEC10A]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Results, Practice Tests &amp; Postings</span>
                  <span className="text-emerald-100/75 leading-relaxed">
                    View your semester grades, take practice tests for your board exams, and check your hospital posting schedule.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <LockKeyhole className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">School Fees &amp; Instant Receipts</span>
                  <span className="text-emerald-100/75 leading-relaxed">
                    Pay your tuition and hostel fees online and print your official college receipt right away.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-emerald-100/70">
            <span>{schoolProfile?.officialPhone || '+234 907 578 9045'}</span>
            <span className="text-white font-medium">
              Academic Session:{' '}
              {(schoolProfile?.activeSession || '2026/2027')
                .replace(/\s*Academic Session\s*/i, '')
                .trim()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        {schoolProfile?.maintenanceMode && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-[4px] text-xs text-amber-950 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase tracking-wider text-amber-900">
                {schoolProfile.maintenanceTitle || 'Scheduled System Maintenance'}
              </span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded-[3px] font-bold text-[10px]">
                ETA: {schoolProfile.maintenanceEta || 'Within 2 hours'}
              </span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              {schoolProfile.maintenanceMessage ||
                'The college portal is currently undergoing scheduled maintenance. Administrator sign-in remains active.'}
            </p>
          </div>
        )}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};
