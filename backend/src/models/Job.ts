import mongoose, { Schema } from 'mongoose';
import { IJob, JobStatus } from '../types';

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
    required: true
  },
  address: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' }
}, { _id: false });

const applicationSchema = new Schema({
  teacherId: {
    type: Schema.Types.ObjectId,
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

const jobSchema = new Schema<IJob>({
  studentId: {
    type: (Schema.Types.ObjectId as any),
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
    enum: Object.values(JobStatus),
    default: JobStatus.ACTIVE
  },
  applications: [applicationSchema],
  selectedTeacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
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

// Virtual for total applications
jobSchema.virtual('totalApplications').get(function() {
  return (this as any).applications.length;
});

// Virtual for pending applications
jobSchema.virtual('pendingApplications').get(function() {
  return (this as any).applications.filter((app: any) => app.status === 'pending').length;
});

// Virtual for accepted applications
jobSchema.virtual('acceptedApplications').get(function() {
  return (this as any).applications.filter((app: any) => app.status === 'accepted').length;
});

// Auto-expire jobs
jobSchema.pre('save', function(next) {
  if ((this as any).expiresAt < new Date() && (this as any).status === JobStatus.ACTIVE) {
    (this as any).status = JobStatus.CANCELLED;
  }
  next();
});

// Validate start date
jobSchema.pre('save', function(next) {
  if ((this as any).schedule.startDate < new Date()) {
    next(new Error('Start date cannot be in the past'));
  }
  if ((this as any).schedule.endDate && (this as any).schedule.endDate <= (this as any).schedule.startDate) {
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

export const Job = mongoose.model<IJob>('Job', jobSchema);