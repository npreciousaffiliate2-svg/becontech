import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button, Input, useToast } from '@campusone/ui';
import { useApp } from '../context/AppContext.tsx';
import type { RoleCode } from '@campusone/contracts';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('provost@bethsaida.edu.ng');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [programme, setProgramme] = useState('CHEW');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast({
        type: 'success',
        title: 'Authentication Successful',
        message: 'Welcome back to CampusOne.',
      });
      navigate('/');
    }, 600);
  };

  const handleQuickLogin = (role: RoleCode) => {
    switchRole(role);
    showToast({
      type: 'info',
      title: `Signed in as ${role}`,
      message: 'Switched persona and authenticated.',
    });
    navigate('/');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast({
        type: 'success',
        title: 'Application Account Provisioned',
        message: 'You can now proceed with online admission screening.',
      });
      navigate('/');
    }, 600);
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
        {/* Soft Background blur circles */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-md flex flex-col justify-between h-full relative z-10 py-8">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[4px] bg-white text-[#093322] font-bold text-sm flex items-center justify-center shadow-md">
              C1
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-white uppercase block leading-none">
                CampusOne
              </span>
              <span className="text-[11px] text-emerald-200 block mt-0.5">
                Bethsaida College of Health Tech
              </span>
            </div>
          </div>

          {/* Main Info Hero */}
          <div className="flex flex-col gap-6 my-auto">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Unified institutional system of record.
              </h2>
              <p className="text-sm text-blue-100/80 leading-relaxed font-normal">
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
                  <span className="text-blue-100/70 leading-relaxed">
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
                  <span className="text-blue-100/70 leading-relaxed">
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
                  <span className="text-blue-100/70 leading-relaxed">
                    Instant QR-verifiable official receipts with Paystack & Remita bank settlement integration.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof / Accreditation Badges */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-blue-100/70">
            <span>Accredited: CHPRBN • MLSCN • PCN</span>
            <span className="text-white font-medium">Session: 2026/2027</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: AUTH FORM CONTAINER (UseOneID Style) ─── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        <div className="w-full">
          {/* Header Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'signin' ? 'Sign in to CampusOne' : 'Applicant Registration'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'signin'
                ? 'Enter your institutional credentials or select a role to test.'
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
                label="Institutional Email / Matric No"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bethsaida.edu.ng"
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
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-[4px] text-[#0F7640] border-slate-300 focus:ring-[#0F7640]"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full h-10 text-sm">
                Sign In
              </Button>

              {/* 1-Click Persona Simulator Logins (For Testing) */}
              <div className="pt-4 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                  1-Click Quick Demo Sign In
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleQuickLogin('PROVOST')}
                    leftIcon={<UserCheck size={14} className="text-[#0F7640]" />}
                  >
                    Provost
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleQuickLogin('BURSAR')}
                    leftIcon={<CreditCard size={14} className="text-[#13A348]" />}
                  >
                    Bursar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleQuickLogin('EXAM')}
                    leftIcon={<GraduationCap size={14} className="text-amber-500" />}
                  >
                    Exams Officer
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleQuickLogin('STU')}
                    leftIcon={<UserCheck size={14} className="text-slate-600" />}
                  >
                    Student Portal
                  </Button>
                </div>
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Intended Health Programme
                </label>
                <select
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  className="w-full h-9 rounded-[4px] border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F7640]"
                >
                  <option value="CHEW">Community Health Extension Worker (CHEW)</option>
                  <option value="MLT">Medical Laboratory Technician (MLT)</option>
                  <option value="PHT">Pharmacy Technician</option>
                  <option value="HIM">Health Information Management</option>
                </select>
              </div>

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
