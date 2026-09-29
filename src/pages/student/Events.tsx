import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Clock, Users, CheckCircle2, Calendar } from 'lucide-react';
import { eventService } from '../../services/api';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [eventsRes, regRes] = await Promise.all([
        eventService.getEvents(),
        eventService.getMyRegistrations().catch(() => ({ data: { registrations: [] } })),
      ]);

      if (eventsRes.data.success) setEvents(eventsRes.data.events || []);
      if (regRes.data?.success) setMyRegistrations(regRes.data.registrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    setRegisteringId(eventId);
    setSuccessMsg('');
    try {
      const res = await eventService.registerForEvent(eventId);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Registered for event successfully!');
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registering for event');
    } finally {
      setRegisteringId(null);
    }
  };

  const isRegistered = (eventId: string) => {
    return myRegistrations.some((r) => r.eventId === eventId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <CalendarDays className="w-6 h-6 mr-2 text-blue-600" />
          Campus Events, Fests & Technical Symposiums
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Participate in national hackathons, technical symposiums, sports tournaments, and distinguished lectures.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => {
          const registered = isRegistered(event._id);

          return (
            <div
              key={event._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {event.imageUrl && (
                  <div className="h-44 w-full overflow-hidden relative">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {event.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{event.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{event.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <p className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
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

              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">By {event.organizer}</span>

                {registered ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200">
                    ✓ Registered
                  </span>
                ) : (
                  <button
                    onClick={() => handleRegister(event._id)}
                    disabled={registeringId === event._id}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {registeringId === event._id ? 'Registering...' : 'Register for Event'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
