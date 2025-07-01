import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { notificationController } from './notification.controller';

const prisma = new PrismaClient();

export const announcementController = {
  // Create announcement
  createAnnouncement: async (req: Request, res: Response) => {
    try {
      const teacherId = (req as any).user.id;
      const {
        title,
        content,
        priority,
        subjectId,
        expiresAt,
        attachments
      } = req.body;

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          priority: priority || 'NORMAL',
          subjectId,
          teacherId,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          attachments
        },
        include: {
          subject: {
            include: {
              enrollments: {
                include: {
                  student: true
                }
              }
            }
          },
          teacher: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Create notifications for all enrolled students
      if (announcement.subject) {
        await Promise.all(
          announcement.subject.enrollments.map(enrollment =>
            notificationController.createNotification(
              enrollment.student.id,
              'New Announcement',
              `${announcement.teacher.firstName} ${announcement.teacher.lastName} posted: ${title}`,
              'ANNOUNCEMENT',
              {
                announcementId: announcement.id,
                subjectId: announcement.subjectId,
                priority: announcement.priority
              }
            )
          )
        );
      }

      logger.info(`Announcement created: ${title} by ${teacherId}`);

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: { announcement }
      });
    } catch (error) {
      logger.error('Create announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get announcements for teacher
  getTeacherAnnouncements: async (req: Request, res: Response) => {
    try {
      const teacherId = (req as any).user.id;
      const { page = 1, limit = 10, subjectId } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { teacherId };

      if (subjectId) where.subjectId = subjectId;

      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.announcement.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          announcements,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalItems: total,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get teacher announcements error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get announcements for student
  getStudentAnnouncements: async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).user.id;
      const { page = 1, limit = 10, priority } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Get student's enrolled subjects
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId, isActive: true },
        select: { subjectId: true }
      });

      const subjectIds = enrollments.map(e => e.subjectId);

      const where: any = {
        OR: [
          { subjectId: { in: subjectIds } },
          { subjectId: null } // Global announcements
        ],
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      };

      if (priority) where.priority = priority;

      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            teacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: Number(limit)
        }),
        prisma.announcement.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          announcements,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalItems: total,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get student announcements error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update announcement
  updateAnnouncement: async (req: Request, res: Response) => {
    try {
      const { announcementId } = req.params;
      const teacherId = (req as any).user.id;

      const announcement = await prisma.announcement.findFirst({
        where: { id: announcementId, teacherId }
      });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      const updatedAnnouncement = await prisma.announcement.update({
        where: { id: announcementId },
        data: req.body
      });

      res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: { announcement: updatedAnnouncement }
      });
    } catch (error) {
      logger.error('Update announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete announcement
  deleteAnnouncement: async (req: Request, res: Response) => {
    try {
      const { announcementId } = req.params;
      const teacherId = (req as any).user.id;

      const announcement = await prisma.announcement.findFirst({
        where: { id: announcementId, teacherId }
      });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      await prisma.announcement.delete({
        where: { id: announcementId }
      });

      res.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      logger.error('Delete announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get single announcement
  getAnnouncement: async (req: Request, res: Response) => {
    try {
      const { announcementId } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          teacher: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // Check access rights
      if (userRole === 'STUDENT') {
        // Check if student is enrolled in the subject or it's a global announcement
        if (announcement.subjectId) {
          const enrollment = await prisma.enrollment.findFirst({
            where: {
              studentId: userId,
              subjectId: announcement.subjectId,
              isActive: true
            }
          });

          if (!enrollment) {
            return res.status(403).json({
              success: false,
              message: 'Access denied'
            });
          }
        }
      } else if (userRole === 'TEACHER' && announcement.teacherId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: { announcement }
      });
    } catch (error) {
      logger.error('Get announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}; 