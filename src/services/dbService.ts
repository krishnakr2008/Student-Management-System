import { supabase, isRealSupabaseConfigured } from '../lib/supabase';
import {
  INITIAL_PROFILES,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
  INITIAL_TEACHER_SUBJECTS,
  INITIAL_STUDENT_SUBJECTS,
  INITIAL_ATTENDANCE,
  INITIAL_MARKS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_EXAMS,
  INITIAL_TIMETABLE,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_CERTIFICATES,
  INITIAL_RESUME,
  INITIAL_NOTIFICATIONS,
  INITIAL_FEES,
  INITIAL_HODS,
} from './seedData';
import {
  UserProfile,
  Student,
  Teacher,
  Course,
  Subject,
  TeacherSubject,
  StudentSubject,
  AttendanceRecord,
  SubjectAttendanceSummary,
  MarkRecord,
  Assignment,
  AssignmentSubmission,
  Exam,
  TimetableSlot,
  Notice,
  CollegeEvent,
  Certificate,
  ResumeData,
  NotificationItem,
  FeeRecord,
  HODInfo,
} from '../types';

// Storage Helper
const getStorageData = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(`student_portal_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const setStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`student_portal_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

// Initialize default storage if empty
export const initializeLocalStorage = () => {
  if (!localStorage.getItem('student_portal_profiles')) setStorageData('profiles', INITIAL_PROFILES);
  if (!localStorage.getItem('student_portal_students')) setStorageData('students', INITIAL_STUDENTS);
  if (!localStorage.getItem('student_portal_teachers')) setStorageData('teachers', INITIAL_TEACHERS);
  if (!localStorage.getItem('student_portal_courses')) setStorageData('courses', INITIAL_COURSES);
  if (!localStorage.getItem('student_portal_subjects')) setStorageData('subjects', INITIAL_SUBJECTS);
  if (!localStorage.getItem('student_portal_teacher_subjects')) setStorageData('teacher_subjects', INITIAL_TEACHER_SUBJECTS);
  if (!localStorage.getItem('student_portal_student_subjects')) setStorageData('student_subjects', INITIAL_STUDENT_SUBJECTS);
  if (!localStorage.getItem('student_portal_attendance')) setStorageData('attendance', INITIAL_ATTENDANCE);
  if (!localStorage.getItem('student_portal_marks')) setStorageData('marks', INITIAL_MARKS);
  if (!localStorage.getItem('student_portal_assignments')) setStorageData('assignments', INITIAL_ASSIGNMENTS);
  if (!localStorage.getItem('student_portal_submissions')) setStorageData('submissions', INITIAL_SUBMISSIONS);
  if (!localStorage.getItem('student_portal_exams')) setStorageData('exams', INITIAL_EXAMS);
  if (!localStorage.getItem('student_portal_timetable')) setStorageData('timetable', INITIAL_TIMETABLE);
  if (!localStorage.getItem('student_portal_notices')) setStorageData('notices', INITIAL_NOTICES);
  if (!localStorage.getItem('student_portal_events')) setStorageData('events', INITIAL_EVENTS);
  if (!localStorage.getItem('student_portal_certificates')) setStorageData('certificates', INITIAL_CERTIFICATES);
  if (!localStorage.getItem('student_portal_resumes')) setStorageData('resumes', [INITIAL_RESUME]);
  if (!localStorage.getItem('student_portal_notifications')) setStorageData('notifications', INITIAL_NOTIFICATIONS);
  if (!localStorage.getItem('student_portal_fees')) setStorageData('fees', INITIAL_FEES);
  if (!localStorage.getItem('student_portal_hods')) setStorageData('hods', INITIAL_HODS);
};

initializeLocalStorage();

export const dbService = {
  // PROFILES
  async getProfiles(): Promise<UserProfile[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return data as UserProfile[];
    }
    return getStorageData('profiles', INITIAL_PROFILES);
  },

  async getProfileById(id: string): Promise<UserProfile | null> {
    if (!id) return null;
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (error || !data) return null;
      return data as UserProfile;
    }
    const profiles = getStorageData<UserProfile[]>('profiles', INITIAL_PROFILES);
    return profiles.find(p => p.id === id) || null;
  },

  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').select('*').ilike('email', cleanEmail).maybeSingle();
      if (error || !data) return null;
      return data as UserProfile;
    }
    const profiles = getStorageData<UserProfile[]>('profiles', INITIAL_PROFILES);
    return profiles.find(p => p.email && p.email.toLowerCase() === cleanEmail) || null;
  },

  async getProfileByIdentifier(identifier: string): Promise<UserProfile | null> {
    if (!identifier) return null;
    const input = identifier.trim();

    // 1. Check if email
    if (input.includes('@')) {
      return await this.getProfileByEmail(input);
    }

    // 2. Check student roll number or student ID code
    const students = await this.getStudents(true);
    const matchedStudent = students.find(
      s => (s.roll_number && s.roll_number.toLowerCase() === input.toLowerCase()) ||
           (s.student_id_code && s.student_id_code.toLowerCase() === input.toLowerCase())
    );
    if (matchedStudent && matchedStudent.profile_id) {
      const p = await this.getProfileById(matchedStudent.profile_id);
      if (p) return p;
    }

    // 3. Check teacher ID code
    const teachers = await this.getTeachers(true);
    const matchedTeacher = teachers.find(
      t => t.teacher_id_code && t.teacher_id_code.toLowerCase() === input.toLowerCase()
    );
    if (matchedTeacher && matchedTeacher.profile_id) {
      const p = await this.getProfileById(matchedTeacher.profile_id);
      if (p) return p;
    }

    // 4. Check HOD ID code
    const hods = await this.getHODs();
    const matchedHod = hods.find(
      h => h.hod_id_code && h.hod_id_code.toLowerCase() === input.toLowerCase()
    );
    if (matchedHod && matchedHod.profile_id) {
      const p = await this.getProfileById(matchedHod.profile_id);
      if (p) return p;
    }

    return null;
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data as UserProfile;
    }
    const profiles = getStorageData<UserProfile[]>('profiles', INITIAL_PROFILES);
    const index = profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updates };
      setStorageData('profiles', profiles);
      return profiles[index];
    }
    throw new Error('Profile record not found.');
  },

  // STUDENTS
  async getStudents(includeInactive = false): Promise<Student[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('students').select('*, profile:profiles(*)');
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Student[];
    }
    const students = getStorageData<Student[]>('students', INITIAL_STUDENTS);
    return includeInactive ? students : students.filter(s => s.active !== false);
  },

  async createStudent(studentData: Omit<Student, 'id'>, profileData: Omit<UserProfile, 'id'>): Promise<Student> {
    const existing = await this.getStudents(true);
    if (existing.some(s => s.roll_number.toLowerCase() === studentData.roll_number.toLowerCase())) {
      throw new Error(`Roll number "${studentData.roll_number}" is already registered to another student.`);
    }
    if (existing.some(s => s.student_id_code.toLowerCase() === studentData.student_id_code.toLowerCase())) {
      throw new Error(`Student ID code "${studentData.student_id_code}" is already registered.`);
    }

    const newId = `student-${Date.now()}`;
    const newProfileId = `user-${Date.now()}`;
    const newProfile: UserProfile = { ...profileData, id: newProfileId, role: 'student', created_at: new Date().toISOString() };
    const newStudent: Student = { ...studentData, id: newId, profile_id: newProfileId, profile: newProfile, active: true };

    if (isRealSupabaseConfigured()) {
      const { error: pErr } = await supabase.from('profiles').insert(newProfile);
      if (pErr) throw new Error(pErr.message);

      const { error: sErr } = await supabase.from('students').insert({
        id: newId,
        profile_id: newProfileId,
        student_id_code: studentData.student_id_code,
        course_id: studentData.course_id,
        department: studentData.department,
        branch: studentData.branch,
        semester: studentData.semester,
        section: studentData.section,
        roll_number: studentData.roll_number,
        admission_year: studentData.admission_year,
        guardian_name: studentData.guardian_name,
        guardian_phone: studentData.guardian_phone,
        guardian_relation: studentData.guardian_relation,
        active: true,
      });
      if (sErr) throw new Error(sErr.message);
    }

    const profiles = getStorageData<UserProfile[]>('profiles', INITIAL_PROFILES);
    profiles.push(newProfile);
    setStorageData('profiles', profiles);

    const students = getStorageData<Student[]>('students', INITIAL_STUDENTS);
    students.push(newStudent);
    setStorageData('students', students);

    return newStudent;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const students = getStorageData<Student[]>('students', INITIAL_STUDENTS);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student record not found.');

    students[index] = { ...students[index], ...updates };
    setStorageData('students', students);

    if (isRealSupabaseConfigured()) {
      const { profile, ...fields } = updates;
      const { error } = await supabase.from('students').update(fields).eq('id', id);
      if (error) throw new Error(error.message);
    }
    return students[index];
  },

  async deleteStudent(id: string): Promise<boolean> {
    // Soft Delete to preserve historical attendance & grade integrity
    const students = getStorageData<Student[]>('students', INITIAL_STUDENTS);
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index].active = false;
      setStorageData('students', students);
    }

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('students').update({ active: false }).eq('id', id);
      if (error) throw new Error(error.message);
    }
    return true;
  },

  // TEACHERS
  async getTeachers(includeInactive = false): Promise<Teacher[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('teachers').select('*, profile:profiles(*)');
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Teacher[];
    }
    const teachers = getStorageData<Teacher[]>('teachers', INITIAL_TEACHERS);
    return includeInactive ? teachers : teachers.filter(t => t.active !== false);
  },

  async createTeacher(teacherData: Omit<Teacher, 'id'>, profileData: Omit<UserProfile, 'id'>): Promise<Teacher> {
    const existing = await this.getTeachers(true);
    if (existing.some(t => t.teacher_id_code.toLowerCase() === teacherData.teacher_id_code.toLowerCase())) {
      throw new Error(`Teacher ID code "${teacherData.teacher_id_code}" is already in use.`);
    }

    const newId = `teacher-${Date.now()}`;
    const newProfileId = `user-teacher-${Date.now()}`;
    const newProfile: UserProfile = { ...profileData, id: newProfileId, role: 'teacher', created_at: new Date().toISOString() };
    const newTeacher: Teacher = { ...teacherData, id: newId, profile_id: newProfileId, profile: newProfile, active: true };

    if (isRealSupabaseConfigured()) {
      const { error: pErr } = await supabase.from('profiles').insert(newProfile);
      if (pErr) throw new Error(pErr.message);

      const { error: tErr } = await supabase.from('teachers').insert({
        id: newId,
        profile_id: newProfileId,
        teacher_id_code: teacherData.teacher_id_code,
        department: teacherData.department,
        designation: teacherData.designation,
        active: true,
      });
      if (tErr) throw new Error(tErr.message);
    }

    const profiles = getStorageData<UserProfile[]>('profiles', INITIAL_PROFILES);
    profiles.push(newProfile);
    setStorageData('profiles', profiles);

    const teachers = getStorageData<Teacher[]>('teachers', INITIAL_TEACHERS);
    teachers.push(newTeacher);
    setStorageData('teachers', teachers);

    return newTeacher;
  },

  async deleteTeacher(id: string): Promise<boolean> {
    const teachers = getStorageData<Teacher[]>('teachers', INITIAL_TEACHERS);
    const index = teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      teachers[index].active = false;
      setStorageData('teachers', teachers);
    }

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('teachers').update({ active: false }).eq('id', id);
      if (error) throw new Error(error.message);
    }
    return true;
  },

  // COURSES & SUBJECTS
  async getCourses(includeInactive = false): Promise<Course[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('courses').select('*');
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Course[];
    }
    const courses = getStorageData<Course[]>('courses', INITIAL_COURSES);
    return includeInactive ? courses : courses.filter(c => c.active !== false);
  },

  async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const existing = await this.getCourses(true);
    if (existing.some(c => c.code.toLowerCase() === course.code.toLowerCase())) {
      throw new Error(`Course code "${course.code}" already exists.`);
    }

    const newCourse: Course = { ...course, id: `course-${Date.now()}`, active: true, student_count: 0 };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('courses').insert(newCourse);
      if (error) throw new Error(error.message);
    }

    const courses = getStorageData<Course[]>('courses', INITIAL_COURSES);
    courses.push(newCourse);
    setStorageData('courses', courses);

    return newCourse;
  },

  async deleteCourse(id: string): Promise<boolean> {
    const courses = getStorageData<Course[]>('courses', INITIAL_COURSES);
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
      courses[index].active = false;
      setStorageData('courses', courses);
    }

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('courses').update({ active: false }).eq('id', id);
      if (error) throw new Error(error.message);
    }
    return true;
  },

  async getSubjects(includeInactive = false): Promise<Subject[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('subjects').select('*');
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Subject[];
    }
    const subjects = getStorageData<Subject[]>('subjects', INITIAL_SUBJECTS);
    return includeInactive ? subjects : subjects.filter(s => s.active !== false);
  },

  async createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const existing = await this.getSubjects(true);
    if (existing.some(s => s.code.toLowerCase() === subject.code.toLowerCase())) {
      throw new Error(`Subject code "${subject.code}" already exists.`);
    }

    const newSubj: Subject = { ...subject, id: `subj-${Date.now()}`, active: true };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('subjects').insert(newSubj);
      if (error) throw new Error(error.message);
    }

    const subjects = getStorageData<Subject[]>('subjects', INITIAL_SUBJECTS);
    subjects.push(newSubj);
    setStorageData('subjects', subjects);

    return newSubj;
  },

  async deleteSubject(id: string): Promise<boolean> {
    const subjects = getStorageData<Subject[]>('subjects', INITIAL_SUBJECTS);
    const index = subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      subjects[index].active = false;
      setStorageData('subjects', subjects);
    }

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('subjects').update({ active: false }).eq('id', id);
      if (error) throw new Error(error.message);
    }
    return true;
  },

  // TEACHER-SUBJECT ALLOCATION
  async getTeacherSubjects(teacherId?: string): Promise<TeacherSubject[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('teacher_subjects').select('*');
      if (teacherId) query = query.eq('teacher_id', teacherId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as TeacherSubject[];
    }
    const all = getStorageData<TeacherSubject[]>('teacher_subjects', INITIAL_TEACHER_SUBJECTS);
    return teacherId ? all.filter(ts => ts.teacher_id === teacherId) : all;
  },

  async assignTeacherSubject(teacherId: string, subjectId: string): Promise<TeacherSubject> {
    const all = getStorageData<TeacherSubject[]>('teacher_subjects', INITIAL_TEACHER_SUBJECTS);
    const subjects = await this.getSubjects(true);
    const targetSubject = subjects.find(s => s.id === subjectId);

    const existing = all.find(ts => ts.teacher_id === teacherId && ts.subject_id === subjectId);
    if (existing) return existing;

    const newAllocation: TeacherSubject = {
      id: `ts-${Date.now()}`,
      teacher_id: teacherId,
      subject_id: subjectId,
      subject_name: targetSubject?.name || 'Subject',
      subject_code: targetSubject?.code || 'SUBJ',
      created_at: new Date().toISOString(),
    };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('teacher_subjects').insert({ teacher_id: teacherId, subject_id: subjectId });
      if (error) throw new Error(error.message);
    }

    all.push(newAllocation);
    setStorageData('teacher_subjects', all);
    return newAllocation;
  },

  async removeTeacherSubject(teacherId: string, subjectId: string): Promise<boolean> {
    const all = getStorageData<TeacherSubject[]>('teacher_subjects', INITIAL_TEACHER_SUBJECTS);
    const filtered = all.filter(ts => !(ts.teacher_id === teacherId && ts.subject_id === subjectId));
    setStorageData('teacher_subjects', filtered);

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('teacher_subjects').delete().match({ teacher_id: teacherId, subject_id: subjectId });
      if (error) throw new Error(error.message);
    }
    return true;
  },

  // STUDENT-SUBJECT ENROLLMENT
  async getStudentSubjects(studentId?: string): Promise<StudentSubject[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('student_subjects').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as StudentSubject[];
    }
    const all = getStorageData<StudentSubject[]>('student_subjects', INITIAL_STUDENT_SUBJECTS);
    return studentId ? all.filter(ss => ss.student_id === studentId) : all;
  },

  async assignStudentSubject(studentId: string, subjectId: string): Promise<StudentSubject> {
    const all = getStorageData<StudentSubject[]>('student_subjects', INITIAL_STUDENT_SUBJECTS);
    const subjects = await this.getSubjects(true);
    const targetSubject = subjects.find(s => s.id === subjectId);

    const existing = all.find(ss => ss.student_id === studentId && ss.subject_id === subjectId);
    if (existing) return existing;

    const newEnrollment: StudentSubject = {
      id: `ss-${Date.now()}`,
      student_id: studentId,
      subject_id: subjectId,
      subject_name: targetSubject?.name,
      subject_code: targetSubject?.code,
    };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('student_subjects').insert({ student_id: studentId, subject_id: subjectId });
      if (error) throw new Error(error.message);
    }

    all.push(newEnrollment);
    setStorageData('student_subjects', all);
    return newEnrollment;
  },

  // TEACHER-SCOPED HELPER METHODS
  async getTeacherAssignedSubjects(teacherId: string): Promise<Subject[]> {
    const allocations = await this.getTeacherSubjects(teacherId);
    const assignedSubjectIds = new Set(allocations.map(a => a.subject_id));
    const allSubjects = await this.getSubjects();

    return allSubjects.filter(s => assignedSubjectIds.has(s.id) || s.teacher_id === teacherId);
  },

  async getTeacherAssignedStudents(teacherId: string): Promise<Student[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const studentSubjects = await this.getStudentSubjects();
    const enrolledStudentIds = new Set(
      studentSubjects.filter(ss => subjectIds.has(ss.subject_id)).map(ss => ss.student_id)
    );

    const allStudents = await this.getStudents();
    return allStudents.filter(st => enrolledStudentIds.has(st.id) || enrolledStudentIds.size === 0);
  },

  // ATTENDANCE
  async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('attendance').select('*').eq('student_id', studentId);
      if (error) throw new Error(error.message);
      return data as AttendanceRecord[];
    }
    const all = getStorageData<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
    return all.filter(a => a.student_id === studentId);
  },

  async getTeacherAttendance(teacherId: string): Promise<AttendanceRecord[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const all = await this.getAllAttendance();

    return all.filter(a => subjectIds.has(a.subject_id) || a.marked_by === teacherId || a.teacher_id === teacherId);
  },

  async getAllAttendance(): Promise<AttendanceRecord[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('attendance').select('*');
      if (error) throw new Error(error.message);
      return data as AttendanceRecord[];
    }
    return getStorageData('attendance', INITIAL_ATTENDANCE);
  },

  async getStudentAttendanceSummary(studentId: string): Promise<SubjectAttendanceSummary[]> {
    const records = await this.getStudentAttendance(studentId);
    const subjects = await this.getSubjects();

    const summaryMap: Record<string, { total: number; present: number; code: string; name: string }> = {};

    subjects.forEach(s => {
      summaryMap[s.id] = { total: 0, present: 0, code: s.code, name: s.name };
    });

    records.forEach(r => {
      if (!summaryMap[r.subject_id]) {
        summaryMap[r.subject_id] = { total: 0, present: 0, code: r.subject_code || 'SUBJ', name: r.subject_name || 'Subject' };
      }
      summaryMap[r.subject_id].total += 1;
      if (r.status === 'present' || r.status === 'late') {
        summaryMap[r.subject_id].present += 1;
      }
    });

    return Object.entries(summaryMap).map(([subject_id, val]) => {
      const percentage = val.total > 0 ? Math.round((val.present / val.total) * 100) : 100;
      let status: 'safe' | 'warning' | 'critical' = 'safe';
      if (percentage < 75) status = 'critical';
      else if (percentage < 85) status = 'warning';

      return {
        subject_id,
        subject_name: val.name,
        subject_code: val.code,
        total_classes: val.total > 0 ? val.total : 15,
        present_classes: val.total > 0 ? val.present : 14,
        percentage: val.total > 0 ? percentage : 93,
        status,
      };
    });
  },

  async markAttendanceBatch(records: Array<Omit<AttendanceRecord, 'id'>>): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('attendance').upsert(records);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);

    records.forEach(rec => {
      const existingIdx = all.findIndex(a => a.student_id === rec.student_id && a.subject_id === rec.subject_id && a.date === rec.date);
      if (existingIdx !== -1) {
        all[existingIdx] = { ...all[existingIdx], ...rec, updated_at: new Date().toISOString() };
      } else {
        all.push({
          ...rec,
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          created_at: new Date().toISOString(),
        });
      }
    });

    setStorageData('attendance', all);
    return true;
  },

  async adminOverrideAttendance(recordId: string, status: 'present' | 'absent' | 'late', adminId: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase
        .from('attendance')
        .update({ status, updated_by: adminId, updated_at: new Date().toISOString() })
        .eq('id', recordId);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
    const idx = all.findIndex(a => a.id === recordId);
    if (idx !== -1) {
      all[idx].status = status;
      all[idx].updated_by = adminId;
      all[idx].updated_at = new Date().toISOString();
      setStorageData('attendance', all);
      return true;
    }
    throw new Error('Attendance record not found to apply override.');
  },

  // MARKS & RESULTS
  async getStudentMarks(studentId: string): Promise<MarkRecord[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('marks').select('*').eq('student_id', studentId);
      if (error) throw new Error(error.message);
      return data as MarkRecord[];
    }
    const all = getStorageData<MarkRecord[]>('marks', INITIAL_MARKS);
    return all.filter(m => m.student_id === studentId);
  },

  async getTeacherMarks(teacherId: string): Promise<MarkRecord[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const all = await this.getAllMarks();

    return all.filter(m => subjectIds.has(m.subject_id) || m.teacher_id === teacherId);
  },

  async getAllMarks(): Promise<MarkRecord[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('marks').select('*');
      if (error) throw new Error(error.message);
      return data as MarkRecord[];
    }
    return getStorageData('marks', INITIAL_MARKS);
  },

  async updateMarkRecord(id: string, updates: Partial<MarkRecord>, adminOrTeacherId?: string): Promise<MarkRecord> {
    const all = getStorageData<MarkRecord[]>('marks', INITIAL_MARKS);
    const idx = all.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Mark record not found.');

    const total = (updates.internal_marks ?? all[idx].internal_marks) +
                  (updates.mid_sem_marks ?? all[idx].mid_sem_marks) +
                  (updates.assignment_marks ?? all[idx].assignment_marks) +
                  (updates.practical_marks ?? all[idx].practical_marks) +
                  (updates.end_sem_marks ?? all[idx].end_sem_marks);

    let grade = 'F';
    if (total >= 90) grade = 'O';
    else if (total >= 80) grade = 'A+';
    else if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B+';
    else if (total >= 50) grade = 'B';

    const updatedRecord: MarkRecord = {
      ...all[idx],
      ...updates,
      total_marks: total,
      grade,
      updated_by: adminOrTeacherId,
    };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('marks').update(updatedRecord).eq('id', id);
      if (error) throw new Error(error.message);
    }

    all[idx] = updatedRecord;
    setStorageData('marks', all);
    return updatedRecord;
  },

  // ASSIGNMENTS
  async getAssignments(): Promise<Assignment[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as Assignment[];
    }
    return getStorageData('assignments', INITIAL_ASSIGNMENTS);
  },

  async getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const all = await this.getAssignments();

    return all.filter(a => subjectIds.has(a.subject_id) || a.teacher_id === teacherId);
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    const newAsgn: Assignment = {
      ...assignment,
      id: `asgn-${Date.now()}`,
      created_at: new Date().toISOString(),
      submission_status: 'pending',
    };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('assignments').insert(newAsgn);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Assignment[]>('assignments', INITIAL_ASSIGNMENTS);
    all.unshift(newAsgn);
    setStorageData('assignments', all);
    return newAsgn;
  },

  async deleteAssignment(id: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Assignment[]>('assignments', INITIAL_ASSIGNMENTS);
    const filtered = all.filter(a => a.id !== id);
    setStorageData('assignments', filtered);
    return true;
  },

  async getSubmissions(assignmentId?: string): Promise<AssignmentSubmission[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('assignment_submissions').select('*');
      if (assignmentId) query = query.eq('assignment_id', assignmentId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as AssignmentSubmission[];
    }
    const all = getStorageData<AssignmentSubmission[]>('submissions', INITIAL_SUBMISSIONS);
    return assignmentId ? all.filter(s => s.assignment_id === assignmentId) : all;
  },

  async submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'submission_date'>): Promise<AssignmentSubmission> {
    const all = getStorageData<AssignmentSubmission[]>('submissions', INITIAL_SUBMISSIONS);
    const existingIdx = all.findIndex(s => s.assignment_id === submission.assignment_id && s.student_id === submission.student_id);

    const newSub: AssignmentSubmission = {
      ...submission,
      id: existingIdx !== -1 ? all[existingIdx].id : `sub-${Date.now()}`,
      submission_date: new Date().toISOString(),
      status: 'submitted',
    };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('assignment_submissions').upsert(newSub);
      if (error) throw new Error(error.message);
    }

    if (existingIdx !== -1) {
      all[existingIdx] = newSub;
    } else {
      all.push(newSub);
    }
    setStorageData('submissions', all);

    return newSub;
  },

  async gradeSubmission(submissionId: string, grade: number, remarks: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({ grade, remarks, status: 'graded' })
        .eq('id', submissionId);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<AssignmentSubmission[]>('submissions', INITIAL_SUBMISSIONS);
    const idx = all.findIndex(s => s.id === submissionId);
    if (idx !== -1) {
      all[idx].grade = grade;
      all[idx].remarks = remarks;
      all[idx].status = 'graded';
      setStorageData('submissions', all);
      return true;
    }
    throw new Error('Submission record not found to grade.');
  },

  // EXAMS
  async getExams(): Promise<Exam[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('exams').select('*');
      if (error) throw new Error(error.message);
      return data as Exam[];
    }
    return getStorageData('exams', INITIAL_EXAMS);
  },

  async getTeacherExams(teacherId: string): Promise<Exam[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const all = await this.getExams();

    return all.filter(e => subjectIds.has(e.subject_id) || e.teacher_id === teacherId);
  },

  async createExam(exam: Omit<Exam, 'id'>): Promise<Exam> {
    const newExam: Exam = { ...exam, id: `exam-${Date.now()}` };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('exams').insert(newExam);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Exam[]>('exams', INITIAL_EXAMS);
    all.push(newExam);
    setStorageData('exams', all);
    return newExam;
  },

  async deleteExam(id: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Exam[]>('exams', INITIAL_EXAMS);
    const filtered = all.filter(e => e.id !== id);
    setStorageData('exams', filtered);
    return true;
  },

  // TIMETABLE
  async getTimetable(filters?: {
    course_id?: string;
    semester?: number;
    section?: string;
    teacher_id?: string;
    subject_id?: string;
    day?: string;
    room?: string;
    status?: string;
  }): Promise<TimetableSlot[]> {
    let all: TimetableSlot[] = [];

    if (isRealSupabaseConfigured()) {
      try {
        let query = supabase.from('timetable').select('*');
        if (filters?.course_id) query = query.eq('course_id', filters.course_id);
        if (filters?.semester) query = query.eq('semester', filters.semester);
        if (filters?.section) query = query.eq('section', filters.section);
        if (filters?.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
        if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
        if (filters?.day) query = query.eq('day', filters.day);
        if (filters?.room) query = query.eq('room', filters.room);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          all = data as TimetableSlot[];
        } else {
          all = getStorageData<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);
        }
      } catch {
        all = getStorageData<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);
      }
    } else {
      all = getStorageData<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);
    }

    return all.filter(slot => {
      if (filters?.course_id && slot.course_id && slot.course_id !== filters.course_id) return false;
      if (filters?.semester && slot.semester && slot.semester !== filters.semester) return false;
      if (filters?.section && slot.section && slot.section.toLowerCase() !== filters.section.toLowerCase()) return false;
      if (filters?.teacher_id && slot.teacher_id && slot.teacher_id !== filters.teacher_id) return false;
      if (filters?.subject_id && slot.subject_id && slot.subject_id !== filters.subject_id) return false;
      if (filters?.day && slot.day && slot.day !== filters.day) return false;
      if (filters?.room && slot.room && slot.room.toLowerCase() !== filters.room.toLowerCase()) return false;
      if (filters?.status && slot.status && slot.status !== filters.status) return false;
      return true;
    });
  },

  async createTimetableSlot(slotData: Omit<TimetableSlot, 'id'>, userId?: string): Promise<TimetableSlot> {
    const existingSlots = await this.getTimetable();

    // Helper: Convert "09:30" or "09:30:00" to total minutes
    const timeToMin = (t: string) => {
      if (!t) return 0;
      const parts = t.split(':').map(Number);
      return parts[0] * 60 + (parts[1] || 0);
    };

    const newStart = timeToMin(slotData.start_time);
    const newEnd = timeToMin(slotData.end_time);

    if (newStart >= newEnd) {
      throw new Error('Start time must be before end time.');
    }

    // CONFLICT DETECTION
    for (const slot of existingSlots) {
      if (slot.day !== slotData.day) continue;
      if (slot.status === 'Cancelled') continue;

      const existStart = timeToMin(slot.start_time);
      const existEnd = timeToMin(slot.end_time);

      const isOverlap = newStart < existEnd && newEnd > existStart;
      if (!isOverlap) continue;

      // 1. Teacher Collision
      if (slotData.teacher_id && slot.teacher_id === slotData.teacher_id) {
        throw new Error(
          `Timetable Conflict: Instructor "${slot.teacher_name || 'Teacher'}" is already scheduled to teach "${slot.subject_name}" in ${slot.room} on ${slot.day} during ${slot.start_time} - ${slot.end_time}.`
        );
      }

      // 2. Room Collision
      if (slotData.room && slot.room.toLowerCase().trim() === slotData.room.toLowerCase().trim()) {
        throw new Error(
          `Timetable Conflict: Room/Venue "${slot.room}" is already reserved for "${slot.subject_name}" (${slot.course_name || 'Class'}) on ${slot.day} during ${slot.start_time} - ${slot.end_time}.`
        );
      }

      // 3. Section Collision
      if (
        slotData.course_id &&
        slot.course_id === slotData.course_id &&
        slot.semester === slotData.semester &&
        slot.section.toLowerCase().trim() === slotData.section?.toLowerCase().trim()
      ) {
        throw new Error(
          `Timetable Conflict: ${slot.course_name || 'Course'} Semester ${slot.semester} Section ${slot.section} is already scheduled for "${slot.subject_name}" on ${slot.day} during ${slot.start_time} - ${slot.end_time}.`
        );
      }
    }

    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}`,
      status: slotData.status || 'Published',
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    if (isRealSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('timetable').insert(newSlot);
        if (error) console.error('Supabase create timetable error:', error.message);
      } catch (e) {
        console.error('Supabase insert exception:', e);
      }
    }

    const all = getStorageData<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);
    const existingIdx = all.findIndex(s => s.id === newSlot.id);
    if (existingIdx !== -1) {
      all[existingIdx] = newSlot;
    } else {
      all.push(newSlot);
    }
    setStorageData('timetable', all);

    return newSlot;
  },

  async updateTimetableSlot(id: string, updates: Partial<TimetableSlot>, userId?: string): Promise<TimetableSlot> {
    const existingSlots = await this.getTimetable();
    const currentIdx = existingSlots.findIndex(s => s.id === id);

    const storageSlots = getStorageData<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);
    const storageIdx = storageSlots.findIndex(s => s.id === id);
    const baseSlot = currentIdx !== -1 ? existingSlots[currentIdx] : storageIdx !== -1 ? storageSlots[storageIdx] : null;

    if (!baseSlot) throw new Error('Timetable record not found.');

    const targetSlot: TimetableSlot = { ...baseSlot, ...updates };

    const timeToMin = (t: string) => {
      if (!t) return 0;
      const parts = t.split(':').map(Number);
      return parts[0] * 60 + (parts[1] || 0);
    };

    const newStart = timeToMin(targetSlot.start_time);
    const newEnd = timeToMin(targetSlot.end_time);

    if (newStart >= newEnd) {
      throw new Error('Start time must be before end time.');
    }

    // CONFLICT DETECTION (excluding current record)
    for (const slot of existingSlots) {
      if (slot.id === id) continue;
      if (slot.day !== targetSlot.day) continue;
      if (slot.status === 'Cancelled') continue;

      const existStart = timeToMin(slot.start_time);
      const existEnd = timeToMin(slot.end_time);

      const isOverlap = newStart < existEnd && newEnd > existStart;
      if (!isOverlap) continue;

      if (targetSlot.teacher_id && slot.teacher_id === targetSlot.teacher_id) {
        throw new Error(
          `Timetable Conflict: Instructor "${slot.teacher_name || 'Teacher'}" is already scheduled to teach "${slot.subject_name}" in ${slot.room} on ${slot.day} during ${slot.start_time} - ${slot.end_time}.`
        );
      }

      if (targetSlot.room && slot.room.toLowerCase().trim() === targetSlot.room.toLowerCase().trim()) {
        throw new Error(
          `Timetable Conflict: Room/Venue "${slot.room}" is already reserved for "${slot.subject_name}" (${slot.course_name || 'Class'}) on ${slot.day} during ${slot.start_time} - ${slot.end_time}.`
        );
      }

      if (
        targetSlot.course_id &&
        slot.course_id === targetSlot.course_id &&
        slot.semester === targetSlot.semester &&
        slot.section.toLowerCase().trim() === targetSlot.section?.toLowerCase().trim()
      ) {
        throw new Error(
          `Timetable Conflict: ${slot.course_name || 'Course'} Semester ${slot.semester} Section ${slot.section} is already attending "${slot.subject_name}" on ${slot.day} during ${slot.start_time} - ${slot.end_time}.`
        );
      }
    }

    const updatedSlot: TimetableSlot = {
      ...targetSlot,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    if (isRealSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('timetable').update(updatedSlot).eq('id', id);
        if (error) console.error('Supabase update timetable error:', error.message);
      } catch (e) {
        console.error('Supabase update exception:', e);
      }
    }

    const all = getStorageData<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);
    const idx = all.findIndex(s => s.id === id);
    if (idx !== -1) {
      all[idx] = updatedSlot;
    } else {
      all.push(updatedSlot);
    }
    setStorageData('timetable', all);

    return updatedSlot;
  },

  async deleteTimetableSlot(id: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('timetable').delete().eq('id', id);
        if (error) console.error('Supabase delete error:', error.message);
      } catch (e) {
        console.error('Supabase delete exception:', e);
      }
    }

    const all = getStorageData<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);
    const filtered = all.filter(s => s.id !== id);
    setStorageData('timetable', filtered);
    return true;
  },

  // NOTICES
  async getNotices(): Promise<Notice[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as Notice[];
    }
    return getStorageData('notices', INITIAL_NOTICES);
  },

  async createNotice(notice: Omit<Notice, 'id' | 'publish_date'>): Promise<Notice> {
    const newNotice: Notice = {
      ...notice,
      id: `not-${Date.now()}`,
      publish_date: new Date().toISOString().split('T')[0],
      pinned: notice.pinned || false,
      archived: notice.archived || false,
    };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('notices').insert(newNotice);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Notice[]>('notices', INITIAL_NOTICES);
    all.unshift(newNotice);
    setStorageData('notices', all);
    return newNotice;
  },

  async deleteNotice(id: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Notice[]>('notices', INITIAL_NOTICES);
    const filtered = all.filter(n => n.id !== id);
    setStorageData('notices', filtered);
    return true;
  },

  // EVENTS
  async getEvents(): Promise<CollegeEvent[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('events').select('*');
      if (error) throw new Error(error.message);
      return data as CollegeEvent[];
    }
    return getStorageData('events', INITIAL_EVENTS);
  },

  async createEvent(event: Omit<CollegeEvent, 'id'>): Promise<CollegeEvent> {
    const newEvt: CollegeEvent = { ...event, id: `evt-${Date.now()}` };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('events').insert(newEvt);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<CollegeEvent[]>('events', INITIAL_EVENTS);
    all.push(newEvt);
    setStorageData('events', all);
    return newEvt;
  },

  async deleteEvent(id: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<CollegeEvent[]>('events', INITIAL_EVENTS);
    const filtered = all.filter(e => e.id !== id);
    setStorageData('events', filtered);
    return true;
  },

  // CERTIFICATES & VERIFICATION
  async getCertificates(studentId?: string): Promise<Certificate[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (studentId) query = query.eq('student_id', studentId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Certificate[];
    }
    const all = getStorageData<Certificate[]>('certificates', INITIAL_CERTIFICATES);
    return studentId ? all.filter(c => c.student_id === studentId) : all;
  },

  async uploadCertificate(cert: Omit<Certificate, 'id' | 'status'>): Promise<Certificate> {
    const newCert: Certificate = {
      ...cert,
      id: `cert-${Date.now()}`,
      status: 'pending',
    };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('certificates').insert(newCert);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Certificate[]>('certificates', INITIAL_CERTIFICATES);
    all.unshift(newCert);
    setStorageData('certificates', all);
    return newCert;
  },

  async updateCertificateStatus(
    id: string,
    status: 'verified' | 'rejected',
    remarks?: string,
    adminId?: string
  ): Promise<boolean> {
    const updatePayload = {
      status,
      remarks: remarks || '',
      verified_by: adminId || 'admin-user',
      verified_at: new Date().toISOString(),
    };

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('certificates').update(updatePayload).eq('id', id);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Certificate[]>('certificates', INITIAL_CERTIFICATES);
    const idx = all.findIndex(c => c.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updatePayload };
      setStorageData('certificates', all);
      return true;
    }
    throw new Error('Certificate record not found.');
  },

  async deleteCertificate(id: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<Certificate[]>('certificates', INITIAL_CERTIFICATES);
    const filtered = all.filter(c => c.id !== id);
    setStorageData('certificates', filtered);
    return true;
  },

  // RESUME
  async getStudentResume(studentId: string): Promise<ResumeData> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('resumes').select('*').eq('student_id', studentId).maybeSingle();
      if (!error && data) return data as ResumeData;
    }
    const resumes = getStorageData<ResumeData[]>('resumes', [INITIAL_RESUME]);
    const found = resumes.find(r => r.student_id === studentId);
    return found || { ...INITIAL_RESUME, student_id: studentId };
  },

  async saveStudentResume(resume: ResumeData): Promise<ResumeData> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('resumes').upsert(resume);
      if (error) throw new Error(error.message);
    }

    const resumes = getStorageData<ResumeData[]>('resumes', [INITIAL_RESUME]);
    const idx = resumes.findIndex(r => r.student_id === resume.student_id);
    if (idx !== -1) {
      resumes[idx] = resume;
    } else {
      resumes.push(resume);
    }
    setStorageData('resumes', resumes);
    return resume;
  },

  // NOTIFICATIONS
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId);
      if (error) throw new Error(error.message);
      return data as NotificationItem[];
    }
    const all = getStorageData<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    return all.filter(n => n.user_id === userId);
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    const idx = all.findIndex(n => n.id === id);
    if (idx !== -1) {
      all[idx].is_read = true;
      setStorageData('notifications', all);
      return true;
    }
    return false;
  },

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      if (error) throw new Error(error.message);
    }

    const all = getStorageData<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    all.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    setStorageData('notifications', all);
    return true;
  },

  // HOD MODULE
  async getHODs(): Promise<HODInfo[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('hods').select('*, profile:profiles(*)');
      if (error) return getStorageData('hods', INITIAL_HODS);
      return data as HODInfo[];
    }
    return getStorageData('hods', INITIAL_HODS);
  },

  async getDepartmentTeachers(department: string): Promise<Teacher[]> {
    const allTeachers = await this.getTeachers();
    return allTeachers.filter(t => t.department.toLowerCase() === department.toLowerCase());
  },

  async getDepartmentStudents(department: string): Promise<Student[]> {
    const allStudents = await this.getStudents();
    return allStudents.filter(s => s.department.toLowerCase() === department.toLowerCase());
  },

  // FEES MODULE
  async getFees(): Promise<FeeRecord[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('fees').select('*');
      if (error) return getStorageData('fees', INITIAL_FEES);
      return data as FeeRecord[];
    }
    return getStorageData('fees', INITIAL_FEES);
  },

  async getStudentFees(studentId: string): Promise<FeeRecord[]> {
    const all = await this.getFees();
    return all.filter(f => f.student_id === studentId);
  },

  async payFee(feeId: string, amountPaid: number): Promise<FeeRecord> {
    const all = getStorageData<FeeRecord[]>('fees', INITIAL_FEES);
    const idx = all.findIndex(f => f.id === feeId);
    if (idx === -1) throw new Error('Fee record not found.');

    const newPaid = all[idx].paid_amount + amountPaid;
    let status: 'paid' | 'partial' | 'pending' = 'partial';
    if (newPaid >= all[idx].total_amount) status = 'paid';

    all[idx] = {
      ...all[idx],
      paid_amount: Math.min(newPaid, all[idx].total_amount),
      status,
      paid_at: new Date().toISOString(),
      receipt_no: all[idx].receipt_no || `REC-${Date.now().toString().substr(-6)}`,
    };

    if (isRealSupabaseConfigured()) {
      await supabase.from('fees').update({
        paid_amount: all[idx].paid_amount,
        status: all[idx].status,
        paid_at: all[idx].paid_at,
        receipt_no: all[idx].receipt_no,
      }).eq('id', feeId);
    }

    setStorageData('fees', all);
    return all[idx];
  }
};
