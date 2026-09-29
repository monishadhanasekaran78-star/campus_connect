import { Router } from 'express';
import {
  getClubs,
  createClub,
  joinClub,
  getMyClubs,
  getClubMembers
} from '../controllers/clubController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getClubs);
router.post('/', authorizeRoles('admin'), createClub);
router.post('/:id/join', authorizeRoles('student'), joinClub);
router.get('/my', authorizeRoles('student'), getMyClubs);
router.get('/:id/members', getClubMembers);

export default router;
