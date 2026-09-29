import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, MapPin, Clock, Users, CheckCircle2 } from 'lucide-react';
import { eventService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Symposium');
  const [organizer, setOrganizer] = useState<string>('Department of Computer Science');
  const [venue, setVenue] = useState<string>('Main Auditorium & Labs');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('09:30 AM');
  const [maxParticipants, setMaxParticipants] = useState<number>(300);
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getEvents();
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !venue) return;

    setSubmitting(true);
    try {
      const res = await eventService.createEvent({
        title,
        category,
        organizer,
        venue,
        date,
        time,
        maxParticipants,
        description,
        imageUrl,
      });

      if (res.data.success) {
        setSuccessMsg(`Event "${title}" published successfully!`);
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <CalendarDays className="w-6 h-6 mr-2 text-rose-600" />
            Institutional Event & Symposium Scheduling
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize inter-collegiate symposiums, cultural fests, workshops, and sports tournaments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Event</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div>
              {event.imageUrl && (
                <div className="h-40 w-full overflow-hidden relative">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase">
                      {event.category}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-3">
                <h3 className="font-bold text-base text-slate-900 leading-snug">{event.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{event.description}</p>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <p className="flex items-center">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span>{event.date} • {event.time}</span>
                  </p>
                  <p className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span>{event.venue}</span>
                  </p>
                  <p className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span>{event.registeredCount || 0} / {event.maxParticipants} Registered</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-400">
              <span>Organized by {event.organizer}</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                Open for Registration
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule College Event"
        subtitle="Publish campus workshops, symposiums, or conferences"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. INVENTO 2026: National Technical Symposium"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="Symposium">Technical Symposium</option>
                <option value="Workshop">Hands-on Workshop</option>
                <option value="Cultural">Cultural Fest</option>
                <option value="Sports">Sports Meet</option>
                <option value="Guest Lecture">Distinguished Lecture</option>
                <option value="Hackathon">24-hr Hackathon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organizer Unit</label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. CSE Dept & IEEE Student Chapter"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:30 AM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity</label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Venue *</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Dr. APJ Abdul Kalam Auditorium"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail keynote speakers, competitive tracks, and certificates..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
