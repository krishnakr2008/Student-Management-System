import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserRole } from '../../types';
import {
  Menu,
  Sun,
  Moon,
  Search,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleSwitch = async (newRole: UserRole) => {
    setIsRoleOpen(false);
    await switchRole(newRole);
    if (newRole === 'student') navigate('/student/dashboard');
    else if (newRole === 'teacher') navigate('/teacher/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (role === 'student') navigate(`/student/notices?q=${encodeURIComponent(searchQuery)}`);
    else if (role === 'teacher') navigate(`/teacher/students?q=${encodeURIComponent(searchQuery)}`);
    else navigate(`/admin/students?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs sm:max-w-md w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects, notices, students..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 rounded-xl focus:outline-hidden text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher Dropdown (For Viva / Demo convenience) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-slate-800 border border-brand-200/60 dark:border-slate-700 text-brand-700 dark:text-brand-300 text-xs font-semibold hover:bg-brand-100 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="capitalize hidden md:inline">{role} View</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isRoleOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs font-medium">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Switch Portal Role
              </div>
              <button
                onClick={() => handleRoleSwitch('student')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  role === 'student' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🎓 Student Portal</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('teacher')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  role === 'teacher' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>👩‍🏫 Teacher Portal</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  role === 'admin' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>👨‍💼 Admin Portal</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Icon */}
        <button
          onClick={() => navigate(`/${role}/notifications`)}
          className="relative p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.full_name || 'User Avatar'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1 text-xs">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate(`/${role}/profile`);
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
                {role === 'student' && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/student/career-assistant');
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Career Assistant</span>
                  </button>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
