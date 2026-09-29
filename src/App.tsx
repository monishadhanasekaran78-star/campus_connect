import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

// Auth Page
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { MyMentor } from './pages/student/MyMentor';
import { MentorMeetings } from './pages/student/MentorMeetings';
import { Counselling } from './pages/student/Counselling';
import { ODRequests } from './pages/student/ODRequests';
import { Academics } from './pages/student/Academics';
import { LMS } from './pages/student/LMS';
import { Assessments } from './pages/student/Assessments';
import { Placement } from './pages/student/Placement';
import { Clubs } from './pages/student/Clubs';
import { Events } from './pages/student/Events';
import { Announcements } from './pages/student/Announcements';
import { Documents } from './pages/student/Documents';
import { Notifications as StudentNotifications } from './pages/student/Notifications';

// Faculty Mentor Pages
import { MentorDashboard } from './pages/faculty/mentor/MentorDashboard';
import { MentorMentees } from './pages/faculty/mentor/MentorMentees';
import { MentorMenteeDetail } from './pages/faculty/mentor/MentorMenteeDetail';
import { MentorODRequests } from './pages/faculty/mentor/MentorODRequests';
import { MentorMeetingsPage } from './pages/faculty/mentor/MentorMeetingsPage';
import { MentorCounselling } from './pages/faculty/mentor/MentorCounselling';
import { MentorAcademicProgress } from './pages/faculty/mentor/MentorAcademicProgress';
import { MentorPlacementProgress } from './pages/faculty/mentor/MentorPlacementProgress';
import { MentorSlots } from './pages/faculty/mentor/MentorSlots';

// Faculty Advisor Pages
import { AdvisorDashboard } from './pages/faculty/advisor/AdvisorDashboard';
import { AdvisorStudents } from './pages/faculty/advisor/AdvisorStudents';
import { AdvisorAttendance } from './pages/faculty/advisor/AdvisorAttendance';
import { AdvisorAcademics } from './pages/faculty/advisor/AdvisorAcademics';
import { AdvisorDocuments } from './pages/faculty/advisor/AdvisorDocuments';
import { AdvisorODInfo } from './pages/faculty/advisor/AdvisorODInfo';
import { AdvisorPlacement } from './pages/faculty/advisor/AdvisorPlacement';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminFaculty } from './pages/admin/AdminFaculty';
import { AdminMentorMapping } from './pages/admin/AdminMentorMapping';
import { AdminAdvisorMapping } from './pages/admin/AdminAdvisorMapping';
import { AdminODManagement } from './pages/admin/AdminODManagement';
import { AdminDocumentManagement } from './pages/admin/AdminDocumentManagement';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminAssessments } from './pages/admin/AdminAssessments';
import { AdminPlacementDrives } from './pages/admin/AdminPlacementDrives';
import { AdminClubs } from './pages/admin/AdminClubs';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminReports } from './pages/admin/AdminReports';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
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
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="mentor" element={<MyMentor />} />
            <Route path="meetings" element={<MentorMeetings />} />
            <Route path="counselling" element={<Counselling />} />
            <Route path="od" element={<ODRequests />} />
            <Route path="academics" element={<Academics />} />
            <Route path="lms" element={<LMS />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="placement" element={<Placement />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="events" element={<Events />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="documents" element={<Documents />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          {/* Faculty Mentor Routes */}
          <Route
            path="/faculty/mentor"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']} requiredFacultyType="mentor">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/mentor/dashboard" replace />} />
            <Route path="dashboard" element={<MentorDashboard />} />
            <Route path="mentees" element={<MentorMentees />} />
            <Route path="mentees/:studentId" element={<MentorMenteeDetail />} />
            <Route path="od" element={<MentorODRequests />} />
            <Route path="meetings" element={<MentorMeetingsPage />} />
            <Route path="counselling" element={<MentorCounselling />} />
            <Route path="academics" element={<MentorAcademicProgress />} />
            <Route path="placements" element={<MentorPlacementProgress />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<MentorSlots />} />
          </Route>

          {/* Faculty Class Advisor Routes */}
          <Route
            path="/faculty/advisor"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']} requiredFacultyType="advisor">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/advisor/dashboard" replace />} />
            <Route path="dashboard" element={<AdvisorDashboard />} />
            <Route path="students" element={<AdvisorStudents />} />
            <Route path="attendance" element={<AdvisorAttendance />} />
            <Route path="academics" element={<AdvisorAcademics />} />
            <Route path="documents" element={<AdvisorDocuments />} />
            <Route path="od" element={<AdvisorODInfo />} />
            <Route path="placement" element={<AdvisorPlacement />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<AdvisorStudents />} />
          </Route>

          {/* Administrator Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="mentor-mapping" element={<AdminMentorMapping />} />
            <Route path="advisor-mapping" element={<AdminAdvisorMapping />} />
            <Route path="od" element={<AdminODManagement />} />
            <Route path="documents" element={<AdminDocumentManagement />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="assessments" element={<AdminAssessments />} />
            <Route path="placements" element={<AdminPlacementDrives />} />
            <Route path="clubs" element={<AdminClubs />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
