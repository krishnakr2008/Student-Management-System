import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { GraduationCap, Eye, EyeOff, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('admin@college.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    let loginEmail = identifier;
    if (!identifier.includes('@')) {
      loginEmail = 'admin@college.com';
    }

    const success = await login(loginEmail, 'admin');
    setIsSubmitting(false);

    if (success) {
      showToast('Admin Login Successful', 'Welcome to Institutional Admin Control Center!', 'success');
      navigate('/admin/dashboard');
    } else {
      showToast('Authentication Failed', 'Invalid administrator credentials.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Admin Branding */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex p-3 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-600/30 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Institutional Admin Login</h2>
          <p className="text-xs text-slate-400">Master access for institution governance, fees, and master user rosters</p>
        </div>

        {/* Switcher */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs">
          <span className="text-slate-400 font-semibold">Not an Admin?</span>
          <div className="flex gap-2 font-bold">
            <Link to="/login/student" className="text-brand-400 hover:underline">Student</Link>
            <span className="text-slate-600">•</span>
            <Link to="/login/teacher" className="text-emerald-400 hover:underline">Teacher</Link>
            <span className="text-slate-600">•</span>
            <Link to="/login/hod" className="text-indigo-400 hover:underline">HOD</Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Admin Username or Email</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="admin@college.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-purple-400 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Sign In to Admin Hub</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill */}
        <div className="pt-3 border-t border-slate-800 text-center space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Admin Test Account
          </span>
          <button
            onClick={() => { setIdentifier('admin@college.com'); setPassword('password123'); }}
            className="w-full p-2.5 bg-slate-950 hover:bg-purple-950/40 text-purple-400 border border-slate-800 rounded-xl text-left font-semibold text-xs"
          >
            <span className="block font-bold">Dr. Eleanor Vance (Institutional Admin)</span>
            <span className="text-[10px] text-slate-400">admin@college.com</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          <Link to="/login" className="text-slate-400 font-bold hover:underline">
            ← Back to All Login Portals
          </Link>
        </div>
      </div>
    </div>
  );
};
