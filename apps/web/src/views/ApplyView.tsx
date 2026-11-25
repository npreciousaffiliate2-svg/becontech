import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, CheckCircle2, ShieldCheck, Eye, EyeOff, Upload, FileText, Trash2, ExternalLink } from 'lucide-react';
import { Button, Input, Select, Modal, Badge, useToast } from '@campusone/ui';
import {
  ACCREDITED_HEALTH_PROGRAMMES,
  ACCREDITED_COLLEGE_DEPARTMENTS,
  OLEVEL_EXAM_BODIES,
  OLEVEL_GRADES,
  getOlevelExamYears,
  normalizeOlevelExamBody,
} from '@campusone/contracts';
import { useApp, type AdmissionCandidateItem } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { PhotoUploadControl } from '../components/common/PersonAvatar.tsx';
import { StateLgaSelect } from '../components/common/StateLgaSelect.tsx';
import { printInstitutionalDocument } from '../utils/documentExport.ts';
import { optimizeImage } from '../utils/imageOptimizer.ts';
import { UseOneIDLookup } from '../components/ui/index.ts';
import { PortalShell } from '../components/layout/PortalShell.tsx';

const OLEVEL_YEARS = getOlevelExamYears(26);

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
  const [olevelBody, setOlevelBody] = useState<string>(normalizeOlevelExamBody(initialDraft.olevelBody));
  const [olevelYear, setOlevelYear] = useState<string>(
    initialDraft.olevelYear || String(new Date().getFullYear() - 1)
  );
  const [englishGrade, setEnglishGrade] = useState<string>(initialDraft.englishGrade || 'B3');
  const [mathsGrade, setMathsGrade] = useState<string>(initialDraft.mathsGrade || 'C4');
  const [biologyGrade, setBiologyGrade] = useState<string>(initialDraft.biologyGrade || 'B2');
  const [chemistryGrade, setChemistryGrade] = useState<string>(initialDraft.chemistryGrade || 'C4');
  const [physicsGrade, setPhysicsGrade] = useState<string>(initialDraft.physicsGrade || 'C5');
  const [olevelDocumentUrl, setOlevelDocumentUrl] = useState<string>(initialDraft.olevelDocumentUrl || '');
  const [olevelDocumentName, setOlevelDocumentName] = useState<string>(initialDraft.olevelDocumentName || '');
  const [isUploadingResult, setIsUploadingResult] = useState(false);
  const resultFileInputRef = useRef<HTMLInputElement>(null);
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
  const [existingAccountNotice, setExistingAccountNotice] = useState<{
    applicationNumber?: string;
    status?: string;
    matchedEmail?: string;
  } | null>(null);

  const checkForDuplicateAccount = async (emailVal: string, phoneVal: string, oneIdVal?: string) => {
    const cleanEmail = emailVal.trim().toLowerCase();
    const cleanPhoneDigits = phoneVal.replace(/[^0-9]/g, '');
    const phoneTail = cleanPhoneDigits.length >= 10 ? cleanPhoneDigits.slice(-10) : '';
    const cleanOneId = (oneIdVal || '').trim().toLowerCase();

    if (!cleanEmail && !phoneTail && !cleanOneId) {
      setExistingAccountNotice(null);
      return null;
    }

    // 1. Check live Supabase database (covers all devices & enrolled profiles)
    try {
      const { data } = await supabase.rpc('check_existing_account', {
        p_email: cleanEmail || null,
        p_phone: phoneVal || null,
        p_one_id: cleanOneId || null,
      });
      if (data?.exists) {
        const info = {
          applicationNumber: data.applicationNumber,
          status: data.status,
          matchedEmail: cleanEmail || phoneVal,
        };
        setExistingAccountNotice(info);
        return info;
      }
    } catch {}

    // 2. Check in-memory candidates registry
    const localDup = (candidates || []).find((c) => {
      const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
      const cTail = cPhone.length >= 10 ? cPhone.slice(-10) : '';
      return (
        (cleanEmail && c.email?.toLowerCase() === cleanEmail) ||
        (cleanOneId && c.oneIdNumber?.toLowerCase() === cleanOneId) ||
        (phoneTail && cTail && cTail === phoneTail)
      );
    });

    if (localDup) {
      const info = {
        applicationNumber: localDup.applicationNumber,
        status: localDup.status,
        matchedEmail: localDup.email,
      };
      setExistingAccountNotice(info);
      return info;
    }

    setExistingAccountNotice(null);
    return null;
  };

  // Debounced duplicate check as email or phone is entered
  useEffect(() => {
    const emailOk = regEmail.includes('@') && regEmail.includes('.');
    const phoneOk = phone.replace(/[^0-9]/g, '').length >= 10;
    if (!emailOk && !phoneOk) {
      setExistingAccountNotice(null);
      return;
    }
    const timer = setTimeout(() => {
      checkForDuplicateAccount(regEmail, phone, verifiedOneId?.id);
    }, 500);
    return () => clearTimeout(timer);
  }, [regEmail, phone, verifiedOneId?.id]);

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
          olevelDocumentUrl,
          olevelDocumentName,
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
    olevelDocumentUrl,
    olevelDocumentName,
    avatarUrl,
    verifiedOneId,
  ]);

  const handleResultFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      showToast({
        type: 'danger',
        title: 'Unsupported File',
        message: 'Upload your O\'Level result slip as a PDF, JPG, PNG, or WebP file.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({
        type: 'danger',
        title: 'File Too Large',
        message: 'Maximum allowed file size is 5MB.',
      });
      return;
    }

    setIsUploadingResult(true);
    try {
      let dataUrl = '';
      if (isImage) {
        const optimized = await optimizeImage(file, { maxWidth: 1400, maxHeight: 1400, quality: 0.85 });
        dataUrl = optimized.dataUrl;
      } else {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Could not read PDF file.'));
          reader.readAsDataURL(file);
        });
      }

      setOlevelDocumentUrl(dataUrl);
      setOlevelDocumentName(file.name);
      showToast({
        type: 'success',
        title: 'Result Slip Attached',
        message: `${file.name} attached to your ${olevelBody} (${olevelYear}) record.`,
      });
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: 'Upload Failed',
        message: err?.message || 'Could not process the result file.',
      });
    } finally {
      setIsUploadingResult(false);
    }
  };

  const handleUseOneIdFill = async (data: {
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

    const oneIdKey = data.email || data.phone;
    setVerifiedOneId({
      id: oneIdKey,
      name: data.fullName,
      tier: data.kycStatus || 'Tier 3 (NIMC Verified)',
    });

    // Immediately detect if this UseOneID user already has a CampusOne account
    const existing = await checkForDuplicateAccount(data.email || '', data.phone || '', oneIdKey);
    if (existing) {
      showToast({
        type: 'warning',
        title: 'Existing Account Detected',
        message: 'You already have an account on this portal. Please sign in to your existing account.',
      });
      return;
    }

    showToast({
      type: 'success',
      title: 'Auto-Filled from UseOneID',
      message: `Verified profile for ${data.fullName} populated into application.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedOneId) {
      showToast({
        type: 'danger',
        title: 'UseOneID Verification Required',
        message: 'Identity verification via UseOneID is mandatory before submitting an admission application.',
      });
      return;
    }
    if (regPassword.length < 8) {
      showToast({
        type: 'danger',
        title: 'Password too short',
        message: 'Portal password must be at least 8 characters.',
      });
      return;
    }

    setIsLoading(true);

    // Enforce one-account-per-person before creating any record
    const duplicate = await checkForDuplicateAccount(regEmail, phone, verifiedOneId?.id);
    if (duplicate) {
      setIsLoading(false);
      showToast({
        type: 'danger',
        title: 'Account Already Exists',
        message: 'An application or account already exists for this email, phone, or UseOneID. Please sign in instead.',
      });
      return;
    }

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

    // 1. Persist via tamper-proof Supabase RPC (enforces duplicate check + APPLIED/PENDING/UNPAID invariants)
    try {
      const { data: rpcRow, error: rpcError } = await supabase.rpc('submit_admission_application', {
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
        p_olevel_document_url: olevelDocumentUrl || null,
        p_olevel_document_name: olevelDocumentName || null,
      });
      if (rpcError?.message?.includes('DUPLICATE_ACCOUNT')) {
        setIsLoading(false);
        setExistingAccountNotice({ matchedEmail: regEmail.trim() });
        showToast({
          type: 'danger',
          title: 'Account Already Exists',
          message: 'You already have an existing account on this portal. Please sign in.',
        });
        return;
      }
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
      olevelDocumentUrl: olevelDocumentUrl || undefined,
      olevelDocumentName: olevelDocumentName || undefined,
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
          {/* Mandatory UseOneID Identity Verification (hides cleanly once verified) */}
          {!verifiedOneId ? (
            <div className="bg-white border border-emerald-300 rounded-[4px] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[4px] bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 p-1.5">
                  <img
                    src="https://useoneid.com/favicon.png"
                    alt="UseOneID"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {hasOneIdWallet ? 'UseOneID Wallet Found' : 'Required Identity Verification (UseOneID)'}
                    </span>
                    <Badge variant="warning" size="sm">REQUIRED</Badge>
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {hasOneIdWallet
                      ? 'Authorize in 1 click to verify your identity and auto-fill your details'
                      : 'All applicants must verify their identity with UseOneID before submitting'}
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

          {/* Existing Account Gate (Prevents Duplicate Accounts) */}
          {existingAccountNotice && (
            <div className="bg-amber-50 border border-amber-300 rounded-[4px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
              <div className="space-y-1">
                <span className="font-bold text-amber-900 block">
                  Existing Account Detected
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  An account or admission application
                  {existingAccountNotice.applicationNumber
                    ? ` (${existingAccountNotice.applicationNumber})`
                    : ''}{' '}
                  already exists on {institutionName} for this identity. Each person can only hold one account. Please sign in to your existing account.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-[#0F7640] hover:bg-[#093322] text-xs font-bold rounded-[4px] shrink-0"
                onClick={() => navigate('/login')}
              >
                Sign In to Existing Account
              </Button>
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

              {/* O'Level Result Slip PDF / Image Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[4px] bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#0F7640]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block">
                      Upload {olevelBody} Result Slip (PDF or Image)
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {olevelDocumentName
                        ? `Attached: ${olevelDocumentName}`
                        : 'Attach a clear scan or PDF of your O\'Level statement of result (Max 5MB)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={resultFileInputRef}
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleResultFileChange}
                  />
                  {olevelDocumentUrl && (
                    <a
                      href={olevelDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#0F7640] bg-emerald-50 border border-emerald-200 rounded-[4px] hover:bg-emerald-100"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Preview
                    </a>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    isLoading={isUploadingResult}
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                    onClick={() => resultFileInputRef.current?.click()}
                  >
                    {olevelDocumentUrl ? 'Replace File' : 'Upload Result'}
                  </Button>
                  {olevelDocumentUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => {
                        setOlevelDocumentUrl('');
                        setOlevelDocumentName('');
                      }}
                      title="Remove attached result"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
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
                  {!verifiedOneId
                    ? 'Complete mandatory UseOneID verification at the top of this page to enable submission.'
                    : 'By submitting, you confirm that all credentials entered are genuine and accurate.'}
                </p>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={Boolean(existingAccountNotice) || !verifiedOneId}
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
