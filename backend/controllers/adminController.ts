import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.js';
import {
  User,
  StudentProfile,
  FacultyProfile,
  ODRequest,
  Document,
  PlacementDrive,
  PlacementApplication,
  Club,
  Event,
  Assessment,
  Notification
} from '../models/index.js';

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalMentors = await User.countDocuments({ role: 'faculty', facultyType: 'mentor' });
    const totalAdvisors = await User.countDocuments({ role: 'faculty', facultyType: 'advisor' });
    const totalClubs = await Club.countDocuments();
    const totalEvents = await Event.countDocuments();
    const pendingODs = await ODRequest.countDocuments({ finalStatus: 'Pending Admin' });
    const pendingDocuments = await Document.countDocuments({ status: 'Pending' });
    const activeDrives = await PlacementDrive.countDocuments({ status: { $ne: 'Completed' } });

    // Recent activity
    const recentODs = await ODRequest.find().sort({ createdAt: -1 }).limit(5).exec();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).exec();
    const recentDrives = await PlacementDrive.find().sort({ createdAt: -1 }).limit(4).exec();

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalMentors,
        totalAdvisors,
        totalClubs,
        totalEvents,
        pendingODs,
        pendingDocuments,
        activeDrives
      },
      recentODs,
      recentUsers,
      recentDrives
    });
  } catch (err: any) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving admin dashboard' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, facultyType, search } = req.query;
    let filter: any = {};

    if (role) filter.role = role;
    if (facultyType) filter.facultyType = facultyType;
    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
        { registerNumber: { $regex: String(search), $options: 'i' } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).exec();
    const sanitized = users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });

    return res.json({ success: true, users: sanitized });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, facultyType, registerNumber, department, phone } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@kiot.ac.in')) {
      return res.status(400).json({ success: false, message: 'Please use an authorized official KIOT email address (@kiot.ac.in).' });
    }

    const existing = await User.findOne({ email: { $regex: `^${cleanEmail}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const userPassword = password || '123456';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userPassword, salt);

    const newUser = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password: passwordHash,
      role,
      facultyType: role === 'faculty' ? facultyType || 'mentor' : undefined,
      registerNumber: role === 'student' ? registerNumber : undefined,
      department: department || 'Engineering',
      phone: phone || '',
      isActive: true
    });

    if (role === 'student') {
      await StudentProfile.create({
        userId: newUser._id!,
        name: newUser.name,
        registerNumber: registerNumber || 'REG' + Date.now().toString().slice(-5),
        email: newUser.email,
        phone: newUser.phone || '',
        department: newUser.department || 'Computer Science and Engineering',
        year: 1,
        section: 'A',
        dob: '2005-01-01',
        address: 'Campus Hostel',
        residenceType: 'Day Scholar',
        transportDetails: 'Self',
        attendancePct: 95.0,
        cgpa: 8.0
      });
    } else if (role === 'faculty') {
      await FacultyProfile.create({
        userId: newUser._id!,
        name: newUser.name,
        facultyId: 'FAC-' + Date.now().toString().slice(-4),
        email: newUser.email,
        phone: newUser.phone || '',
        department: newUser.department || 'Computer Science and Engineering',
        designation: facultyType === 'advisor' ? 'Class Advisor' : 'Assistant Professor',
        facultyType: facultyType || 'mentor',
        officeLocation: 'Academic Complex',
        availableSlots: [
          { day: 'Monday', startTime: '10:00 AM', endTime: '11:30 AM', isAvailable: true }
        ]
      });
    }

    const safeUser = { ...newUser };
    delete safeUser.password;

    return res.status(201).json({ success: true, message: 'User created successfully', user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error creating user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, department, phone, facultyType, isActive, registerNumber } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (department !== undefined) updateFields.department = department;
    if (phone !== undefined) updateFields.phone = phone;
    if (facultyType !== undefined) updateFields.facultyType = facultyType;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (registerNumber !== undefined) updateFields.registerNumber = registerNumber;

    const updated = await User.findByIdAndUpdate(id, updateFields);

    // Sync profile
    if (user.role === 'student') {
      await StudentProfile.updateOne({ userId: id }, { name, department, phone, registerNumber });
    } else if (user.role === 'faculty') {
      await FacultyProfile.updateOne({ userId: id }, { name, department, phone, facultyType });
    }

    const safeUser = { ...updated };
    delete safeUser.password;

    return res.json({ success: true, message: 'User updated successfully', user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating user' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newStatus = !user.isActive;
    await User.findByIdAndUpdate(id, { isActive: newStatus });

    return res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      isActive: newStatus
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword || '123456', salt);

    await User.findByIdAndUpdate(id, { password: passwordHash });
    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};

export const getMentorMapping = async (req: AuthRequest, res: Response) => {
  try {
    const students = await StudentProfile.find().sort({ department: 1, registerNumber: 1 }).exec();
    const mentors = await FacultyProfile.find({ facultyType: 'mentor' }).exec();

    return res.json({
      success: true,
      students,
      mentors
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving mentor mapping' });
  }
};

export const assignMentor = async (req: AuthRequest, res: Response) => {
  try {
    const { studentUserId, mentorUserId } = req.body;

    if (!studentUserId || !mentorUserId) {
      return res.status(400).json({ success: false, message: 'Student and Mentor IDs are required' });
    }

    const mentorProfile = await FacultyProfile.findOne({ userId: mentorUserId });
    if (!mentorProfile) return res.status(404).json({ success: false, message: 'Mentor profile not found' });

    const studentProfile = await StudentProfile.findOne({ userId: studentUserId });
    if (!studentProfile || !studentProfile._id) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    await StudentProfile.findByIdAndUpdate(studentProfile._id, {
      mentorId: mentorUserId,
      mentorName: mentorProfile.name
    });

    // Notify Student
    await Notification.create({
      userId: studentUserId,
      title: 'Mentor Assigned',
      message: `${mentorProfile.name} has been assigned as your Faculty Mentor.`,
      type: 'General',
      isRead: false
    });

    return res.json({
      success: true,
      message: `Mentor ${mentorProfile.name} successfully assigned to ${studentProfile.name}`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error assigning mentor' });
  }
};

export const getAdvisorMapping = async (req: AuthRequest, res: Response) => {
  try {
    const advisors = await FacultyProfile.find({ facultyType: 'advisor' }).exec();
    const classes = [
      { department: 'Computer Science and Engineering', year: 1, section: 'A' },
      { department: 'Computer Science and Engineering', year: 2, section: 'A' },
      { department: 'Computer Science and Engineering', year: 3, section: 'A' },
      { department: 'Computer Science and Engineering', year: 4, section: 'A' },
      { department: 'Information Technology', year: 3, section: 'A' },
      { department: 'Electronics and Communication Engineering', year: 3, section: 'A' }
    ];

    const classesWithAdvisor = await Promise.all(
      classes.map(async c => {
        const advisor = await FacultyProfile.findOne({
          facultyType: 'advisor',
          'assignedClass.department': c.department,
          'assignedClass.year': c.year,
          'assignedClass.section': c.section
        });

        const studentCount = await StudentProfile.countDocuments({
          department: c.department,
          year: c.year,
          section: c.section
        });

        return {
          ...c,
          advisorName: advisor?.name || 'Unassigned',
          advisorUserId: advisor?.userId || null,
          studentCount
        };
      })
    );

    return res.json({
      success: true,
      classes: classesWithAdvisor,
      advisors
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving advisor mapping' });
  }
};

export const assignAdvisor = async (req: AuthRequest, res: Response) => {
  try {
    const { department, year, section, advisorUserId } = req.body;

    if (!department || !year || !section || !advisorUserId) {
      return res.status(400).json({ success: false, message: 'Department, Year, Section, and Advisor are required' });
    }

    const advisorProfile = await FacultyProfile.findOne({ userId: advisorUserId });
    if (!advisorProfile || !advisorProfile._id) {
      return res.status(404).json({ success: false, message: 'Advisor not found' });
    }

    // Update advisor's assigned class
    await FacultyProfile.findByIdAndUpdate(advisorProfile._id, {
      assignedClass: {
        department,
        year: Number(year),
        section
      }
    });

    // Update students in that class
    await StudentProfile.updateMany(
      { department, year: Number(year), section },
      { advisorId: advisorUserId, advisorName: advisorProfile.name }
    );

    return res.json({
      success: true,
      message: `${advisorProfile.name} assigned as Class Advisor for ${department} Year ${year}-${section}`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error assigning advisor' });
  }
};
