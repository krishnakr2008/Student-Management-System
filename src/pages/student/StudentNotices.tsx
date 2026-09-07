import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { Notice } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Megaphone, Search, Pin, Calendar, User } from 'lucide-react';

export const StudentNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchNotices = async () => {
      const data = await dbService.getNotices();
      setNotices(data);
    };
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(n => {
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesQuery =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const pinnedNotices = filteredNotices.filter(n => n.pinned);
  const otherNotices = filteredNotices.filter(n => !n.pinned);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Notices & Official Bulletins
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Campus announcements, academic updates, placement drives, and examination alerts
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notice title or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'General', 'Academic', 'Exam', 'Placement', 'Event'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Notices Section */}
      {pinnedNotices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" /> Pinned Announcements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedNotices.map(notice => (
              <div
                key={notice.id}
                className="bg-gradient-to-br from-amber-500/10 via-brand-500/5 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="warning">{notice.category}</Badge>
                  <span className="text-[10px] text-slate-400">{notice.publish_date}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{notice.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notice.description}</p>
                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Author: {notice.author_name || 'Administration'}</span>
                  <Badge variant={notice.priority === 'Urgent' ? 'critical' : 'info'}>{notice.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Notices */}
      <div className="space-y-4">
        {otherNotices.map(notice => (
          <div
            key={notice.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-brand-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={notice.category === 'Exam' ? 'critical' : 'info'}>{notice.category}</Badge>
                <span className="text-xs font-semibold text-slate-500">{notice.publish_date}</span>
              </div>
              <Badge variant={notice.priority === 'Urgent' ? 'critical' : 'default'}>{notice.priority}</Badge>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{notice.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notice.description}</p>
            <p className="text-[11px] text-slate-400 pt-1">Issued by: {notice.author_name || 'Administration'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
