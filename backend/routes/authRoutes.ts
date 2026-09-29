import { Router } from 'express';
import {
  login,
  register,
  getMe,
  forgotPassword,
  verifyResetToken,
  resetPassword
} from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateJWT, getMe);

// Password recovery routes
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;
