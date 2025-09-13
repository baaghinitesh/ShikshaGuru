"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocationSuggestions = exports.getNearbyResults = exports.searchJobs = exports.searchTeachers = void 0;
const Teacher_1 = require("../models/Teacher");
const Job_1 = require("../models/Job");
// Distance buckets for search results
const DISTANCE_BUCKETS = [
    { label: '0-5 km', min: 0, max: 5000 },
    { label: '5-10 km', min: 5000, max: 10000 },
    { label: '10-15 km', min: 10000, max: 15000 },
    { label: '15-25 km', min: 15000, max: 25000 },
    { label: '25+ km', min: 25000, max: 100000 }
];
// Search teachers with geospatial filtering
const searchTeachers = async (req, res) => {
    try {
        const { subject, classLevel, teachingMode, experience, minRating = 0, maxDistance = 25000, // Default 25km
        latitude, longitude, minBudget, maxBudget, gender, availability, qualifications, languages, page = 1, limit = 20, sortBy = 'distance' } = req.query;
        // Build the search query
        const searchQuery = {
            isActive: true,
            isVerified: true
        };
        // Subject filter
        if (subject) {
            searchQuery['expertise.subjects'] = {
                $elemMatch: {
                    name: { $regex: subject, $options: 'i' }
                }
            };
        }
        // Class level filter
        if (classLevel) {
            searchQuery['expertise.classLevels'] = {
                $in: [classLevel]
            };
        }
        // Teaching mode filter
        if (teachingMode && teachingMode !== 'both') {
            searchQuery['preferences.teachingMode'] = teachingMode;
        }
        // Experience filter
        if (experience) {
            const experienceMap = {
                'beginner': { $lt: 2 },
                'intermediate': { $gte: 2, $lt: 5 },
                'experienced': { $gte: 5, $lt: 10 },
                'expert': { $gte: 10 }
            };
            if (experienceMap[experience]) {
                searchQuery['experience.totalYears'] = experienceMap[experience];
            }
        }
        // Rating filter
        if (minRating > 0) {
            searchQuery['rating.average'] = { $gte: parseFloat(minRating) };
        }
        // Budget filter
        if (minBudget || maxBudget) {
            const budgetQuery = {};
            if (minBudget)
                budgetQuery.$gte = parseInt(minBudget);
            if (maxBudget)
                budgetQuery.$lte = parseInt(maxBudget);
            searchQuery['pricing.hourlyRate'] = budgetQuery;
        }
        // Gender filter
        if (gender && gender !== 'any') {
            searchQuery['personalInfo.gender'] = gender;
        }
        // Qualifications filter
        if (qualifications && Array.isArray(qualifications)) {
            searchQuery['education.qualifications.degree'] = {
                $in: qualifications
            };
        }
        // Languages filter
        if (languages && Array.isArray(languages)) {
            searchQuery['personalInfo.languages'] = {
                $in: languages
            };
        }
        let pipeline = [];
        // Add geospatial search if coordinates provided
        if (latitude && longitude) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    distanceField: 'distance',
                    maxDistance: parseInt(maxDistance),
                    spherical: true,
                    query: searchQuery
                }
            });
        }
        else {
            pipeline.push({ $match: searchQuery });
        }
        // Add sorting
        if (sortBy === 'rating') {
            pipeline.push({ $sort: { 'rating.average': -1 } });
        }
        else if (sortBy === 'experience') {
            pipeline.push({ $sort: { 'experience.totalYears': -1 } });
        }
        else if (sortBy === 'price-low') {
            pipeline.push({ $sort: { 'pricing.hourlyRate': 1 } });
        }
        else if (sortBy === 'price-high') {
            pipeline.push({ $sort: { 'pricing.hourlyRate': -1 } });
        }
        else if (latitude && longitude) {
            // Distance sorting is handled by $geoNear
        }
        else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }
        // Add pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });
        // Execute search
        const teachers = await Teacher_1.Teacher.aggregate(pipeline);
        // Get total count for pagination
        const totalPipeline = [...pipeline];
        totalPipeline.pop(); // Remove limit
        totalPipeline.pop(); // Remove skip
        totalPipeline.push({ $count: 'total' });
        const totalResult = await Teacher_1.Teacher.aggregate(totalPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;
        // Group results by distance buckets if location provided
        let distanceBuckets = [];
        if (latitude && longitude) {
            distanceBuckets = DISTANCE_BUCKETS.map(bucket => ({
                ...bucket,
                count: teachers.filter((teacher) => teacher.distance >= bucket.min && teacher.distance < bucket.max).length
            }));
        }
        res.json({
            success: true,
            data: {
                teachers: teachers.map((teacher) => ({
                    ...teacher,
                    distance: teacher.distance ? Math.round(teacher.distance) : null
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                distanceBuckets,
                searchParams: {
                    subject,
                    classLevel,
                    teachingMode,
                    experience,
                    minRating,
                    maxDistance,
                    location: latitude && longitude ? { latitude, longitude } : null
                }
            }
        });
    }
    catch (error) {
        console.error('Error searching teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search teachers',
            error: error.message
        });
    }
};
exports.searchTeachers = searchTeachers;
// Search jobs with geospatial filtering
const searchJobs = async (req, res) => {
    try {
        const { subject, classLevel, teachingMode, urgency, maxDistance = 25000, latitude, longitude, minBudget, maxBudget, experience, gender, page = 1, limit = 20, sortBy = 'distance' } = req.query;
        // Build the search query
        const searchQuery = {
            status: 'active',
            expiresAt: { $gte: new Date() }
        };
        // Subject filter
        if (subject) {
            searchQuery.subject = { $regex: subject, $options: 'i' };
        }
        // Class level filter
        if (classLevel) {
            searchQuery.classLevel = classLevel;
        }
        // Teaching mode filter
        if (teachingMode && teachingMode !== 'both') {
            searchQuery.teachingMode = teachingMode;
        }
        // Urgency filter
        if (urgency) {
            searchQuery.urgency = urgency;
        }
        // Budget filter
        if (minBudget || maxBudget) {
            const budgetQuery = {};
            if (minBudget)
                budgetQuery.$gte = parseInt(minBudget);
            if (maxBudget)
                budgetQuery.$lte = parseInt(maxBudget);
            searchQuery['budget.max'] = budgetQuery;
        }
        // Experience filter
        if (experience) {
            searchQuery['requirements.experience'] = experience;
        }
        // Gender filter
        if (gender && gender !== 'any') {
            searchQuery['requirements.gender'] = gender;
        }
        let pipeline = [];
        // Add geospatial search if coordinates provided
        if (latitude && longitude) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    distanceField: 'distance',
                    maxDistance: parseInt(maxDistance),
                    spherical: true,
                    query: searchQuery
                }
            });
        }
        else {
            pipeline.push({ $match: searchQuery });
        }
        // Add sorting
        if (sortBy === 'budget-high') {
            pipeline.push({ $sort: { 'budget.max': -1 } });
        }
        else if (sortBy === 'budget-low') {
            pipeline.push({ $sort: { 'budget.min': 1 } });
        }
        else if (sortBy === 'urgency') {
            const urgencyOrder = { 'immediate': 1, 'within-week': 2, 'within-month': 3, 'flexible': 4 };
            pipeline.push({
                $addFields: {
                    urgencyOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$urgency', 'immediate'] }, then: 1 },
                                { case: { $eq: ['$urgency', 'within-week'] }, then: 2 },
                                { case: { $eq: ['$urgency', 'within-month'] }, then: 3 },
                                { case: { $eq: ['$urgency', 'flexible'] }, then: 4 }
                            ],
                            default: 5
                        }
                    }
                }
            });
            pipeline.push({ $sort: { urgencyOrder: 1 } });
        }
        else if (sortBy === 'latest') {
            pipeline.push({ $sort: { createdAt: -1 } });
        }
        else if (latitude && longitude) {
            // Distance sorting is handled by $geoNear
        }
        else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }
        // Add pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });
        // Execute search
        const jobs = await Job_1.Job.aggregate(pipeline);
        // Get total count for pagination
        const totalPipeline = [...pipeline];
        totalPipeline.pop(); // Remove limit
        totalPipeline.pop(); // Remove skip
        totalPipeline.push({ $count: 'total' });
        const totalResult = await Job_1.Job.aggregate(totalPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;
        // Group results by distance buckets if location provided
        let distanceBuckets = [];
        if (latitude && longitude) {
            distanceBuckets = DISTANCE_BUCKETS.map(bucket => ({
                ...bucket,
                count: jobs.filter((job) => job.distance >= bucket.min && job.distance < bucket.max).length
            }));
        }
        res.json({
            success: true,
            data: {
                jobs: jobs.map((job) => ({
                    ...job,
                    distance: job.distance ? Math.round(job.distance) : null
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                distanceBuckets,
                searchParams: {
                    subject,
                    classLevel,
                    teachingMode,
                    urgency,
                    maxDistance,
                    location: latitude && longitude ? { latitude, longitude } : null
                }
            }
        });
    }
    catch (error) {
        console.error('Error searching jobs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search jobs',
            error: error.message
        });
    }
};
exports.searchJobs = searchJobs;
// Get nearby teachers/jobs based on location
const getNearbyResults = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 10000, type = 'teachers' } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }
        const geoNearStage = {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                },
                distanceField: 'distance',
                maxDistance: parseInt(maxDistance),
                spherical: true,
                query: {}
            }
        };
        let results;
        if (type === 'teachers') {
            geoNearStage.$geoNear.query = { isActive: true, isVerified: true };
            results = await Teacher_1.Teacher.aggregate([
                geoNearStage,
                { $limit: 50 },
                {
                    $project: {
                        _id: 1,
                        'personalInfo.firstName': 1,
                        'personalInfo.lastName': 1,
                        profilePhoto: 1,
                        'expertise.subjects': 1,
                        'rating.average': 1,
                        'pricing.hourlyRate': 1,
                        distance: 1
                    }
                }
            ]);
        }
        else {
            geoNearStage.$geoNear.query = { status: 'active', expiresAt: { $gte: new Date() } };
            results = await Job_1.Job.aggregate([
                geoNearStage,
                { $limit: 50 },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        subject: 1,
                        classLevel: 1,
                        'budget.min': 1,
                        'budget.max': 1,
                        urgency: 1,
                        distance: 1,
                        createdAt: 1
                    }
                }
            ]);
        }
        // Group by distance buckets
        const bucketedResults = DISTANCE_BUCKETS.map(bucket => ({
            ...bucket,
            results: results.filter((item) => item.distance >= bucket.min && item.distance < bucket.max).map((item) => ({
                ...item,
                distance: Math.round(item.distance)
            }))
        })).filter(bucket => bucket.results.length > 0);
        res.json({
            success: true,
            data: {
                buckets: bucketedResults,
                total: results.length,
                location: { latitude, longitude },
                maxDistance: parseInt(maxDistance)
            }
        });
    }
    catch (error) {
        console.error('Error getting nearby results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get nearby results',
            error: error.message
        });
    }
};
exports.getNearbyResults = getNearbyResults;
// Get location suggestions based on partial search
const getLocationSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.json({
                success: true,
                data: { suggestions: [] }
            });
        }
        // Get unique locations from both teachers and jobs
        const teacherLocations = await Teacher_1.Teacher.aggregate([
            {
                $match: {
                    $or: [
                        { 'location.city': { $regex: query, $options: 'i' } },
                        { 'location.state': { $regex: query, $options: 'i' } },
                        { 'location.area': { $regex: query, $options: 'i' } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        city: '$location.city',
                        state: '$location.state',
                        coordinates: '$location.coordinates'
                    },
                    count: { $sum: 1 }
                }
            },
            { $limit: 10 }
        ]);
        const jobLocations = await Job_1.Job.aggregate([
            {
                $match: {
                    $or: [
                        { 'location.city': { $regex: query, $options: 'i' } },
                        { 'location.state': { $regex: query, $options: 'i' } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        city: '$location.city',
                        state: '$location.state',
                        coordinates: '$location.coordinates'
                    },
                    count: { $sum: 1 }
                }
            },
            { $limit: 10 }
        ]);
        // Combine and deduplicate suggestions
        const allLocations = [...teacherLocations, ...jobLocations];
        const uniqueLocations = allLocations.reduce((acc, curr) => {
            const existing = acc.find(item => item._id.city === curr._id.city && item._id.state === curr._id.state);
            if (!existing) {
                acc.push(curr);
            }
            else {
                existing.count += curr.count;
            }
            return acc;
        }, []);
        const suggestions = uniqueLocations
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
            .map(item => ({
            city: item._id.city,
            state: item._id.state,
            coordinates: item._id.coordinates,
            count: item.count,
            label: `${item._id.city}, ${item._id.state}`
        }));
        res.json({
            success: true,
            data: { suggestions }
        });
    }
    catch (error) {
        console.error('Error getting location suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get location suggestions',
            error: error.message
        });
    }
};
exports.getLocationSuggestions = getLocationSuggestions;
//# sourceMappingURL=searchController.js.map