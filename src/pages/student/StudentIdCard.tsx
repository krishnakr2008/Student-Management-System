import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, ShieldCheck, Printer, QrCode, Sparkles } from 'lucide-react';

export const StudentIdCard: React.FC = () => {
  const { student, user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-2 border border-purple-500/30">
            🪪 Official Digital Campus Credential
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Digital Student ID Card
          </h1>
          <p className="text-xs text-purple-200 mt-1">
            Verified institutional identity card with QR security pass for campus access
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2 shrink-0"
        >
          <Printer className="w-4 h-4 text-slate-950" />
          <span>Print / Download ID Card</span>
        </button>
      </div>

      {/* ID Card Display Container */}
      <div className="flex justify-center p-4">
        <div className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 shadow-2xl text-white space-y-6 relative overflow-hidden">
          {/* Subtle Background Badge Pattern */}
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
            <GraduationCap className="w-64 h-64 text-white" />
          </div>

          {/* Card Top Branding */}
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-600 rounded-xl text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight leading-tight">STATE UNIVERSITY</h3>
                <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block">
                  OFFICIAL STUDENT CREDENTIAL
                </span>
              </div>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>

          {/* Student Photo & ID Details */}
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.full_name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
            />
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white leading-tight">{user?.full_name}</h2>
              <p className="text-xs font-bold text-brand-400">{student?.course_name || 'B.Tech Computer Science'}</p>
              <div className="text-[11px] text-indigo-200 space-y-0.5 pt-1">
                <p>Roll No: <strong className="text-white">{student?.roll_number || '23CS101'}</strong></p>
                <p>ID Code: <strong className="text-white">{student?.student_id_code || 'STD-8901'}</strong></p>
                <p>Sem / Sec: <strong className="text-white">Sem {student?.semester || 5} ({student?.section || 'A'})</strong></p>
              </div>
            </div>
          </div>

          {/* QR Pass & Verification Bar */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Verification Status
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Enrolled Student</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Valid: 2023 - 2027</span>
            </div>

            {/* QR Code Icon Simulation */}
            <div className="p-2 bg-white text-slate-950 rounded-xl shadow-md flex items-center justify-center">
              <QrCode className="w-10 h-10" />
            </div>
          </div>

          {/* Card Footer */}
          <div className="text-center pt-1 border-t border-indigo-500/20">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              PROPERTY OF STATE TECHNOLOGICAL UNIVERSITY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
