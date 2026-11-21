import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { PortalShell } from '../components/layout/PortalShell.tsx';

export const TermsView: React.FC = () => {
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
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              {institutionName} &middot; Effective November 2026
            </p>
          </header>

          <div className="py-8 space-y-8 text-sm text-slate-700 leading-relaxed">
            <p>
              These Terms of Service govern your access to and use of the {institutionName} institutional portal, including online admissions, student records, fee payments, course registration, and academic services. By using this portal, you agree to these terms.
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Eligibility &amp; Account Security</h2>
              <p>
                Applicants, enrolled students, and staff are responsible for safeguarding their login credentials. Sharing passwords, matriculation details, or identity verification tokens with third parties is prohibited. Actions performed through an authenticated account are attributed to the registered account holder.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Admissions &amp; Credential Verification</h2>
              <p>
                All offers of admission issued through this portal are provisional and subject to physical and electronic verification of O&apos;Level results (WAEC, NECO, or NABTEB), entrance CBT screening scores, and national identity records. Submission of falsified credentials or impersonation at any stage results in immediate withdrawal of admission.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Fees, Payments &amp; Refunds</h2>
              <p>
                Application fees, acceptance levies, tuition, hostel fees, and statutory examination charges must be paid only through authorized payment channels provided on the portal. Application and acceptance fees are non-refundable and non-transferable once processed.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Academic Regulations &amp; Conduct</h2>
              <p>
                Trainees must comply with college academic rules and the ethical standards of their respective regulatory councils (including CHPRBN, WAHEB, PCN, MLSCN, DTRBN, and RRBN). Any attempt to tamper with grades, attendance records, payment receipts, or portal systems will result in disciplinary action.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Governing Law &amp; Contact</h2>
              <p>
                These terms are governed by the laws of the Federal Republic of Nigeria. Questions regarding these terms should be sent to the Office of the Registrar at{' '}
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
