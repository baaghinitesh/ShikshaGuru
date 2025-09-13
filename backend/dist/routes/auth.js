"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Validation rules
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('profile.firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    (0, express_validator_1.body)('profile.lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    (0, express_validator_1.body)('role').optional().isIn(['student', 'teacher']).withMessage('Role must be student or teacher')
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
const passwordValidation = [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
// Public routes
router.post('/register', registerValidation, authController_1.register);
router.post('/login', loginValidation, authController_1.login);
router.post('/google', authController_1.googleAuth);
router.post('/forgot-password', forgotPasswordValidation, authController_1.forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, authController_1.resetPassword);
router.get('/verify-email/:token', authController_1.verifyEmail);
router.post('/resend-verification', forgotPasswordValidation, authController_1.resendVerification);
// Protected routes
router.use(auth_1.protect);
router.get('/me', authController_1.getMe);
router.put('/profile', authController_1.updateProfile);
router.put('/change-password', passwordValidation, authController_1.changePassword);
router.post('/logout', authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map