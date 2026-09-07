import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Subject, Teacher, Course } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Plus, UserCheck, Trash2 } from 'lucide-react';

export const AdminSubjects: React.FC = () => {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 4,
    course_id: '',
    semester: 5,
    teacher_id: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjData, tchData, crsData] = await Promise.all([
        dbService.getSubjects(),
        dbService.getTeachers(),
        dbService.getCourses(),
      ]);
      setSubjects(subjData);
      setTeachers(tchData);
      setCourses(crsData);
      if (crsData.length > 0 && !formData.course_id) {
        setFormData(prev => ({ ...prev, course_id: crsData[0].id }));
      }
    } catch (err: any) {
      showToast('Error Loading Subjects', err.message || 'Failed to fetch subjects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      showToast('Validation Error', 'Subject code and name are required.', 'error');
      return;
    }

    const assignedTeacher = teachers.find(t => t.id === formData.teacher_id);

    setIsSubmitting(true);
    try {
      await dbService.createSubject({
        code: formData.code,
        name: formData.name,
        credits: formData.credits,
        course_id: formData.course_id || courses[0]?.id || '',
        semester: formData.semester,
        teacher_id: formData.teacher_id,
        teacher_name: assignedTeacher?.profile?.full_name || 'Faculty Member',
      });

      await loadData();
      setIsAddOpen(false);
      setFormData({
        code: '',
        name: '',
        credits: 4,
        course_id: courses[0]?.id || '',
        semester: 5,
        teacher_id: '',
      });
      showToast('Subject Created', `Successfully created ${formData.name} (${formData.code}).`, 'success');
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to create subject.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await dbService.deleteSubject(deletingId);
      await loadData();
      setDeletingId(null);
      showToast('Subject Deactivated', 'Subject marked inactive in database.', 'success');
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to deactivate subject.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Subject Catalog & Faculty Allocation
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-md">
              HOD / Admin Access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Subject creation, credit weighting, semester alignment, and teacher assignment
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading subjects database...
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          No active subjects found in catalog.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map(subj => (
            <div
              key={subj.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{subj.code}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/30">
                    {subj.credits} Credits
                  </span>
                  <button
                    onClick={() => setDeletingId(subj.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Deactivate Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{subj.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Semester {subj.semester}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>Assigned: <strong>{subj.teacher_name || 'Faculty Member'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Subject & Assign Instructor"
          subtitle="Define subject code, credits, and faculty"
        >
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CS506"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Credits</label>
                <input
                  type="number"
                  value={formData.credits}
                  onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Cloud Computing & Microservices"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Semester</label>
                <input
                  type="number"
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign Teacher</label>
                <select
                  value={formData.teacher_id}
                  onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="">Select Instructor</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.profile?.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Inserting...' : 'Save Subject'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Subject"
        message="Are you sure you want to deactivate this subject? It will be hidden from active list while preserving existing historical records."
        confirmText="Deactivate Subject"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
