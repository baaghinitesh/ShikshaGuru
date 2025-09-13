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
const getAllTestimonials = (req, res) => {
    res.json({ success: true, message: 'Get all testimonials - To be implemented' });
};
const getTestimonialById = (req, res) => {
    res.json({ success: true, message: 'Get testimonial by ID - To be implemented' });
};
const createTestimonial = (req, res) => {
    res.json({ success: true, message: 'Create testimonial - To be implemented' });
};
const updateTestimonial = (req, res) => {
    res.json({ success: true, message: 'Update testimonial - To be implemented' });
};
const deleteTestimonial = (req, res) => {
    res.json({ success: true, message: 'Delete testimonial - To be implemented' });
};
const approveTestimonial = (req, res) => {
    res.json({ success: true, message: 'Approve testimonial - To be implemented' });
};
// Public routes
router.get('/', auth_1.optionalAuth, getAllTestimonials);
router.get('/:id', auth_1.optionalAuth, getTestimonialById);
// Protected routes
router.use(auth_1.protect);
// Student routes
router.post('/', (0, auth_1.authorize)(types_1.UserRole.STUDENT, types_1.UserRole.ADMIN), createTestimonial);
router.put('/:id', (0, auth_1.authorize)(types_1.UserRole.STUDENT, types_1.UserRole.ADMIN), updateTestimonial);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.STUDENT, types_1.UserRole.ADMIN), deleteTestimonial);
// Admin routes
router.patch('/:id/approve', (0, auth_1.authorize)(types_1.UserRole.ADMIN), approveTestimonial);
exports.default = router;
//# sourceMappingURL=testimonial.js.map