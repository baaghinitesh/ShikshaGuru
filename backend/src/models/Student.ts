import mongoose, { Schema } from 'mongoose';
import { IStudent } from '../types';

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

const studentSchema = new Schema<IStudent>({
  userId: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true,
    unique: true
  } as any,
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
    type: Schema.Types.ObjectId,
    ref: 'Job'
  }],
  teachersConnected: [{
    type: Schema.Types.ObjectId,
    ref: 'Teacher'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total jobs posted
studentSchema.virtual('totalJobsPosted').get(function(this: any) {
  return this.jobsPosted ? this.jobsPosted.length : 0;
});

// Virtual for total teachers connected
studentSchema.virtual('totalTeachersConnected').get(function(this: any) {
  return this.teachersConnected ? this.teachersConnected.length : 0;
});

// Validate budget range
studentSchema.pre('save', function(this: any, next) {
  if (this.preferences && this.preferences.budget && this.preferences.budget.min > this.preferences.budget.max) {
    next(new Error('Minimum budget cannot be greater than maximum budget'));
  }
  next();
});

// Indexes
studentSchema.index({ userId: 1 });
studentSchema.index({ 'location.coordinates': '2dsphere' });
studentSchema.index({ 'profile.grade': 1 });
studentSchema.index({ 'preferences.budget.min': 1 });
studentSchema.index({ 'preferences.budget.max': 1 });
studentSchema.index({ 'preferences.teachingMode': 1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);