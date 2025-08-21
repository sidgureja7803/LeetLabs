import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';
import { CustomError, asyncHandler } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { EmailService } from '../utils/emailSender';

// Get all users with pagination and filtering
export const getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, role, department, search } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: Prisma.UserWhereInput = {};
  
    if (role) {
    where.role = role as Role;
  }
  
    if (department) {
    where.departmentId = department as string;
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

// Create a new department
export const createDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, code } = req.body;

  // Validate required fields
  if (!name || !code) {
    throw new CustomError('Department name and code are required', 400);
  }

  // Check if department with same code already exists
  const existingDepartment = await prisma.department.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        { code: { equals: code, mode: 'insensitive' } },
      ],
    },
  });

  if (existingDepartment) {
    throw new CustomError('Department with this name or code already exists', 400);
  }

  // Create department
  const department = await prisma.department.create({
    data: {
      name,
      code,
    },
  });

  logger.info(`New department created: ${department.name} by admin ${req.user?.email}`);

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: {
      department,
    },
  });
});

// Update a department
export const updateDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, code } = req.body;

  // Validate required fields
  if (!name || !code) {
    throw new CustomError('Department name and code are required', 400);
  }

  // Check if department exists
  const existingDepartment = await prisma.department.findUnique({
    where: { id },
  });

  if (!existingDepartment) {
    throw new CustomError('Department not found', 404);
  }

  // Check if another department with same code/name exists
  const duplicateDepartment = await prisma.department.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        { code: { equals: code, mode: 'insensitive' } },
      ],
      NOT: {
        id,
      },
    },
  });

  if (duplicateDepartment) {
    throw new CustomError('Another department with this name or code already exists', 400);
  }

  // Update department
  const department = await prisma.department.update({
    where: { id },
    data: {
      name,
      code,
    },
  });

  logger.info(`Department updated: ${department.name} by admin ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Department updated successfully',
    data: {
      department,
    },
  });
});

// Delete a department
export const deleteDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if department exists
  const existingDepartment = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          subjects: true,
        },
      },
    },
  });

  if (!existingDepartment) {
    throw new CustomError('Department not found', 404);
  }

  // Check if department has associated users or subjects
  if (existingDepartment._count.users > 0 || existingDepartment._count.subjects > 0) {
    throw new CustomError(
      'Cannot delete department that has associated users or subjects. Reassign them first.',
      400
    );
  }

  // Delete department
  await prisma.department.delete({
    where: { id },
  });

  logger.info(`Department deleted: ${existingDepartment.name} by admin ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Department deleted successfully',
  });
});

// Get all teachers for dropdowns
export const getTeachers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { departmentId } = req.query;
  
  const where: Prisma.UserWhereInput = {
    role: 'TEACHER',
    isActive: true,
  };
  
    if (departmentId) {
    where.departmentId = departmentId as string;
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
  
  const where: Prisma.SubjectWhereInput = {};
  
  if (departmentId) {
    where.departmentId = departmentId as string;
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

// Create a new subject
export const createSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, code, description, credits, semester, departmentId } = req.body;

  // Validate required fields
  if (!name || !code || !credits || !semester || !departmentId) {
    throw new CustomError('Subject name, code, credits, semester, and department are required', 400);
  }

  // Check if department exists
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!department) {
    throw new CustomError('Department not found', 404);
  }

  // Check if subject with same code already exists
  const existingSubject = await prisma.subject.findFirst({
    where: {
      OR: [
        { code: { equals: code, mode: 'insensitive' } },
        {
          AND: [
            { name: { equals: name, mode: 'insensitive' } },
            { departmentId },
          ],
        },
      ],
    },
  });

  if (existingSubject) {
    throw new CustomError('Subject with this name or code already exists in this department', 400);
  }

  // Create subject
  const subject = await prisma.subject.create({
    data: {
      name,
      code,
      description: description || '',
      credits: parseInt(credits.toString()),
      semester: parseInt(semester.toString()),
      departmentId,
    },
    include: {
      department: true,
    },
  });

  logger.info(`New subject created: ${subject.name} by admin ${req.user?.email}`);

  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: {
      subject,
    },
  });
});

// Update a subject
export const updateSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, code, description, credits, semester, departmentId } = req.body;

  // Validate required fields
  if (!name || !code || !credits || !semester || !departmentId) {
    throw new CustomError('Subject name, code, credits, semester, and department are required', 400);
  }

  // Check if subject exists
  const existingSubject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!existingSubject) {
    throw new CustomError('Subject not found', 404);
  }

  // Check if department exists
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!department) {
    throw new CustomError('Department not found', 404);
  }

  // Check if another subject with same code exists
  const duplicateSubject = await prisma.subject.findFirst({
    where: {
      OR: [
        { code: { equals: code, mode: 'insensitive' } },
        {
          AND: [
            { name: { equals: name, mode: 'insensitive' } },
            { departmentId },
          ],
        },
      ],
      NOT: {
        id,
      },
    },
  });

  if (duplicateSubject) {
    throw new CustomError('Another subject with this name or code already exists in this department', 400);
  }

  // Update subject
  const subject = await prisma.subject.update({
    where: { id },
    data: {
      name,
      code,
      description: description || '',
      credits: parseInt(credits.toString()),
      semester: parseInt(semester.toString()),
      departmentId,
    },
    include: {
      department: true,
    },
  });

  logger.info(`Subject updated: ${subject.name} by admin ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Subject updated successfully',
    data: {
      subject,
    },
  });
});

// Delete a subject
export const deleteSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if subject exists
  const existingSubject = await prisma.subject.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          assignments: true,
          teacherSubjects: true,
        },
      },
    },
  });

  if (!existingSubject) {
    throw new CustomError('Subject not found', 404);
  }

  // Check if subject has associated assignments or teacher assignments
  if (existingSubject._count.assignments > 0 || existingSubject._count.teacherSubjects > 0) {
    throw new CustomError(
      'Cannot delete subject that has associated assignments or teacher assignments',
      400
    );
  }

  // Delete subject
  await prisma.subject.delete({
    where: { id },
  });

  logger.info(`Subject deleted: ${existingSubject.name} by admin ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Subject deleted successfully',
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

  // Send email notification to the teacher
  try {
    await EmailService.sendSubjectAssignmentEmail(
      assignment.teacher.email,
      `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
      assignment.subject.name,
      semester
    );
  } catch (emailError) {
    logger.error('Failed to send subject assignment email:', emailError);
    // We don't want to fail the whole request if the email fails, so we just log the error
  }

  logger.info(`Teacher ${assignment.teacher.firstName} ${assignment.teacher.lastName} assigned to subject ${assignment.subject.name} for ${semester}`);

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