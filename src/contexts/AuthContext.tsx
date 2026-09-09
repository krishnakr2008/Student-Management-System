import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, Student, Teacher, UserRole } from '../types';
import { dbService } from '../services/dbService';
import { supabase, isRealSupabaseConfigured } from '../lib/supabase';

export interface LoginResult {
  success: boolean;
  error?: string;
  actualRole?: UserRole;
}

export const normalizeUserRole = (rawRole?: unknown): UserRole | null => {
  if (!rawRole || typeof rawRole !== 'string') return null;
  const cleaned = rawRole.trim().toLowerCase();
  if (cleaned === 'student') return 'student';
  if (cleaned === 'teacher' || cleaned === 'faculty' || cleaned === 'instructor') return 'teacher';
  if (cleaned === 'hod' || cleaned === 'head of department') return 'hod';
  if (cleaned === 'admin' || cleaned === 'administrator') return 'admin';
  return null;
};

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

  const applyUserProfile = async (profile: UserProfile | null) => {
    if (!profile || !profile.role) {
      clearUserState();
      return;
    }

    const actualRole = normalizeUserRole(profile.role);
    if (!actualRole) {
      clearUserState();
      return;
    }

    const normalizedProfile: UserProfile = { ...profile, role: actualRole };
    setUser(normalizedProfile);
    setRole(actualRole);

    try {
      if (actualRole === 'student') {
        const students = await dbService.getStudents();
        const st = students.find(s => s && s.profile_id === profile.id) || students[0] || null;
        setStudent(st);
        setTeacher(null);
      } else if (actualRole === 'teacher') {
        const teachers = await dbService.getTeachers();
        const tc = teachers.find(t => t && t.profile_id === profile.id) || teachers[0] || null;
        setTeacher(tc);
        setStudent(null);
      } else {
        setStudent(null);
        setTeacher(null);
      }

      if (profile.email) {
        localStorage.setItem('auth_email', profile.email);
      }
      localStorage.setItem('auth_role', actualRole);
    } catch (err) {
      console.error('Error loading role entity data:', err);
    }
  };

  const loadUserByEmailAndRole = async (emailOrIdentifier: string, targetRole: UserRole) => {
    try {
      let profile: UserProfile | null = null;

      if (emailOrIdentifier) {
        profile = await dbService.getProfileByIdentifier(emailOrIdentifier);
      }

      if (!profile) {
        const profiles = await dbService.getProfiles();
        profile = profiles.find(p => p && p.role && normalizeUserRole(p.role) === targetRole) || null;
      }

      if (profile && profile.role) {
        const actualRole = normalizeUserRole(profile.role);
        if (actualRole) {
          await applyUserProfile({ ...profile, role: actualRole });
          return;
        }
      }

      console.warn('No valid user profile or configured role found for:', emailOrIdentifier);
      clearUserState();
    } catch (e) {
      console.error('Error in loadUserByEmailAndRole:', e);
      clearUserState();
    }
  };

  const loadInitialUser = async () => {
    try {
      setLoading(true);
      let profile: UserProfile | null = null;

      // 1. Check Supabase Auth active session
      if (isRealSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          profile = await dbService.getProfileById(session.user.id);
          if (!profile && session.user.email) {
            profile = await dbService.getProfileByEmail(session.user.email);
          }
        }
      }

      // 2. Fallback to stored local user
      if (!profile) {
        const savedEmail = localStorage.getItem('auth_email') || 'student1@college.com';
        const savedRole = (localStorage.getItem('auth_role') as UserRole) || 'student';
        await loadUserByEmailAndRole(savedEmail, savedRole);
        return;
      }

      if (profile && profile.role) {
        const actualRole = normalizeUserRole(profile.role);
        if (actualRole) {
          await applyUserProfile({ ...profile, role: actualRole });
        } else {
          clearUserState();
        }
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
    let subscription: { unsubscribe: () => void } | null = null;

    if (isRealSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session && session.user) {
            const profile = await dbService.getProfileById(session.user.id) ||
                            await dbService.getProfileByEmail(session.user.email || '');
            if (profile && profile.role) {
              await applyUserProfile(profile);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          clearUserState();
        }
      });
      subscription = authListener.subscription;
    }

    loadInitialUser();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, reqRole?: UserRole, password?: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      let profile: UserProfile | null = null;

      // 1. Supabase Mode
      if (isRealSupabaseConfigured() && password) {
        let loginEmail = identifier ? identifier.trim() : '';
        if (loginEmail && !loginEmail.includes('@')) {
          const preLook = await dbService.getProfileByIdentifier(loginEmail);
          if (preLook && preLook.email) loginEmail = preLook.email;
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: password,
        });

        if (authError) {
          clearUserState();
          return {
            success: false,
            error: authError.message || 'Invalid email or password.',
          };
        }

        if (!authData || !authData.user) {
          clearUserState();
          return {
            success: false,
            error: 'Authentication failed. No user session returned.',
          };
        }

        const authUser = authData.user;
        profile = await dbService.getProfileById(authUser.id);
        if (!profile && authUser.email) {
          profile = await dbService.getProfileByEmail(authUser.email);
        }

        if (!profile) {
          clearUserState();
          return {
            success: false,
            error: 'User profile not found. Please contact the administrator.',
          };
        }
      } else {
        // 2. Local Storage / Demo Mode
        profile = await dbService.getProfileByIdentifier(identifier);
        if (!profile && reqRole) {
          const profiles = await dbService.getProfiles();
          profile = profiles.find(p => p && p.role && normalizeUserRole(p.role) === reqRole) || null;
        }

        if (!profile) {
          clearUserState();
          return {
            success: false,
            error: 'User profile not found. Please contact the administrator.',
          };
        }
      }

      // 3. Verify and Normalize Role
      if (!profile || !profile.role) {
        clearUserState();
        return {
          success: false,
          error: 'User role is not configured. Please contact the administrator.',
        };
      }

      const actualRole = normalizeUserRole(profile.role);
      if (!actualRole) {
        clearUserState();
        return {
          success: false,
          error: 'User role is not configured. Please contact the administrator.',
        };
      }

      const normalizedProfile: UserProfile = { ...profile, role: actualRole };

      // 4. Role Authorization / Mismatch Check (Step 5 & Requirement 13)
      if (reqRole && actualRole !== reqRole) {
        clearUserState();
        return {
          success: false,
          error: `Role Mismatch: Your account is registered as ${actualRole.toUpperCase()}. Please log in through the ${actualRole.toUpperCase()} Portal.`,
        };
      }

      await applyUserProfile(normalizedProfile);
      return { success: true, actualRole };
    } catch (e: any) {
      console.error('Login error:', e);
      clearUserState();
      return {
        success: false,
        error: e?.message || 'Unable to load user profile. Please try again.',
      };
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
        if (newStudent.profile) {
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
        if (newTeacher.profile) {
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
      const currentRole = role || (user.role ? normalizeUserRole(user.role) : null) || 'student';
      await loadUserByEmailAndRole(user.email, currentRole);
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
