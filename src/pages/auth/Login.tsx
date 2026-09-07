import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { GraduationCap, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('student@university.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, selectedRole);
    setIsSubmitting(false);

    if (success) {
      showToast('Login Successful', `Welcome back to the ${selectedRole} portal!`, 'success');
      navigate(`/${selectedRole}/dashboard`);
    } else {
      showToast('Authentication Failed', 'Invalid credentials or user record not found.', 'error');
    }
  };

  const handleQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'student') setEmail('student@university.edu');
    else if (role === 'teacher') setEmail('teacher@university.edu');
    else setEmail('admin@university.edu');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Logo Branding */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex p-3 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-600/30 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Portal Login</h2>
          <p className="text-xs text-slate-400">Select your role to sign into Smart UniPortal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold">
          {(['student', 'teacher', 'admin'] as UserRole[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => handleQuickFill(r)}
              className={`py-2 rounded-xl capitalize transition-all ${
                selectedRole === r
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Login Form */}
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-400 hover:underline">
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
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
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
            className="w-full py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Viva Demo Fillers */}
        <div className="pt-2 border-t border-slate-800 text-center space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Technical Viva Demo Fillers
          </span>
          <div className="flex justify-center gap-2 text-xs">
            <button
              onClick={() => handleQuickFill('student')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-brand-400 border border-slate-800 rounded-lg"
            >
              Demo Student
            </button>
            <button
              onClick={() => handleQuickFill('teacher')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg"
            >
              Demo Teacher
            </button>
            <button
              onClick={() => handleQuickFill('admin')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-purple-400 border border-slate-800 rounded-lg"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-400 font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};
