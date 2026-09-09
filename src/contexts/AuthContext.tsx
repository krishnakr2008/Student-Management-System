import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, Student, Teacher, UserRole } from '../types';
import { dbService } from '../services/dbService';
import { supabase, isRealSupabaseConfigured } from '../lib/supabase';

export interface LoginResult {
  success: boolean;
  error?: string;
  actualRole?: UserRole;
}

interface AuthContextType {
  user: UserProfile | null;
  student: Student | null;
  teacher: Teacher | null;
  role: UserRole | null;
  loading: boolean;
  login: (identifier: string, reqRole?: UserRole, password?: string) => Promise<LoginResult | boolean>;
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

  const clearUserState = () => {
    setUser(null);
    setRole(null);
    setStudent(null);
    setTeacher(null);
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_role');
  };

  const applyUserProfile = async (profile: UserProfile) => {
    if (!profile || !profile.role) {
      clearUserState();
      return;
    }

    setUser(profile);
    setRole(profile.role);

    if (profile.role === 'student') {
      const students = await dbService.getStudents();
      const st = students.find(s => s.profile_id === profile.id) || students[0] || null;
      setStudent(st);
      setTeacher(null);
    } else if (profile.role === 'teacher') {
      const teachers = await dbService.getTeachers();
      const tc = teachers.find(t => t.profile_id === profile.id) || teachers[0] || null;
      setTeacher(tc);
      setStudent(null);
    } else {
      setStudent(null);
      setTeacher(null);
    }

    localStorage.setItem('auth_email', profile.email);
    localStorage.setItem('auth_role', profile.role);
  };

  const loadUserByEmailAndRole = async (emailOrIdentifier: string, targetRole: UserRole) => {
    try {
      let profile = await dbService.getProfileByIdentifier(emailOrIdentifier);

      if (!profile) {
        const profiles = await dbService.getProfiles();
        profile = profiles.find(p => p.role === targetRole) || profiles[0] || null;
      }

      if (profile && profile.role) {
        await applyUserProfile(profile);
      } else {
        console.warn('No user profile or role found in database for:', emailOrIdentifier);
        clearUserState();
      }
    } catch (e) {
      console.error('Error in loadUserByEmailAndRole:', e);
      clearUserState();
    }
  };

  const loadInitialUser = async () => {
    try {
      setLoading(true);

      let profile: UserProfile | null = null;

      // 1. If real Supabase is configured, check active Supabase Auth session
      if (isRealSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          profile = await dbService.getProfileById(session.user.id);
          if (!profile && session.user.email) {
            profile = await dbService.getProfileByEmail(session.user.email);
          }
        }
      }

      // 2. If no profile from Supabase session, fallback to stored user credentials
      if (!profile) {
        const savedEmail = localStorage.getItem('auth_email') || 'student1@college.com';
        const savedRole = (localStorage.getItem('auth_role') as UserRole) || 'student';
        await loadUserByEmailAndRole(savedEmail, savedRole);
        return;
      }

      // 3. Process the retrieved profile safely
      if (profile && profile.role) {
        await applyUserProfile(profile);
      } else {
        clearUserState();
      }
    } catch (err) {
      console.error('Error loading initial user:', err);
      clearUserState();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialUser();
  }, []);

  const login = async (identifier: string, reqRole?: UserRole, password?: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      let profile: UserProfile | null = null;

      // Real Supabase Auth handling
      if (isRealSupabaseConfigured() && password) {
        let loginEmail = identifier;
        if (!identifier.includes('@')) {
          const preLook = await dbService.getProfileByIdentifier(identifier);
          if (preLook && preLook.email) loginEmail = preLook.email;
        }

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: password,
        });

        if (authError) {
          return { success: false, error: authError.message || 'Invalid email or password.' };
        }

        if (data && data.user) {
          profile = await dbService.getProfileById(data.user.id);
          if (!profile && data.user.email) {
            profile = await dbService.getProfileByEmail(data.user.email);
          }
        }
      } else {
        // LocalStorage / Demo Mode lookup
        profile = await dbService.getProfileByIdentifier(identifier);
        if (!profile && reqRole) {
          const profiles = await dbService.getProfiles();
          profile = profiles.find(p => p.role === reqRole) || null;
        }
      }

      // Check if profile exists and has a configured role
      if (!profile || !profile.role) {
        clearUserState();
        return {
          success: false,
          error: 'User profile or role is not configured in database.',
        };
      }

      // Role authorization
      if (reqRole && profile.role !== reqRole) {
        console.warn(`Requested role '${reqRole}' mismatched with actual DB role '${profile.role}'. Granting access for '${profile.role}'.`);
      }

      await applyUserProfile(profile);
      return { success: true, actualRole: profile.role };
    } catch (e: any) {
      console.error('Login exception:', e);
      clearUserState();
      return { success: false, error: e?.message || 'Authentication error occurred.' };
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
        if (newStudent.profile && newStudent.profile.role) {
          await applyUserProfile(newStudent.profile);
        }
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
        if (newTeacher.profile && newTeacher.profile.role) {
          await applyUserProfile(newTeacher.profile);
        }
      }
      return true;
    } catch (e) {
      console.error('Signup error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (isRealSupabaseConfigured()) {
      supabase.auth.signOut().catch(console.error);
    }
    clearUserState();
  };

  const switchRole = async (newRole: UserRole) => {
    setLoading(true);
    try {
      let email = 'student1@college.com';
      if (newRole === 'teacher') email = 'teacher1@college.com';
      if (newRole === 'hod') email = 'hod.cs@college.com';
      if (newRole === 'admin') email = 'admin@college.com';

      await loadUserByEmailAndRole(email, newRole);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (user && user.email) {
      await loadUserByEmailAndRole(user.email, role || user.role || 'student');
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
