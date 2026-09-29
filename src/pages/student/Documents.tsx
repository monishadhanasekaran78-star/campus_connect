import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, FileText, CheckCircle2, Download, Trash2, AlertCircle } from 'lucide-react';
import { documentService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form State
  const [title, setTitle] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('Internship Certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await documentService.getMyDocuments();
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !documentType || !selectedFile) {
      alert('Please enter a document title, select document type, and attach a file.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('documentType', documentType);
      formData.append('file', selectedFile);

      const res = await documentService.uploadDocument(formData);
      if (res.data.success) {
        setSuccessMsg('Document uploaded successfully! It is queued for administrative verification.');
        setIsModalOpen(false);
        setTitle('');
        setSelectedFile(null);
        fetchDocuments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error uploading document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.deleteDocument(id);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document');
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
            <FolderOpen className="w-6 h-6 mr-2 text-blue-600" />
            Academic Document Vault & Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Upload your mandatory mark sheets, internship completions, and credentials for administrative verification.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-4 py-3.5">Uploaded</th>
                <th className="px-4 py-3.5">File Size</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.title}</p>
                          <p className="text-[11px] text-slate-400">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{doc.documentType}</td>
                    <td className="px-4 py-4 text-slate-500">{doc.uploadDate}</td>
                    <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">{doc.fileSize || '1.2 MB'}</td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={doc.status} />
                      {doc.remarks && (
                        <p className="text-[10px] text-slate-400 mt-1 italic max-w-xs mx-auto truncate">
                          {doc.remarks}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <a
                          href={doc.fileUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="View / Download File"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No documents uploaded yet. Upload your 10th & 12th marksheets for verification.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Student Credential"
        subtitle="Submit official certificates and marks sheets for verification"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Higher Secondary (12th) Mark Sheet"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Document Category *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="10th Marksheet">10th Marksheet</option>
              <option value="12th Marksheet">12th Marksheet</option>
              <option value="Internship Certificate">Internship Certificate</option>
              <option value="Academic Document">Academic Document / Transcripts</option>
              <option value="Other">Other Supporting Credential</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              File Attachment *
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">Accepted: PDF, Word Doc, PNG, JPG (max 15MB)</p>
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
              {submitting ? 'Uploading...' : 'Upload & Submit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
