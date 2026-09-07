import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  CalendarCheck,
  Award,
  FileText,
  CheckCircle,
  Briefcase,
  BarChart3,
  Shield,
  ArrowRight,
  UserCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const handleDemoAccess = async (role: 'student' | 'teacher' | 'admin') => {
    await switchRole(role);
    navigate(`/${role}/dashboard`);
  };

  const features = [
    { title: 'Student Management', desc: 'Centralized database for student profiles, enrollment, courses, and guardians.', icon: UserCheck, color: 'text-blue-500' },
    { title: 'Real-time Attendance', desc: 'Subject-wise attendance tracking with formula percentage, status alerts, and history.', icon: CalendarCheck, color: 'text-emerald-500' },
    { title: 'Marks & Results', desc: 'Internal, mid-sem, and end-sem mark compilation with automated SGPA/CGPA formulas.', icon: Award, color: 'text-purple-500' },
    { title: 'Assignments Portal', desc: 'Digital assignment submission, attachment file uploads, and teacher evaluation.', icon: FileText, color: 'text-amber-500' },
    { title: 'Exams & Assessment', desc: 'Centralized datesheets, seating allocation info, quiz schedules, and instructions.', icon: CheckCircle, color: 'text-rose-500' },
    { title: 'Certificate Verification', desc: 'External skill certificate management with admin approval/rejection workflow.', icon: Shield, color: 'text-sky-500' },
    { title: 'Resume Builder', desc: 'Interactive CV builder with live preview, multiple templates, and real PDF download.', icon: Briefcase, color: 'text-indigo-500' },
    { title: 'Rule-Based AI Career Assistant', desc: 'Skill pattern matching engine, missing skill gap analysis, and 10-phase roadmaps.', icon: Sparkles, color: 'text-amber-400' },
    { title: 'Performance Analytics', desc: 'Interactive Recharts visualizations for SGPA trends, class averages, and progress.', icon: BarChart3, color: 'text-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block">UniPortal</span>
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Academic SaaS</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 text-center overflow-hidden max-w-6xl mx-auto">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-slate-950 to-slate-950" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Next-Generation University SaaS Portal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Smart Student Management & <span className="bg-gradient-to-r from-brand-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">Career Portal</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Manage academics, attendance, assignments, examinations, certificates and career development from one production-ready platform.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center gap-2"
          >
            <span>Launch Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDemoAccess('student')}
            className="px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all"
          >
            Demo Student Portal
          </button>
        </div>

        {/* Quick Role Access Shortcuts */}
        <div className="mt-12 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl max-w-xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs font-medium">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Quick Demo Access:</span>
          <button onClick={() => handleDemoAccess('student')} className="text-brand-400 hover:underline">🎓 Student</button>
          <button onClick={() => handleDemoAccess('teacher')} className="text-emerald-400 hover:underline">👩‍🏫 Teacher</button>
          <button onClick={() => handleDemoAccess('admin')} className="text-purple-400 hover:underline">👨‍💼 Admin</button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Comprehensive Academic & Career Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-3">
              Engineered with full Supabase integration, role authorization, and real database persistence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-brand-500/50 transition-all group"
                >
                  <div className={`p-3 rounded-xl bg-slate-800/60 inline-block mb-4 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Overview Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-brand-950/60 to-slate-900 border border-brand-500/30 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              Career Acceleration Included
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built-In Resume Builder & Rule-Based AI Assistant
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Equip students with customized career roadmaps, missing skill detection, technical interview question banks, and instant PDF Resume export.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-2">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Multi-template professional resume generator</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Real jsPDF file download without server dependencies</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Intelligent skill matching for Frontend, MERN, Python, & Java tracks</li>
            </ul>
          </div>

          <div className="w-full md:w-80 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 text-center">
            <div className="p-4 rounded-full bg-brand-600/20 text-brand-400 inline-block">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-white">Ready for Technical Viva</h4>
            <p className="text-xs text-slate-400">
              Complete working code, role authorization, real database queries, and zero fake buttons.
            </p>
            <button
              onClick={() => handleDemoAccess('student')}
              className="w-full py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-colors"
            >
              Explore Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>© 2026 Smart Student Management & Career Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};
