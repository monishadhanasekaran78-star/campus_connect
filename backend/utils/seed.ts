import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  FacultyProfile,
  ODRequest,
  Document,
  MentorMeeting,
  CounsellingRecord,
  AcademicRecord,
  Attendance,
  Course,
  StudyMaterial,
  Assessment,
  Question,
  AssessmentResult,
  PlacementDrive,
  PlacementApplication,
  Club,
  ClubMembership,
  Event,
  EventRegistration,
  Announcement,
  Notification
} from '../models/index.js';

export async function seedDatabase() {
  const existingUsersCount = await User.countDocuments();
  if (existingUsersCount > 0) {
    console.log('[Seed] Database already contains records. Skipping initial seeding.');
    return;
  }

  console.log('[Seed] Seeding initial CampusConnect database with realistic college data...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  // 1. Create Core Users
  const adminUser = await User.create({
    name: 'Dr. S. Meenakshi Sundaram',
    email: 'admin@kiot.ac.in',
    password: passwordHash,
    role: 'admin',
    department: 'Administration',
    phone: '+91 98401 23456',
    isActive: true
  });

  const mentorUser = await User.create({
    name: 'Dr. Rajesh Kumar',
    email: 'rajeshkumar@kiot.ac.in',
    password: passwordHash,
    role: 'faculty',
    facultyType: 'mentor',
    department: 'Computer Science and Engineering',
    phone: '+91 98402 34567',
    isActive: true
  });

  // Also support mentor@kiot.ac.in
  await User.create({
    name: 'Dr. Rajesh Kumar',
    email: 'mentor@kiot.ac.in',
    password: passwordHash,
    role: 'faculty',
    facultyType: 'mentor',
    department: 'Computer Science and Engineering',
    phone: '+91 98402 34567',
    isActive: true
  });

  const advisorUser = await User.create({
    name: 'Prof. Ananya Sharma',
    email: 'ananyasharma@kiot.ac.in',
    password: passwordHash,
    role: 'faculty',
    facultyType: 'advisor',
    department: 'Computer Science and Engineering',
    phone: '+91 98403 45678',
    isActive: true
  });

  // Also support advisor@kiot.ac.in
  await User.create({
    name: 'Prof. Ananya Sharma',
    email: 'advisor@kiot.ac.in',
    password: passwordHash,
    role: 'faculty',
    facultyType: 'advisor',
    department: 'Computer Science and Engineering',
    phone: '+91 98403 45678',
    isActive: true
  });

  const studentUser = await User.create({
    name: 'Monisha Dhanasekaran',
    email: '2k24cse114@kiot.ac.in',
    password: passwordHash,
    registerNumber: '2K24CSE114',
    role: 'student',
    department: 'Computer Science and Engineering',
    phone: '+91 98404 56789',
    isActive: true
  });

  // Additional Students for realistic class & mentor groups
  const student2 = await User.create({
    name: 'Aditya K. Verma',
    email: '2k24cse115@kiot.ac.in',
    password: passwordHash,
    registerNumber: '2K24CSE115',
    role: 'student',
    department: 'Computer Science and Engineering',
    phone: '+91 98405 67890',
    isActive: true
  });

  const student3 = await User.create({
    name: 'Pooja R. Sundaram',
    email: '2k24cse116@kiot.ac.in',
    password: passwordHash,
    registerNumber: '2K24CSE116',
    role: 'student',
    department: 'Computer Science and Engineering',
    phone: '+91 98406 78901',
    isActive: true
  });

  const student4 = await User.create({
    name: 'Karthik N. Rao',
    email: '2k24it101@kiot.ac.in',
    password: passwordHash,
    registerNumber: '2K24IT101',
    role: 'student',
    department: 'Information Technology',
    phone: '+91 98407 89012',
    isActive: true
  });

  // 2. Faculty Profiles
  await FacultyProfile.create({
    userId: mentorUser._id!,
    name: mentorUser.name,
    facultyId: 'FAC-CSE-014',
    email: mentorUser.email,
    phone: mentorUser.phone || '',
    department: 'Computer Science and Engineering',
    designation: 'Associate Professor & Student Mentor',
    facultyType: 'mentor',
    officeLocation: 'Block B, Academic Complex Room 204',
    availableSlots: [
      { day: 'Monday', startTime: '10:00 AM', endTime: '11:30 AM', isAvailable: true },
      { day: 'Wednesday', startTime: '02:00 PM', endTime: '03:30 PM', isAvailable: true },
      { day: 'Friday', startTime: '11:00 AM', endTime: '12:30 PM', isAvailable: true }
    ]
  });

  await FacultyProfile.create({
    userId: advisorUser._id!,
    name: advisorUser.name,
    facultyId: 'FAC-CSE-009',
    email: advisorUser.email,
    phone: advisorUser.phone || '',
    department: 'Computer Science and Engineering',
    designation: 'Assistant Professor & Class Advisor',
    facultyType: 'advisor',
    officeLocation: 'Block B, Academic Complex Room 208',
    assignedClass: {
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A'
    },
    availableSlots: [
      { day: 'Tuesday', startTime: '09:30 AM', endTime: '11:00 AM', isAvailable: true },
      { day: 'Thursday', startTime: '03:00 PM', endTime: '04:30 PM', isAvailable: true }
    ]
  });

  // 3. Student Profiles
  await StudentProfile.create({
    userId: studentUser._id!,
    name: studentUser.name,
    registerNumber: studentUser.registerNumber!,
    email: studentUser.email,
    phone: studentUser.phone || '',
    department: 'Computer Science and Engineering',
    year: 3,
    section: 'A',
    dob: '2004-06-18',
    address: '14, Greenview Residency, Anna Nagar, Chennai - 600040',
    residenceType: 'Day Scholar',
    transportDetails: 'College Bus Route 12 - Anna Nagar West',
    mentorId: mentorUser._id!,
    mentorName: mentorUser.name,
    advisorId: advisorUser._id!,
    advisorName: advisorUser.name,
    attendancePct: 91.5,
    cgpa: 8.84
  });

  await StudentProfile.create({
    userId: student2._id!,
    name: student2.name,
    registerNumber: student2.registerNumber!,
    email: student2.email,
    phone: student2.phone || '',
    department: 'Computer Science and Engineering',
    year: 3,
    section: 'A',
    dob: '2004-03-22',
    address: 'Boys Hostel 3, Room 412, Campus North Wing',
    residenceType: 'Hosteller',
    transportDetails: 'On-Campus Resident',
    mentorId: mentorUser._id!,
    mentorName: mentorUser.name,
    advisorId: advisorUser._id!,
    advisorName: advisorUser.name,
    attendancePct: 86.0,
    cgpa: 8.42
  });

  await StudentProfile.create({
    userId: student3._id!,
    name: student3.name,
    registerNumber: student3.registerNumber!,
    email: student3.email,
    phone: student3.phone || '',
    department: 'Computer Science and Engineering',
    year: 3,
    section: 'A',
    dob: '2004-09-10',
    address: 'Girls Hostel 2, Room 215, Campus South Wing',
    residenceType: 'Hosteller',
    transportDetails: 'On-Campus Resident',
    mentorId: mentorUser._id!,
    mentorName: mentorUser.name,
    advisorId: advisorUser._id!,
    advisorName: advisorUser.name,
    attendancePct: 94.2,
    cgpa: 9.15
  });

  // 4. Documents for Student
  await Document.create([
    {
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      title: 'Secondary School (10th) Marksheet',
      documentType: '10th Marksheet',
      fileUrl: '/uploads/documents/sample_10th_marksheet.pdf',
      fileName: '10th_Marksheet_Monisha_D.pdf',
      fileSize: '1.4 MB',
      uploadDate: '2024-08-10',
      status: 'Verified',
      verifiedBy: 'Office of Academic Affairs',
      remarks: 'Original verified with state board records.'
    },
    {
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      title: 'Higher Secondary (12th) Marksheet',
      documentType: '12th Marksheet',
      fileUrl: '/uploads/documents/sample_12th_marksheet.pdf',
      fileName: '12th_HSC_Monisha_D.pdf',
      fileSize: '1.8 MB',
      uploadDate: '2024-08-10',
      status: 'Verified',
      verifiedBy: 'Office of Academic Affairs',
      remarks: 'Authentic certificate uploaded.'
    },
    {
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      title: 'Summer Cloud Computing Internship Certificate',
      documentType: 'Internship Certificate',
      fileUrl: '/uploads/documents/sample_internship_cert.pdf',
      fileName: 'AWS_Internship_Certificate.pdf',
      fileSize: '820 KB',
      uploadDate: '2025-07-28',
      status: 'Pending',
      remarks: 'Under verification by placement cell.'
    }
  ]);

  // 5. OD Requests
  await ODRequest.create([
    {
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A',
      purpose: 'National Level Hackathon Participation',
      fromDate: '2026-10-15',
      toDate: '2026-10-16',
      daysCount: 2,
      reason: 'Representing college team in Smart India Hackathon Grand Finale at IIT Madras.',
      supportingDocument: '/uploads/od/sih_invitation_letter.pdf',
      documentName: 'SIH_Shortlist_Letter.pdf',
      adminStatus: 'Approved',
      adminRemarks: 'Approved for national competition representation.',
      adminActionDate: '2026-09-28',
      mentorStatus: 'Approved',
      mentorRemarks: 'All best! Ensure lab assignments are submitted beforehand.',
      mentorActionDate: '2026-09-29',
      advisorStatus: 'Acknowledged',
      finalStatus: 'Mentor Approved'
    },
    {
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A',
      purpose: 'ACM Student Chapter Technical Symposium Paper Presentation',
      fromDate: '2026-10-22',
      toDate: '2026-10-22',
      daysCount: 1,
      reason: 'Paper presentation on Scalable Microservices Architecture.',
      supportingDocument: '/uploads/od/acm_presentation_invite.pdf',
      documentName: 'ACM_Acceptance_Email.pdf',
      adminStatus: 'Approved',
      adminRemarks: 'Verified by Dean Academic Office.',
      adminActionDate: '2026-09-27',
      mentorStatus: 'Pending',
      finalStatus: 'Pending Mentor'
    },
    {
      studentId: student2._id!,
      studentName: student2.name,
      registerNumber: student2.registerNumber!,
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A',
      purpose: 'Inter-College Basketball Tournament',
      fromDate: '2026-10-05',
      toDate: '2026-10-06',
      daysCount: 2,
      reason: 'University zonal level basketball playoffs.',
      adminStatus: 'Pending',
      mentorStatus: 'Pending',
      finalStatus: 'Pending Admin'
    }
  ]);

  // 6. Mentor Meetings
  const meeting1 = await MentorMeeting.create({
    studentId: studentUser._id!,
    studentName: studentUser.name,
    registerNumber: studentUser.registerNumber!,
    mentorId: mentorUser._id!,
    mentorName: mentorUser.name,
    date: '2026-09-22',
    time: '10:30 AM',
    meetingType: 'In-Person',
    meetingLink: 'Cabin B-204',
    purpose: 'Semester 5 Academic Review & Internship Roadmap',
    status: 'Completed',
    notes: 'Reviewed current CGPA. Discussed competitive programming goals and upcoming placement drive preparations.'
  });

  await MentorMeeting.create({
    studentId: studentUser._id!,
    studentName: studentUser.name,
    registerNumber: studentUser.registerNumber!,
    mentorId: mentorUser._id!,
    mentorName: mentorUser.name,
    date: '2026-10-08',
    time: '02:00 PM',
    meetingType: 'Online',
    meetingLink: 'https://meet.google.com/xyz-camp-usn',
    purpose: 'Final-Year Project Proposal & Tech Stack Discussion',
    status: 'Approved',
    notes: 'Please bring your draft project architecture diagram.'
  });

  // 7. Counselling Records
  await CounsellingRecord.create({
    studentId: studentUser._id!,
    studentName: studentUser.name,
    registerNumber: studentUser.registerNumber!,
    mentorId: mentorUser._id!,
    mentorName: mentorUser.name,
    meetingId: meeting1._id,
    meetingDate: '2026-09-22',
    discussionTopic: 'Semester 5 Academic Planning & Campus Placements Preparation',
    academicConcerns: 'Managing time effectively between distributed systems coursework and competitive coding practice.',
    careerConcerns: 'Targeting Tier-1 Product Companies (Zoho, Google, Microsoft) and seeking guidance on system design interviews.',
    developmentGoals: 'Complete LeetCode 150 study list and publish an IEEE conference paper before Semester 6.',
    studentFeedback: 'The mentor session provided clear milestone deadlines and reduced my anxiety regarding placement season.',
    mentorRemarks: 'Monisha possesses strong technical fundamentals and consistency. She is well-poised for top-tier hiring.',
    suggestions: 'Dedicate 1.5 hours daily to core algorithms. Review operating systems thread synchronization concepts.',
    followUpAction: 'Check progress on LeetCode dynamic programming list and review draft paper on October 8.',
    followUpDate: '2026-10-08',
    followUpStatus: 'In Progress'
  });

  // 8. Academic Records & Marks
  await AcademicRecord.create({
    studentId: studentUser._id!,
    registerNumber: studentUser.registerNumber!,
    studentName: studentUser.name,
    semester: 5,
    department: 'Computer Science and Engineering',
    cgpa: 8.84,
    sgpa: 9.02,
    backlogsCount: 0,
    subjects: [
      {
        code: 'CS3501',
        name: 'Compiler Design',
        credits: 4,
        internalMarks: 38,
        maxInternal: 40,
        semesterMarks: 54,
        maxSemester: 60,
        grade: 'O',
        attendancePct: 94.0
      },
      {
        code: 'CS3502',
        name: 'Distributed Database Systems',
        credits: 3,
        internalMarks: 36,
        maxInternal: 40,
        semesterMarks: 51,
        maxSemester: 60,
        grade: 'A+',
        attendancePct: 91.5
      },
      {
        code: 'CS3503',
        name: 'Full-Stack Web Architectures',
        credits: 4,
        internalMarks: 39,
        maxInternal: 40,
        semesterMarks: 58,
        maxSemester: 60,
        grade: 'O',
        attendancePct: 96.0
      },
      {
        code: 'CS3504',
        name: 'Artificial Intelligence & Deep Learning',
        credits: 3,
        internalMarks: 35,
        maxInternal: 40,
        semesterMarks: 49,
        maxSemester: 60,
        grade: 'A+',
        attendancePct: 88.5
      },
      {
        code: 'CS3505',
        name: 'Cloud Computing & DevOps',
        credits: 3,
        internalMarks: 37,
        maxInternal: 40,
        semesterMarks: 53,
        maxSemester: 60,
        grade: 'A+',
        attendancePct: 92.0
      },
      {
        code: 'CS3511',
        name: 'Advanced Programming Lab',
        credits: 2,
        internalMarks: 40,
        maxInternal: 40,
        semesterMarks: 59,
        maxSemester: 60,
        grade: 'O',
        attendancePct: 98.0
      }
    ]
  });

  // 9. Subject-wise Attendance
  const subjectsData = [
    { code: 'CS3501', name: 'Compiler Design', total: 42, attended: 39 },
    { code: 'CS3502', name: 'Distributed Database Systems', total: 38, attended: 35 },
    { code: 'CS3503', name: 'Full-Stack Web Architectures', total: 45, attended: 43 },
    { code: 'CS3504', name: 'AI & Deep Learning', total: 40, attended: 35 },
    { code: 'CS3505', name: 'Cloud Computing & DevOps', total: 36, attended: 33 },
    { code: 'CS3511', name: 'Advanced Programming Lab', total: 24, attended: 24 }
  ];

  for (const s of subjectsData) {
    await Attendance.create({
      studentId: studentUser._id!,
      registerNumber: studentUser.registerNumber!,
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A',
      subjectCode: s.code,
      subjectName: s.name,
      totalClasses: s.total,
      attendedClasses: s.attended,
      percentage: Number(((s.attended / s.total) * 100).toFixed(1)),
      month: 'September 2026'
    });
  }

  // 10. LMS Courses
  const course1 = await Course.create({
    courseCode: 'CS3503',
    courseName: 'Full-Stack Web Architectures with React & Node',
    department: 'Computer Science and Engineering',
    semester: 5,
    facultyId: mentorUser._id!,
    facultyName: mentorUser.name,
    credits: 4,
    description: 'Comprehensive study of modern client-server models, RESTful APIs, JWT authentication, state management, and high-concurrency Node.js microservices.',
    syllabus: 'Unit 1: Modern JS & React Hooks | Unit 2: Node.js Internals & Express | Unit 3: Database Modeling & ODM | Unit 4: Security & Authentication | Unit 5: Production Deployment'
  });

  const course2 = await Course.create({
    courseCode: 'CS3505',
    courseName: 'Cloud Infrastructure & Containerization',
    department: 'Computer Science and Engineering',
    semester: 5,
    facultyId: advisorUser._id!,
    facultyName: advisorUser.name,
    credits: 3,
    description: 'Practical exploration of virtual environments, Docker containers, Kubernetes orchestration, serverless microservices, and CI/CD pipelines.',
    syllabus: 'Unit 1: Cloud Service Models | Unit 2: Virtualization & Containers | Unit 3: Kubernetes Clusters | Unit 4: Serverless Computing | Unit 5: Monitoring & Reliability'
  });

  // 11. Study Materials
  await StudyMaterial.create([
    {
      courseId: course1._id!,
      courseCode: course1.courseCode,
      courseName: course1.courseName,
      title: 'Unit 1 Lecture Notes: Modern Component Lifecycle & Hooks',
      unit: 'Unit 1',
      description: 'Detailed explanation of useEffect dependency arrays, custom hooks, and React performance profiling.',
      fileUrl: '/uploads/lms/react_hooks_masterclass.pdf',
      fileName: 'React_Lifecycle_Hooks_Notes.pdf',
      fileType: 'PDF Document',
      uploadedBy: mentorUser.name,
      uploadedAt: '2026-08-20'
    },
    {
      courseId: course1._id!,
      courseCode: course1.courseCode,
      courseName: course1.courseName,
      title: 'Unit 2 Guide: Building Resilient Express Middleware & Error Handlers',
      unit: 'Unit 2',
      description: 'Production patterns for centralized error handling, request logging, rate limiting, and JWT tokens.',
      fileUrl: '/uploads/lms/express_security_guide.pdf',
      fileName: 'Express_Middleware_Security.pdf',
      fileType: 'PDF Document',
      uploadedBy: mentorUser.name,
      uploadedAt: '2026-09-05'
    },
    {
      courseId: course2._id!,
      courseCode: course2.courseCode,
      courseName: course2.courseName,
      title: 'Lab Exercise 3: Docker Multi-Stage Builds & Minimal Images',
      unit: 'Unit 2',
      description: 'Hands-on tutorial building alpine-based Node.js and React containers.',
      fileUrl: '/uploads/lms/docker_lab_manual.pdf',
      fileName: 'Docker_Lab_Exercise_3.pdf',
      fileType: 'PDF Document',
      uploadedBy: advisorUser.name,
      uploadedAt: '2026-09-12'
    }
  ]);

  // 12. Assessment & Questions
  const assessment1 = await Assessment.create({
    courseId: course1._id!,
    courseCode: course1.courseCode,
    courseName: course1.courseName,
    title: 'Mid-Term Assessment: Full-Stack Web Development & API Security',
    description: 'Comprehensive test covering React rendering mechanics, Express middleware pipelines, JWT encryption, and REST best practices.',
    durationMinutes: 15,
    totalMarks: 20,
    passingMarks: 10,
    deadline: '2026-10-20',
    questionsCount: 4,
    createdBy: mentorUser.name
  });

  const q1 = await Question.create({
    assessmentId: assessment1._id!,
    questionText: 'What happens when you pass an empty dependency array [] to useEffect in React?',
    options: [
      'The effect runs on every single render cycle',
      'The effect runs only once when the component mounts and cleans up on unmount',
      'The effect never executes at all',
      'The effect triggers an infinite loop error'
    ],
    correctAnswerIndex: 1,
    explanation: 'An empty dependency array indicates to React that the effect does not rely on props or state, executing once on mount and running its cleanup on unmount.',
    marks: 5
  });

  const q2 = await Question.create({
    assessmentId: assessment1._id!,
    questionText: 'Which HTTP status code is most appropriate for a client request that lacks valid authentication credentials?',
    options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
    correctAnswerIndex: 1,
    explanation: 'HTTP 401 Unauthorized indicates that the request has not been applied because it lacks valid authentication credentials for the target resource.',
    marks: 5
  });

  const q3 = await Question.create({
    assessmentId: assessment1._id!,
    questionText: 'In a Node.js Express server, which parameter must be called to pass execution to the subsequent middleware function?',
    options: ['next()', 'proceed()', 'res.continue()', 'dispatch()'],
    correctAnswerIndex: 0,
    explanation: 'Calling next() hands off control to the next middleware in the Express processing pipeline.',
    marks: 5
  });

  const q4 = await Question.create({
    assessmentId: assessment1._id!,
    questionText: 'Which header should be used by clients to pass bearer JWT authentication tokens to backend APIs?',
    options: [
      'Authentication: Token <jwt>',
      'Authorization: Bearer <token>',
      'X-JWT-Bearer: <token>',
      'Credentials: Bearer <token>'
    ],
    correctAnswerIndex: 1,
    explanation: 'RFC 6750 dictates the Authorization header with Bearer authentication scheme: Authorization: Bearer <token>.',
    marks: 5
  });

  // Previous result sample
  await AssessmentResult.create({
    assessmentId: assessment1._id!,
    assessmentTitle: assessment1.title,
    courseName: assessment1.courseName,
    studentId: student2._id!,
    studentName: student2.name,
    registerNumber: student2.registerNumber!,
    score: 15,
    totalMarks: 20,
    percentage: 75,
    passed: true,
    timeTakenSeconds: 520,
    answersSubmitted: [
      { questionIndex: 0, selectedOption: 1, isCorrect: true },
      { questionIndex: 1, selectedOption: 1, isCorrect: true },
      { questionIndex: 2, selectedOption: 0, isCorrect: true },
      { questionIndex: 3, selectedOption: 0, isCorrect: false }
    ],
    submittedAt: '2026-09-25T14:30:00.000Z'
  });

  // 13. Placement Drives
  const drive1 = await PlacementDrive.create({
    companyName: 'Zoho Corporation',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128&q=80',
    jobRole: 'Software Development Engineer (SDE-1)',
    jobDescription: 'Design, architect and implement robust cloud applications and collaboration software used by millions worldwide.',
    eligibilityCriteria: {
      minCgpa: 7.5,
      departments: ['CSE', 'IT', 'ECE', 'EEE'],
      noCurrentArrears: true
    },
    packageLPA: 8.5,
    driveDate: '2026-10-14',
    applicationDeadline: '2026-10-06',
    location: 'Campus Auditorium / On-Site Chennai',
    driveType: 'On-Campus',
    status: 'Upcoming'
  });

  const drive2 = await PlacementDrive.create({
    companyName: 'Microsoft India',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
    jobRole: 'Associate Software Engineer',
    jobDescription: 'Work with the Azure Core Systems team on next-generation hyperscale computing, AI frameworks, and distributed cloud services.',
    eligibilityCriteria: {
      minCgpa: 8.5,
      departments: ['CSE', 'IT'],
      noCurrentArrears: true
    },
    packageLPA: 24.0,
    driveDate: '2026-10-25',
    applicationDeadline: '2026-10-18',
    location: 'Virtual Selection / Microsoft Hyderabad Campus',
    driveType: 'Virtual',
    status: 'Upcoming'
  });

  const drive3 = await PlacementDrive.create({
    companyName: 'TCS Digital',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&q=80',
    jobRole: 'Digital Systems Specialist',
    jobDescription: 'Accelerate digital transformation projects using modern web frameworks, IoT solutions, and cloud architectures.',
    eligibilityCriteria: {
      minCgpa: 7.0,
      departments: ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'],
      noCurrentArrears: true
    },
    packageLPA: 7.2,
    driveDate: '2026-09-18',
    applicationDeadline: '2026-09-10',
    location: 'TCS Siruseri Campus',
    driveType: 'On-Campus',
    status: 'Completed'
  });

  // 14. Placement Applications
  await PlacementApplication.create([
    {
      driveId: drive1._id!,
      companyName: drive1.companyName,
      jobRole: drive1.jobRole,
      packageLPA: drive1.packageLPA,
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      department: 'Computer Science and Engineering',
      cgpa: 8.84,
      resumeUrl: '/uploads/documents/Monisha_Resume_2026.pdf',
      currentStage: 'Technical Round',
      statusHistory: [
        { stage: 'Applied', date: '2026-09-15', remarks: 'Application submitted through CampusConnect portal.' },
        { stage: 'Shortlisted', date: '2026-09-20', remarks: 'Profile shortlisted based on CGPA and coding credentials.' },
        { stage: 'Aptitude Round', date: '2026-09-24', remarks: 'Cleared online aptitude and programming assessment (92%).' },
        { stage: 'Technical Round', date: '2026-09-28', remarks: 'Scheduled for Technical Interview 1 on Oct 2.' }
      ],
      appliedAt: '2026-09-15'
    },
    {
      driveId: drive2._id!,
      companyName: drive2.companyName,
      jobRole: drive2.jobRole,
      packageLPA: drive2.packageLPA,
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      department: 'Computer Science and Engineering',
      cgpa: 8.84,
      resumeUrl: '/uploads/documents/Monisha_Resume_2026.pdf',
      currentStage: 'Applied',
      statusHistory: [
        { stage: 'Applied', date: '2026-09-28', remarks: 'Online registration completed. Awaiting preliminary test link.' }
      ],
      appliedAt: '2026-09-28'
    },
    {
      driveId: drive3._id!,
      companyName: drive3.companyName,
      jobRole: drive3.jobRole,
      packageLPA: drive3.packageLPA,
      studentId: student2._id!,
      studentName: student2.name,
      registerNumber: student2.registerNumber!,
      department: 'Computer Science and Engineering',
      cgpa: 8.42,
      currentStage: 'Selected',
      statusHistory: [
        { stage: 'Applied', date: '2026-09-08', remarks: 'Registration verified.' },
        { stage: 'Shortlisted', date: '2026-09-12', remarks: 'Shortlisted.' },
        { stage: 'Aptitude Round', date: '2026-09-15', remarks: 'Aptitude test cleared.' },
        { stage: 'Technical Round', date: '2026-09-18', remarks: 'Technical round cleared.' },
        { stage: 'HR Round', date: '2026-09-20', remarks: 'HR interview recommended.' },
        { stage: 'Selected', date: '2026-09-22', remarks: 'Offer Letter generated for TCS Digital Cadre!' }
      ],
      appliedAt: '2026-09-08'
    }
  ]);

  // 15. Clubs
  const club1 = await Club.create({
    name: 'ByteCraft Coding Society',
    code: 'CLUB-CS-01',
    description: 'The premier collegiate programming club fostering algorithms, competitive programming, hackathons, and open source development.',
    category: 'Technical',
    logo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=128&q=80',
    facultyCoordinator: 'Dr. Rajesh Kumar',
    studentCoordinator: 'Monisha Dhanasekaran',
    meetingSchedule: 'Every Wednesday at 04:30 PM (CS Lab 3)',
    activitiesCount: 16,
    membersCount: 142
  });

  const club2 = await Club.create({
    name: 'AeroBotix Robotics Club',
    code: 'CLUB-ROB-02',
    description: 'Design and build autonomous aerial drones, rover bots, and micro-controller embedded systems for national challenges.',
    category: 'Technical',
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=128&q=80',
    facultyCoordinator: 'Dr. K. Balakrishnan',
    studentCoordinator: 'Aditya K. Verma',
    meetingSchedule: 'Every Friday at 04:30 PM (Robotics Center)',
    activitiesCount: 12,
    membersCount: 88
  });

  const club3 = await Club.create({
    name: 'Kalaakriti Fine Arts & Cultural Guild',
    code: 'CLUB-CUL-03',
    description: 'Celebrating Indian classical music, modern dance, theatrical arts, and literary elocution across inter-collegiate fests.',
    category: 'Cultural',
    logo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=128&q=80',
    facultyCoordinator: 'Prof. Ananya Sharma',
    studentCoordinator: 'Pooja R. Sundaram',
    meetingSchedule: 'Saturdays at 11:00 AM (Auditorium)',
    activitiesCount: 20,
    membersCount: 210
  });

  await ClubMembership.create([
    {
      clubId: club1._id!,
      clubName: club1.name,
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      department: 'Computer Science and Engineering',
      role: 'Lead',
      status: 'Approved',
      joinedAt: '2024-09-01'
    },
    {
      clubId: club3._id!,
      clubName: club3.name,
      studentId: studentUser._id!,
      studentName: studentUser.name,
      registerNumber: studentUser.registerNumber!,
      department: 'Computer Science and Engineering',
      role: 'Member',
      status: 'Approved',
      joinedAt: '2025-01-15'
    }
  ]);

  // 16. Events
  const event1 = await Event.create({
    title: 'INVENTO 2026: National Technical Symposium',
    description: 'Annual inter-collegiate flagship symposium featuring 24-hr Hackathons, Paper Presentations, Debugging Challenges, and AI Design Sprints.',
    category: 'Symposium',
    organizer: 'Department of Computer Science & Engineering',
    venue: 'Dr. APJ Abdul Kalam Memorial Auditorium & CS Labs',
    date: '2026-10-24',
    time: '09:00 AM - 05:30 PM',
    registrationDeadline: '2026-10-18',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    maxParticipants: 500,
    registeredCount: 342
  });

  const event2 = await Event.create({
    title: 'Executive Masterclass: Cloud Native Microservices at Scale',
    description: 'Distinguished technical session by Principal Cloud Architect on Kubernetes clusters, service meshes, and distributed tracing.',
    category: 'Guest Lecture',
    organizer: 'CampusConnect Tech Chapter',
    venue: 'Convention Hall B',
    date: '2026-10-11',
    time: '02:00 PM - 04:30 PM',
    registrationDeadline: '2026-10-09',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80',
    maxParticipants: 180,
    registeredCount: 165
  });

  await EventRegistration.create({
    eventId: event1._id!,
    eventTitle: event1.title,
    studentId: studentUser._id!,
    studentName: studentUser.name,
    registerNumber: studentUser.registerNumber!,
    email: studentUser.email,
    department: 'Computer Science and Engineering',
    status: 'Registered',
    registeredAt: '2026-09-26'
  });

  // 17. Announcements
  await Announcement.create([
    {
      title: 'End-Semester Theory & Practical Examinations Schedule - Autumn 2026',
      description: 'The official timetable for Semester 3, 5, and 7 examinations has been released by the Controller of Examinations. Hall tickets will be issued starting October 28.',
      category: 'Exam',
      priority: 'High',
      targetAudience: 'All',
      department: 'All Departments',
      postedBy: 'Office of Controller of Examinations',
      createdAt: '2026-09-28T09:00:00.000Z'
    },
    {
      title: 'Zoho Corporation Campus Recruitment Drive 2026 Instructions',
      description: 'Eligible 3rd and 4th year students registered for Zoho SDE drive must ensure their resumes and 10th/12th marksheets are verified in the Documents section before October 6.',
      category: 'Placement',
      priority: 'Urgent',
      targetAudience: 'Students',
      department: 'Circuit Branches',
      postedBy: 'Career Guidance & Placement Cell',
      createdAt: '2026-09-27T11:15:00.000Z'
    },
    {
      title: 'Mandatory Monthly Mentor-Mentee Counselling Session Cycle',
      description: 'All mentors and student mentees are advised to conclude their Semester 5 mid-term counselling reviews and document follow-up plans by October 15.',
      category: 'College',
      priority: 'Medium',
      targetAudience: 'Mentors',
      department: 'All Departments',
      postedBy: 'Dean of Student Welfare',
      createdAt: '2026-09-25T14:00:00.000Z'
    },
    {
      title: 'Class Advisor Review Meeting: Attendance Shortfall & Remedial Classes',
      description: 'Class advisors are requested to review students having attendance below 75% and schedule counseling sessions before October 10.',
      category: 'Department',
      priority: 'Medium',
      targetAudience: 'Advisors',
      department: 'Computer Science and Engineering',
      postedBy: 'Head of Department, CSE',
      createdAt: '2026-09-24T16:00:00.000Z'
    }
  ]);

  // 18. Notifications
  await Notification.create([
    {
      userId: studentUser._id!,
      title: 'OD Request Approved by Mentor',
      message: 'Your On-Duty request for "National Level Hackathon Participation" has been approved by your mentor Dr. Rajesh Kumar.',
      type: 'OD',
      isRead: false,
      createdAt: '2026-09-29T08:15:00.000Z'
    },
    {
      userId: studentUser._id!,
      title: 'Mentor Meeting Confirmed',
      message: 'Your meeting with Dr. Rajesh Kumar has been confirmed for Oct 8, 2026 at 02:00 PM.',
      type: 'Meeting',
      isRead: false,
      createdAt: '2026-09-28T10:30:00.000Z'
    },
    {
      userId: studentUser._id!,
      title: 'Placement Stage Updated: Technical Round',
      message: 'Congratulations! You have been moved to the Technical Round for Zoho Corporation.',
      type: 'Placement',
      isRead: true,
      createdAt: '2026-09-28T16:00:00.000Z'
    },
    {
      userId: mentorUser._id!,
      title: 'New OD Request Awaiting Mentor Review',
      message: 'Student Monisha Dhanasekaran has submitted an OD request for ACM Symposium after Admin approval.',
      type: 'OD',
      isRead: false,
      createdAt: '2026-09-27T14:20:00.000Z'
    },
    {
      userId: advisorUser._id!,
      title: 'New Approved OD in Your Class',
      message: 'Monisha Dhanasekaran (CSE 3-A) has an approved OD for 2 days (Oct 15-16, 2026).',
      type: 'OD',
      isRead: false,
      createdAt: '2026-09-29T08:20:00.000Z'
    },
    {
      userId: adminUser._id!,
      title: 'New Pending Document Upload',
      message: 'New internship certificate uploaded by Monisha Dhanasekaran requires administrative verification.',
      type: 'General',
      isRead: false,
      createdAt: '2026-09-28T12:00:00.000Z'
    }
  ]);

  console.log('[Seed] Seeding completed successfully. Demo accounts ready!');
}
