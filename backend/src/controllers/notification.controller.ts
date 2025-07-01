import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const notificationController = {
  // Get user notifications
  getUserNotifications: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 20, type, isRead } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { userId };

      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead === 'true';

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: { userId, isRead: false }
        })
      ]);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalItems: total,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.params;
      const userId = (req as any).user.id;

      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      logger.error('Mark all notifications as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete notification
  deleteNotification: async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.params;
      const userId = (req as any).user.id;

      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      logger.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create notification (internal use)
  createNotification: async (
    userId: string,
    title: string,
    message: string,
    type: string,
    data?: any
  ) => {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          data
        }
      });
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  },

  // Get notification statistics
  getNotificationStats: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const stats = await prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: {
          type: true
        }
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
      });

      res.json({
        success: true,
        data: {
          byType: stats,
          unreadCount
        }
      });
    } catch (error) {
      logger.error('Get notification stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}; 