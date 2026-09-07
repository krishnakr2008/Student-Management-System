import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  CalendarCheck,
  Award,
  FileText,
  CheckCircle,
  FileCheck,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  SubjectAttendanceSummary,
  MarkRecord,
  Assignment,
  Exam,
  Notice,
  Certificate,
  TimetableSlot,
} from '../../types';
import { calculateCareerReadinessScore } from '../../services/careerEngine';

export const StudentDashboard: React.FC = () => {
  const { user, student } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState<SubjectAttendanceSummary[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!student) return;
      setLoading(true);

      const [attData, marksData, asgnData, examData, noticeData, certData, ttData] = await Promise.all([
        dbService.getStudentAttendanceSummary(student.id),
        dbService.getStudentMarks(student.id),
        dbService.getAssignments(),
        dbService.getExams(),
        dbService.getNotices(),
        dbService.getCertificates(student.id),
        dbService.getTimetable(),
      ]);

      setAttendanceSummary(attData);
      setMarks(marksData);
      setAssignments(asgnData);
      setExams(examData);
      setNotices(noticeData);
      setCertificates(certData);
      setTimetable(ttData);

      setLoading(false);
    };

    loadDashboardData();
  }, [student]);

  if (loading || !student) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  // Calculate Aggregates
  const totalAttClasses = attendanceSummary.reduce((acc, curr) => acc + curr.total_classes, 0);
  const totalAttPresent = attendanceSummary.reduce((acc, curr) => acc + curr.present_classes, 0);
  const overallAttendancePercent = totalAttClasses > 0 ? Math.round((totalAttPresent / totalAttClasses) * 100) : 92;

  const latestSGPA = marks.length > 0 ? marks[0].sgpa : 9.1;
  const latestCGPA = marks.length > 0 ? marks[0].cgpa : 8.95;
  const pendingAssignmentsCount = assignments.filter(a => a.submission_status === 'pending').length;
  const verifiedCertsCount = certificates.filter(c => c.status === 'verified').length;

  const readiness = calculateCareerReadinessScore(6, 2, verifiedCertsCount, true, 90, latestCGPA);

  const performanceChartData = marks.map(m => ({
    name: m.subject_code || 'Subj',
    Marks: m.total_marks,
  }));

  const sgpaTrendData = [
    { sem: 'Sem 1', sgpa: 8.5 },
    { sem: 'Sem 2', sgpa: 8.7 },
    { sem: 'Sem 3', sgpa: 8.9 },
    { sem: 'Sem 4', sgpa: 9.1 },
    { sem: 'Sem 5', sgpa: latestSGPA },
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.full_name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
          />
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-brand-100 text-[11px] font-semibold mb-1">
              🎓 {student.course_name || 'B.Tech CSE'} • Semester {student.semester} ({student.section})
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs text-brand-100 mt-1">
              Roll No: <strong>{student.roll_number}</strong> | Student ID: <strong>{student.student_id_code}</strong> | Branch: <strong>{student.branch}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/student/career-assistant')}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-900" />
          <span>Launch AI Career Assistant</span>
        </button>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Attendance"
          value={`${overallAttendancePercent}%`}
          icon={CalendarCheck}
          color={overallAttendancePercent >= 85 ? 'emerald' : overallAttendancePercent >= 75 ? 'amber' : 'rose'}
          subtitle={overallAttendancePercent >= 85 ? 'Safe Standing' : 'Below Threshold'}
        />
        <StatCard
          title="Current SGPA"
          value={latestSGPA}
          icon={Award}
          color="brand"
          subtitle="Semester 5"
        />
        <StatCard
          title="Current CGPA"
          value={latestCGPA}
          icon={TrendingUp}
          color="purple"
          subtitle="Overall Average"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingAssignmentsCount}
          icon={FileText}
          color="amber"
          subtitle="Assignments Due"
        />
        <StatCard
          title="Exams"
          value={exams.length}
          icon={CheckCircle}
          color="sky"
          subtitle="Upcoming Tests"
        />
        <StatCard
          title="Certificates"
          value={certificates.length}
          icon={FileCheck}
          color="emerald"
          subtitle={`${verifiedCertsCount} Verified`}
        />
      </div>

      {/* Main Grid: Charts & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Subject Performance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total marks obtained per subject (Out of 100)</p>
              </div>
              <button
                onClick={() => navigate('/student/marks')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View Results →
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Marks" fill="#0c8de9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SGPA Trend */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">SGPA Academic Trend</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Progression across semesters 1 to 5</p>
              </div>
              <button
                onClick={() => navigate('/student/analytics')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Full Analytics →
              </button>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sgpaTrendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[7, 10]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="sgpa" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Class Schedule Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Today's Class Schedule</h3>
                <p className="text-xs text-slate-500">Live timeline & room allocations for your batch</p>
              </div>
              <button
                onClick={() => navigate('/student/timetable')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Full Timetable →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(timetable.filter(t => t.day === 'Monday' || t.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).slice(0, 4)).map(slot => (
                <div key={slot.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {slot.start_time} - {slot.end_time}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      {slot.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{slot.subject_name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{slot.subject_code}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Faculty: {slot.teacher_name || 'Assigned'}</span>
                    <span className="font-bold text-rose-500">Room {slot.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upcoming Assignments</h3>
              <button
                onClick={() => navigate('/student/assignments')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                All Assignments →
              </button>
            </div>

            <div className="space-y-3">
              {assignments.slice(0, 3).map(asgn => (
                <div
                  key={asgn.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                      {asgn.subject_name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{asgn.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Due: {new Date(asgn.due_date).toLocaleDateString()}
                    </p>
                  </div>

                  <Badge variant={asgn.submission_status === 'graded' ? 'graded' : asgn.submission_status === 'submitted' ? 'submitted' : 'pending'}>
                    {asgn.submission_status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Career Readiness Score Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-brand-950 text-white rounded-2xl p-6 shadow-md border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold">Career Readiness</h3>
              </div>
              <span className="text-2xl font-black text-amber-400">{readiness.overall}%</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-brand-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${readiness.overall}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block">Skills</span>
                <span className="font-bold text-white">{readiness.breakdown.skills}%</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block">Projects</span>
                <span className="font-bold text-white">{readiness.breakdown.projects}%</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block">Resume</span>
                <span className="font-bold text-white">{readiness.breakdown.resume}%</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block">Academics</span>
                <span className="font-bold text-white">{readiness.breakdown.academics}%</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/student/career-assistant')}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Career Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Notices */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Notices</h3>
              <button
                onClick={() => navigate('/student/notices')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={n.priority === 'Urgent' ? 'critical' : n.priority === 'High' ? 'warning' : 'info'}>
                      {n.category}
                    </Badge>
                    <span className="text-[10px] text-slate-400">{n.publish_date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{n.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
