import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { odService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const ODRequests: React.FC = () => {
  const [ods, setOds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form State
  const [purpose, setPurpose] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [daysCount, setDaysCount] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchODs();
  }, []);

  const fetchODs = async () => {
    try {
      const res = await odService.getMyODs();
      if (res.data.success) {
        setOds(res.data.ods || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    if (from && to) {
      const start = new Date(from).getTime();
      const end = new Date(to).getTime();
      const diffDays = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)) + 1);
      setDaysCount(diffDays);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !fromDate || !toDate || !reason) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('purpose', purpose);
      formData.append('fromDate', fromDate);
      formData.append('toDate', toDate);
      formData.append('daysCount', String(daysCount));
      formData.append('reason', reason);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await odService.submitOD(formData);
      if (res.data.success) {
        setSuccessMsg('On-Duty (OD) request submitted! It has been routed to College Admin for initial review.');
        setIsModalOpen(false);
        setPurpose('');
        setFromDate('');
        setToDate('');
        setReason('');
        setSelectedFile(null);
        fetchODs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting OD request');
    } finally {
      setSubmitting(false);
    }
  };

  const getWorkflowStepStatus = (od: any, step: 'admin' | 'mentor' | 'advisor') => {
    if (step === 'admin') {
      if (od.adminStatus === 'Approved') return 'complete';
      if (od.adminStatus === 'Rejected') return 'rejected';
      return 'active';
    }
    if (step === 'mentor') {
      if (od.adminStatus !== 'Approved') return 'upcoming';
      if (od.mentorStatus === 'Approved') return 'complete';
      if (od.mentorStatus === 'Rejected') return 'rejected';
      return 'active';
    }
    if (step === 'advisor') {
      if (od.mentorStatus === 'Approved') return 'complete';
      return 'upcoming';
    }
    return 'upcoming';
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
            <FileSpreadsheet className="w-6 h-6 mr-2 text-blue-600" />
            On-Duty (OD) Application & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Submit on-duty requests for symposiums, sports, hackathons, and track multi-tier approvals.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for OD</span>
        </button>
      </div>

      {/* Workflow Explainer Banner */}
      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between text-xs text-blue-900 gap-3">
        <div className="font-bold">Official Approval Hierarchy:</div>
        <div className="flex items-center space-x-2 text-[11px] font-semibold">
          <span className="px-2 py-0.5 bg-white rounded-md border border-blue-200">1. Student Submits</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="px-2 py-0.5 bg-white rounded-md border border-blue-200">2. Admin Verification</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="px-2 py-0.5 bg-white rounded-md border border-blue-200">3. Mentor Approval</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="px-2 py-0.5 bg-white rounded-md border border-blue-200">4. Advisor Record</span>
        </div>
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
            const adminStep = getWorkflowStepStatus(od, 'admin');
            const mentorStep = getWorkflowStepStatus(od, 'mentor');
            const advisorStep = getWorkflowStepStatus(od, 'advisor');

            return (
              <div
                key={od._id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-sm text-slate-900">{od.purpose}</h3>
                      <StatusBadge status={od.finalStatus} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {od.fromDate} to {od.toDate} ({od.daysCount} day{od.daysCount > 1 ? 's' : ''})
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Applied on {od.createdAt ? new Date(od.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                  <span className="font-bold text-slate-800">Reason / Justification: </span>
                  {od.reason}
                </div>

                {od.supportingDocument && (
                  <div className="flex items-center space-x-2 text-xs text-blue-600 font-semibold">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Proof: {od.documentName || 'Supporting Attachment'}</span>
                  </div>
                )}

                {/* Visual Workflow Steps */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Approval Progress:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {/* Step 1: Admin */}
                    <div
                      className={`p-2 rounded-lg border font-semibold ${
                        adminStep === 'complete'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : adminStep === 'rejected'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      <div className="font-bold">1. Admin Review</div>
                      <div className="text-[10px] mt-0.5">
                        {adminStep === 'complete'
                          ? 'Approved'
                          : adminStep === 'rejected'
                          ? 'Rejected'
                          : 'Pending'}
                      </div>
                      {od.adminRemarks && (
                        <div className="text-[10px] italic mt-1 border-t border-slate-200/50 pt-1">
                          "{od.adminRemarks}"
                        </div>
                      )}
                    </div>

                    {/* Step 2: Mentor */}
                    <div
                      className={`p-2 rounded-lg border font-semibold ${
                        mentorStep === 'complete'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : mentorStep === 'rejected'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : mentorStep === 'active'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">2. Mentor Review</div>
                      <div className="text-[10px] mt-0.5">
                        {mentorStep === 'complete'
                          ? 'Approved'
                          : mentorStep === 'rejected'
                          ? 'Rejected'
                          : mentorStep === 'active'
                          ? 'Pending'
                          : 'Awaiting Admin'}
                      </div>
                      {od.mentorRemarks && (
                        <div className="text-[10px] italic mt-1 border-t border-slate-200/50 pt-1">
                          "{od.mentorRemarks}"
                        </div>
                      )}
                    </div>

                    {/* Step 3: Class Advisor */}
                    <div
                      className={`p-2 rounded-lg border font-semibold ${
                        advisorStep === 'complete'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">3. Class Advisor</div>
                      <div className="text-[10px] mt-0.5">
                        {advisorStep === 'complete' ? 'Notified & Recorded' : 'Pending Approvals'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              No On-Duty requests filed yet. Click "Apply for OD" to submit an application.
            </p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit On-Duty (OD) Request"
        subtitle="Provide event details, dates, and attach supporting proof"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Purpose / Event Name *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. National Hackathon / Inter-College Symposium / Sports Tournament"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                From Date *
              </label>
              <input
                type="date"
                required
                value={fromDate}
                onChange={(e) => handleDateChange(e.target.value, toDate)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                To Date *
              </label>
              <input
                type="date"
                required
                value={toDate}
                onChange={(e) => handleDateChange(fromDate, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Days
              </label>
              <input
                type="number"
                readOnly
                value={daysCount}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-blue-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Reason / Description *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail your participation role, organizing institution, and outcomes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supporting Proof / Acceptance Letter (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">Accepted: PDF, Word docs, PNG, JPG (max 10MB)</p>
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
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
