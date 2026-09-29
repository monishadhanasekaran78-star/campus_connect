import { Router } from 'express';
import {
  submitOD,
  getMyODs,
  getAllODsAdmin,
  adminReviewOD,
  getMentorODs,
  mentorReviewOD
} from '../controllers/odController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { odProofUpload } from '../middleware/upload.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRoles('student'), odProofUpload.single('file'), submitOD);
router.get('/my', authorizeRoles('student'), getMyODs);
router.get('/admin', authorizeRoles('admin'), getAllODsAdmin);
router.patch('/:id/admin-review', authorizeRoles('admin'), adminReviewOD);
router.get('/mentor', authorizeRoles('faculty', 'admin'), getMentorODs);
router.patch('/:id/mentor-review', authorizeRoles('faculty', 'admin'), mentorReviewOD);

export default router;
