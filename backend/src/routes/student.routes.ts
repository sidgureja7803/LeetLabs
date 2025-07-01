import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication and student role requirement to all routes
router.use(authenticate);
router.use(requireRole(['STUDENT']));

// Dashboard routes
router.get('/dashboard', studentController.getDashboard);

// Assignment routes
router.get('/assignments', studentController.getAssignments);
router.get('/assignments/:assignmentId', studentController.getAssignment);
router.post('/assignments/:assignmentId/submit', upload.single('file'), studentController.submitAssignment);

// Subject routes
router.get('/subjects', studentController.getSubjects);

// Submission routes
router.get('/submissions', studentController.getSubmissions);

// Grades routes
router.get('/grades', studentController.getGrades);

export default router; 