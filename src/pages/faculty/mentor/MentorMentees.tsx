import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ArrowRight, CheckCircle2, AlertTriangle, FileSpreadsheet, Briefcase } from 'lucide-react';
import { mentorService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const MentorMentees: React.FC = () => {
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

  const filtered = mentees.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.registerNumber?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-emerald-600" />
            Assigned Student Mentees Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Individual academic monitoring, attendance audits, OD oversight, and career mentorship.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or reg no..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Mentees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Class / Batch</th>
                <th className="px-4 py-3.5 text-center">Attendance</th>
                <th className="px-4 py-3.5 text-center">CGPA</th>
                <th className="px-4 py-3.5 text-center">Placement Progress</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{m.name}</p>
                        <p className="text-[11px] font-mono text-emerald-700 font-semibold">{m.registerNumber}</p>
                        <p className="text-[11px] text-slate-400">{m.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{m.department}</p>
                      <p className="text-[11px] text-slate-500">Year {m.year} • Section {m.section}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs ${
                          m.attendancePct >= 85
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.attendancePct >= 75
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {m.attendancePct}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-blue-700 text-sm">
                      {m.cgpa}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={m.placementStage || 'Not Applied'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/faculty/mentor/mentees/${m.userId}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        <span>View Portfolio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No mentees match your search criteria.
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
