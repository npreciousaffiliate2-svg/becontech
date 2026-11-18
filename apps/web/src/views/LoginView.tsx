import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Printer, CheckCircle2, ShieldCheck, Fingerprint } from 'lucide-react';
import { AuthFrame, AUTH_SECURITY_LINE } from '../components/auth/AuthFrame.tsx';
import { Button, Input, Checkbox, Select, Modal, Badge, useToast } from '@campusone/ui';
import { useApp, AdmissionCandidateItem } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { PhotoUploadControl } from '../components/common/PersonAvatar.tsx';
import { StateLgaSelect } from '../components/common/StateLgaSelect.tsx';
import { printInstitutionalDocument } from '../utils/documentExport.ts';
import { UseOneIDButton, UseOneIDLookup } from '../components/ui/index.ts';
import { type RoleCode, ACCREDITED_HEALTH_PROGRAMMES, ACCREDITED_COLLEGE_DEPARTMENTS } from '@campusone/contracts';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAs, schoolProfile, candidates, addCandidate, departments } = useApp();
  const { showToast } = useToast();

  useEffect(() => {
    document.title = `CampusOne — ${schoolProfile?.institutionName || 'Sign In'}`;
    const iconLinks = document.querySelectorAll("link[rel*='icon']");
    iconLinks.forEach((link) => {
      (link as HTMLLinkElement).href = '/BeonTech-Logo.png';
    });
  }, [schoolProfile?.institutionName]);

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(
    location.pathname === '/register' || location.pathname === '/apply' ? 'register' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Register / Online Application Form State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male'>('Female');
  const [stateOfOrigin, setStateOfOrigin] = useState('Oyo');
  const [lga, setLga] = useState('Ibadan North');
  const [olevelBody, setOlevelBody] = useState<'WAEC' | 'NECO' | 'NABTEB'>('WAEC');
  const [olevelYear, setOlevelYear] = useState('2025');
  const [englishGrade, setEnglishGrade] = useState('B3');
  const [mathsGrade, setMathsGrade] = useState('C4');
  const [biologyGrade, setBiologyGrade] = useState('B2');
  const [chemistryGrade, setChemistryGrade] = useState('C4');
  const [physicsGrade, setPhysicsGrade] = useState('C5');
  const [selectedDeptCode, setSelectedDeptCode] = useState('CHD');
  const [programme, setProgramme] = useState('CHEW');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [submittedApplication, setSubmittedApplication] = useState<AdmissionCandidateItem | null>(null);

  // Official UseOneID Integration State
  const [verifiedOneId, setVerifiedOneId] = useState<{
    id: string;
    name: string;
    tier: string;
    token?: string;
  } | null>(null);

  const handleUseOneIdSuccess = (payload: { token: string; user: any }) => {
    const user = payload.user || {};
    const id = user.id || user.email || 'useoneid_verified';
    const name = user.name || user.fullName || 'Verified Citizen';
    const tier = user.tier || 'Tier 3 (NIMC Verified)';

    setVerifiedOneId({ id, name, tier, token: payload.token });

    if (activeTab === 'signin') {
      if (user.email) {
        setEmail(user.email);
      }
      showToast({
        type: 'success',
        title: 'UseOneID Authenticated',
        message: `Identity verified for ${name}. Signing into CampusOne...`,
      });
      // If email matches student demo or admin, log them straight in
      if (user.email === 'blessing.adeyemi@becohtech.edu.ng') {
        loginAs('STU');
        navigate('/');
      } else if (user.email === 'admin@becohtech.edu.ng') {
        loginAs('SADMIN');
        navigate('/');
      } else if (user.email === 'hod.chew@becohtech.edu.ng') {
        loginAs('HOD');
        navigate('/');
      }
    } else {
      // New Applicant KYC Flow
      if (user.name) setFullName(user.name);
      if (user.email) setRegEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.stateOfOrigin) setStateOfOrigin(user.stateOfOrigin);
      if (user.lga) setLga(user.lga);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);

      showToast({
        type: 'success',
        title: 'Identity Verified by UseOneID',
        message: `Verified records for ${name} loaded into application.`,
      });
    }
  };

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
      message: `Verified profile for ${data.fullName} populated into form.`,
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      localStorage.setItem('campusone_current_user_email', email.trim());
    } catch (err) {}
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.user) {
      setIsLoading(false);
      showToast({
        type: 'danger',
        title: 'Sign-in refused',
        message: error?.message || 'The email or password is not valid.',
      });
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('email', email.trim())
      .maybeSingle();
    if (!profile?.role) {
      await supabase.auth.signOut();
      setIsLoading(false);
      showToast({
        type: 'danger',
        title: 'No college profile',
        message: 'This account is not linked to a CampusOne role. Ask the super administrator.',
      });
      return;
    }
    loginAs(profile.role as RoleCode);
    setIsLoading(false);
    showToast({
      type: 'success',
      title: 'Signed in',
      message: `Welcome back, ${profile.full_name}.`,
    });
    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 8) {
      showToast({
        type: 'danger',
        title: 'Password too short',
        message: 'Use at least 8 characters.',
      });
      return;
    }
    setIsLoading(true);

    // 1. Register candidate in the college Admissions & Screening Registry
    const nextSerial = (candidates?.length || 10) + 142;
    const appNumber = `APP/2026/0${nextSerial}`;
    const matchedProg = ACCREDITED_HEALTH_PROGRAMMES.find((p) => p.code === programme) || ACCREDITED_HEALTH_PROGRAMMES[0];
    const deptName = matchedProg.departmentName;
    const regBoard = matchedProg.regulatoryBody;
    const progName = matchedProg.name;

    const createdCandidate = addCandidate({
      id: `app-${Date.now().toString().slice(-4)}`,
      cbtDate: new Date().toISOString().split('T')[0],
      applicationNumber: appNumber,
      fullName: fullName.trim(),
      email: regEmail.trim(),
      phone: phone.trim(),
      gender,
      stateOfOrigin,
      lga: lga || 'Ibadan North',
      programmeCode: matchedProg.code,
      programme: progName,
      department: deptName,
      regulatoryBody: regBoard,
      olevelExamBody: olevelBody,
      olevelExamYear: olevelYear || '2025',
      olevelStatus: 'VERIFIED',
      olevelSubjects: [
        { subject: 'English Language', grade: englishGrade },
        { subject: 'Mathematics', grade: mathsGrade },
        { subject: 'Biology', grade: biologyGrade },
        { subject: 'Chemistry', grade: chemistryGrade },
        { subject: 'Physics', grade: physicsGrade },
      ],
      cbtScore: 0,
      status: 'APPLIED',
      applicationFeePaid: true,
      applicationFeeRef: `PAY-APP-${Date.now().toString().slice(-6)}`,
      acceptanceFeePaid: false,
      avatarUrl: avatarUrl || undefined,
      oneIdNumber: verifiedOneId?.id,
      oneIdVerified: Boolean(verifiedOneId),
      nin: verifiedOneId?.tier,
    });

    try {
      localStorage.setItem('campusone_current_user_email', regEmail.trim());
      localStorage.setItem('campusone_last_applicant_email', regEmail.trim());
    } catch (err) {}

    // 2. Also create Supabase Auth account if possible
    try {
      const { data } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: { data: { full_name: fullName.trim(), programme, application_number: appNumber } },
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

    setIsLoading(false);
    setSubmittedApplication(createdCandidate);
  };

  return (
    <AuthFrame>
          {/* Platform Crest Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-4">
            <img
              src="/BeonTech-Logo.png"
              alt="BeonTech Platform Logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
              }}
              className="w-8 h-8 rounded-[4px] object-contain shadow-xs"
            />
            <span className="text-sm font-extrabold uppercase tracking-wider text-[#093322] font-sans">
              CampusOne
            </span>
          </div>

          {/* Header Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'signin' ? 'Sign in to CampusOne' : 'Applicant Registration'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'signin'
                ? 'Sign in with the email and password issued by the college.'
                : 'Create an applicant profile to begin admission screening.'}
            </p>
          </div>

          {/* Segmented Control Switcher (UseOneID SegmentedControl) */}
          <div className="p-1 bg-slate-100 rounded-[4px] flex items-center mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                activeTab === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Applicant
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                label="College Email / Matric No"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@becohtech.edu.ng"
                required
              />

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#0F7640] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 rounded-[4px] border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F7640]"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <Checkbox
                  checked={rememberMe}
                  onChange={(checked) => setRememberMe(checked)}
                  label="Keep me signed in on this computer"
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full h-10 text-sm bg-[#0F7640] hover:bg-[#093322]">
                Sign In to CampusOne
              </Button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">
                    Or UseOneID 1-Click ID
                  </span>
                </div>
              </div>

              <UseOneIDButton
                lookupEmail={email}
                onSuccess={handleUseOneIdSuccess}
                onError={(err) => showToast({ type: 'danger', title: 'UseOneID Error', message: err })}
                firstTimeText="Sign in with UseOneID"
                reuseText="Authorize with 1-Click ID (Reuse)"
                theme="brand"
                showBadge={false}
              />

              <div className="pt-2 text-center text-xs text-slate-400">
                {AUTH_SECURITY_LINE}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* UseOneID Official Fast-Track KYC & Auto-Fill */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-[4px] bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs p-1">
                    <img
                      src="https://useoneid.com/favicon.png"
                      alt="UseOneID"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block font-sans truncate">
                      Fast-Track with UseOneID
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      Auto-fill verified details in 1-click
                    </span>
                  </div>
                </div>
                <UseOneIDLookup
                  onFill={handleUseOneIdFill}
                  onError={(err) => showToast({ type: 'danger', title: 'UseOneID Error', message: err })}
                  buttonText="1-Click Auto-Fill"
                />
              </div>

              {verifiedOneId && (
                <div className="p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-[4px] flex items-center justify-between text-xs text-emerald-950 font-sans">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0F7640]" />
                    <span>
                      <strong>UseOneID Verified:</strong> {verifiedOneId.name}
                    </span>
                  </div>
                  <Badge variant="success" size="sm">VERIFIED</Badge>
                </div>
              )}

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
                placeholder="Amina Adebayo"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email Address"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="amina@example.com"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Gender"
                  value={gender}
                  onChange={(v) => setGender(v as 'Female' | 'Male')}
                  options={[
                    { value: 'Female', label: 'Female' },
                    { value: 'Male', label: 'Male' },
                  ]}
                />
                <Select
                  label="O'Level Examination Body"
                  value={olevelBody}
                  onChange={(v) => setOlevelBody(v as 'WAEC' | 'NECO' | 'NABTEB')}
                  options={[
                    { value: 'WAEC', label: 'WAEC' },
                    { value: 'NECO', label: 'NECO' },
                    { value: 'NABTEB', label: 'NABTEB' },
                  ]}
                />
              </div>
              <StateLgaSelect
                stateValue={stateOfOrigin}
                lgaValue={lga}
                onStateChange={setStateOfOrigin}
                onLgaChange={setLga}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  options={ACCREDITED_HEALTH_PROGRAMMES.filter((p) => p.departmentCode === selectedDeptCode).map((p) => ({
                    value: p.code,
                    label: `${p.name} — [${p.regulatoryBody}]`,
                  }))}
                />
              </div>

              {/* O'Level Examination Results Upload */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                    O'Level Core Subjects &amp; Grades
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {olevelBody} ({olevelYear})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <Select
                    label="English"
                    value={englishGrade}
                    onChange={setEnglishGrade}
                    options={['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => ({ value: g, label: g }))}
                  />
                  <Select
                    label="Maths"
                    value={mathsGrade}
                    onChange={setMathsGrade}
                    options={['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => ({ value: g, label: g }))}
                  />
                  <Select
                    label="Biology"
                    value={biologyGrade}
                    onChange={setBiologyGrade}
                    options={['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => ({ value: g, label: g }))}
                  />
                  <Select
                    label="Chemistry"
                    value={chemistryGrade}
                    onChange={setChemistryGrade}
                    options={['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => ({ value: g, label: g }))}
                  />
                  <Select
                    label="Physics"
                    value={physicsGrade}
                    onChange={setPhysicsGrade}
                    options={['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => ({ value: g, label: g }))}
                  />
                </div>
              </div>

              <Input
                label="Portal Password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />

              <Button type="submit" isLoading={isLoading} className="w-full h-10 text-sm bg-[#0F7640] hover:bg-[#093322]">
                Submit Online Application
              </Button>
            </form>
          )}

          {/* Official Application Confirmation & Slip Modal */}
          <Modal
            isOpen={Boolean(submittedApplication)}
            onClose={() => setSubmittedApplication(null)}
            title="Online Admission Application Submitted"
            description="Your application has been registered in the college admission screening queue."
            size="lg"
            footer={
              <div className="flex items-center justify-end gap-2 w-full">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (!submittedApplication) return;
                    showToast({
                      type: 'success',
                      title: 'Opening Print Dialog',
                      message: 'Generating official admission slip for printing or saving as PDF.',
                    });
                    printInstitutionalDocument({
                      title: `Admission Application Slip — ${submittedApplication.fullName}`,
                      badgeText: `OFFICIAL ONLINE APPLICATION & CBT SCREENING SLIP`,
                      referenceNo: submittedApplication.applicationNumber,
                      issuedDate: submittedApplication.cbtDate,
                      schoolProfile,
                      officeSubtitle: 'Office of the Registrar • Admissions & Screening Division',
                      metaItems: [
                        { label: 'Application Number', value: submittedApplication.applicationNumber, highlight: true },
                        { label: 'Applicant Full Name', value: submittedApplication.fullName, highlight: true },
                        { label: 'Chosen Programme', value: submittedApplication.programme },
                        { label: 'Regulatory Council', value: submittedApplication.regulatoryBody },
                        { label: "O'Level Examination", value: `${submittedApplication.olevelExamBody} (${submittedApplication.olevelExamYear})` },
                        { label: 'Application Fee Ref', value: `${submittedApplication.applicationFeeRef} (PAID)` },
                      ],
                      summaryNoteHtml: `
                        <strong>Next Steps for Applicant:</strong><br/>
                        1. Present this slip at the College CBT Centre (or online screening portal) for your Entrance Screening Examination.<br/>
                        2. Upon scoring at least ${schoolProfile?.minimumCutoffScore || 50}% and O'Level verification, your provisional admission letter will be issued.<br/>
                        3. After admission, pay the Acceptance Fee in the Bursary portal to receive your official Matriculation Number and Student ID Card.
                      `,
                      stampText: 'APPLICATION REGISTERED',
                    });
                  }}
                >
                  Print Application Slip
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const appEmail = submittedApplication?.email || regEmail;
                    setSubmittedApplication(null);
                    setActiveTab('signin');
                    setEmail(appEmail);
                  }}
                >
                  Proceed to Sign In
                </Button>
              </div>
            }
          >
            {submittedApplication && (
              <div className="space-y-4 text-xs text-slate-700 font-sans">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F7640]" />
                    <span className="font-bold text-emerald-950">Application Reference Number:</span>
                  </div>
                  <span className="font-extrabold text-sm text-[#0F7640]">{submittedApplication.applicationNumber}</span>
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
                    <Badge variant="warning" size="sm">AWAITING ENTRANCE CBT</Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee Reference</span>
                    <span className="font-semibold text-[#0F7640]">{submittedApplication.applicationFeeRef}</span>
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
    </AuthFrame>
  );
};
