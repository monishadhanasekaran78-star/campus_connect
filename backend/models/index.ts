import { getCollection } from '../config/db.js';

// 1. User Model
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  registerNumber?: string;
  role: 'student' | 'faculty' | 'admin';
  facultyType?: 'mentor' | 'advisor';
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  resetTokenHash?: string;
  resetTokenExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
}
export const User = getCollection<IUser>('users');

// 2. StudentProfile Model
export interface IStudentProfile {
  _id?: string;
  userId: string;
  name: string;
  registerNumber: string;
  email: string;
  phone: string;
  department: string;
  year: number;
  section: string;
  dob: string;
  address: string;
  residenceType: 'Hosteller' | 'Day Scholar';
  transportDetails: string;
  mentorId?: string;
  mentorName?: string;
  advisorId?: string;
  advisorName?: string;
  attendancePct: number;
  cgpa: number;
  createdAt?: string;
  updatedAt?: string;
}
export const StudentProfile = getCollection<IStudentProfile>('student_profiles');

// 3. FacultyProfile Model
export interface IFacultySlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
export interface IFacultyProfile {
  _id?: string;
  userId: string;
  name: string;
  facultyId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  facultyType: 'mentor' | 'advisor';
  officeLocation: string;
  availableSlots: IFacultySlot[];
  assignedClass?: {
    department: string;
    year: number;
    section: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
export const FacultyProfile = getCollection<IFacultyProfile>('faculty_profiles');

// 4. ODRequest Model
export interface IODRequest {
  _id?: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  year: number;
  section: string;
  purpose: string;
  fromDate: string;
  toDate: string;
  daysCount: number;
  reason: string;
  supportingDocument?: string;
  documentName?: string;
  adminStatus: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks?: string;
  adminActionDate?: string;
  mentorStatus: 'Pending' | 'Approved' | 'Rejected';
  mentorRemarks?: string;
  mentorActionDate?: string;
  advisorStatus?: 'Acknowledged';
  finalStatus: 'Pending Admin' | 'Admin Rejected' | 'Pending Mentor' | 'Mentor Approved' | 'Mentor Rejected';
  createdAt?: string;
  updatedAt?: string;
}
export const ODRequest = getCollection<IODRequest>('od_requests');

// 5. Document Model
export interface IDocument {
  _id?: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  title: string;
  documentType: '10th Marksheet' | '12th Marksheet' | 'Internship Certificate' | 'Academic Document' | 'Other';
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadDate: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  verifiedBy?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}
export const Document = getCollection<IDocument>('documents');

// 6. MentorMeeting Model
export interface IMentorMeeting {
  _id?: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  mentorId: string;
  mentorName: string;
  date: string;
  time: string;
  meetingType: 'Online' | 'In-Person';
  meetingLink?: string;
  purpose: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
export const MentorMeeting = getCollection<IMentorMeeting>('mentor_meetings');

// 7. CounsellingRecord Model
export interface ICounsellingRecord {
  _id?: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  mentorId: string;
  mentorName: string;
  meetingId?: string;
  meetingDate: string;
  discussionTopic: string;
  academicConcerns: string;
  careerConcerns: string;
  developmentGoals: string;
  studentFeedback: string;
  mentorRemarks?: string;
  suggestions?: string;
  followUpAction?: string;
  followUpDate?: string;
  followUpStatus: 'Pending' | 'In Progress' | 'Completed';
  createdAt?: string;
  updatedAt?: string;
}
export const CounsellingRecord = getCollection<ICounsellingRecord>('counselling_records');

// 8. AcademicRecord Model
export interface ISubjectMark {
  code: string;
  name: string;
  credits: number;
  internalMarks: number;
  maxInternal: number;
  semesterMarks: number;
  maxSemester: number;
  grade: string;
  attendancePct: number;
}
export interface IAcademicRecord {
  _id?: string;
  studentId: string;
  registerNumber: string;
  studentName: string;
  semester: number;
  department: string;
  subjects: ISubjectMark[];
  cgpa: number;
  sgpa: number;
  backlogsCount: number;
  createdAt?: string;
  updatedAt?: string;
}
export const AcademicRecord = getCollection<IAcademicRecord>('academic_records');

// 9. Attendance Model
export interface IAttendance {
  _id?: string;
  studentId: string;
  registerNumber: string;
  department: string;
  year: number;
  section: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  month: string;
  createdAt?: string;
  updatedAt?: string;
}
export const Attendance = getCollection<IAttendance>('attendance');

// 10. Course Model
export interface ICourse {
  _id?: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  facultyId?: string;
  facultyName?: string;
  credits: number;
  description: string;
  syllabus?: string;
  createdAt?: string;
  updatedAt?: string;
}
export const Course = getCollection<ICourse>('courses');

// 11. StudyMaterial Model
export interface IStudyMaterial {
  _id?: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  unit: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
export const StudyMaterial = getCollection<IStudyMaterial>('study_materials');

// 12. Assessment Model
export interface IAssessment {
  _id?: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  deadline: string;
  questionsCount?: number;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
export const Assessment = getCollection<IAssessment>('assessments');

// 13. Question Model
export interface IQuestion {
  _id?: string;
  assessmentId: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  marks: number;
  createdAt?: string;
  updatedAt?: string;
}
export const Question = getCollection<IQuestion>('questions');

// 14. AssessmentResult Model
export interface ISubmittedAnswer {
  questionId?: string;
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
}
export interface IAssessmentResult {
  _id?: string;
  assessmentId: string;
  assessmentTitle: string;
  courseName: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  answersSubmitted: ISubmittedAnswer[];
  submittedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
export const AssessmentResult = getCollection<IAssessmentResult>('assessment_results');

// 15. PlacementDrive Model
export interface IPlacementDrive {
  _id?: string;
  companyName: string;
  logo?: string;
  jobRole: string;
  jobDescription: string;
  eligibilityCriteria: {
    minCgpa: number;
    departments: string[];
    noCurrentArrears: boolean;
  };
  packageLPA: number;
  driveDate: string;
  applicationDeadline: string;
  location: string;
  driveType: 'On-Campus' | 'Virtual' | 'Pool-Campus';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  createdAt?: string;
  updatedAt?: string;
}
export const PlacementDrive = getCollection<IPlacementDrive>('placement_drives');

// 16. PlacementApplication Model
export interface IStatusHistoryItem {
  stage: string;
  date: string;
  remarks: string;
}
export interface IPlacementApplication {
  _id?: string;
  driveId: string;
  companyName: string;
  jobRole: string;
  packageLPA: number;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  cgpa: number;
  resumeUrl?: string;
  currentStage: 'Applied' | 'Shortlisted' | 'Aptitude Round' | 'Technical Round' | 'HR Round' | 'Selected' | 'Not Selected';
  statusHistory: IStatusHistoryItem[];
  appliedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
export const PlacementApplication = getCollection<IPlacementApplication>('placement_applications');

// 17. Club Model
export interface IClub {
  _id?: string;
  name: string;
  code: string;
  description: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Social' | 'Literary';
  logo?: string;
  facultyCoordinator: string;
  studentCoordinator: string;
  meetingSchedule: string;
  activitiesCount: number;
  membersCount: number;
  createdAt?: string;
  updatedAt?: string;
}
export const Club = getCollection<IClub>('clubs');

// 18. ClubMembership Model
export interface IClubMembership {
  _id?: string;
  clubId: string;
  clubName: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  role: 'Member' | 'Coordinator' | 'Lead';
  status: 'Pending' | 'Approved' | 'Rejected';
  joinedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
export const ClubMembership = getCollection<IClubMembership>('club_memberships');

// 19. Event Model
export interface IEvent {
  _id?: string;
  title: string;
  description: string;
  category: 'Symposium' | 'Workshop' | 'Cultural' | 'Sports' | 'Guest Lecture' | 'Hackathon';
  organizer: string;
  venue: string;
  date: string;
  time: string;
  registrationDeadline: string;
  imageUrl?: string;
  maxParticipants: number;
  registeredCount: number;
  createdAt?: string;
  updatedAt?: string;
}
export const Event = getCollection<IEvent>('events');

// 20. EventRegistration Model
export interface IEventRegistration {
  _id?: string;
  eventId: string;
  eventTitle: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  email: string;
  department: string;
  status: 'Registered' | 'Attended' | 'Cancelled';
  registeredAt: string;
  createdAt?: string;
  updatedAt?: string;
}
export const EventRegistration = getCollection<IEventRegistration>('event_registrations');

// 21. Announcement Model
export interface IAnnouncement {
  _id?: string;
  title: string;
  description: string;
  category: 'College' | 'Department' | 'Exam' | 'Placement' | 'Event';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  targetAudience: 'All' | 'Students' | 'Faculty' | 'Mentors' | 'Advisors';
  department?: string;
  postedBy: string;
  createdAt?: string;
  updatedAt?: string;
}
export const Announcement = getCollection<IAnnouncement>('announcements');

// 22. Notification Model
export interface INotification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'OD' | 'Meeting' | 'Counselling' | 'Placement' | 'Announcement' | 'Event' | 'LMS' | 'General';
  relatedId?: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export const Notification = getCollection<INotification>('notifications');

// 23. PasswordResetToken Model
export interface IPasswordResetToken {
  _id?: string;
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: string; // ISO date string
  used: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export const PasswordResetToken = getCollection<IPasswordResetToken>('password_reset_tokens');
