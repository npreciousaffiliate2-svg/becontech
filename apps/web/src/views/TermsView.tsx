import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Card, Badge } from '@campusone/ui';
import { useApp } from '../context/AppContext.tsx';

export const TermsView: React.FC = () => {
  const navigate = useNavigate();
  const { schoolProfile } = useApp();
  const institutionName = schoolProfile?.institutionName || 'Bethsaida College of Health Technology';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs rounded-[4px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
          <Badge variant="success" className="text-xs px-2.5 py-0.5 rounded-[4px]">
            Official Institutional Document
          </Badge>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-r from-[#0F7640] to-[#093322] rounded-[4px] p-6 sm:p-8 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[4px] bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Terms of Service</h1>
              <p className="text-xs text-emerald-200 font-medium">
                {institutionName} &bull; CampusOne Institutional Platform
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl mt-2">
            These terms govern your access to and use of the {institutionName} student information system, admissions portal, examination databases, and online services.
          </p>
        </div>

        {/* Content Body */}
        <Card className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[4px] shadow-sm space-y-8 text-xs leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or creating an account on the CampusOne portal for {institutionName}, you agree to be bound by these Terms of Service, all applicable laws of the Federal Republic of Nigeria, and statutory regulations stipulated by relevant Health Professional Regulatory Boards (including WAHEB, CHPRBN, RRBN, PCN, MLSCN, and DTRBN).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              2. User Accounts &amp; Credential Security
            </h2>
            <p>
              Candidates, students, faculty, and administrative staff are responsible for maintaining the confidentiality of their portal credentials. Sharing passwords, matriculation keys, or identity tokens is strictly prohibited. Any action performed through an authenticated account is deemed to be performed by the registered account holder.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              3. Admissions, Screening &amp; O'Level Credential Verification
            </h2>
            <p>
              Admission offers issued through this portal are provisional and conditional upon verification of submitted credentials (including WAEC, NECO, or NABTEB results, CBT entrance screening cut-offs, and National Identity / NIMC verification via UseOneID). Falsification or impersonation at any stage results in immediate forfeiture of admission and legal prosecution.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              4. Fee Payment, Invoicing &amp; Refund Policy
            </h2>
            <p>
              All application fees, acceptance fees, semester tuition, clinical posting levies, and board examination fees must be settled through authorized channels (Paystack, official Remita RRR, or designated institutional bank accounts).
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-[4px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Statutory Notice on Payments:</strong> Application fees and acceptance levies paid to {institutionName} are strictly non-refundable and non-transferable once processed.
              </span>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              5. Academic Integrity &amp; Student Code of Conduct
            </h2>
            <p>
              Students must uphold the highest standards of medical ethics and academic honesty. Unauthorized modification of grades, examination malpractice, forged clinical logbook signatures, or attendance manipulation results in disciplinary review and possible expulsion.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              6. Governance &amp; Contact
            </h2>
            <p>
              These terms are governed by the laws of the Federal Republic of Nigeria. Inquiries regarding portal terms should be directed to the Office of the Registrar at <strong>info@becohtech.edu.ng</strong> or through the institutional Help Desk.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>Last Updated: November 2026</span>
            <span>Document Ref: BCHT/LEGAL/TOS/2026-V1</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
