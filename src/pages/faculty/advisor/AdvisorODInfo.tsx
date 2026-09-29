import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Calendar, CheckCircle2 } from 'lucide-react';
import { advisorService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const AdvisorODInfo: React.FC = () => {
  const [ods, setOds] = useState<any[]>([]);
  const [assignedClass, setAssignedClass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchODs();
  }, []);

  const fetchODs = async () => {
    try {
      const res = await advisorService.getApprovedODs();
      if (res.data.success) {
        setOds(res.data.ods || []);
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
          <FileSpreadsheet className="w-6 h-6 mr-2 text-purple-600" />
          Approved On-Duty (OD) Records – Year {assignedClass?.year} Section {assignedClass?.section}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {assignedClass?.department} • Authorized OD leaves acknowledged by College Admin and Faculty Mentors.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Event / Purpose</th>
                <th className="px-4 py-3.5 text-center">Duration</th>
                <th className="px-6 py-3.5">Reason / Justification</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Approval Hierarchy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {ods.length > 0 ? (
                ods.map((od) => (
                  <tr key={od._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{od.studentName}</p>
                      <p className="font-mono text-[11px] font-bold text-purple-700">{od.registerNumber}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{od.purpose}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-slate-800">{od.daysCount} Day(s)</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{od.fromDate} to {od.toDate}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{od.reason}</td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={od.finalStatus} />
                    </td>
                    <td className="px-6 py-4 text-right space-y-0.5">
                      <p className="text-[11px] font-semibold text-emerald-700">✓ Admin & Mentor Approved</p>
                      <p className="text-[10px] text-slate-400">Recorded for Attendance Exemption</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No approved on-duty records in this class.
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
