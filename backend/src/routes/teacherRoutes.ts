import express from 'express';
import {
  createTeacherProfile,
  getTeacherProfile,
  getTeacherByUserId,
  updateTeacherProfile,
  searchTeachers,
  addTeacherReview,
  getTeacherStats,
  toggleTeacherVisibility,
  uploadTeacherDocuments
} from '../controllers/teacherController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/search', searchTeachers);
router.get('/:id', getTeacherProfile);

// Protected routes (require authentication)
router.use(protect);

// Teacher profile management
router.post('/profile', createTeacherProfile);
router.get('/profile/me', getTeacherByUserId);
router.put('/profile', updateTeacherProfile);
router.post('/profile/toggle-visibility', toggleTeacherVisibility);
router.post('/profile/upload-document', uploadTeacherDocuments);

// Teacher stats and dashboard
router.get('/dashboard/stats', getTeacherStats);

// Reviews
router.post('/:teacherId/review', addTeacherReview);

// Job applications
router.post('/jobs/:jobId/apply', (req, res) => {
  // Placeholder for job application
  res.json({
    success: true,
    message: 'Job application submitted successfully',
    data: {
      applicationId: Math.random().toString(36).substring(7),
      jobId: req.params.jobId,
      teacherId: (req as any).user?.id,
      status: 'pending',
      appliedAt: new Date().toISOString()
    }
  });
});

export default router;