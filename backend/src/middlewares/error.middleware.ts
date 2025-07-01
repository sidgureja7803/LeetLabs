import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${error.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new CustomError(message, 404);
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new CustomError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new CustomError(message, 400);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    switch (prismaError.code) {
      case 'P2002':
        error = new CustomError('Duplicate entry. This record already exists.', 400);
        break;
      case 'P2014':
        error = new CustomError('Invalid ID provided.', 400);
        break;
      case 'P2003':
        error = new CustomError('Invalid reference. Related record not found.', 400);
        break;
      case 'P2025':
        error = new CustomError('Record not found.', 404);
        break;
      default:
        error = new CustomError('Database error occurred.', 500);
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new CustomError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new CustomError('Token expired', 401);
  }

  // File upload errors
  if (err.name === 'MulterError') {
    const multerError = err as any;
    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        error = new CustomError('File too large', 400);
        break;
      case 'LIMIT_FILE_COUNT':
        error = new CustomError('Too many files', 400);
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error = new CustomError('Unexpected file field', 400);
        break;
      default:
        error = new CustomError('File upload error', 400);
    }
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    error = new CustomError('Too many requests. Please try again later.', 429);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next); 