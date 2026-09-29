import { Router } from 'express';
import {
  getAdvisorDashboard,
  getClassStudents,
  getClassAttendance,
  getClassAcademics,
  getClassDocuments,
  getClassApprovedODs,
  getClassPlacement
} from '../controllers/advisorController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('faculty', 'admin'));

// Check for facultyType advisor (or admin)
router.use((req, res, next) => {
  const user = (req as any).user;
  if (user?.role === 'admin') return next();
  if (user?.role === 'faculty' && user?.facultyType === 'advisor') return next();
  return res.status(403).json({ success: false, message: 'Forbidden: Class Advisor sub-role required' });
});

router.get('/dashboard', getAdvisorDashboard);
router.get('/students', getClassStudents);
router.get('/attendance', getClassAttendance);
router.get('/academics', getClassAcademics);
router.get('/documents', getClassDocuments);
router.get('/od', getClassApprovedODs);
router.get('/placement', getClassPlacement);

export default router;
