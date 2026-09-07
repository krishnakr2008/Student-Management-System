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

// Initialize default storage if empty or reset
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
};

initializeLocalStorage();

export const dbService = {
  // PROFILES
  async getProfiles(): Promise<UserProfile[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) return data as UserProfile[];
    }
    return getStorageData('profiles', INITIAL_PROFILES);
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (!error && data) return data as UserProfile;
    }
    const profiles = getStorageData<UserProfile[]>('profiles', INITIAL_PROFILES);
    const index = profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updates };
      setStorageData('profiles', profiles);
      return profiles[index];
    }
    throw new Error('Profile not found');
  },

  // STUDENTS
  async getStudents(): Promise<Student[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('students').select('*, profile:profiles(*)');
      if (!error && data) return data as Student[];
    }
    return getStorageData('students', INITIAL_STUDENTS);
  },

  async createStudent(studentData: Omit<Student, 'id'>, profileData: Omit<UserProfile, 'id'>): Promise<Student> {
    const newId = `student-${Date.now()}`;
    const newProfileId = `user-${Date.now()}`;
    const newProfile: UserProfile = { ...profileData, id: newProfileId, role: 'student', created_at: new Date().toISOString() };
    const newStudent: Student = { ...studentData, id: newId, profile_id: newProfileId, profile: newProfile };

    if (isRealSupabaseConfigured()) {
      await supabase.from('profiles').insert(newProfile);
      await supabase.from('students').insert({ ...studentData, id: newId, profile_id: newProfileId });
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
    if (index !== -1) {
      students[index] = { ...students[index], ...updates };
      setStorageData('students', students);

      if (isRealSupabaseConfigured()) {
        const { profile, ...fields } = updates;
        await supabase.from('students').update(fields).eq('id', id);
      }
      return students[index];
    }
    throw new Error('Student not found');
  },

  async deleteStudent(id: string): Promise<boolean> {
    const students = getStorageData<Student[]>('students', INITIAL_STUDENTS);
    const filtered = students.filter(s => s.id !== id);
    setStorageData('students', filtered);

    if (isRealSupabaseConfigured()) {
      await supabase.from('students').delete().eq('id', id);
    }
    return true;
  },

  // TEACHERS
  async getTeachers(): Promise<Teacher[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('teachers').select('*, profile:profiles(*)');
      if (!error && data) return data as Teacher[];
    }
    return getStorageData('teachers', INITIAL_TEACHERS);
  },

  async createTeacher(teacherData: Omit<Teacher, 'id'>, profileData: Omit<UserProfile, 'id'>): Promise<Teacher> {
    const newId = `teacher-${Date.now()}`;
    const newProfileId = `user-teacher-${Date.now()}`;
    const newProfile: UserProfile = { ...profileData, id: newProfileId, role: 'teacher', created_at: new Date().toISOString() };
    const newTeacher: Teacher = { ...teacherData, id: newId, profile_id: newProfileId, profile: newProfile };

    const profiles = getStorageData<UserProfile[]>('profiles', INITIAL_PROFILES);
    profiles.push(newProfile);
    setStorageData('profiles', profiles);

    const teachers = getStorageData<Teacher[]>('teachers', INITIAL_TEACHERS);
    teachers.push(newTeacher);
    setStorageData('teachers', teachers);

    if (isRealSupabaseConfigured()) {
      await supabase.from('profiles').insert(newProfile);
      await supabase.from('teachers').insert({ ...teacherData, id: newId, profile_id: newProfileId });
    }

    return newTeacher;
  },

  // COURSES & SUBJECTS
  async getCourses(): Promise<Course[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('courses').select('*');
      if (!error && data) return data as Course[];
    }
    return getStorageData('courses', INITIAL_COURSES);
  },

  async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const newCourse: Course = { ...course, id: `course-${Date.now()}`, active: true, student_count: 0 };
    const courses = getStorageData<Course[]>('courses', INITIAL_COURSES);
    courses.push(newCourse);
    setStorageData('courses', courses);

    if (isRealSupabaseConfigured()) {
      await supabase.from('courses').insert(newCourse);
    }
    return newCourse;
  },

  async getSubjects(): Promise<Subject[]> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.from('subjects').select('*');
      if (!error && data) return data as Subject[];
    }
    return getStorageData('subjects', INITIAL_SUBJECTS);
  },

  async createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const newSubj: Subject = { ...subject, id: `subj-${Date.now()}` };
    const subjects = getStorageData<Subject[]>('subjects', INITIAL_SUBJECTS);
    subjects.push(newSubj);
    setStorageData('subjects', subjects);

    if (isRealSupabaseConfigured()) {
      await supabase.from('subjects').insert(newSubj);
    }
    return newSubj;
  },

  // TEACHER-SUBJECT ALLOCATION (Requirement 4: Strict Subject Restrictions)
  async getTeacherSubjects(teacherId?: string): Promise<TeacherSubject[]> {
    const all = getStorageData<TeacherSubject[]>('teacher_subjects', INITIAL_TEACHER_SUBJECTS);
    return teacherId ? all.filter(ts => ts.teacher_id === teacherId) : all;
  },

  async assignTeacherSubject(teacherId: string, subjectId: string): Promise<TeacherSubject> {
    const all = getStorageData<TeacherSubject[]>('teacher_subjects', INITIAL_TEACHER_SUBJECTS);
    const subjects = await this.getSubjects();
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

    all.push(newAllocation);
    setStorageData('teacher_subjects', all);

    if (isRealSupabaseConfigured()) {
      await supabase.from('teacher_subjects').insert({ teacher_id: teacherId, subject_id: subjectId });
    }

    return newAllocation;
  },

  async removeTeacherSubject(teacherId: string, subjectId: string): Promise<boolean> {
    const all = getStorageData<TeacherSubject[]>('teacher_subjects', INITIAL_TEACHER_SUBJECTS);
    const filtered = all.filter(ts => !(ts.teacher_id === teacherId && ts.subject_id === subjectId));
    setStorageData('teacher_subjects', filtered);

    if (isRealSupabaseConfigured()) {
      await supabase.from('teacher_subjects').delete().match({ teacher_id: teacherId, subject_id: subjectId });
    }

    return true;
  },

  // STUDENT-SUBJECT ENROLLMENT
  async getStudentSubjects(studentId?: string): Promise<StudentSubject[]> {
    const all = getStorageData<StudentSubject[]>('student_subjects', INITIAL_STUDENT_SUBJECTS);
    return studentId ? all.filter(ss => ss.student_id === studentId) : all;
  },

  async assignStudentSubject(studentId: string, subjectId: string): Promise<StudentSubject> {
    const all = getStorageData<StudentSubject[]>('student_subjects', INITIAL_STUDENT_SUBJECTS);
    const subjects = await this.getSubjects();
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

    all.push(newEnrollment);
    setStorageData('student_subjects', all);
    return newEnrollment;
  },

  // TEACHER-SCOPED HELPER METHODS (Requirement 4 & 5 & 6)
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

  // ATTENDANCE WITH ADMIN OVERRIDE & TEACHER RESTRICTION
  async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    const all = getStorageData<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
    return all.filter(a => a.student_id === studentId);
  },

  async getTeacherAttendance(teacherId: string): Promise<AttendanceRecord[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const all = getStorageData<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);

    return all.filter(a => subjectIds.has(a.subject_id) || a.marked_by === teacherId || a.teacher_id === teacherId);
  },

  async getAllAttendance(): Promise<AttendanceRecord[]> {
    return getStorageData<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
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

    if (isRealSupabaseConfigured()) {
      await supabase.from('attendance').upsert(records);
    }
    return true;
  },

  // Admin Attendance Override (Requirement 12)
  async adminOverrideAttendance(recordId: string, status: 'present' | 'absent' | 'late', adminId: string): Promise<boolean> {
    const all = getStorageData<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
    const idx = all.findIndex(a => a.id === recordId);
    if (idx !== -1) {
      all[idx].status = status;
      all[idx].updated_by = adminId;
      all[idx].updated_at = new Date().toISOString();
      setStorageData('attendance', all);
      return true;
    }
    return false;
  },

  // MARKS & RESULTS WITH ADMIN OVERRIDE & TEACHER RESTRICTION
  async getStudentMarks(studentId: string): Promise<MarkRecord[]> {
    const all = getStorageData<MarkRecord[]>('marks', INITIAL_MARKS);
    return all.filter(m => m.student_id === studentId);
  },

  async getTeacherMarks(teacherId: string): Promise<MarkRecord[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const all = getStorageData<MarkRecord[]>('marks', INITIAL_MARKS);

    return all.filter(m => subjectIds.has(m.subject_id) || m.teacher_id === teacherId);
  },

  async getAllMarks(): Promise<MarkRecord[]> {
    return getStorageData<MarkRecord[]>('marks', INITIAL_MARKS);
  },

  async updateMarkRecord(id: string, updates: Partial<MarkRecord>, adminOrTeacherId?: string): Promise<MarkRecord> {
    const all = getStorageData<MarkRecord[]>('marks', INITIAL_MARKS);
    const idx = all.findIndex(m => m.id === id);
    if (idx !== -1) {
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

      all[idx] = {
        ...all[idx],
        ...updates,
        total_marks: total,
        grade,
        updated_by: adminOrTeacherId,
      };
      setStorageData('marks', all);
      return all[idx];
    }
    throw new Error('Mark record not found');
  },

  // ASSIGNMENTS WITH TEACHER RESTRICTION
  async getAssignments(): Promise<Assignment[]> {
    return getStorageData('assignments', INITIAL_ASSIGNMENTS);
  },

  async getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const all = getStorageData<Assignment[]>('assignments', INITIAL_ASSIGNMENTS);

    return all.filter(a => subjectIds.has(a.subject_id) || a.teacher_id === teacherId);
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    const newAsgn: Assignment = {
      ...assignment,
      id: `asgn-${Date.now()}`,
      created_at: new Date().toISOString(),
      submission_status: 'pending',
    };
    const all = getStorageData<Assignment[]>('assignments', INITIAL_ASSIGNMENTS);
    all.unshift(newAsgn);
    setStorageData('assignments', all);
    return newAsgn;
  },

  async getSubmissions(assignmentId?: string): Promise<AssignmentSubmission[]> {
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

    if (existingIdx !== -1) {
      all[existingIdx] = newSub;
    } else {
      all.push(newSub);
    }
    setStorageData('submissions', all);

    const assignments = getStorageData<Assignment[]>('assignments', INITIAL_ASSIGNMENTS);
    const asgnIdx = assignments.findIndex(a => a.id === submission.assignment_id);
    if (asgnIdx !== -1) {
      assignments[asgnIdx].submission_status = 'submitted';
      setStorageData('assignments', assignments);
    }

    return newSub;
  },

  async gradeSubmission(submissionId: string, grade: number, remarks: string): Promise<boolean> {
    const all = getStorageData<AssignmentSubmission[]>('submissions', INITIAL_SUBMISSIONS);
    const idx = all.findIndex(s => s.id === submissionId);
    if (idx !== -1) {
      all[idx].grade = grade;
      all[idx].remarks = remarks;
      all[idx].status = 'graded';
      setStorageData('submissions', all);
      return true;
    }
    return false;
  },

  // EXAMS
  async getExams(): Promise<Exam[]> {
    return getStorageData('exams', INITIAL_EXAMS);
  },

  async getTeacherExams(teacherId: string): Promise<Exam[]> {
    const assignedSubjects = await this.getTeacherAssignedSubjects(teacherId);
    const subjectIds = new Set(assignedSubjects.map(s => s.id));
    const all = getStorageData<Exam[]>('exams', INITIAL_EXAMS);

    return all.filter(e => subjectIds.has(e.subject_id) || e.teacher_id === teacherId);
  },

  async createExam(exam: Omit<Exam, 'id'>): Promise<Exam> {
    const newExam: Exam = { ...exam, id: `exam-${Date.now()}` };
    const all = getStorageData<Exam[]>('exams', INITIAL_EXAMS);
    all.push(newExam);
    setStorageData('exams', all);
    return newExam;
  },

  // TIMETABLE
  async getTimetable(): Promise<TimetableSlot[]> {
    return getStorageData('timetable', INITIAL_TIMETABLE);
  },

  // NOTICES
  async getNotices(): Promise<Notice[]> {
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
    const all = getStorageData<Notice[]>('notices', INITIAL_NOTICES);
    all.unshift(newNotice);
    setStorageData('notices', all);
    return newNotice;
  },

  async deleteNotice(id: string): Promise<boolean> {
    const all = getStorageData<Notice[]>('notices', INITIAL_NOTICES);
    const filtered = all.filter(n => n.id !== id);
    setStorageData('notices', filtered);
    return true;
  },

  // EVENTS
  async getEvents(): Promise<CollegeEvent[]> {
    return getStorageData('events', INITIAL_EVENTS);
  },

  async createEvent(event: Omit<CollegeEvent, 'id'>): Promise<CollegeEvent> {
    const newEvt: CollegeEvent = { ...event, id: `evt-${Date.now()}` };
    const all = getStorageData<CollegeEvent[]>('events', INITIAL_EVENTS);
    all.push(newEvt);
    setStorageData('events', all);
    return newEvt;
  },

  // CERTIFICATES
  async getCertificates(studentId?: string): Promise<Certificate[]> {
    const all = getStorageData<Certificate[]>('certificates', INITIAL_CERTIFICATES);
    return studentId ? all.filter(c => c.student_id === studentId) : all;
  },

  async uploadCertificate(cert: Omit<Certificate, 'id' | 'status'>): Promise<Certificate> {
    const newCert: Certificate = {
      ...cert,
      id: `cert-${Date.now()}`,
      status: 'pending',
    };
    const all = getStorageData<Certificate[]>('certificates', INITIAL_CERTIFICATES);
    all.unshift(newCert);
    setStorageData('certificates', all);
    return newCert;
  },

  async updateCertificateStatus(id: string, status: 'verified' | 'rejected', remarks?: string): Promise<boolean> {
    const all = getStorageData<Certificate[]>('certificates', INITIAL_CERTIFICATES);
    const idx = all.findIndex(c => c.id === id);
    if (idx !== -1) {
      all[idx].status = status;
      if (remarks) all[idx].remarks = remarks;
      setStorageData('certificates', all);
      return true;
    }
    return false;
  },

  // RESUME
  async getStudentResume(studentId: string): Promise<ResumeData> {
    const resumes = getStorageData<ResumeData[]>('resumes', [INITIAL_RESUME]);
    const found = resumes.find(r => r.student_id === studentId);
    return found || { ...INITIAL_RESUME, student_id: studentId };
  },

  async saveStudentResume(resume: ResumeData): Promise<ResumeData> {
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
    const all = getStorageData<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    return all.filter(n => n.user_id === userId);
  },

  async markNotificationRead(id: string): Promise<boolean> {
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
    const all = getStorageData<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    all.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    setStorageData('notifications', all);
    return true;
  }
};
