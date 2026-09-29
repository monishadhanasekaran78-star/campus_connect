import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Document, StudentProfile, Notification, User } from '../models/index.js';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { title, documentType } = req.body;
    if (!title || !documentType) {
      return res.status(400).json({ success: false, message: 'Title and Document Type are required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a document file' });
    }

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;

    const doc = await Document.create({
      studentId,
      studentName: profile.name,
      registerNumber: profile.registerNumber,
      title,
      documentType,
      fileUrl,
      fileName: req.file.originalname,
      fileSize,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' }).exec();
    for (const admin of admins) {
      if (admin._id) {
        await Notification.create({
          userId: admin._id,
          title: 'New Document Uploaded for Verification',
          message: `${profile.name} uploaded "${title}" (${documentType}).`,
          type: 'General',
          relatedId: doc._id,
          isRead: false
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and queued for verification',
      document: doc
    });
  } catch (err: any) {
    console.error('Upload document error:', err);
    return res.status(500).json({ success: false, message: 'Server error uploading document' });
  }
};

export const getMyDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const docs = await Document.find({ studentId }).sort({ uploadDate: -1 }).exec();
    return res.json({ success: true, documents: docs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving documents' });
  }
};

export const getAllDocumentsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const docs = await Document.find().sort({ uploadDate: -1 }).exec();
    return res.json({ success: true, documents: docs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving all documents' });
  }
};

export const verifyDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // status: 'Verified' | 'Rejected'

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Verified or Rejected' });
    }

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const updated = await Document.findByIdAndUpdate(id, {
      status,
      remarks: remarks || '',
      verifiedBy: req.user?.name || 'Administrator'
    });

    // Notify student
    await Notification.create({
      userId: doc.studentId,
      title: `Document ${status}: ${doc.title}`,
      message: status === 'Verified'
        ? `Your document "${doc.title}" has been verified successfully.`
        : `Your document "${doc.title}" was rejected. Remarks: ${remarks || 'Please re-upload a clear copy.'}`,
      type: 'General',
      relatedId: doc._id,
      isRead: false
    });

    return res.json({
      success: true,
      message: `Document status updated to ${status}`,
      document: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error updating document status' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Only student who owns it or admin can delete
    if (req.user?.role !== 'admin' && doc.studentId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await Document.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error deleting document' });
  }
};
