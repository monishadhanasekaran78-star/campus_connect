import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, CheckCircle2, XCircle, Search, Calendar, Paperclip } from 'lucide-react';
import { odService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const AdminODManagement: React.FC = () => {
  const [ods, setOds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  // Review Modal
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
      const res = await odService.getAllODsAdmin();
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
    setRemarks(action === 'approve' ? 'Verified by Office of Student Affairs.' : 'Supporting credentials missing or unverified.');
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOD) return;

    setSubmitting(true);
    try {
      const res = await odService.adminReviewOD(selectedOD._id, {
        action: actionType,
        remarks,
      });

      if (res.data.success) {
        setSuccessMsg(`OD request ${actionType === 'approve' ? 'approved & forwarded to mentor' : 'rejected'} successfully.`);
        setIsModalOpen(false);
        fetchODs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing OD review');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = ods.filter((od) => {
    const q = search.toLowerCase();
    const matchesSearch =
      od.studentName?.toLowerCase().includes(q) ||
      od.registerNumber?.toLowerCase().includes(q) ||
      od.purpose?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'pending') return od.finalStatus === 'Pending Admin';
    if (filter === 'approved') return od.adminStatus === 'Approved';
    if (filter === 'rejected') return od.adminStatus === 'Rejected';
    return true;
  });

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
            <FileSpreadsheet className="w-6 h-6 mr-2 text-rose-600" />
            Institutional On-Duty (OD) Management & Tier-1 Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluate collegiate OD requests before routing approved applications to assigned faculty mentors.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search OD requests..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {[
          { label: 'All Requests', value: 'all' },
          { label: 'Pending Admin Review', value: 'pending' },
          { label: 'Admin Approved', value: 'approved' },
          { label: 'Admin Rejected', value: 'rejected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === tab.value
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OD List */}
      <div className="space-y-4">
        {filtered.map((od) => {
          const isPendingAdmin = od.finalStatus === 'Pending Admin';

          return (
            <div
              key={od._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="font-bold text-sm text-slate-900">{od.studentName}</h3>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                      {od.registerNumber}
                    </span>
                    <StatusBadge status={od.finalStatus} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {od.department} • Year {od.year}-{od.section}
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  Applied: {od.createdAt ? new Date(od.createdAt).toLocaleDateString() : ''}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Purpose:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{od.purpose}</p>
                  <p className="text-slate-500 mt-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {od.fromDate} to {od.toDate} ({od.daysCount} days)
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700">Reason / Details:</span>
                  <p className="text-slate-600 mt-0.5">{od.reason}</p>
                  {od.supportingDocument && (
                    <div className="mt-2 text-blue-600 font-semibold flex items-center space-x-1">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Attached: {od.documentName || 'Document'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons if Pending Admin */}
              {isPendingAdmin && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleOpenAction(od, 'reject')}
                    className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-xs transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleOpenAction(od, 'approve')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                  >
                    Approve (Pass to Mentor)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'approve' ? 'Approve OD Application' : 'Reject OD Application'}
        subtitle={`Student: ${selectedOD?.studentName} (${selectedOD?.registerNumber})`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Administrative Review Remarks *
            </label>
            <textarea
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="State approval confirmation or reason for decline..."
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
              className={`px-5 py-2 text-white font-bold rounded-lg text-xs shadow-xs disabled:opacity-50 ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Processing...' : actionType === 'approve' ? 'Approve & Route to Mentor' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
