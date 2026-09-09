import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { GraduationCap, UserCheck, ShieldCheck, Layers, BookOpen, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('student1@college.com');
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
    const res = await login(email, selectedRole, password);
    setIsSubmitting(false);

    const isSuccess = typeof res === 'boolean' ? res : res.success;
    const actualRole = typeof res === 'boolean' ? selectedRole : (res.actualRole || selectedRole);
    const errorMsg = typeof res === 'boolean' ? 'Invalid credentials.' : (res.error || 'Authentication failed.');

    if (isSuccess) {
      showToast('Login Successful', 'Welcome to the portal!', 'success');
      navigate(`/${actualRole}/dashboard`);
    } else {
      showToast('Authentication Failed', errorMsg, 'error');
    }
  };

  const handleQuickFill = (emailValue: string, roleValue: UserRole) => {
    setSelectedRole(roleValue);
    setEmail(emailValue);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-4xl space-y-8">
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div
            className="inline-flex p-3.5 bg-brand-600 rounded-2xl text-white shadow-xl shadow-brand-600/30 cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate('/')}
          >
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Institutional ERP Portal Gateway
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Select your dedicated role login portal or proceed below with quick sign-in
          </p>
        </div>

        {/* 4 Dedicated Login Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Student Portal Card */}
          <div
            onClick={() => navigate('/login/student')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 rounded-3xl p-5 shadow-xl hover:shadow-brand-500/10 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                  Student Login
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Grades, attendance, fee ledger, timetable & AI career assistant
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-bold text-brand-400 gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Open Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Teacher Portal Card */}
          <div
            onClick={() => navigate('/login/teacher')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 shadow-xl hover:shadow-emerald-500/10 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Teacher Login
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Subject attendance, gradebook, assignments & class rosters
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-400 gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Open Faculty Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* HOD Portal Card */}
          <div
            onClick={() => navigate('/login/hod')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 shadow-xl hover:shadow-indigo-500/10 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                  HOD Login
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Department governance, faculty allocations & academic audit
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-400 gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Open HOD Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Admin Portal Card */}
          <div
            onClick={() => navigate('/login/admin')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-5 shadow-xl hover:shadow-purple-500/10 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                  Admin Login
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Institutional master hub, fees, course catalog & system controls
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-bold text-purple-400 gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Open Admin Hub</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Quick Unified Sign In Form */}
        <div className="max-w-md mx-auto w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="text-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Express Sign In</h3>
            <p className="text-[11px] text-slate-400">Or use instant login below</p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleQuickFill('student1@college.com', 'student')}
              className={`py-1.5 rounded-xl capitalize transition-all ${
                selectedRole === 'student' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('teacher1@college.com', 'teacher')}
              className={`py-1.5 rounded-xl capitalize transition-all ${
                selectedRole === 'teacher' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Teacher
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('hod.cs@college.com', 'hod')}
              className={`py-1.5 rounded-xl capitalize transition-all ${
                selectedRole === 'hod' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              HOD
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@college.com', 'admin')}
              className={`py-1.5 rounded-xl capitalize transition-all ${
                selectedRole === 'admin' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Email Address or ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-brand-400 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Signing in...' : `Sign In as ${selectedRole.toUpperCase()}`}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 font-bold hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
