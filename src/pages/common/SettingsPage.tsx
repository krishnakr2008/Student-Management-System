import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Settings, Moon, Sun, Database, ShieldCheck, Bell } from 'lucide-react';
import { isRealSupabaseConfigured } from '../../lib/supabase';

export const SettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings Saved', 'System preferences updated.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          System & Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage appearance preferences, database connectivity status, and security options
        </p>
      </div>

      {/* Theme Settings Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Appearance Mode</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Dark / Light Mode</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark UI themes</p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center gap-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span className="capitalize">{theme} Mode Active</span>
          </button>
        </div>
      </div>

      {/* Database Connection Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-brand-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Supabase Backend Status</h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">Database Storage Strategy:</span>
            <span className="text-slate-500 dark:text-slate-400">
              {isRealSupabaseConfigured()
                ? 'Connected directly to live Supabase PostgreSQL Instance'
                : 'Running on Local Seed Fallback Engine (Zero Friction Standalone Mode)'}
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
            ● Active & Ready
          </span>
        </div>
      </div>
    </div>
  );
};
