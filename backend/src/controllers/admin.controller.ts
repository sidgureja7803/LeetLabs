import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';
import { CustomError, asyncHandler } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { EmailService } from '../utils/emailSender';

// Get all users with pagination and filtering
export const getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, role, department, search } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (role) {
    where.role = role;
  }
  
  if (department) {
    where.departmentId = department;
  }
  
  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { rollNumber: { contains: search as string, mode: 'insensitive' } },
      { employeeId: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        rollNumber: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: users.length,
        totalCount: total,
      },
    },
  });
});

// Create new teacher account
export const createTeacher = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    email,
    firstName,
    lastName,
    employeeId,
    departmentId,
    subjects, // Array of subject IDs to assign
  } = req.body;

  // Validate required fields
  if (!email || !firstName || !lastName || !employeeId) {
    throw new CustomError('All required fields must be provided', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { employeeId },
      ],
    },
  });

  if (existingUser) {
    throw new CustomError('User with this email or employee ID already exists', 400);
  }

  // Generate temporary password
  const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  // Create teacher account
  const teacher = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'TEACHER',
      employeeId,
      departmentId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      employeeId: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  // Assign subjects if provided
  if (subjects && Array.isArray(subjects) && subjects.length > 0) {
    const currentSemester = new Date().getFullYear() + (new Date().getMonth() >= 6 ? 'Fall' : 'Spring');
    
    const subjectAssignments = subjects.map((subjectId: string) => ({
      teacherId: teacher.id,
      subjectId,
      semester: currentSemester,
    }));

    await prisma.teacherSubject.createMany({
      data: subjectAssignments,
      skipDuplicates: true,
    });
  }

  // Send welcome email with temporary password
  try {
    await EmailService.sendWelcomeEmail(
      teacher.email,
      `${teacher.firstName} ${teacher.lastName}`,
      'Teacher',
      temporaryPassword
    );
  } catch (error) {
    logger.warn(`Failed to send welcome email to ${teacher.email}:`, error);
  }

  logger.info(`New teacher created: ${teacher.email} by admin ${req.user?.email}`);

  res.status(201).json({
    success: true,
    message: 'Teacher account created successfully',
    data: {
      teacher,
    },
  });
});

// Get all departments
export const getDepartments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      _count: {
        select: {
          subjects: true,
          users: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    data: {
      departments,
    },
  });
});

// Get all teachers for dropdowns
export const getTeachers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { departmentId } = req.query;
  
  const where: any = {
    role: 'TEACHER',
    isActive: true,
  };
  
  if (departmentId) {
    where.departmentId = departmentId;
  }

  const teachers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      employeeId: true,
      department: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' },
    ],
  });

  res.json({
    success: true,
    data: {
      teachers,
    },
  });
});

// Get all subjects for dropdowns
export const getSubjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { departmentId } = req.query;
  
  const where: any = {};
  
  if (departmentId) {
    where.departmentId = departmentId;
  }

  const subjects = await prisma.subject.findMany({
    where,
    select: {
      id: true,
      name: true,
      code: true,
      semester: true,
      credits: true,
      department: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: [
      { semester: 'asc' },
      { name: 'asc' },
    ],
  });

  res.json({
    success: true,
    data: {
      subjects,
    },
  });
});

// Assign teachers to subjects
export const assignTeacherToSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { teacherId, subjectId, semester } = req.body;

  if (!teacherId || !subjectId || !semester) {
    throw new CustomError('Teacher ID, Subject ID, and semester are required', 400);
  }

  // Verify teacher exists and is active
  const teacher = await prisma.user.findFirst({
    where: {
      id: teacherId,
      role: 'TEACHER',
      isActive: true,
    },
  });

  if (!teacher) {
    throw new CustomError('Teacher not found or inactive', 404);
  }

  // Verify subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new CustomError('Subject not found', 404);
  }

  // Create or update assignment
  const assignment = await prisma.teacherSubject.upsert({
    where: {
      teacherId_subjectId_semester: {
        teacherId,
        subjectId,
        semester,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      teacherId,
      subjectId,
      semester,
      isActive: true,
    },
    include: {
      teacher: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      subject: {
        select: {
          name: true,
          code: true,
        },
      },
    },
  });

  logger.info(`Teacher ${teacher.firstName} ${teacher.lastName} assigned to subject ${subject.name} for ${semester}`);

  res.json({
    success: true,
    message: 'Teacher assigned to subject successfully',
    data: {
      assignment,
    },
  });
});

// Flush semester data (remove old assignments and submissions)
export const flushSemester = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { semesterToFlush, confirmationText } = req.body;

  if (!semesterToFlush) {
    throw new CustomError('Semester to flush is required', 400);
  }

  if (confirmationText !== 'FLUSH SEMESTER') {
    throw new CustomError('Please type "FLUSH SEMESTER" to confirm this action', 400);
  }

  try {
    // Start transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get assignments for the semester
      const assignmentsToDelete = await tx.assignment.findMany({
        where: {
          subject: {
            teacherSubjects: {
              some: {
                semester: semesterToFlush,
              },
            },
          },
        },
        select: { id: true },
      });

      const assignmentIds = assignmentsToDelete.map(a => a.id);

      // Delete submissions for these assignments
      const deletedSubmissions = await tx.submission.deleteMany({
        where: {
          assignmentId: {
            in: assignmentIds,
          },
        },
      });

      // Delete assignments
      const deletedAssignments = await tx.assignment.deleteMany({
        where: {
          id: {
            in: assignmentIds,
          },
        },
      });

      // Deactivate teacher-subject assignments for the semester
      const deactivatedAssignments = await tx.teacherSubject.updateMany({
        where: {
          semester: semesterToFlush,
        },
        data: {
          isActive: false,
        },
      });

      return {
        deletedSubmissions: deletedSubmissions.count,
        deletedAssignments: deletedAssignments.count,
        deactivatedAssignments: deactivatedAssignments.count,
      };
    });

    logger.info(`Semester ${semesterToFlush} flushed by admin ${req.user?.email}`, result);

    res.json({
      success: true,
      message: `Semester ${semesterToFlush} data flushed successfully`,
      data: result,
    });
  } catch (error) {
    logger.error('Error flushing semester:', error);
    throw new CustomError('Failed to flush semester data', 500);
  }
});

// Get system statistics
export const getSystemStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalSubjects,
    totalAssignments,
    totalSubmissions,
    activeSemesters,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.subject.count(),
    prisma.assignment.count({ where: { isActive: true } }),
    prisma.submission.count(),
    prisma.teacherSubject.findMany({
      where: { isActive: true },
      select: { semester: true },
      distinct: ['semester'],
    }),
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalUsers - totalStudents - totalTeachers,
      },
      academics: {
        subjects: totalSubjects,
        assignments: totalAssignments,
        submissions: totalSubmissions,
        activeSemesters: activeSemesters.map(s => s.semester),
      },
    },
  });
}); 