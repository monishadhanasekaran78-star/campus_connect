import React, { useState, useEffect } from 'react';
import { Users, Search, Home, Bus, Phone, Mail } from 'lucide-react';
import { advisorService } from '../../../services/api';

export const AdvisorStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [assignedClass, setAssignedClass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await advisorService.getStudents();
      if (res.data.success) {
        setStudents(res.data.students || []);
        setAssignedClass(res.data.assignedClass);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.registerNumber?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-purple-600" />
            Class Students Register – Year {assignedClass?.year} Section {assignedClass?.section}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {assignedClass?.department} • Complete directory with residential and transport information.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or reg no..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Contact Information</th>
                <th className="px-4 py-3.5 text-center">Residence</th>
                <th className="px-4 py-3.5">Transport Mode</th>
                <th className="px-4 py-3.5 text-center">Attendance %</th>
                <th className="px-4 py-3.5 text-center">CGPA</th>
                <th className="px-6 py-3.5">Assigned Mentor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="font-mono text-[11px] font-bold text-purple-700">{s.registerNumber}</p>
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <p className="flex items-center text-slate-600">
                      <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {s.email}
                    </p>
                    <p className="flex items-center text-slate-500">
                      <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {s.phone || 'N/A'}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        s.residenceType === 'Hosteller'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {s.residenceType}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{s.transportDetails || 'Self'}</td>
                  <td className="px-4 py-4 text-center font-bold">{s.attendancePct}%</td>
                  <td className="px-4 py-4 text-center font-bold text-blue-700">{s.cgpa}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{s.mentorName || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
