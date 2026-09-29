import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { CounsellingRecord, StudentProfile, Notification } from '../models/index.js';

export const submitCounsellingRecord = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const {
      meetingId,
      meetingDate,
      discussionTopic,
      academicConcerns,
      careerConcerns,
      developmentGoals,
      studentFeedback
    } = req.body;

    if (!meetingDate || !discussionTopic) {
      return res.status(400).json({ success: false, message: 'Meeting date and Discussion topic are required' });
    }

    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile || !studentProfile.mentorId) {
      return res.status(400).json({ success: false, message: 'No mentor assigned' });
    }

    const record = await CounsellingRecord.create({
      studentId,
      studentName: studentProfile.name,
      registerNumber: studentProfile.registerNumber,
      mentorId: studentProfile.mentorId,
      mentorName: studentProfile.mentorName || 'Mentor',
      meetingId,
      meetingDate,
      discussionTopic,
      academicConcerns: academicConcerns || '',
      careerConcerns: careerConcerns || '',
      developmentGoals: developmentGoals || '',
      studentFeedback: studentFeedback || '',
      followUpStatus: 'Pending'
    });

    // Notify mentor
    await Notification.create({
      userId: studentProfile.mentorId,
      title: 'New Counselling Feedback Submitted',
      message: `${studentProfile.name} submitted a counselling record for session on ${meetingDate}.`,
      type: 'Counselling',
      relatedId: record._id,
      isRead: false
    });

    return res.status(201).json({
      success: true,
      message: 'Counselling record submitted successfully. Awaiting mentor remarks.',
      record
    });
  } catch (err: any) {
    console.error('Submit counselling error:', err);
    return res.status(500).json({ success: false, message: 'Server error submitting counselling record' });
  }
};

export const getMyCounsellingHistory = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const records = await CounsellingRecord.find({ studentId }).sort({ meetingDate: -1 }).exec();
    return res.json({ success: true, records });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving counselling history' });
  }
};

export const getMentorCounsellingList = async (req: AuthRequest, res: Response) => {
  try {
    const mentorId = req.user?.userId;
    const records = await CounsellingRecord.find({ mentorId }).sort({ meetingDate: -1 }).exec();
    return res.json({ success: true, records });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving mentor counselling records' });
  }
};

export const addMentorRemarks = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { mentorRemarks, suggestions, followUpAction, followUpDate, followUpStatus } = req.body;

    const record = await CounsellingRecord.findById(id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    const updated = await CounsellingRecord.findByIdAndUpdate(id, {
      mentorRemarks: mentorRemarks !== undefined ? mentorRemarks : record.mentorRemarks,
      suggestions: suggestions !== undefined ? suggestions : record.suggestions,
      followUpAction: followUpAction !== undefined ? followUpAction : record.followUpAction,
      followUpDate: followUpDate !== undefined ? followUpDate : record.followUpDate,
      followUpStatus: followUpStatus || record.followUpStatus
    });

    // Notify student
    await Notification.create({
      userId: record.studentId,
      title: 'Mentor Feedback Added to Counselling Record',
      message: `Your mentor ${record.mentorName} added remarks to your session from ${record.meetingDate}.`,
      type: 'Counselling',
      relatedId: record._id,
      isRead: false
    });

    return res.json({
      success: true,
      message: 'Mentor remarks updated successfully',
      record: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating mentor remarks' });
  }
};
