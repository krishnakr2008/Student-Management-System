import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Student } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Users, Plus, Search, Edit, Trash2, Mail, Phone, BookOpen } from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: 'Computer Science',
    branch: 'CSE',
    semester: 1,
    section: 'A',
    roll_number: '',
  });

  const loadStudents = async () => {
    const data = await dbService.getStudents();
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.roll_number) {
      showToast('Error', 'Please fill in required fields.', 'error');
      return;
    }

    try {
      await dbService.createStudent(
        {
          profile_id: '',
          student_id_code: `STD-${Date.now().toString().substr(-4)}`,
          department: formData.department,
          branch: formData.branch,
          semester: formData.semester,
          section: formData.section,
          roll_number: formData.roll_number,
          admission_year: 2026,
        },
        {
          full_name: formData.full_name,
          email: formData.email,
          role: 'student',
        }
      );

      await loadStudents();
      setIsAddOpen(false);
      setFormData({
        full_name: '',
        email: '',
        department: 'Computer Science',
        branch: 'CSE',
        semester: 1,
        section: 'A',
        roll_number: '',
      });
      showToast('Student Created', 'New student profile created in database.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to create student.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await dbService.deleteStudent(deletingId);
      await loadStudents();
      setDeletingId(null);
      showToast('Student Deleted', 'Student record removed from database.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to delete student.', 'error');
    }
  };

  const filtered = students.filter(s =>
    s.profile?.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Student Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real CRUD operations, student profile creation, department & semester filters
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search student name, roll number, or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-brand-500"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Enrolled Student Records</h3>
          <span className="text-xs font-semibold text-slate-500">Total: {students.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-6 py-3.5">Course / Dept</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map(st => (
                <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={st.profile?.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span>{st.profile?.full_name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{st.profile?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{st.student_id_code}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{st.roll_number}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{st.department}</td>
                  <td className="px-6 py-4 font-bold text-brand-600 dark:text-brand-400">Sem {st.semester} ({st.section})</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeletingId(st.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Deactivate Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create New Student Profile"
          subtitle="Provision new student credentials into Supabase"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Rohan Sharma"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="rohan@university.edu"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Roll Number</label>
                <input
                  type="text"
                  required
                  value={formData.roll_number}
                  onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
                  placeholder="23CS045"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
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
                Create Student
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message="Are you sure you want to delete this student profile? This will remove all associated marks and attendance."
        confirmText="Yes, Delete"
      />
    </div>
  );
};
