import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Subject, Student, AttendanceRecord } from '../../types';
import { CalendarCheck, Save, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const { teacher } = useAuth();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceStates, setAttendanceStates] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const [subjData, stdData] = await Promise.all([
        dbService.getSubjects(),
        dbService.getStudents(),
      ]);
      setSubjects(subjData);
      setStudents(stdData);
      if (subjData.length > 0) setSelectedSubjectId(subjData[0].id);

      // Default all students to present
      const initial: Record<string, 'present' | 'absent' | 'late'> = {};
      stdData.forEach(s => {
        initial[s.id] = 'present';
      });
      setAttendanceStates(initial);
    };
    initData();
  }, []);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceStates(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubjectId || !selectedDate) {
      showToast('Error', 'Please select a subject and date.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const recordsToMark: Array<Omit<AttendanceRecord, 'id'>> = students.map(st => ({
        student_id: st.id,
        subject_id: selectedSubjectId,
        date: selectedDate,
        status: attendanceStates[st.id] || 'present',
        marked_by: teacher?.id,
      }));

      await dbService.markAttendanceBatch(recordsToMark);
      showToast('Attendance Saved', `Marked attendance for ${students.length} students on ${selectedDate}.`, 'success');
    } catch (err) {
      showToast('Error', 'Failed to record attendance.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Batch Attendance Marker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Record official daily class attendance with automated duplicate prevention
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Submit Attendance Batch'}</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Subject</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Attendance Marking Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Student Roll Call</h3>
          <span className="text-xs font-semibold text-slate-500">
            Total Students: {students.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student Info</th>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Section</th>
                <th className="px-6 py-3.5 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {students.map(st => {
                const status = attendanceStates[st.id] || 'present';
                return (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={st.profile?.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span>{st.profile?.full_name || 'Student'}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{st.student_id_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{st.roll_number}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{st.section}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            status === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            status === 'late'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
