import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { SubjectAttendanceSummary, AttendanceRecord } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { CalendarCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const StudentAttendance: React.FC = () => {
  const { student } = useAuth();
  const [summary, setSummary] = useState<SubjectAttendanceSummary[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      const studentId = student?.id || 'std-1';
      const [sumData, histData] = await Promise.all([
        dbService.getStudentAttendanceSummary(studentId),
        dbService.getStudentAttendance(studentId),
      ]);
      setSummary(sumData);
      setHistory(histData);
      setLoading(false);
    };
    fetchAttendance();
  }, [student]);

  const totalClasses = summary.reduce((acc, curr) => acc + curr.total_classes, 0);
  const totalPresent = summary.reduce((acc, curr) => acc + curr.present_classes, 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 92;

  const chartData = summary.map(s => ({
    subject: s.subject_code,
    Percentage: s.percentage,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Attendance Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Official attendance percentage computed as: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-600 font-mono">Attendance % = (Present / Total) × 100</code>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          icon={CalendarCheck}
          color={overallPercentage >= 85 ? 'emerald' : overallPercentage >= 75 ? 'amber' : 'rose'}
          subtitle={overallPercentage >= 85 ? 'Safe Standing (≥85%)' : 'Attendance Warning (<85%)'}
        />
        <StatCard
          title="Total Classes Attended"
          value={`${totalPresent} / ${totalClasses}`}
          icon={CheckCircle}
          color="brand"
          subtitle="Cumulative Lectures & Labs"
        />
        <StatCard
          title="Attendance Status"
          value={overallPercentage >= 85 ? 'Safe' : overallPercentage >= 75 ? 'Warning' : 'Critical'}
          icon={AlertTriangle}
          color={overallPercentage >= 85 ? 'emerald' : overallPercentage >= 75 ? 'amber' : 'rose'}
          subtitle={overallPercentage < 75 ? 'Debris from 75% Criteria' : 'Eligible for Examinations'}
        />
      </div>

      {/* Recharts Attendance Visualization */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Subject-wise Percentage Comparison</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="Percentage" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject-Wise Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Subject-wise Attendance Summary</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Total Classes</th>
                <th className="px-6 py-3.5">Present</th>
                <th className="px-6 py-3.5">Absent</th>
                <th className="px-6 py-3.5">Percentage</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {summary.map(item => (
                <tr key={item.subject_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                    <div>
                      <span>{item.subject_name}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">{item.subject_code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.total_classes}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">{item.present_classes}</td>
                  <td className="px-6 py-4 font-semibold text-rose-600 dark:text-rose-400">
                    {item.total_classes - item.present_classes}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-slate-100">{item.percentage}%</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status}>{item.status.toUpperCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Period-Wise Attendance Schedule (Monday - Saturday, Periods 1 - 8) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <span>Weekly Class Attendance Schedule (Periods 1 – 8)</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            Mon – Sat • 8 Periods/Day
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                <th className="p-3 border-r border-slate-200/60 dark:border-slate-800">Day</th>
                <th className="p-2 text-center">P1 (09:00)</th>
                <th className="p-2 text-center">P2 (10:00)</th>
                <th className="p-2 text-center">P3 (11:00)</th>
                <th className="p-2 text-center">P4 (12:00)</th>
                <th className="p-2 text-center">P5 (01:30)</th>
                <th className="p-2 text-center">P6 (02:30)</th>
                <th className="p-2 text-center">P7 (03:30)</th>
                <th className="p-2 text-center">P8 (04:30)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
              {[
                { day: 'Monday', schedule: ['DBMS (P)', 'OOP (P)', 'Math (A)', 'Self Study', 'DBMS (P)', 'OOP (P)', 'Self Study', 'CN (P)'] },
                { day: 'Tuesday', schedule: ['DSA (P)', 'OS (P)', 'DBMS (P)', 'Self Study', 'OOP (P)', 'CN (P)', 'Lab (P)', 'Self Study'] },
                { day: 'Wednesday', schedule: ['Math (P)', 'DBMS (P)', 'DSA (P)', 'Self Study', 'OS (P)', 'OOP (P)', 'Self Study', 'Lab (P)'] },
                { day: 'Thursday', schedule: ['OOP (P)', 'CN (P)', 'OS (P)', 'Self Study', 'Math (P)', 'DBMS (P)', 'Lab (P)', 'Self Study'] },
                { day: 'Friday', schedule: ['DBMS (P)', 'DSA (P)', 'Math (P)', 'Self Study', 'CN (P)', 'OS (P)', 'Self Study', 'Lab (P)'] },
                { day: 'Saturday', schedule: ['Lab (P)', 'Lab (P)', 'Self Study', 'Self Study', 'Seminar (P)', 'Seminar (P)', 'Free', 'Free'] },
              ].map(row => (
                <tr key={row.day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200/60 dark:border-slate-800">
                    {row.day}
                  </td>
                  {row.schedule.map((slot, idx) => {
                    const isPresent = slot.includes('(P)');
                    const isAbsent = slot.includes('(A)');
                    return (
                      <td key={idx} className="p-2 text-center">
                        <span
                          className={`inline-block w-full py-1 px-1 rounded-md text-[10px] font-bold ${
                            isPresent
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : isAbsent
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {slot}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-500" />
          <span>Recent Attendance Logs</span>
        </h3>

        <div className="space-y-2">
          {history.slice(0, 5).map(record => (
            <div
              key={record.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{record.subject_name}</h4>
                <p className="text-[10px] text-slate-400">{record.date}</p>
              </div>
              <Badge variant={record.status === 'present' ? 'safe' : record.status === 'late' ? 'warning' : 'critical'}>
                {record.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
