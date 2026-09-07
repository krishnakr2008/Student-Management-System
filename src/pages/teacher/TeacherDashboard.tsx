import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { StatCard } from '../../components/common/StatCard';
import { BookOpen, Users, CalendarCheck, FileText, Plus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Subject, Student, Assignment, TimetableSlot } from '../../types';
import { Clock, MapPin } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user, teacher } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  useEffect(() => {
    const loadTeacherData = async () => {
      const [subjData, stdData, asgnData, ttData] = await Promise.all([
        dbService.getSubjects(),
        dbService.getStudents(),
        dbService.getAssignments(),
        dbService.getTimetable(),
      ]);
      setSubjects(subjData);
      setStudents(stdData);
      setAssignments(asgnData);

      // Filter slots for logged in teacher
      const teacherSlots = ttData.filter(t => {
        if (teacher && t.teacher_id === teacher.id) return true;
        if (user && t.teacher_name && t.teacher_name.toLowerCase() === user.full_name.toLowerCase()) return true;
        return false;
      });

      setTimetable(teacherSlots.length > 0 ? teacherSlots : ttData);
    };
    loadTeacherData();
  }, [teacher, user]);

  return (
    <div className="space-y-6">
      {/* Teacher Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
            alt={user?.full_name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
          />
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-100 text-[11px] font-semibold mb-1">
              👩‍🏫 Faculty Member • {teacher?.department || 'Computer Science'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              Designation: <strong>{teacher?.designation || 'Associate Professor'}</strong> | Teacher ID: <strong>{teacher?.teacher_id_code}</strong>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Assigned Subjects" value={subjects.length} icon={BookOpen} color="brand" subtitle="Current Semester" />
        <StatCard title="Total Students" value={students.length} icon={Users} color="emerald" subtitle="Enrolled in Classes" />
        <StatCard title="Average Attendance" value="91.4%" icon={CalendarCheck} color="purple" subtitle="Class Overall" />
        <StatCard title="Active Assignments" value={assignments.length} icon={FileText} color="amber" subtitle="Pending Evaluations" />
      </div>

      {/* Today's Teaching Schedule Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Today's Teaching Schedule</h3>
            <p className="text-xs text-slate-500">Upcoming lectures, practicals and classroom allocations</p>
          </div>
          <button
            onClick={() => navigate('/teacher/timetable')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Full Timetable →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(timetable.filter(t => t.day === 'Monday' || t.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).slice(0, 3)).map(slot => (
            <div key={slot.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {slot.start_time} - {slot.end_time}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {slot.type}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{slot.subject_name}</h4>
                <p className="text-[11px] text-slate-500 font-semibold">{slot.course_name} Sem {slot.semester} ({slot.section})</p>
              </div>
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300">Room {slot.room}</span>
                <button
                  onClick={() => navigate('/teacher/attendance')}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Mark Attendance
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Subjects Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Assigned Subjects Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map(subj => (
            <div
              key={subj.id}
              className="p-5 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{subj.code}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                  {subj.credits} Credits
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{subj.name}</h4>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                <button
                  onClick={() => navigate('/teacher/attendance')}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Mark Attendance
                </button>
                <button
                  onClick={() => navigate('/teacher/marks')}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Enter Marks
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
