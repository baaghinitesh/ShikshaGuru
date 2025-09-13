import express from 'express';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  commentOnBlog,
  getBlogCategories,
  getBlogTags
} from '../controllers/blogController';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllBlogs);
router.get('/categories', getBlogCategories);
router.get('/tags', getBlogTags);
router.get('/:slug', optionalAuth, getBlogBySlug);

// User routes (require authentication)
router.post('/:id/like', protect, likeBlog);
router.post('/:id/comment', protect, commentOnBlog);

// Admin routes
router.post('/', protect, authorize(UserRole.ADMIN), createBlog);
router.put('/:id', protect, authorize(UserRole.ADMIN), updateBlog);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteBlog);

export default router;