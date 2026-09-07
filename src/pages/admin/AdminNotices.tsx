import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Notice } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Megaphone, Plus, Trash2, Pin } from 'lucide-react';

export const AdminNotices: React.FC = () => {
  const { showToast } = useToast();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    category: 'General' as Notice['category'],
    priority: 'Normal' as Notice['priority'],
    pinned: false,
  });

  const loadNotices = async () => {
    const data = await dbService.getNotices();
    setNotices(data);
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.description) return;

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
      showToast('Notice Published', 'Notice published to university bulletin.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to publish notice.', 'error');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    await dbService.deleteNotice(id);
    await loadNotices();
    showToast('Notice Removed', 'Notice deleted successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Notice & Bulletin Publisher
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, pin, categorize, and broadcast campus announcements
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

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
              onClick={() => handleDeleteNotice(notice.id)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

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
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="pinnedCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pin this notice to top of student dashboard
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs"
              >
                Publish Notice
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
