import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Trash2, 
  Users, 
  MapPin, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { eventsService } from '../../services/eventsService';
import { adminService } from '../../services/adminService';
import { CommunityEvent } from '../../types';
import { useNotification } from '../../hooks/useNotification';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useNotification();

  const loadEvents = async () => {
    const data = await eventsService.getEvents();
    setEvents(data);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDeleteEvent = async (id: string, title: string) => {
    try {
      await adminService.deleteContent('event', id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast('Event Removed', `Removed "${title}" from the community board`, 'info');
    } catch {
      showToast('Error', 'Failed to remove event', 'error');
    }
  };

  const filteredEvents = events.filter((e) => {
    const q = searchQuery.toLowerCase();
    return !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Society Event Moderation & Venues
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Supervise community venue bookings, clubhouse activities, and society meetings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-4">Organizer</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{e.title}</div>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold">
                      {e.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700">
                    <div className="font-semibold">{e.organizerName}</div>
                    <div className="text-[10px] text-slate-400">{e.organizerApartment}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    <div>{e.date}</div>
                    <div className="text-[10px] text-slate-400">{e.time}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {e.location}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {e.attendeesCount} / {e.capacity}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(e.id, e.title)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Cancel Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
