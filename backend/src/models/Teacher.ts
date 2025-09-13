import mongoose, { Schema } from 'mongoose';
import { ITeacher } from '../types';

const educationSchema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, required: true },
  percentage: Number,
  cgpa: Number
}, { _id: false });

const experienceSchema = new Schema({
  title: { type: String, required: true },
  institution: { type: String, required: true },
  duration: { type: String, required: true },
  description: String
}, { _id: false });

const documentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false }
}, { _id: false });

const subjectSchema = new Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  category: { type: String, required: true }
}, { _id: false });

const availabilitySchema = new Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  slots: [{
    start: { type: String, required: true }, // "09:00"
    end: { type: String, required: true }     // "12:00"
  }]
}, { _id: false });

const locationSchema = new Schema({
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

const reviewSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const teacherSchema = new Schema<ITeacher>({
  userId: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true,
    unique: true
  } as any,
  profile: {
    title: {
      type: String,
      required: true,
      enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']
    },
    tagline: {
      type: String,
      required: true,
      maxlength: [100, 'Tagline must be less than 100 characters']
    },
    experience: {
      type: Number,
      required: true,
      min: [0, 'Experience cannot be negative']
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      min: {
        type: Number,
        required: true,
        min: [0, 'Minimum rate cannot be negative']
      },
      max: {
        type: Number,
        required: true,
        min: [0, 'Maximum rate cannot be negative']
      }
    },
    languages: [{
      type: String,
      required: true
    }],
    specializations: [{
      type: String,
      required: true
    }]
  },
  education: [educationSchema],
  certifications: [documentSchema],
  workExperience: [experienceSchema],
  subjects: {
    type: [subjectSchema],
    required: true,
    validate: [arrayLimit, 'At least one subject is required']
  },
  teachingModes: [{
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    required: true
  }],
  availability: [availabilitySchema],
  location: {
    type: locationSchema,
    required: true
  },
  verification: {
    documents: [documentSchema],
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },
  reviews: [reviewSchema],
  statistics: {
    profileViews: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    responseTime: {
      type: Number,
      default: 0 // in minutes
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  settings: {
    acceptingStudents: {
      type: Boolean,
      default: true
    },
    instantBooking: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: true
    },
    backgroundCheck: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validation function
function arrayLimit(val: any[]) {
  return val.length >= 1;
}

// Virtual for average rating
teacherSchema.virtual('averageRating').get(function(this: any) {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
  return Number((sum / this.reviews.length).toFixed(1));
});

// Virtual for total reviews
teacherSchema.virtual('totalReviews').get(function(this: any) {
  return this.reviews.length;
});

// Validate hourly rate
teacherSchema.pre('save', function(this: any, next) {
  if (this.hourlyRate && this.hourlyRate.min > this.hourlyRate.max) {
    next(new Error('Minimum hourly rate cannot be greater than maximum hourly rate'));
  }
  next();
});

// Update rating when reviews change
teacherSchema.pre('save', function(this: any, next) {
  if (this.isModified('reviews') && this.rating) {
    this.rating.average = (this as any).averageRating || 0;
    this.rating.count = this.reviews.length;
  }
  next();
});

// Indexes
teacherSchema.index({ userId: 1 });
teacherSchema.index({ 'location.coordinates': '2dsphere' });
teacherSchema.index({ 'profile.rating': -1 });
teacherSchema.index({ 'profile.experience': -1 });
teacherSchema.index({ 'profile.hourlyRate.min': 1 });
teacherSchema.index({ 'profile.hourlyRate.max': 1 });
teacherSchema.index({ 'subjects.name': 1 });
teacherSchema.index({ 'subjects.level': 1 });
teacherSchema.index({ 'verification.status': 1 });
teacherSchema.index({ 'settings.acceptingStudents': 1 });

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);