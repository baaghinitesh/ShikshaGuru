"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes"));
const student_1 = __importDefault(require("./routes/student"));
const job_1 = __importDefault(require("./routes/job"));
const chat_1 = __importDefault(require("./routes/chat"));
const aiChat_1 = __importDefault(require("./routes/aiChat"));
const blog_1 = __importDefault(require("./routes/blog"));
const testimonial_1 = __importDefault(require("./routes/testimonial"));
const admin_1 = __importDefault(require("./routes/admin"));
const search_1 = __importDefault(require("./routes/search"));
const upload_1 = __importDefault(require("./routes/upload"));
const errorHandler_1 = require("./middleware/errorHandler");
const socketService_1 = require("./services/socketService");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true
    }
});
exports.io = io;
// Connect to database
(0, database_1.default)();
// Initialize Socket.IO
(0, socketService_1.initializeSocket)(io);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// CORS configuration
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        '*.clackypaas.com',
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/teachers', teacherRoutes_1.default);
app.use('/api/students', student_1.default);
app.use('/api/jobs', job_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/ai-chat', aiChat_1.default);
app.use('/api/blogs', blog_1.default);
app.use('/api/testimonials', testimonial_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/search', search_1.default);
app.use('/api/upload', upload_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ShikshaGuru API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// 404 handler - catch all routes that don't match above
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
🚀 ShikshaGuru Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📡 Socket.IO: Enabled
🔗 Frontend URL: ${process.env.FRONTEND_URL}
⏰ Started at: ${new Date().toLocaleString()}
  `);
});
//# sourceMappingURL=index.js.map