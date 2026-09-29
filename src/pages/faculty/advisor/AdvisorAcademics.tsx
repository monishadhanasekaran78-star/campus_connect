import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, TrendingUp } from 'lucide-react';
import { advisorService } from '../../../services/api';

export const AdvisorAcademics: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [assignedClass, setAssignedClass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAcademics();
  }, []);

  const fetchAcademics = async () => {
    try {
      const res = await advisorService.getAcademics();
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
          <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />
          Class Academic Performance & SGPA Register
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Year {assignedClass?.year} Section {assignedClass?.section} • Cumulative GPA and semester course scores.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-4 py-3.5 text-center">Semester SGPA</th>
                <th className="px-4 py-3.5 text-center">Cumulative CGPA</th>
                <th className="px-4 py-3.5 text-center">Backlogs</th>
                <th className="px-6 py-3.5 text-right">Academic Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{r.studentName}</p>
                    <p className="font-mono text-[11px] font-bold text-purple-700">{r.registerNumber}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">Semester {r.semester}</td>
                  <td className="px-4 py-4 text-center font-bold text-blue-700 text-sm">{r.sgpa}</td>
                  <td className="px-4 py-4 text-center font-black text-slate-900 text-sm">{r.cgpa}</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-600">{r.backlogsCount || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        r.cgpa >= 8.5
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.cgpa >= 7.0
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {r.cgpa >= 8.5 ? 'First Class (Distinction)' : 'First Class'}
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
