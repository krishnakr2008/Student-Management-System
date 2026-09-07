import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { GraduationCap, Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    showToast('Reset Link Sent', 'Password reset instructions have been sent to your email.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div
            className="inline-flex p-3 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-600/30 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400">Enter your registered email to receive reset instructions</p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
            <h3 className="text-sm font-bold text-emerald-400">Check Your Email</h3>
            <p className="text-xs text-slate-300">
              We've dispatched a password reset link to <strong className="text-white">{email}</strong>.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-xs font-semibold text-brand-400 hover:underline"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Reset Link</span>
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-bold text-brand-400 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
