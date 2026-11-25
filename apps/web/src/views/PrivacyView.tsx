import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { PortalShell } from '../components/layout/PortalShell.tsx';

export const PrivacyView: React.FC = () => {
  const { schoolProfile } = useApp();
  const institutionName =
    schoolProfile?.institutionName?.replace(' Ltd', '') ||
    'Bethsaida College of Health Technology';
  const officialEmail = schoolProfile?.officialEmail || 'info@becohtech.edu.ng';

  return (
    <PortalShell>
      <main className="flex-1 bg-white py-12 sm:py-16 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto">
          <header className="pb-8 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              {institutionName} &middot; Effective November 2026
            </p>
          </header>

          <div className="py-8 space-y-8 text-sm text-slate-700 leading-relaxed">
            <p>
              {institutionName} is committed to protecting the personal data of prospective applicants, students, graduates, and staff in compliance with the Nigeria Data Protection Act (NDPA) and the Nigeria Data Protection Regulation (NDPR).
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
              <p>We collect only the information necessary to administer education and institutional operations:</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>Identity and bio-data: full legal name, gender, state of origin, local government area, and passport photograph.</li>
                <li>Contact details: email address, phone number, and residential address.</li>
                <li>Academic records: O&apos;Level examination grades (WAEC, NECO, NABTEB), CBT screening scores, course registrations, and clinical posting logs.</li>
                <li>Payment records: transaction references, invoice amounts, and receipt numbers. Card numbers and banking PINs are handled exclusively by PCI-DSS certified payment processors and are never stored by the college.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Identity Verification (UseOneID)</h2>
              <p>
                All applicants verify their identity through UseOneID during registration to auto-fill verified bio-data and complete mandatory national identity clearance. Data shared through UseOneID is transmitted over encrypted HTTPS connections and is used strictly for candidate identity verification.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. How We Use Your Information</h2>
              <p>
                Personal data is processed strictly for admissions evaluation, student matriculation, examination grading, clinical hospital placements, fee reconciliation, and statutory reporting to accredited Nigerian health regulatory boards.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Data Security &amp; Retention</h2>
              <p>
                Access to student and staff records is restricted through role-based access controls and server-side security policies. Academic transcripts and graduation registries are retained permanently as required by Nigerian higher education regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Your Data Rights &amp; Contact</h2>
              <p>
                You have the right to request access to your records or request correction of inaccurate personal information. Contact the Office of the Registrar at{' '}
                <a href={`mailto:${officialEmail}`} className="text-[#0F7640] hover:underline font-medium">
                  {officialEmail}
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
    </PortalShell>
  );
};
