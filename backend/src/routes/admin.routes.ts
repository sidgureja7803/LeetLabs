import express from 'express';
import {
  getAllUsers,
  createTeacher,
  getDepartments,
  getTeachers,
  getSubjects,
  assignTeacherToSubject,
  flushSemester,
  getSystemStats,
} from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);
router.post('/teachers', createTeacher);

// Data retrieval for dropdowns and forms
router.get('/departments', getDepartments);
router.get('/teachers', getTeachers);
router.get('/subjects', getSubjects);

// Subject assignment
router.post('/assign-teacher', assignTeacherToSubject);

// Semester management
router.post('/flush-semester', flushSemester);

// System statistics
router.get('/stats', getSystemStats);

export default router; 