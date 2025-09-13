import { Document } from 'mongoose';

// User Types
export enum UserRole {
  GUEST = 'guest',
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

// Location Types
export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

// Subject and Education Types
export interface ISubject {
  name: string;
  level: string; // Primary, Secondary, Higher Secondary, Graduate, Post Graduate
  category: string; // Math, Science, Language, etc.
}

export interface IEducation {
  degree: string;
  institution: string;
  year: number;
  percentage?: number;
  cgpa?: number;
}

export interface IExperience {
  title: string;
  institution: string;
  duration: string;
  description?: string;
}

// Availability Types
export interface IAvailability {
  day: string; // Monday, Tuesday, etc.
  slots: {
    start: string; // "09:00"
    end: string;   // "12:00"
  }[];
}

// Document Types
export interface IDocument {
  name: string;
  url: string;
  type: string; // resume, certificate, id_proof, etc.
  uploadedAt: Date;
  verified: boolean;
}

// User Interfaces
export interface IUser extends Document {
  email: string;
  phone?: string;
  password?: string;
  googleId?: string;
  role: UserRole;
  status: UserStatus;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
  };
  location?: ILocation;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showPhone: boolean;
      showEmail: boolean;
      showLocation: boolean;
    };
    theme: {
      mode: 'light' | 'dark';
      accentColor: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ITeacher extends Document {
  userId: string; // Reference to User
  profile: {
    title: string; // Mr., Mrs., Dr., Prof.
    tagline: string; // Short professional tagline
    experience: number; // Years of experience
    rating: number;
    totalStudents: number;
    totalHours: number;
    hourlyRate: {
      min: number;
      max: number;
    };
    languages: string[];
    specializations: string[];
  };
  education: IEducation[];
  certifications: IDocument[];
  workExperience: IExperience[];
  subjects: ISubject[];
  teachingModes: ('online' | 'offline' | 'hybrid')[];
  availability: IAvailability[];
  location: ILocation;
  verification: {
    documents: IDocument[];
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt?: Date;
    verifiedBy?: string;
    notes?: string;
  };
  reviews: {
    studentId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  statistics: {
    profileViews: number;
    responseRate: number;
    responseTime: number; // in minutes
    completionRate: number;
  };
  settings: {
    acceptingStudents: boolean;
    instantBooking: boolean;
    requireApproval: boolean;
    backgroundCheck: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends Document {
  userId: string; // Reference to User
  profile: {
    grade?: string;
    school?: string;
    parentName?: string;
    parentPhone?: string;
    learningGoals: string[];
  };
  preferences: {
    teacherGender?: 'male' | 'female' | 'any';
    teachingMode: ('online' | 'offline' | 'hybrid')[];
    budget: {
      min: number;
      max: number;
    };
    preferredLanguages: string[];
  };
  location: ILocation;
  jobsPosted: string[]; // Job IDs
  teachersConnected: string[]; // Teacher IDs
  createdAt: Date;
  updatedAt: Date;
}

// Job Types
export enum JobStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface IJob extends Document {
  studentId: string;
  title: string;
  description: string;
  subjects: ISubject[];
  requirements: {
    experience: number; // minimum years
    qualifications: string[];
    teachingMode: ('online' | 'offline' | 'hybrid')[];
    gender?: 'male' | 'female' | 'any';
    languages: string[];
  };
  budget: {
    type: 'hourly' | 'monthly' | 'fixed';
    amount: number;
    currency: string;
  };
  schedule: {
    frequency: string; // daily, weekly, etc.
    duration: number; // hours per session
    timeSlots: IAvailability[];
    startDate: Date;
    endDate?: Date;
  };
  location: ILocation;
  searchRadius: number; // in kilometers
  status: JobStatus;
  applications: {
    teacherId: string;
    proposedRate: number;
    message: string;
    appliedAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
  }[];
  selectedTeacher?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Chat Types
export interface IChat extends Document {
  participants: string[]; // User IDs
  type: 'private' | 'group';
  name?: string; // For group chats
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
    type: 'text' | 'file' | 'image';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  readBy: {
    userId: string;
    readAt: Date;
  }[];
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
}

// Blog Types
export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string; // User ID
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: string[]; // User IDs who liked
  comments: {
    userId: string;
    content: string;
    createdAt: Date;
    replies?: {
      userId: string;
      content: string;
      createdAt: Date;
    }[];
  }[];
}

// Testimonial Types
export interface ITestimonial extends Document {
  studentId: string;
  teacherId: string;
  rating: number;
  title: string;
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  verified: boolean;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}