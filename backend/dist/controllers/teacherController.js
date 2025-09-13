"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTeacherDocuments = exports.toggleTeacherVisibility = exports.getTeacherStats = exports.addTeacherReview = exports.searchTeachers = exports.updateTeacherProfile = exports.getTeacherByUserId = exports.getTeacherProfile = exports.createTeacherProfile = void 0;
const Teacher_1 = require("../models/Teacher");
const User_1 = require("../models/User");
// Create teacher profile
const createTeacherProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Check if user already has a teacher profile
        const existingTeacher = await Teacher_1.Teacher.findOne({ userId });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher profile already exists' });
        }
        // Create teacher profile
        const teacherData = {
            userId,
            ...req.body,
            isVerified: false, // Default to unverified
            isActive: true,
            rating: {
                average: 0,
                count: 0
            }
        };
        const teacher = new Teacher_1.Teacher(teacherData);
        await teacher.save();
        // Update user role to teacher
        await User_1.User.findByIdAndUpdate(userId, { role: 'teacher' });
        res.status(201).json({
            message: 'Teacher profile created successfully',
            teacher: teacher
        });
    }
    catch (error) {
        console.error('Error creating teacher profile:', error);
        res.status(500).json({
            message: 'Error creating teacher profile',
            error: error.message
        });
    }
};
exports.createTeacherProfile = createTeacherProfile;
// Get teacher profile by ID
const getTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher_1.Teacher.findById(id)
            .populate('userId', 'name email')
            .populate('reviews.studentId', 'name');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json({ teacher });
    }
    catch (error) {
        console.error('Error fetching teacher profile:', error);
        res.status(500).json({
            message: 'Error fetching teacher profile',
            error: error.message
        });
    }
};
exports.getTeacherProfile = getTeacherProfile;
// Get teacher profile by user ID
const getTeacherByUserId = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const teacher = await Teacher_1.Teacher.findOne({ userId })
            .populate('userId', 'name email')
            .populate('reviews.studentId', 'name');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }
        res.json({ teacher });
    }
    catch (error) {
        console.error('Error fetching teacher profile:', error);
        res.status(500).json({
            message: 'Error fetching teacher profile',
            error: error.message
        });
    }
};
exports.getTeacherByUserId = getTeacherByUserId;
// Update teacher profile
const updateTeacherProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const teacher = await Teacher_1.Teacher.findOneAndUpdate({ userId }, { ...req.body, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }
        res.json({
            message: 'Teacher profile updated successfully',
            teacher
        });
    }
    catch (error) {
        console.error('Error updating teacher profile:', error);
        res.status(500).json({
            message: 'Error updating teacher profile',
            error: error.message
        });
    }
};
exports.updateTeacherProfile = updateTeacherProfile;
// Search teachers
const searchTeachers = async (req, res) => {
    try {
        const { subjects, classLevels, location, minRate, maxRate, teachingMode, languages, rating, sortBy = 'rating.average', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
        // Build search query
        const query = { isActive: true };
        if (subjects) {
            const subjectsArray = Array.isArray(subjects) ? subjects : [subjects];
            query.subjects = { $in: subjectsArray };
        }
        if (classLevels) {
            const levelsArray = Array.isArray(classLevels) ? classLevels : [classLevels];
            query.classLevels = { $in: levelsArray };
        }
        if (teachingMode) {
            const modesArray = Array.isArray(teachingMode) ? teachingMode : [teachingMode];
            query.teachingMode = { $in: modesArray };
        }
        if (languages) {
            const languagesArray = Array.isArray(languages) ? languages : [languages];
            query.languages = { $in: languagesArray };
        }
        if (minRate || maxRate) {
            query['hourlyRate.min'] = {};
            if (minRate)
                query['hourlyRate.min'].$gte = parseInt(minRate);
            if (maxRate)
                query['hourlyRate.max'] = { $lte: parseInt(maxRate) };
        }
        if (rating) {
            query['rating.average'] = { $gte: parseFloat(rating) };
        }
        // Location-based search (if coordinates provided)
        if (location) {
            const [longitude, latitude] = location.split(',').map(Number);
            if (longitude && latitude) {
                query.location = {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: 50000 // 50km radius
                    }
                };
            }
        }
        // Execute search with pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const teachers = await Teacher_1.Teacher.find(query)
            .populate('userId', 'name email')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limitNum);
        const totalTeachers = await Teacher_1.Teacher.countDocuments(query);
        const totalPages = Math.ceil(totalTeachers / limitNum);
        res.json({
            teachers,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalTeachers,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });
    }
    catch (error) {
        console.error('Error searching teachers:', error);
        res.status(500).json({
            message: 'Error searching teachers',
            error: error.message
        });
    }
};
exports.searchTeachers = searchTeachers;
// Add review to teacher
const addTeacherReview = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { rating, comment, subject } = req.body;
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const teacher = await Teacher_1.Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        // Check if student already reviewed this teacher
        const existingReview = teacher.reviews.find(review => review.studentId.toString() === studentId);
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this teacher' });
        }
        // Add review
        const newReview = {
            studentId,
            rating,
            comment,
            subject,
            date: new Date()
        };
        teacher.reviews.push(newReview);
        // Update rating average
        const totalRating = teacher.reviews.reduce((sum, review) => sum + review.rating, 0);
        teacher.rating.average = totalRating / teacher.reviews.length;
        teacher.rating.count = teacher.reviews.length;
        await teacher.save();
        res.json({
            message: 'Review added successfully',
            teacher
        });
    }
    catch (error) {
        console.error('Error adding teacher review:', error);
        res.status(500).json({
            message: 'Error adding teacher review',
            error: error.message
        });
    }
};
exports.addTeacherReview = addTeacherReview;
// Get teacher stats (for dashboard)
const getTeacherStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const teacher = await Teacher_1.Teacher.findOne({ userId });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }
        // TODO: Get actual stats from applications, messages, etc.
        const stats = {
            profileViews: teacher.profileViews || 0,
            applicationsSent: 0, // TODO: Count from Job applications
            acceptedApplications: 0, // TODO: Count accepted applications
            activeChats: 0, // TODO: Count active conversations
            totalEarnings: 0, // TODO: Calculate from completed sessions
            rating: teacher.rating.average,
            totalReviews: teacher.rating.count
        };
        res.json({ stats });
    }
    catch (error) {
        console.error('Error fetching teacher stats:', error);
        res.status(500).json({
            message: 'Error fetching teacher stats',
            error: error.message
        });
    }
};
exports.getTeacherStats = getTeacherStats;
// Toggle teacher profile visibility
const toggleTeacherVisibility = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const teacher = await Teacher_1.Teacher.findOne({ userId });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }
        teacher.isActive = !teacher.isActive;
        await teacher.save();
        res.json({
            message: `Teacher profile ${teacher.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: teacher.isActive
        });
    }
    catch (error) {
        console.error('Error toggling teacher visibility:', error);
        res.status(500).json({
            message: 'Error toggling teacher visibility',
            error: error.message
        });
    }
};
exports.toggleTeacherVisibility = toggleTeacherVisibility;
// Upload teacher documents
const uploadTeacherDocuments = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { documentType, documentUrl } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const teacher = await Teacher_1.Teacher.findOne({ userId });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }
        // Update document based on type
        switch (documentType) {
            case 'aadharCard':
                teacher.documents.aadharCard = documentUrl;
                break;
            case 'panCard':
                teacher.documents.panCard = documentUrl;
                break;
            case 'educationCertificate':
                teacher.documents.educationCertificates.push(documentUrl);
                break;
            case 'experienceCertificate':
                teacher.documents.experienceCertificates.push(documentUrl);
                break;
            case 'profilePhoto':
                teacher.profilePhoto = documentUrl;
                break;
            default:
                teacher.documents.otherDocuments.push(documentUrl);
        }
        await teacher.save();
        res.json({
            message: 'Document uploaded successfully',
            teacher
        });
    }
    catch (error) {
        console.error('Error uploading teacher document:', error);
        res.status(500).json({
            message: 'Error uploading teacher document',
            error: error.message
        });
    }
};
exports.uploadTeacherDocuments = uploadTeacherDocuments;
//# sourceMappingURL=teacherController.js.map