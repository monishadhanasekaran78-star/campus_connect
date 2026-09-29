import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { notificationService } from '../../services/api';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-blue-600" />
            Notifications & System Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time notifications regarding OD updates, mentor meetings, placements, and exams.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`p-5 transition-colors cursor-pointer flex items-start justify-between ${
                !n.isRead ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                    {n.type}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <p className="text-[11px] text-slate-400 flex items-center pt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Recent'}
                </p>
              </div>

              {!n.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(n._id);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0 ml-4"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            You have caught up with all notifications!
          </div>
        )}
      </div>
    </div>
  );
};
