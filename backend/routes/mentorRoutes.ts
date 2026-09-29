import { Router } from 'express';
import {
  getMentorDashboard,
  getAssignedMentees,
  getMenteeDetail,
  getMentorSlots,
  updateMentorSlots
} from '../controllers/mentorController.js';
import { authenticateJWT, authorizeRoles, authorizeFacultyType } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('faculty', 'admin'));

// Check for facultyType mentor (or admin can inspect)
router.use((req, res, next) => {
  const user = (req as any).user;
  if (user?.role === 'admin') return next();
  if (user?.role === 'faculty' && user?.facultyType === 'mentor') return next();
  return res.status(403).json({ success: false, message: 'Forbidden: Mentor sub-role required' });
});

router.get('/dashboard', getMentorDashboard);
router.get('/mentees', getAssignedMentees);
router.get('/mentees/:studentId', getMenteeDetail);
router.get('/slots', getMentorSlots);
router.put('/slots', updateMentorSlots);

export default router;
