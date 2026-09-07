import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { CollegeEvent } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Calendar, Plus, MapPin, Trash2 } from 'lucide-react';

export const AdminEvents: React.FC = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'College Event' as CollegeEvent['event_type'],
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    location: '',
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await dbService.getEvents();
      setEvents(data);
    } catch (err: any) {
      showToast('Error Loading Events', err.message || 'Failed to fetch campus events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location) {
      showToast('Validation Error', 'Title and location venue are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.createEvent(formData);
      await loadEvents();
      setIsAddOpen(false);
      setFormData({
        title: '',
        description: '',
        event_type: 'College Event',
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        location: '',
      });
      showToast('Event Scheduled', 'Campus event added to university calendar.', 'success');
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to create event.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await dbService.deleteEvent(deletingId);
      await loadEvents();
      setDeletingId(null);
      showToast('Event Deleted', 'Event permanently removed from calendar.', 'success');
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to delete event.', 'error');
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
              Campus Event Calendar Publisher
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-md">
              HOD / Admin Access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schedule hackathons, workshops, seminars, and university holidays
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Campus Event</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading campus calendar...
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          No campus events scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map(evt => (
            <div
              key={evt.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge variant="info">{evt.event_type}</Badge>
                <button
                  onClick={() => setDeletingId(evt.id)}
                  className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{evt.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{evt.description}</p>
              
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-500" /> Start: {new Date(evt.start_date).toLocaleDateString()}</p>
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {evt.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Schedule New Campus Event"
          subtitle="Publish event to university calendar"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Event Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Annual Tech Hackathon 2026"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={e => setFormData({ ...formData, event_type: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="College Event">College Event</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Exam">Exam</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location / Venue</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Auditorium B"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                {isSubmitting ? 'Publishing...' : 'Publish Event'}
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
        title="Delete Campus Event"
        message="Are you sure you want to delete this event? It will be removed permanently from the public calendar."
        confirmText="Delete Event"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
