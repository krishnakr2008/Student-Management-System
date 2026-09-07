import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Subject, Student, MarkRecord } from '../../types';
import { Award, Edit, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminMarks: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [editingMark, setEditingMark] = useState<MarkRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    internal_marks: 0,
    mid_sem_marks: 0,
    assignment_marks: 0,
    practical_marks: 0,
    end_sem_marks: 0,
  });

  const loadAdminMarksData = async () => {
    setLoading(true);
    const [subjData, stdData, marksData] = await Promise.all([
      dbService.getSubjects(),
      dbService.getStudents(),
      dbService.getAllMarks(),
    ]);

    setSubjects(subjData);
    setStudents(stdData);
    setMarks(marksData);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminMarksData();
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

  const handleSaveAdminMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMark) return;

    try {
      await dbService.updateMarkRecord(editingMark.id, formData, user?.id || 'admin-user');
      await loadAdminMarksData();
      setEditingMark(null);
      showToast('HOD Marks Override Saved', 'Student grade and marks updated with administrative authority.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to update student marks.', 'error');
    }
  };

  const filteredMarks = marks.filter(m => {
    if (selectedSubjectId !== 'all' && m.subject_id !== selectedSubjectId) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-500">
        Loading institutional gradebook database...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              HOD Gradebook & Marks Control
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-md">
              HOD / Admin Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete institutional view of all student marks across departments with administrative override powers
          </p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs max-w-md">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter by Subject</label>
        <select
          value={selectedSubjectId}
          onChange={e => setSelectedSubjectId(e.target.value)}
          className="w-full mt-1 px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
        >
          <option value="all">All Subjects across University</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Institutional Gradebook Roster</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Grade Records: {filteredMarks.length}
          </span>
        </div>

        {filteredMarks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No mark records match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-4 py-3.5">Internal (20)</th>
                  <th className="px-4 py-3.5">Mid-Sem (30)</th>
                  <th className="px-4 py-3.5">Asgn (10)</th>
                  <th className="px-4 py-3.5">Practical (20)</th>
                  <th className="px-4 py-3.5">End-Sem (50)</th>
                  <th className="px-6 py-3.5">Total (100)</th>
                  <th className="px-6 py-3.5">Grade</th>
                  <th className="px-6 py-3.5">Audit Info</th>
                  <th className="px-6 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredMarks.map(item => {
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
                      <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.internal_marks}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.mid_sem_marks}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.assignment_marks}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.practical_marks}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.end_sem_marks}</td>
                      <td className="px-6 py-4 font-extrabold text-purple-600 dark:text-purple-400">{item.total_marks}</td>
                      <td className="px-6 py-4 font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-extrabold">
                          {item.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-slate-400">
                        {item.updated_by ? (
                          <span className="text-purple-600 dark:text-purple-400 font-bold">HOD Overridden</span>
                        ) : (
                          <span>Standard</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-slate-800 dark:text-purple-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>HOD Override</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Marks Modal */}
      {editingMark && (
        <Modal
          isOpen={!!editingMark}
          onClose={() => setEditingMark(null)}
          title="HOD Marks Administrative Override"
          subtitle={`Subject: ${editingMark.subject_name}`}
        >
          <form onSubmit={handleSaveAdminMarks} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Internal Marks (Max 20)</label>
                <input
                  type="number"
                  max={20}
                  min={0}
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
                  min={0}
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
                  min={0}
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
                  min={0}
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
                  min={0}
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
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-xs"
              >
                Apply HOD Marks Override
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
