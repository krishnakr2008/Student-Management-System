import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { TimetableSlot } from '../../types';
import { Badge } from '../../components/common/Badge';
import {
  Clock,
  MapPin,
  UserCheck,
  Calendar,
  Grid,
  List,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle,
} from 'lucide-react';

export const StudentTimetable: React.FC = () => {
  const { student } = useAuth();
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [viewMode, setViewMode] = useState<'daily' | 'grid'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const days: Array<TimetableSlot['day']> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const data = await dbService.getTimetable();

        // Filter slots for student's semester and section
        let studentSlots = data;
        if (student) {
          studentSlots = data.filter(t => {
            if (student.semester && t.semester && t.semester !== student.semester) return false;
            if (student.section && t.section && t.section.toLowerCase() !== student.section.toLowerCase()) return false;
            if (student.course_id && t.course_id && t.course_id !== student.course_id && student.course_name && t.course_name && !t.course_name.toLowerCase().includes(student.course_name.toLowerCase())) return false;
            return true;
          });

          if (studentSlots.length === 0) {
            studentSlots = data;
          }
        }

        setTimetable(studentSlots);
      } catch (err) {
        console.error('Error loading student timetable:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [student]);

  // Determine current day of week
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (days.includes(todayStr as any)) {
      setSelectedDay(todayStr);
    }
  }, []);

  const filteredSlots = timetable.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    return true;
  });

  const daySlots = filteredSlots.filter(t => t.day === selectedDay);

  // Time conversion helper for active class highlight
  const timeToMin = (tStr: string) => {
    const [h, m] = tStr.split(':').map(Number);
    return h * 60 + m;
  };

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Class Timetable
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-md">
              Student View
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Weekly schedule for {student?.course_name || 'B.Tech CSE'} • Semester {student?.semester || 5} (Section {student?.section || 'A'})
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Weekly Matrix
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              viewMode === 'daily' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Daily View
          </button>
        </div>
      </div>

      {/* Filter & Day Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDay === day
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Class Types</option>
            <option value="Lecture">Lectures</option>
            <option value="Lab">Labs & Practicals</option>
            <option value="Tutorial">Tutorials</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-500">
          Loading student class timetable...
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: WEEKLY MATRIX GRID */}
          {viewMode === 'grid' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Weekly Class Timetable Matrix
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {filteredSlots.length} Classes Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3.5 w-28">Day</th>
                      <th className="px-4 py-3.5">Scheduled Classes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {days.map(day => {
                      const dSlots = filteredSlots.filter(t => t.day === day);

                      return (
                        <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/30">
                            {day}
                          </td>
                          <td className="px-4 py-4">
                            {dSlots.length === 0 ? (
                              <span className="text-slate-400 text-xs italic">No scheduled classes</span>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dSlots.map(slot => {
                                  const startM = timeToMin(slot.start_time);
                                  const endM = timeToMin(slot.end_time);
                                  const isOngoing = todayName === day && currentMin >= startM && currentMin <= endM;

                                  return (
                                    <div
                                      key={slot.id}
                                      className={`p-3 rounded-xl border space-y-2 relative transition-all ${
                                        isOngoing
                                          ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20'
                                          : 'bg-brand-500/5 border-brand-500/20'
                                      }`}
                                    >
                                      {isOngoing && (
                                        <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                                          <Sparkles className="w-2.5 h-2.5" /> Ongoing Now
                                        </span>
                                      )}

                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-extrabold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {slot.start_time} - {slot.end_time}
                                        </span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                            slot.type === 'Lab'
                                              ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                                              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                          }`}
                                        >
                                          {slot.type}
                                        </span>
                                      </div>

                                      <div>
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-tight">
                                          {slot.subject_name}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 font-mono">{slot.subject_code}</span>
                                      </div>

                                      <div className="pt-1 border-t border-brand-500/10 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                                          <UserCheck className="w-3 h-3 text-brand-500" />
                                          {slot.teacher_name || 'Faculty'}
                                        </span>
                                        <span className="font-bold text-rose-600 flex items-center gap-1 shrink-0">
                                          <MapPin className="w-3 h-3" /> Room {slot.room}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: DAILY CARDS */}
          {viewMode === 'daily' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {daySlots.length > 0 ? (
                daySlots.map(slot => {
                  const startM = timeToMin(slot.start_time);
                  const endM = timeToMin(slot.end_time);
                  const isOngoing = todayName === selectedDay && currentMin >= startM && currentMin <= endM;

                  return (
                    <div
                      key={slot.id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs space-y-3 relative ${
                        isOngoing
                          ? 'border-amber-500 ring-2 ring-amber-500/20'
                          : 'border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      {isOngoing && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-slate-950 shadow-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Ongoing Class
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400">
                          <Clock className="w-3.5 h-3.5" />
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                  );
                })
              ) : (
                <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                  No scheduled classes for {selectedDay}.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
