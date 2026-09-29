import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Club, ClubMembership, StudentProfile } from '../models/index.js';

export const getClubs = async (req: AuthRequest, res: Response) => {
  try {
    const clubs = await Club.find().sort({ name: 1 }).exec();
    return res.json({ success: true, clubs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving clubs' });
  }
};

export const createClub = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, category, facultyCoordinator, studentCoordinator, meetingSchedule } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Club name and category are required' });
    }

    const club = await Club.create({
      name,
      code: code || `CLUB-${Date.now().toString().slice(-4)}`,
      description: description || '',
      category: category || 'Technical',
      facultyCoordinator: facultyCoordinator || 'Faculty Coordinator',
      studentCoordinator: studentCoordinator || 'Student Coordinator',
      meetingSchedule: meetingSchedule || 'Weekly',
      activitiesCount: 0,
      membersCount: 1
    });

    return res.status(201).json({ success: true, message: 'Club created successfully', club });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error creating club' });
  }
};

export const joinClub = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const profile = await StudentProfile.findOne({ userId: studentId });

    // Check existing
    const existing = await ClubMembership.findOne({ clubId: id, studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already a member or have a pending request' });
    }

    const membership = await ClubMembership.create({
      clubId: id,
      clubName: club.name,
      studentId,
      studentName: profile?.name || req.user?.name || 'Student',
      registerNumber: profile?.registerNumber || req.user?.registerNumber || 'REG001',
      department: profile?.department || 'Engineering',
      role: 'Member',
      status: 'Approved',
      joinedAt: new Date().toISOString().split('T')[0]
    });

    await Club.findByIdAndUpdate(id, {
      membersCount: (club.membersCount || 0) + 1
    });

    return res.status(201).json({
      success: true,
      message: `You have joined ${club.name}!`,
      membership
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error joining club' });
  }
};

export const getMyClubs = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const memberships = await ClubMembership.find({ studentId }).sort({ joinedAt: -1 }).exec();
    return res.json({ success: true, memberships });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving your clubs' });
  }
};

export const getClubMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const members = await ClubMembership.find({ clubId: id }).exec();
    return res.json({ success: true, members });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving members' });
  }
};
