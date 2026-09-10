import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { User, BookOpen, Shield, Save, Upload, Edit, Check, Briefcase } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, student, teacher, role, refreshUserData } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Male',
    dob: user?.dob || '1995-05-14',
    address: user?.address || '42 University Heights, Campus Town',
    guardian_name: student?.guardian_name || 'Robert Johnson Sr.',
    guardian_phone: student?.guardian_phone || '+1 555-9081',
    guardian_relation: student?.guardian_relation || 'Father',
    department: teacher?.department || 'Computer Science',
    designation: teacher?.designation || 'Associate Professor',
    avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
        showToast('Image Uploaded', 'Profile picture updated successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await dbService.updateProfile(user.id, {
        full_name: formData.full_name,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address,
        avatar_url: formData.avatar_url,
      });

      if (student) {
        await dbService.updateStudent(student.id, {
          guardian_name: formData.guardian_name,
          guardian_phone: formData.guardian_phone,
          guardian_relation: formData.guardian_relation,
        });
      } else if (teacher) {
        await dbService.updateTeacher(teacher.id, {
          department: formData.department,
          designation: formData.designation,
        });
      }

      await refreshUserData();
      setIsEditing(false);
      showToast('Profile Saved', 'Profile details updated successfully.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to save profile changes.', 'error');
    }
  };

  if (!user) return <div className="p-8"><LoadingSkeleton count={1} type="profile" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <img
              src={formData.avatar_url}
              alt={formData.full_name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-500/20"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {user.full_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {role === 'admin' ? 'HOD / Admin' : role === 'teacher' ? 'Faculty Member' : 'Student'}
              </span>
            </div>

            {student && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {student.course_name} • Semester {student.semester} ({student.section})
              </p>
            )}

            {teacher && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {teacher.designation} • Dept of {teacher.department}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              {student && (
                <>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30">
                    ID: {student.student_id_code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    Roll: {student.roll_number}
                  </span>
                </>
              )}

              {teacher && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Teacher Code: {teacher.teacher_id_code}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 ${
            isEditing
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              : 'bg-brand-600 hover:bg-brand-500 text-white'
          }`}
        >
          {isEditing ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Personal Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date of Birth</label>
              <input
                type="date"
                disabled={!isEditing}
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Residential Address</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Academic Details for Student */}
        {student && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Academic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{student.department}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block font-medium">Branch</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{student.branch}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block font-medium">Admission Year</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{student.admission_year}</span>
              </div>
            </div>
          </div>
        )}

        {/* Professional Details for Teacher */}
        {teacher && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Faculty & Professional Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Department</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Designation</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Guardian Information for Student */}
        {student && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Guardian Contact</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Guardian Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.guardian_name}
                  onChange={e => setFormData({ ...formData, guardian_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Guardian Phone</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.guardian_phone}
                  onChange={e => setFormData({ ...formData, guardian_phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Relationship</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.guardian_relation}
                  onChange={e => setFormData({ ...formData, guardian_relation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75 focus:outline-hidden focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
