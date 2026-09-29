import React, { useState, useEffect } from 'react';
import { Megaphone, AlertCircle, Calendar, Tag, Filter } from 'lucide-react';
import { announcementService } from '../../services/api';

export const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

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

  const categories = ['All', 'College', 'Department', 'Exam', 'Placement', 'Event'];

  const filtered = announcements.filter((a) => {
    if (activeCategory === 'All') return true;
    return a.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <Megaphone className="w-6 h-6 mr-2 text-blue-600" />
          Official Campus Bulletins & Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Important circulars from the Principal's Office, Exam Controller, and Department Heads.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getPriorityStyle(
                      item.priority
                    )}`}
                  >
                    {item.priority} Priority
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Target: {item.targetAudience}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                <span>Issued by: {item.postedBy}</span>
                <span>{item.department}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No announcements found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
