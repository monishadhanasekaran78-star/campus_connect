import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  MessageSquareHeart,
  FileSpreadsheet,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Briefcase,
  Users,
  CalendarDays,
  Megaphone,
  FolderOpen,
  Bell,
  LogOut,
  UserCog,
  FileCheck2,
  TrendingUp,
  UserPlus,
  GitBranch,
  BarChart3,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (user?.role === 'student') {
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/student/profile', icon: UserCheck },
        { label: 'My Mentor', path: '/student/mentor', icon: Users },
        { label: 'Mentor Meetings', path: '/student/meetings', icon: Calendar },
        { label: 'Counselling', path: '/student/counselling', icon: MessageSquareHeart },
        { label: 'OD Requests', path: '/student/od', icon: FileSpreadsheet },
        { label: 'Academics', path: '/student/academics', icon: GraduationCap },
        { label: 'LMS', path: '/student/lms', icon: BookOpen },
        { label: 'Assessments', path: '/student/assessments', icon: ClipboardCheck },
        { label: 'Placement', path: '/student/placement', icon: Briefcase },
        { label: 'Clubs', path: '/student/clubs', icon: Users },
        { label: 'Events', path: '/student/events', icon: CalendarDays },
        { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
        { label: 'Documents', path: '/student/documents', icon: FolderOpen },
        { label: 'Notifications', path: '/student/notifications', icon: Bell },
      ];
    }

    if (user?.role === 'faculty') {
      if (user.facultyType === 'advisor') {
        return [
          { label: 'Dashboard', path: '/faculty/advisor/dashboard', icon: LayoutDashboard },
          { label: 'My Students', path: '/faculty/advisor/students', icon: Users },
          { label: 'Attendance', path: '/faculty/advisor/attendance', icon: ClipboardCheck },
          { label: 'Academics', path: '/faculty/advisor/academics', icon: GraduationCap },
          { label: 'Documents', path: '/faculty/advisor/documents', icon: FolderOpen },
          { label: 'OD Information', path: '/faculty/advisor/od', icon: FileSpreadsheet },
          { label: 'Placement', path: '/faculty/advisor/placement', icon: Briefcase },
          { label: 'Notifications', path: '/faculty/advisor/notifications', icon: Bell },
          { label: 'Profile', path: '/faculty/advisor/profile', icon: UserCheck },
        ];
      }

      // Default Faculty Mentor
      return [
        { label: 'Dashboard', path: '/faculty/mentor/dashboard', icon: LayoutDashboard },
        { label: 'My Mentees', path: '/faculty/mentor/mentees', icon: Users },
        { label: 'OD Requests', path: '/faculty/mentor/od', icon: FileSpreadsheet },
        { label: 'Meetings', path: '/faculty/mentor/meetings', icon: Calendar },
        { label: 'Counselling', path: '/faculty/mentor/counselling', icon: MessageSquareHeart },
        { label: 'Academic Progress', path: '/faculty/mentor/academics', icon: GraduationCap },
        { label: 'Placement Progress', path: '/faculty/mentor/placements', icon: TrendingUp },
        { label: 'Notifications', path: '/faculty/mentor/notifications', icon: Bell },
        { label: 'Profile', path: '/faculty/mentor/profile', icon: UserCheck },
      ];
    }

    // Administrator
    return [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'User Management', path: '/admin/users', icon: UserCog },
      { label: 'Students', path: '/admin/students', icon: Users },
      { label: 'Faculty', path: '/admin/faculty', icon: GraduationCap },
      { label: 'Mentor Mapping', path: '/admin/mentor-mapping', icon: UserPlus },
      { label: 'Advisor Mapping', path: '/admin/advisor-mapping', icon: GitBranch },
      { label: 'OD Management', path: '/admin/od', icon: FileSpreadsheet },
      { label: 'Documents', path: '/admin/documents', icon: FileCheck2 },
      { label: 'Courses (LMS)', path: '/admin/courses', icon: BookOpen },
      { label: 'Assessments', path: '/admin/assessments', icon: ClipboardCheck },
      { label: 'Placement Drives', path: '/admin/placements', icon: Briefcase },
      { label: 'Clubs', path: '/admin/clubs', icon: Users },
      { label: 'Events', path: '/admin/events', icon: CalendarDays },
      { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
      { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    ];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Role Navigation section */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 opacity-80" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Logout bottom button */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
