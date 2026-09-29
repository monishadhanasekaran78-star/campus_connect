import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, TrendingUp, BookOpen, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { academicService } from '../../services/api';

export const Academics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAcademics();
  }, []);

  const fetchAcademics = async () => {
    try {
      const res = await academicService.getMyAcademics();
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
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const record = data?.academics;
  const subjects = record?.subjects || [];
  const attendanceList = data?.attendance || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
          Academic Information & Grade Sheet
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your enrolled subjects, internal assessments, semester exam marks, and course credits.
        </p>
      </div>

      {/* Top Academic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cumulative CGPA</p>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{data?.cgpa || 8.84}</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">First Class with Distinction</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semester SGPA</p>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{record?.sgpa || 9.02}</h2>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">Semester {record?.semester || 5}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</p>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{data?.attendancePct || 91.5}%</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Satisfies 75% Rule</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Backlogs</p>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{record?.backlogsCount || 0}</h2>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Clean Academic Record</p>
        </div>
      </div>

      {/* Subject Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
            Curriculum Courses & Marks Breakdown (Semester {record?.semester || 5})
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Total Credits: 20</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Course Title</th>
                <th className="px-4 py-3 text-center">Credits</th>
                <th className="px-4 py-3 text-center">Internal (40)</th>
                <th className="px-4 py-3 text-center">Semester (60)</th>
                <th className="px-4 py-3 text-center">Total (100)</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {subjects.map((sub: any, idx: number) => {
                const total = (sub.internalMarks || 0) + (sub.semesterMarks || 0);
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-blue-600">{sub.code}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{sub.name}</td>
                    <td className="px-4 py-3.5 text-center">{sub.credits}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-800">
                      {sub.internalMarks} / {sub.maxInternal}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-800">
                      {sub.semesterMarks} / {sub.maxSemester}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-blue-700">{total}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          sub.attendancePct >= 85
                            ? 'bg-emerald-50 text-emerald-700'
                            : sub.attendancePct >= 75
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {sub.attendancePct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Detail Table */}
      {attendanceList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <h2 className="font-bold text-sm text-slate-900 mb-4 flex items-center">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-600" />
            Class Attendance Register by Subject
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendanceList.map((att: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">{att.subjectCode}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      att.percentage >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : att.percentage >= 75
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {att.percentage}%
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 mt-1">{att.subjectName}</h4>
                <p className="text-[11px] text-slate-500 mt-2">
                  Classes Attended: <span className="font-bold text-slate-800">{att.attendedClasses}</span> /{' '}
                  {att.totalClasses}
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      att.percentage >= 75 ? 'bg-blue-600' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, att.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
