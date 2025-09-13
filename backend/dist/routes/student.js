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
const getStudentProfile = (req, res) => {
    res.json({ success: true, message: 'Get student profile - To be implemented' });
};
const updateStudentProfile = (req, res) => {
    res.json({ success: true, message: 'Update student profile - To be implemented' });
};
const getStudentStats = (req, res) => {
    res.json({ success: true, message: 'Get student stats - To be implemented' });
};
// Protected routes - Student only
router.use(auth_1.protect);
router.use((0, auth_1.authorize)(types_1.UserRole.STUDENT, types_1.UserRole.ADMIN));
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/stats', getStudentStats);
exports.default = router;
//# sourceMappingURL=student.js.map