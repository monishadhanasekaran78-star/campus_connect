import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  StudentProfile,
  FacultyProfile,
  ODRequest,
  MentorMeeting,
  CounsellingRecord,
  AcademicRecord,
  Attendance,
  Document,
  PlacementApplication
} from '../models/index.js';

export const getMentorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const mentorId = req.user?.userId;
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const mentees = await StudentProfile.find({ mentorId }).exec();
    const menteeIds = mentees.map(m => m.userId);

    // Pending ODs for this mentor
    const pendingODs = await ODRequest.find({
      studentId: { $in: menteeIds },
      finalStatus: 'Pending Mentor'
    }).exec();

    // Upcoming Meetings
    const upcomingMeetings = await MentorMeeting.find({
      mentorId,
      status: { $in: ['Requested', 'Approved'] }
    }).sort({ date: 1 }).limit(5).exec();

    // Counselling records requiring follow-up
    const followUps = await CounsellingRecord.find({
      mentorId,
      followUpStatus: { $in: ['Pending', 'In Progress'] }
    }).sort({ followUpDate: 1 }).exec();

    // Average CGPA and Attendance across mentees
    const avgAttendance = mentees.length > 0
      ? (mentees.reduce((acc, m) => acc + (m.attendancePct || 0), 0) / mentees.length).toFixed(1)
      : '0.0';

    const avgCgpa = mentees.length > 0
      ? (mentees.reduce((acc, m) => acc + (m.cgpa || 0), 0) / mentees.length).toFixed(2)
      : '0.0';

    // Recent placement applications from mentees
    const placementApps = await PlacementApplication.find({
      studentId: { $in: menteeIds }
    }).sort({ appliedAt: -1 }).limit(5).exec();

    return res.json({
      success: true,
      data: {
        totalMentees: mentees.length,
        pendingOdCount: pendingODs.length,
        upcomingMeetingsCount: upcomingMeetings.length,
        pendingFollowUpsCount: followUps.length,
        avgAttendance,
        avgCgpa,
        mentees,
        pendingODs,
        upcomingMeetings,
        followUps,
        placementApps
      }
    });
  } catch (err: any) {
    console.error('Mentor dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving mentor dashboard' });
  }
};

export const getAssignedMentees = async (req: AuthRequest, res: Response) => {
  try {
    const mentorId = req.user?.userId;
    const mentees = await StudentProfile.find({ mentorId }).sort({ name: 1 }).exec();

    // Attach latest placement stage for each
    const menteeDetails = await Promise.all(
      mentees.map(async m => {
        const latestPlacement = await PlacementApplication.findOne({ studentId: m.userId });
        const pendingOd = await ODRequest.findOne({ studentId: m.userId, finalStatus: 'Pending Mentor' });
        return {
          ...m,
          placementStage: latestPlacement?.currentStage || 'Not Applied',
          hasPendingOd: !!pendingOd
        };
      })
    );

    return res.json({ success: true, mentees: menteeDetails });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving mentees' });
  }
};

export const getMenteeDetail = async (req: AuthRequest, res: Response) => {
  try {
    const mentorId = req.user?.userId;
    const { studentId } = req.params;

    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Verify this student is assigned to this mentor or user is admin
    if (req.user?.role !== 'admin' && studentProfile.mentorId !== mentorId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this student' });
    }

    const academicRecord = await AcademicRecord.findOne({ studentId });
    const attendanceRecords = await Attendance.find({ studentId }).exec();
    const odRequests = await ODRequest.find({ studentId }).sort({ createdAt: -1 }).exec();
    const documents = await Document.find({ studentId }).sort({ uploadDate: -1 }).exec();
    const counsellingRecords = await CounsellingRecord.find({ studentId }).sort({ meetingDate: -1 }).exec();
    const meetings = await MentorMeeting.find({ studentId }).sort({ date: -1 }).exec();
    const placements = await PlacementApplication.find({ studentId }).sort({ appliedAt: -1 }).exec();

    return res.json({
      success: true,
      data: {
        profile: studentProfile,
        academicRecord,
        attendanceRecords,
        odRequests,
        documents,
        counsellingRecords,
        meetings,
        placements
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving mentee details' });
  }
};

export const getMentorSlots = async (req: AuthRequest, res: Response) => {
  try {
    const mentorId = req.user?.userId;
    const profile = await FacultyProfile.findOne({ userId: mentorId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    return res.json({ success: true, availableSlots: profile.availableSlots || [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving slots' });
  }
};

export const updateMentorSlots = async (req: AuthRequest, res: Response) => {
  try {
    const mentorId = req.user?.userId;
    const { availableSlots } = req.body;

    const profile = await FacultyProfile.findOne({ userId: mentorId });
    if (!profile || !profile._id) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const updated = await FacultyProfile.findByIdAndUpdate(profile._id, { availableSlots });
    return res.json({
      success: true,
      message: 'Available meeting slots updated successfully',
      availableSlots: updated?.availableSlots
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating slots' });
  }
};
