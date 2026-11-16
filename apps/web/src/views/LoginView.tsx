import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  CreditCard,
  UserCheck,
  Building2,
  BookOpen,
  Stethoscope,
  Briefcase,
} from 'lucide-react';
import { Button, Input, Checkbox, Select, useToast } from '@campusone/ui';
import { useApp } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
import type { RoleCode } from '@campusone/contracts';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs, schoolProfile } = useApp();
  const { showToast } = useToast();

  useEffect(() => {
    document.title = `CampusOne — ${schoolProfile?.institutionName || 'Sign In'}`;
    const iconLinks = document.querySelectorAll("link[rel*='icon']");
    iconLinks.forEach((link) => {
      (link as HTMLLinkElement).href = '/BeonTech-Logo.png';
    });
  }, [schoolProfile?.institutionName]);

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [programme, setProgramme] = useState('CHEW');
  const [regPassword, setRegPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPassword,
      options: { data: { full_name: fullName, programme } },
    });
    if (error || !data.user) {
      setIsLoading(false);
      showToast({
        type: 'danger',
        title: 'Account not created',
        message: error?.message || 'Registration could not be completed.',
      });
      return;
    }
    if (data.session) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        college_id: 'bethsaida',
        email: regEmail.trim(),
        full_name: fullName,
        role: 'STU',
        auth_user_id: data.user.id,
        phone,
      });
      loginAs('STU');
      setIsLoading(false);
      showToast({
        type: 'success',
        title: 'Account created',
        message: 'You are signed in as a student. The registry can attach your matriculation number.',
      });
      navigate('/');
      return;
    }
    setIsLoading(false);
    showToast({
      type: 'info',
      title: 'Confirm your email',
      message: 'CampusOne sent a confirmation link. Sign in after you confirm the address.',
    });
    setActiveTab('signin');
    setEmail(regEmail);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* ─── LEFT: AUTH HERO SIDEBAR (UseOneID Style — Bethsaida Health Green) ─── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #093322 0%, #052015 100%)',
        }}
        className="hidden lg:flex w-1/2 relative items-center justify-center p-12 overflow-hidden select-none"
      >
        <div className="max-w-md flex flex-col justify-between h-full relative z-10 py-8">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <img
              src="/BeonTech-Logo.png"
              alt="BeonTech Platform Crest"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
              }}
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

          {/* Main Info Hero */}
          <div className="flex flex-col gap-6 my-auto">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                College Academic & Management System.
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed font-normal">
                Seamlessly unifies admissions, bursary fee settlements, examination broadsheets, and clinical hospital postings in one accredited single-tenant cloud environment.
              </p>
            </div>

            {/* List of Key Pillars */}
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#13A348]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">NDPA 2023 & Board Regulatory Security</span>
                  <span className="text-emerald-100/70 leading-relaxed">
                    Tamper-evident audit logging and role-based permissions verified by regulatory boards.
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

          {/* Social Proof / Accreditation Badges */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-emerald-100/70">
            <span>Accredited: CHPRBN • MLSCN • PCN</span>
            <span className="text-white font-medium">Session: 2026/2027</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: AUTH FORM CONTAINER (UseOneID Style) ─── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        <div className="w-full">
          {/* Platform Crest Logo */}
          <div className="flex items-center gap-2 mb-4">
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

              <div className="pt-2 text-center text-xs text-slate-400">
                Single-sign-on protected by NDPA 2023 & Board Regulatory Security.
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amina Adebayo"
                required
              />
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
              <Input
                label="Password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
              <Select
                label="Intended Health Programme"
                value={programme}
                onChange={setProgramme}
                options={[
                  { value: 'CHEW', label: 'Community Health Extension Worker (CHEW)' },
                  { value: 'MLT', label: 'Medical Laboratory Technician (MLT)' },
                  { value: 'PHT', label: 'Pharmacy Technician' },
                  { value: 'HIM', label: 'Health Information Management' },
                ]}
              />

              <Button type="submit" isLoading={isLoading} className="w-full h-10 text-sm">
                Create Account & Continue
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
