import React, { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, MapPin, Mail, Phone } from 'lucide-react';
import { adminService } from '../../services/api';

export const AdminFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subroleFilter, setSubroleFilter] = useState<string>('');

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await adminService.getUsers({ role: 'faculty' });
      if (res.data.success) {
        setFaculty(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = faculty.filter((f) => {
    if (!subroleFilter) return true;
    return f.facultyType === subroleFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <GraduationCap className="w-6 h-6 mr-2 text-rose-600" />
            Institutional Faculty Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Faculty members categorized by sub-roles: Student Mentors and Class Advisors.
          </p>
        </div>

        <div className="flex space-x-2">
          {[
            { label: 'All Faculty', value: '' },
            { label: 'Mentors', value: 'mentor' },
            { label: 'Class Advisors', value: 'advisor' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setSubroleFilter(btn.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                subroleFilter === btn.value
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((f) => (
          <div
            key={f._id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{f.name}</h3>
                  <p className="text-xs text-slate-500">{f.department}</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    f.facultyType === 'advisor'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {f.facultyType === 'advisor' ? 'Class Advisor' : 'Mentor'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {f.email}
                </p>
                <p className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {f.phone || '+91 98400 00000'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Institutional Faculty</span>
              <span className="font-bold text-emerald-700">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
