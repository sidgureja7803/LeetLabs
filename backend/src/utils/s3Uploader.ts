import { s3, S3_CONFIG } from '../config/aws';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  key?: string;
  error?: string;
}

export class S3Service {
  /**
   * Upload file to S3 bucket
   */
  static async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads'
  ): Promise<UploadResult> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const uploadParams = {
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private', // Make files private by default
      };

      const result = await s3.upload(uploadParams).promise();

      logger.info(`File uploaded successfully: ${key}`);
      
      return {
        success: true,
        fileUrl: result.Location,
        fileName: file.originalname,
        key: key,
      };
    } catch (error) {
      logger.error('S3 upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload assignment file (PDF/PPT)
   */
  static async uploadAssignmentFile(file: Express.Multer.File): Promise<UploadResult> {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 
                         'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        success: false,
        error: 'Invalid file type. Only PDF and PPT files are allowed for assignments.',
      };
    }

    return this.uploadFile(file, 'assignments');
  }

  /**
   * Upload submission file (code files)
   */
  static async uploadSubmissionFile(file: Express.Multer.File): Promise<UploadResult> {
    // Validate file type for code submissions
    const allowedTypes = [
      'text/plain', 'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++',
      'application/javascript', 'text/html', 'text/css', 'application/json',
      'application/zip', 'application/x-zip-compressed'
    ];

    const allowedExtensions = [
      '.py', '.java', '.c', '.cpp', '.js', '.html', '.css', '.json', '.txt', '.zip',
      '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.kt', '.swift'
    ];

    const fileExtension = '.' + file.originalname.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      return {
        success: false,
        error: 'Invalid file type. Only code files and archives are allowed for submissions.',
      };
    }

    return this.uploadFile(file, 'submissions');
  }

  /**
   * Generate signed URL for private file access
   */
  static async getSignedUrl(key: string, expires: number = S3_CONFIG.signedUrlExpires): Promise<string> {
    try {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Expires: expires,
      });

      return url;
    } catch (error) {
      logger.error('Failed to generate signed URL:', error);
      throw new Error('Failed to generate file access URL');
    }
  }

  /**
   * Delete file from S3
   */
  static async deleteFile(key: string): Promise<boolean> {
    try {
      await s3.deleteObject({
        Bucket: S3_CONFIG.bucket,
        Key: key,
      }).promise();

      logger.info(`File deleted successfully: ${key}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete file:', error);
      return false;
    }
  }

  /**
   * List files in a folder
   */
  static async listFiles(prefix: string): Promise<AWS.S3.ObjectList> {
    try {
      const result = await s3.listObjectsV2({
        Bucket: S3_CONFIG.bucket,
        Prefix: prefix,
      }).promise();

      return result.Contents || [];
    } catch (error) {
      logger.error('Failed to list files:', error);
      return [];
    }
  }
} 