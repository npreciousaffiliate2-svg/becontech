import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button, Input, useToast } from '@campusone/ui';

export const ForgotPasswordView: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast({
        type: 'success',
        title: 'Reset Link Dispatched',
        message: 'Check your institutional inbox for instructions.',
      });
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[4px] p-8 shadow-sm">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-6"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div className="w-10 h-10 rounded-[4px] bg-emerald-50 text-[#0F7640] border border-emerald-200 flex items-center justify-center mb-4">
          <KeyRound size={20} />
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Enter your registered institutional email address and we'll send you an audited password reset link.
        </p>

        {isSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#13A348]">
              <CheckCircle2 size={16} /> Link Sent Successfully
            </div>
            <p>
              We have sent instructions to <span className="font-semibold text-slate-900">{email}</span>. Click the link in your email to choose a new password.
            </p>
            <div className="pt-2">
              <Button size="sm" variant="secondary" onClick={() => navigate('/login')}>
                Return to Login
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Institutional Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@bethsaida.edu.ng"
              required
            />
            <Button type="submit" isLoading={isLoading} className="w-full h-10 text-sm">
              Send Password Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
