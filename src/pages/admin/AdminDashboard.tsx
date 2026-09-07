import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { StatCard } from '../../components/common/StatCard';
import { Users, UserCheck, BookOpen, CalendarCheck, FileCheck, ShieldCheck, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Course, Student, Teacher, Certificate } from '../../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      const [stdData, tchData, crsData, certData] = await Promise.all([
        dbService.getStudents(),
        dbService.getTeachers(),
        dbService.getCourses(),
        dbService.getCertificates(),
      ]);
      setStudents(stdData);
      setTeachers(tchData);
      setCourses(crsData);
      setCertificates(certData);
    };
    fetchAdminData();
  }, []);

  const pendingCertsCount = certificates.filter(c => c.status === 'pending').length;

  const coursePieData = courses.map((c, i) => ({
    name: c.code,
    value: c.student_count || 100,
    color: ['#0c8de9', '#8b5cf6', '#10b981'][i % 3],
  }));

  return (
    <div className="space-y-6">
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 text-[11px] font-semibold mb-1">
            👨‍💼 System Administration & Academic Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Control Center
          </h1>
          <p className="text-xs text-purple-200 mt-1">
            Overall University SaaS Metrics, Student Management, and Document Audit
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/certificates')}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2 shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-slate-950" />
          <span>Audit Pending Certificates ({pendingCertsCount})</span>
        </button>
      </div>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Students" value={students.length} icon={Users} color="brand" subtitle="Enrolled Roster" />
        <StatCard title="Faculty Members" value={teachers.length} icon={UserCheck} color="emerald" subtitle="Active Instructors" />
        <StatCard title="Active Courses" value={courses.length} icon={BookOpen} color="purple" subtitle="Degree Programs" />
        <StatCard title="Avg Attendance" value="92.1%" icon={CalendarCheck} color="sky" subtitle="Campus Benchmark" />
        <StatCard title="Pending Certs" value={pendingCertsCount} icon={FileCheck} color="amber" subtitle="Requires Audit" />
        <StatCard title="Avg CGPA" value="8.92" icon={TrendingUp} color="emerald" subtitle="Academic Distinction" />
      </div>

      {/* Institutional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Student Enrollment Distribution by Course</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePieData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Quick Administrative Actions</h3>
          <div className="space-y-2 text-xs font-semibold">
            <button
              onClick={() => navigate('/admin/students')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left text-slate-800 dark:text-slate-200 flex items-center justify-between"
            >
              <span>👨‍🎓 Manage Student Database</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/admin/teachers')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left text-slate-800 dark:text-slate-200 flex items-center justify-between"
            >
              <span>👩‍🏫 Manage Faculty Directory</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/admin/certificates')}
              className="w-full p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-left flex items-center justify-between"
            >
              <span>📜 Audit External Certificates</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="w-full p-3 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 hover:bg-brand-500/20 text-left flex items-center justify-between"
            >
              <span>📊 Export Reports & CSV Data</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
