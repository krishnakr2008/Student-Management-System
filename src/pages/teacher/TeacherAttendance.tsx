import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Subject, Student, AttendanceRecord } from '../../types';
import { CalendarCheck, Save, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const { teacher } = useAuth();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceStates, setAttendanceStates] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSubjectsAndStudents = async () => {
      if (!teacher?.id) return;
      setLoading(true);

      const assignedSubjects = await dbService.getTeacherAssignedSubjects(teacher.id);
      setSubjects(assignedSubjects);

      if (assignedSubjects.length > 0) {
        const initialSubjectId = assignedSubjects[0].id;
        setSelectedSubjectId(initialSubjectId);

        const assignedStudents = await dbService.getTeacherAssignedStudents(teacher.id);
        setStudents(assignedStudents);

        // Fetch existing attendance records for initial load
        const allAttendance = await dbService.getTeacherAttendance(teacher.id);
        const dateRecords = allAttendance.filter(
          a => a.subject_id === initialSubjectId && a.date === selectedDate
        );

        const statesMap: Record<string, 'present' | 'absent' | 'late'> = {};
        assignedStudents.forEach(st => {
          const rec = dateRecords.find(r => r.student_id === st.id);
          statesMap[st.id] = rec ? rec.status : 'present';
        });
        setAttendanceStates(statesMap);
      } else {
        setStudents([]);
      }

      setLoading(false);
    };

    loadSubjectsAndStudents();
  }, [teacher?.id]);

  useEffect(() => {
    const refreshAttendanceForDateAndSubject = async () => {
      if (!teacher?.id || !selectedSubjectId) return;

      const allAttendance = await dbService.getTeacherAttendance(teacher.id);
      const dateRecords = allAttendance.filter(
        a => a.subject_id === selectedSubjectId && a.date === selectedDate
      );

      const statesMap: Record<string, 'present' | 'absent' | 'late'> = {};
      students.forEach(st => {
        const rec = dateRecords.find(r => r.student_id === st.id);
        statesMap[st.id] = rec ? rec.status : 'present';
      });
      setAttendanceStates(statesMap);
    };

    refreshAttendanceForDateAndSubject();
  }, [selectedSubjectId, selectedDate]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceStates(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubjectId || !selectedDate) {
      showToast('Error', 'Please select a valid subject and date.', 'error');
      return;
    }

    if (students.length === 0) {
      showToast('Warning', 'No students enrolled in this subject.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSubjObj = subjects.find(s => s.id === selectedSubjectId);

      const recordsToMark: Array<Omit<AttendanceRecord, 'id'>> = students.map(st => ({
        student_id: st.id,
        subject_id: selectedSubjectId,
        subject_name: selectedSubjObj?.name || 'Subject',
        subject_code: selectedSubjObj?.code || 'SUBJ',
        date: selectedDate,
        status: attendanceStates[st.id] || 'present',
        marked_by: teacher?.id,
        teacher_id: teacher?.id,
      }));

      await dbService.markAttendanceBatch(recordsToMark);
      showToast(
        'Attendance Recorded',
        `Successfully marked attendance for ${students.length} students in ${selectedSubjObj?.name}.`,
        'success'
      );
    } catch (err) {
      showToast('Error', 'Failed to record attendance.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-500">
        Loading assigned subjects and student roster...
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">No Subjects Assigned</h3>
        <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
          You are currently not assigned to teach any subject by the HOD/Admin. Please contact the Head of Department to complete your teaching allocation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Class Attendance Marker
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md">
              Faculty Access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Restricted strictly to your assigned subject roster ({subjects.map(s => s.code).join(', ')})
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={isSubmitting || students.length === 0}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Submit Attendance Batch'}</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned Subject</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code}) - Sem {s.semester}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class Session Date</label>
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
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Enrolled Student Roll Call</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Enrolled Students: {students.length}
          </span>
        </div>

        {students.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No students are currently enrolled in this assigned subject.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Student Info</th>
                  <th className="px-6 py-3.5">Roll Number</th>
                  <th className="px-6 py-3.5">Course / Section</th>
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
                            src={
                              st.profile?.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={st.profile?.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span>{st.profile?.full_name || 'Student'}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {st.student_id_code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {st.roll_number}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {st.course_name} ({st.section})
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
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
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
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
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
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
        )}
      </div>
    </div>
  );
};
