import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { MarkRecord, SubjectAttendanceSummary } from '../../types';
import { BarChart3, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const StudentAnalytics: React.FC = () => {
  const { student } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [attendance, setAttendance] = useState<SubjectAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      const studentId = student?.id || 'std-1';
      const [marksData, attData] = await Promise.all([
        dbService.getStudentMarks(studentId),
        dbService.getStudentAttendanceSummary(studentId),
      ]);
      setMarks(marksData);
      setAttendance(attData);
      setLoading(false);
    };
    fetchAnalyticsData();
  }, [student]);

  const radarData = marks.length > 0
    ? marks.map(m => ({
        subject: m.subject_code,
        Score: m.total_marks,
        fullMark: 100,
      }))
    : [
        { subject: 'CS501', Score: 92, fullMark: 100 },
        { subject: 'CS502', Score: 88, fullMark: 100 },
        { subject: 'CS503', Score: 95, fullMark: 100 },
        { subject: 'CS504', Score: 84, fullMark: 100 },
        { subject: 'CS505', Score: 90, fullMark: 100 },
      ];

  const strongSubjects = marks.filter(m => m.total_marks >= 90);
  const weakSubjects = marks.filter(m => m.total_marks < 85);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Visual insights, radar proficiency mapping, strong subject identification, and focus areas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Proficiency Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            <span>Academic Skill Proficiency Radar</span>
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#475569" strokeDasharray="3 3" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <Radar name="Total Score" dataKey="Score" stroke="#0c8de9" fill="#0c8de9" fillOpacity={0.4} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SGPA & CGPA Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span>Cumulative Grade Point Progression</span>
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { semester: 'Sem 1', SGPA: 8.5, CGPA: 8.5 },
                  { semester: 'Sem 2', SGPA: 8.7, CGPA: 8.6 },
                  { semester: 'Sem 3', SGPA: 8.9, CGPA: 8.7 },
                  { semester: 'Sem 4', SGPA: 9.1, CGPA: 8.8 },
                  { semester: 'Sem 5', SGPA: 9.3, CGPA: 8.95 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[7, 10]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="SGPA" stroke="#0c8de9" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="CGPA" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>Strong Subjects</span>
          </div>
          <ul className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1 pt-1 font-medium">
            {strongSubjects.map(s => (
              <li key={s.id}>• {s.subject_name} ({s.total_marks}/100)</li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Areas for Improvement</span>
          </div>
          <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-1 pt-1 font-medium">
            {weakSubjects.length > 0 ? (
              weakSubjects.map(w => <li key={w.id}>• {w.subject_name} ({w.total_marks}/100)</li>)
            ) : (
              <li>• All subjects above 85% benchmark!</li>
            )}
          </ul>
        </div>

        <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-sm">
            <BarChart3 className="w-5 h-5" />
            <span>Target Recommendations</span>
          </div>
          <p className="text-xs text-brand-900 dark:text-brand-200 leading-relaxed font-medium pt-1">
            Focus on practical lab submissions and end-sem theoretical proofs in DBMS to cross the 9.5 SGPA threshold.
          </p>
        </div>
      </div>
    </div>
  );
};
