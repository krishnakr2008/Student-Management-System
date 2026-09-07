import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  User,
  BookOpen,
  CalendarCheck,
  Award,
  FileText,
  Clock,
  Briefcase,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  BarChart3,
  Users,
  UserCheck,
  FileCheck,
  CheckCircle,
  Megaphone,
  Calendar,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { role, user, student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  interface NavItem {
    label: string;
    icon: any;
    path: string;
    highlight?: boolean;
  }

  const getStudentItems = (): NavItem[] => [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'My Profile', icon: User, path: '/student/profile' },
    { label: 'Academics', icon: BookOpen, path: '/student/academics' },
    { label: 'Attendance', icon: CalendarCheck, path: '/student/attendance' },
    { label: 'Marks & Results', icon: Award, path: '/student/marks' },
    { label: 'Performance Analytics', icon: BarChart3, path: '/student/analytics' },
    { label: 'Timetable', icon: Clock, path: '/student/timetable' },
    { label: 'Assignments', icon: FileText, path: '/student/assignments' },
    { label: 'Exams', icon: CheckCircle, path: '/student/exams' },
    { label: 'Notices', icon: Megaphone, path: '/student/notices' },
    { label: 'Events & Calendar', icon: Calendar, path: '/student/events' },
    { label: 'Certificates', icon: FileCheck, path: '/student/certificates' },
    { label: 'Resume Builder', icon: Briefcase, path: '/student/resume-builder' },
    { label: 'AI Career Assistant', icon: Sparkles, path: '/student/career-assistant', highlight: true },
    { label: 'Notifications', icon: Bell, path: '/student/notifications' },
    { label: 'Settings', icon: Settings, path: '/student/settings' },
  ];

  const getTeacherItems = (): NavItem[] => [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
    { label: 'My Profile', icon: User, path: '/teacher/profile' },
    { label: 'My Subjects', icon: BookOpen, path: '/teacher/subjects' },
    { label: 'My Students', icon: Users, path: '/teacher/students' },
    { label: 'Attendance', icon: CalendarCheck, path: '/teacher/attendance' },
    { label: 'Marks', icon: Award, path: '/teacher/marks' },
    { label: 'Assignments', icon: FileText, path: '/teacher/assignments' },
    { label: 'Exams', icon: CheckCircle, path: '/teacher/exams' },
    { label: 'Notices', icon: Megaphone, path: '/teacher/notices' },
    { label: 'Notifications', icon: Bell, path: '/teacher/notifications' },
    { label: 'Settings', icon: Settings, path: '/teacher/settings' },
  ];

  const getAdminItems = (): NavItem[] => [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Students', icon: Users, path: '/admin/students' },
    { label: 'Teachers', icon: UserCheck, path: '/admin/teachers' },
    { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { label: 'Subjects', icon: BookOpen, path: '/admin/subjects' },
    { label: 'Attendance Control', icon: CalendarCheck, path: '/admin/attendance' },
    { label: 'Marks Control', icon: Award, path: '/admin/marks' },
    { label: 'Timetable', icon: Clock, path: '/admin/timetable' },
    { label: 'Assignments', icon: FileText, path: '/admin/assignments' },
    { label: 'Exams', icon: CheckCircle, path: '/admin/exams' },
    { label: 'Notices', icon: Megaphone, path: '/admin/notices' },
    { label: 'Certificates', icon: FileCheck, path: '/admin/certificates' },
    { label: 'Events', icon: Calendar, path: '/admin/events' },
    { label: 'Reports & Analytics', icon: BarChart3, path: '/admin/reports' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const navItems =
    role === 'admin'
      ? getAdminItems()
      : role === 'teacher'
      ? getTeacherItems()
      : getStudentItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-brand-600 rounded-xl text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight block leading-tight">
                UniPortal
              </span>
              <span className="text-[10px] font-semibold tracking-wide text-brand-600 dark:text-brand-400 uppercase">
                {role} Portal
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/60 flex items-center gap-3 shrink-0">
          <img
            src={
              user?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            }
            alt={user?.full_name || 'User'}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {user?.full_name || 'User'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {student ? `ID: ${student.student_id_code}` : user?.email}
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : item.highlight
                      ? 'bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-50 dark:hover:bg-slate-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.highlight ? 'text-amber-500' : ''}`} />
                <span className="truncate">{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-500 text-white uppercase tracking-wider">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
