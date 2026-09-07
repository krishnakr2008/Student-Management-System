import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Subject, Teacher, Course } from '../../types';
import { Modal } from '../../components/common/Modal';
import { BookOpen, Plus, UserCheck } from 'lucide-react';

export const AdminSubjects: React.FC = () => {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 4,
    course_id: '',
    semester: 5,
    teacher_id: '',
  });

  const loadData = async () => {
    const [subjData, tchData, crsData] = await Promise.all([
      dbService.getSubjects(),
      dbService.getTeachers(),
      dbService.getCourses(),
    ]);
    setSubjects(subjData);
    setTeachers(tchData);
    setCourses(crsData);
    if (crsData.length > 0) setFormData(prev => ({ ...prev, course_id: crsData[0].id }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;

    const assignedTeacher = teachers.find(t => t.id === formData.teacher_id);

    try {
      await dbService.createSubject({
        code: formData.code,
        name: formData.name,
        credits: formData.credits,
        course_id: formData.course_id,
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
      showToast('Subject Created', 'New subject catalog item added.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to create subject.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Subject Catalog & Faculty Allocation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Subject creation, credit weighting, semester alignment, and teacher assignment
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map(subj => (
          <div
            key={subj.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{subj.code}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/30">
                {subj.credits} Credits
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{subj.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Semester {subj.semester}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Assigned: <strong>{subj.teacher_name || 'Faculty Member'}</strong></span>
            </div>
          </div>
        ))}
      </div>

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
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs"
              >
                Save Subject
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
