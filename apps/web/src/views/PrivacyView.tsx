import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { Button, Card, Badge } from '@campusone/ui';
import { useApp } from '../context/AppContext.tsx';

export const PrivacyView: React.FC = () => {
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
            NDPR &amp; GDPR Compliant
          </Badge>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-r from-[#0F7640] to-[#093322] rounded-[4px] p-6 sm:p-8 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[4px] bg-white/10 flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-emerald-200 font-medium">
                {institutionName} &bull; Nigeria Data Protection Regulation (NDPR) Standard
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl mt-2">
            This policy outlines how {institutionName} collects, protects, verifies, and retains student, applicant, and staff personal data in accordance with statutory privacy frameworks.
          </p>
        </div>

        {/* Content Body */}
        <Card className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[4px] shadow-sm space-y-8 text-xs leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              1. Information We Collect
            </h2>
            <p>
              To process admissions, academic registrations, examinations, clinical hospital postings, and transcript certifications, we collect:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li><strong>Bio-Data:</strong> Legal full name, date of birth, gender, marital status, state of origin, and LGA.</li>
              <li><strong>Contact Information:</strong> Active email address, phone number, and residential address.</li>
              <li><strong>Academic Credentials:</strong> O'Level examination records (WAEC, NECO, NABTEB), examination numbers, scratch card pins, and previous transcripts.</li>
              <li><strong>National Identity:</strong> National Identification Number (NIN) verified via UseOneID NIMC Tier-3 clearance.</li>
              <li><strong>Financial Transactions:</strong> Invoice references, bank settlement codes, and payment timestamps (card numbers and CVV codes are securely processed by PCI-DSS compliant gateways like Paystack and are never stored on our servers).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              2. UseOneID Identity &amp; Biometric Clearance
            </h2>
            <p>
              Our admissions portal integrates with <strong>UseOneID</strong> to facilitate 1-click identity auto-fill and secure national KYC screening. When you authorize UseOneID, your data is transmitted over TLS 1.3 encrypted connections directly from verified identity registries. We store only the verified authentication claim and clearance tier, with zero document duplication.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              3. Purpose of Processing
            </h2>
            <p>
              Your data is processed strictly for legitimate institutional purposes:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>Administering entrance screening, admissions evaluation, and quota allocation.</li>
              <li>Managing course enrollments, grade point average (CGPA) computation, and graduation registries.</li>
              <li>Scheduling statutory clinical postings with partner General Hospitals and primary healthcare centres.</li>
              <li>Reporting regulatory compliance to national healthcare education boards.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              4. Data Protection &amp; Audit Logging
            </h2>
            <p>
              Every access, record creation, grade update, and payment settlement is recorded in an immutable, cryptographically verifiable audit log with user IDs, timestamps, and network origins to prevent unauthorized alteration.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F7640]" />
              5. Your Rights as a Data Subject
            </h2>
            <p>
              Under the Nigeria Data Protection Act (NDPA) and NDPR, students and candidates have the right to request access to their stored academic and bio-data, request correction of erroneous records, and lodge inquiries regarding data handling by writing to the College Data Protection Officer (DPO) at <strong>dpo@becohtech.edu.ng</strong>.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>Effective Date: 1st November 2026</span>
            <span>Document Ref: BCHT/LEGAL/PRIVACY/2026-V1</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
