import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/index.js';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(30).exec();
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    await Notification.updateMany({ userId }, { isRead: true });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
};
