import { transporter, EmailOptions, EMAIL_CONFIG } from '../config/mail';
import { logger } from './logger';

export class EmailService {
  // Base email template
  private static getBaseTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 5px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
          .btn { display: inline-block; padding: 12px 30px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .btn:hover { background-color: #1d4ed8; }
          .alert { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; }
          .success { background-color: #d1fae5; border: 1px solid #10b981; }
          .info { background-color: #dbeafe; border: 1px solid #3b82f6; }
          .warning { background-color: #fed7d7; border: 1px solid #f56565; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thapar Virtual Labs</h1>
            <p>Thapar Institute of Engineering and Technology</p>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              This email was sent by Thapar Virtual Labs System<br>
              © 2024 Thapar Institute of Engineering and Technology
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Email verification
  static async sendVerificationEmail(email: string, name: string, verificationUrl: string): Promise<boolean> {
    try {
      const content = `
        <h2>Welcome to Thapar Virtual Labs!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering with Thapar Virtual Labs. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="btn">Verify Email Address</a>
        </div>
        
        <div class="alert warning">
          <strong>Important:</strong> This verification link will expire in 10 minutes for security reasons.
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
        
        <p>If you didn't create an account with us, please ignore this email.</p>
        
        <p>Best regards,<br>Thapar Virtual Labs Team</p>
      `;

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: email,
        subject: 'Verify Your Email - Thapar Virtual Labs',
        html: this.getBaseTemplate('Email Verification', content)
      });

      logger.info(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      return false;
    }
  }

  // Password reset
  static async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<boolean> {
    try {
      const content = `
        <h2>Password Reset Request</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password for your Thapar Virtual Labs account. If you made this request, click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        
        <div class="alert warning">
          <strong>Security Notice:</strong> This password reset link will expire in 15 minutes.
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
        
        <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        
        <p>For security reasons, we recommend:</p>
        <ul>
          <li>Using a strong, unique password</li>
          <li>Not sharing your password with anyone</li>
          <li>Logging out of shared computers</li>
        </ul>
        
        <p>Best regards,<br>Thapar Virtual Labs Team</p>
      `;

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: email,
        subject: 'Password Reset - Thapar Virtual Labs',
        html: this.getBaseTemplate('Password Reset', content)
      });

      logger.info(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Assignment notification
  static async sendAssignmentNotification(
    email: string,
    studentName: string,
    assignmentTitle: string,
    subjectName: string,
    dueDate: Date,
    teacherName: string
  ): Promise<boolean> {
    try {
      const content = `
        <h2>New Assignment Posted</h2>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>A new assignment has been posted in your course:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">${assignmentTitle}</h3>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subjectName}</p>
          <p style="margin: 5px 0;"><strong>Teacher:</strong> ${teacherName}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/student/assignments" class="btn">View Assignment</a>
        </div>
        
        <p>Please make sure to submit your assignment before the due date to avoid any penalties.</p>
        
        <p>Best regards,<br>Thapar Virtual Labs Team</p>
      `;

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: email,
        subject: `New Assignment: ${assignmentTitle} - ${subjectName}`,
        html: this.getBaseTemplate('New Assignment', content)
      });

      logger.info(`Assignment notification sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send assignment notification:', error);
      return false;
    }
  }

  // Quiz notification
  static async sendQuizNotification(
    email: string,
    studentName: string,
    quizTitle: string,
    subjectName: string,
    scheduledDate: Date,
    duration: number,
    teacherName: string
  ): Promise<boolean> {
    try {
      const content = `
        <h2>Quiz Scheduled</h2>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>A quiz has been scheduled for your course:</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #0ea5e9;">${quizTitle}</h3>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subjectName}</p>
          <p style="margin: 5px 0;"><strong>Teacher:</strong> ${teacherName}</p>
          <p style="margin: 5px 0;"><strong>Scheduled:</strong> ${scheduledDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration} minutes</p>
        </div>
        
        <div class="alert info">
          <strong>Note:</strong> Make sure you're available at the scheduled time. The quiz will start automatically and cannot be paused once begun.
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/student/quizzes" class="btn">View Quiz Details</a>
        </div>
        
        <p>Best regards,<br>Thapar Virtual Labs Team</p>
      `;

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: email,
        subject: `Quiz Scheduled: ${quizTitle} - ${subjectName}`,
        html: this.getBaseTemplate('Quiz Notification', content)
      });

      logger.info(`Quiz notification sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send quiz notification:', error);
      return false;
    }
  }

  // Grade notification
  static async sendGradeNotification(
    email: string,
    studentName: string,
    assignmentTitle: string,
    grade: number,
    maxMarks: number,
    feedback?: string
  ): Promise<boolean> {
    try {
      const percentage = (grade / maxMarks) * 100;
      const gradeClass = percentage >= 70 ? 'success' : percentage >= 50 ? 'info' : 'warning';
      
      const content = `
        <h2>Assignment Graded</h2>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>Your assignment has been graded and is now available for review:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #10b981;">${assignmentTitle}</h3>
          <div style="display: flex; align-items: center; margin: 10px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #1e40af;">${grade}/${maxMarks}</span>
            <span style="margin-left: 15px; font-size: 18px; color: #64748b;">(${percentage.toFixed(1)}%)</span>
          </div>
        </div>
        
        ${feedback ? `
        <div class="alert ${gradeClass}">
          <strong>Teacher's Feedback:</strong><br>
          ${feedback}
        </div>
        ` : ''}
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/student/submissions" class="btn">View Detailed Feedback</a>
        </div>
        
        <p>Keep up the great work!</p>
        
        <p>Best regards,<br>Thapar Virtual Labs Team</p>
      `;

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: email,
        subject: `Assignment Graded: ${assignmentTitle}`,
        html: this.getBaseTemplate('Grade Notification', content)
      });

      logger.info(`Grade notification sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send grade notification:', error);
      return false;
    }
  }

  // Welcome email for new users
  static async sendWelcomeEmail(
    email: string,
    name: string,
    role: string,
    temporaryPassword?: string
  ): Promise<boolean> {
    try {
      const content = `
        <h2>Welcome to Thapar Virtual Labs!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your account has been successfully created with the following details:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
          ${temporaryPassword ? `<p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>` : ''}
        </div>
        
        ${temporaryPassword ? `
        <div class="alert warning">
          <strong>Security Notice:</strong> Please change your password after your first login for security purposes.
        </div>
        ` : ''}
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/login" class="btn">Login to Your Account</a>
        </div>
        
        <h3>Getting Started:</h3>
        <ul>
          <li>Complete your profile information</li>
          <li>Explore the platform features</li>
          <li>Contact support if you need any assistance</li>
        </ul>
        
        <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
        
        <p>Best regards,<br>Thapar Virtual Labs Team</p>
      `;

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: email,
        subject: 'Welcome to Thapar Virtual Labs!',
        html: this.getBaseTemplate('Welcome', content)
      });

      logger.info(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

  // Bulk email sending
  static async sendBulkEmail(
    recipients: string[],
    subject: string,
    htmlContent: string
  ): Promise<{ success: boolean; failed: string[] }> {
    const failed: string[] = [];

    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: EMAIL_CONFIG.from,
          to: recipient,
          subject,
          html: this.getBaseTemplate(subject, htmlContent)
        });
        logger.info(`Bulk email sent to ${recipient}`);
      } catch (error) {
        logger.error(`Failed to send bulk email to ${recipient}:`, error);
        failed.push(recipient);
      }
    }

    return {
      success: failed.length === 0,
      failed
    };
  }

  // System notification
  static async sendSystemNotification(
    email: string,
    name: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'error' = 'info'
  ): Promise<boolean> {
    try {
      const content = `
        <h2>${title}</h2>
        <p>Hello <strong>${name}</strong>,</p>
        
        <div class="alert ${type}">
          ${message}
        </div>
        
        <p>If you have any questions, please contact the system administrator.</p>
        
        <p>Best regards,<br>Thapar Virtual Labs Team</p>
      `;

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: email,
        subject: `${title} - Thapar Virtual Labs`,
        html: this.getBaseTemplate(title, content)
      });

      logger.info(`System notification sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send system notification:', error);
      return false;
    }
  }
} 