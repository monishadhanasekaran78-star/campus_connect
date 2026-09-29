import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  StudentProfile,
  FacultyProfile,
  ODRequest,
  MentorMeeting,
  AcademicRecord,
  Attendance,
  PlacementApplication,
  Announcement,
  Event,
  Assessment,
  Notification
} from '../models/index.js';

export const getStudentDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Mentor details
    let mentor = null;
    if (profile.mentorId) {
      mentor = await FacultyProfile.findOne({ userId: profile.mentorId });
    }

    // Advisor details
    let advisor = null;
    if (profile.advisorId) {
      advisor = await FacultyProfile.findOne({ userId: profile.advisorId });
    }

    // OD Requests
    const odRequests = await ODRequest.find({ studentId: userId }).sort({ createdAt: -1 }).limit(5).exec();
    const pendingOdCount = await ODRequest.countDocuments({
      studentId: userId,
      finalStatus: { $in: ['Pending Admin', 'Pending Mentor'] }
    });

    // Upcoming Meetings
    const upcomingMeetings = await MentorMeeting.find({
      studentId: userId,
      status: { $in: ['Requested', 'Approved'] }
    }).sort({ date: 1 }).limit(3).exec();

    // Placement Applications
    const placementApps = await PlacementApplication.find({ studentId: userId }).sort({ appliedAt: -1 }).limit(4).exec();

    // Recent Announcements
    const announcements = await Announcement.find({
      $or: [{ targetAudience: 'All' }, { targetAudience: 'Students' }]
    }).sort({ createdAt: -1 }).limit(5).exec();

    // Upcoming Events
    const events = await Event.find().sort({ date: 1 }).limit(4).exec();

    // Active Assessments
    const assessments = await Assessment.find().sort({ deadline: 1 }).limit(3).exec();

    // Unread notifications
    const unreadNotifications = await Notification.countDocuments({ userId, isRead: false });

    // Academic performance summary
    const academicRecord = await AcademicRecord.findOne({ studentId: userId });

    return res.json({
      success: true,
      data: {
        profile,
        mentor,
        advisor,
        attendancePct: profile.attendancePct,
        cgpa: profile.cgpa,
        pendingOdCount,
        recentOds: odRequests,
        upcomingMeetings,
        placementApplications: placementApps,
        announcements,
        events,
        assessments,
        unreadNotifications,
        academicSummary: academicRecord
      }
    });
  } catch (err: any) {
    console.error('Student dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving dashboard data' });
  }
};

export const getStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const profile = await StudentProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    let mentor = null;
    if (profile.mentorId) {
      mentor = await FacultyProfile.findOne({ userId: profile.mentorId });
    }

    let advisor = null;
    if (profile.advisorId) {
      advisor = await FacultyProfile.findOne({ userId: profile.advisorId });
    }

    return res.json({
      success: true,
      profile,
      mentor,
      advisor
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving student profile' });
  }
};

export const updateStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { phone, address, residenceType, transportDetails, dob } = req.body;

    const profile = await StudentProfile.findOne({ userId });
    if (!profile || !profile._id) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const updated = await StudentProfile.findByIdAndUpdate(profile._id, {
      phone: phone !== undefined ? phone : profile.phone,
      address: address !== undefined ? address : profile.address,
      residenceType: residenceType !== undefined ? residenceType : profile.residenceType,
      transportDetails: transportDetails !== undefined ? transportDetails : profile.transportDetails,
      dob: dob !== undefined ? dob : profile.dob
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

export const getMyMentor = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const profile = await StudentProfile.findOne({ userId });
    if (!profile || !profile.mentorId) {
      return res.status(404).json({ success: false, message: 'No mentor assigned yet. Please contact administration.' });
    }

    const mentorProfile = await FacultyProfile.findOne({ userId: profile.mentorId });
    if (!mentorProfile) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found' });
    }

    // Also get meetings with this mentor
    const meetings = await MentorMeeting.find({
      studentId: userId,
      mentorId: profile.mentorId
    }).sort({ date: -1 }).exec();

    return res.json({
      success: true,
      mentor: mentorProfile,
      availableSlots: mentorProfile.availableSlots || [],
      meetings
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving mentor information' });
  }
};
