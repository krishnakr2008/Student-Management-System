import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { TimetableSlot, Course, Subject } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Edit,
  UserCheck,
  BookOpen,
  Filter,
  Grid,
  List,
  Layers,
  Sparkles,
} from 'lucide-react';

export const TeacherTimetable: React.FC = () => {
  const { user, teacher } = useAuth();
  const { showToast } = useToast();

  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filter States
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');

  // View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'daily'>('grid');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State for Teacher Edit
  const [formData, setFormData] = useState<{
    day: TimetableSlot['day'];
    start_time: string;
    end_time: string;
    room: string;
    section: string;
  }>({
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    room: 'Lab 4B',
    section: 'A',
  });

  const days: Array<TimetableSlot['day']> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const loadData = async () => {
    setLoading(true);
    try {
      const [ttData, crsData, subjData] = await Promise.all([
        dbService.getTimetable(),
        dbService.getCourses(),
        dbService.getSubjects(),
      ]);

      // Filter timetable strictly for this teacher's assigned slots
      const teacherSlots = ttData.filter(t => {
        if (teacher && t.teacher_id === teacher.id) return true;
        if (user && t.teacher_name && t.teacher_name.toLowerCase() === user.full_name.toLowerCase()) return true;
        return false;
      });

      setTimetable(ttData);
      setCourses(crsData);
      setSubjects(subjData);
    } catch (err: any) {
      showToast('Error Loading Timetable', err.message || 'Failed to fetch timetable schedules.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacher, user]);

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
      room: slot.room,
      section: slot.section,
    });
    setIsEditOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    setIsSubmitting(true);
    try {
      const updatedPayload: Omit<TimetableSlot, 'id'> = {
        ...editingSlot,
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room: formData.room,
        section: formData.section.toUpperCase(),
      };

      await dbService.updateTimetableSlot(editingSlot.id, updatedPayload, user?.id);
      showToast('Slot Rescheduled', 'Class timing and room update saved successfully.', 'success');
      await loadData();
      setIsEditOpen(false);
      setEditingSlot(null);
    } catch (err: any) {
      showToast('Collision Conflict Error', err.message || 'Failed to update schedule slot.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTimetable = timetable.filter(slot => {
    if (teacher || user) {
      const isAssigned =
        (teacher && slot.teacher_id === teacher.id) ||
        (user &&
          slot.teacher_name &&
          (slot.teacher_name.toLowerCase().includes(user.full_name.toLowerCase()) ||
            user.full_name.toLowerCase().includes(slot.teacher_name.toLowerCase())));

      const hasAnyAssigned = timetable.some(
        t =>
          (teacher && t.teacher_id === teacher.id) ||
          (user &&
            t.teacher_name &&
            (t.teacher_name.toLowerCase().includes(user.full_name.toLowerCase()) ||
              user.full_name.toLowerCase().includes(t.teacher_name.toLowerCase())))
      );

      if (hasAnyAssigned && !isAssigned) return false;
    }

    if (filterCourseId !== 'all' && slot.course_id !== filterCourseId) return false;
    if (filterSemester !== 'all' && slot.semester !== Number(filterSemester)) return false;
    if (filterSection !== 'all' && slot.section.toLowerCase() !== filterSection.toLowerCase()) return false;
    if (filterSubjectId !== 'all' && slot.subject_id !== filterSubjectId) return false;
    if (filterDay !== 'all' && slot.day !== filterDay) return false;
    return true;
  });

  const totalAssignedClasses = filteredTimetable.length;
  const uniqueSubjectsCount = new Set(filteredTimetable.map(s => s.subject_id)).size;
  const uniqueSectionsCount = new Set(filteredTimetable.map(s => `${s.course_id}-${s.semester}-${s.section}`)).size;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Faculty Teaching Schedule
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md">
              Faculty Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personal teaching timetable, assigned lectures, laboratory slots, and room allocations
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Weekly Grid
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              viewMode === 'daily' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Daily Cards
          </button>
        </div>
      </div>

      {/* Faculty Schedule Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Weekly Classes</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{totalAssignedClasses} Slots</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned Subjects</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{uniqueSubjectsCount} Subjects</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Class Batches</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{uniqueSectionsCount} Sections</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Filter Teaching Slots
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Course</label>
            <select
              value={filterCourseId}
              onChange={e => setFilterCourseId(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Semester</label>
            <select
              value={filterSemester}
              onChange={e => setFilterSemester(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Section</label>
            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Subject</label>
            <select
              value={filterSubjectId}
              onChange={e => setFilterSubjectId(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Day</label>
            <select
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Days</option>
              {days.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-500">
          Loading faculty timetable schedule...
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: WEEKLY MATRIX GRID */}
          {viewMode === 'grid' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Weekly Faculty Schedule Matrix
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Showing {filteredTimetable.length} Slots
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3.5 w-28">Day</th>
                      <th className="px-4 py-3.5">Assigned Class Slots</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {days.map(day => {
                      const daySlots = filteredTimetable.filter(t => t.day === day);

                      return (
                        <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/30">
                            {day}
                          </td>
                          <td className="px-4 py-4">
                            {daySlots.length === 0 ? (
                              <span className="text-slate-400 text-xs italic">No teaching slots scheduled</span>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {daySlots.map(slot => (
                                  <div
                                    key={slot.id}
                                    className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 relative group"
                                  >
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {slot.start_time} - {slot.end_time}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                        {slot.type}
                                      </span>
                                    </div>

                                    <div>
                                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-tight">
                                        {slot.subject_name}
                                      </h4>
                                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                        {slot.course_name} • Sem {slot.semester} ({slot.section})
                                      </p>
                                    </div>

                                    <div className="pt-1 border-t border-emerald-500/10 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-rose-500" /> Room {slot.room}
                                      </span>

                                      <button
                                        onClick={() => handleOpenEdit(slot)}
                                        className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-slate-800 dark:text-emerald-300 rounded font-bold hover:bg-emerald-200 transition-all flex items-center gap-1"
                                      >
                                        <Edit className="w-2.5 h-2.5" /> Adjust
                                      </button>
                                    </div>
                                  </div>
                                ))}
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {days.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedDay === d
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTimetable.filter(t => t.day === selectedDay).map(slot => (
                  <div
                    key={slot.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {slot.start_time} - {slot.end_time}
                      </span>
                      <Badge variant="safe">{slot.type}</Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{slot.subject_name}</h3>
                      <p className="text-xs text-slate-500 font-semibold">{slot.course_name} • Semester {slot.semester} ({slot.section})</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        Room {slot.room}
                      </span>

                      <button
                        onClick={() => handleOpenEdit(slot)}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Slot Reschedule Modal */}
      {isEditOpen && editingSlot && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Adjust Schedule: ${editingSlot.subject_name}`}
          subtitle="Modify timing or room allocation for your assigned class slot"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">{editingSlot.subject_name} ({editingSlot.subject_code})</p>
              <p className="text-slate-500">{editingSlot.course_name} • Semester {editingSlot.semester}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Day</label>
                <select
                  value={formData.day}
                  onChange={e => setFormData({ ...formData, day: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={e => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                <input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Room / Lab Allocation</label>
              <input
                type="text"
                required
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                placeholder="Lab 4B"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Checking Conflicts...' : 'Save Schedule Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
