import { Router } from 'express';
import {
  getAssessments,
  getAssessmentById,
  createAssessment,
  submitAssessment,
  getMyAssessmentResults,
  getAssessmentResultsById
} from '../controllers/assessmentController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAssessments);
router.get('/my-results', authorizeRoles('student'), getMyAssessmentResults);
router.get('/:id', getAssessmentById);
router.post('/', authorizeRoles('faculty', 'admin'), createAssessment);
router.post('/:id/submit', authorizeRoles('student'), submitAssessment);
router.get('/:id/results', authorizeRoles('faculty', 'admin'), getAssessmentResultsById);

export default router;
