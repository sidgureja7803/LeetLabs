import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { announcementController } from '../controllers/announcement.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teacher routes
router.post(
  '/',
  requireRole(['TEACHER', 'ADMIN']),
  announcementController.createAnnouncement
);

router.get(
  '/teacher',
  requireRole(['TEACHER', 'ADMIN']),
  announcementController.getTeacherAnnouncements
);

router.put(
  '/:announcementId',
  requireRole(['TEACHER', 'ADMIN']),
  announcementController.updateAnnouncement
);

router.delete(
  '/:announcementId',
  requireRole(['TEACHER', 'ADMIN']),
  announcementController.deleteAnnouncement
);

// Student routes
router.get(
  '/student',
  requireRole(['STUDENT']),
  announcementController.getStudentAnnouncements
);

// Shared routes
router.get(
  '/:announcementId',
  announcementController.getAnnouncement
);

export default router; 