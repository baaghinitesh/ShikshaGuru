"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resendVerification = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.getMe = exports.googleAuth = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const types_1 = require("../types");
// Generate JWT Token
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'default_secret';
    return jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};
// Send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    res.status(statusCode)
        .cookie('token', token, options)
        .json({
        success: true,
        token,
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            status: user.status,
            profile: user.profile,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified
        }
    });
};
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email, password, phone, role = types_1.UserRole.STUDENT, profile, location } = req.body;
        // Check if user already exists
        const existingUser = await models_1.User.findOne({
            $or: [
                { email },
                ...(phone ? [{ phone }] : [])
            ]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or phone number'
            });
        }
        // Create user
        const user = await models_1.User.create({
            email,
            password,
            phone,
            role,
            profile,
            location,
            status: types_1.UserStatus.ACTIVE
        });
        // Create role-specific profile
        if (role === types_1.UserRole.TEACHER) {
            // Create teacher profile with minimal required fields
            await models_1.Teacher.create({
                userId: user._id,
                profile: {
                    title: 'Mr.',
                    tagline: 'Passionate educator',
                    experience: 0,
                    hourlyRate: { min: 100, max: 500 },
                    languages: ['English'],
                    specializations: []
                },
                subjects: [],
                teachingModes: ['online'],
                availability: [],
                location: location || {
                    type: 'Point',
                    coordinates: [77.1025, 28.7041], // Default to Delhi
                    city: 'Delhi',
                    country: 'India'
                }
            });
        }
        else if (role === types_1.UserRole.STUDENT) {
            // Create student profile
            await models_1.Student.create({
                userId: user._id,
                preferences: {
                    teachingMode: ['online'],
                    budget: { min: 100, max: 1000 },
                    preferredLanguages: ['English']
                },
                location: location || {
                    type: 'Point',
                    coordinates: [77.1025, 28.7041], // Default to Delhi
                    city: 'Delhi',
                    country: 'India'
                }
            });
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        sendTokenResponse(user, 201, res);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        // Check for user
        const user = await models_1.User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check if user is active
        if (user.status !== types_1.UserStatus.ACTIVE) {
            return res.status(401).json({
                success: false,
                message: 'Account is not active. Please contact support.'
            });
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// @desc    Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
    try {
        const { googleId, email, profile, role = types_1.UserRole.STUDENT } = req.body;
        if (!googleId || !email) {
            return res.status(400).json({
                success: false,
                message: 'Google ID and email are required'
            });
        }
        // Check if user exists
        let user = await models_1.User.findOne({
            $or: [{ email }, { googleId }]
        });
        if (user) {
            // User exists, update Google ID if needed
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }
        else {
            // Create new user
            user = await models_1.User.create({
                email,
                googleId,
                role,
                profile: {
                    firstName: profile?.firstName || 'User',
                    lastName: profile?.lastName || '',
                    avatar: profile?.avatar
                },
                status: types_1.UserStatus.ACTIVE,
                emailVerified: true
            });
            // Create role-specific profile
            if (role === types_1.UserRole.TEACHER) {
                await models_1.Teacher.create({
                    userId: user._id,
                    profile: {
                        title: 'Mr.',
                        tagline: 'Passionate educator',
                        experience: 0,
                        hourlyRate: { min: 100, max: 500 },
                        languages: ['English'],
                        specializations: []
                    },
                    subjects: [],
                    teachingModes: ['online'],
                    availability: [],
                    location: {
                        type: 'Point',
                        coordinates: [77.1025, 28.7041],
                        city: 'Delhi',
                        country: 'India'
                    }
                });
            }
            else if (role === types_1.UserRole.STUDENT) {
                await models_1.Student.create({
                    userId: user._id,
                    preferences: {
                        teachingMode: ['online'],
                        budget: { min: 100, max: 1000 },
                        preferredLanguages: ['English']
                    },
                    location: {
                        type: 'Point',
                        coordinates: [77.1025, 28.7041],
                        city: 'Delhi',
                        country: 'India'
                    }
                });
            }
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.googleAuth = googleAuth;
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {};
        // Allow updating specific fields
        const allowedFields = [
            'profile.firstName',
            'profile.lastName',
            'profile.avatar',
            'profile.dateOfBirth',
            'profile.gender',
            'profile.bio',
            'phone',
            'location',
            'preferences'
        ];
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                fieldsToUpdate[key] = req.body[key];
            }
        });
        const user = await models_1.User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { currentPassword, newPassword } = req.body;
        // Get current user with password
        const user = await models_1.User.findById(req.user._id).select('+password');
        if (!user || !user.password) {
            return res.status(400).json({
                success: false,
                message: 'User not found or password not set'
            });
        }
        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        // Update password
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        // For now, just return success message
        // In production, implement email sending
        res.status(200).json({
            success: true,
            message: 'Reset password email sent (feature not implemented yet)'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        // For now, just return success message
        // In production, implement token verification and password reset
        res.status(200).json({
            success: true,
            message: 'Password reset successfully (feature not implemented yet)'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
    try {
        // For now, just return success message
        // In production, implement email verification
        res.status(200).json({
            success: true,
            message: 'Email verified successfully (feature not implemented yet)'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
    try {
        // For now, just return success message
        // In production, implement email sending
        res.status(200).json({
            success: true,
            message: 'Verification email sent (feature not implemented yet)'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerification = resendVerification;
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map