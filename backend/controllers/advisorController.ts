import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  StudentProfile,
  FacultyProfile,
  ODRequest,
  AcademicRecord,
  Attendance,
  Document,
  PlacementApplication
} from '../models/index.js';

export const getAdvisorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const advisorId = req.user?.userId;
    if (!advisorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const faculty = await FacultyProfile.findOne({ userId: advisorId });
    const assignedClass = faculty?.assignedClass || {
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A'
    };

    // Find all students in this class
    const students = await StudentProfile.find({
      department: assignedClass.department,
      year: assignedClass.year,
      section: assignedClass.section
    }).sort({ registerNumber: 1 }).exec();

    const studentIds = students.map(s => s.userId);

    // Hosteller vs Day Scholar count
    const hostellerCount = students.filter(s => s.residenceType === 'Hosteller').length;
    const dayScholarCount = students.filter(s => s.residenceType === 'Day Scholar').length;

    // Average attendance and CGPA
    const avgAttendance = students.length > 0
      ? (students.reduce((acc, s) => acc + (s.attendancePct || 0), 0) / students.length).toFixed(1)
      : '0.0';

    const avgCgpa = students.length > 0
      ? (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length).toFixed(2)
      : '0.0';

    // Approved OD requests in class
    const approvedODs = await ODRequest.find({
      studentId: { $in: studentIds },
      finalStatus: 'Mentor Approved'
    }).sort({ fromDate: -1 }).exec();

    // Placement selections in class
    const placementSelections = await PlacementApplication.find({
      studentId: { $in: studentIds },
      currentStage: 'Selected'
    }).exec();

    const activePlacements = await PlacementApplication.find({
      studentId: { $in: studentIds }
    }).exec();

    // Low attendance alerts (< 75%)
    const lowAttendanceStudents = students.filter(s => (s.attendancePct || 0) < 75);

    return res.json({
      success: true,
      data: {
        assignedClass,
        totalStudents: students.length,
        hostellerCount,
        dayScholarCount,
        avgAttendance,
        avgCgpa,
        approvedOdCount: approvedODs.length,
        placedCount: placementSelections.length,
        totalPlacementApplications: activePlacements.length,
        lowAttendanceCount: lowAttendanceStudents.length,
        students,
        recentApprovedODs: approvedODs.slice(0, 5),
        recentPlacements: activePlacements.slice(0, 5)
      }
    });
  } catch (err: any) {
    console.error('Advisor dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving advisor dashboard' });
  }
};

export const getClassStudents = async (req: AuthRequest, res: Response) => {
  try {
    const advisorId = req.user?.userId;
    const faculty = await FacultyProfile.findOne({ userId: advisorId });
    const assignedClass = faculty?.assignedClass || {
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A'
    };

    const students = await StudentProfile.find({
      department: assignedClass.department,
      year: assignedClass.year,
      section: assignedClass.section
    }).sort({ registerNumber: 1 }).exec();

    return res.json({
      success: true,
      assignedClass,
      students
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving class students' });
  }
};

export const getClassAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const advisorId = req.user?.userId;
    const faculty = await FacultyProfile.findOne({ userId: advisorId });
    const assignedClass = faculty?.assignedClass || {
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A'
    };

    const attendanceRecords = await Attendance.find({
      department: assignedClass.department,
      year: assignedClass.year,
      section: assignedClass.section
    }).sort({ registerNumber: 1 }).exec();

    return res.json({
      success: true,
      assignedClass,
      records: attendanceRecords
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving attendance records' });
  }
};

export const getClassAcademics = async (req: AuthRequest, res: Response) => {
  try {
    const advisorId = req.user?.userId;
    const faculty = await FacultyProfile.findOne({ userId: advisorId });
    const assignedClass = faculty?.assignedClass || {
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A'
    };

    const students = await StudentProfile.find({
      department: assignedClass.department,
      year: assignedClass.year,
      section: assignedClass.section
    }).exec();

    const studentIds = students.map(s => s.userId);
    const academicRecords = await AcademicRecord.find({
      studentId: { $in: studentIds }
    }).exec();

    return res.json({
      success: true,
      assignedClass,
      records: academicRecords
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving academic records' });
  }
};

export const getClassDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const advisorId = req.user?.userId;
    const faculty = await FacultyProfile.findOne({ userId: advisorId });
    const assignedClass = faculty?.assignedClass || {
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A'
    };

    const students = await StudentProfile.find({
      department: assignedClass.department,
      year: assignedClass.year,
      section: assignedClass.section
    }).exec();

    const studentIds = students.map(s => s.userId);
    const documents = await Document.find({
      studentId: { $in: studentIds }
    }).sort({ uploadDate: -1 }).exec();

    return res.json({
      success: true,
      assignedClass,
      documents
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving class documents' });
  }
};

export const getClassApprovedODs = async (req: AuthRequest, res: Response) => {
  try {
    const advisorId = req.user?.userId;
    const faculty = await FacultyProfile.findOne({ userId: advisorId });
    const assignedClass = faculty?.assignedClass || {
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A'
    };

    const approvedODs = await ODRequest.find({
      department: assignedClass.department,
      year: assignedClass.year,
      section: assignedClass.section,
      finalStatus: 'Mentor Approved'
    }).sort({ fromDate: -1 }).exec();

    return res.json({
      success: true,
      assignedClass,
      ods: approvedODs
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving approved OD records' });
  }
};

export const getClassPlacement = async (req: AuthRequest, res: Response) => {
  try {
    const advisorId = req.user?.userId;
    const faculty = await FacultyProfile.findOne({ userId: advisorId });
    const assignedClass = faculty?.assignedClass || {
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A'
    };

    const students = await StudentProfile.find({
      department: assignedClass.department,
      year: assignedClass.year,
      section: assignedClass.section
    }).exec();

    const studentIds = students.map(s => s.userId);
    const placements = await PlacementApplication.find({
      studentId: { $in: studentIds }
    }).sort({ appliedAt: -1 }).exec();

    return res.json({
      success: true,
      assignedClass,
      placements
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving placement information' });
  }
};
