import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { MarkRecord } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Award, TrendingUp, BookOpen } from 'lucide-react';

export const StudentMarks: React.FC = () => {
  const { student } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      setLoading(true);
      const studentId = student?.id || 'std-1';
      const data = await dbService.getStudentMarks(studentId);
      setMarks(data);
      setLoading(false);
    };
    fetchMarks();
  }, [student]);

  const currentSGPA = marks.length > 0 ? marks[0].sgpa : 9.1;
  const currentCGPA = marks.length > 0 ? marks[0].cgpa : 8.95;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Marks & Semester Results
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detailed mark sheet breakdown across internals, mid-sem, assignments, practicals, and end-sem exams
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Semester 5 SGPA" value={currentSGPA} icon={Award} color="brand" subtitle="Grade Point Average" />
        <StatCard title="Cumulative CGPA" value={currentCGPA} icon={TrendingUp} color="purple" subtitle="Overall Academic Average" />
        <StatCard title="Total Subjects Graded" value={marks.length} icon={BookOpen} color="emerald" subtitle="Semester 5" />
      </div>

      {/* Detailed Marks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Semester 5 Examination Marksheet</h3>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30">
            Published
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Internal (20)</th>
                <th className="px-4 py-3.5">Mid-Sem (30)</th>
                <th className="px-4 py-3.5">Asgn (10)</th>
                <th className="px-4 py-3.5">Practical (20)</th>
                <th className="px-4 py-3.5">End-Sem (50)</th>
                <th className="px-6 py-3.5">Total (100)</th>
                <th className="px-6 py-3.5">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {marks.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                    <div>
                      <span>{item.subject_name}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">{item.subject_code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-semibold">{item.internal_marks}</td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-semibold">{item.mid_sem_marks}</td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-semibold">{item.assignment_marks}</td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-semibold">{item.practical_marks}</td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-semibold">{item.end_sem_marks}</td>
                  <td className="px-6 py-4 font-extrabold text-brand-600 dark:text-brand-400">{item.total_marks}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.grade === 'O' || item.grade === 'A+' ? 'safe' : 'info'}>
                      Grade {item.grade}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
