import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthFrame, AUTH_SECURITY_LINE } from '../components/auth/AuthFrame.tsx';
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

              <div className="pt-2 text-center text-xs text-slate-400">
                {AUTH_SECURITY_LINE}
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
    </AuthFrame>
  );
};
