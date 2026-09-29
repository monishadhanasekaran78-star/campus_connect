import React, { useState, useEffect } from 'react';
import { MessageSquareHeart, CheckCircle2, Clock, Calendar, Edit3, Sparkles } from 'lucide-react';
import { counsellingService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Modal } from '../../../components/common/Modal';

export const MentorCounselling: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [mentorRemarks, setMentorRemarks] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [followUpAction, setFollowUpAction] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [followUpStatus, setFollowUpStatus] = useState<string>('In Progress');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await counsellingService.getMentorList();
      if (res.data.success) {
        setRecords(res.data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (rec: any) => {
    setSelectedRecord(rec);
    setMentorRemarks(rec.mentorRemarks || '');
    setSuggestions(rec.suggestions || '');
    setFollowUpAction(rec.followUpAction || '');
    setFollowUpDate(rec.followUpDate || '');
    setFollowUpStatus(rec.followUpStatus || 'In Progress');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSubmitting(true);
    try {
      const res = await counsellingService.addMentorRemarks(selectedRecord._id, {
        mentorRemarks,
        suggestions,
        followUpAction,
        followUpDate,
        followUpStatus,
      });

      if (res.data.success) {
        setSuccessMsg('Mentor feedback and action plan recorded successfully!');
        setIsModalOpen(false);
        fetchRecords();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating counselling record');
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
          <MessageSquareHeart className="w-6 h-6 mr-2 text-emerald-600" />
          Mentee Counselling Records & Review
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review self-reported student notes, assign corrective suggestions, and monitor remedial action plans.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Counselling List */}
      <div className="space-y-4">
        {records.length > 0 ? (
          records.map((rec) => (
            <div
              key={rec._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="font-bold text-sm text-slate-900">{rec.studentName}</h3>
                    <span className="font-mono text-xs text-slate-500 font-semibold">{rec.registerNumber}</span>
                    <StatusBadge status={rec.followUpStatus} />
                  </div>
                  <p className="text-xs font-semibold text-emerald-800 mt-1">Topic: {rec.discussionTopic}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400">
                    Session: {rec.meetingDate}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(rec)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{rec.mentorRemarks ? 'Edit Remarks' : 'Add Remarks'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Student side */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Student's Shared Details:
                  </span>
                  {rec.academicConcerns && (
                    <p><span className="font-bold text-slate-700">Academic Concerns: </span>{rec.academicConcerns}</p>
                  )}
                  {rec.careerConcerns && (
                    <p><span className="font-bold text-slate-700">Career Goals: </span>{rec.careerConcerns}</p>
                  )}
                  {rec.developmentGoals && (
                    <p><span className="font-bold text-slate-700">Action Commitments: </span>{rec.developmentGoals}</p>
                  )}
                  {rec.studentFeedback && (
                    <p className="italic text-slate-500"><span className="font-bold not-italic text-slate-700">Feedback: </span>"{rec.studentFeedback}"</p>
                  )}
                </div>

                {/* Mentor side */}
                <div className="space-y-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> Mentor Guidance on Record:
                  </span>
                  {rec.mentorRemarks ? (
                    <>
                      <p><span className="font-bold text-slate-800">Faculty Remarks: </span>{rec.mentorRemarks}</p>
                      {rec.suggestions && (
                        <p><span className="font-bold text-slate-800">Recommendations: </span>{rec.suggestions}</p>
                      )}
                      {rec.followUpAction && (
                        <p className="text-emerald-900 font-semibold bg-white p-2 rounded-md border border-emerald-200">
                          <span className="font-bold text-emerald-950">Next Follow-up Task: </span>
                          {rec.followUpAction} {rec.followUpDate ? `(Due: ${rec.followUpDate})` : ''}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-slate-400 italic py-2">
                      No remarks recorded yet. Click "Add Remarks" to evaluate.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <MessageSquareHeart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No counselling records submitted by mentees yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Mentor Evaluation & Counselling Guidance"
        subtitle={`Session review for ${selectedRecord?.studentName} (${selectedRecord?.registerNumber})`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mentor Remarks & Observations *
            </label>
            <textarea
              required
              rows={3}
              value={mentorRemarks}
              onChange={(e) => setMentorRemarks(e.target.value)}
              placeholder="State student's strengths, consistency, and areas requiring improvement..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Suggestions & Recommendations
            </label>
            <textarea
              rows={2}
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="e.g. Focus on Operating Systems concurrency, solve 2 LeetCode problems daily..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Follow-up Action Item
              </label>
              <input
                type="text"
                value={followUpAction}
                onChange={(e) => setFollowUpAction(e.target.value)}
                placeholder="e.g. Review lab code repository and project architecture"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Follow-up Target Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Follow-up Status
            </label>
            <select
              value={followUpStatus}
              onChange={(e) => setFollowUpStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
            >
              <option value="Pending">Pending Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed / Satisfied</option>
            </select>
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
              {submitting ? 'Saving...' : 'Save Feedback'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
