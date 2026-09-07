import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { TimetableSlot, Course, Subject, Teacher } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  BookOpen,
  Filter,
  Grid,
  List,
  Layers,
} from 'lucide-react';

export const AdminTimetable: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Filter States
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');

  // Display Mode ('grid' | 'daily' | 'teacher' | 'room')
  const [viewMode, setViewMode] = useState<'grid' | 'daily' | 'teacher'>('grid');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Modals & Submissions
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<{
    course_id: string;
    semester: number;
    section: string;
    day: TimetableSlot['day'];
    start_time: string;
    end_time: string;
    subject_id: string;
    teacher_id: string;
    room: string;
    type: TimetableSlot['type'];
    status: TimetableSlot['status'];
  }>({
    course_id: '',
    semester: 5,
    section: 'A',
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    subject_id: '',
    teacher_id: '',
    room: 'Lab 4B',
    type: 'Lecture',
    status: 'Published',
  });

  const days: Array<TimetableSlot['day']> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlotsHeader = ['09:00 - 10:00', '10:15 - 11:15', '11:30 - 12:30', '14:00 - 15:00', '15:15 - 16:15'];

  const loadData = async () => {
    setLoading(true);
    try {
      const [ttData, crsData, subjData, tchData] = await Promise.all([
        dbService.getTimetable(),
        dbService.getCourses(),
        dbService.getSubjects(),
        dbService.getTeachers(),
      ]);

      setTimetable(ttData);
      setCourses(crsData);
      setSubjects(subjData);
      setTeachers(tchData);

      if (crsData.length > 0 && !formData.course_id) {
        setFormData(prev => ({ ...prev, course_id: crsData[0].id }));
      }
    } catch (err: any) {
      showToast('Error Loading Timetable', err.message || 'Failed to fetch timetable data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Subjects based on Form's selected Course and Semester
  const availableFormSubjects = subjects.filter(s => {
    if (formData.course_id && s.course_id !== formData.course_id) return false;
    if (formData.semester && s.semester !== Number(formData.semester)) return false;
    return true;
  });

  // When form subject changes, auto-select teacher assigned to subject
  const handleFormSubjectChange = (subjectId: string) => {
    const targetSubj = subjects.find(s => s.id === subjectId);
    setFormData(prev => ({
      ...prev,
      subject_id: subjectId,
      teacher_id: targetSubj?.teacher_id || prev.teacher_id,
    }));
  };

  const handleOpenAdd = () => {
    setEditingSlot(null);
    const initialCourse = courses[0];
    const initialSubj = subjects.find(s => s.course_id === initialCourse?.id) || subjects[0];
    setFormData({
      course_id: initialCourse?.id || '',
      semester: initialSubj?.semester || 5,
      section: 'A',
      day: 'Monday',
      start_time: '09:00',
      end_time: '10:00',
      subject_id: initialSubj?.id || '',
      teacher_id: initialSubj?.teacher_id || teachers[0]?.id || '',
      room: 'Lab 4B',
      type: 'Lecture',
      status: 'Published',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      course_id: slot.course_id,
      semester: slot.semester,
      section: slot.section,
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
      subject_id: slot.subject_id,
      teacher_id: slot.teacher_id || '',
      room: slot.room,
      type: slot.type,
      status: slot.status || 'Published',
    });
    setIsAddEditOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id || !formData.subject_id || !formData.room) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    const selectedCourse = courses.find(c => c.id === formData.course_id);
    const selectedSubj = subjects.find(s => s.id === formData.subject_id);
    const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);

    setIsSubmitting(true);
    try {
      const payload: Omit<TimetableSlot, 'id'> = {
        course_id: formData.course_id,
        course_name: selectedCourse?.name || 'Course',
        semester: Number(formData.semester),
        section: formData.section.toUpperCase(),
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        subject_id: formData.subject_id,
        subject_name: selectedSubj?.name || 'Subject',
        subject_code: selectedSubj?.code || 'SUBJ',
        teacher_id: formData.teacher_id,
        teacher_name: selectedTeacher?.profile?.full_name || 'Faculty Member',
        room: formData.room,
        type: formData.type,
        status: formData.status,
      };

      if (editingSlot) {
        await dbService.updateTimetableSlot(editingSlot.id, payload, user?.id);
        showToast('Timetable Updated', 'Class slot details updated successfully.', 'success');
      } else {
        await dbService.createTimetableSlot(payload, user?.id);
        showToast('Timetable Created', 'New class slot published to timetable.', 'success');
      }

      await loadData();
      setIsAddEditOpen(false);
      setEditingSlot(null);
    } catch (err: any) {
      showToast('Timetable Conflict / Error', err.message || 'Failed to save timetable slot.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await dbService.deleteTimetableSlot(deletingId);
      await loadData();
      setDeletingId(null);
      showToast('Timetable Slot Deleted', 'Class slot removed permanently from timetable.', 'success');
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to delete timetable slot.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTimetable = timetable.filter(slot => {
    if (filterCourseId !== 'all' && slot.course_id !== filterCourseId) return false;
    if (filterSemester !== 'all' && slot.semester !== Number(filterSemester)) return false;
    if (filterSection !== 'all' && slot.section.toLowerCase() !== filterSection.toLowerCase()) return false;
    if (filterTeacherId !== 'all' && slot.teacher_id !== filterTeacherId) return false;
    if (filterDay !== 'all' && slot.day !== filterDay) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              HOD Timetable Governance & Scheduling
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-md">
              HOD / Admin Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete institutional control over degree timetables with conflict collision checks
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timetable Slot</span>
        </button>
      </div>

      {/* Filters & View Mode Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Institutional Filters
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Weekly Grid
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'daily' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Daily Cards
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'teacher' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Faculty View
            </button>
          </div>
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
            <label className="text-[11px] font-semibold text-slate-500">Instructor</label>
            <select
              value={filterTeacherId}
              onChange={e => setFilterTeacherId(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Faculty</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.profile?.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Day of Week</label>
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
          Loading institutional timetable matrix...
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: WEEKLY MATRIX GRID */}
          {viewMode === 'grid' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Weekly Class Timetable Matrix (Days × Schedule Slots)
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Total Active Slots: {filteredTimetable.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3.5 w-28">Day</th>
                      <th className="px-4 py-3.5">Schedule Slots</th>
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
                              <span className="text-slate-400 text-xs italic">No scheduled classes</span>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {daySlots.map(slot => (
                                  <div
                                    key={slot.id}
                                    className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2 relative group"
                                  >
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {slot.start_time} - {slot.end_time}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
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

                                    <div className="pt-1 border-t border-purple-500/10 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                                      <span className="truncate max-w-[120px]">{slot.teacher_name || 'Faculty'}</span>
                                      <span className="font-bold text-purple-600 shrink-0">Room {slot.room}</span>
                                    </div>

                                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700">
                                      <button
                                        onClick={() => handleOpenEdit(slot)}
                                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                        title="Edit Slot"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => setDeletingId(slot.id)}
                                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                        title="Delete Slot"
                                      >
                                        <Trash2 className="w-3 h-3" />
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

          {/* VIEW MODE 2: DAILY LIST CARDS */}
          {viewMode === 'daily' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {days.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedDay === d
                        ? 'bg-purple-600 text-white shadow-xs'
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
                      <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {slot.start_time} - {slot.end_time}
                      </span>
                      <Badge variant="info">{slot.type}</Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{slot.subject_name}</h3>
                      <p className="text-xs text-slate-500 font-semibold">{slot.course_name} • Sem {slot.semester} ({slot.section})</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                        {slot.teacher_name || 'Faculty'}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        Room {slot.room}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleOpenEdit(slot)}
                        className="px-3 py-1 bg-purple-50 text-purple-700 dark:bg-slate-800 dark:text-purple-300 rounded-lg text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(slot.id)}
                        className="px-3 py-1 bg-rose-50 text-rose-700 dark:bg-slate-800 dark:text-rose-300 rounded-lg text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: TEACHER SCHEDULE VIEW */}
          {viewMode === 'teacher' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Faculty Teaching Load Matrix</h3>
              </div>

              <div className="p-6 space-y-6">
                {teachers.map(tch => {
                  const tchSlots = filteredTimetable.filter(t => t.teacher_id === tch.id);
                  if (tchSlots.length === 0) return null;

                  return (
                    <div key={tch.id} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{tch.profile?.full_name}</h4>
                          <p className="text-xs text-slate-500">{tch.designation} • Dept: {tch.department}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                        {tchSlots.map(slot => (
                          <div key={slot.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                            <span className="font-bold text-purple-600">{slot.day} ({slot.start_time} - {slot.end_time})</span>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{slot.subject_name}</p>
                            <p className="text-[11px] text-slate-500">{slot.course_name} Sem {slot.semester} ({slot.section}) • Room {slot.room}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Timetable Modal */}
      {isAddEditOpen && (
        <Modal
          isOpen={isAddEditOpen}
          onClose={() => setIsAddEditOpen(false)}
          title={editingSlot ? 'Edit Timetable Slot' : 'Add New Timetable Slot'}
          subtitle="Provision class schedule with dynamic conflict checking"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Course</label>
                <select
                  value={formData.course_id}
                  onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Section</label>
                  <select
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject (Dynamic)</label>
                <select
                  value={formData.subject_id}
                  onChange={e => handleFormSubjectChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-purple-600"
                >
                  <option value="">Select Subject</option>
                  {availableFormSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign Teacher</label>
                <select
                  value={formData.teacher_id}
                  onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="">Select Instructor</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.profile?.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
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

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Room / Venue</label>
                <input
                  type="text"
                  required
                  value={formData.room}
                  onChange={e => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Lab 4B"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Class Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Practical">Practical</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Checking Conflicts...' : editingSlot ? 'Update Timetable Slot' : 'Publish Class Slot'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Timetable Slot"
        message="Are you sure you want to delete this timetable slot? This class will be removed permanently from the student and teacher schedules."
        confirmText="Delete Slot"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
