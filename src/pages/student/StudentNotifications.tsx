import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { NotificationItem } from '../../types';
import { Bell, CheckCheck, Trash2, Info, Calendar, FileText, Award } from 'lucide-react';

export const StudentNotifications: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await dbService.getNotifications(user?.id || 'demo-user');
      setNotifications(data);
    } catch (err: any) {
      console.warn('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (user?.id) {
      await dbService.markAllNotificationsRead(user.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    showToast('Notifications Updated', 'All notifications marked as read.', 'success');
  };

  const handleMarkRead = async (id: string) => {
    await dbService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System alerts, assignment deadlines, notice updates, and certificate verifications
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4 text-emerald-500" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
          <Bell className="w-8 h-8 text-slate-400" />
          <span>No notifications at this time.</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleMarkRead(notif.id)}
              className={`p-5 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                notif.is_read ? 'opacity-70 bg-white dark:bg-slate-900' : 'bg-brand-50/40 dark:bg-slate-800/60 font-semibold'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${notif.is_read ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-brand-500/10 text-brand-500'}`}>
                  {notif.type === 'assignment' ? (
                    <FileText className="w-5 h-5" />
                  ) : notif.type === 'exam' ? (
                    <Calendar className="w-5 h-5 text-rose-500" />
                  ) : notif.type === 'certificate' ? (
                    <Award className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Info className="w-5 h-5 text-indigo-500" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{notif.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{new Date(notif.created_at).toLocaleString()}</span>
                </div>
              </div>

              {!notif.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
