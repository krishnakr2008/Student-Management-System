import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Student, Subject, StudentSubject } from '../../types';
import { Modal } from '../../components/common/Modal';
import { UserPlus, Plus, BookOpen, Trash2 } from 'lucide-react';

export const AdminStudentAllocation: React.FC = () => {
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<StudentSubject[]>([]);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const loadData = async () => {
    const [stdData, subjData, ssData] = await Promise.all([
      dbService.getStudents(),
      dbService.getSubjects(),
      dbService.getStudentSubjects(),
    ]);
    setStudents(stdData);
    setSubjects(subjData);
    setEnrollments(ssData);
    if (stdData.length > 0) setSelectedStudentId(stdData[0].id);
    if (subjData.length > 0) setSelectedSubjectId(subjData[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSubjectId) return;

    try {
      await dbService.assignStudentSubject(selectedStudentId, selectedSubjectId);
      await loadData();
      setIsEnrollOpen(false);
      showToast('Student Enrolled', 'Enrolled student into subject successfully.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to enroll student.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Student-Subject Enrollment Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            HOD control panel for enrolling students into course subjects
          </p>
        </div>

        <button
          onClick={() => setIsEnrollOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll Student in Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {students.map(st => {
          const stEnrollments = enrollments.filter(e => e.student_id === st.id);
          return (
            <div
              key={st.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={st.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={st.profile?.full_name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/20"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{st.profile?.full_name}</h3>
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">{st.roll_number} • Sem {st.semester}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enrolled Subjects ({stEnrollments.length}):</span>
                {stEnrollments.length > 0 ? (
                  <div className="space-y-1">
                    {stEnrollments.map(enr => (
                      <div key={enr.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
                        <span>{enr.subject_name || 'Subject'} ({enr.subject_code})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-500 italic">No subjects enrolled.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isEnrollOpen && (
        <Modal
          isOpen={isEnrollOpen}
          onClose={() => setIsEnrollOpen(false)}
          title="Enroll Student in Subject"
          subtitle="Assign course subject to student roster"
        >
          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                {students.map(st => (
                  <option key={st.id} value={st.id}>{st.profile?.full_name} ({st.roll_number})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Subject</label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEnrollOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs"
              >
                Confirm Enrollment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
