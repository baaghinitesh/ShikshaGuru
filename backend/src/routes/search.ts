import express from 'express';
import { optionalAuth } from '../middleware/auth';
import {
  searchTeachers,
  searchJobs,
  getNearbyResults,
  getLocationSuggestions
} from '../controllers/searchController';

const router = express.Router();

// Public search routes with optional authentication
router.get('/teachers', optionalAuth, searchTeachers);
router.get('/jobs', optionalAuth, searchJobs);
router.get('/nearby', optionalAuth, getNearbyResults);
router.get('/locations', optionalAuth, getLocationSuggestions);

// Legacy routes for backward compatibility
router.get('/filters', (req, res) => {
  res.json({
    success: true,
    data: {
      subjects: [
        'Mathematics', 'Science', 'English', 'Hindi', 'Social Studies',
        'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics',
        'Accounting', 'History', 'Geography', 'Political Science'
      ],
      classLevels: [
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
        'Class 11', 'Class 12', 'Undergraduate', 'Postgraduate'
      ],
      teachingModes: ['online', 'offline', 'both'],
      experienceLevels: ['beginner', 'intermediate', 'experienced', 'expert'],
      urgencyLevels: ['immediate', 'within-week', 'within-month', 'flexible'],
      distanceBuckets: [
        { label: '0-5 km', value: 5000 },
        { label: '5-10 km', value: 10000 },
        { label: '10-15 km', value: 15000 },
        { label: '15-25 km', value: 25000 },
        { label: '25+ km', value: 50000 }
      ]
    }
  });
});

router.get('/suggestions', getLocationSuggestions);

export default router;