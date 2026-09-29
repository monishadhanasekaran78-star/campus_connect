import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import { mentorService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Link } from 'react-router-dom';

export const MentorPlacementProgress: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await mentorService.getDashboard();
      if (res.data.success) {
        setData(res.data.data);
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
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const mentees = data?.mentees || [];
  const placementApps = data?.placementApps || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <Briefcase className="w-6 h-6 mr-2 text-emerald-600" />
          Mentee Career & Placement Progression
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Monitor your mentees' interview rounds, shortlisted profiles, and offers across campus drives.
        </p>
      </div>

      {/* Applications Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
            Active Mentee Placement Drives
          </h2>
          <span className="text-xs font-semibold text-slate-400">Total: {placementApps.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Role & Package</th>
                <th className="px-4 py-3.5 text-center">Current Stage</th>
                <th className="px-6 py-3.5 text-right">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {placementApps.length > 0 ? (
                placementApps.map((app: any) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{app.studentName}</p>
                      <p className="text-[11px] font-mono text-emerald-700 font-semibold">{app.registerNumber}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{app.companyName}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800">{app.jobRole}</p>
                      <p className="text-[11px] font-bold text-emerald-700">{app.packageLPA} LPA</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={app.currentStage} />
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No active placement applications recorded for mentees.
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
