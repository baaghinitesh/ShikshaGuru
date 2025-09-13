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
exports.Message = exports.Chat = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const chatSchema = new mongoose_1.Schema({
    participants: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
const messageSchema = new mongoose_1.Schema({
    chatId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
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
messageSchema.virtual('isUnread').get(function () {
    return this.readBy.length === 0;
});
// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ type: 1 });
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ 'readBy.userId': 1 });
messageSchema.index({ createdAt: -1 });
exports.Chat = mongoose_1.default.model('Chat', chatSchema);
exports.Message = mongoose_1.default.model('Message', messageSchema);
//# sourceMappingURL=Chat.js.map