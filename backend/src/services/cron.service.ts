import { PrismaClient } from '@prisma/client';
import { CronJob } from 'cron';
import { EmailService } from '../utils/emailSender';
import { logger } from '../utils/logger';

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface Subject {
  id: string;
  name: string;
  enrollments: {
    student: Student;
  }[];
}

interface Quiz {
  id: string;
  title: string;
  duration: number;
  startTime: Date;
  subject: Subject;
  teacher: Teacher;
}

interface RawQuizResult {
  id: string;
  title: string;
  duration: number;
  startTime: Date;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherFirstName: string;
  teacherLastName: string;
  studentId: string;
  studentEmail: string;
  studentFirstName: string;
  studentLastName: string;
}

interface NotificationType {
  QUIZ: 'QUIZ';
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export class CronService {
  private static quizReminderJob: CronJob;
  private static upcomingQuizJob: CronJob;

  static initializeJobs() {
    // Check for upcoming quizzes every day at 9 AM
    this.upcomingQuizJob = new CronJob('0 9 * * *', async () => {
      try {
        await this.sendUpcomingQuizNotifications();
      } catch (error) {
        logger.error('Error in upcoming quiz notification job:', error);
      }
    });

    // Check for imminent quizzes every 15 minutes
    this.quizReminderJob = new CronJob('*/15 * * * *', async () => {
      try {
        await this.sendQuizReminders();
      } catch (error) {
        logger.error('Error in quiz reminder job:', error);
      }
    });

    // Start the jobs
    this.upcomingQuizJob.start();
    this.quizReminderJob.start();

    logger.info('Cron jobs initialized');
  }

  private static async sendUpcomingQuizNotifications() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const upcomingQuizzes = await prisma.$queryRaw<RawQuizResult[]>`
      SELECT 
        q.id, q.title, q.duration, q.start_time as "startTime",
        s.id as "subjectId", s.name as "subjectName",
        t.id as "teacherId", t.first_name as "teacherFirstName", t.last_name as "teacherLastName",
        e.student_id as "studentId", u.email as "studentEmail", 
        u.first_name as "studentFirstName", u.last_name as "studentLastName"
      FROM quizzes q
      JOIN subjects s ON q.subject_id = s.id
      JOIN users t ON q.teacher_id = t.id
      JOIN enrollments e ON s.id = e.subject_id
      JOIN users u ON e.student_id = u.id
      WHERE q.status = 'SCHEDULED'
      AND q.start_time >= ${tomorrow}
      AND q.start_time < ${dayAfterTomorrow}
    `;

    const quizMap = new Map<string, Quiz>();
    for (const row of upcomingQuizzes) {
      if (!quizMap.has(row.id)) {
        quizMap.set(row.id, {
          id: row.id,
          title: row.title,
          duration: row.duration,
          startTime: row.startTime,
          subject: {
            id: row.subjectId,
            name: row.subjectName,
            enrollments: []
          },
          teacher: {
            id: row.teacherId,
            firstName: row.teacherFirstName,
            lastName: row.teacherLastName
          }
        });
      }

      const quiz = quizMap.get(row.id)!;
      quiz.subject.enrollments.push({
        student: {
          id: row.studentId,
          email: row.studentEmail,
          firstName: row.studentFirstName,
          lastName: row.studentLastName
        }
      });
    }

    const quizzes = Array.from(quizMap.values());
    for (const quiz of quizzes) {
      const students = quiz.subject.enrollments.map(e => e.student);
      
      // Send email notifications
      await Promise.all(
        students.map(student =>
          EmailService.sendQuizNotification(
            student.email,
            `${student.firstName} ${student.lastName}`,
            quiz.title,
            quiz.subject.name,
            quiz.startTime,
            quiz.duration,
            `${quiz.teacher.firstName} ${quiz.teacher.lastName}`
          )
        )
      );

      // Create in-app notifications
      await Promise.all(
        students.map(student =>
          prisma.$executeRaw`
            INSERT INTO notifications (
              user_id, title, message, type, data
            ) VALUES (
              ${student.id},
              'Upcoming Quiz Tomorrow',
              ${`You have a quiz "${quiz.title}" scheduled for tomorrow in ${quiz.subject.name}`},
              'QUIZ',
              ${JSON.stringify({
                quizId: quiz.id,
                subjectId: quiz.subject.id,
                startTime: quiz.startTime
              })}
            )
          `
        )
      );
    }

    logger.info(`Sent notifications for ${quizzes.length} upcoming quizzes`);
  }

  private static async sendQuizReminders() {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

    const imminentQuizzes = await prisma.$queryRaw<RawQuizResult[]>`
      SELECT 
        q.id, q.title, q.duration, q.start_time as "startTime",
        s.id as "subjectId", s.name as "subjectName",
        t.id as "teacherId", t.first_name as "teacherFirstName", t.last_name as "teacherLastName",
        e.student_id as "studentId", u.email as "studentEmail", 
        u.first_name as "studentFirstName", u.last_name as "studentLastName"
      FROM quizzes q
      JOIN subjects s ON q.subject_id = s.id
      JOIN users t ON q.teacher_id = t.id
      JOIN enrollments e ON s.id = e.subject_id
      JOIN users u ON e.student_id = u.id
      WHERE q.status = 'SCHEDULED'
      AND q.start_time >= ${now}
      AND q.start_time < ${thirtyMinutesFromNow}
    `;

    const quizMap = new Map<string, Quiz>();
    for (const row of imminentQuizzes) {
      if (!quizMap.has(row.id)) {
        quizMap.set(row.id, {
          id: row.id,
          title: row.title,
          duration: row.duration,
          startTime: row.startTime,
          subject: {
            id: row.subjectId,
            name: row.subjectName,
            enrollments: []
          },
          teacher: {
            id: row.teacherId,
            firstName: row.teacherFirstName,
            lastName: row.teacherLastName
          }
        });
      }

      const quiz = quizMap.get(row.id)!;
      quiz.subject.enrollments.push({
        student: {
          id: row.studentId,
          email: row.studentEmail,
          firstName: row.studentFirstName,
          lastName: row.studentLastName
        }
      });
    }

    const quizzes = Array.from(quizMap.values());
    for (const quiz of quizzes) {
      const students = quiz.subject.enrollments.map(e => e.student);
      
      // Create urgent notifications
      await Promise.all(
        students.map(student =>
          prisma.$executeRaw`
            INSERT INTO notifications (
              user_id, title, message, type, data
            ) VALUES (
              ${student.id},
              'Quiz Starting Soon!',
              ${`Quiz "${quiz.title}" will start in ${Math.round((quiz.startTime.getTime() - now.getTime()) / 60000)} minutes`},
              'QUIZ',
              ${JSON.stringify({
                quizId: quiz.id,
                subjectId: quiz.subject.id,
                startTime: quiz.startTime
              })}
            )
          `
        )
      );

      // Update quiz status if it's starting
      if (quiz.startTime <= now) {
        await prisma.$executeRaw`
          UPDATE quizzes
          SET status = 'ACTIVE'
          WHERE id = ${quiz.id}
        `;
      }
    }

    logger.info(`Sent reminders for ${quizzes.length} imminent quizzes`);
  }

  static stopJobs() {
    if (this.upcomingQuizJob) {
      this.upcomingQuizJob.stop();
    }
    if (this.quizReminderJob) {
      this.quizReminderJob.stop();
    }
    logger.info('Cron jobs stopped');
  }
} 