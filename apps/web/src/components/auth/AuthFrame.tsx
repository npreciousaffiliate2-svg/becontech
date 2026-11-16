import React from 'react';
import { ShieldCheck, FileCheck, LockKeyhole } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const AUTH_SECURITY_LINE =
  'Secured by CampusOne Identity. Your sign-in is encrypted and audited under NDPA 2023.';

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
                CampusOne
              </span>
              <span className="text-[11px] text-emerald-200 block mt-1 font-sans">
                Bethsaida College of Health Tech
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 my-auto">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                College Academic & Management System.
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed font-normal">
                Seamlessly unifies admissions, bursary fee settlements, examination broadsheets, and clinical hospital postings in one accredited single-tenant cloud environment.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#13A348]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Tamper-proof audit trail</span>
                  <span className="text-emerald-100/70 leading-relaxed">
                    Every sign-in is cryptographically recorded. Consent and session activity stay auditable.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <FileCheck className="w-4 h-4 text-[#FEC10A]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Deterministic Broadsheet Calculations</span>
                  <span className="text-emerald-100/70 leading-relaxed">
                    Zero-error GPA/CGPA arithmetic tested against golden statutory grading standards.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <LockKeyhole className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Double-Entry Fee Ledger & E-Receipts</span>
                  <span className="text-emerald-100/70 leading-relaxed">
                    Instant QR-verifiable official receipts with Paystack & Remita bank settlement integration.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-emerald-100/70">
            <span>Accredited: CHPRBN • MLSCN • PCN</span>
            <span className="text-white font-medium">Session: 2026/2027</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};
