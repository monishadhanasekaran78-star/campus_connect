import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, Award, Briefcase, FileSpreadsheet } from 'lucide-react';
import { adminService, placementService, odService } from '../../services/api';

export const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [ods, setOds] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [adminRes, odRes, driveRes] = await Promise.all([
        adminService.getDashboard(),
        odService.getAllODsAdmin(),
        placementService.getDrives(),
      ]);

      if (adminRes.data.success) setStats(adminRes.data.stats);
      if (odRes.data.success) setOds(odRes.data.ods || []);
      if (driveRes.data.success) setDrives(driveRes.data.drives || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const approvedODs = ods.filter((o) => o.finalStatus === 'Mentor Approved').length;
  const pendingODs = ods.filter((o) => o.finalStatus.includes('Pending')).length;
  const rejectedODs = ods.filter((o) => o.finalStatus.includes('Rejected')).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-rose-600" />
          Institutional Analytics & Academic Governance Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          High-level operational audits, on-duty approvals ratio, and career placement metrics.
        </p>
      </div>

      {/* Grid 1: Key Audits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Enrollment</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalStudents || 0} Students</h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">100% Verified in Database</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Mentors</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{stats?.totalMentors || 0} Mentors</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active Consultations</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">OD Approval Rate</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {ods.length > 0 ? Math.round((approvedODs / ods.length) * 100) : 0}%
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">{approvedODs} Approved / {ods.length} Filed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placement Drives</p>
          <h3 className="text-2xl font-black text-rose-700 mt-1">{drives.length} Drives</h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Tier-1 & Core Recruiters</p>
        </div>
      </div>

      {/* Detailed Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OD Management Ratio */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-rose-600" />
            On-Duty (OD) Multi-Tier Workflow Distribution
          </h2>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-700">Fully Approved (Admin + Mentor)</span>
                <span>{approvedODs} requests</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${ods.length > 0 ? (approvedODs / ods.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-700">Under Multi-Tier Verification</span>
                <span>{pendingODs} requests</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${ods.length > 0 ? (pendingODs / ods.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-rose-700">Rejected (Admin or Mentor)</span>
                <span>{rejectedODs} requests</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${ods.length > 0 ? (rejectedODs / ods.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Placement Compensation Benchmark */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-rose-600" />
            Campus Placement CTC Distribution
          </h2>

          <div className="divide-y divide-slate-100">
            {drives.map((d) => (
              <div key={d._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{d.companyName}</p>
                  <p className="text-[11px] text-slate-500">{d.jobRole}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700">{d.packageLPA} LPA</span>
                  <p className="text-[10px] text-slate-400">{d.driveType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
