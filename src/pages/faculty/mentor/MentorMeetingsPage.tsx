import React, { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, CheckCircle2, XCircle, Clock, Check, Edit2 } from 'lucide-react';
import { meetingService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Modal } from '../../../components/common/Modal';

export const MentorMeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('Approved');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await meetingService.getMyMeetings();
      if (res.data.success) {
        setMeetings(res.data.meetings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAction = (meeting: any, status: string) => {
    setSelectedMeeting(meeting);
    setNewStatus(status);
    setMeetingLink(meeting.meetingLink || (meeting.meetingType === 'Online' ? 'https://meet.google.com/xyz-camp-usn' : 'Cabin B-204'));
    setNotes(meeting.notes || '');
    setIsModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    setSubmitting(true);
    try {
      const res = await meetingService.updateMeetingStatus(selectedMeeting._id, {
        status: newStatus,
        meetingLink,
        notes,
      });

      if (res.data.success) {
        setSuccessMsg(`Meeting status changed to ${newStatus}.`);
        setIsModalOpen(false);
        fetchMeetings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating meeting');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
          Mentorship Consultations & Meeting Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Accept or reschedule mentee meeting requests, publish video conference links, and log meeting conclusions.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.length > 0 ? (
          meetings.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-bold text-sm text-slate-900">{m.studentName}</h3>
                  <span className="font-mono text-xs text-slate-500 font-semibold">{m.registerNumber}</span>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-xs text-slate-700 font-semibold">{m.purpose}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {m.date} at {m.time}
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
                    Venue / Link: {m.meetingLink}
                  </p>
                )}
                {m.notes && <p className="text-xs text-slate-500 italic">Notes: {m.notes}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {m.status === 'Requested' && (
                  <>
                    <button
                      onClick={() => handleOpenAction(m, 'Approved')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      Accept & Schedule
                    </button>
                    <button
                      onClick={() => handleOpenAction(m, 'Rejected')}
                      className="px-3.5 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-xs transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}

                {m.status === 'Approved' && (
                  <>
                    <button
                      onClick={() => handleOpenAction(m, 'Completed')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleOpenAction(m, 'Approved')}
                      className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
                      title="Edit Link / Notes"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No mentorship meetings logged.</p>
          </div>
        )}
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Mentorship Consultation"
        subtitle={`Student: ${selectedMeeting?.studentName} (${selectedMeeting?.date} at ${selectedMeeting?.time})`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Consultation Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
            >
              <option value="Approved">Approved / Scheduled</option>
              <option value="Completed">Completed Session</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Venue / Meeting Video URL
            </label>
            <input
              type="text"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="e.g. Faculty Cabin B-204 or Google Meet link..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mentor Instructions / Pre-meeting Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Please bring your Semester 5 mark sheet draft..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Consultation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
