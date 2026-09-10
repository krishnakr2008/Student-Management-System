import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, Student, Teacher, UserRole } from '../types';
import { dbService, generateUUID, isValidUUID } from '../services/dbService';
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
  signup: (full_name: string, email: string, role: UserRole, password?: string, extraDetails?: Partial<Student> & Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
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
        const st = students.find(s => s && s.profile_id === profile.id) || null;
        setStudent(st);
        setTeacher(null);
      } else if (actualRole === 'teacher') {
        const teachers = await dbService.getTeachers();
        const tc = teachers.find(t => t && t.profile_id === profile.id) || null;
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

  const loadUserByEmailAndRole = async (emailOrIdentifier: string, _targetRole?: UserRole) => {
    try {
      let profile: UserProfile | null = null;

      if (emailOrIdentifier) {
        profile = await dbService.getProfileByIdentifier(emailOrIdentifier);
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
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            profile = await dbService.getProfileById(session.user.id);
            if (!profile && session.user.email) {
              profile = await dbService.getProfileByEmail(session.user.email);
            }
          }
        } catch (e) {
          console.warn('Error reading Supabase session:', e);
        }
      }

      // 2. Fallback to stored local user email
      if (!profile) {
        const savedEmail = localStorage.getItem('auth_email');
        if (savedEmail) {
          profile = await dbService.getProfileByEmail(savedEmail);
        }
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

      if (!identifier || !identifier.trim()) {
        clearUserState();
        return {
          success: false,
          error: 'User profile not found. Please contact the administrator.',
        };
      }

      const cleanIdentifier = identifier.trim();

      // 1. Fetch profile from database first to determine if it is a real Supabase Auth user or a demo/local profile
      const existingProfile = await dbService.getProfileByIdentifier(cleanIdentifier);

      const isDemoAccount =
        cleanIdentifier.toLowerCase().includes('@college.com') ||
        cleanIdentifier.toLowerCase().startsWith('student') ||
        cleanIdentifier.toLowerCase().startsWith('teacher') ||
        cleanIdentifier.toLowerCase().startsWith('admin') ||
        cleanIdentifier.toLowerCase().startsWith('hod') ||
        cleanIdentifier.toLowerCase().startsWith('std-') ||
        cleanIdentifier.toLowerCase().startsWith('tch-') ||
        cleanIdentifier.toLowerCase().startsWith('23cs') ||
        (existingProfile ? !isValidUUID(existingProfile.id) : false);

      if (isDemoAccount && existingProfile) {
        profile = existingProfile;
      } else if (isRealSupabaseConfigured() && password) {
        let loginEmail = cleanIdentifier;
        if (!loginEmail.includes('@') && existingProfile && existingProfile.email) {
          loginEmail = existingProfile.email;
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: password,
        });

        if (authError) {
          if (existingProfile && existingProfile.role) {
            profile = existingProfile;
          } else {
            clearUserState();
            return {
              success: false,
              error: authError.message || 'Invalid email or password.',
            };
          }
        } else if (authData && authData.user) {
          const authUser = authData.user;
          profile = (await dbService.getProfileById(authUser.id)) ||
                    (await dbService.getProfileByEmail(authUser.email || ''));
        }
      }

      // 2. Demo Mode or Local Lookup
      if (!profile) {
        profile = await dbService.getProfileByIdentifier(cleanIdentifier);
      }

      if (!profile) {
        clearUserState();
        return {
          success: false,
          error: 'User profile not found. Please contact the administrator.',
        };
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

  const signup = async (
    full_name: string,
    email: string,
    newRole: UserRole,
    password?: string,
    extraDetails?: Partial<Student> & Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      let realAuthUserId = '';

      if (isRealSupabaseConfigured()) {
        if (!password) {
          return { success: false, error: 'Password is required for registration.' };
        }

        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name,
              role: newRole,
            },
          },
        });

        if (authErr) {
          return { success: false, error: authErr.message };
        }

        if (!authData?.user) {
          return { success: false, error: 'Failed to create user account in Supabase Auth.' };
        }

        realAuthUserId = authData.user.id;
      } else {
        realAuthUserId = generateUUID();
      }

      if (newRole === 'student') {
        const newStudent = await dbService.createStudent(
          {
            profile_id: realAuthUserId,
            student_id_code: extraDetails?.student_id_code || `STD-${Date.now().toString().slice(-4)}`,
            department: extraDetails?.department || 'Computer Science',
            branch: extraDetails?.branch || 'CSE',
            semester: extraDetails?.semester || 1,
            section: extraDetails?.section || 'A',
            roll_number: extraDetails?.roll_number || `23CS${Math.floor(100 + Math.random() * 900)}`,
            admission_year: extraDetails?.admission_year || 2026,
            guardian_name: extraDetails?.guardian_name || '',
            guardian_phone: extraDetails?.guardian_phone || '',
            guardian_relation: extraDetails?.guardian_relation || '',
          },
          { full_name, email, role: 'student', phone: extraDetails?.phone || '', address: extraDetails?.address || '' }
        );
        if (newStudent.profile) {
          await applyUserProfile(newStudent.profile);
        }
      } else if (newRole === 'teacher') {
        const newTeacher = await dbService.createTeacher(
          {
            profile_id: realAuthUserId,
            teacher_id_code: `TCH-${Date.now().toString().slice(-4)}`,
            department: extraDetails?.department || 'Computer Science',
            designation: 'Assistant Professor',
          },
          { full_name, email, role: 'teacher' }
        );
        if (newTeacher.profile) {
          await applyUserProfile(newTeacher.profile);
        }
      }

      // Real-time database persistence verification query in Supabase
      if (isRealSupabaseConfigured() && realAuthUserId) {
        if (newRole === 'student') {
          const { data: vData, error: vErr } = await supabase
            .from('students')
            .select('*, profile:profiles(*)')
            .eq('profile_id', realAuthUserId)
            .maybeSingle();

          if (vErr || !vData) {
            return {
              success: false,
              error: `Database persistence verification failed: ${vErr?.message || 'Student record could not be confirmed in Supabase.'}`,
            };
          }
        } else if (newRole === 'teacher') {
          const { data: vData, error: vErr } = await supabase
            .from('teachers')
            .select('*, profile:profiles(*)')
            .eq('profile_id', realAuthUserId)
            .maybeSingle();

          if (vErr || !vData) {
            return {
              success: false,
              error: `Database persistence verification failed: ${vErr?.message || 'Teacher record could not be confirmed in Supabase.'}`,
            };
          }
        }
      }

      return { success: true };
    } catch (e: any) {
      console.error('Signup error:', e);
      return { success: false, error: e.message || 'An unexpected error occurred during account creation.' };
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
