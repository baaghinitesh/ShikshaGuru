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
exports.Testimonial = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const testimonialSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    title: {
        type: String,
        required: [true, 'Testimonial title is required'],
        trim: true,
        maxlength: [100, 'Title must be less than 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Testimonial content is required'],
        trim: true,
        maxlength: [1000, 'Content must be less than 1000 characters']
    },
    media: {
        type: {
            type: String,
            enum: ['image', 'video']
        },
        url: {
            type: String,
            validate: {
                validator: function (v) {
                    if (!this.media?.type)
                        return true;
                    if (this.media.type === 'image') {
                        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
                    }
                    if (this.media.type === 'video') {
                        return /^https?:\/\/.+\.(mp4|webm|ogg|mov)$/i.test(v);
                    }
                    return true;
                },
                message: 'Please provide a valid media URL'
            }
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Compound index to ensure one testimonial per student-teacher pair
testimonialSchema.index({ studentId: 1, teacherId: 1 }, { unique: true });
// Other indexes
testimonialSchema.index({ teacherId: 1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ status: 1 });
testimonialSchema.index({ featured: 1 });
testimonialSchema.index({ verified: 1 });
testimonialSchema.index({ createdAt: -1 });
// Virtual for student and teacher population
testimonialSchema.virtual('student', {
    ref: 'User',
    localField: 'studentId',
    foreignField: '_id',
    justOne: true
});
testimonialSchema.virtual('teacher', {
    ref: 'Teacher',
    localField: 'teacherId',
    foreignField: '_id',
    justOne: true
});
exports.Testimonial = mongoose_1.default.model('Testimonial', testimonialSchema);
//# sourceMappingURL=Testimonial.js.map