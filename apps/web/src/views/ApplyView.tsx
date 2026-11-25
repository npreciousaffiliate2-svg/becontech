import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Select, Modal, Badge, useToast } from '@campusone/ui';
import { ACCREDITED_HEALTH_PROGRAMMES, ACCREDITED_COLLEGE_DEPARTMENTS } from '@campusone/contracts';
import { useApp, type AdmissionCandidateItem } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { PhotoUploadControl } from '../components/common/PersonAvatar.tsx';
import { StateLgaSelect } from '../components/common/StateLgaSelect.tsx';
import { printInstitutionalDocument } from '../utils/documentExport.ts';
import { UseOneIDLookup } from '../components/ui/index.ts';
import { PortalShell } from '../components/layout/PortalShell.tsx';

const OLEVEL_EXAM_BODIES = [
  { value: 'WAEC (SSCE)', label: 'WAEC (SSCE)' },
  { value: 'WAEC (GCE / Private)', label: 'WAEC (GCE / Private)' },
  { value: 'NECO (SSCE)', label: 'NECO (SSCE)' },
  { value: 'NECO (GCE / Private)', label: 'NECO (GCE / Private)' },
  { value: 'NABTEB', label: 'NABTEB' },
  { value: 'NBAIS', label: 'NBAIS' },
  { value: 'IGCSE / Cambridge', label: 'IGCSE / Cambridge' },
  { value: 'WAEC + NECO (Combined)', label: 'WAEC + NECO (Combined Sittings)' },
];

const OLEVEL_GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => ({
  value: g,
  label: g,
}));

const OLEVEL_YEARS = Array.from({ length: 26 }, (_, i) => {
  const yr = String(new Date().getFullYear() - i);
  return { value: yr, label: yr };
});

function normalizeExamBody(val?: string): string {
  if (!val || val === 'WAEC') return 'WAEC (SSCE)';
  if (val === 'NECO') return 'NECO (SSCE)';
  return val;
}

export const ApplyView: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs, schoolProfile, candidates, addCandidate } = useApp();
  const { showToast } = useToast();

  const institutionName =
    schoolProfile?.institutionName?.replace(' Ltd', '') ||
    'Bethsaida College of Health Technology';
  const sessionYear = (schoolProfile?.activeSession || '2026/2027')
    .replace(/\s*Academic Session\s*/i, '')
    .trim();

  useEffect(() => {
    document.title = `Online Application — ${institutionName}`;
  }, [institutionName]);

  // Load persisted applicant form draft (excluding password) so refreshes never clear progress
  const loadDraft = () => {
    try {
      const raw = sessionStorage.getItem('campusone_applicant_form_draft');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };
  const initialDraft = loadDraft();

  const [fullName, setFullName] = useState<string>(initialDraft.fullName || '');
  const [regEmail, setRegEmail] = useState<string>(initialDraft.regEmail || '');
  const [phone, setPhone] = useState<string>(initialDraft.phone || '');
  const [gender, setGender] = useState<'Female' | 'Male'>(initialDraft.gender || 'Female');
  const [stateOfOrigin, setStateOfOrigin] = useState<string>(initialDraft.stateOfOrigin || 'Oyo');
  const [lga, setLga] = useState<string>(initialDraft.lga || 'Ibadan North');
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>(initialDraft.selectedDeptCode || 'CHD');
  const [programme, setProgramme] = useState<string>(initialDraft.programme || 'CHEW');
  const [olevelBody, setOlevelBody] = useState<string>(normalizeExamBody(initialDraft.olevelBody));
  const [olevelYear, setOlevelYear] = useState<string>(
    initialDraft.olevelYear || String(new Date().getFullYear() - 1)
  );
  const [englishGrade, setEnglishGrade] = useState<string>(initialDraft.englishGrade || 'B3');
  const [mathsGrade, setMathsGrade] = useState<string>(initialDraft.mathsGrade || 'C4');
  const [biologyGrade, setBiologyGrade] = useState<string>(initialDraft.biologyGrade || 'B2');
  const [chemistryGrade, setChemistryGrade] = useState<string>(initialDraft.chemistryGrade || 'C4');
  const [physicsGrade, setPhysicsGrade] = useState<string>(initialDraft.physicsGrade || 'C5');
  const [avatarUrl, setAvatarUrl] = useState<string>(initialDraft.avatarUrl || '');
  const [regPassword, setRegPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<AdmissionCandidateItem | null>(null);

  const [verifiedOneId, setVerifiedOneId] = useState<{
    id: string;
    name: string;
    tier: string;
    token?: string;
  } | null>(initialDraft.verifiedOneId || null);
  const [hasOneIdWallet, setHasOneIdWallet] = useState(false);

  // Persist draft across page refreshes (never store password)
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'campusone_applicant_form_draft',
        JSON.stringify({
          fullName,
          regEmail,
          phone,
          gender,
          stateOfOrigin,
          lga,
          selectedDeptCode,
          programme,
          olevelBody,
          olevelYear,
          englishGrade,
          mathsGrade,
          biologyGrade,
          chemistryGrade,
          physicsGrade,
          avatarUrl,
          verifiedOneId,
        })
      );
    } catch {}
  }, [
    fullName,
    regEmail,
    phone,
    gender,
    stateOfOrigin,
    lga,
    selectedDeptCode,
    programme,
    olevelBody,
    olevelYear,
    englishGrade,
    mathsGrade,
    biologyGrade,
    chemistryGrade,
    physicsGrade,
    avatarUrl,
    verifiedOneId,
  ]);

  const handleUseOneIdFill = (data: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    stateOfOrigin?: string;
    lga?: string;
    avatarUrl?: string;
    kycStatus?: string;
  }) => {
    if (data.fullName) setFullName(data.fullName);
    if (data.email) setRegEmail(data.email);
    if (data.phone) setPhone(data.phone);
    if (data.stateOfOrigin) setStateOfOrigin(data.stateOfOrigin);
    if (data.lga) setLga(data.lga);
    if (data.avatarUrl) setAvatarUrl(data.avatarUrl);

    setVerifiedOneId({
      id: data.email || data.phone,
      name: data.fullName,
      tier: data.kycStatus || 'Tier 3 (NIMC Verified)',
    });

    showToast({
      type: 'success',
      title: 'Auto-Filled from UseOneID',
      message: `Verified profile for ${data.fullName} populated into application.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 8) {
      showToast({
        type: 'danger',
        title: 'Password too short',
        message: 'Portal password must be at least 8 characters.',
      });
      return;
    }

    setIsLoading(true);

    const nextSerial = (candidates?.length || 10) + 142;
    let finalAppNumber = `APP/${new Date().getFullYear()}/0${nextSerial}`;
    const matchedProg =
      ACCREDITED_HEALTH_PROGRAMMES.find((p) => p.code === programme) ||
      ACCREDITED_HEALTH_PROGRAMMES[0];

    const olevelSubjectsPayload = [
      { subject: 'English Language', grade: englishGrade },
      { subject: 'Mathematics', grade: mathsGrade },
      { subject: 'Biology', grade: biologyGrade },
      { subject: 'Chemistry', grade: chemistryGrade },
      { subject: 'Physics', grade: physicsGrade },
    ];

    // 1. Persist via tamper-proof Supabase RPC (enforces APPLIED, CBT=0, PENDING O'Level, UNPAID server-side)
    try {
      const { data: rpcRow } = await supabase.rpc('submit_admission_application', {
        p_application_number: finalAppNumber,
        p_full_name: fullName.trim(),
        p_email: regEmail.trim(),
        p_phone: phone.trim(),
        p_gender: gender,
        p_state_of_origin: stateOfOrigin,
        p_lga: lga || 'Ibadan North',
        p_programme_code: matchedProg.code,
        p_programme: matchedProg.name,
        p_department: matchedProg.departmentName,
        p_regulatory_body: matchedProg.regulatoryBody,
        p_olevel_exam_body: olevelBody,
        p_olevel_exam_year: olevelYear,
        p_olevel_subjects: olevelSubjectsPayload,
        p_avatar_url: avatarUrl || null,
        p_one_id_number: verifiedOneId?.id || null,
        p_one_id_verified: Boolean(verifiedOneId),
      });
      if (rpcRow?.applicationNumber) {
        finalAppNumber = rpcRow.applicationNumber;
      }
    } catch (rpcErr) {
      console.warn('[CampusOne] Candidate RPC sync notice:', rpcErr);
    }

    // 2. Register in unified AppContext state
    const createdCandidate = addCandidate({
      id: `app-${Date.now().toString().slice(-4)}`,
      cbtDate: new Date().toISOString().split('T')[0],
      applicationNumber: finalAppNumber,
      fullName: fullName.trim(),
      email: regEmail.trim(),
      phone: phone.trim(),
      gender,
      stateOfOrigin,
      lga: lga || 'Ibadan North',
      programmeCode: matchedProg.code,
      programme: matchedProg.name,
      department: matchedProg.departmentName,
      regulatoryBody: matchedProg.regulatoryBody,
      olevelExamBody: olevelBody,
      olevelExamYear: olevelYear,
      olevelStatus: 'PENDING',
      olevelSubjects: olevelSubjectsPayload,
      cbtScore: 0,
      status: 'APPLIED',
      applicationFeePaid: false,
      acceptanceFeePaid: false,
      avatarUrl: avatarUrl || undefined,
      oneIdNumber: verifiedOneId?.id,
      oneIdVerified: Boolean(verifiedOneId),
      nin: verifiedOneId?.tier,
    });

    try {
      localStorage.setItem('campusone_current_user_email', regEmail.trim());
      localStorage.setItem('campusone_last_applicant_email', regEmail.trim());
    } catch {}

    // 3. Create Supabase Auth account & profile so candidate can sign in anytime on /login
    try {
      const { data } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            full_name: fullName.trim(),
            programme: matchedProg.code,
            application_number: finalAppNumber,
          },
        },
      });
      if (data?.user && data?.session) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          college_id: 'bethsaida',
          email: regEmail.trim(),
          full_name: fullName.trim(),
          role: 'STU',
          auth_user_id: data.user.id,
          phone: phone.trim(),
          avatar_url: avatarUrl || null,
        });
      }
    } catch (err) {
      console.warn('[CampusOne] Applicant auth signup note:', err);
    }

    try {
      sessionStorage.removeItem('campusone_applicant_form_draft');
    } catch {}

    setIsLoading(false);
    setSubmittedApplication(createdCandidate);
  };

  const selectedProgrammeMeta =
    ACCREDITED_HEALTH_PROGRAMMES.find((p) => p.code === programme) ||
    ACCREDITED_HEALTH_PROGRAMMES[0];

  return (
    <PortalShell>
      {/* Unified Institutional Hero Banner (matches PortalHomeView) */}
      <section className="relative bg-[#093322] text-white py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
        <img
          src="/portal-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-[#093322]/75" aria-hidden="true" />
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
            {sessionYear} Online Admission Application
          </h1>
          <p className="text-sm text-emerald-50/90 max-w-xl mx-auto leading-relaxed">
            Submit your application for an accredited health technology programme at {institutionName}.
          </p>
        </div>
      </section>

      <main className="flex-1 bg-slate-50 py-10 px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5">
          {/* UseOneID Fast-Track Banner (hides cleanly once verified) */}
          {!verifiedOneId ? (
            <div className="bg-white border border-emerald-200 rounded-[4px] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[4px] bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 p-1.5">
                  <img
                    src="https://useoneid.com/favicon.png"
                    alt="UseOneID"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block">
                    {hasOneIdWallet ? 'UseOneID Wallet Found' : 'Fast-Track with UseOneID'}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {hasOneIdWallet
                      ? 'Authorize in 1 click to auto-fill your verified details'
                      : 'Enter your email or phone below to check for a wallet, or verify now'}
                  </span>
                </div>
              </div>
              <UseOneIDLookup
                lookupEmail={regEmail}
                lookupPhone={phone}
                onLookupComplete={(res) => setHasOneIdWallet(Boolean(res?.found))}
                onFill={handleUseOneIdFill}
                onError={(err) => showToast({ type: 'danger', title: 'UseOneID Error', message: err })}
                reuseText="Authorize 1-Click ID"
                firstTimeText="Verify with UseOneID"
              />
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-[4px] p-3.5 sm:px-5 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#0F7640] shrink-0" />
                <span>
                  <strong>UseOneID Verified:</strong> {verifiedOneId.name}
                </span>
              </div>
              <Badge variant="success" size="sm">VERIFIED</Badge>
            </div>
          )}

          {/* Section 1: Personal Information */}
          <section className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">1. Personal Information</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter your legal bio-data exactly as it appears on your credentials.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <PhotoUploadControl
                label="Applicant Passport Photograph"
                name={fullName}
                value={avatarUrl}
                onChange={setAvatarUrl}
              />

              <Input
                label="Applicant Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Amina Adebayo"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Gender"
                  value={gender}
                  onChange={(v) => setGender(v as 'Female' | 'Male')}
                  options={[
                    { value: 'Female', label: 'Female' },
                    { value: 'Male', label: 'Male' },
                  ]}
                />
                <div className="sm:col-span-2">
                  <StateLgaSelect
                    stateValue={stateOfOrigin}
                    lgaValue={lga}
                    onStateChange={setStateOfOrigin}
                    onLgaChange={setLga}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Programme Selection */}
          <section className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">2. Academic Department &amp; Programme Choice</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Choose the department and accredited health programme you are applying for.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Academic Department"
                  value={selectedDeptCode}
                  onChange={(val) => {
                    setSelectedDeptCode(val);
                    const matching = ACCREDITED_HEALTH_PROGRAMMES.filter((p) => p.departmentCode === val);
                    if (matching.length > 0) {
                      setProgramme(matching[0].code);
                    }
                  }}
                  options={ACCREDITED_COLLEGE_DEPARTMENTS.map((d) => ({
                    value: d.code,
                    label: d.name,
                  }))}
                />
                <Select
                  label="Intended Health Programme"
                  value={programme}
                  onChange={(val) => {
                    setProgramme(val);
                    const p = ACCREDITED_HEALTH_PROGRAMMES.find((item) => item.code === val);
                    if (p) setSelectedDeptCode(p.departmentCode);
                  }}
                  options={ACCREDITED_HEALTH_PROGRAMMES.filter(
                    (p) => p.departmentCode === selectedDeptCode
                  ).map((p) => ({
                    value: p.code,
                    label: p.name,
                  }))}
                />
              </div>

              {selectedProgrammeMeta && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[4px] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Regulatory Council</span>
                    <span className="font-semibold text-slate-800">{selectedProgrammeMeta.regulatoryBody}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Duration</span>
                    <span className="font-semibold text-slate-800">{selectedProgrammeMeta.duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Credential Awarded</span>
                    <span className="font-semibold text-slate-800">{selectedProgrammeMeta.credentialAwarded}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: O'Level Examination & Core Subjects */}
          <section className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">3. O&apos;Level Examination &amp; Core Subjects</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select your examination body, sitting year, and science subject grades.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#0F7640] shrink-0">
                {olevelBody} ({olevelYear})
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Examination Body"
                  value={olevelBody}
                  onChange={setOlevelBody}
                  options={OLEVEL_EXAM_BODIES}
                />
                <Select
                  label="Examination Year"
                  value={olevelYear}
                  onChange={setOlevelYear}
                  options={OLEVEL_YEARS}
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-3">
                <span className="text-[11px] font-semibold text-slate-700 block">
                  Core Science &amp; Entry Subject Grades
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <Select label="English" value={englishGrade} onChange={setEnglishGrade} options={OLEVEL_GRADES} />
                  <Select label="Mathematics" value={mathsGrade} onChange={setMathsGrade} options={OLEVEL_GRADES} />
                  <Select label="Biology" value={biologyGrade} onChange={setBiologyGrade} options={OLEVEL_GRADES} />
                  <Select label="Chemistry" value={chemistryGrade} onChange={setChemistryGrade} options={OLEVEL_GRADES} />
                  <Select label="Physics" value={physicsGrade} onChange={setPhysicsGrade} options={OLEVEL_GRADES} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Applicant Portal Account & Submit */}
          <section className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">4. Create Applicant Portal Password</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                You will use your email and this password to sign in and track your admission status.
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Portal Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full h-9 px-3 pr-9 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] focus:border-[#0F7640]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  By submitting, you confirm that all credentials entered are genuine and accurate.
                </p>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full sm:w-auto px-7 h-10 text-xs font-bold bg-[#0F7640] hover:bg-[#093322] rounded-[4px] shrink-0"
                >
                  Submit Online Application
                </Button>
              </div>
            </div>
          </section>
        </form>

        {/* Post-Submission Application Slip Modal */}
        <Modal
          isOpen={Boolean(submittedApplication)}
          onClose={() => setSubmittedApplication(null)}
          title="Application Submitted Successfully"
          description="Your admission application has been registered in the college screening pool."
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (!submittedApplication) return;
                  showToast({
                    type: 'success',
                    title: 'Opening Print Dialog',
                    message: 'Generating official application slip for printing or PDF.',
                  });
                  printInstitutionalDocument({
                    title: `Admission Application Slip — ${submittedApplication.fullName}`,
                    badgeText: 'OFFICIAL ONLINE APPLICATION & CBT SCREENING SLIP',
                    referenceNo: submittedApplication.applicationNumber,
                    issuedDate: submittedApplication.cbtDate,
                    schoolProfile,
                    officeSubtitle: 'Office of the Registrar • Admissions & Screening Division',
                    metaItems: [
                      { label: 'Application Number', value: submittedApplication.applicationNumber, highlight: true },
                      { label: 'Applicant Full Name', value: submittedApplication.fullName, highlight: true },
                      { label: 'Chosen Programme', value: submittedApplication.programme },
                      { label: 'Regulatory Council', value: submittedApplication.regulatoryBody },
                      {
                        label: "O'Level Examination",
                        value: `${submittedApplication.olevelExamBody} (${submittedApplication.olevelExamYear})`,
                      },
                      {
                        label: 'Application Fee Status',
                        value: submittedApplication.applicationFeePaid
                          ? `${submittedApplication.applicationFeeRef || 'VERIFIED'} (PAID)`
                          : 'PENDING PAYMENT',
                      },
                    ],
                    summaryNoteHtml: `
                      <strong>Next Steps for Applicant:</strong><br/>
                      1. Keep your Application Number (<strong>${submittedApplication.applicationNumber}</strong>) safe for checking admission status and CBT screening.<br/>
                      2. Upon scoring at least ${schoolProfile?.minimumCutoffScore || 50}% and O'Level verification, your provisional admission letter will be issued.<br/>
                      3. After admission, settle your Acceptance Fee to receive your official Matriculation Number.
                    `,
                    stampText: 'APPLICATION REGISTERED',
                  });
                }}
              >
                Print Application Slip
              </Button>
              <Button
                size="sm"
                className="bg-[#0F7640] hover:bg-[#093322]"
                onClick={() => {
                  const appEmail = submittedApplication?.email || regEmail;
                  const appName = submittedApplication?.fullName || fullName;
                  setSubmittedApplication(null);
                  loginAs('STU', appEmail, appName);
                  navigate('/');
                }}
              >
                Proceed to Applicant Portal
              </Button>
            </div>
          }
        >
          {submittedApplication && (
            <div className="space-y-4 text-xs text-slate-700 font-sans">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F7640]" />
                  <span className="font-bold text-emerald-950">Application Number:</span>
                </div>
                <span className="font-extrabold text-sm text-[#0F7640]">
                  {submittedApplication.applicationNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant Name</span>
                  <span className="font-bold text-slate-900">{submittedApplication.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Programme Choice</span>
                  <span className="font-bold text-slate-900">{submittedApplication.programme}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Screening Status</span>
                  <Badge variant="warning" size="sm">APPLIED</Badge>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Application Fee</span>
                  <span className="font-semibold text-amber-700">PENDING PAYMENT</span>
                </div>
                {submittedApplication.oneIdNumber && (
                  <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">National Digital ID</span>
                    <span className="font-bold text-xs text-[#0F7640] flex items-center gap-1">
                      <ShieldCheck size={14} />
                      {submittedApplication.oneIdNumber} (NIMC Verified)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </main>
    </PortalShell>
  );
};
