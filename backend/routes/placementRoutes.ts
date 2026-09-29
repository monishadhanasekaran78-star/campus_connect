import { Router } from 'express';
import {
  getPlacementDrives,
  createPlacementDrive,
  updatePlacementDrive,
  deletePlacementDrive,
  applyForDrive,
  getMyApplications,
  getAllApplicationsAdmin,
  updateApplicationStage
} from '../controllers/placementController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/drives', getPlacementDrives);
router.post('/drives', authorizeRoles('admin'), createPlacementDrive);
router.put('/drives/:id', authorizeRoles('admin'), updatePlacementDrive);
router.delete('/drives/:id', authorizeRoles('admin'), deletePlacementDrive);

router.post('/apply/:driveId', authorizeRoles('student'), applyForDrive);
router.get('/my-applications', authorizeRoles('student'), getMyApplications);

router.get('/applications', authorizeRoles('admin', 'faculty'), getAllApplicationsAdmin);
router.patch('/applications/:id/stage', authorizeRoles('admin'), updateApplicationStage);

export default router;
