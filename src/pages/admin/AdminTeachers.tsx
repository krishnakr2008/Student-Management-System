import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Teacher } from '../../types';
import { Modal } from '../../components/common/Modal';
import { UserCheck, Plus, Search, Mail } from 'lucide-react';

export const AdminTeachers: React.FC = () => {
  const { showToast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
  });

  const loadTeachers = async () => {
    const data = await dbService.getTeachers();
    setTeachers(data);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      showToast('Error', 'Please fill in required fields.', 'error');
      return;
    }

    try {
      await dbService.createTeacher(
        {
          profile_id: '',
          teacher_id_code: `TCH-${Date.now().toString().substr(-4)}`,
          department: formData.department,
          designation: formData.designation,
        },
        {
          full_name: formData.full_name,
          email: formData.email,
          role: 'teacher',
        }
      );

      await loadTeachers();
      setIsAddOpen(false);
      setFormData({
        full_name: '',
        email: '',
        department: 'Computer Science',
        designation: 'Assistant Professor',
      });
      showToast('Teacher Added', 'Faculty record created successfully.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to add teacher.', 'error');
    }
  };

  const filtered = teachers.filter(t =>
    t.profile?.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.teacher_id_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Faculty Directory & Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Institutional teacher profiles, department designations, and subject assignments
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search faculty name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-brand-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(tch => (
          <div
            key={tch.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={tch.profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                alt={tch.profile?.full_name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{tch.profile?.full_name}</h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{tch.designation}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-500" />
                <span>{tch.profile?.email}</span>
              </p>
              <p className="text-[11px] text-slate-400">Department: {tch.department}</p>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Faculty Member"
          subtitle="Provision instructor account into Supabase"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Dr. Alan Turing"
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
                placeholder="alan.turing@university.edu"
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
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
                Save Faculty Member
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
