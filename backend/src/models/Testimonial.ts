import mongoose, { Schema } from 'mongoose';
import { ITestimonial } from '../types';

const testimonialSchema = new Schema<ITestimonial>({
  studentId: {
    type: (Schema.Types.ObjectId as any),
    ref: 'User',
    required: true
  },
  teacherId: {
    type: (Schema.Types.ObjectId as any),
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
        validator: function(v: string) {
          if (!this.media?.type) return true;
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

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);