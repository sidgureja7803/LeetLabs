import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.patch('/change-password', authenticate, changePassword);

export default router; 