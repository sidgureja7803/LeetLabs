import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { EmailService } from '../utils/emailSender';
import { logger } from '../utils/logger';
import { body, validationResult } from 'express-validator';
import { CustomError, asyncHandler } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

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

// Generate verification token
const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate JWT token
const generateJWTToken = (userId: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
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

export const register = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

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

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with pending verification
    const userData: any = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      rollNumber: role === 'STUDENT' ? rollNumber : null,
      employeeId: (role === 'TEACHER' || role === 'ADMIN') ? employeeId : null,
      departmentId,
      isActive: false,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    };

    // Create user
    const user = await prisma.user.create({
      data: userData,
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

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await EmailService.sendVerificationEmail(email, `${firstName} ${lastName}`, verificationUrl);

    logger.info(`New user registered: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully! Please check your email to verify your account.',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        } as any
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      } as any
    });

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login to your account.'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export const resendVerification = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if ((user as any).isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      } as any
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await EmailService.sendVerificationEmail(email, user.firstName, verificationUrl);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        department: true
      }
    });

    if (!user) {
      throw new CustomError('Invalid email or password', 401);
    }

    if (!(user as any).isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true
      });
    }

    if (!user.isActive) {
      throw new CustomError('Account is deactivated. Please contact administrator.', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() } as any
    });

    // Generate token
    const token = generateJWTToken(user.id);

    // Set cookie
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
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      } as any
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await EmailService.sendPasswordResetEmail(email, user.firstName, resetUrl);

    logger.info(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        } as any
      } as any
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      } as any
    });

    logger.info(`Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
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

export const logout = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  res.clearCookie('authToken');
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
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

// Validation middleware
export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['STUDENT', 'TEACHER', 'ADMIN']).withMessage('Invalid role'),
  body('departmentId').notEmpty().withMessage('Department is required'),
  body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('rollNumber').optional().trim().isLength({ min: 1 }).withMessage('Roll number is required for students')
]; 