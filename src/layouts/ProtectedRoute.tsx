import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Array<'student' | 'faculty' | 'admin'>;
  requiredFacultyType?: 'mentor' | 'advisor';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredFacultyType,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'faculty') {
      return (
        <Navigate
          to={
            user.facultyType === 'advisor'
              ? '/faculty/advisor/dashboard'
              : '/faculty/mentor/dashboard'
          }
          replace
        />
      );
    }
    return <Navigate to="/login" replace />;
  }

  // Check faculty subrole if specified
  if (requiredFacultyType && user.role === 'faculty') {
    if (user.facultyType !== requiredFacultyType) {
      return (
        <Navigate
          to={
            user.facultyType === 'advisor'
              ? '/faculty/advisor/dashboard'
              : '/faculty/mentor/dashboard'
          }
          replace
        />
      );
    }
  }

  return children;
};
