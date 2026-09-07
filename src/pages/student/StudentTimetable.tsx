import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { TimetableSlot } from '../../types';
import { Clock, MapPin, UserCheck } from 'lucide-react';

export const StudentTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchTimetable = async () => {
      const data = await dbService.getTimetable();
      setTimetable(data);
    };
    fetchTimetable();
  }, []);

  const daySlots = timetable.filter(t => t.day === selectedDay);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Class Timetable
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Weekly lecture and laboratory schedules with room allocation and faculty info
        </p>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedDay === day
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Slots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {daySlots.length > 0 ? (
          daySlots.map(slot => (
            <div
              key={slot.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400">
                  <Clock className="w-3.5 h-3.5" />
                  {slot.start_time} - {slot.end_time}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    slot.type === 'Lab'
                      ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30'
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                  }`}
                >
                  {slot.type}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{slot.subject_name}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{slot.subject_code}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                  {slot.teacher_name || 'Faculty'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Room {slot.room}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
            No scheduled classes for {selectedDay}.
          </div>
        )}
      </div>
    </div>
  );
};
