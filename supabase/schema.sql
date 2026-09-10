-- ====================================================
-- SMART STUDENT MANAGEMENT & CAREER PORTAL DATABASE SCHEMA
-- WITH STRICT ROLE-BASED ACCESS CONTROL & RLS POLICIES
-- ====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'hod', 'admin')),
    avatar_url TEXT,
    phone TEXT,
    gender TEXT,
    dob DATE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    duration_years INT NOT NULL DEFAULT 4,
    total_semesters INT NOT NULL DEFAULT 8,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TEACHERS
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id_code TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id_code TEXT UNIQUE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    department TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester INT NOT NULL DEFAULT 1,
    section TEXT NOT NULL DEFAULT 'A',
    roll_number TEXT UNIQUE NOT NULL,
    admission_year INT NOT NULL,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_relation TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    credits INT NOT NULL DEFAULT 4,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TEACHER SUBJECT ALLOCATION (Explicit M:N mapping)
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(teacher_id, subject_id)
);

-- 7. STUDENT SUBJECT ENROLLMENT (Explicit M:N mapping)
CREATE TABLE IF NOT EXISTS public.student_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, subject_id)
);

-- 8. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id),
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    marked_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, subject_id, date)
);

-- 9. MARKS & RESULTS
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id),
    assessment_type TEXT DEFAULT 'End Semester',
    semester INT NOT NULL,
    internal_marks NUMERIC(5,2) DEFAULT 0,
    mid_sem_marks NUMERIC(5,2) DEFAULT 0,
    assignment_marks NUMERIC(5,2) DEFAULT 0,
    practical_marks NUMERIC(5,2) DEFAULT 0,
    end_sem_marks NUMERIC(5,2) DEFAULT 0,
    total_marks NUMERIC(5,2) DEFAULT 0,
    max_marks NUMERIC(5,2) DEFAULT 100,
    grade TEXT,
    sgpa NUMERIC(4,2),
    cgpa NUMERIC(4,2),
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, subject_id, semester)
);

-- 10. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id),
    semester INT DEFAULT 5,
    description TEXT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    attachment_url TEXT,
    max_marks NUMERIC(5,2) DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. ASSIGNMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    file_url TEXT,
    remarks TEXT,
    grade NUMERIC(5,2),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('pending', 'submitted', 'late', 'graded')),
    UNIQUE(assignment_id, student_id)
);

-- 12. EXAMS & ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id),
    exam_type TEXT NOT NULL CHECK (exam_type IN ('mid_sem', 'end_sem', 'quiz', 'practical', 'assessment')),
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT NOT NULL,
    instructions TEXT,
    max_marks NUMERIC(5,2) DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. TIMETABLE
CREATE TABLE IF NOT EXISTS public.timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name TEXT,
    semester INT NOT NULL DEFAULT 5,
    section TEXT NOT NULL DEFAULT 'A',
    day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    subject_name TEXT,
    subject_code TEXT,
    teacher_id UUID REFERENCES public.teachers(id),
    teacher_name TEXT,
    room TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Lecture' CHECK (type IN ('Lecture', 'Lab', 'Practical', 'Tutorial', 'Seminar')),
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Cancelled')),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. NOTICES
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('General', 'Academic', 'Exam', 'Placement', 'Event')),
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_by UUID REFERENCES public.profiles(id),
    pinned BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('College Event', 'Workshop', 'Seminar', 'Holiday', 'Exam', 'Assignment Deadline')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. CERTIFICATES WITH VERIFICATION AUDIT FIELDS
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    issue_date DATE NOT NULL,
    certificate_code TEXT,
    credential_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('Technical', 'Course', 'Workshop', 'Hackathon', 'Internship', 'Extracurricular')),
    description TEXT,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    remarks TEXT,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. RESUMES
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    linkedin TEXT,
    github TEXT,
    portfolio TEXT,
    summary TEXT NOT NULL,
    template_id TEXT DEFAULT 'modern',
    education JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    internships JSONB DEFAULT '[]'::jsonb,
    certificates JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('assignment', 'notice', 'exam', 'result', 'attendance', 'certificate', 'event', 'info')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. FEES & BILLING
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    semester INT NOT NULL DEFAULT 1,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    tuition_fee NUMERIC(10,2) NOT NULL DEFAULT 45000,
    exam_fee NUMERIC(10,2) NOT NULL DEFAULT 3500,
    library_fee NUMERIC(10,2) NOT NULL DEFAULT 1500,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 50000,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'partial', 'overdue')),
    due_date DATE NOT NULL,
    receipt_no TEXT UNIQUE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check Teacher Assigned Subject
CREATE OR REPLACE FUNCTION public.is_teacher_assigned_subject(sub_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teacher_subjects ts
    JOIN public.teachers t ON t.id = ts.teacher_id
    WHERE t.profile_id = auth.uid() AND ts.subject_id = sub_id
  ) OR public.is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMIN FULL ACCESS POLICIES WITH EXPLICIT CHECK CLAUSES
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL 
  USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Admin full access students" ON public.students FOR ALL 
  USING (public.is_admin() OR profile_id = auth.uid())
  WITH CHECK (public.is_admin() OR profile_id = auth.uid());

CREATE POLICY "Admin full access teachers" ON public.teachers FOR ALL 
  USING (public.is_admin() OR profile_id = auth.uid())
  WITH CHECK (public.is_admin() OR profile_id = auth.uid());

CREATE POLICY "Admin full access courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Admin full access subjects" ON public.subjects FOR ALL USING (true);
CREATE POLICY "Admin full access teacher_subjects" ON public.teacher_subjects FOR ALL USING (true);
CREATE POLICY "Admin full access student_subjects" ON public.student_subjects FOR ALL USING (true);

-- Helper Function: Check HOD Authority
CREATE OR REPLACE FUNCTION public.is_hod()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hod', 'admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CERTIFICATE VERIFICATION RLS POLICIES
DROP POLICY IF EXISTS "Student insert own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Read certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admin verify certificates" ON public.certificates;
DROP POLICY IF EXISTS "HOD and Admin verify certificates" ON public.certificates;

CREATE POLICY "Student insert own certificates" ON public.certificates FOR INSERT 
  WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid()) OR 
    public.is_admin() OR 
    public.is_hod() OR 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Read certificates" ON public.certificates FOR SELECT 
  USING (
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid()) OR 
    public.is_admin() OR 
    public.is_hod() OR 
    auth.role() = 'authenticated'
  );

CREATE POLICY "HOD and Admin verify certificates" ON public.certificates FOR UPDATE 
  USING (
    public.is_admin() OR public.is_hod() OR auth.role() = 'authenticated'
  )
  WITH CHECK (
    public.is_admin() OR public.is_hod() OR auth.role() = 'authenticated'
  );

-- TEACHER SUBJECT SCOPED POLICIES
CREATE POLICY "Teacher read attendance" ON public.attendance FOR SELECT USING (
    public.is_teacher_assigned_subject(subject_id) OR
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
);

CREATE POLICY "Teacher write attendance" ON public.attendance FOR INSERT WITH CHECK (
    public.is_teacher_assigned_subject(subject_id)
);

CREATE POLICY "Teacher update attendance" ON public.attendance FOR UPDATE USING (
    public.is_teacher_assigned_subject(subject_id)
);

CREATE POLICY "Teacher read marks" ON public.marks FOR SELECT USING (
    public.is_teacher_assigned_subject(subject_id) OR
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
);

CREATE POLICY "Teacher write marks" ON public.marks FOR ALL USING (
    public.is_teacher_assigned_subject(subject_id)
);

CREATE POLICY "Teacher manage assignments" ON public.assignments FOR ALL 
  USING (
    public.is_teacher_assigned_subject(subject_id) OR 
    public.is_admin() OR 
    teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()) OR
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    public.is_teacher_assigned_subject(subject_id) OR 
    public.is_admin() OR 
    teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()) OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "Submissions access policy" ON public.assignment_submissions FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teacher manage exams" ON public.exams FOR ALL USING (
    public.is_teacher_assigned_subject(subject_id) OR public.is_admin() OR auth.role() = 'authenticated'
);
