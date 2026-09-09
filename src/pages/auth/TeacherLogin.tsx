import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { GraduationCap, Eye, EyeOff, Lock, ArrowRight, UserCheck } from 'lucide-react';

export const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('teacher1@college.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Validation Error', 'Please fill in required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await login(identifier, 'teacher', password);
    setIsSubmitting(false);

    const isSuccess = typeof res === 'boolean' ? res : res.success;
    const actualRole = typeof res === 'boolean' ? 'teacher' : (res.actualRole || 'teacher');
    const errorMsg = typeof res === 'boolean' ? 'Invalid credentials.' : (res.error || 'Authentication failed.');

    if (isSuccess) {
      showToast('Faculty Login Successful', 'Welcome to Faculty Portal!', 'success');
      navigate(`/${actualRole}/dashboard`);
    } else {
      showToast('Authentication Failed', errorMsg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Teacher Branding */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/30 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Faculty & Teacher Login</h2>
          <p className="text-xs text-slate-400">Manage subject attendance, gradebooks, and student assignments</p>
        </div>

        {/* Switcher */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs">
          <span className="text-slate-400 font-semibold">Not a faculty member?</span>
          <div className="flex gap-2 font-bold">
            <Link to="/login/student" className="text-brand-400 hover:underline">Student</Link>
            <span className="text-slate-600">•</span>
            <Link to="/login/hod" className="text-indigo-400 hover:underline">HOD</Link>
            <span className="text-slate-600">•</span>
            <Link to="/login/admin" className="text-purple-400 hover:underline">Admin</Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Teacher ID Code or Email</label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="TCH-1001 or teacher1@college.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-emerald-400 hover:underline">
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
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
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
            className="w-full py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In as Faculty</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill */}
        <div className="pt-3 border-t border-slate-800 text-center space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Faculty Test Accounts
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => { setIdentifier('teacher1@college.com'); setPassword('password123'); }}
              className="p-2.5 bg-slate-950 hover:bg-emerald-950/40 text-emerald-400 border border-slate-800 rounded-xl text-left"
            >
              <span className="block font-bold">Dr. Vance (C++)</span>
              <span className="text-[10px] text-slate-400">teacher1@college.com</span>
            </button>
            <button
              onClick={() => { setIdentifier('teacher2@college.com'); setPassword('password123'); }}
              className="p-2.5 bg-slate-950 hover:bg-emerald-950/40 text-emerald-400 border border-slate-800 rounded-xl text-left"
            >
              <span className="block font-bold">Prof. Reddy (Math)</span>
              <span className="text-[10px] text-slate-400">teacher2@college.com</span>
            </button>
          </div>
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
