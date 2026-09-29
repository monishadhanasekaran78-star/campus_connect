import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Announcement, Notification, User } from '../models/index.js';

export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const facultyType = req.user?.facultyType;

    let filter: any = {};
    if (role === 'student') {
      filter = { $or: [{ targetAudience: 'All' }, { targetAudience: 'Students' }] };
    } else if (role === 'faculty') {
      const audienceList = ['All', 'Faculty'];
      if (facultyType === 'mentor') audienceList.push('Mentors');
      if (facultyType === 'advisor') audienceList.push('Advisors');
      filter = { targetAudience: { $in: audienceList } };
    }
    // Admin sees all

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 }).exec();
    return res.json({ success: true, announcements });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving announcements' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, priority, targetAudience, department } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, Description, and Category are required' });
    }

    const announcement = await Announcement.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      targetAudience: targetAudience || 'All',
      department: department || 'All Departments',
      postedBy: req.user?.name || 'College Administration',
      createdAt: new Date().toISOString()
    });

    // Notify targeted users
    let userFilter: any = {};
    if (targetAudience === 'Students') userFilter = { role: 'student' };
    else if (targetAudience === 'Faculty') userFilter = { role: 'faculty' };
    else if (targetAudience === 'Mentors') userFilter = { role: 'faculty', facultyType: 'mentor' };
    else if (targetAudience === 'Advisors') userFilter = { role: 'faculty', facultyType: 'advisor' };

    const recipients = await User.find(userFilter).exec();
    for (const recipient of recipients.slice(0, 50)) {
      if (recipient._id) {
        await Notification.create({
          userId: recipient._id,
          title: `Announcement: ${title}`,
          message: description.slice(0, 120) + (description.length > 120 ? '...' : ''),
          type: 'Announcement',
          relatedId: announcement._id,
          isRead: false
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error creating announcement' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Announcement deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error deleting announcement' });
  }
};
