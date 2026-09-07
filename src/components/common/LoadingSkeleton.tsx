import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'table' | 'profile';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-1/2"></div>
            <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded-md w-1/3 mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-lg mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse flex items-center space-x-4">
      <div className="rounded-full bg-slate-300 dark:bg-slate-700 h-16 w-16"></div>
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );
};
