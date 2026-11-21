import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Search, ArrowLeft, CheckCircle2, Clock, ShieldCheck, AlertCircle, FileCheck } from 'lucide-react';
import { Button, Card, Badge, Input, Select } from '@campusone/ui';
import { useApp } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';

interface PublicStatusResult {
  applicationNumber: string;
  fullName: string;
  programme: string;
  programmeCode?: string;
  department: string;
  regulatoryBody?: string;
  status: string;
  olevelStatus: string;
  applicationFeePaid: boolean;
  acceptanceFeePaid: boolean;
  matricNumber?: string;
  cbtDate?: string;
}

export const AdmissionStatusView: React.FC = () => {
  const navigate = useNavigate();
  const { schoolProfile, candidates } = useApp();
  const [studentType, setStudentType] = useState('diploma');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicStatusResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const institutionName =
    schoolProfile?.institutionName?.replace(' Ltd', '') || 'Bethsaida College of Health Technology';

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;

    setLoading(true);
    setNotFound(false);
    setErrorMsg('');
    setResult(null);

    try {
      // 1. Primary: Query tamper-proof, zero-PII public RPC in Supabase
      const { data, error } = await supabase.rpc('check_admission_status', { p_query: cleaned });
      if (!error && data) {
        setResult(data as PublicStatusResult);
        setLoading(false);
        return;
      }

      // 2. Local session fallback if RPC is not yet deployed on remote DB
      const localMatch = (candidates || []).find(
        (c) =>
          c.applicationNumber?.toLowerCase() === cleaned.toLowerCase() ||
          c.email?.toLowerCase() === cleaned.toLowerCase()
      );
      if (localMatch) {
        setResult({
          applicationNumber: localMatch.applicationNumber,
          fullName: localMatch.fullName,
          programme: localMatch.programme,
          programmeCode: localMatch.programmeCode,
          department: localMatch.department,
          regulatoryBody: localMatch.regulatoryBody,
          status: localMatch.status,
          olevelStatus: localMatch.olevelStatus,
          applicationFeePaid: Boolean(localMatch.applicationFeePaid),
          acceptanceFeePaid: Boolean(localMatch.acceptanceFeePaid),
          matricNumber: localMatch.matricNumber,
          cbtDate: localMatch.cbtDate,
        });
      } else {
        setNotFound(true);
      }
    } catch (err: any) {
      setErrorMsg('Unable to check admission status right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Top Institutional Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
              alt="College Crest"
              className="w-9 h-9 rounded-[4px] object-contain border border-slate-200 p-0.5 bg-white"
            />
            <div>
              <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                {institutionName}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {schoolProfile?.activeSession || '2026/2027'} Admissions &amp; Screening Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs rounded-[4px]"
              onClick={() => navigate('/login')}
            >
              Portal Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs bg-[#0F7640] hover:bg-[#093322] rounded-[4px]"
              onClick={() => navigate('/apply')}
            >
              Apply Now
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-5">
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[4px] shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-[4px] bg-emerald-50 border border-emerald-200 text-[#0F7640] flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Check Admission Status
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Confirm your {schoolProfile?.activeSession || '2026/2027'} provisional admission and screening status.
              </p>
            </div>

            <form onSubmit={handleCheckStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Programme Category</label>
                <Select
                  value={studentType}
                  onChange={setStudentType}
                  options={[
                    { value: 'diploma', label: 'National Diploma (ND) / Health Technician' },
                    { value: 'hnd', label: 'Higher National Diploma (HND)' },
                    { value: 'certificate', label: 'Certificate / JCHEW & Health Assistant' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Application Number or Registered Email
                </label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. APP/2026/0142 or candidate@email.com"
                  required
                />
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-[#0F7640] hover:bg-[#093322] text-xs font-bold h-10 rounded-[4px]"
                leftIcon={<Search className="w-3.5 h-3.5" />}
              >
                Confirm Admission Status
              </Button>
            </form>

            {/* Result Card */}
            {result && (
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#0F7640]" />
                    Screening Record Found
                  </span>
                  <Badge
                    variant={
                      result.status === 'ADMITTED' || result.status === 'ENROLLED'
                        ? 'success'
                        : result.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {result.status}
                  </Badge>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-[4px] p-4 space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Candidate Name:</span>
                    <span className="font-bold text-slate-900 text-right">{result.fullName}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Application No.:</span>
                    <span className="font-bold text-[#0F7640] text-right">{result.applicationNumber}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Programme:</span>
                    <span className="font-semibold text-slate-800 text-right">{result.programme}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-700 text-right">{result.department}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">O'Level Clearance:</span>
                    <span className="font-semibold text-slate-800 text-right">{result.olevelStatus}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Application Fee:</span>
                    <span className={`font-bold text-right ${result.applicationFeePaid ? 'text-[#0F7640]' : 'text-amber-700'}`}>
                      {result.applicationFeePaid ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>
                  {result.matricNumber && (
                    <div className="flex justify-between gap-2 pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Matriculation No.:</span>
                      <span className="font-extrabold text-[#0F7640] text-right">{result.matricNumber}</span>
                    </div>
                  )}
                </div>

                {result.status === 'ADMITTED' && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-emerald-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#0F7640]">
                      <CheckCircle2 className="w-4 h-4" />
                      Congratulations — Provisional Admission Offered!
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      Sign in to your portal account to print your Provisional Admission Letter, pay your Acceptance Fee, and activate your official Matriculation Number.
                    </p>
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-[#0F7640] hover:bg-[#093322] text-xs rounded-[4px]"
                      onClick={() => navigate('/login')}
                    >
                      Proceed to Portal Login
                    </Button>
                  </div>
                )}

                {(result.status === 'APPLIED' || result.status === 'SCREENED') && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[4px] text-xs text-amber-950 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Your application is currently in the <strong>{result.status}</strong> stage. Sign in to track your CBT screening schedule and O'Level clearance.
                    </span>
                  </div>
                )}
              </div>
            )}

            {notFound && (
              <div className="mt-5 p-3.5 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">No Application Found</span>
                  <span className="text-[11px] text-red-800">
                    No screening record matched <strong>{query}</strong>. Verify your Application Number or submit a new application.
                  </span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800">
                {errorMsg}
              </div>
            )}
          </Card>

          {/* Institutional Support Note */}
          <div className="p-4 bg-white border border-dashed border-slate-300 rounded-[4px] text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0F7640] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Admissions Help Desk</span>
              <p className="text-[11px] leading-relaxed">
                Need assistance with your application or screening slip? Contact the Office of the Registrar at{' '}
                <strong>{schoolProfile?.officialEmail || 'info@becohtech.edu.ng'}</strong> or call{' '}
                <strong>{schoolProfile?.officialPhone || '+234 907 578 9045'}</strong>.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F7640] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Portal Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-[11px] text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} {institutionName}. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <Link to="/terms" className="hover:text-[#0F7640] font-medium">Terms of Service</Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-[#0F7640] font-medium">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
