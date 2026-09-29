import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { PlacementDrive, PlacementApplication, StudentProfile, Notification, User } from '../models/index.js';

export const getPlacementDrives = async (req: AuthRequest, res: Response) => {
  try {
    const drives = await PlacementDrive.find().sort({ driveDate: 1 }).exec();
    return res.json({ success: true, drives });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving placement drives' });
  }
};

export const createPlacementDrive = async (req: AuthRequest, res: Response) => {
  try {
    const {
      companyName,
      logo,
      jobRole,
      jobDescription,
      minCgpa,
      departments,
      packageLPA,
      driveDate,
      applicationDeadline,
      location,
      driveType
    } = req.body;

    if (!companyName || !jobRole || !packageLPA || !driveDate) {
      return res.status(400).json({ success: false, message: 'Company, Job Role, Package, and Drive Date are required' });
    }

    const drive = await PlacementDrive.create({
      companyName,
      logo: logo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128&q=80',
      jobRole,
      jobDescription: jobDescription || '',
      eligibilityCriteria: {
        minCgpa: Number(minCgpa) || 6.5,
        departments: Array.isArray(departments) ? departments : ['CSE', 'IT', 'ECE'],
        noCurrentArrears: true
      },
      packageLPA: Number(packageLPA),
      driveDate,
      applicationDeadline: applicationDeadline || driveDate,
      location: location || 'Campus Placement Hall',
      driveType: driveType || 'On-Campus',
      status: 'Upcoming'
    });

    // Notify students
    const students = await User.find({ role: 'student' }).exec();
    for (const student of students) {
      if (student._id) {
        await Notification.create({
          userId: student._id,
          title: `New Placement Drive: ${companyName}`,
          message: `${companyName} is hiring for ${jobRole} (${packageLPA} LPA). Apply before ${drive.applicationDeadline}.`,
          type: 'Placement',
          relatedId: drive._id,
          isRead: false
        });
      }
    }

    return res.status(201).json({ success: true, message: 'Placement drive announced successfully', drive });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error creating placement drive' });
  }
};

export const updatePlacementDrive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await PlacementDrive.findByIdAndUpdate(id, req.body);
    return res.json({ success: true, message: 'Placement drive updated', drive: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating drive' });
  }
};

export const deletePlacementDrive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await PlacementDrive.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Placement drive deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error deleting drive' });
  }
};

export const applyForDrive = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { driveId } = req.params;
    const { resumeUrl } = req.body;

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    // Check if already applied
    const existing = await PlacementApplication.findOne({ driveId, studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this placement drive' });
    }

    const application = await PlacementApplication.create({
      driveId,
      companyName: drive.companyName,
      jobRole: drive.jobRole,
      packageLPA: drive.packageLPA,
      studentId,
      studentName: profile.name,
      registerNumber: profile.registerNumber,
      department: profile.department,
      cgpa: profile.cgpa,
      resumeUrl: resumeUrl || '/uploads/documents/Student_Resume.pdf',
      currentStage: 'Applied',
      statusHistory: [
        {
          stage: 'Applied',
          date: new Date().toISOString().split('T')[0],
          remarks: 'Application submitted through portal.'
        }
      ],
      appliedAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: `Successfully applied to ${drive.companyName}!`,
      application
    });
  } catch (err: any) {
    console.error('Apply placement error:', err);
    return res.status(500).json({ success: false, message: 'Server error applying for drive' });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const applications = await PlacementApplication.find({ studentId }).sort({ appliedAt: -1 }).exec();
    return res.json({ success: true, applications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving applications' });
  }
};

export const getAllApplicationsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { driveId } = req.query;
    const filter = driveId ? { driveId: String(driveId) } : {};
    const applications = await PlacementApplication.find(filter).sort({ appliedAt: -1 }).exec();
    return res.json({ success: true, applications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving applications' });
  }
};

export const updateApplicationStage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, remarks } = req.body; // stage: 'Applied'|'Shortlisted'|'Aptitude Round'|'Technical Round'|'HR Round'|'Selected'|'Not Selected'

    const application = await PlacementApplication.findById(id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const newHistoryItem = {
      stage,
      date: new Date().toISOString().split('T')[0],
      remarks: remarks || `Moved to ${stage}`
    };

    const updatedHistory = [...(application.statusHistory || []), newHistoryItem];

    const updated = await PlacementApplication.findByIdAndUpdate(id, {
      currentStage: stage,
      statusHistory: updatedHistory
    });

    // Notify student
    await Notification.create({
      userId: application.studentId,
      title: `Placement Update: ${application.companyName}`,
      message: stage === 'Selected'
        ? `🎉 Congratulations! You have received an offer from ${application.companyName} for ${application.jobRole} (${application.packageLPA} LPA)!`
        : `Your application stage for ${application.companyName} is now: ${stage}. ${remarks || ''}`,
      type: 'Placement',
      relatedId: application._id,
      isRead: false
    });

    return res.json({
      success: true,
      message: `Applicant updated to ${stage}`,
      application: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating stage' });
  }
};
