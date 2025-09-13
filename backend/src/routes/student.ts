import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// Placeholder route handlers
const getStudentProfile = (req: any, res: any) => {
  res.json({ success: true, message: 'Get student profile - To be implemented' });
};

const updateStudentProfile = (req: any, res: any) => {
  res.json({ success: true, message: 'Update student profile - To be implemented' });
};

const getStudentStats = (req: any, res: any) => {
  res.json({ success: true, message: 'Get student stats - To be implemented' });
};

// Protected routes - Student only
router.use(protect);
router.use(authorize(UserRole.STUDENT, UserRole.ADMIN));

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/stats', getStudentStats);

export default router;