import AWS from 'aws-sdk';
import { logger } from '../utils/logger';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

export const s3 = new AWS.S3();

export const S3_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET || 'thapar-virtual-labs-files',
  region: process.env.AWS_REGION || 'us-east-1',
  signedUrlExpires: 60 * 60, // 1 hour
};

// Test S3 connection
export async function testS3Connection() {
  try {
    await s3.headBucket({ Bucket: S3_CONFIG.bucket }).promise();
    logger.info('✅ S3 connection successful');
    return true;
  } catch (error) {
    logger.error('❌ S3 connection failed:', error);
    return false;
  }
} 