import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { S3Service } from '../utils/s3Uploader';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const studentController = {
  // Get student dashboard data
  getDashboard: async (req: Request, res: Response) => {
    try {
      const studentId = req.user.id;
      
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          department: true,
          submissions: {
            include: {
              assignment: {
                include: {
                  subject: true
                }
              }
            },
            orderBy: { submittedAt: 'desc' },
            take: 5
          }
        }
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Get assignments for student's semester and department
      const assignments = await prisma.assignment.findMany({
        where: {
          semester: student.semester,
          subject: {
            departmentId: student.departmentId
          }
        },
        include: {
          subject: true,
          submissions: {
            where: { studentId },
            select: {
              id: true,
              submittedAt: true,
              grade: true,
              feedback: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate statistics
      const totalAssignments = assignments.length;
      const submittedAssignments = assignments.filter(a => a.submissions.length > 0).length;
      const gradedAssignments = assignments.filter(a => 
        a.submissions.length > 0 && a.submissions[0].grade !== null
      ).length;
      const pendingSubmissions = assignments.filter(a => 
        a.submissions.length === 0 && new Date(a.dueDate) > new Date()
      ).length;

      // Calculate average grade
      const gradedSubmissions = assignments
        .filter(a => a.submissions.length > 0 && a.submissions[0].grade !== null)
        .map(a => ({ grade: a.submissions[0].grade, maxMarks: a.maxMarks }));
      
      const averageGrade = gradedSubmissions.length > 0 
        ? gradedSubmissions.reduce((acc, sub) => acc + (sub.grade! / sub.maxMarks * 100), 0) / gradedSubmissions.length
        : 0;

      res.json({
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
          semester: student.semester,
          department: student.department.name
        },
        stats: {
          totalAssignments,
          submittedAssignments,
          gradedAssignments,
          pendingSubmissions,
          averageGrade: Math.round(averageGrade * 100) / 100
        },
        recentSubmissions: student.submissions,
        upcomingAssignments: assignments
          .filter(a => a.submissions.length === 0 && new Date(a.dueDate) > new Date())
          .slice(0, 5)
      });
    } catch (error) {
      logger.error('Error fetching student dashboard:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get all assignments for student
  getAssignments: async (req: Request, res: Response) => {
    try {
      const studentId = req.user.id;
      const { status, subjectId } = req.query;
      
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { semester: true, departmentId: true }
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const whereClause: any = {
        semester: student.semester,
        subject: {
          departmentId: student.departmentId
        }
      };

      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      const assignments = await prisma.assignment.findMany({
        where: whereClause,
        include: {
          subject: {
            include: {
              teacher: {
                select: { name: true, email: true }
              }
            }
          },
          submissions: {
            where: { studentId },
            select: {
              id: true,
              submittedAt: true,
              grade: true,
              feedback: true,
              fileUrl: true
            }
          }
        },
        orderBy: { dueDate: 'asc' }
      });

      // Filter by status if provided
      let filteredAssignments = assignments;
      if (status) {
        switch (status) {
          case 'pending':
            filteredAssignments = assignments.filter(a => 
              a.submissions.length === 0 && new Date(a.dueDate) > new Date()
            );
            break;
          case 'submitted':
            filteredAssignments = assignments.filter(a => a.submissions.length > 0);
            break;
          case 'overdue':
            filteredAssignments = assignments.filter(a => 
              a.submissions.length === 0 && new Date(a.dueDate) < new Date()
            );
            break;
          case 'graded':
            filteredAssignments = assignments.filter(a => 
              a.submissions.length > 0 && a.submissions[0].grade !== null
            );
            break;
        }
      }

      res.json(filteredAssignments);
    } catch (error) {
      logger.error('Error fetching assignments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get assignment details
  getAssignment: async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const studentId = req.user.id;

      const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { semester: true, departmentId: true }
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          semester: student.semester,
          subject: {
            departmentId: student.departmentId
          }
        },
        include: {
          subject: {
            include: {
              teacher: {
                select: { name: true, email: true }
              }
            }
          },
          submissions: {
            where: { studentId },
            orderBy: { submittedAt: 'desc' },
            take: 1
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

  // Submit assignment
  submitAssignment: async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const { comments } = req.body;
      const studentId = req.user.id;

      // Check if assignment exists and is accessible to student
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { semester: true, departmentId: true }
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          semester: student.semester,
          subject: {
            departmentId: student.departmentId
          }
        }
      });

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // Check if already submitted
      const existingSubmission = await prisma.submission.findFirst({
        where: {
          assignmentId,
          studentId
        }
      });

      if (existingSubmission) {
        return res.status(400).json({ message: 'Assignment already submitted' });
      }

      // Upload file to S3
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const uploadResult = await S3Service.uploadSubmissionFile(req.file);
      
      if (!uploadResult.success) {
        return res.status(400).json({ message: uploadResult.error });
      }

      // Create submission
      const submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId,
          fileUrl: uploadResult.fileUrl!,
          comments: comments || '',
          submittedAt: new Date()
        },
        include: {
          assignment: {
            include: {
              subject: true
            }
          },
          student: {
            select: {
              name: true,
              rollNumber: true
            }
          }
        }
      });

      res.status(201).json(submission);
    } catch (error) {
      logger.error('Error submitting assignment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get subjects for student
  getSubjects: async (req: Request, res: Response) => {
    try {
      const studentId = req.user.id;
      
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { semester: true, departmentId: true }
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const subjects = await prisma.subject.findMany({
        where: {
          departmentId: student.departmentId,
          semester: student.semester
        },
        include: {
          teacher: {
            select: { name: true, email: true }
          },
          department: true,
          _count: {
            select: {
              assignments: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json(subjects);
    } catch (error) {
      logger.error('Error fetching subjects:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get student's submissions
  getSubmissions: async (req: Request, res: Response) => {
    try {
      const studentId = req.user.id;
      const { subjectId } = req.query;

      const whereClause: any = { studentId };
      if (subjectId) {
        whereClause.assignment = {
          subjectId
        };
      }

      const submissions = await prisma.submission.findMany({
        where: whereClause,
        include: {
          assignment: {
            include: {
              subject: {
                include: {
                  teacher: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      });

      res.json(submissions);
    } catch (error) {
      logger.error('Error fetching submissions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get grades/report
  getGrades: async (req: Request, res: Response) => {
    try {
      const studentId = req.user.id;

      const submissions = await prisma.submission.findMany({
        where: {
          studentId,
          grade: { not: null }
        },
        include: {
          assignment: {
            include: {
              subject: {
                include: {
                  teacher: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { gradedAt: 'desc' }
      });

      // Group by subject and calculate subject-wise averages
      const subjectGrades: any = {};
      submissions.forEach(submission => {
        const subjectId = submission.assignment.subjectId;
        const subjectName = submission.assignment.subject.name;
        
        if (!subjectGrades[subjectId]) {
          subjectGrades[subjectId] = {
            subjectName,
            teacher: submission.assignment.subject.teacher.name,
            grades: [],
            totalMarks: 0,
            obtainedMarks: 0
          };
        }
        
        subjectGrades[subjectId].grades.push({
          assignmentTitle: submission.assignment.title,
          grade: submission.grade,
          maxMarks: submission.assignment.maxMarks,
          percentage: (submission.grade! / submission.assignment.maxMarks) * 100,
          gradedAt: submission.gradedAt
        });
        
        subjectGrades[subjectId].totalMarks += submission.assignment.maxMarks;
        subjectGrades[subjectId].obtainedMarks += submission.grade!;
      });

      // Calculate subject averages
      Object.keys(subjectGrades).forEach(subjectId => {
        const subject = subjectGrades[subjectId];
        subject.average = subject.totalMarks > 0 
          ? (subject.obtainedMarks / subject.totalMarks) * 100 
          : 0;
      });

      // Calculate overall average
      const totalObtained = Object.values(subjectGrades).reduce((acc: number, subject: any) => acc + subject.obtainedMarks, 0);
      const totalMax = Object.values(subjectGrades).reduce((acc: number, subject: any) => acc + subject.totalMarks, 0);
      const overallAverage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      res.json({
        overallAverage: Math.round(overallAverage * 100) / 100,
        subjectGrades: Object.values(subjectGrades),
        totalSubmissions: submissions.length
      });
    } catch (error) {
      logger.error('Error fetching grades:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}; 