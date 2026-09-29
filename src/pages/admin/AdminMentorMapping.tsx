import React, { useState, useEffect } from 'react';
import { UserPlus, Search, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const AdminMentorMapping: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchMapping();
  }, []);

  const fetchMapping = async () => {
    try {
      const res = await adminService.getMentorMapping();
      if (res.data.success) {
        setStudents(res.data.students || []);
        setMentors(res.data.mentors || []);
        if (res.data.mentors?.length > 0) {
          setSelectedMentorId(res.data.mentors[0].userId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (student: any) => {
    setSelectedStudent(student);
    if (student.mentorId) {
      setSelectedMentorId(student.mentorId);
    } else if (mentors.length > 0) {
      setSelectedMentorId(mentors[0].userId);
    }
    setIsModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedMentorId) return;

    setSubmitting(true);
    try {
      const res = await adminService.assignMentor(selectedStudent.userId, selectedMentorId);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Mentor assigned successfully!');
        setIsModalOpen(false);
        fetchMapping();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error assigning mentor');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.registerNumber?.toLowerCase().includes(q) || s.mentorName?.toLowerCase().includes(q);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <UserPlus className="w-6 h-6 mr-2 text-rose-600" />
            Mentor-Mentee Allocation & Mapping Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pair incoming and continuing students with dedicated faculty mentors across departments.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or mentor..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Mapping Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Department & Class</th>
                <th className="px-6 py-3.5">Current Mentor</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="font-mono text-[11px] font-bold text-blue-700">{s.registerNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{s.department}</p>
                    <p className="text-[11px] text-slate-500">Year {s.year} • Section {s.section}</p>
                  </td>
                  <td className="px-6 py-4">
                    {s.mentorName ? (
                      <span className="font-bold text-emerald-800 flex items-center">
                        <UserCheck className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                        {s.mentorName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        s.mentorId
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {s.mentorId ? 'Allocated' : 'Pending Allocation'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenAssign(s)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors"
                    >
                      {s.mentorId ? 'Change Mentor' : 'Assign Mentor'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Faculty Mentor"
        subtitle={`Student: ${selectedStudent?.name} (${selectedStudent?.registerNumber})`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Faculty Mentor *
            </label>
            <select
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              {mentors.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Allocating...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
