import { Router } from 'express';
import {
  getEvents,
  createEvent,
  registerForEvent,
  getMyRegistrations
} from '../controllers/eventController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getEvents);
router.post('/', authorizeRoles('admin'), createEvent);
router.post('/:id/register', authorizeRoles('student'), registerForEvent);
router.get('/my', authorizeRoles('student'), getMyRegistrations);

export default router;
