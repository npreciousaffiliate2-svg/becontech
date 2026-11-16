import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button, Input, useToast } from '@campusone/ui';
import { AuthFrame, AUTH_SECURITY_LINE } from '../components/auth/AuthFrame.tsx';
import { supabase } from '../lib/supabase.ts';

export const ForgotPasswordView: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setIsLoading(false);
    if (error) {
      showToast({
        type: 'danger',
        title: 'Reset email not sent',
        message: error.message,
      });
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <AuthFrame>
      <div className="flex lg:hidden items-center gap-2 mb-4">
        <img
          src="/BeonTech-Logo.png"
          alt="BeonTech Platform Logo"
          className="w-8 h-8 rounded-[4px] object-contain"
        />
        <span className="text-sm font-extrabold uppercase tracking-wider text-[#093322] font-sans">
          CampusOne
        </span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset your password</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your registered college email address and we will send you a password reset link.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#13A348]">
            <CheckCircle2 size={16} /> Link sent successfully
          </div>
          <p>
            We have sent instructions to{' '}
            <span className="font-semibold text-slate-900">{email}</span>. Click the link in your
            email to choose a new password.
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              variant="secondary"
              className="w-full h-10 text-sm"
              onClick={() => navigate('/login')}
            >
              Return to sign in
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="College Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@bethsaida.edu.ng"
            required
          />
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-10 text-sm bg-[#0F7640] hover:bg-[#093322]"
          >
            Send Password Reset Link
          </Button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
          <div className="pt-2 text-center text-xs text-slate-400">{AUTH_SECURITY_LINE}</div>
        </form>
      )}
    </AuthFrame>
  );
};
