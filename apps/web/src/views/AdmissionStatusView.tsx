import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button, Badge, Input, Select } from '@campusone/ui';
import { ACCREDITED_COLLEGE_DEPARTMENTS } from '@campusone/contracts';
import { useApp } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { PortalShell } from '../components/layout/PortalShell.tsx';

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
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicStatusResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sessionYear = (schoolProfile?.activeSession || '2026/2027')
    .replace(/\s*Academic Session\s*/i, '')
    .trim();

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;

    setLoading(true);
    setNotFound(false);
    setErrorMsg('');
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('check_admission_status', { p_query: cleaned });
      if (!error && data) {
        setResult(data as PublicStatusResult);
        setLoading(false);
        return;
      }

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
    } catch {
      setErrorMsg('Unable to check admission status right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalShell>
      <main className="flex-1 bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="bg-white border border-slate-200 rounded-[4px] p-6 sm:p-8">
            <div className="text-center mb-6">
              <GraduationCap className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <h1 className="text-lg font-bold text-slate-900">
                Check Admission Status
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {sessionYear} Academic Session
              </p>
            </div>

            <form onSubmit={handleCheckStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 block">
                  Department
                </label>
                <Select
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  options={[
                    { value: 'ALL', label: 'All Accredited Departments' },
                    ...ACCREDITED_COLLEGE_DEPARTMENTS.map((dept) => ({
                      value: dept.name,
                      label: dept.name,
                    })),
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 block">
                  Application Number or Email
                </label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. APP/2026/0142"
                  required
                />
              </div>

              <div className="pt-1 flex justify-end">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="bg-[#0F7640] hover:bg-[#093322] text-xs font-semibold px-5 h-9 rounded-[4px]"
                >
                  Confirm Status
                </Button>
              </div>
            </form>

            {result && (
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Admission Record</span>
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

                <dl className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">Candidate Name</dt>
                    <dd className="font-semibold text-slate-900 text-right">{result.fullName}</dd>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">Application Number</dt>
                    <dd className="font-semibold text-[#0F7640] text-right">{result.applicationNumber}</dd>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">Programme</dt>
                    <dd className="text-slate-800 text-right">{result.programme}</dd>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">O&apos;Level Status</dt>
                    <dd className="text-slate-800 text-right">{result.olevelStatus}</dd>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">Application Fee</dt>
                    <dd className="font-semibold text-right text-slate-800">
                      {result.applicationFeePaid ? 'Paid' : 'Pending'}
                    </dd>
                  </div>
                  {result.matricNumber && (
                    <div className="py-2 flex justify-between gap-2">
                      <dt className="text-slate-500">Matriculation No.</dt>
                      <dd className="font-bold text-[#0F7640] text-right">{result.matricNumber}</dd>
                    </div>
                  )}
                </dl>

                {result.status === 'ADMITTED' && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full bg-[#0F7640] hover:bg-[#093322] text-xs rounded-[4px]"
                      onClick={() => navigate('/login')}
                    >
                      Proceed to Portal Login
                    </Button>
                  </div>
                )}
              </div>
            )}

            {notFound && (
              <p className="mt-5 p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800">
                No application record was found for <strong>{query}</strong>. Check your Application Number and try again.
              </p>
            )}

            {errorMsg && (
              <p className="mt-5 p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="p-4 bg-white border border-dashed border-slate-300 rounded-[4px] text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800 block mb-1">Note:</span>
            If you experience any difficulty checking your status, contact the Office of the Registrar at{' '}
            <strong className="text-slate-800">{schoolProfile?.officialEmail || 'info@becohtech.edu.ng'}</strong> or call{' '}
            <strong className="text-slate-800">{schoolProfile?.officialPhone || '+234 907 578 9045'}</strong>.
          </div>
        </div>
      </main>
    </PortalShell>
  );
};
