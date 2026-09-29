import React, { useState, useEffect } from 'react';
import { FolderOpen, FileText, Download } from 'lucide-react';
import { advisorService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const AdvisorDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [assignedClass, setAssignedClass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await advisorService.getDocuments();
      if (res.data.success) {
        setDocuments(res.data.documents || []);
        setAssignedClass(res.data.assignedClass);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <FolderOpen className="w-6 h-6 mr-2 text-purple-600" />
          Class Document Repository & Marksheets
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Year {assignedClass?.year} Section {assignedClass?.section} • 10th, 12th, and internship credentials.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-4 py-3.5">Uploaded</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{doc.studentName}</p>
                      <p className="font-mono text-[11px] font-bold text-purple-700">{doc.registerNumber}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{doc.title}</td>
                    <td className="px-6 py-4 text-slate-600">{doc.documentType}</td>
                    <td className="px-4 py-4 text-slate-500">{doc.uploadDate}</td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={doc.fileUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors inline-block"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No documents uploaded by students in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
