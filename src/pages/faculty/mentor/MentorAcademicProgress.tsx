import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, AlertTriangle, CheckCircle2, TrendingUp, ArrowRight, Search } from 'lucide-react';
import { mentorService } from '../../../services/api';

export const MentorAcademicProgress: React.FC = () => {
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchMentees();
  }, []);

  const fetchMentees = async () => {
    try {
      const res = await mentorService.getMentees();
      if (res.data.success) {
        setMentees(res.data.mentees || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = mentees.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.registerNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const lowAttendanceCount = mentees.filter((m) => (m.attendancePct || 0) < 75).length;
  const distinctionCount = mentees.filter((m) => (m.cgpa || 0) >= 8.5).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <GraduationCap className="w-6 h-6 mr-2 text-emerald-600" />
            Mentee Academic & Attendance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time tracking of grade performance, cumulative grade point averages, and attendance thresholds.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentees..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Monitored Mentees</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{mentees.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Full Batch Coverage</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Distinction Standing (CGPA &gt; 8.5)</p>
          <h3 className="text-2xl font-black text-blue-700 mt-1">{distinctionCount}</h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">High Achievers</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Warning (&lt; 75%)</p>
          <h3 className={`text-2xl font-black mt-1 ${lowAttendanceCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {lowAttendanceCount}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Mandatory minimum rule</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Mentee Name</th>
                <th className="px-6 py-3.5">Register No</th>
                <th className="px-4 py-3.5 text-center">CGPA</th>
                <th className="px-4 py-3.5 text-center">Attendance %</th>
                <th className="px-4 py-3.5 text-center">Threshold Status</th>
                <th className="px-6 py-3.5 text-right">Detailed Portfolio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                  <td className="px-6 py-4 font-mono font-semibold text-emerald-700">{m.registerNumber}</td>
                  <td className="px-4 py-4 text-center font-bold text-blue-700 text-sm">{m.cgpa}</td>
                  <td className="px-4 py-4 text-center font-bold">{m.attendancePct}%</td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        m.attendancePct >= 85
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.attendancePct >= 75
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {m.attendancePct >= 75 ? 'Satisfactory' : 'Action Required'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/faculty/mentor/mentees/${m.userId}`}
                      className="inline-flex items-center space-x-1 text-xs text-emerald-700 font-bold hover:underline"
                    >
                      <span>Academic Transcript</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
