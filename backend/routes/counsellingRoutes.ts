import { Router } from 'express';
import {
  submitCounsellingRecord,
  getMyCounsellingHistory,
  getMentorCounsellingList,
  addMentorRemarks
} from '../controllers/counsellingController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRoles('student'), submitCounsellingRecord);
router.get('/my', authorizeRoles('student'), getMyCounsellingHistory);
router.get('/mentor', authorizeRoles('faculty', 'admin'), getMentorCounsellingList);
router.patch('/:id/mentor-remarks', authorizeRoles('faculty', 'admin'), addMentorRemarks);

export default router;
