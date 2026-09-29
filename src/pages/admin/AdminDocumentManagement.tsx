import React, { useState, useEffect } from 'react';
import { FolderOpen, CheckCircle2, XCircle, Download, Search, Check, AlertCircle } from 'lucide-react';
import { documentService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const AdminDocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  // Verify Modal
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<'Verified' | 'Rejected'>('Verified');
  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await documentService.getAllDocumentsAdmin();
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAction = (doc: any, status: 'Verified' | 'Rejected') => {
    setSelectedDoc(doc);
    setActionStatus(status);
    setRemarks(status === 'Verified' ? 'Original certificate verified with records.' : 'Ineligible or unclear document copy.');
    setIsModalOpen(true);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setSubmitting(true);
    try {
      const res = await documentService.verifyDocument(selectedDoc._id, {
        status: actionStatus,
        remarks,
      });

      if (res.data.success) {
        setSuccessMsg(`Document ${actionStatus.toLowerCase()} successfully.`);
        setIsModalOpen(false);
        fetchDocuments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating document');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = documents.filter((doc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      doc.studentName?.toLowerCase().includes(q) ||
      doc.registerNumber?.toLowerCase().includes(q) ||
      doc.title?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    return doc.status?.toLowerCase() === filter.toLowerCase();
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
            <FolderOpen className="w-6 h-6 mr-2 text-rose-600" />
            Institutional Document Verification Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit student 10th/12th marksheets, internship credentials, and identity documents.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or doc..."
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
        {['all', 'pending', 'verified', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
              filter === tab
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Document Details</th>
                <th className="px-4 py-3.5">Uploaded</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5">Verification Remarks</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{doc.studentName}</p>
                    <p className="font-mono text-[11px] font-bold text-blue-700">{doc.registerNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{doc.title}</p>
                    <p className="text-[11px] text-slate-500">{doc.documentType} • {doc.fileSize || '1.2 MB'}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{doc.uploadDate}</td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                    {doc.remarks || 'No remarks recorded'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center space-x-2">
                      <a
                        href={doc.fileUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                        title="Download Attachment"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {doc.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleOpenAction(doc, 'Verified')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px] transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleOpenAction(doc, 'Rejected')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionStatus === 'Verified' ? 'Verify Student Credential' : 'Reject Document'}
        subtitle={`Student: ${selectedDoc?.studentName} • ${selectedDoc?.title}`}
      >
        <form onSubmit={handleSubmitVerification} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Verification Remarks / Observations *
            </label>
            <textarea
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="State verification audit notes or rejection reasons..."
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
                actionStatus === 'Verified'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Updating...' : `Confirm ${actionStatus}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
