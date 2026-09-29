import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  GraduationCap,
  LogOut,
  User as UserIcon,
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return { label: 'ADMINISTRATOR', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
    if (user?.role === 'faculty') {
      return user?.facultyType === 'advisor'
        ? { label: 'CLASS ADVISOR', bg: 'bg-purple-100 text-purple-800 border-purple-200' }
        : { label: 'FACULTY MENTOR', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
    return { label: 'STUDENT', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight text-slate-900 font-sans">
                CAMPUS<span className="text-blue-600">CONNECT</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.bg}`}>
                {roleBadge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              KIOT - Knowledge Institute of Technology
            </p>
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && handleMarkOneRead(n._id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                          !n.isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      if (user?.role === 'student') navigate('/student/notifications');
                      else if (user?.role === 'faculty') {
                        navigate(user.facultyType === 'advisor' ? '/faculty/advisor/notifications' : '/faculty/mentor/notifications');
                      } else {
                        navigate('/admin/notifications');
                      }
                    }}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-800"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                  {user?.registerNumber || user?.department || user?.email}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (user?.role === 'student') navigate('/student/profile');
                    else if (user?.role === 'faculty') {
                      navigate(user.facultyType === 'advisor' ? '/faculty/advisor/profile' : '/faculty/mentor/profile');
                    }
                  }}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
