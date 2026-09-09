import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { Student } from '../../types';
import { Users, Search, Mail, Phone, ShieldAlert } from 'lucide-react';

export const TeacherStudents: React.FC = () => {
  const { teacher } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!teacher?.id) return;
      setLoading(true);
      const data = await dbService.getTeacherAssignedStudents(teacher.id);
      setStudents(data);
      setLoading(false);
    };
    fetchStudents();
  }, [teacher?.id]);

  const filtered = students.filter(s =>
    (s.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.student_id_code || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-500">
        Loading assigned student directory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              My Assigned Students Roster
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md">
              Faculty Access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student roster enrolled in your assigned subjects
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search student name, roll number, or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          No students found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(st => (
            <div
              key={st.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={st.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={st.profile?.full_name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{st.profile?.full_name}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{st.course_name} • Semester {st.semester}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{st.profile?.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{st.profile?.phone || 'No Phone'}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
