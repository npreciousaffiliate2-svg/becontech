import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthFrame, AUTH_SECURITY_LINE } from '../components/auth/AuthFrame.tsx';
import { Button, Input, Checkbox, useToast } from '@campusone/ui';
import { useApp } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { type RoleCode } from '@campusone/contracts';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs, schoolProfile } = useApp();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `Sign In — ${schoolProfile?.institutionName?.replace(' Ltd', '') || 'CampusOne'}`;
    const iconLinks = document.querySelectorAll("link[rel*='icon']");
    iconLinks.forEach((link) => {
      (link as HTMLLinkElement).href = '/BeonTech-Logo.png';
    });
  }, [schoolProfile?.institutionName]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      localStorage.setItem('campusone_current_user_email', email.trim());
    } catch {}

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

    loginAs(profile.role as RoleCode, email.trim(), profile.full_name);
    setIsLoading(false);
    showToast({
      type: 'success',
      title: 'Signed in',
      message: `Welcome back, ${profile.full_name}.`,
    });
    navigate('/');
  };

  return (
    <AuthFrame>
      {/* Mobile Crest Logo */}
      <Link to="/" className="flex lg:hidden items-center gap-2 mb-6 hover:opacity-90 transition-opacity">
        <img
          src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
          alt="College Crest"
          className="w-8 h-8 rounded-[4px] object-contain"
        />
        <span className="text-sm font-extrabold uppercase tracking-wider text-[#093322] font-sans">
          {schoolProfile?.institutionAcronym || 'CampusOne'}
        </span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Sign in to CampusOne
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Sign in with your registered email address and password.
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@becohtech.edu.ng"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-[11px] font-semibold text-[#0F7640] hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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

        <div className="flex items-center justify-between text-xs">
          <Checkbox
            checked={rememberMe}
            onChange={(checked) => setRememberMe(checked)}
            label="Keep me signed in on this computer"
          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full h-10 text-sm bg-[#0F7640] hover:bg-[#093322]"
        >
          Sign In to CampusOne
        </Button>

        <div className="pt-2 text-center text-xs text-slate-400">
          {AUTH_SECURITY_LINE}
        </div>
      </form>
    </AuthFrame>
  );
};
