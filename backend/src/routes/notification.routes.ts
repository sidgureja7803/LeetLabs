import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', notificationController.getUserNotifications);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

export default router; 