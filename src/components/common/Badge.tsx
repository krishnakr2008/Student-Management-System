import React from 'react';

export type BadgeVariant =
  | 'safe'
  | 'warning'
  | 'critical'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'submitted'
  | 'graded'
  | 'info'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const styles: Record<BadgeVariant, string> = {
    safe: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    verified: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    submitted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    graded: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    default: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
