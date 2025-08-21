import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { S3Service } from '../utils/s3Uploader';
import { EmailService } from '../utils/emailSender';
import { logger } from '../utils/logger';

// Define extended Request type with user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const prisma = new PrismaClient();

export const teacherController = {
  // Get teacher dashboard data
  getDashboard: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teacherId = req.user.id;
      
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        include: {
          department: true,
          subjectsTeaching: {
            include: {
              assignments: {
                include: {
                  submissions: {
                    include: {
                      student: true
                    }
                  }
                }
              }
            }
          }
        }
      }) as any;

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      // Calculate statistics
      const totalSubjects = teacher.subjectsTeaching.length;
      const totalAssignments = teacher.subjectsTeaching.reduce(
        (acc: number, subject: any) => acc + subject.assignments.length, 0
      );
      const totalSubmissions = teacher.subjectsTeaching.reduce(
        (acc: number, subject: any) => acc + subject.assignments.reduce(
          (subAcc: number, assignment: any) => subAcc + assignment.submissions.length, 0
        ), 0
      );
      const pendingGrading = teacher.subjectsTeaching.reduce(
        (acc: number, subject: any) => acc + subject.assignments.reduce(
          (subAcc: number, assignment: any) => subAcc + assignment.submissions.filter(
            (sub: any) => !sub.grade
          ).length, 0
        ), 0
      );

      res.json({
        teacher: {
          id: teacher.id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          department: teacher.department?.name || 'Unknown'
        },
        stats: {
          totalSubjects,
          totalAssignments,
          totalSubmissions,
          pendingGrading
        },
        subjects: teacher.subjectsTeaching
      });
    } catch (error) {
      logger.error('Error fetching teacher dashboard:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get all subjects taught by teacher
  getSubjects: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teacherId = req.user.id;
      
      const subjects = await prisma.subject.findMany({
        where: { 
          teacherId: teacherId 
        } as any,
        include: {
          department: true,
          assignments: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              assignments: true
            }
          }
        }
      });

      res.json(subjects);
    } catch (error) {
      logger.error('Error fetching teacher subjects:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Create new assignment
  createAssignment: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, description, subjectId, dueDate, maxMarks, semester } = req.body;
      const teacherId = req.user.id;

      // Verify teacher owns this subject
      const subject = await prisma.subject.findFirst({
        where: { 
          id: subjectId, 
          teacherId: teacherId 
        } as any
      });

      if (!subject) {
        return res.status(403).json({ message: 'Not authorized to create assignments for this subject' });
      }

      let attachmentUrl = null;
      if (req.file) {
        const uploadResult = await S3Service.uploadAssignmentFile(req.file);
        if (uploadResult.success) {
          attachmentUrl = uploadResult.fileUrl;
        }
      }

      const assignment = await prisma.assignment.create({
        data: {
          title,
          description,
          subjectId,
          dueDate: new Date(dueDate),
          maxMarks: parseInt(maxMarks as string),
          semester: parseInt(semester as string),
          attachmentUrl,
          teacherId: teacherId
        } as any,
        include: {
          subject: {
            include: {
              department: true
            }
          }
        }
      });

      // Send notification emails to students
      const students = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          semester: parseInt(semester as string),
          departmentId: assignment.subject?.departmentId
        } as any
      });

      // Send emails asynchronously
      students.forEach(async (student) => {
        try {
          await EmailService.sendAssignmentNotification(
            student.email,
            `${student.firstName} ${student.lastName}`,
            title,
            assignment.subject?.name || 'Unknown Subject',
            new Date(dueDate),
            ''  // Empty string for additional message
          );
        } catch (emailError) {
          logger.error('Error sending assignment notification:', emailError);
        }
      });

      res.status(201).json(assignment);
    } catch (error) {
      logger.error('Error creating assignment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get assignment details with submissions
  getAssignment: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const teacherId = req.user.id;

      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          subject: {
            teacherId: teacherId
          } as any
        } as any,
        include: {
          subject: true,
          submissions: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  rollNumber: true
                }
              }
            },
            orderBy: { submittedAt: 'desc' }
          }
        }
      });

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      res.json(assignment);
    } catch (error) {
      logger.error('Error fetching assignment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Grade a submission
  gradeSubmission: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { submissionId } = req.params;
      const { grade, feedback } = req.body;
      const teacherId = req.user.id;

      // Verify teacher owns this assignment
      const submission = await prisma.submission.findFirst({
        where: {
          id: submissionId,
          assignment: {
            subject: {
              teacherId
            }
          }
        },
        include: {
          assignment: {
            include: {
              subject: true
            }
          },
          student: true
        }
      });

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          grade: parseFloat(grade),
          feedback,
          gradedAt: new Date()
        },
        include: {
          student: true,
          assignment: true
        }
      });

      // Send notification email to student
      try {
        await EmailService.sendBulkEmail(
          [updatedSubmission.student.email],
          `Assignment Graded: ${updatedSubmission.assignment.title}`,
          `Your assignment "${updatedSubmission.assignment.title}" has been graded. Grade: ${grade}/${updatedSubmission.assignment.maxMarks}`
        );
      } catch (emailError) {
        logger.error('Error sending grade notification:', emailError);
      }

      res.json(updatedSubmission);
    } catch (error) {
      logger.error('Error grading submission:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get students in teacher's subjects
  getStudents: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teacherId = req.user.id;
      const { semester } = req.query;

      const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        include: { department: true }
      });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const whereClause: any = {
        role: 'STUDENT',
        departmentId: teacher.departmentId
      };

      if (semester) {
        whereClause.semester = parseInt(semester as string);
      }

      const students = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          rollNumber: true,
          semester: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      });

      res.json(students);
    } catch (error) {
      logger.error('Error fetching students:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update assignment
  updateAssignment: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const { title, description, dueDate, maxMarks } = req.body;
      const teacherId = req.user.id;

      // Verify teacher owns this assignment
      const existingAssignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          subject: {
            teacherId
          }
        }
      });

      if (!existingAssignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      let attachmentUrl = existingAssignment.attachmentUrl;
      if (req.file) {
        const uploadResult = await S3Service.uploadAssignmentFile(req.file);
        if (uploadResult.success) {
          attachmentUrl = uploadResult.fileUrl;
        }
      }

      const updatedAssignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          title,
          description,
          dueDate: new Date(dueDate),
          maxMarks: parseInt(maxMarks),
          attachmentUrl
        },
        include: {
          subject: true
        }
      });

      res.json(updatedAssignment);
    } catch (error) {
      logger.error('Error updating assignment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete assignment
  deleteAssignment: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const teacherId = req.user.id;

      // Verify teacher owns this assignment
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          subject: {
            teacherId
          }
        }
      });

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      await prisma.assignment.delete({
        where: { id: assignmentId }
      });

      res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
      logger.error('Error deleting assignment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}; 