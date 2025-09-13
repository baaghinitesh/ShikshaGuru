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
const getAllBlogs = (req, res) => {
    res.json({ success: true, message: 'Get all blogs - To be implemented' });
};
const getBlogBySlug = (req, res) => {
    res.json({ success: true, message: 'Get blog by slug - To be implemented' });
};
const createBlog = (req, res) => {
    res.json({ success: true, message: 'Create blog - To be implemented' });
};
const updateBlog = (req, res) => {
    res.json({ success: true, message: 'Update blog - To be implemented' });
};
const deleteBlog = (req, res) => {
    res.json({ success: true, message: 'Delete blog - To be implemented' });
};
const likeBlog = (req, res) => {
    res.json({ success: true, message: 'Like blog - To be implemented' });
};
const commentOnBlog = (req, res) => {
    res.json({ success: true, message: 'Comment on blog - To be implemented' });
};
// Public routes
router.get('/', auth_1.optionalAuth, getAllBlogs);
router.get('/:slug', auth_1.optionalAuth, getBlogBySlug);
// Protected routes
router.use(auth_1.protect);
// User routes
router.post('/:id/like', likeBlog);
router.post('/:id/comment', commentOnBlog);
// Admin routes
router.post('/', (0, auth_1.authorize)(types_1.UserRole.ADMIN), createBlog);
router.put('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN), updateBlog);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN), deleteBlog);
exports.default = router;
//# sourceMappingURL=blog.js.map