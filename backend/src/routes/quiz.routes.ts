import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { quizController } from '../controllers/quiz.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teacher routes
router.post(
  '/',
  requireRole(['TEACHER', 'ADMIN']),
  quizController.createQuiz
);

router.get(
  '/teacher',
  requireRole(['TEACHER', 'ADMIN']),
  quizController.getTeacherQuizzes
);

router.put(
  '/:quizId/schedule',
  requireRole(['TEACHER', 'ADMIN']),
  quizController.scheduleQuiz
);

router.get(
  '/:quizId/results',
  requireRole(['TEACHER', 'ADMIN']),
  quizController.getQuizResults
);

router.put(
  '/:quizId',
  requireRole(['TEACHER', 'ADMIN']),
  quizController.updateQuiz
);

router.delete(
  '/:quizId',
  requireRole(['TEACHER', 'ADMIN']),
  quizController.deleteQuiz
);

// Student routes
router.get(
  '/student',
  requireRole(['STUDENT']),
  quizController.getStudentQuizzes
);

router.post(
  '/:quizId/start',
  requireRole(['STUDENT']),
  quizController.startQuizAttempt
);

router.post(
  '/attempts/:attemptId/questions/:questionId/answer',
  requireRole(['STUDENT']),
  quizController.submitAnswer
);

router.post(
  '/attempts/:attemptId/submit',
  requireRole(['STUDENT']),
  quizController.submitQuizAttempt
);

export default router; 