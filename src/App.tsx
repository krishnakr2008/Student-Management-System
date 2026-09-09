import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { StudentLogin } from './pages/auth/StudentLogin';
import { TeacherLogin } from './pages/auth/TeacherLogin';
import { HodLogin } from './pages/auth/HodLogin';
import { AdminLogin } from './pages/auth/AdminLogin';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { DashboardLayout } from './layouts/DashboardLayout';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentIdCard } from './pages/student/StudentIdCard';
import { StudentFees } from './pages/student/StudentFees';
import { StudentAcademics } from './pages/student/StudentAcademics';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentMarks } from './pages/student/StudentMarks';
import { StudentAnalytics } from './pages/student/StudentAnalytics';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { StudentExams } from './pages/student/StudentExams';
import { StudentNotices } from './pages/student/StudentNotices';
import { StudentEvents } from './pages/student/StudentEvents';
import { StudentCertificates } from './pages/student/StudentCertificates';
import { StudentResumeBuilder } from './pages/student/StudentResumeBuilder';
import { StudentCareerAssistant } from './pages/student/StudentCareerAssistant';
import { StudentNotifications } from './pages/student/StudentNotifications';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherAttendance } from './pages/teacher/TeacherAttendance';
import { TeacherMarks } from './pages/teacher/TeacherMarks';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { TeacherStudents } from './pages/teacher/TeacherStudents';
import { TeacherTimetable } from './pages/teacher/TeacherTimetable';

// HOD Pages
import { HodDashboard } from './pages/hod/HodDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminTeachers } from './pages/admin/AdminTeachers';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminTeacherAllocation } from './pages/admin/AdminTeacherAllocation';
import { AdminStudentAllocation } from './pages/admin/AdminStudentAllocation';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { AdminMarks } from './pages/admin/AdminMarks';
import { AdminCertificates } from './pages/admin/AdminCertificates';
import { AdminNotices } from './pages/admin/AdminNotices';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminTimetable } from './pages/admin/AdminTimetable';

// Shared Pages
import { SettingsPage } from './pages/common/SettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-bold">
        Loading Smart UniPortal ERP...
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public & Login Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login/student" element={<StudentLogin />} />
              <Route path="/login/teacher" element={<TeacherLogin />} />
              <Route path="/login/hod" element={<HodLogin />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Student Portal Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="id-card" element={<StudentIdCard />} />
                <Route path="fees" element={<StudentFees />} />
                <Route path="academics" element={<StudentAcademics />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="marks" element={<StudentMarks />} />
                <Route path="analytics" element={<StudentAnalytics />} />
                <Route path="timetable" element={<StudentTimetable />} />
                <Route path="assignments" element={<StudentAssignments />} />
                <Route path="exams" element={<StudentExams />} />
                <Route path="notices" element={<StudentNotices />} />
                <Route path="events" element={<StudentEvents />} />
                <Route path="certificates" element={<StudentCertificates />} />
                <Route path="resume-builder" element={<StudentResumeBuilder />} />
                <Route path="career-assistant" element={<StudentCareerAssistant />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
              </Route>

              {/* Teacher Portal Routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="subjects" element={<StudentAcademics />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="marks" element={<TeacherMarks />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route path="exams" element={<StudentExams />} />
                <Route path="timetable" element={<TeacherTimetable />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
              </Route>

              {/* HOD Portal Routes */}
              <Route
                path="/hod"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<HodDashboard />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="allocations" element={<AdminTeacherAllocation />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="marks" element={<AdminMarks />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="timetable" element={<AdminTimetable />} />
                <Route path="notices" element={<AdminNotices />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/hod/dashboard" replace />} />
              </Route>

              {/* Admin Portal Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="subjects" element={<AdminSubjects />} />
                <Route path="teacher-allocations" element={<AdminTeacherAllocation />} />
                <Route path="student-allocations" element={<AdminStudentAllocation />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="marks" element={<AdminMarks />} />
                <Route path="timetable" element={<AdminTimetable />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route path="exams" element={<StudentExams />} />
                <Route path="notices" element={<AdminNotices />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
