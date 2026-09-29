import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// AUTH SERVICES
export const authService = {
  login: (data: { identifier: string; password: string; role?: string }) =>
    api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data: { email: string; role?: string }) =>
    api.post('/auth/forgot-password', data),
  verifyResetToken: (token: string, email?: string) =>
    api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}${email ? `&email=${encodeURIComponent(email)}` : ''}`),
  resetPassword: (data: { token: string; newPassword: string; confirmPassword: string }) =>
    api.post('/auth/reset-password', data),
};

// STUDENT SERVICES
export const studentService = {
  getDashboard: () => api.get('/students/dashboard'),
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data: any) => api.put('/students/profile', data),
  getMyMentor: () => api.get('/students/mentor'),
};

// MENTOR SERVICES
export const mentorService = {
  getDashboard: () => api.get('/mentors/dashboard'),
  getMentees: () => api.get('/mentors/mentees'),
  getMenteeDetail: (studentId: string) => api.get(`/mentors/mentees/${studentId}`),
  getSlots: () => api.get('/mentors/slots'),
  updateSlots: (slots: any[]) => api.put('/mentors/slots', { availableSlots: slots }),
};

// ADVISOR SERVICES
export const advisorService = {
  getDashboard: () => api.get('/advisors/dashboard'),
  getStudents: () => api.get('/advisors/students'),
  getAttendance: () => api.get('/advisors/attendance'),
  getAcademics: () => api.get('/advisors/academics'),
  getDocuments: () => api.get('/advisors/documents'),
  getApprovedODs: () => api.get('/advisors/od'),
  getPlacement: () => api.get('/advisors/placement'),
};

// OD SERVICES
export const odService = {
  submitOD: (formData: FormData) =>
    api.post('/od', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyODs: () => api.get('/od/my'),
  getAllODsAdmin: () => api.get('/od/admin'),
  adminReviewOD: (id: string, data: { action: 'approve' | 'reject'; remarks?: string }) =>
    api.patch(`/od/${id}/admin-review`, data),
  getMentorODs: () => api.get('/od/mentor'),
  mentorReviewOD: (id: string, data: { action: 'approve' | 'reject'; remarks?: string }) =>
    api.patch(`/od/${id}/mentor-review`, data),
};

// DOCUMENT SERVICES
export const documentService = {
  uploadDocument: (formData: FormData) =>
    api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyDocuments: () => api.get('/documents/my'),
  getAllDocumentsAdmin: () => api.get('/documents/admin'),
  verifyDocument: (id: string, data: { status: 'Verified' | 'Rejected'; remarks?: string }) =>
    api.patch(`/documents/${id}/verify`, data),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
};

// MEETING SERVICES
export const meetingService = {
  requestMeeting: (data: { date: string; time: string; meetingType: string; purpose: string }) =>
    api.post('/meetings/request', data),
  getMyMeetings: () => api.get('/meetings/my'),
  updateMeetingStatus: (id: string, data: { status: string; meetingLink?: string; notes?: string }) =>
    api.patch(`/meetings/${id}/status`, data),
};

// COUNSELLING SERVICES
export const counsellingService = {
  submitRecord: (data: any) => api.post('/counselling', data),
  getMyHistory: () => api.get('/counselling/my'),
  getMentorList: () => api.get('/counselling/mentor'),
  addMentorRemarks: (id: string, data: any) => api.patch(`/counselling/${id}/mentor-remarks`, data),
};

// ACADEMIC SERVICES
export const academicService = {
  getMyAcademics: () => api.get('/academics/my'),
  getStudentAcademics: (studentId: string) => api.get(`/academics/student/${studentId}`),
};

// LMS SERVICES
export const lmsService = {
  getCourses: () => api.get('/lms/courses'),
  getCourseDetail: (id: string) => api.get(`/lms/courses/${id}`),
  createCourse: (data: any) => api.post('/lms/courses', data),
  uploadStudyMaterial: (formData: FormData) =>
    api.post('/lms/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ASSESSMENT SERVICES
export const assessmentService = {
  getAssessments: () => api.get('/assessments'),
  getAssessmentById: (id: string) => api.get(`/assessments/${id}`),
  createAssessment: (data: any) => api.post('/assessments', data),
  submitAssessment: (id: string, data: { answers: Record<string, number>; timeTakenSeconds: number }) =>
    api.post(`/assessments/${id}/submit`, data),
  getMyResults: () => api.get('/assessments/my-results'),
  getAssessmentResults: (id: string) => api.get(`/assessments/${id}/results`),
};

// PLACEMENT SERVICES
export const placementService = {
  getDrives: () => api.get('/placements/drives'),
  createDrive: (data: any) => api.post('/placements/drives', data),
  updateDrive: (id: string, data: any) => api.put(`/placements/drives/${id}`, data),
  deleteDrive: (id: string) => api.delete(`/placements/drives/${id}`),
  applyForDrive: (driveId: string, data?: { resumeUrl?: string }) =>
    api.post(`/placements/apply/${driveId}`, data || {}),
  getMyApplications: () => api.get('/placements/my-applications'),
  getAllApplications: (driveId?: string) =>
    api.get('/placements/applications', { params: { driveId } }),
  updateStage: (id: string, data: { stage: string; remarks?: string }) =>
    api.patch(`/placements/applications/${id}/stage`, data),
};

// CLUB SERVICES
export const clubService = {
  getClubs: () => api.get('/clubs'),
  createClub: (data: any) => api.post('/clubs', data),
  joinClub: (id: string) => api.post(`/clubs/${id}/join`),
  getMyClubs: () => api.get('/clubs/my'),
  getMembers: (id: string) => api.get(`/clubs/${id}/members`),
};

// EVENT SERVICES
export const eventService = {
  getEvents: () => api.get('/events'),
  createEvent: (data: any) => api.post('/events', data),
  registerForEvent: (id: string) => api.post(`/events/${id}/register`),
  getMyRegistrations: () => api.get('/events/my'),
};

// ANNOUNCEMENT SERVICES
export const announcementService = {
  getAnnouncements: () => api.get('/announcements'),
  createAnnouncement: (data: any) => api.post('/announcements', data),
  deleteAnnouncement: (id: string) => api.delete(`/announcements/${id}`),
};

// NOTIFICATION SERVICES
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};

// ADMIN SERVICES
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: { role?: string; facultyType?: string; search?: string }) =>
    api.get('/admin/users', { params }),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  toggleStatus: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
  resetPassword: (id: string, newPassword?: string) =>
    api.post(`/admin/users/${id}/reset-password`, { newPassword }),
  getMentorMapping: () => api.get('/admin/mentor-mapping'),
  assignMentor: (studentUserId: string, mentorUserId: string) =>
    api.post('/admin/mentor-mapping', { studentUserId, mentorUserId }),
  getAdvisorMapping: () => api.get('/admin/advisor-mapping'),
  assignAdvisor: (data: { department: string; year: number; section: string; advisorUserId: string }) =>
    api.post('/admin/advisor-mapping', data),
};

export default api;
