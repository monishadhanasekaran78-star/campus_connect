import { Router } from 'express';
import { getMyAcademics, getStudentAcademicsById } from '../controllers/academicController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/my', authorizeRoles('student'), getMyAcademics);
router.get('/student/:studentId', authorizeRoles('faculty', 'admin'), getStudentAcademicsById);

export default router;
