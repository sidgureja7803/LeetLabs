import express from 'express';
import { 
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  likeContent,
  unlikeContent,
  addComment,
  deleteComment,
  recordDownload,
  getSubjects,
  getContentStats
} from '../controllers/contentManagement/contentManagement.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Auth middleware for all routes
router.use(authenticate);

// Content CRUD operations
router.route('/contents')
  .get(getContents)
  .post(createContent);

router.route('/contents/:id')
  .get(getContentById)
  .put(updateContent)
  .delete(deleteContent);

// Engagement routes
router.route('/contents/:id/like')
  .post(likeContent)
  .delete(unlikeContent);

router.route('/contents/:id/comments')
  .post(addComment);

router.route('/contents/:id/comments/:commentId')
  .delete(deleteComment);

router.route('/contents/:id/download')
  .post(recordDownload);

// Subject list
router.route('/subjects')
  .get(getSubjects);

// Stats
router.route('/stats')
  .get(getContentStats);

export default router;
