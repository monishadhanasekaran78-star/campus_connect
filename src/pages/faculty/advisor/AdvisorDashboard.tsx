import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  GraduationCap,
  FileSpreadsheet,
  Home,
  Bus,
  Briefcase,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { advisorService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const AdvisorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await advisorService.getDashboard();
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
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const cls = data?.assignedClass;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold mb-3">
            <span>Faculty Sub-Role: Class Advisor</span>
            <span>•</span>
            <span>{cls?.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Class Advisor Console – Year {cls?.year} Section {cls?.section}
          </h1>
          <p className="mt-2 text-purple-100 text-xs sm:text-sm">
            Monitor whole-class attendance benchmarks, academic performance, hosteller/day scholar transport registers, and approved OD records.
          </p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Class Strength */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Strength</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.totalStudents || 0}</h3>
            <Link to="/faculty/advisor/students" className="text-xs text-purple-600 font-semibold mt-1 hover:underline flex items-center">
              Student roster <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Class Avg Attendance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Avg Attendance</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.avgAttendance || 0}%</h3>
            <Link to="/faculty/advisor/attendance" className="text-xs text-emerald-600 font-semibold mt-1 hover:underline flex items-center">
              View register <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ClipboardCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Class Avg CGPA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Avg CGPA</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.avgCgpa || 0}</h3>
            <Link to="/faculty/advisor/academics" className="text-xs text-blue-600 font-semibold mt-1 hover:underline flex items-center">
              Academic review <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Approved ODs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved OD Days</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.approvedOdCount || 0}</h3>
            <Link to="/faculty/advisor/od" className="text-xs text-indigo-600 font-semibold mt-1 hover:underline flex items-center">
              OD information <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Hosteller vs Day Scholar & Placement Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Residence Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900">Demographics & Residence Distribution</h2>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <Home className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <span className="text-xs text-slate-500 font-semibold">Hostellers</span>
              <p className="text-xl font-black text-slate-900 mt-1">{data?.hostellerCount || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <Bus className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
              <span className="text-xs text-slate-500 font-semibold">Day Scholars</span>
              <p className="text-xl font-black text-slate-900 mt-1">{data?.dayScholarCount || 0}</p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500">
            <p>• Day scholars use College Bus Routes 12, 18, and 24.</p>
            <p className="mt-1">• Hostellers reside in North Wing Blocks 2 & 3.</p>
          </div>
        </div>

        {/* Approved OD List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-purple-600" />
              Recent Approved ODs in Year {cls?.year}-{cls?.section}
            </h2>
            <Link to="/faculty/advisor/od" className="text-xs text-purple-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentApprovedODs?.length > 0 ? (
              data.recentApprovedODs.map((od: any) => (
                <div key={od._id} className="py-3 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-slate-900">{od.studentName} ({od.registerNumber})</p>
                    <p className="text-xs text-slate-600">{od.purpose}</p>
                    <p className="text-[11px] text-slate-400">
                      {od.fromDate} to {od.toDate} ({od.daysCount} days)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Mentor Approved
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No approved OD records in this class.</p>
            )}
          </div>
        </div>
      </div>

      {/* Class Students Roster Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-sm text-slate-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-purple-600" />
            Class Students Portfolio Overview
          </h2>
          <Link to="/faculty/advisor/students" className="text-xs text-purple-600 font-semibold hover:underline">
            View Complete Class List
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Register No</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Residence</th>
                <th className="px-4 py-3">Transport Route</th>
                <th className="px-4 py-3 text-center">Attendance</th>
                <th className="px-4 py-3 text-center">CGPA</th>
                <th className="px-6 py-3">Assigned Mentor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data?.students?.map((s: any) => (
                <tr key={s._id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3.5 font-mono font-bold text-purple-700">{s.registerNumber}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{s.name}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        s.residenceType === 'Hosteller'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.residenceType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{s.transportDetails || 'Self'}</td>
                  <td className="px-4 py-3.5 text-center font-bold">{s.attendancePct}%</td>
                  <td className="px-4 py-3.5 text-center font-bold text-blue-700">{s.cgpa}</td>
                  <td className="px-6 py-3.5 text-slate-600">{s.mentorName || 'Assigned Mentor'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
