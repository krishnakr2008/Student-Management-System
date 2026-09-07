export type UserRole = 'student' | 'teacher' | 'admin';

export type AssessmentType =
  | 'Assignment'
  | 'Quiz'
  | 'Internal'
  | 'Mid Semester'
  | 'Practical'
  | 'End Semester';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  created_at?: string;
}

export interface Student {
  id: string;
  profile_id: string;
  student_id_code: string;
  course_id?: string;
  course_name?: string;
  department: string;
  branch: string;
  semester: number;
  section: string;
  roll_number: string;
  admission_year: number;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relation?: string;
  profile?: UserProfile;
}

export interface Teacher {
  id: string;
  profile_id: string;
  teacher_id_code: string;
  department: string;
  designation: string;
  profile?: UserProfile;
  assigned_subjects?: Subject[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  description?: string;
  duration_years: number;
  total_semesters: number;
  active: boolean;
  student_count?: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  course_id: string;
  semester: number;
  teacher_id?: string;
  teacher_name?: string;
}

export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  created_at?: string;
}

export interface StudentSubject {
  id: string;
  student_id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name?: string;
  roll_number?: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  teacher_id?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubjectAttendanceSummary {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  total_classes: number;
  present_classes: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
}

export interface MarkRecord {
  id: string;
  student_id: string;
  student_name?: string;
  roll_number?: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  teacher_id?: string;
  assessment_type?: AssessmentType;
  semester: number;
  internal_marks: number;
  mid_sem_marks: number;
  assignment_marks: number;
  practical_marks: number;
  end_sem_marks: number;
  total_marks: number;
  max_marks: number;
  grade: string;
  sgpa: number;
  cgpa: number;
  updated_by?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  course_id?: string;
  semester?: number;
  description: string;
  teacher_id: string;
  teacher_name?: string;
  created_at: string;
  due_date: string;
  attachment_url?: string;
  max_marks: number;
  submission_status?: 'pending' | 'submitted' | 'late' | 'graded';
  my_submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  roll_number?: string;
  submission_date: string;
  file_url?: string;
  remarks?: string;
  grade?: number;
  status: 'pending' | 'submitted' | 'late' | 'graded';
}

export interface Exam {
  id: string;
  name: string;
  subject_id: string;
  subject_name?: string;
  teacher_id?: string;
  exam_type: 'mid_sem' | 'end_sem' | 'quiz' | 'practical' | 'assessment';
  exam_date: string;
  start_time: string;
  end_time: string;
  duration?: string;
  room: string;
  instructions?: string;
  max_marks: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;
  end_time: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  teacher_id?: string;
  teacher_name?: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: 'General' | 'Academic' | 'Exam' | 'Placement' | 'Event';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  publish_date: string;
  expiry_date?: string;
  created_by?: string;
  author_name?: string;
  pinned: boolean;
  archived: boolean;
  is_read?: boolean;
}

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'College Event' | 'Workshop' | 'Seminar' | 'Holiday' | 'Exam' | 'Assignment Deadline';
  start_date: string;
  end_date: string;
  location: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  student_name?: string;
  name: string;
  organization: string;
  issue_date: string;
  certificate_code?: string;
  credential_url?: string;
  category: 'Technical' | 'Course' | 'Workshop' | 'Hackathon' | 'Internship' | 'Extracurricular';
  description?: string;
  file_url?: string;
  status: 'pending' | 'verified' | 'rejected';
  remarks?: string;
}

export interface ResumeData {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  template_id: 'modern' | 'minimalist' | 'academic' | 'executive';
  education: Array<{
    id: string;
    degree: string;
    university: string;
    course: string;
    start_year: string;
    end_year: string;
    grade: string;
  }>;
  skills: Array<{
    id: string;
    category: string;
    items: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    github_link?: string;
    demo_link?: string;
  }>;
  internships: Array<{
    id: string;
    organization: string;
    role: string;
    duration: string;
    description: string;
    technologies: string[];
  }>;
  certificates: Array<{
    id: string;
    name: string;
    organization: string;
    date: string;
    credential_url?: string;
  }>;
  achievements: string[];
  languages: string[];
}

export interface CareerRoleRecommendation {
  role: string;
  match_percentage: number;
  description: string;
  matched_skills: string[];
  missing_skills: string[];
  roadmap_phases: Array<{
    phase: number;
    title: string;
    topics: string[];
    milestone: string;
  }>;
  suggested_projects: Array<{
    id: string;
    name: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    technologies: string[];
    features: string[];
    skills_gained: string[];
  }>;
  interview_questions: Array<{
    id: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    question: string;
    answer: string;
    topic: string;
  }>;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'notice' | 'exam' | 'result' | 'attendance' | 'certificate' | 'event' | 'info';
  is_read: boolean;
  created_at: string;
}
