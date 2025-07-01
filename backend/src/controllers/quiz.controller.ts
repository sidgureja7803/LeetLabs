import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { EmailService } from '../utils/emailSender';

const prisma = new PrismaClient();

export const quizController = {
  // Create a new quiz
  createQuiz: async (req: Request, res: Response) => {
    try {
      const teacherId = (req as any).user.id;
      const {
        title,
        description,
        instructions,
        duration,
        totalMarks,
        passingMarks,
        maxAttempts,
        shuffleQuestions,
        shuffleOptions,
        showResults,
        allowReview,
        scheduledAt,
        startTime,
        endTime,
        timeLimit,
        subjectId,
        questions
      } = req.body;

      // Create quiz
      const quiz = await prisma.quiz.create({
        data: {
          title,
          description,
          instructions,
          duration,
          totalMarks,
          passingMarks,
          maxAttempts: maxAttempts || 1,
          shuffleQuestions: shuffleQuestions || false,
          shuffleOptions: shuffleOptions || false,
          showResults: showResults !== false,
          allowReview: allowReview !== false,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          timeLimit: timeLimit !== false,
          status: 'DRAFT',
          subjectId,
          teacherId
        },
        include: {
          subject: true,
          teacher: true
        }
      });

      // Add questions if provided
      if (questions && questions.length > 0) {
        await Promise.all(
          questions.map((question: any, index: number) =>
            prisma.quizQuestion.create({
              data: {
                question: question.question,
                type: question.type,
                options: question.options || null,
                correctAnswer: question.correctAnswer,
                marks: question.marks || 1,
                explanation: question.explanation || null,
                codeTemplate: question.codeTemplate || null,
                testCases: question.testCases || null,
                order: index + 1,
                quizId: quiz.id
              }
            })
          )
        );
      }

      logger.info(`Quiz created: ${quiz.title} by ${teacherId}`);

      res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: { quiz }
      });
    } catch (error) {
      logger.error('Create quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get all quizzes for a teacher
  getTeacherQuizzes: async (req: Request, res: Response) => {
    try {
      const teacherId = (req as any).user.id;
      const { page = 1, limit = 10, status, subjectId } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { teacherId };

      if (status) where.status = status;
      if (subjectId) where.subjectId = subjectId;

      const [quizzes, total] = await Promise.all([
        prisma.quiz.findMany({
          where,
          include: {
            subject: true,
            questions: true,
            attempts: {
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    rollNumber: true
                  }
                }
              }
            },
            _count: {
              select: {
                questions: true,
                attempts: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.quiz.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          quizzes,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalItems: total,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get teacher quizzes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get all quizzes for a student
  getStudentQuizzes: async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).user.id;
      const { page = 1, limit = 10, status } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Get student's enrolled subjects
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId, isActive: true },
        select: { subjectId: true }
      });

      const subjectIds = enrollments.map(e => e.subjectId);

      const where: any = {
        subjectId: { in: subjectIds },
        status: { in: ['SCHEDULED', 'ACTIVE', 'COMPLETED'] }
      };

      if (status) where.status = status;

      const [quizzes, total] = await Promise.all([
        prisma.quiz.findMany({
          where,
          include: {
            subject: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            attempts: {
              where: { studentId },
              orderBy: { attemptNumber: 'desc' },
              take: 1
            },
            _count: {
              select: { questions: true }
            }
          },
          orderBy: { scheduledAt: 'asc' },
          skip,
          take: Number(limit)
        }),
        prisma.quiz.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          quizzes,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalItems: total,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get student quizzes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Schedule/publish a quiz
  scheduleQuiz: async (req: Request, res: Response) => {
    try {
      const { quizId } = req.params;
      const { scheduledAt, startTime, endTime } = req.body;
      const teacherId = (req as any).user.id;

      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, teacherId },
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
          teacher: true
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      const updatedQuiz = await prisma.quiz.update({
        where: { id: quizId },
        data: {
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          status: 'SCHEDULED'
        }
      });

      // Send notifications to all enrolled students
      const students = quiz.subject.enrollments.map(e => e.student);
      await Promise.all(
        students.map(student =>
          EmailService.sendQuizNotification(
            student.email,
            `${student.firstName} ${student.lastName}`,
            quiz.title,
            quiz.subject.name,
            new Date(scheduledAt || startTime),
            quiz.duration,
            `${quiz.teacher.firstName} ${quiz.teacher.lastName}`
          )
        )
      );

      // Create notifications
      await Promise.all(
        students.map(student =>
          prisma.notification.create({
            data: {
              userId: student.id,
              title: 'Quiz Scheduled',
              message: `A new quiz "${quiz.title}" has been scheduled for ${quiz.subject.name}`,
              type: 'QUIZ',
              data: {
                quizId: quiz.id,
                subjectId: quiz.subjectId,
                scheduledAt: scheduledAt || startTime
              }
            }
          })
        )
      );

      logger.info(`Quiz scheduled: ${quiz.title} by ${teacherId}`);

      res.json({
        success: true,
        message: 'Quiz scheduled successfully',
        data: { quiz: updatedQuiz }
      });
    } catch (error) {
      logger.error('Schedule quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Start a quiz attempt
  startQuizAttempt: async (req: Request, res: Response) => {
    try {
      const { quizId } = req.params;
      const studentId = (req as any).user.id;

      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              question: true,
              type: true,
              options: true,
              marks: true,
              codeTemplate: true,
              order: true
            }
          },
          attempts: {
            where: { studentId }
          }
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // Check if quiz is active
      const now = new Date();
      if (quiz.status !== 'ACTIVE' && 
          (quiz.startTime && now < quiz.startTime) ||
          (quiz.endTime && now > quiz.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Quiz is not currently available'
        });
      }

      // Check attempt limit
      if (quiz.attempts.length >= quiz.maxAttempts) {
        return res.status(400).json({
          success: false,
          message: 'Maximum attempts reached'
        });
      }

      // Check for ongoing attempt
      const ongoingAttempt = quiz.attempts.find(a => !a.isCompleted);
      if (ongoingAttempt) {
        return res.status(400).json({
          success: false,
          message: 'You have an ongoing attempt',
          data: { attemptId: ongoingAttempt.id }
        });
      }

      // Create new attempt
      const attemptNumber = quiz.attempts.length + 1;
      const attempt = await prisma.quizAttempt.create({
        data: {
          quizId,
          studentId,
          attemptNumber
        }
      });

      // Shuffle questions if required
      let questions = quiz.questions;
      if (quiz.shuffleQuestions) {
        questions = [...questions].sort(() => Math.random() - 0.5);
      }

      // Shuffle options if required
      if (quiz.shuffleOptions) {
        questions = questions.map(q => ({
          ...q,
          options: q.options && Array.isArray(q.options) 
            ? [...q.options].sort(() => Math.random() - 0.5)
            : q.options
        }));
      }

      res.json({
        success: true,
        message: 'Quiz attempt started',
        data: {
          attempt,
          quiz: {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            instructions: quiz.instructions,
            duration: quiz.duration,
            totalMarks: quiz.totalMarks,
            timeLimit: quiz.timeLimit
          },
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            type: q.type,
            options: q.options,
            marks: q.marks,
            codeTemplate: q.codeTemplate,
            order: q.order
          }))
        }
      });
    } catch (error) {
      logger.error('Start quiz attempt error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Submit an answer
  submitAnswer: async (req: Request, res: Response) => {
    try {
      const { attemptId, questionId } = req.params;
      const { answer } = req.body;
      const studentId = (req as any).user.id;

      // Verify attempt belongs to student
      const attempt = await prisma.quizAttempt.findFirst({
        where: { id: attemptId, studentId, isCompleted: false }
      });

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Quiz attempt not found or already completed'
        });
      }

      // Get question details
      const question = await prisma.quizQuestion.findUnique({
        where: { id: questionId }
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      // Check if answer is correct and calculate marks
      let isCorrect = false;
      let marks = 0;

      switch (question.type) {
        case 'MULTIPLE_CHOICE':
        case 'TRUE_FALSE':
          isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();
          marks = isCorrect ? question.marks : 0;
          break;
        case 'SHORT_ANSWER':
          isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
          marks = isCorrect ? question.marks : 0;
          break;
        case 'ESSAY':
        case 'CODE':
          // These need manual grading
          isCorrect = null;
          marks = 0;
          break;
      }

      // Upsert answer
      await prisma.quizAnswer.upsert({
        where: {
          questionId_attemptId: {
            questionId,
            attemptId
          }
        },
        create: {
          questionId,
          attemptId,
          answer,
          isCorrect,
          marks
        },
        update: {
          answer,
          isCorrect,
          marks
        }
      });

      res.json({
        success: true,
        message: 'Answer submitted successfully'
      });
    } catch (error) {
      logger.error('Submit answer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Submit quiz attempt
  submitQuizAttempt: async (req: Request, res: Response) => {
    try {
      const { attemptId } = req.params;
      const studentId = (req as any).user.id;

      const attempt = await prisma.quizAttempt.findFirst({
        where: { id: attemptId, studentId, isCompleted: false },
        include: {
          quiz: {
            include: {
              questions: true
            }
          },
          answers: {
            include: {
              question: true
            }
          }
        }
      });

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Quiz attempt not found'
        });
      }

      // Calculate total score
      const totalScore = attempt.answers.reduce((sum, answer) => sum + (answer.marks || 0), 0);
      const isPassed = attempt.quiz.passingMarks ? totalScore >= attempt.quiz.passingMarks : true;

      // Calculate time spent
      const timeSpent = Math.round((Date.now() - attempt.startedAt.getTime()) / (1000 * 60));

      // Update attempt
      const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          submittedAt: new Date(),
          isCompleted: true,
          score: totalScore,
          isPassed,
          timeSpent
        }
      });

      // Create grade record
      await prisma.grade.create({
        data: {
          studentId,
          teacherId: attempt.quiz.teacherId,
          quizId: attempt.quiz.id,
          quizAttemptId: attemptId,
          marks: totalScore,
          maxMarks: attempt.quiz.totalMarks,
          percentage: (totalScore / attempt.quiz.totalMarks) * 100,
          grade: isPassed ? 'PASS' : 'FAIL',
          isPublished: true
        }
      });

      res.json({
        success: true,
        message: 'Quiz submitted successfully',
        data: {
          attempt: updatedAttempt,
          score: totalScore,
          totalMarks: attempt.quiz.totalMarks,
          percentage: (totalScore / attempt.quiz.totalMarks) * 100,
          isPassed,
          timeSpent
        }
      });
    } catch (error) {
      logger.error('Submit quiz attempt error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get quiz results
  getQuizResults: async (req: Request, res: Response) => {
    try {
      const { quizId } = req.params;
      const teacherId = (req as any).user.id;

      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, teacherId },
        include: {
          attempts: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  rollNumber: true
                }
              },
              answers: {
                include: {
                  question: true
                }
              }
            },
            orderBy: { submittedAt: 'desc' }
          },
          questions: true
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // Calculate statistics
      const completedAttempts = quiz.attempts.filter(a => a.isCompleted);
      const totalAttempts = completedAttempts.length;
      const averageScore = totalAttempts > 0 
        ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts
        : 0;
      const passedAttempts = completedAttempts.filter(a => a.isPassed).length;
      const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

      res.json({
        success: true,
        data: {
          quiz,
          statistics: {
            totalAttempts,
            averageScore,
            passRate,
            highestScore: Math.max(...completedAttempts.map(a => a.score || 0)),
            lowestScore: Math.min(...completedAttempts.map(a => a.score || 0))
          }
        }
      });
    } catch (error) {
      logger.error('Get quiz results error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update quiz
  updateQuiz: async (req: Request, res: Response) => {
    try {
      const { quizId } = req.params;
      const teacherId = (req as any).user.id;

      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, teacherId }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      const updatedQuiz = await prisma.quiz.update({
        where: { id: quizId },
        data: req.body
      });

      res.json({
        success: true,
        message: 'Quiz updated successfully',
        data: { quiz: updatedQuiz }
      });
    } catch (error) {
      logger.error('Update quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete quiz
  deleteQuiz: async (req: Request, res: Response) => {
    try {
      const { quizId } = req.params;
      const teacherId = (req as any).user.id;

      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, teacherId },
        include: { attempts: true }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      if (quiz.attempts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete quiz with existing attempts'
        });
      }

      await prisma.quiz.delete({
        where: { id: quizId }
      });

      res.json({
        success: true,
        message: 'Quiz deleted successfully'
      });
    } catch (error) {
      logger.error('Delete quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}; 