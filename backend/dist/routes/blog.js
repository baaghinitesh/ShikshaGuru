"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const blogController_1 = require("../controllers/blogController");
const router = express_1.default.Router();
// Public routes
router.get('/', auth_1.optionalAuth, blogController_1.getAllBlogs);
router.get('/categories', blogController_1.getBlogCategories);
router.get('/tags', blogController_1.getBlogTags);
router.get('/:slug', auth_1.optionalAuth, blogController_1.getBlogBySlug);
// User routes (require authentication)
router.post('/:id/like', auth_1.protect, blogController_1.likeBlog);
router.post('/:id/comment', auth_1.protect, blogController_1.commentOnBlog);
// Admin routes
router.post('/', auth_1.protect, (0, auth_1.authorize)(types_1.UserRole.ADMIN), blogController_1.createBlog);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)(types_1.UserRole.ADMIN), blogController_1.updateBlog);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)(types_1.UserRole.ADMIN), blogController_1.deleteBlog);
exports.default = router;
//# sourceMappingURL=blog.js.map