import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, StudentProfile, FacultyProfile, PasswordResetToken } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_super_secure_college_secret_key_2026';

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, email, password, role } = req.body;
    const rawEmail = (identifier || email || '').trim().toLowerCase();

    // 1. Validate presence of credentials
    if (!rawEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your KIOT email address and password.'
      });
    }

    // 2. Validate email format & check official KIOT domain (@kiot.ac.in)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail) || !rawEmail.endsWith('@kiot.ac.in')) {
      return res.status(400).json({
        success: false,
        message: 'Please use your official KIOT email address.'
      });
    }

    // 3. Find user in MongoDB (case-insensitive for email)
    const user = await User.findOne({
      email: { $regex: `^${rawEmail}$`, $options: 'i' }
    });

    // If email is not registered in MongoDB:
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Your KIOT account is not registered in CampusConnect.'
      });
    }

    // 4. Verify hashed password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 5. Check account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your KIOT account is deactivated. Please contact College Administration.'
      });
    }

    // 6. Role validation if client specified a role tab (Student, Faculty, Admin)
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Account is registered as '${user.role.toUpperCase()}', not '${role.toUpperCase()}'. Please select the correct login tab.`
      });
    }

    // 7. Read role & generate JWT
    const tokenPayload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      facultyType: user.facultyType,
      registerNumber: user.registerNumber,
      department: user.department
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Determine target dashboard redirect path
    let redirectUrl = '/student/dashboard';
    if (user.role === 'admin') {
      redirectUrl = '/admin/dashboard';
    } else if (user.role === 'faculty') {
      redirectUrl = user.facultyType === 'advisor'
        ? '/faculty/advisor/dashboard'
        : '/faculty/mentor/dashboard';
    }

    // Sanitize user object (never return password)
    const userSafe = { ...user };
    delete userSafe.password;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      redirectUrl,
      user: userSafe
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
};

// Institutional rule: Public registration is disabled.
export const register = async (_req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    message: 'Public registration is disabled. Student and faculty accounts are provisioned exclusively by KIOT College Administration.'
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userSafe = { ...user };
    delete userSafe.password;

    let profileData: any = null;
    if (user.role === 'student') {
      profileData = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'faculty') {
      profileData = await FacultyProfile.findOne({ userId: user._id });
    }

    return res.json({
      success: true,
      user: userSafe,
      profile: profileData
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving current user' });
  }
};

// 4. Request Password Reset Link (Forgot Password)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const rawEmail = (email || '').trim().toLowerCase();

    // Validate email presence
    if (!rawEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered KIOT email address.'
      });
    }

    // Validate email format and official @kiot.ac.in domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail) || !rawEmail.endsWith('@kiot.ac.in')) {
      return res.status(400).json({
        success: false,
        message: 'Please use your official KIOT email address.'
      });
    }

    // Check user in MongoDB
    const user = await User.findOne({
      email: { $regex: `^${rawEmail}$`, $options: 'i' }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Your KIOT account is not registered in CampusConnect.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your KIOT account is deactivated. Please contact College Administration.'
      });
    }

    // Invalidate any existing active tokens for this user (single-use enforcement)
    const existingTokens = await PasswordResetToken.find({ userId: user._id, used: false }).exec();
    for (const t of existingTokens) {
      await PasswordResetToken.findByIdAndUpdate(t._id!, { used: true });
    }

    // Generate cryptographically secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes validity

    // Store in PasswordResetToken model
    await PasswordResetToken.create({
      userId: user._id!,
      email: user.email,
      tokenHash: hashedToken,
      expiresAt,
      used: false
    });

    // Also update User document with token hash and expiry
    await User.findByIdAndUpdate(user._id!, {
      resetTokenHash: hashedToken,
      resetTokenExpiry: expiresAt
    });

    // Determine application base URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
    const baseUrl = process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
      ? process.env.APP_URL
      : `${protocol}://${host}`;

    // Dispatch reset email
    await sendPasswordResetEmail({
      toEmail: user.email,
      userName: user.name,
      resetToken: rawToken,
      baseUrl
    });

    return res.json({
      success: true,
      message: 'A secure password reset link has been dispatched to your official KIOT email address. Please check your inbox.',
      role: user.role,
      expiresInMinutes: 15,
      ...(process.env.NODE_ENV !== 'production' ? { resetToken: rawToken } : {})
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing password reset request', error: err.message });
  }
};

// 5. Verify Password Reset Token Validity
export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const token = (req.query.token as string || '').trim();

    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const tokenDoc = await PasswordResetToken.findOne({
      tokenHash: hashedToken,
      used: false
    });

    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link is invalid or has already been used.'
      });
    }

    if (new Date(tokenDoc.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link has expired (15-minute validity). Please request a new link.'
      });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'Associated KIOT user account not found or inactive.' });
    }

    return res.json({
      success: true,
      message: 'Reset token is valid.',
      email: user.email,
      role: user.role
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error verifying reset token' });
  }
};

// 6. Set New Password (Reset Password)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, new password, and confirm password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    // Find single-use active token
    const tokenDoc = await PasswordResetToken.findOne({
      tokenHash: hashedToken,
      used: false
    });

    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or already-used password reset link. Please request a new one.'
      });
    }

    // Check expiry
    if (new Date(tokenDoc.expiresAt) < new Date()) {
      await PasswordResetToken.findByIdAndUpdate(tokenDoc._id!, { used: true });
      return res.status(400).json({
        success: false,
        message: 'This password reset link has expired (15-minute validity). Please request a new one.'
      });
    }

    // Find user
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with this reset link was not found.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your KIOT account is inactive. Please contact administration.'
      });
    }

    // Hash new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password in MongoDB and clear token fields
    await User.findByIdAndUpdate(user._id!, {
      password: passwordHash,
      resetTokenHash: undefined,
      resetTokenExpiry: undefined
    });

    // Mark token as used immediately (single-use)
    await PasswordResetToken.findByIdAndUpdate(tokenDoc._id!, { used: true });

    // Mark any other pending reset tokens for this user as used
    const remainingTokens = await PasswordResetToken.find({ userId: user._id, used: false }).exec();
    for (const rem of remainingTokens) {
      await PasswordResetToken.findByIdAndUpdate(rem._id!, { used: true });
    }

    console.log(`[Password Reset Success] Password successfully reset for user ${user.email} (${user.role})`);

    return res.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
      role: user.role
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Server error resetting password', error: err.message });
  }
};
