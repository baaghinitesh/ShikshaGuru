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
exports.Student = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const locationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
    },
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
}, { _id: false });
const studentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    profile: {
        grade: {
            type: String,
            enum: [
                'Pre-KG', 'LKG', 'UKG',
                '1st', '2nd', '3rd', '4th', '5th',
                '6th', '7th', '8th', '9th', '10th',
                '11th', '12th',
                'Undergraduate', 'Graduate', 'Post Graduate',
                'Other'
            ]
        },
        school: {
            type: String,
            maxlength: [100, 'School name must be less than 100 characters']
        },
        parentName: {
            type: String,
            maxlength: [100, 'Parent name must be less than 100 characters']
        },
        parentPhone: {
            type: String,
            match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
        },
        learningGoals: [{
                type: String,
                maxlength: [200, 'Learning goal must be less than 200 characters']
            }]
    },
    preferences: {
        teacherGender: {
            type: String,
            enum: ['male', 'female', 'any'],
            default: 'any'
        },
        teachingMode: [{
                type: String,
                enum: ['online', 'offline', 'hybrid'],
                required: true
            }],
        budget: {
            min: {
                type: Number,
                required: true,
                min: [0, 'Minimum budget cannot be negative']
            },
            max: {
                type: Number,
                required: true,
                min: [0, 'Maximum budget cannot be negative']
            }
        },
        preferredLanguages: [{
                type: String,
                required: true
            }]
    },
    location: {
        type: locationSchema,
        required: true
    },
    jobsPosted: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Job'
        }],
    teachersConnected: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Teacher'
        }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual for total jobs posted
studentSchema.virtual('totalJobsPosted').get(function () {
    return this.jobsPosted ? this.jobsPosted.length : 0;
});
// Virtual for total teachers connected
studentSchema.virtual('totalTeachersConnected').get(function () {
    return this.teachersConnected ? this.teachersConnected.length : 0;
});
// Validate budget range
studentSchema.pre('save', function (next) {
    if (this.preferences && this.preferences.budget && this.preferences.budget.min > this.preferences.budget.max) {
        next(new Error('Minimum budget cannot be greater than maximum budget'));
    }
    next();
});
// Indexes
studentSchema.index({ 'location.coordinates': '2dsphere' });
studentSchema.index({ 'profile.grade': 1 });
studentSchema.index({ 'preferences.budget.min': 1 });
studentSchema.index({ 'preferences.budget.max': 1 });
studentSchema.index({ 'preferences.teachingMode': 1 });
exports.Student = mongoose_1.default.model('Student', studentSchema);
//# sourceMappingURL=Student.js.map