import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    logger.info('📴 Database disconnected');
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error);
  }
} 