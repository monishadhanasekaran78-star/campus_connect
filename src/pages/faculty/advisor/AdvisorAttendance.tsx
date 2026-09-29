import React, { useState, useEffect } from 'react';
import { ClipboardCheck, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { advisorService } from '../../../services/api';

export const AdvisorAttendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [assignedClass, setAssignedClass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await advisorService.getAttendance();
      if (res.data.success) {
        setRecords(res.data.records || []);
        setAssignedClass(res.data.assignedClass);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter((r) =>
    r.registerNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
    r.subjectCode?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const lowAttendanceCount = records.filter((r) => (r.percentage || 0) < 75).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <ClipboardCheck className="w-6 h-6 mr-2 text-purple-600" />
            Class Attendance Register & Defaulter Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Year {assignedClass?.year} Section {assignedClass?.section} • Subject-wise attendance compliance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {lowAttendanceCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              {lowAttendanceCount} Shortfall Alerts
            </span>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Register No</th>
                <th className="px-6 py-3.5">Course Code</th>
                <th className="px-6 py-3.5">Course Name</th>
                <th className="px-4 py-3.5 text-center">Attended / Total</th>
                <th className="px-4 py-3.5 text-center">Percentage</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((att, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-purple-700">{att.registerNumber}</td>
                  <td className="px-6 py-3.5 font-mono text-slate-500">{att.subjectCode}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{att.subjectName}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                    {att.attendedClasses} / {att.totalClasses}
                  </td>
                  <td className="px-4 py-3.5 text-center font-black text-sm">
                    {att.percentage}%
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        att.percentage >= 75
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {att.percentage >= 75 ? 'Satisfactory' : 'Below 75%'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
