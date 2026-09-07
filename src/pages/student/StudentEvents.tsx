import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { CollegeEvent } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

export const StudentEvents: React.FC = () => {
  const [events, setEvents] = useState<CollegeEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await dbService.getEvents();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Events & Campus Calendar
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upcoming workshops, seminars, hackathons, holidays, and assignment deadlines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(evt => (
          <div
            key={evt.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <Badge variant={evt.event_type === 'Holiday' ? 'warning' : evt.event_type === 'Workshop' ? 'info' : 'safe'}>
                {evt.event_type}
              </Badge>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{evt.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{evt.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-brand-500" />
                <span>Start: {new Date(evt.start_date).toLocaleDateString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Location: {evt.location}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
