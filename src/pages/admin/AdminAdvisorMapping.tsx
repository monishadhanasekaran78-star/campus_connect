import React, { useState, useEffect } from 'react';
import { GitBranch, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const AdminAdvisorMapping: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchMapping();
  }, []);

  const fetchMapping = async () => {
    try {
      const res = await adminService.getAdvisorMapping();
      if (res.data.success) {
        setClasses(res.data.classes || []);
        setAdvisors(res.data.advisors || []);
        if (res.data.advisors?.length > 0) {
          setSelectedAdvisorId(res.data.advisors[0].userId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (cls: any) => {
    setSelectedClass(cls);
    if (cls.advisorUserId) {
      setSelectedAdvisorId(cls.advisorUserId);
    } else if (advisors.length > 0) {
      setSelectedAdvisorId(advisors[0].userId);
    }
    setIsModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedAdvisorId) return;

    setSubmitting(true);
    try {
      const res = await adminService.assignAdvisor({
        department: selectedClass.department,
        year: selectedClass.year,
        section: selectedClass.section,
        advisorUserId: selectedAdvisorId,
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Class Advisor mapped successfully!');
        setIsModalOpen(false);
        fetchMapping();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error mapping advisor');
    } finally {
      setSubmitting(false);
    }
  };

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
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <GitBranch className="w-6 h-6 mr-2 text-rose-600" />
          Class Advisor Department & Cohort Allocation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Map senior faculty members to specific academic cohorts (Department, Year, and Section).
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Classes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-4 py-3.5 text-center">Academic Year</th>
                <th className="px-4 py-3.5 text-center">Section</th>
                <th className="px-6 py-3.5">Assigned Class Advisor</th>
                <th className="px-4 py-3.5 text-center">Cohort Strength</th>
                <th className="px-6 py-3.5 text-right">Mapping Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classes.map((cls, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{cls.department}</td>
                  <td className="px-4 py-4 text-center font-bold text-blue-700">Year {cls.year}</td>
                  <td className="px-4 py-4 text-center font-bold">{cls.section}</td>
                  <td className="px-6 py-4">
                    {cls.advisorName !== 'Unassigned' ? (
                      <span className="font-bold text-purple-800">{cls.advisorName}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-slate-800">
                    {cls.studentCount} Students
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenAssign(cls)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors"
                    >
                      {cls.advisorName !== 'Unassigned' ? 'Reassign Advisor' : 'Assign Advisor'}
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
        title="Assign Class Advisor"
        subtitle={`Class: ${selectedClass?.department} Year ${selectedClass?.year}-${selectedClass?.section}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Class Advisor (Faculty) *
            </label>
            <select
              value={selectedAdvisorId}
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              {advisors.map((adv) => (
                <option key={adv.userId} value={adv.userId}>
                  {adv.name} ({adv.department})
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
              {submitting ? 'Assigning...' : 'Confirm Class Advisor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
