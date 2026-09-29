import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAnnouncements);
router.post('/', authorizeRoles('admin'), createAnnouncement);
router.delete('/:id', authorizeRoles('admin'), deleteAnnouncement);

export default router;
