import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  Briefcase,
  Megaphone,
  BookOpen,
  ArrowRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';
import { studentService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await studentService.getDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const profile = data?.profile;
  const mentor = data?.mentor;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold mb-3">
            <span>Academic Year 2026-2027</span>
            <span>•</span>
            <span>Semester 5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {profile?.name || 'Student'}!
          </h1>
          <p className="mt-2 text-blue-100 text-xs sm:text-sm">
            {profile?.registerNumber} • {profile?.department} • Year {profile?.year} Section {profile?.section}
          </p>
        </div>
      </div>

      {/* Primary Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{profile?.attendancePct || 91.5}%</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Satisfies &gt;75% requirement
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* CGPA Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cumulative CGPA</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{profile?.cgpa || 8.84}</h3>
            <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> First Class Distinction
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Pending ODs Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending ODs</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.pendingOdCount || 0}</h3>
            <Link to="/student/od" className="text-xs text-indigo-600 font-semibold mt-1 hover:underline flex items-center">
              View OD tracker <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* Placements Applied */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placement Drives</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.placementApplications?.length || 0} Active</h3>
            <Link to="/student/placement" className="text-xs text-blue-600 font-semibold mt-1 hover:underline flex items-center">
              Track rounds <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2-Column Section: Mentor Info + Active Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mentor Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
              Assigned Faculty Mentor
            </h2>
            <Link to="/student/mentor" className="text-xs text-blue-600 hover:underline font-semibold">
              View Profile
            </Link>
          </div>

          {mentor ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                  {mentor.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{mentor.name}</h3>
                  <p className="text-xs text-slate-500">{mentor.designation}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center">
                  <span className="font-semibold text-slate-700 w-24">Office:</span>
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {mentor.officeLocation || 'Academic Complex'}
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-slate-700 w-24">Email:</span>
                  {mentor.email}
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-slate-700 w-24">Phone:</span>
                  {mentor.phone || 'Available via portal'}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/student/meetings"
                  className="block text-center py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Request Meeting Slot
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No mentor currently assigned. Please contact administration.
            </div>
          )}
        </div>

        {/* Placement Applications Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
              Active Placement Progress
            </h2>
            <Link to="/student/placement" className="text-xs text-blue-600 hover:underline font-semibold">
              View All Drives
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.placementApplications?.length > 0 ? (
              data.placementApplications.map((app: any) => (
                <div key={app._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{app.companyName}</h3>
                    <p className="text-[11px] text-slate-500">
                      {app.jobRole} • <span className="font-semibold text-slate-700">{app.packageLPA} LPA</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={app.currentStage} />
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active placement applications yet. Browse upcoming drives in the Placement section.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Announcements & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <Megaphone className="w-4 h-4 mr-2 text-blue-600" />
              College Announcements
            </h2>
            <Link to="/student/announcements" className="text-xs text-blue-600 hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {data?.announcements?.slice(0, 3).map((a: any) => (
              <div key={a._id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-700 uppercase tracking-wider">{a.category}</span>
                  <span className="text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-xs text-slate-900 mt-1">{a.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{a.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events & LMS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Upcoming Events & Assessments
            </h2>
            <Link to="/student/events" className="text-xs text-blue-600 hover:underline font-semibold">
              Explore Events
            </Link>
          </div>

          <div className="space-y-3">
            {data?.events?.slice(0, 2).map((e: any) => (
              <div key={e._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Event</span>
                  <h3 className="font-bold text-xs text-slate-900 mt-0.5">{e.title}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" /> {e.date} at {e.venue}
                  </p>
                </div>
                <Link
                  to="/student/events"
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Register
                </Link>
              </div>
            ))}

            {data?.assessments?.slice(0, 1).map((as: any) => (
              <div key={as._id} className="flex items-center justify-between p-3 border border-amber-100 bg-amber-50/30 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">LMS Assessment</span>
                  <h3 className="font-bold text-xs text-slate-900 mt-0.5">{as.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Deadline: {as.deadline} • {as.durationMinutes} mins</p>
                </div>
                <Link
                  to="/student/assessments"
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                >
                  Start Test
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
