import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_super_secure_college_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'student' | 'faculty' | 'admin';
    facultyType?: 'mentor' | 'advisor';
    email: string;
    name: string;
    registerNumber?: string;
  };
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token missing or invalid format' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      facultyType: decoded.facultyType,
      email: decoded.email,
      name: decoded.name,
      registerNumber: decoded.registerNumber
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

export const authorizeRoles = (...allowedRoles: Array<'student' | 'faculty' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of roles [${allowedRoles.join(', ')}]`
      });
    }
    next();
  };
};

export const authorizeFacultyType = (requiredType: 'mentor' | 'advisor') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Forbidden: Faculty account required' });
    }
    if (req.user.facultyType !== requiredType) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires faculty sub-role '${requiredType}'. You are '${req.user.facultyType || 'unassigned'}'`
      });
    }
    next();
  };
};
