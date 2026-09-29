import { Router } from 'express';
import {
  getCourses,
  getCourseDetail,
  createCourse,
  uploadStudyMaterial
} from '../controllers/lmsController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { lmsMaterialUpload } from '../middleware/upload.js';

const router = Router();

router.use(authenticateJWT);

router.get('/courses', getCourses);
router.get('/courses/:id', getCourseDetail);
router.post('/courses', authorizeRoles('faculty', 'admin'), createCourse);
router.post('/materials', authorizeRoles('faculty', 'admin'), lmsMaterialUpload.single('file'), uploadStudyMaterial);

export default router;
