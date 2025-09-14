import mongoose, { Schema, Document, model } from 'mongoose';

// User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ActivityLog Interface
export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  timestamp: Date;
  ipAddress?: string;
  metadata?: string;
}

// User Schema
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    maxlength: 100,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255
  },
  passwordHash: {
    type: String,
    required: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // This creates createdAt and updatedAt automatically
});

// ActivityLog Schema
const activityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    maxlength: 45
  },
  metadata: {
    type: String // JSON string for additional data
  }
});

// Models
export const User = mongoose.models.User || model<IUser>('User', userSchema);
export const ActivityLog = mongoose.models.ActivityLog || model<IActivityLog>('ActivityLog', activityLogSchema);

// Type exports for compatibility
export type UserDocument = IUser;
export type ActivityLogDocument = IActivityLog;
export type NewUser = Partial<IUser>;
export type NewActivityLog = Partial<IActivityLog>;

// Activity Types enum
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  SHARE_CREATED = 'SHARE_CREATED',
  SHARE_ACCESSED = 'SHARE_ACCESSED',
  SHARE_UPDATED = 'SHARE_UPDATED',
  SHARE_DELETED = 'SHARE_DELETED',
}