import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { StatCard } from '../../components/common/StatCard';
import { Users, UserCheck, BookOpen, CalendarCheck, ShieldCheck, Layers, Award, TrendingUp, Megaphone } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Student, Teacher, Subject, Notice, Certificate } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const HodDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deptName] = useState('Computer Science');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const fetchDeptData = async () => {
      const [stdData, tchData, subjData, noticeData, certData] = await Promise.all([
        dbService.getDepartmentStudents(deptName),
        dbService.getDepartmentTeachers(deptName),
        dbService.getSubjects(),
        dbService.getNotices(),
        dbService.getCertificates(),
      ]);
      setStudents(stdData);
      setTeachers(tchData);
      setSubjects(subjData);
      setNotices(noticeData);
      setCertificates(certData);
    };
    fetchDeptData();
  }, [deptName]);

  const pendingCertsCount = certificates.filter(c => c.status === 'pending').length;

  const chartData = [
    { semester: 'Sem 1', avgAttendance: 92, avgMarks: 84 },
    { semester: 'Sem 3', avgAttendance: 88, avgMarks: 81 },
    { semester: 'Sem 5', avgAttendance: 95, avgMarks: 89 },
    { semester: 'Sem 7', avgAttendance: 91, avgMarks: 86 },
  ];

  return (
    <div className="space-y-6">
      {/* HOD Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-2 border border-indigo-500/30">
            👔 Head of Department Control Panel ({deptName})
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.full_name || 'Department HOD'}
          </h1>
          <p className="text-xs text-indigo-200 mt-1">
            Department governance, faculty workload overview, student academic performance & certificate audits
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/hod/allocations')}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Faculty Allocations</span>
          </button>

          <button
            onClick={() => navigate('/hod/certificates')}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Audit Certs ({pendingCertsCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Department Students" value={students.length} icon={Users} color="brand" subtitle="Enrolled Roster" />
        <StatCard title="Department Faculty" value={teachers.length} icon={UserCheck} color="emerald" subtitle="Active Professors" />
        <StatCard title="Offered Subjects" value={subjects.length} icon={BookOpen} color="purple" subtitle="Active Curriculum" />
        <StatCard title="Pending Approvals" value={pendingCertsCount} icon={ShieldCheck} color="amber" subtitle="Requires Action" />
      </div>

      {/* Analytics & Quick Command Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
            Department Semester Performance & Attendance Overview
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="avgAttendance" name="Avg Attendance %" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avgMarks" name="Avg Score %" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">HOD Actions & Management</h3>
          <div className="space-y-2 text-xs font-semibold">
            <button
              onClick={() => navigate('/hod/teachers')}
              className="w-full p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Manage Department Faculty</span>
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/hod/students')}
              className="w-full p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>View Department Students Roster</span>
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/hod/attendance')}
              className="w-full p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" />
                <span>Audit Attendance Records</span>
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/hod/marks')}
              className="w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Gradebook & Marks Audit</span>
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
