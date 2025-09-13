"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const router = express_1.default.Router();
// Placeholder route handlers
const getAllTeachers = (req, res) => {
    res.json({ success: true, message: 'Get all teachers - To be implemented' });
};
const getTeacherById = (req, res) => {
    res.json({ success: true, message: 'Get teacher by ID - To be implemented' });
};
const updateTeacherProfile = (req, res) => {
    res.json({ success: true, message: 'Update teacher profile - To be implemented' });
};
const getTeacherStats = (req, res) => {
    res.json({ success: true, message: 'Get teacher stats - To be implemented' });
};
const getTeacherJobs = (req, res) => {
    res.json({ success: true, message: 'Get teacher jobs - To be implemented' });
};
const applyToJob = (req, res) => {
    res.json({ success: true, message: 'Apply to job - To be implemented' });
};
// Public routes
router.get('/', auth_1.optionalAuth, getAllTeachers);
router.get('/:id', auth_1.optionalAuth, getTeacherById);
// Protected routes - Teacher only
router.use(auth_1.protect);
router.use((0, auth_1.authorize)(types_1.UserRole.TEACHER, types_1.UserRole.ADMIN));
router.put('/profile', updateTeacherProfile);
router.get('/stats/me', getTeacherStats);
router.get('/jobs/available', getTeacherJobs);
router.post('/jobs/:jobId/apply', applyToJob);
exports.default = router;
//# sourceMappingURL=teacher.js.map