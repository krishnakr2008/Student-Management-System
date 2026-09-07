import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Subject, Student, MarkRecord } from '../../types';
import { Award, Save, Edit } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const TeacherMarks: React.FC = () => {
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [editingMark, setEditingMark] = useState<MarkRecord | null>(null);

  const [formData, setFormData] = useState({
    internal_marks: 0,
    mid_sem_marks: 0,
    assignment_marks: 0,
    practical_marks: 0,
    end_sem_marks: 0,
  });

  const loadData = async () => {
    const [subjData, stdData, marksData] = await Promise.all([
      dbService.getSubjects(),
      dbService.getStudents(),
      dbService.getStudentMarks('student-1'),
    ]);
    setSubjects(subjData);
    setStudents(stdData);
    setMarks(marksData);
    if (subjData.length > 0) setSelectedSubjectId(subjData[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (mark: MarkRecord) => {
    setEditingMark(mark);
    setFormData({
      internal_marks: mark.internal_marks,
      mid_sem_marks: mark.mid_sem_marks,
      assignment_marks: mark.assignment_marks,
      practical_marks: mark.practical_marks,
      end_sem_marks: mark.end_sem_marks,
    });
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMark) return;

    try {
      await dbService.updateMarkRecord(editingMark.id, formData);
      await loadData();
      setEditingMark(null);
      showToast('Marks Updated', 'Student marks and grade recalculated.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to update marks.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Marks & Results Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Input student marks across internal, mid-sem, assignment, practical, and end-sem assessments
        </p>
      </div>

      {/* Subject Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs max-w-md">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Subject</label>
        <select
          value={selectedSubjectId}
          onChange={e => setSelectedSubjectId(e.target.value)}
          className="w-full mt-1 px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
        >
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Marks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Student Gradebook</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-4 py-3.5">Internal (20)</th>
                <th className="px-4 py-3.5">Mid-Sem (30)</th>
                <th className="px-4 py-3.5">Asgn (10)</th>
                <th className="px-4 py-3.5">Practical (20)</th>
                <th className="px-4 py-3.5">End-Sem (50)</th>
                <th className="px-6 py-3.5">Total (100)</th>
                <th className="px-6 py-3.5">Grade</th>
                <th className="px-6 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {marks.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                    Alex Johnson (21CS001)
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.internal_marks}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.mid_sem_marks}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.assignment_marks}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.practical_marks}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.end_sem_marks}</td>
                  <td className="px-6 py-4 font-extrabold text-brand-600 dark:text-brand-400">{item.total_marks}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{item.grade}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-slate-800 dark:text-brand-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Marks</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Marks Modal */}
      {editingMark && (
        <Modal
          isOpen={!!editingMark}
          onClose={() => setEditingMark(null)}
          title={`Update Marks: Alex Johnson`}
          subtitle={`Subject: ${editingMark.subject_name}`}
        >
          <form onSubmit={handleSaveMarks} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Internal Marks (Max 20)</label>
                <input
                  type="number"
                  max={20}
                  value={formData.internal_marks}
                  onChange={e => setFormData({ ...formData, internal_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mid-Sem Marks (Max 30)</label>
                <input
                  type="number"
                  max={30}
                  value={formData.mid_sem_marks}
                  onChange={e => setFormData({ ...formData, mid_sem_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assignment Marks (Max 10)</label>
                <input
                  type="number"
                  max={10}
                  value={formData.assignment_marks}
                  onChange={e => setFormData({ ...formData, assignment_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Practical Marks (Max 20)</label>
                <input
                  type="number"
                  max={20}
                  value={formData.practical_marks}
                  onChange={e => setFormData({ ...formData, practical_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End-Sem Marks (Max 50)</label>
                <input
                  type="number"
                  max={50}
                  value={formData.end_sem_marks}
                  onChange={e => setFormData({ ...formData, end_sem_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingMark(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs"
              >
                Save & Recalculate Grade
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
