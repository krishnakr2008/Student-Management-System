import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { Subject } from '../../types';
import { BookOpen, Search, UserCheck, Award } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const StudentAcademics: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSem, setSelectedSem] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      const data = await dbService.getSubjects();
      setSubjects(data);
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(s => {
    const matchesSem = selectedSem === 0 || s.semester === selectedSem;
    const matchesQuery =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.teacher_name && s.teacher_name.toLowerCase().includes(search.toLowerCase()));
    return matchesSem && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Subjects
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enrolled curriculum subjects, course credits, and assigned faculty
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSem}
            onChange={e => setSelectedSem(Number(e.target.value))}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value={0}>All Semesters</option>
            <option value={5}>Semester 5 (Current)</option>
            <option value={4}>Semester 4</option>
            <option value={3}>Semester 3</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search subject name, code, or teacher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-brand-500"
        />
      </div>

      {loading ? (
        <LoadingSkeleton count={3} type="table" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map(subj => (
            <div
              key={subj.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-brand-500/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {subj.code}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{subj.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Semester {subj.semester}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <UserCheck className="w-4 h-4 text-brand-500" />
                  <span className="font-semibold">{subj.teacher_name || 'Faculty Assigned'}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>{subj.credits} Credits</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
