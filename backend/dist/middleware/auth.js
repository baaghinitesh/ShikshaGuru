"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnership = exports.optionalAuth = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const types_1 = require("../types");
// Protect routes - require authentication
const protect = async (req, res, next) => {
    try {
        let token;
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Make sure token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
            // Get user from token
            const user = await User_1.User.findById(decoded.id).select('+password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.'
                });
            }
            // Check if user is active
            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Account is not active. Please contact support.'
                });
            }
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please log in.'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
exports.authorize = authorize;
// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            try {
                // Verify token
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
                // Get user from token
                const user = await User_1.User.findById(decoded.id);
                if (user && user.status === 'active') {
                    req.user = user;
                }
            }
            catch (error) {
                // Invalid token - continue without user
                console.log('Invalid token in optional auth:', error);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
// Check if user owns resource or is admin
const checkOwnership = (resourceUserField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please log in.'
            });
        }
        // Admin can access everything
        if (req.user.role === types_1.UserRole.ADMIN) {
            return next();
        }
        // Check if user owns the resource
        const resourceUserId = req.body[resourceUserField] || req.params[resourceUserField];
        if (resourceUserId && resourceUserId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        }
        next();
    };
};
exports.checkOwnership = checkOwnership;
//# sourceMappingURL=auth.js.map