"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
const subjectSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true },
    category: { type: String, required: true }
}, { _id: false });
const availabilitySchema = new mongoose_1.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
            start: { type: String, required: true }, // "09:00"
            end: { type: String, required: true } // "12:00"
        }]
}, { _id: false });
const locationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere'
    },
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
}, { _id: false });
const applicationSchema = new mongoose_1.Schema({
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    proposedRate: {
        type: Number,
        required: true,
        min: [0, 'Proposed rate cannot be negative']
    },
    message: {
        type: String,
        required: true,
        maxlength: [1000, 'Application message must be less than 1000 characters']
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { _id: false });
const jobSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Job title must be less than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        maxlength: [2000, 'Job description must be less than 2000 characters']
    },
    subjects: {
        type: [subjectSchema],
        required: true,
        validate: [arrayLimit, 'At least one subject is required']
    },
    requirements: {
        experience: {
            type: Number,
            required: true,
            min: [0, 'Experience requirement cannot be negative']
        },
        qualifications: [{
                type: String,
                required: true
            }],
        teachingMode: [{
                type: String,
                enum: ['online', 'offline', 'hybrid'],
                required: true
            }],
        gender: {
            type: String,
            enum: ['male', 'female', 'any'],
            default: 'any'
        },
        languages: [{
                type: String,
                required: true
            }]
    },
    budget: {
        type: {
            type: String,
            enum: ['hourly', 'monthly', 'fixed'],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: [0, 'Budget amount cannot be negative']
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    schedule: {
        frequency: {
            type: String,
            required: true,
            enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'as-needed']
        },
        duration: {
            type: Number,
            required: true,
            min: [0.5, 'Session duration cannot be less than 30 minutes']
        },
        timeSlots: [availabilitySchema],
        startDate: {
            type: Date,
            required: true
        },
        endDate: Date
    },
    location: {
        type: locationSchema,
        required: true
    },
    searchRadius: {
        type: Number,
        required: true,
        default: 10,
        min: [1, 'Search radius cannot be less than 1 km'],
        max: [100, 'Search radius cannot be more than 100 km']
    },
    status: {
        type: String,
        enum: Object.values(types_1.JobStatus),
        default: types_1.JobStatus.ACTIVE
    },
    applications: [applicationSchema],
    selectedTeacher: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: function () {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Validation function
function arrayLimit(val) {
    return val.length >= 1;
}
// Virtual for total applications
jobSchema.virtual('totalApplications').get(function () {
    return this.applications.length;
});
// Virtual for pending applications
jobSchema.virtual('pendingApplications').get(function () {
    return this.applications.filter((app) => app.status === 'pending').length;
});
// Virtual for accepted applications
jobSchema.virtual('acceptedApplications').get(function () {
    return this.applications.filter((app) => app.status === 'accepted').length;
});
// Auto-expire jobs
jobSchema.pre('save', function (next) {
    if (this.expiresAt < new Date() && this.status === types_1.JobStatus.ACTIVE) {
        this.status = types_1.JobStatus.CANCELLED;
    }
    next();
});
// Validate start date
jobSchema.pre('save', function (next) {
    if (this.schedule.startDate < new Date()) {
        next(new Error('Start date cannot be in the past'));
    }
    if (this.schedule.endDate && this.schedule.endDate <= this.schedule.startDate) {
        next(new Error('End date must be after start date'));
    }
    next();
});
// Indexes
jobSchema.index({ studentId: 1 });
jobSchema.index({ 'location.coordinates': '2dsphere' });
jobSchema.index({ status: 1 });
jobSchema.index({ expiresAt: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'subjects.name': 1 });
jobSchema.index({ 'subjects.level': 1 });
jobSchema.index({ 'budget.amount': 1 });
jobSchema.index({ 'requirements.teachingMode': 1 });
jobSchema.index({ 'requirements.experience': 1 });
exports.Job = mongoose_1.default.model('Job', jobSchema);
//# sourceMappingURL=Job.js.map