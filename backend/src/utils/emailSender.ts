import { transporter, EmailOptions, EMAIL_CONFIG } from '../config/mail';
import { logger } from './logger';

export class EmailService {
  static async sendAssignmentNotification(
    teacherEmail: string,
    teacherName: string,
    assignmentTitle: string,
    subjectName: string,
    dueDate: Date
  ): Promise<boolean> {
    try {
      const emailOptions: EmailOptions = {
        to: teacherEmail,
        subject: `New Assignment Created: ${assignmentTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1>Thapar Virtual Labs</h1>
            </div>
            <div style="padding: 20px; background-color: #f8fafc;">
              <h2>New Assignment Created</h2>
              <p>Dear ${teacherName},</p>
              <p>A new assignment has been created:</p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <strong>Assignment:</strong> ${assignmentTitle}<br>
                <strong>Subject:</strong> ${subjectName}<br>
                <strong>Due Date:</strong> ${dueDate.toLocaleDateString()}<br>
              </div>
              <p>Please log in to the platform to view details and manage submissions.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.FRONTEND_URL}" 
                   style="background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Access Platform
                </a>
              </div>
            </div>
            <div style="background-color: #374151; color: white; padding: 10px; text-align: center; font-size: 12px;">
              <p>Thapar Institute of Engineering and Technology</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        ...emailOptions,
      });

      logger.info(`Assignment notification sent to ${teacherEmail}`);
      return true;
    } catch (error) {
      logger.error('Failed to send assignment notification:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    role: string,
    temporaryPassword?: string
  ): Promise<boolean> {
    try {
      const emailOptions: EmailOptions = {
        to: userEmail,
        subject: 'Welcome to Thapar Virtual Labs',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1>Welcome to Thapar Virtual Labs</h1>
            </div>
            <div style="padding: 20px; background-color: #f8fafc;">
              <h2>Account Created Successfully</h2>
              <p>Dear ${userName},</p>
              <p>Your account has been created with the following details:</p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <strong>Email:</strong> ${userEmail}<br>
                <strong>Role:</strong> ${role}<br>
                ${temporaryPassword ? `<strong>Temporary Password:</strong> ${temporaryPassword}<br>` : ''}
              </div>
              ${temporaryPassword ? '<p><strong>Please change your password after first login.</strong></p>' : ''}
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.FRONTEND_URL}" 
                   style="background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Login to Platform
                </a>
              </div>
            </div>
            <div style="background-color: #374151; color: white; padding: 10px; text-align: center; font-size: 12px;">
              <p>Thapar Institute of Engineering and Technology</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        ...emailOptions,
      });

      logger.info(`Welcome email sent to ${userEmail}`);
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

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
          html: htmlContent,
        });
        logger.info(`Bulk email sent to ${recipient}`);
      } catch (error) {
        logger.error(`Failed to send bulk email to ${recipient}:`, error);
        failed.push(recipient);
      }
    }

    return {
      success: failed.length === 0,
      failed,
    };
  }
} 