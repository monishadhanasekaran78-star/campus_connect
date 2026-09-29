import { Router } from 'express';
import {
  requestMeeting,
  getMyMeetings,
  updateMeetingStatus
} from '../controllers/meetingController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.post('/request', authorizeRoles('student'), requestMeeting);
router.get('/my', getMyMeetings);
router.patch('/:id/status', authorizeRoles('faculty', 'admin'), updateMeetingStatus);

export default router;
