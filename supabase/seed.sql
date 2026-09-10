-- ====================================================
-- SMART STUDENT MANAGEMENT SYSTEM - FULL DATABASE SEED SCRIPT
-- DEMO SEED DATA FOR 10 STUDENTS, 10 TEACHERS, 2 HODS, 2 ADMINS
-- ====================================================

-- 1. PROFILES SEED DATA
INSERT INTO public.profiles (id, full_name, email, role, phone, gender, dob, address)
VALUES
  -- Admins (2)
  ('a1111111-1111-4111-a111-111111111111', 'Dr. Eleanor Vance (Principal Admin)', 'admin@college.com', 'admin', '+1 555-0100', 'Female', '1975-04-12', 'Administration Block, Campus HQ'),
  ('a2222222-2222-4222-a222-222222222222', 'Prof. Marcus Thorne (System Admin)', 'admin2@college.com', 'admin', '+1 555-0101', 'Male', '1978-08-22', 'IT Infrastructure Suite, Room 102'),

  -- HODs (2)
  ('h1111111-1111-4111-h111-111111111111', 'Dr. Robert Carter (HOD CS)', 'hod.cs@college.com', 'hod', '+1 555-0200', 'Male', '1978-03-15', 'CS Department Block A-301'),
  ('h2222222-2222-4222-h222-222222222222', 'Dr. Sarah Jenkins (HOD IT)', 'hod.it@college.com', 'hod', '+1 555-0201', 'Female', '1980-07-19', 'IT Department Block B-201'),

  -- Teachers (10)
  ('t1111111-1111-4111-t111-111111111111', 'Dr. Vance (C++ Instructor)', 'teacher1@college.com', 'teacher', '+1 555-0301', 'Male', '1980-04-12', 'Faculty Quarters A-12'),
  ('t2222222-2222-4222-t222-222222222222', 'Prof. Meera Reddy (Mathematics)', 'teacher2@college.com', 'teacher', '+1 555-0302', 'Female', '1985-08-23', 'Faculty Quarters B-04'),
  ('t3333333-3333-4333-t333-333333333333', 'Dr. Alan Turing (DBMS Specialist)', 'teacher3@college.com', 'teacher', '+1 555-0303', 'Male', '1982-06-23', 'Faculty Quarters C-01'),
  ('t4444444-4444-4444-t444-444444444444', 'Prof. Grace Hopper (OS Instructor)', 'teacher4@college.com', 'teacher', '+1 555-0304', 'Female', '1984-12-09', 'Faculty Quarters A-05'),
  ('t5555555-5555-4555-t555-555555555555', 'Dr. Ken Thompson (System Prog)', 'teacher5@college.com', 'teacher', '+1 555-0305', 'Male', '1981-02-04', 'Faculty Quarters D-11'),
  ('t6666666-6666-4666-t666-666666666666', 'Prof. Barbara Liskov (Software Eng)', 'teacher6@college.com', 'teacher', '+1 555-0306', 'Female', '1983-11-07', 'Faculty Quarters B-09'),
  ('t7777777-7777-4777-t777-777777777777', 'Dr. Donald Knuth (Algorithms)', 'teacher7@college.com', 'teacher', '+1 555-0307', 'Male', '1979-01-10', 'Faculty Quarters A-01'),
  ('t8888888-8888-4888-t888-888888888888', 'Prof. Tim Berners-Lee (Web Tech)', 'teacher8@college.com', 'teacher', '+1 555-0308', 'Male', '1986-06-08', 'Faculty Quarters C-07'),
  ('t9999999-9999-4999-t999-999999999999', 'Dr. Ada Lovelace (Data Structures)', 'teacher9@college.com', 'teacher', '+1 555-0309', 'Female', '1987-12-10', 'Faculty Quarters B-02'),
  ('t0000000-0000-4000-t000-000000000000', 'Prof. Claude Shannon (Network Tech)', 'teacher10@college.com', 'teacher', '+1 555-0310', 'Male', '1982-04-30', 'Faculty Quarters D-03'),

  -- Students (10)
  ('s1111111-1111-4111-s111-111111111111', 'Alex Johnson', 'student1@college.com', 'student', '+1 555-0401', 'Male', '2003-05-14', '42 University Heights, Campus Town'),
  ('s2222222-2222-4222-s222-222222222222', 'Priya Sharma', 'priya.sharma@college.com', 'student', '+1 555-0402', 'Female', '2003-11-20', '18 Tech Hostel, North Campus'),
  ('s3333333-3333-4333-s333-333333333333', 'Rahul Patel', 'rahul.patel@college.com', 'student', '+1 555-0403', 'Male', '2002-09-03', '77 Student Row, West Campus'),
  ('s4444444-4444-4444-s444-444444444444', 'Ananya Gupta', 'ananya.gupta@college.com', 'student', '+1 555-0404', 'Female', '2003-02-18', '21 East Hostel, Campus South'),
  ('s5555555-5555-4555-s555-555555555555', 'Rohan Verma', 'rohan.verma@college.com', 'student', '+1 555-0405', 'Male', '2003-07-25', '12 University Enclave'),
  ('s6666666-6666-4666-s666-666666666666', 'Sneha Rao', 'sneha.rao@college.com', 'student', '+1 555-0406', 'Female', '2003-10-12', '45 Green Park, Campus West'),
  ('s7777777-7777-4777-s777-777777777777', 'Vikram Singh', 'vikram.singh@college.com', 'student', '+1 555-0407', 'Male', '2002-12-05', '88 Scholars Lane'),
  ('s8888888-8888-4888-s888-888888888888', 'Neha Kulkarni', 'neha.kulkarni@college.com', 'student', '+1 555-0408', 'Female', '2003-04-30', '09 Science Hostel'),
  ('s9999999-9999-4999-s999-999999999999', 'Arjun Nair', 'arjun.nair@college.com', 'student', '+1 555-0409', 'Male', '2003-08-14', '33 Tech Enclave'),
  ('s0000000-0000-4000-s000-000000000000', 'Kavya Joshi', 'kavya.joshi@college.com', 'student', '+1 555-0410', 'Female', '2003-01-22', '55 Campus View Apartments')
ON CONFLICT (id) DO NOTHING;

-- 2. COURSES SEED DATA
INSERT INTO public.courses (id, code, name, department, description, duration_years, total_semesters)
VALUES
  ('c1111111-1111-4111-c111-111111111111', 'CSE-BTECH', 'B.Tech Computer Science & Engineering', 'Computer Science', 'Four-year undergraduate degree in computer engineering & software systems.', 4, 8),
  ('c2222222-2222-4222-c222-222222222222', 'IT-BTECH', 'B.Tech Information Technology', 'Information Technology', 'Undergraduate program covering cloud architectures, network security, and enterprise IT.', 4, 8),
  ('c3333333-3333-4333-c333-333333333333', 'ECE-BTECH', 'B.Tech Electronics & Communication', 'Electronics', 'Four-year degree in embedded systems, signal processing, and telecommunications.', 4, 8)
ON CONFLICT (id) DO NOTHING;

-- 3. TEACHERS SEED DATA
INSERT INTO public.teachers (id, profile_id, teacher_id_code, department, designation)
VALUES
  ('tch-001', 't1111111-1111-4111-t111-111111111111', 'TCH-1001', 'Computer Science', 'Associate Professor'),
  ('tch-002', 't2222222-2222-4222-t222-222222222222', 'TCH-1002', 'Computer Science', 'Assistant Professor'),
  ('tch-003', 't3333333-3333-4333-t333-333333333333', 'TCH-1003', 'Computer Science', 'Professor'),
  ('tch-004', 't4444444-4444-4444-t444-444444444444', 'TCH-1004', 'Computer Science', 'Assistant Professor'),
  ('tch-005', 't5555555-5555-4555-t555-555555555555', 'TCH-1005', 'Computer Science', 'Senior Lecturer'),
  ('tch-006', 't6666666-6666-4666-t666-666666666666', 'TCH-1006', 'Information Technology', 'Associate Professor'),
  ('tch-007', 't7777777-7777-4777-t777-777777777777', 'TCH-1007', 'Information Technology', 'Professor'),
  ('tch-008', 't8888888-8888-4888-t888-888888888888', 'TCH-1008', 'Information Technology', 'Assistant Professor'),
  ('tch-009', 't9999999-9999-4999-t999-999999999999', 'TCH-1009', 'Electronics', 'Assistant Professor'),
  ('tch-010', 't0000000-0000-4000-t000-000000000000', 'TCH-1010', 'Electronics', 'Senior Lecturer')
ON CONFLICT (id) DO NOTHING;

-- 4. STUDENTS SEED DATA
INSERT INTO public.students (id, profile_id, student_id_code, course_id, department, branch, semester, section, roll_number, admission_year)
VALUES
  ('std-001', 's1111111-1111-4111-s111-111111111111', 'STD-1001', 'c1111111-1111-4111-c111-111111111111', 'Computer Science', 'CSE', 5, 'A', '23CS101', 2023),
  ('std-002', 's2222222-2222-4222-s222-222222222222', 'STD-1002', 'c1111111-1111-4111-c111-111111111111', 'Computer Science', 'CSE', 5, 'A', '23CS102', 2023),
  ('std-003', 's3333333-3333-4333-s333-333333333333', 'STD-1003', 'c1111111-1111-4111-c111-111111111111', 'Computer Science', 'CSE', 5, 'A', '23CS103', 2023),
  ('std-004', 's4444444-4444-4444-s444-444444444444', 'STD-1004', 'c1111111-1111-4111-c111-111111111111', 'Computer Science', 'CSE', 5, 'B', '23CS104', 2023),
  ('std-005', 's5555555-5555-4555-s555-555555555555', 'STD-1005', 'c1111111-1111-4111-c111-111111111111', 'Computer Science', 'CSE', 5, 'B', '23CS105', 2023),
  ('std-006', 's6666666-6666-4666-s666-666666666666', 'STD-1006', 'c2222222-2222-4222-c222-222222222222', 'Information Technology', 'IT', 5, 'A', '23IT101', 2023),
  ('std-007', 's7777777-7777-4777-s777-777777777777', 'STD-1007', 'c2222222-2222-4222-c222-222222222222', 'Information Technology', 'IT', 5, 'A', '23IT102', 2023),
  ('std-008', 's8888888-8888-4888-s888-888888888888', 'STD-1008', 'c2222222-2222-4222-c222-222222222222', 'Information Technology', 'IT', 5, 'B', '23IT103', 2023),
  ('std-009', 's9999999-9999-4999-s999-999999999999', 'STD-1009', 'c3333333-3333-4333-c333-333333333333', 'Electronics', 'ECE', 5, 'A', '23ECE101', 2023),
  ('std-010', 's0000000-0000-4000-s000-000000000000', 'STD-1010', 'c3333333-3333-4333-c333-333333333333', 'Electronics', 'ECE', 5, 'A', '23ECE102', 2023)
ON CONFLICT (id) DO NOTHING;

-- 5. SUBJECTS SEED DATA
INSERT INTO public.subjects (id, code, name, credits, course_id, semester, teacher_id)
VALUES
  ('subj-cpp', 'CS501', 'C++ Programming', 4, 'c1111111-1111-4111-c111-111111111111', 5, 'tch-001'),
  ('subj-math', 'MA502', 'Discrete Mathematics', 4, 'c1111111-1111-4111-c111-111111111111', 5, 'tch-002'),
  ('subj-dbms', 'CS503', 'Database Management Systems (DBMS)', 4, 'c1111111-1111-4111-c111-111111111111', 5, 'tch-003'),
  ('subj-os', 'CS504', 'Operating Systems Concepts', 4, 'c1111111-1111-4111-c111-111111111111', 5, 'tch-004'),
  ('subj-web', 'CS505', 'React & Web Architecture', 4, 'c2222222-2222-4222-c222-222222222222', 5, 'tch-008')
ON CONFLICT (id) DO NOTHING;

-- 6. TEACHER SUBJECT ALLOCATIONS
INSERT INTO public.teacher_subjects (id, teacher_id, subject_id)
VALUES
  ('ts-001', 'tch-001', 'subj-cpp'),
  ('ts-002', 'tch-002', 'subj-math'),
  ('ts-003', 'tch-003', 'subj-dbms'),
  ('ts-004', 'tch-004', 'subj-os'),
  ('ts-005', 'tch-008', 'subj-web')
ON CONFLICT (id) DO NOTHING;

-- 7. NOTICES SEED DATA
INSERT INTO public.notices (id, title, description, category, priority, publish_date, expiry_date, pinned, archived)
VALUES
  ('not-001', 'Mid-Semester Examination Schedule Released', 'The finalized mid-semester exam datesheet for CS & IT departments has been published by HOD Office. Examinations commence on Oct 1, 2026.', 'Exam', 'Urgent', '2026-09-06', '2026-10-15', true, false),
  ('not-002', 'Annual Campus Placement Drive 2026 Registration', 'Top technology companies including Microsoft, Google, and Amazon are visiting campus for 2027 batch recruitment. Register your updated resume before Sept 25.', 'Placement', 'High', '2026-09-08', '2026-09-25', true, false),
  ('not-003', 'Special Industry Seminar: AI & Cloud Systems Architecture', 'Guest speaker session by Senior Cloud Architect from AWS on modern distributed systems and container orchestration.', 'Academic', 'Normal', '2026-09-09', '2026-09-22', false, false),
  ('not-004', 'Library Clearance & Fee Settlement Notice', 'All 5th and 7th-semester students are instructed to clear overdue library books and tuition balances prior to hall ticket issuance.', 'General', 'Normal', '2026-09-05', '2026-09-30', false, false)
ON CONFLICT (id) DO NOTHING;
