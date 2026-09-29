import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  FolderOpen,
  MessageSquareHeart,
  Briefcase,
  CheckCircle2,
  Download
} from 'lucide-react';
import { mentorService } from '../../../services/api';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const MentorMenteeDetail: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'academics' | 'attendance' | 'od' | 'counselling' | 'documents' | 'placements'>('academics');

  useEffect(() => {
    if (studentId) {
      fetchDetail(studentId);
    }
  }, [studentId]);

  const fetchDetail = async (id: string) => {
    try {
      const res = await mentorService.getMenteeDetail(id);
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

  const profile = data?.profile;
  const academicRecord = data?.academicRecord;
  const subjects = academicRecord?.subjects || [];
  const attendanceRecords = data?.attendanceRecords || [];
  const odRequests = data?.odRequests || [];
  const documents = data?.documents || [];
  const counsellingRecords = data?.counsellingRecords || [];
  const placements = data?.placements || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/faculty/mentor/mentees"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Mentees Roster</span>
      </Link>

      {/* Student Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-700/20">
            {profile?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900">{profile?.name}</h1>
            <p className="text-xs text-emerald-700 font-mono font-bold mt-0.5">{profile?.registerNumber}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile?.department} • Year {profile?.year} Section {profile?.section} • {profile?.residenceType}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CGPA</span>
            <p className="text-xl font-black text-blue-700 mt-0.5">{profile?.cgpa || '8.8'}</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{profile?.attendancePct || '91.5'}%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'academics', label: 'Academics & Grades' },
          { key: 'attendance', label: 'Attendance Breakdown' },
          { key: 'od', label: 'On-Duty Records' },
          { key: 'counselling', label: 'Counselling Log' },
          { key: 'documents', label: 'Uploaded Documents' },
          { key: 'placements', label: 'Placement Drives' },
        ].map((tab: any) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              activeTab === tab.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Academics */}
      {activeTab === 'academics' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Semester {academicRecord?.semester || 5} Course Grades
            </h3>
            <span className="text-xs font-bold text-blue-700">SGPA: {academicRecord?.sgpa || 9.02}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Course Name</th>
                  <th className="px-4 py-3 text-center">Credits</th>
                  <th className="px-4 py-3 text-center">Internal (40)</th>
                  <th className="px-4 py-3 text-center">Semester (60)</th>
                  <th className="px-4 py-3 text-center">Total (100)</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {subjects.map((sub: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3.5 font-mono font-bold text-blue-600">{sub.code}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{sub.name}</td>
                    <td className="px-4 py-3.5 text-center">{sub.credits}</td>
                    <td className="px-4 py-3.5 text-center">{sub.internalMarks}</td>
                    <td className="px-4 py-3.5 text-center">{sub.semesterMarks}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-blue-700">
                      {sub.internalMarks + sub.semesterMarks}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Subject-wise Class Attendance Log</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendanceRecords.map((att: any, i: number) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">{att.subjectCode}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {att.percentage}%
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{att.subjectName}</h4>
                <p className="text-[11px] text-slate-500">
                  {att.attendedClasses} / {att.totalClasses} lectures attended
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: OD */}
      {activeTab === 'od' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {odRequests.length > 0 ? (
            odRequests.map((od: any) => (
              <div key={od._id} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{od.purpose}</h4>
                  <StatusBadge status={od.finalStatus} />
                </div>
                <p className="text-xs text-slate-500">
                  {od.fromDate} to {od.toDate} ({od.daysCount} days) • Reason: {od.reason}
                </p>
                {od.adminRemarks && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <span className="font-bold">Admin Remarks:</span> {od.adminRemarks}
                  </p>
                )}
                {od.mentorRemarks && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                    <span className="font-bold">Mentor Remarks:</span> {od.mentorRemarks}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">No OD requests found for this student.</div>
          )}
        </div>
      )}

      {/* Tab 4: Counselling */}
      {activeTab === 'counselling' && (
        <div className="space-y-4">
          {counsellingRecords.map((rec: any) => (
            <div key={rec._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-900">{rec.discussionTopic}</h4>
                <span className="text-xs text-slate-400">{rec.meetingDate}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-700">Concerns:</p>
                  <p className="text-slate-600 mt-0.5">{rec.academicConcerns || 'None reported'}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700">Mentor Remarks & Suggestions:</p>
                  <p className="text-emerald-800 mt-0.5 font-medium">{rec.mentorRemarks || 'Pending feedback'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {documents.map((doc: any) => (
            <div key={doc._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-900">{doc.title}</p>
                <p className="text-[11px] text-slate-500">{doc.documentType} • Uploaded {doc.uploadDate}</p>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={doc.status} />
                <a
                  href={doc.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Placements */}
      {activeTab === 'placements' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {placements.map((p: any) => (
            <div key={p._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-900">{p.companyName}</p>
                <p className="text-[11px] text-slate-500">{p.jobRole} • {p.packageLPA} LPA</p>
              </div>
              <StatusBadge status={p.currentStage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
