import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import { announcementService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('College');
  const [priority, setPriority] = useState<string>('Medium');
  const [targetAudience, setTargetAudience] = useState<string>('All');
  const [department, setDepartment] = useState<string>('All Departments');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAnnouncements();
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const res = await announcementService.createAnnouncement({
        title,
        description,
        category,
        priority,
        targetAudience,
        department,
      });

      if (res.data.success) {
        setSuccessMsg('Announcement broadcasted to collegiate portal.');
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchAnnouncements();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error broadcasting announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement bulletin?')) return;
    try {
      await announcementService.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Megaphone className="w-6 h-6 mr-2 text-rose-600" />
            Official Collegiate Announcements & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Broadcast administrative notices, examination schedules, placement bulletins, and advisories.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Announcement</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a._id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm">
                  {a.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm">
                  {a.priority} Priority
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                  Audience: {a.targetAudience}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">{a.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">{a.description}</p>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Posted by: {a.postedBy}</span>
              <span>Scope: {a.department}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast College Announcement"
        subtitle="Issue notifications to targeted roles across departments"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Headline Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End-Semester Examination Hall Ticket Generation Circular"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="College">College General</option>
                <option value="Department">Department Circular</option>
                <option value="Exam">Examination & Grades</option>
                <option value="Placement">Campus Placement</option>
                <option value="Event">Fest & Symposium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent / Immediate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="All">All Campus Users</option>
                <option value="Students">Students Only</option>
                <option value="Faculty">Faculty Only</option>
                <option value="Mentors">Mentors Only</option>
                <option value="Advisors">Class Advisors Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Scope</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. All Departments or Computer Science"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Announcement Body *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the full circular notice instructions and deadlines..."
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
              {submitting ? 'Publishing...' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
