import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { Exam } from '../../types';
import { Badge } from '../../components/common/Badge';
import { CheckCircle, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

export const StudentExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    const fetchExams = async () => {
      const data = await dbService.getExams();
      setExams(data);
    };
    fetchExams();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Exams & Assessments
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Official examination schedules, datesheets, hall ticket info, and seating rooms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map(exam => (
          <div
            key={exam.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                {exam.subject_name}
              </span>
              <Badge variant={exam.exam_type === 'mid_sem' ? 'warning' : exam.exam_type === 'end_sem' ? 'critical' : 'info'}>
                {exam.exam_type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{exam.name}</h3>
              <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span>Date: <strong>{exam.exam_date}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Time: {exam.start_time} - {exam.end_time}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Room: <strong>{exam.room}</strong></span>
                </p>
              </div>
            </div>

            {exam.instructions && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
                <span className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" /> Instructions:
                </span>
                <p>{exam.instructions}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
