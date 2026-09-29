import { Router } from 'express';
import {
  uploadDocument,
  getMyDocuments,
  getAllDocumentsAdmin,
  verifyDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { documentUpload } from '../middleware/upload.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRoles('student'), documentUpload.single('file'), uploadDocument);
router.get('/my', authorizeRoles('student'), getMyDocuments);
router.get('/admin', authorizeRoles('admin'), getAllDocumentsAdmin);
router.patch('/:id/verify', authorizeRoles('admin'), verifyDocument);
router.delete('/:id', deleteDocument);

export default router;
