import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Notice } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Plus, Trash2, Pin } from 'lucide-react';

export const AdminNotices: React.FC = () => {
  const { showToast } = useToast();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    category: 'General' as Notice['category'],
    priority: 'Normal' as Notice['priority'],
    pinned: false,
  });

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await dbService.getNotices();
      setNotices(data);
    } catch (err: any) {
      showToast('Error Loading Notices', err.message || 'Failed to fetch notices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.description) {
      showToast('Validation Error', 'Title and description are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.createNotice({
        title: newNotice.title,
        description: newNotice.description,
        category: newNotice.category,
        priority: newNotice.priority,
        pinned: newNotice.pinned,
        archived: false,
        author_name: 'Administration Office',
      });

      await loadNotices();
      setIsAddOpen(false);
      setNewNotice({
        title: '',
        description: '',
        category: 'General',
        priority: 'Normal',
        pinned: false,
      });
      showToast('Notice Published', 'Notice broadcasted to university bulletin.', 'success');
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to publish notice.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await dbService.deleteNotice(deletingId);
      await loadNotices();
      setDeletingId(null);
      showToast('Notice Removed', 'Notice deleted permanently from database.', 'success');
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to delete notice.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Notice & Bulletin Publisher
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-md">
              HOD / Admin Access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, pin, categorize, and broadcast campus announcements
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading notices feed...
        </div>
      ) : notices.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          No notices published.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map(notice => (
            <div
              key={notice.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={notice.category === 'Exam' ? 'critical' : 'info'}>{notice.category}</Badge>
                  {notice.pinned && <span className="text-xs text-amber-500 font-bold flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span>}
                  <span className="text-xs text-slate-400">{notice.publish_date}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{notice.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notice.description}</p>
              </div>

              <button
                onClick={() => setDeletingId(notice.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                title="Delete Notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Publish Campus Announcement"
          subtitle="Broadcast notice to students and faculty"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notice Title</label>
              <input
                type="text"
                required
                value={newNotice.title}
                onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                placeholder="Mid-Semester Exam Schedule Announcement"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={newNotice.category}
                  onChange={e => setNewNotice({ ...newNotice, category: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="General">General</option>
                  <option value="Academic">Academic</option>
                  <option value="Exam">Exam</option>
                  <option value="Placement">Placement</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                <select
                  value={newNotice.priority}
                  onChange={e => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinnedCheck"
                checked={newNotice.pinned}
                onChange={e => setNewNotice({ ...newNotice, pinned: e.target.checked })}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="pinnedCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pin this notice to top of dashboard
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description & Content</label>
              <textarea
                rows={4}
                required
                value={newNotice.description}
                onChange={e => setNewNotice({ ...newNotice, description: e.target.value })}
                placeholder="Full notice text..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Notice'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement Notice"
        message="Are you sure you want to delete this notice? This action will permanently remove it from student and teacher bulletins."
        confirmText="Delete Notice"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
