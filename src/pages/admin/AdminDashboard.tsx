import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  GraduationCap,
  FileSpreadsheet,
  FolderOpen,
  Briefcase,
  Megaphone,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { adminService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminService.getDashboard();
      if (res.data.success) {
        setData(res.data);
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
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Administrative Command Center</span>
            <span>•</span>
            <span>CampusConnect Master Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Administration & Governance
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm">
            Manage student & faculty registries, assign mentors and class advisors, supervise OD applications, verify certificates, and oversee campus placements.
          </p>
        </div>
      </div>

      {/* Primary 8 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalStudents || 0}</h3>
          <Link to="/admin/students" className="text-xs text-blue-600 font-semibold mt-1 hover:underline flex items-center">
            Manage <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Total Faculty */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Faculty</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalFaculty || 0}</h3>
          <Link to="/admin/faculty" className="text-xs text-purple-600 font-semibold mt-1 hover:underline flex items-center">
            View roster <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Total Mentors */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Mentors</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{stats?.totalMentors || 0}</h3>
          <Link to="/admin/mentor-mapping" className="text-xs text-emerald-600 font-semibold mt-1 hover:underline flex items-center">
            Mapping <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Total Advisors */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Advisors</p>
          <h3 className="text-2xl font-black text-purple-700 mt-1">{stats?.totalAdvisors || 0}</h3>
          <Link to="/admin/advisor-mapping" className="text-xs text-purple-600 font-semibold mt-1 hover:underline flex items-center">
            Mapping <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Pending ODs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending OD Reviews</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{stats?.pendingODs || 0}</h3>
          <Link to="/admin/od" className="text-xs text-amber-600 font-semibold mt-1 hover:underline flex items-center">
            Review Queue <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Pending Documents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Documents</p>
          <h3 className="text-2xl font-black text-indigo-700 mt-1">{stats?.pendingDocuments || 0}</h3>
          <Link to="/admin/documents" className="text-xs text-indigo-600 font-semibold mt-1 hover:underline flex items-center">
            Verification <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Active Drives */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placement Drives</p>
          <h3 className="text-2xl font-black text-rose-700 mt-1">{stats?.activeDrives || 0} Active</h3>
          <Link to="/admin/placements" className="text-xs text-rose-600 font-semibold mt-1 hover:underline flex items-center">
            Manage <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Clubs & Events */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clubs & Events</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {stats?.totalClubs || 0} / {stats?.totalEvents || 0}
          </h3>
          <Link to="/admin/events" className="text-xs text-slate-600 font-semibold mt-1 hover:underline flex items-center">
            Explore <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* 2 Column: Pending OD Queue & Recent Placement Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OD Review Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-rose-600" />
              Incoming Student OD Applications
            </h2>
            <Link to="/admin/od" className="text-xs text-rose-600 font-bold hover:underline">
              Verify OD Queue
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentODs?.length > 0 ? (
              data.recentODs.map((od: any) => (
                <div key={od._id} className="py-3 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-xs text-slate-900">{od.studentName}</p>
                      <StatusBadge status={od.finalStatus} />
                    </div>
                    <p className="text-xs text-slate-600">{od.purpose}</p>
                    <p className="text-[11px] text-slate-400">
                      {od.fromDate} to {od.toDate} ({od.daysCount} days) • {od.department}
                    </p>
                  </div>
                  <Link
                    to="/admin/od"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No OD requests in queue.</p>
            )}
          </div>
        </div>

        {/* Active Placement Drives */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-rose-600" />
              Campus Recruitment Drives
            </h2>
            <Link to="/admin/placements" className="text-xs text-rose-600 font-bold hover:underline">
              Manage Drives
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentDrives?.length > 0 ? (
              data.recentDrives.map((d: any) => (
                <div key={d._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{d.companyName}</h3>
                    <p className="text-[11px] text-slate-500">
                      {d.jobRole} • <span className="font-bold text-emerald-700">{d.packageLPA} LPA</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400">{d.driveDate}</span>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No placement drives created.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
