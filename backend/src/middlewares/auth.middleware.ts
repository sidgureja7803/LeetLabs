import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Fetch user from database to ensure user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      next();
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without user for optional auth
    next();
  }
}; 