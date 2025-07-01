import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { 
  register, 
  login, 
  logout, 
  getCurrentUser, 
  changePassword,
  registerValidation,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePassword);

export default router; 