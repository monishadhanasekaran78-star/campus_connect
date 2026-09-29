import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileSpreadsheet,
  Calendar,
  MessageSquareHeart,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { mentorService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const MentorDashboard: React.FC = () => {
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

  return (
    <div className="space-y-6">
      {/* Mentor Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold mb-3">
            <span>Faculty Mentorship Portal</span>
            <span>•</span>
            <span>Sub-Role: Senior Student Mentor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Faculty Mentorship & Advising Console
          </h1>
          <p className="mt-2 text-emerald-100 text-xs sm:text-sm">
            Monitor assigned student mentees, verify second-tier OD applications, review periodic counselling records, and conduct consultation sessions.
          </p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Mentees */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Mentees</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.totalMentees || 0}</h3>
            <Link to="/faculty/mentor/mentees" className="text-xs text-emerald-600 font-semibold mt-1 hover:underline flex items-center">
              View roster <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pending ODs for Mentor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">OD Awaiting Review</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.pendingOdCount || 0}</h3>
            <Link to="/faculty/mentor/od" className="text-xs text-amber-600 font-semibold mt-1 hover:underline flex items-center">
              Review requests <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Meetings</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.upcomingMeetingsCount || 0}</h3>
            <Link to="/faculty/mentor/meetings" className="text-xs text-blue-600 font-semibold mt-1 hover:underline flex items-center">
              Manage slots <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Counselling Follow-ups</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.pendingFollowUpsCount || 0}</h3>
            <Link to="/faculty/mentor/counselling" className="text-xs text-purple-600 font-semibold mt-1 hover:underline flex items-center">
              Review action items <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Pending ODs Queue + Upcoming Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OD Requests Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
              OD Requests Pending Mentor Action
            </h2>
            <Link to="/faculty/mentor/od" className="text-xs text-emerald-600 hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.pendingODs?.length > 0 ? (
              data.pendingODs.map((od: any) => (
                <div key={od._id} className="py-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-slate-900">{od.studentName}</p>
                    <p className="text-xs text-slate-600 font-medium">{od.purpose}</p>
                    <p className="text-[11px] text-slate-400">
                      {od.fromDate} to {od.toDate} ({od.daysCount} days)
                    </p>
                  </div>
                  <Link
                    to="/faculty/mentor/od"
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Review OD
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                All mentee OD requests are currently reviewed.
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Consultations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Upcoming Mentorship Consultations
            </h2>
            <Link to="/faculty/mentor/meetings" className="text-xs text-blue-600 hover:underline font-semibold">
              Manage Meetings
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.upcomingMeetings?.length > 0 ? (
              data.upcomingMeetings.map((m: any) => (
                <div key={m._id} className="py-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-xs text-slate-900">{m.studentName}</p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-xs text-slate-600">{m.purpose}</p>
                    <p className="text-[11px] text-slate-400">
                      {m.date} at {m.time} ({m.meetingType})
                    </p>
                  </div>
                  <Link
                    to="/faculty/mentor/meetings"
                    className="text-xs text-blue-600 font-bold hover:underline shrink-0"
                  >
                    Details →
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No upcoming consultations scheduled.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mentees Summary Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-emerald-600" />
            Assigned Student Mentees Overview
          </h2>
          <div className="text-xs text-slate-500 font-medium">
            Avg Attendance: <span className="font-bold text-slate-800">{data?.avgAttendance}%</span> •{' '}
            Avg CGPA: <span className="font-bold text-slate-800">{data?.avgCgpa}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.mentees?.map((student: any) => (
            <div
              key={student._id}
              className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{student.name}</span>
                <span className="font-mono text-[10px] text-slate-400 font-bold">{student.registerNumber}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {student.department} • Year {student.year}-{student.section}
              </p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                <span>CGPA: <span className="text-blue-700">{student.cgpa}</span></span>
                <span>Attendance: <span className="text-emerald-700">{student.attendancePct}%</span></span>
              </div>
              <div className="pt-1">
                <Link
                  to={`/faculty/mentor/mentees/${student.userId}`}
                  className="w-full block text-center py-1.5 bg-white border border-slate-200 hover:border-emerald-500 text-emerald-700 font-bold rounded-lg text-xs transition-colors"
                >
                  View Complete Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
