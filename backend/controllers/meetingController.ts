import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { MentorMeeting, StudentProfile, FacultyProfile, Notification } from '../models/index.js';

export const requestMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { date, time, meetingType, purpose } = req.body;
    if (!date || !time || !purpose) {
      return res.status(400).json({ success: false, message: 'Date, Time, and Purpose are required' });
    }

    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile || !studentProfile.mentorId) {
      return res.status(400).json({ success: false, message: 'You do not have an assigned mentor' });
    }

    const mentorProfile = await FacultyProfile.findOne({ userId: studentProfile.mentorId });
    const mentorName = mentorProfile?.name || studentProfile.mentorName || 'Mentor';

    const meeting = await MentorMeeting.create({
      studentId,
      studentName: studentProfile.name,
      registerNumber: studentProfile.registerNumber,
      mentorId: studentProfile.mentorId,
      mentorName,
      date,
      time,
      meetingType: meetingType || 'In-Person',
      purpose,
      status: 'Requested'
    });

    // Notify mentor
    await Notification.create({
      userId: studentProfile.mentorId,
      title: 'New Mentor Meeting Requested',
      message: `${studentProfile.name} requested a meeting on ${date} at ${time}. Purpose: ${purpose}`,
      type: 'Meeting',
      relatedId: meeting._id,
      isRead: false
    });

    return res.status(201).json({
      success: true,
      message: 'Meeting requested successfully. Awaiting mentor confirmation.',
      meeting
    });
  } catch (err: any) {
    console.error('Request meeting error:', err);
    return res.status(500).json({ success: false, message: 'Server error requesting meeting' });
  }
};

export const getMyMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    let meetings = [];
    if (role === 'student') {
      meetings = await MentorMeeting.find({ studentId: userId }).sort({ date: -1 }).exec();
    } else if (role === 'faculty') {
      meetings = await MentorMeeting.find({ mentorId: userId }).sort({ date: -1 }).exec();
    } else {
      meetings = await MentorMeeting.find().sort({ date: -1 }).exec();
    }

    return res.json({ success: true, meetings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving meetings' });
  }
};

export const updateMeetingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, meetingLink, notes } = req.body; // status: 'Approved' | 'Rejected' | 'Completed' | 'Cancelled'

    const meeting = await MentorMeeting.findById(id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    const updateFields: any = { status };
    if (meetingLink !== undefined) updateFields.meetingLink = meetingLink;
    if (notes !== undefined) updateFields.notes = notes;

    const updated = await MentorMeeting.findByIdAndUpdate(id, updateFields);

    // Notify student
    await Notification.create({
      userId: meeting.studentId,
      title: `Meeting ${status}: ${meeting.date} at ${meeting.time}`,
      message: status === 'Approved'
        ? `Your mentor meeting on ${meeting.date} at ${meeting.time} was confirmed. ${meetingLink ? 'Link: ' + meetingLink : ''}`
        : `Your meeting status was updated to: ${status}. ${notes ? 'Note: ' + notes : ''}`,
      type: 'Meeting',
      relatedId: meeting._id,
      isRead: false
    });

    return res.json({
      success: true,
      message: `Meeting status updated to ${status}`,
      meeting: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating meeting' });
  }
};
