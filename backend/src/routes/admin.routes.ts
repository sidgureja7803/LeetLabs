import express from 'express';
import {
  getAllUsers,
  createTeacher,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getTeachers,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
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

// Department management
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Teacher management
router.get('/teachers', getTeachers);

// Subject management
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Subject assignment
router.post('/assign-teacher', assignTeacherToSubject);

// Semester management
router.post('/flush-semester', flushSemester);

// System statistics
router.get('/stats', getSystemStats);

export default router; 