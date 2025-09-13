"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const searchController_1 = require("../controllers/searchController");
const router = express_1.default.Router();
// Public search routes with optional authentication
router.get('/teachers', auth_1.optionalAuth, searchController_1.searchTeachers);
router.get('/jobs', auth_1.optionalAuth, searchController_1.searchJobs);
router.get('/nearby', auth_1.optionalAuth, searchController_1.getNearbyResults);
router.get('/locations', auth_1.optionalAuth, searchController_1.getLocationSuggestions);
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
router.get('/suggestions', searchController_1.getLocationSuggestions);
exports.default = router;
//# sourceMappingURL=search.js.map