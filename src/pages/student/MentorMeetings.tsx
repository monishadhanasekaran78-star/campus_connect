import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Video, MapPin, CheckCircle2, Clock, MessageSquareHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { meetingService, studentService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const MentorMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('10:00 AM');
  const [meetingType, setMeetingType] = useState<string>('In-Person');
  const [purpose, setPurpose] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, mentorRes] = await Promise.all([
        meetingService.getMyMeetings(),
        studentService.getMyMentor().catch(() => ({ data: { mentor: null } }))
      ]);

      if (mRes.data.success) {
        setMeetings(mRes.data.meetings || []);
      }
      if (mentorRes.data?.success) {
        setMentor(mentorRes.data.mentor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await meetingService.requestMeeting({
        date,
        time,
        meetingType,
        purpose,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setPurpose('');
        setDate('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit meeting request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    if (filter === 'all') return true;
    return m.status?.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Mentor Meeting Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View scheduled, pending, and completed mentorship sessions with {mentor?.name || 'your mentor'}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Request New Slot</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {['all', 'requested', 'approved', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((m) => (
            <div
              key={m._id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <span className="font-bold text-sm text-slate-900">{m.purpose}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {m.date}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {m.time}
                  </span>
                  <span className="flex items-center">
                    {m.meetingType === 'Online' ? (
                      <Video className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    )}
                    {m.meetingType}
                  </span>
                </div>
                {m.meetingLink && (
                  <p className="text-xs text-blue-600 font-semibold">
                    Venue / Link:{' '}
                    {m.meetingLink.startsWith('http') ? (
                      <a href={m.meetingLink} target="_blank" rel="noreferrer" className="underline">
                        {m.meetingLink}
                      </a>
                    ) : (
                      m.meetingLink
                    )}
                  </p>
                )}
                {m.notes && <p className="text-xs text-slate-600 italic">Notes: {m.notes}</p>}
              </div>

              {m.status === 'Completed' && (
                <Link
                  to="/student/counselling"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors shrink-0"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  <span>Fill Counselling Form</span>
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No meetings found under this tab.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Mentor Consultation"
        subtitle={`Select date, time, and topic to request an appointment`}
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meeting Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time Slot *
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMeetingType('In-Person')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  meetingType === 'In-Person'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                In-Person
              </button>
              <button
                type="button"
                onClick={() => setMeetingType('Online')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  meetingType === 'Online'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Online Video Call
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Discussion Agenda *
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="State the primary reason for consultation..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
