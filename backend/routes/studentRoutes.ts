import { Router } from 'express';
import {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  getMyMentor
} from '../controllers/studentController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/mentor', getMyMentor);

export default router;
