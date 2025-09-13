"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teacherController_1 = require("../controllers/teacherController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/search', teacherController_1.searchTeachers);
router.get('/:id', teacherController_1.getTeacherProfile);
// Protected routes (require authentication)
router.use(auth_1.protect);
// Teacher profile management
router.post('/profile', teacherController_1.createTeacherProfile);
router.get('/profile/me', teacherController_1.getTeacherByUserId);
router.put('/profile', teacherController_1.updateTeacherProfile);
router.post('/profile/toggle-visibility', teacherController_1.toggleTeacherVisibility);
router.post('/profile/upload-document', teacherController_1.uploadTeacherDocuments);
// Teacher stats and dashboard
router.get('/dashboard/stats', teacherController_1.getTeacherStats);
// Reviews
router.post('/:teacherId/review', teacherController_1.addTeacherReview);
// Job applications
router.post('/jobs/:jobId/apply', (req, res) => {
    // Placeholder for job application
    res.json({
        success: true,
        message: 'Job application submitted successfully',
        data: {
            applicationId: Math.random().toString(36).substring(7),
            jobId: req.params.jobId,
            teacherId: req.user?.id,
            status: 'pending',
            appliedAt: new Date().toISOString()
        }
    });
});
exports.default = router;
//# sourceMappingURL=teacherRoutes.js.map