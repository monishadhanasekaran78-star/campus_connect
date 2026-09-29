import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Mail,
  Phone,
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  Video,
  ArrowRight
} from 'lucide-react';
import { studentService, meetingService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const MyMentor: React.FC = () => {
  const [mentor, setMentor] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('10:00 AM');
  const [meetingType, setMeetingType] = useState<string>('In-Person');
  const [purpose, setPurpose] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      const res = await studentService.getMyMentor();
      if (res.data.success) {
        setMentor(res.data.mentor);
        setSlots(res.data.availableSlots || []);
        setMeetings(res.data.meetings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !purpose) return;

    setSubmitting(true);
    try {
      const res = await meetingService.requestMeeting({
        date,
        time,
        meetingType,
        purpose,
      });

      if (res.data.success) {
        setSuccessMsg('Meeting requested successfully! Awaiting mentor confirmation.');
        setIsModalOpen(false);
        setPurpose('');
        setDate('');
        fetchMentorData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit meeting request');
    } finally {
      setSubmitting(false);
    }
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            My Faculty Mentor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Connect with your assigned mentor for academic guidance, career roadmap, and periodic counselling.
          </p>
        </div>

        {mentor && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Request Meeting</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {mentor ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mentor Profile Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-600/25">
                {mentor.name?.charAt(0)}
              </div>
              <h2 className="mt-3 font-bold text-base text-slate-900">{mentor.name}</h2>
              <p className="text-xs text-blue-600 font-semibold">{mentor.designation}</p>
              <p className="text-[11px] text-slate-500">{mentor.department}</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{mentor.officeLocation || 'Academic Block'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{mentor.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{mentor.phone || 'Available via portal'}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/student/counselling"
                className="w-full block text-center py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                View Counselling Records
              </Link>
            </div>
          </div>

          {/* Available Slots & Upcoming Meetings */}
          <div className="md:col-span-2 space-y-6">
            {/* Available Slots Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                Mentor Office Availability & Consultation Slots
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {slots.length > 0 ? (
                  slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center"
                    >
                      <p className="text-xs font-bold text-slate-900">{slot.day}</p>
                      <p className="text-[11px] text-indigo-600 font-semibold mt-1">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Walk-in & Slots Open
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-3">No custom slots published.</p>
                )}
              </div>
            </div>

            {/* Meetings History with Mentor */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Meeting History
                </h3>
                <Link to="/student/meetings" className="text-xs text-blue-600 hover:underline font-semibold">
                  Manage Meetings
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {meetings.length > 0 ? (
                  meetings.map((m) => (
                    <div key={m._id} className="py-3 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{m.purpose}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {m.date} at {m.time} • {m.meetingType}
                        </p>
                        {m.meetingLink && (
                          <a
                            href={m.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:underline font-semibold"
                          >
                            <Video className="w-3.5 h-3.5 mr-1" />
                            {m.meetingLink.startsWith('http') ? 'Join Online Call' : m.meetingLink}
                          </a>
                        )}
                      </div>

                      {m.status === 'Completed' && (
                        <Link
                          to="/student/counselling"
                          className="text-[11px] text-indigo-600 font-bold hover:underline shrink-0 flex items-center"
                        >
                          Counselling Record <ArrowRight className="w-3 h-3 ml-0.5" />
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No meetings scheduled yet. Click "Request Meeting" above.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Mentor Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            College administration assigns mentors during the start of the academic cycle.
          </p>
        </div>
      )}

      {/* Request Meeting Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Mentor Meeting"
        subtitle={`Schedule an academic or career consultation with ${mentor?.name || 'Mentor'}`}
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Date *
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
                Preferred Time Slot *
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meeting Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center p-2.5 border rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  meetingType === 'In-Person'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="mtype"
                  value="In-Person"
                  checked={meetingType === 'In-Person'}
                  onChange={() => setMeetingType('In-Person')}
                  className="sr-only"
                />
                In-Person (Faculty Cabin)
              </label>

              <label
                className={`flex items-center justify-center p-2.5 border rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  meetingType === 'Online'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="mtype"
                  value="Online"
                  checked={meetingType === 'Online'}
                  onChange={() => setMeetingType('Online')}
                  className="sr-only"
                />
                Online Video Call
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Purpose / Discussion Topics *
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Discuss semester academic performance, final project guidance, or placement preparation..."
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
              {submitting ? 'Submitting Request...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
