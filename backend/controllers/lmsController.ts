import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Course, StudyMaterial, Notification, User } from '../models/index.js';

export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find().sort({ courseCode: 1 }).exec();
    return res.json({ success: true, courses });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving courses' });
  }
};

export const getCourseDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const materials = await StudyMaterial.find({ courseId: id }).sort({ uploadedAt: -1 }).exec();
    return res.json({ success: true, course, materials });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving course' });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseCode, courseName, department, semester, credits, description, syllabus } = req.body;

    if (!courseCode || !courseName || !department) {
      return res.status(400).json({ success: false, message: 'Course Code, Course Name, and Department are required' });
    }

    const course = await Course.create({
      courseCode,
      courseName,
      department,
      semester: Number(semester) || 1,
      facultyId: req.user?.userId,
      facultyName: req.user?.name || 'Faculty',
      credits: Number(credits) || 3,
      description: description || '',
      syllabus: syllabus || ''
    });

    return res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error creating course' });
  }
};

export const uploadStudyMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, title, unit, description } = req.body;

    if (!courseId || !title || !unit) {
      return res.status(400).json({ success: false, message: 'Course ID, Title, and Unit are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let fileUrl = '';
    let fileName = '';
    let fileType = 'Document';

    if (req.file) {
      fileUrl = `/uploads/lms/${req.file.filename}`;
      fileName = req.file.originalname;
      fileType = req.file.mimetype.includes('pdf') ? 'PDF Document' : 'Resource File';
    } else {
      fileUrl = '/uploads/lms/sample_notes.pdf';
      fileName = `${title.replace(/\s+/g, '_')}.pdf`;
      fileType = 'PDF Document';
    }

    const material = await StudyMaterial.create({
      courseId,
      courseCode: course.courseCode,
      courseName: course.courseName,
      title,
      unit,
      description: description || '',
      fileUrl,
      fileName,
      fileType,
      uploadedBy: req.user?.name || 'Faculty',
      uploadedAt: new Date().toISOString().split('T')[0]
    });

    return res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      material
    });
  } catch (err: any) {
    console.error('Upload material error:', err);
    return res.status(500).json({ success: false, message: 'Server error uploading study material' });
  }
};
