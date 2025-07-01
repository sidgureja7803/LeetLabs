import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';
import { CustomError, asyncHandler } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  rollNumber?: string;
  employeeId?: string;
  departmentId?: string;
}

// Helper function to generate JWT
const generateToken = (userId: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new CustomError('JWT_SECRET not configured', 500);
  }
  
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper function to set auth cookie
const setAuthCookie = (res: Response, token: string): void => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('authToken', token, cookieOptions);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    rollNumber,
    employeeId,
    departmentId,
  }: RegisterRequest = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !role) {
    throw new CustomError('All required fields must be provided', 400);
  }

  // Validate role-specific fields
  if (role === 'STUDENT' && !rollNumber) {
    throw new CustomError('Roll number is required for students', 400);
  }

  if ((role === 'TEACHER' || role === 'ADMIN') && !employeeId) {
    throw new CustomError('Employee ID is required for teachers and admin', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new CustomError('User with this email already exists', 400);
  }

  // Check for duplicate roll number or employee ID
  if (rollNumber) {
    const existingRollNumber = await prisma.user.findUnique({
      where: { rollNumber },
    });
    if (existingRollNumber) {
      throw new CustomError('User with this roll number already exists', 400);
    }
  }

  if (employeeId) {
    const existingEmployeeId = await prisma.user.findUnique({
      where: { employeeId },
    });
    if (existingEmployeeId) {
      throw new CustomError('User with this employee ID already exists', 400);
    }
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      rollNumber: role === 'STUDENT' ? rollNumber : null,
      employeeId: (role === 'TEACHER' || role === 'ADMIN') ? employeeId : null,
      departmentId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      rollNumber: true,
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

  // Generate token and set cookie
  const token = generateToken(user.id);
  setAuthCookie(res, token);

  logger.info(`New user registered: ${user.email} (${user.role})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Validate input
  if (!email || !password) {
    throw new CustomError('Email and password are required', 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!user) {
    throw new CustomError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new CustomError('Account is deactivated. Please contact administrator.', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Generate token and set cookie
  const token = generateToken(user.id);
  setAuthCookie(res, token);

  logger.info(`User logged in: ${user.email} (${user.role})`);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('authToken');
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new CustomError('User not authenticated', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      rollNumber: true,
      employeeId: true,
      profileImage: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new CustomError('User not authenticated', 401);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new CustomError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new CustomError('New password must be at least 6 characters long', 400);
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new CustomError('Current password is incorrect', 400);
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword },
  });

  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}); 