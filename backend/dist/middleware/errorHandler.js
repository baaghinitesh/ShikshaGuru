"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
        console.error('Stack:', err.stack);
    }
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { ...error, statusCode: 404, message };
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        const message = `Duplicate field value for ${field}. Please use another value.`;
        error = { ...error, statusCode: 400, message };
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors || {})
            .map((val) => val.message)
            .join(', ');
        error = { ...error, statusCode: 400, message };
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        error = { ...error, statusCode: 401, message };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please log in again.';
        error = { ...error, statusCode: 401, message };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map