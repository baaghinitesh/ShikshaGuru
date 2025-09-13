import mongoose, { Schema } from 'mongoose';
import { IChat, IMessage } from '../types';

const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  name: {
    type: String,
    maxlength: [100, 'Chat name must be less than 100 characters']
  },
  lastMessage: {
    content: String,
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    type: {
      type: String,
      enum: ['text', 'file', 'image'],
      default: 'text'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const messageSchema = new Schema<IMessage>({
  chatId: {
    type: (Schema.Types.ObjectId as any),
    ref: 'Chat',
    required: true
  },
  senderId: {
    type: (Schema.Types.ObjectId as any),
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Message content must be less than 5000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text'
  },
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  readBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  editedAt: Date,
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for unread status
messageSchema.virtual('isUnread').get(function() {
  return (this as any).readBy.length === 0;
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ type: 1 });

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ 'readBy.userId': 1 });
messageSchema.index({ createdAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
export const Message = mongoose.model<IMessage>('Message', messageSchema);