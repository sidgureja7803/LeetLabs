import { Router } from 'express';
import { teacherController } from '../controllers/teacher.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication and teacher role requirement to all routes
router.use(authenticate);
router.use(requireRole(['TEACHER']));

// Dashboard routes
router.get('/dashboard', teacherController.getDashboard);

// Subject routes
router.get('/subjects', teacherController.getSubjects);

// Assignment routes
router.post('/assignments', upload.single('attachment'), teacherController.createAssignment);
router.get('/assignments/:assignmentId', teacherController.getAssignment);
router.put('/assignments/:assignmentId', upload.single('attachment'), teacherController.updateAssignment);
router.delete('/assignments/:assignmentId', teacherController.deleteAssignment);

// Submission routes
router.put('/submissions/:submissionId/grade', teacherController.gradeSubmission);

// Student routes
router.get('/students', teacherController.getStudents);

export default router; 