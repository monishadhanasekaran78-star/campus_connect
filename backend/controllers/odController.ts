import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ODRequest, StudentProfile, Notification, User } from '../models/index.js';

export const submitOD = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { purpose, fromDate, toDate, daysCount, reason } = req.body;
    if (!purpose || !fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: 'Purpose, From Date, To Date, and Reason are required' });
    }

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) return res.status(404).json({ success: false, message: 'Student profile not found' });

    let documentUrl = '';
    let documentName = '';
    if (req.file) {
      documentUrl = `/uploads/od/${req.file.filename}`;
      documentName = req.file.originalname;
    }

    const calculatedDays = daysCount ? Number(daysCount) : 1;

    const newOD = await ODRequest.create({
      studentId,
      studentName: profile.name,
      registerNumber: profile.registerNumber,
      department: profile.department,
      year: profile.year,
      section: profile.section,
      purpose,
      fromDate,
      toDate,
      daysCount: calculatedDays,
      reason,
      supportingDocument: documentUrl,
      documentName,
      adminStatus: 'Pending',
      mentorStatus: 'Pending',
      finalStatus: 'Pending Admin'
    });

    // Notify Admins
    const admins = await User.find({ role: 'admin' }).exec();
    for (const admin of admins) {
      if (admin._id) {
        await Notification.create({
          userId: admin._id,
          title: 'New OD Request Submitted',
          message: `${profile.name} (${profile.registerNumber}) submitted an OD request for "${purpose}".`,
          type: 'OD',
          relatedId: newOD._id,
          isRead: false
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'OD request submitted successfully. It is now awaiting Admin review.',
      odRequest: newOD
    });
  } catch (err: any) {
    console.error('Submit OD error:', err);
    return res.status(500).json({ success: false, message: 'Server error submitting OD request' });
  }
};

export const getMyODs = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const ods = await ODRequest.find({ studentId }).sort({ createdAt: -1 }).exec();
    return res.json({ success: true, ods });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving OD requests' });
  }
};

export const getAllODsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const ods = await ODRequest.find().sort({ createdAt: -1 }).exec();
    return res.json({ success: true, ods });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving all OD requests' });
  }
};

export const adminReviewOD = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; // action: 'approve' | 'reject'

    const od = await ODRequest.findById(id);
    if (!od) return res.status(404).json({ success: false, message: 'OD request not found' });

    const now = new Date().toISOString();
    let newAdminStatus: 'Approved' | 'Rejected' = action === 'approve' ? 'Approved' : 'Rejected';
    let newFinalStatus: any = action === 'approve' ? 'Pending Mentor' : 'Admin Rejected';

    const updated = await ODRequest.findByIdAndUpdate(id, {
      adminStatus: newAdminStatus,
      adminRemarks: remarks || '',
      adminActionDate: now,
      finalStatus: newFinalStatus
    });

    // Notify Student
    await Notification.create({
      userId: od.studentId,
      title: action === 'approve' ? 'OD Approved by Admin' : 'OD Rejected by Admin',
      message: action === 'approve'
        ? `Your OD request for "${od.purpose}" was approved by Admin and forwarded to your Mentor.`
        : `Your OD request for "${od.purpose}" was rejected by Admin. Remarks: ${remarks || 'None'}`,
      type: 'OD',
      relatedId: od._id,
      isRead: false
    });

    // If approved, notify Mentor
    if (action === 'approve') {
      const studentProfile = await StudentProfile.findOne({ userId: od.studentId });
      if (studentProfile?.mentorId) {
        await Notification.create({
          userId: studentProfile.mentorId,
          title: 'OD Request Awaiting Mentor Review',
          message: `${od.studentName} has an Admin-approved OD request for "${od.purpose}" awaiting your review.`,
          type: 'OD',
          relatedId: od._id,
          isRead: false
        });
      }
    }

    return res.json({
      success: true,
      message: `OD request ${newAdminStatus.toLowerCase()} successfully`,
      odRequest: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error during admin review' });
  }
};

export const getMentorODs = async (req: AuthRequest, res: Response) => {
  try {
    const mentorId = req.user?.userId;
    const mentees = await StudentProfile.find({ mentorId }).exec();
    const menteeIds = mentees.map(m => m.userId);

    const ods = await ODRequest.find({
      studentId: { $in: menteeIds }
    }).sort({ createdAt: -1 }).exec();

    return res.json({ success: true, ods });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving mentor ODs' });
  }
};

export const mentorReviewOD = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; // 'approve' | 'reject'

    const od = await ODRequest.findById(id);
    if (!od) return res.status(404).json({ success: false, message: 'OD request not found' });

    if (od.adminStatus !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Cannot review OD until Admin approval is granted' });
    }

    const now = new Date().toISOString();
    let newMentorStatus: 'Approved' | 'Rejected' = action === 'approve' ? 'Approved' : 'Rejected';
    let newFinalStatus: any = action === 'approve' ? 'Mentor Approved' : 'Mentor Rejected';

    const updated = await ODRequest.findByIdAndUpdate(id, {
      mentorStatus: newMentorStatus,
      mentorRemarks: remarks || '',
      mentorActionDate: now,
      finalStatus: newFinalStatus
    });

    // Notify Student
    await Notification.create({
      userId: od.studentId,
      title: action === 'approve' ? 'OD Fully Approved by Mentor' : 'OD Rejected by Mentor',
      message: action === 'approve'
        ? `Congratulations! Your OD request for "${od.purpose}" is fully approved.`
        : `Your OD request for "${od.purpose}" was rejected by your Mentor. Remarks: ${remarks || 'None'}`,
      type: 'OD',
      relatedId: od._id,
      isRead: false
    });

    // If fully approved, notify Class Advisor
    if (action === 'approve') {
      const studentProfile = await StudentProfile.findOne({ userId: od.studentId });
      if (studentProfile?.advisorId) {
        await Notification.create({
          userId: studentProfile.advisorId,
          title: 'Class OD Approved',
          message: `${od.studentName} (${od.department} ${od.year}-${od.section}) has an approved OD for ${od.daysCount} day(s).`,
          type: 'OD',
          relatedId: od._id,
          isRead: false
        });
      }
    }

    return res.json({
      success: true,
      message: `OD request ${newMentorStatus.toLowerCase()} successfully by mentor`,
      odRequest: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error during mentor review' });
  }
};
