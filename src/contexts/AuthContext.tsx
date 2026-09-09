import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, Student, Teacher, UserRole } from '../types';
import { dbService } from '../services/dbService';

interface AuthContextType {
  user: UserProfile | null;
  student: Student | null;
  teacher: Teacher | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (full_name: string, email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadInitialUser = async () => {
    try {
      setLoading(true);
      const savedEmail = localStorage.getItem('auth_email') || 'student1@college.com';
      const savedRole = (localStorage.getItem('auth_role') as UserRole) || 'student';

      await loadUserByEmailAndRole(savedEmail, savedRole);
    } catch (err) {
      console.error('Error loading initial user:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserByEmailAndRole = async (email: string, targetRole: UserRole) => {
    const profiles = await dbService.getProfiles();
    let profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!profile) {
      profile = profiles.find(p => p.role === targetRole) || profiles[0];
    }

    setUser(profile);
    setRole(profile.role);

    if (profile.role === 'student') {
      const students = await dbService.getStudents();
      const st = students.find(s => s.profile_id === profile!.id) || students[0];
      setStudent(st);
      setTeacher(null);
    } else if (profile.role === 'teacher') {
      const teachers = await dbService.getTeachers();
      const tc = teachers.find(t => t.profile_id === profile!.id) || teachers[0];
      setTeacher(tc);
      setStudent(null);
    } else {
      setStudent(null);
      setTeacher(null);
    }

    localStorage.setItem('auth_email', profile.email);
    localStorage.setItem('auth_role', profile.role);
  };

  useEffect(() => {
    loadInitialUser();
  }, []);

  const login = async (email: string, reqRole?: UserRole): Promise<boolean> => {
    setLoading(true);
    try {
      const profiles = await dbService.getProfiles();
      const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      const selectedRole = found ? found.role : (reqRole || 'student');

      await loadUserByEmailAndRole(email, selectedRole);
      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (full_name: string, email: string, newRole: UserRole): Promise<boolean> => {
    setLoading(true);
    try {
      if (newRole === 'student') {
        const newStudent = await dbService.createStudent(
          {
            profile_id: '',
            student_id_code: `STD-${Date.now().toString().substr(-4)}`,
            department: 'Computer Science',
            branch: 'CSE',
            semester: 1,
            section: 'A',
            roll_number: `23CS${Math.floor(100 + Math.random() * 900)}`,
            admission_year: 2026,
          },
          { full_name, email, role: 'student' }
        );
        setUser(newStudent.profile || null);
        setStudent(newStudent);
        setRole('student');
      } else if (newRole === 'teacher') {
        const newTeacher = await dbService.createTeacher(
          {
            profile_id: '',
            teacher_id_code: `TCH-${Date.now().toString().substr(-4)}`,
            department: 'Computer Science',
            designation: 'Assistant Professor',
          },
          { full_name, email, role: 'teacher' }
        );
        setUser(newTeacher.profile || null);
        setTeacher(newTeacher);
        setRole('teacher');
      }

      localStorage.setItem('auth_email', email);
      localStorage.setItem('auth_role', newRole);
      return true;
    } catch (e) {
      console.error('Signup error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setStudent(null);
    setTeacher(null);
    setRole(null);
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_role');
  };

  const switchRole = async (newRole: UserRole) => {
    let email = 'student1@college.com';
    if (newRole === 'teacher') email = 'teacher1@college.com';
    if (newRole === 'hod') email = 'hod.cs@college.com';
    if (newRole === 'admin') email = 'admin@college.com';

    await loadUserByEmailAndRole(email, newRole);
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserByEmailAndRole(user.email, role || user.role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        teacher,
        role,
        loading,
        login,
        signup,
        logout,
        switchRole,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
