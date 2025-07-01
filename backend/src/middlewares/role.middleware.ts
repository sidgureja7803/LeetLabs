import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { Role } from '@prisma/client';

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole([Role.ADMIN]);
export const requireTeacher = requireRole([Role.TEACHER, Role.ADMIN]);
export const requireStudent = requireRole([Role.STUDENT]);
export const requireTeacherOrAdmin = requireRole([Role.TEACHER, Role.ADMIN]);
export const requireStudentOrTeacher = requireRole([Role.STUDENT, Role.TEACHER]);

// Custom role middleware for more complex permissions
export const canAccessSubject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { subjectId } = req.params;
    const userRole = req.user.role as Role;

    // Admin can access all subjects
    if (userRole === Role.ADMIN) {
      next();
      return;
    }

    // Teachers can only access subjects they're assigned to
    if (userRole === Role.TEACHER) {
      const { prisma } = await import('../config/db');
      
      const teacherSubject = await prisma.teacherSubject.findFirst({
        where: {
          teacherId: req.user.id,
          subjectId: subjectId,
          isActive: true,
        },
      });

      if (!teacherSubject) {
        res.status(403).json({
          success: false,
          message: 'You are not assigned to this subject',
        });
        return;
      }
    }

    // Students can access all subjects (for viewing assignments)
    if (userRole === Role.STUDENT) {
      next();
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking subject access permissions',
    });
  }
};

export const canModifyAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { assignmentId } = req.params;
    const userRole = req.user.role as Role;

    // Admin can modify all assignments
    if (userRole === Role.ADMIN) {
      next();
      return;
    }

    // Teachers can only modify assignments they created
    if (userRole === Role.TEACHER) {
      const { prisma } = await import('../config/db');
      
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: { createdById: true },
      });

      if (!assignment) {
        res.status(404).json({
          success: false,
          message: 'Assignment not found',
        });
        return;
      }

      if (assignment.createdById !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'You can only modify assignments you created',
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking assignment modification permissions',
    });
  }
}; 