import { Router } from 'express';
import {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  getMentorMapping,
  assignMentor,
  getAdvisorMapping,
  assignAdvisor
} from '../controllers/adminController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);

router.get('/mentor-mapping', getMentorMapping);
router.post('/mentor-mapping', assignMentor);

router.get('/advisor-mapping', getAdvisorMapping);
router.post('/advisor-mapping', assignAdvisor);

export default router;
