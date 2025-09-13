import { Request, Response } from 'express';
import { Chat, Message } from '../models/Chat';
import { User } from '../models';
import { io } from '../index';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getUserChats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', 'profile.firstName profile.lastName profile.avatar role')
    .populate('lastMessage.senderId', 'profile.firstName profile.lastName profile.avatar')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

    // Get unread count for each chat
    const chatWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          senderId: { $ne: userId },
          'readBy.userId': { $ne: userId }
        });

        const chatObj: any = chat.toObject();
        
        // Get other participant info (for private chats)
        if (chat.type === 'private') {
          const otherParticipant = chat.participants.find(
            (p: any) => p._id.toString() !== userId.toString()
          );
          chatObj.otherParticipant = otherParticipant;
        }

        return {
          ...chatObj,
          unreadCount
        };
      })
    );

    const total = await Chat.countDocuments({ participants: userId });

    res.json({
      success: true,
      data: {
        chats: chatWithUnreadCount,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chats'
    });
  }
};

export const getChatById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'profile.firstName profile.lastName profile.avatar role');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.some((p: any) => p._id.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Get unread count
    const unreadCount = await Message.countDocuments({
      chatId: chat._id,
      senderId: { $ne: userId },
      'readBy.userId': { $ne: userId }
    });

    const chatObj: any = chat.toObject();
    
    // Get other participant info (for private chats)
    if (chat.type === 'private') {
      const otherParticipant = chat.participants.find(
        (p: any) => p._id.toString() !== userId.toString()
      );
      chatObj.otherParticipant = otherParticipant;
    }

    res.json({
      success: true,
      data: {
        ...chatObj,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat'
    });
  }
};

export const createChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { participantId, type = 'private', name } = req.body;
    const userId = req.user._id;

    // Validate participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Check if private chat already exists between these users
    if (type === 'private') {
      const existingChat = await Chat.findOne({
        type: 'private',
        participants: { $all: [userId, participantId], $size: 2 }
      }).populate('participants', 'profile.firstName profile.lastName profile.avatar role');

      if (existingChat) {
        // Get other participant info
        const otherParticipant = existingChat.participants.find(
          (p: any) => p._id.toString() !== userId.toString()
        );
        
        const chatObj: any = existingChat.toObject();
        chatObj.otherParticipant = otherParticipant;

        return res.json({
          success: true,
          data: chatObj,
          message: 'Chat already exists'
        });
      }
    }

    // Create new chat
    const chat = new Chat({
      participants: type === 'private' ? [userId, participantId] : [userId],
      type,
      name: type === 'group' ? name : undefined
    });

    await chat.save();
    await chat.populate('participants', 'profile.firstName profile.lastName profile.avatar role');

    const chatObj: any = chat.toObject();
    
    // Get other participant info (for private chats)
    if (chat.type === 'private') {
      const otherParticipant = chat.participants.find(
        (p: any) => p._id.toString() !== userId.toString()
      );
      chatObj.otherParticipant = otherParticipant;
    }

    res.status(201).json({
      success: true,
      data: {
        ...chatObj,
        unreadCount: 0
      }
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat'
    });
  }
};

export const getChatMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    const messages = await Message.find({
      chatId,
      deletedAt: null
    })
    .populate('senderId', 'profile.firstName profile.lastName profile.avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Reverse to get chronological order (oldest first)
    messages.reverse();

    const total = await Message.countDocuments({ chatId, deletedAt: null });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;
    const { content, type = 'text', attachments = [] } = req.body;

    // Verify user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Create message
    const message = new Message({
      chatId,
      senderId: userId,
      content,
      type,
      attachments
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = {
      content,
      senderId: userId,
      timestamp: new Date(),
      type
    };
    await chat.save();

    // Populate sender info
    await message.populate('senderId', 'profile.firstName profile.lastName profile.avatar role');

    // Emit to Socket.io if available
    if (io) {
      io.to(chatId).emit('new_message', message);

      // Send notification to other participants
      const otherParticipants = chat.participants.filter(
        p => p.toString() !== userId.toString()
      );

      otherParticipants.forEach(participantId => {
        io.to(participantId.toString()).emit('message_notification', {
          chatId,
          sender: {
            _id: userId,
            name: req.user.fullName,
            avatar: req.user.profile.avatar
          },
          content,
          type
        });
      });
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;
    const { messageIds } = req.body;

    // Verify user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Update messages
    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        chatId,
        senderId: { $ne: userId }
      },
      {
        $addToSet: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );

    // Emit to Socket.io if available
    if (io) {
      io.to(chatId).emit('messages_read', {
        userId,
        messageIds,
        readAt: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
};

export const deleteMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Soft delete
    message.deletedAt = new Date();
    await message.save();

    // Emit to Socket.io if available
    if (io) {
      io.to(message.chatId.toString()).emit('message_deleted', {
        messageId,
        deletedBy: userId,
        deletedAt: message.deletedAt
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
};

export const editMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can edit their message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Update message
    message.content = content;
    message.editedAt = new Date();
    await message.save();

    await message.populate('senderId', 'profile.firstName profile.lastName profile.avatar role');

    // Emit to Socket.io if available
    if (io) {
      io.to(message.chatId.toString()).emit('message_edited', message);
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing message'
    });
  }
};

export const searchMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;
    const { query, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Verify user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    const searchQuery = {
      chatId,
      deletedAt: null,
      content: { $regex: query, $options: 'i' }
    };

    const messages = await Message.find(searchQuery)
      .populate('senderId', 'profile.firstName profile.lastName profile.avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Message.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page as string),
          pages: Math.ceil(total / parseInt(limit as string)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching messages'
    });
  }
};