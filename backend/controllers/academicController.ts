import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { AcademicRecord, Attendance, StudentProfile } from '../models/index.js';

export const getMyAcademics = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const academicRecord = await AcademicRecord.findOne({ studentId });
    const attendanceRecords = await Attendance.find({ studentId }).exec();
    const profile = await StudentProfile.findOne({ userId: studentId });

    return res.json({
      success: true,
      academics: academicRecord,
      attendance: attendanceRecords,
      cgpa: profile?.cgpa || 8.0,
      attendancePct: profile?.attendancePct || 90.0
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving academics' });
  }
};

export const getStudentAcademicsById = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const academicRecord = await AcademicRecord.findOne({ studentId });
    const attendanceRecords = await Attendance.find({ studentId }).exec();
    const profile = await StudentProfile.findOne({ userId: studentId });

    if (!profile) return res.status(404).json({ success: false, message: 'Student not found' });

    return res.json({
      success: true,
      profile,
      academics: academicRecord,
      attendance: attendanceRecords
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving student academics' });
  }
};
