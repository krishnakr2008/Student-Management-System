import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Course } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { BookOpen, Plus } from 'lucide-react';

export const AdminCourses: React.FC = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: 'Computer Science',
    description: '',
    duration_years: 4,
    total_semesters: 8,
  });

  const loadCourses = async () => {
    const data = await dbService.getCourses();
    setCourses(data);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;

    try {
      await dbService.createCourse({ ...formData, active: true });
      await loadCourses();
      setIsAddOpen(false);
      setFormData({
        code: '',
        name: '',
        department: 'Computer Science',
        description: '',
        duration_years: 4,
        total_semesters: 8,
      });
      showToast('Course Created', 'New degree program added to catalog.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to create course.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Course Catalog Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Degree programs, total semesters, department classifications, and enrollment
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(course => (
          <div
            key={course.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <Badge variant="safe">{course.code}</Badge>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{course.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{course.department}</p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{course.description}</p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Duration: {course.duration_years} Years ({course.total_semesters} Sems)</span>
              <span className="font-bold text-brand-600">{course.student_count || 100} Students</span>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Degree Course"
          subtitle="Provision new curriculum program"
        >
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Course Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="AIML-BTECH"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Course Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="B.Tech in Artificial Intelligence & Machine Learning"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
              />
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
                Create Course
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
