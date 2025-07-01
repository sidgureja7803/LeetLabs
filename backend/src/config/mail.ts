import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

// Create reusable transporter object using SMTP transport
export const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    logger.info('✅ Email service connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ Email service connection failed:', error);
    return false;
  }
}

// Default email configuration
export const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || 'noreply@thapar.edu',
  replyTo: process.env.FROM_EMAIL || 'noreply@thapar.edu',
}; 