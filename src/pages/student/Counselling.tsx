import React, { useState, useEffect } from 'react';
import { MessageSquareHeart, Plus, CheckCircle2, Clock, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { counsellingService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const Counselling: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form State
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [discussionTopic, setDiscussionTopic] = useState<string>('');
  const [academicConcerns, setAcademicConcerns] = useState<string>('');
  const [careerConcerns, setCareerConcerns] = useState<string>('');
  const [developmentGoals, setDevelopmentGoals] = useState<string>('');
  const [studentFeedback, setStudentFeedback] = useState<string>('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await counsellingService.getMyHistory();
      if (res.data.success) {
        setRecords(res.data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionTopic || !meetingDate) return;

    setSubmitting(true);
    try {
      const res = await counsellingService.submitRecord({
        meetingDate,
        discussionTopic,
        academicConcerns,
        careerConcerns,
        developmentGoals,
        studentFeedback,
      });

      if (res.data.success) {
        setSuccessMsg('Counselling feedback submitted! Your mentor will review and attach action recommendations.');
        setIsModalOpen(false);
        setDiscussionTopic('');
        setAcademicConcerns('');
        setCareerConcerns('');
        setDevelopmentGoals('');
        setStudentFeedback('');
        fetchRecords();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting counselling record');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <MessageSquareHeart className="w-6 h-6 mr-2 text-blue-600" />
            Mentor-Mentee Counselling Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log discussion takeaways, academic/career concerns, and track follow-up advice from your mentor.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Counselling Record</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* History Cards */}
      <div className="space-y-4">
        {records.length > 0 ? (
          records.map((rec) => (
            <div
              key={rec._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">{rec.discussionTopic}</h3>
                    <StatusBadge status={rec.followUpStatus} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Session on {rec.meetingDate} with Mentor {rec.mentorName}
                  </p>
                </div>
                {rec.followUpDate && (
                  <div className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg font-semibold flex items-center self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Follow-up: {rec.followUpDate}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student's Input */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Student Discussion Notes
                  </h4>

                  {rec.academicConcerns && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">Academic Concerns:</p>
                      <p className="text-xs text-slate-600 mt-0.5">{rec.academicConcerns}</p>
                    </div>
                  )}

                  {rec.careerConcerns && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">Career & Placement Concerns:</p>
                      <p className="text-xs text-slate-600 mt-0.5">{rec.careerConcerns}</p>
                    </div>
                  )}

                  {rec.developmentGoals && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">Goals & Targets:</p>
                      <p className="text-xs text-slate-600 mt-0.5">{rec.developmentGoals}</p>
                    </div>
                  )}

                  {rec.studentFeedback && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">Student Feedback:</p>
                      <p className="text-xs text-slate-600 mt-0.5 italic">{rec.studentFeedback}</p>
                    </div>
                  )}
                </div>

                {/* Mentor's Feedback & Suggestions */}
                <div className="space-y-3 md:border-l md:border-slate-100 md:pl-6 bg-slate-50/50 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Mentor Remarks & Action Plan
                  </h4>

                  {rec.mentorRemarks ? (
                    <>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Faculty Remarks:</p>
                        <p className="text-xs text-slate-700 mt-0.5 font-medium">{rec.mentorRemarks}</p>
                      </div>

                      {rec.suggestions && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-800">Recommendations:</p>
                          <p className="text-xs text-slate-600 mt-0.5">{rec.suggestions}</p>
                        </div>
                      )}

                      {rec.followUpAction && (
                        <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-[11px] font-bold text-blue-800">Next Action Item:</p>
                          <p className="text-xs text-blue-900 mt-0.5">{rec.followUpAction}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 py-3 italic">
                      Mentor remarks are pending review.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <MessageSquareHeart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              No counselling records logged yet. Click "New Counselling Record" to submit details of your latest session.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Counselling Session Details"
        subtitle="Record discussion notes, academic goals, and challenges for mentor review"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meeting Date *
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discussion Topic / Focus Area *
              </label>
              <input
                type="text"
                required
                value={discussionTopic}
                onChange={(e) => setDiscussionTopic(e.target.value)}
                placeholder="e.g. Semester 5 Performance Review & Placement Strategy"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Academic Concerns (if any)
            </label>
            <textarea
              rows={2}
              value={academicConcerns}
              onChange={(e) => setAcademicConcerns(e.target.value)}
              placeholder="e.g. Difficulties with compiler lab or internal exam preparations..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Career / Placement Guidance Needed
            </label>
            <textarea
              rows={2}
              value={careerConcerns}
              onChange={(e) => setCareerConcerns(e.target.value)}
              placeholder="e.g. Guidance on targeting product vs service companies..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Development Goals & Commitments
            </label>
            <textarea
              rows={2}
              value={developmentGoals}
              onChange={(e) => setDevelopmentGoals(e.target.value)}
              placeholder="e.g. Solve 30 DSA questions, attend AI hackathon, publish conference paper..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Reflection / Session Feedback
            </label>
            <textarea
              rows={2}
              value={studentFeedback}
              onChange={(e) => setStudentFeedback(e.target.value)}
              placeholder="How helpful was this consultation session?"
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
              {submitting ? 'Submitting...' : 'Save Counselling Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
