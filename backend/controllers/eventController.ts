import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Event, EventRegistration, StudentProfile, Notification, User } from '../models/index.js';

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find().sort({ date: 1 }).exec();
    return res.json({ success: true, events });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving events' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      organizer,
      venue,
      date,
      time,
      registrationDeadline,
      imageUrl,
      maxParticipants
    } = req.body;

    if (!title || !date || !venue) {
      return res.status(400).json({ success: false, message: 'Title, Date, and Venue are required' });
    }

    const event = await Event.create({
      title,
      description: description || '',
      category: category || 'Workshop',
      organizer: organizer || 'Campus Student Affairs',
      venue,
      date,
      time: time || '10:00 AM',
      registrationDeadline: registrationDeadline || date,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
      maxParticipants: Number(maxParticipants) || 200,
      registeredCount: 0
    });

    // Notify students
    const students = await User.find({ role: 'student' }).exec();
    for (const student of students) {
      if (student._id) {
        await Notification.create({
          userId: student._id,
          title: `New College Event: ${title}`,
          message: `${title} organized by ${organizer} is scheduled for ${date} at ${venue}.`,
          type: 'Event',
          relatedId: event._id,
          isRead: false
        });
      }
    }

    return res.status(201).json({ success: true, message: 'Event created successfully', event });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error creating event' });
  }
};

export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const existing = await EventRegistration.findOne({ eventId: id, studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    }

    const profile = await StudentProfile.findOne({ userId: studentId });

    const registration = await EventRegistration.create({
      eventId: id,
      eventTitle: event.title,
      studentId,
      studentName: profile?.name || req.user?.name || 'Student',
      registerNumber: profile?.registerNumber || req.user?.registerNumber || 'REG001',
      email: req.user?.email || '',
      department: profile?.department || 'Engineering',
      status: 'Registered',
      registeredAt: new Date().toISOString()
    });

    await Event.findByIdAndUpdate(id, {
      registeredCount: (event.registeredCount || 0) + 1
    });

    return res.status(201).json({
      success: true,
      message: `You are registered for ${event.title}!`,
      registration
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error registering for event' });
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const registrations = await EventRegistration.find({ studentId }).sort({ registeredAt: -1 }).exec();
    return res.json({ success: true, registrations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving registrations' });
  }
};
