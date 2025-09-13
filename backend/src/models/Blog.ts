import mongoose, { Schema } from 'mongoose';
import { IBlog } from '../types';

const commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Comment must be less than 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  replies: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Reply must be less than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { _id: false });

const blogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Blog title must be less than 200 characters']
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    maxlength: [500, 'Excerpt must be less than 500 characters']
  },
  featuredImage: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Featured image must be a valid image URL'
    }
  },
  author: {
    type: (Schema.Types.ObjectId as any),
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Education',
      'Teaching Tips',
      'Study Guides',
      'Career Guidance',
      'Exam Preparation',
      'Technology in Education',
      'Student Life',
      'Parent Guide',
      'News & Updates',
      'Success Stories'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag must be less than 30 characters']
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title must be less than 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description must be less than 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  publishedAt: Date,
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reading time (words per minute = 200)
blogSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = (this as any).content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
});

// Virtual for total likes
blogSchema.virtual('totalLikes').get(function() {
  return (this as any).likes.length;
});

// Virtual for total comments
blogSchema.virtual('totalComments').get(function() {
  return (this as any).comments.reduce((total: number, comment: any) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);
});

// Auto-generate slug from title if not provided
blogSchema.pre('save', function(next) {
  if (!(this as any).slug && (this as any).title) {
    (this as any).slug = (this as any).title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Set published date when status changes to published
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && (this as any).status === 'published' && !(this as any).publishedAt) {
    (this as any).publishedAt = new Date();
  }
  next();
});

// Auto-generate SEO fields if not provided
blogSchema.pre('save', function(next) {
  if (!(this as any).seo.metaTitle) {
    (this as any).seo.metaTitle = (this as any).title.substring(0, 60);
  }
  if (!(this as any).seo.metaDescription) {
    (this as any).seo.metaDescription = (this as any).excerpt.substring(0, 160);
  }
  next();
});

// Indexes
blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ author: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ views: -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ 'seo.keywords': 1 });

// Text search index
blogSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text'
});

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);