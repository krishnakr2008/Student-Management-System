import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Teacher, Subject, TeacherSubject } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Layers, Plus, Trash2, UserCheck, BookOpen } from 'lucide-react';

export const AdminTeacherAllocation: React.FC = () => {
  const { showToast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allocations, setAllocations] = useState<TeacherSubject[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const loadData = async () => {
    const [tchData, subjData, allocData] = await Promise.all([
      dbService.getTeachers(),
      dbService.getSubjects(),
      dbService.getTeacherSubjects(),
    ]);
    setTeachers(tchData);
    setSubjects(subjData);
    setAllocations(allocData);
    if (tchData.length > 0) setSelectedTeacherId(tchData[0].id);
    if (subjData.length > 0) setSelectedSubjectId(subjData[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedSubjectId) return;

    try {
      await dbService.assignTeacherSubject(selectedTeacherId, selectedSubjectId);
      await loadData();
      setIsAssignOpen(false);
      showToast('Subject Allocated', 'Assigned subject to teacher successfully.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to allocate subject.', 'error');
    }
  };

  const handleRemoveAllocation = async (teacherId: string, subjectId: string) => {
    try {
      await dbService.removeTeacherSubject(teacherId, subjectId);
      await loadData();
      showToast('Allocation Removed', 'Removed subject from teacher.', 'info');
    } catch (err) {
      showToast('Error', 'Failed to remove allocation.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Teacher-Subject Allocation Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            HOD control panel for assigning and restricting faculty subject domains
          </p>
        </div>

        <button
          onClick={() => setIsAssignOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate Subject to Teacher</span>
        </button>
      </div>

      {/* Allocation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teachers.map(tch => {
          const teacherAllocations = allocations.filter(a => a.teacher_id === tch.id);
          return (
            <div
              key={tch.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={tch.profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                  alt={tch.profile?.full_name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/20"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{tch.profile?.full_name}</h3>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">{tch.teacher_id_code} • {tch.department}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Assigned Subjects ({teacherAllocations.length}):</span>
                {teacherAllocations.length > 0 ? (
                  <div className="space-y-1.5">
                    {teacherAllocations.map(alloc => (
                      <div key={alloc.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{alloc.subject_name || 'Subject'}</span>
                          <span className="text-[10px] text-slate-400 block">{alloc.subject_code}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveAllocation(alloc.teacher_id, alloc.subject_id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Remove Subject Allocation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-500 italic">No subjects currently allocated.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Allocation Modal */}
      {isAssignOpen && (
        <Modal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          title="Allocate Subject to Faculty Member"
          subtitle="HOD subject domain restriction assignment"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Faculty Member</label>
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.profile?.full_name} ({t.teacher_id_code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Subject to Allocate</label>
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
                onClick={() => setIsAssignOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-xs"
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
