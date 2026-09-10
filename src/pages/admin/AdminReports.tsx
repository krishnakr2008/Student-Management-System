import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Student, MarkRecord, Certificate } from '../../types';
import { Download, Printer, FileText, BarChart3, ShieldCheck } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [stdData, marksData, certData] = await Promise.all([
          dbService.getStudents(),
          dbService.getAllMarks(),
          dbService.getCertificates(),
        ]);
        setStudents(stdData);
        setMarks(marksData);
        setCertificates(certData);
      } catch (e) {
        console.warn('Error loading report data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Roll Number', 'Full Name', 'Department', 'Branch', 'Semester', 'Section'];
    const rows = students.map(s => [
      s.student_id_code,
      s.roll_number,
      `"${s.profile?.full_name || 'Student'}"`,
      s.department,
      s.branch,
      s.semester,
      s.section,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'University_Student_Report_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Downloaded', 'Exported student directory report to CSV.', 'success');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Reports & Export Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate institutional audit reports, print grade rosters, and download CSV data
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Reports Summary Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Institutional Student Roster & Academic Summary</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">
            Loading institutional report data...
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No student records found for academic reporting.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">ID Code</th>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Semester</th>
                  <th className="px-6 py-3.5">Academic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {students.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                      {st.profile?.full_name || 'Student'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{st.student_id_code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{st.roll_number}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{st.department}</td>
                    <td className="px-6 py-4 font-bold text-brand-600 dark:text-brand-400">Sem {st.semester}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">Active / Good Standing</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
