import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { StatCard } from '../../components/common/StatCard';
import { Users, UserCheck, BookOpen, CalendarCheck, FileCheck, ShieldCheck, TrendingUp, Layers, UserPlus, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Course, Student, Teacher, Certificate, TeacherSubject, StudentSubject } from '../../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      const [stdData, tchData, crsData, certData, tsData, ssData] = await Promise.all([
        dbService.getStudents(),
        dbService.getTeachers(),
        dbService.getCourses(),
        dbService.getCertificates(),
        dbService.getTeacherSubjects(),
        dbService.getStudentSubjects(),
      ]);
      setStudents(stdData);
      setTeachers(tchData);
      setCourses(crsData);
      setCertificates(certData);
      setTeacherSubjects(tsData);
      setStudentSubjects(ssData);
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
            👨‍💼 HOD & Institutional System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Head of Department Control Center
          </h1>
          <p className="text-xs text-purple-200 mt-1">
            Full Institutional Governance, Subject Allocations, Attendance Overrides & Grade Audits
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/admin/teacher-allocations')}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Faculty Allocations ({teacherSubjects.length})</span>
          </button>

          <button
            onClick={() => navigate('/admin/certificates')}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Audit Certs ({pendingCertsCount})</span>
          </button>
        </div>
      </div>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Students" value={students.length} icon={Users} color="brand" subtitle="Enrolled Roster" />
        <StatCard title="Faculty Members" value={teachers.length} icon={UserCheck} color="emerald" subtitle="Active Instructors" />
        <StatCard title="Teacher Allocations" value={teacherSubjects.length} icon={Layers} color="purple" subtitle="Subject Assignments" />
        <StatCard title="Student Enrollments" value={studentSubjects.length} icon={UserPlus} color="sky" subtitle="Subject Registrations" />
        <StatCard title="Pending Certs" value={pendingCertsCount} icon={FileCheck} color="amber" subtitle="Requires Audit" />
        <StatCard title="Avg Campus GPA" value="8.92" icon={TrendingUp} color="emerald" subtitle="Academic Distinction" />
      </div>

      {/* Institutional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Student Enrollment Distribution by Degree Program</h3>
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
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">HOD Quick Command Hub</h3>
          <div className="space-y-2 text-xs font-semibold">
            <button
              onClick={() => navigate('/admin/teacher-allocations')}
              className="w-full p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Assign Faculty to Subjects</span>
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/admin/student-allocations')}
              className="w-full p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Enroll Students in Subjects</span>
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/admin/attendance')}
              className="w-full p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" />
                <span>Attendance Overrides</span>
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/admin/marks')}
              className="w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>HOD Gradebook & Marks Control</span>
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
