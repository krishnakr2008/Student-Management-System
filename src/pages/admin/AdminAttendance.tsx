import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Subject, Student, AttendanceRecord, Teacher } from '../../types';
import { CalendarCheck, ShieldCheck, CheckCircle2, XCircle, Clock, Filter, ShieldAlert } from 'lucide-react';

export const AdminAttendance: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadAdminAttendanceData = async () => {
    setLoading(true);
    const [subjData, stdData, tchData, attData] = await Promise.all([
      dbService.getSubjects(),
      dbService.getStudents(),
      dbService.getTeachers(),
      dbService.getAllAttendance(),
    ]);

    setSubjects(subjData);
    setStudents(stdData);
    setTeachers(tchData);
    setAttendance(attData);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminAttendanceData();
  }, []);

  const handleAdminOverride = async (recordId: string, newStatus: 'present' | 'absent' | 'late') => {
    try {
      const success = await dbService.adminOverrideAttendance(recordId, newStatus, user?.id || 'admin-user');
      if (success) {
        showToast('Attendance Overridden', `HOD authority override applied (${newStatus.toUpperCase()}).`, 'success');
        await loadAdminAttendanceData();
      } else {
        showToast('Error', 'Attendance record not found.', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to apply admin override.', 'error');
    }
  };

  const filteredAttendance = attendance.filter(item => {
    if (selectedSubjectId !== 'all' && item.subject_id !== selectedSubjectId) return false;
    if (selectedDate && item.date !== selectedDate) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-500">
        Loading institutional attendance database...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              HOD Attendance Control & Administrative Override
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-md">
              HOD / Admin Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete institutional overview of daily class logs with HOD override capabilities
          </p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter by Subject</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Subjects across University</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter by Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Attendance Audit Logs</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Records: {filteredAttendance.length}
          </span>
        </div>

        {filteredAttendance.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No attendance records match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-center">Current Status</th>
                  <th className="px-6 py-3.5">Marked / Updated By</th>
                  <th className="px-6 py-3.5 text-center">HOD Override Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredAttendance.map(item => {
                  const student = students.find(s => s.id === item.student_id);
                  const studentName = student?.profile?.full_name || 'Student';
                  const studentRoll = student?.roll_number || item.student_id;
                  const subjectName = item.subject_name || subjects.find(s => s.id === item.subject_id)?.name || 'Subject';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                        <div>
                          <span>{studentName}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{studentRoll}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {subjectName}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{item.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          item.status === 'present'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : item.status === 'absent'
                            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-slate-500">
                        {item.updated_by ? (
                          <span className="text-purple-600 dark:text-purple-400 font-bold">HOD Overridden</span>
                        ) : item.marked_by ? (
                          <span>Faculty ({item.marked_by})</span>
                        ) : (
                          <span>System</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdminOverride(item.id, 'present')}
                            disabled={item.status === 'present'}
                            className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 text-[11px] font-bold disabled:opacity-30 transition-colors"
                          >
                            Set Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminOverride(item.id, 'absent')}
                            disabled={item.status === 'absent'}
                            className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 text-[11px] font-bold disabled:opacity-30 transition-colors"
                          >
                            Set Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminOverride(item.id, 'late')}
                            disabled={item.status === 'late'}
                            className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-300 text-[11px] font-bold disabled:opacity-30 transition-colors"
                          >
                            Set Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
