import React, { useState, useEffect } from 'react';
import { Briefcase, Award, TrendingUp } from 'lucide-react';
import { advisorService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const AdvisorPlacement: React.FC = () => {
  const [placements, setPlacements] = useState<any[]>([]);
  const [assignedClass, setAssignedClass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPlacement();
  }, []);

  const fetchPlacement = async () => {
    try {
      const res = await advisorService.getPlacement();
      if (res.data.success) {
        setPlacements(res.data.placements || []);
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

  const selectedCount = placements.filter((p) => p.currentStage === 'Selected').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-purple-600" />
            Class Placement Status – Year {assignedClass?.year} Section {assignedClass?.section}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {assignedClass?.department} • Track campus recruitment drive performance and company selections.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>{selectedCount} Confirmed Placements</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Recruiting Company</th>
                <th className="px-6 py-3.5">Designation & Package</th>
                <th className="px-4 py-3.5 text-center">Current Round</th>
                <th className="px-6 py-3.5 text-right">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {placements.length > 0 ? (
                placements.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{p.studentName}</p>
                      <p className="font-mono text-[11px] font-bold text-purple-700">{p.registerNumber}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{p.companyName}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-semibold">{p.jobRole}</p>
                      <p className="text-[11px] font-bold text-emerald-700">{p.packageLPA} LPA</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={p.currentStage} />
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {p.appliedAt ? new Date(p.appliedAt).toLocaleDateString() : ''}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No placement applications recorded in this class.
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
