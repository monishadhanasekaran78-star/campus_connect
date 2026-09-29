import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle2 } from 'lucide-react';
import { clubService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const AdminClubs: React.FC = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [category, setCategory] = useState<string>('Technical');
  const [facultyCoordinator, setFacultyCoordinator] = useState<string>('');
  const [studentCoordinator, setStudentCoordinator] = useState<string>('');
  const [meetingSchedule, setMeetingSchedule] = useState<string>('Every Wednesday at 04:30 PM');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await clubService.getClubs();
      if (res.data.success) {
        setClubs(res.data.clubs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;

    setSubmitting(true);
    try {
      const res = await clubService.createClub({
        name,
        code,
        category,
        facultyCoordinator,
        studentCoordinator,
        meetingSchedule,
        description,
      });

      if (res.data.success) {
        setSuccessMsg(`Club "${name}" registered successfully.`);
        setIsModalOpen(false);
        setName('');
        setDescription('');
        fetchClubs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating club');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-rose-600" />
            Student Clubs & Campus Societies Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administer technical councils, cultural guilds, athletic clubs, and designate faculty mentors.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Charter New Club</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div
            key={club._id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                  {club.category}
                </span>
                <span className="text-xs font-semibold text-slate-400">{club.membersCount} Members</span>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">{club.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-3">{club.description}</p>

              <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <p><span className="font-semibold text-slate-700">Faculty Lead:</span> {club.facultyCoordinator}</p>
                <p><span className="font-semibold text-slate-700">Student Lead:</span> {club.studentCoordinator}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">{club.code}</span>
              <span className="font-bold text-emerald-700">Active Society</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Charter New Student Club"
        subtitle="Establish student council governance, lead coordinators, and schedule"
      >
        <form onSubmit={handleCreateClub} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Club Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AI & Robotics Innovation Cell"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Club Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Social">Social</option>
                <option value="Literary">Literary</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Coordinator</label>
              <input
                type="text"
                value={facultyCoordinator}
                onChange={(e) => setFacultyCoordinator(e.target.value)}
                placeholder="e.g. Dr. Rajesh Kumar"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Coordinator</label>
              <input
                type="text"
                value={studentCoordinator}
                onChange={(e) => setStudentCoordinator(e.target.value)}
                placeholder="e.g. Monisha Dhanasekaran"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Meeting Schedule</label>
            <input
              type="text"
              value={meetingSchedule}
              onChange={(e) => setMeetingSchedule(e.target.value)}
              placeholder="e.g. Every Wednesday at 04:30 PM (Lab 4)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Mission</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the club objectives and annual project goals..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
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
              {submitting ? 'Registering...' : 'Register Club'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
