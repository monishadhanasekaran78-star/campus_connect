import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, CheckCircle2, XCircle, Clock, Calendar, Paperclip, MessageSquare } from 'lucide-react';
import { odService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Modal } from '../../../components/common/Modal';

export const MentorODRequests: React.FC = () => {
  const [ods, setOds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOD, setSelectedOD] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchODs();
  }, []);

  const fetchODs = async () => {
    try {
      const res = await odService.getMentorODs();
      if (res.data.success) {
        setOds(res.data.ods || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAction = (od: any, action: 'approve' | 'reject') => {
    setSelectedOD(od);
    setActionType(action);
    setRemarks(action === 'approve' ? 'Approved for student participation.' : 'Request declined due to lab examination conflict.');
    setIsModalOpen(true);
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOD) return;

    setSubmitting(true);
    try {
      const res = await odService.mentorReviewOD(selectedOD._id, {
        action: actionType,
        remarks,
      });

      if (res.data.success) {
        setSuccessMsg(`OD request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.`);
        setIsModalOpen(false);
        fetchODs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing OD review');
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
          <FileSpreadsheet className="w-6 h-6 mr-2 text-emerald-600" />
          Mentee On-Duty (OD) Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review and approve secondary tier on-duty applications that have already been cleared by College Administration.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* OD Requests List */}
      <div className="space-y-4">
        {ods.length > 0 ? (
          ods.map((od) => {
            const isPendingMentor = od.finalStatus === 'Pending Mentor';

            return (
              <div
                key={od._id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-base text-slate-900">{od.studentName}</h3>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        {od.registerNumber}
                      </span>
                      <StatusBadge status={od.finalStatus} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {od.department} • Year {od.year}-{od.section}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Applied on {od.createdAt ? new Date(od.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Event / Purpose:</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{od.purpose}</p>
                    <p className="text-slate-500 mt-1 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {od.fromDate} to {od.toDate} ({od.daysCount} days)
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700">Reason / Justification:</span>
                    <p className="text-slate-600 mt-0.5">{od.reason}</p>
                    {od.adminRemarks && (
                      <p className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded-lg mt-2">
                        <span className="font-bold">Admin Verified:</span> "{od.adminRemarks}"
                      </p>
                    )}
                  </div>
                </div>

                {od.mentorRemarks && (
                  <div className="text-xs p-3 bg-slate-50 rounded-lg text-slate-700">
                    <span className="font-bold">Mentor Remarks on record:</span> {od.mentorRemarks}
                  </div>
                )}

                {/* Actions if pending */}
                {isPendingMentor && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenAction(od, 'reject')}
                      className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-xs transition-colors"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleOpenAction(od, 'approve')}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                    >
                      Approve OD
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No OD requests found for your assigned mentees.</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'approve' ? 'Approve Mentee OD Request' : 'Reject Mentee OD Request'}
        subtitle={`Student: ${selectedOD?.studentName} (${selectedOD?.registerNumber})`}
      >
        <form onSubmit={handleSubmitAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mentor Remarks / Guidance to Student *
            </label>
            <textarea
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add mentor observations or remedial instructions..."
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
              className={`px-5 py-2 text-white font-bold rounded-lg text-xs shadow-xs disabled:opacity-50 ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Updating...' : actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
