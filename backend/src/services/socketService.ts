import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { Chat, Message } from '../models/Chat';

interface AuthenticatedSocket extends SocketIOServer {
  user?: any;
}

export const initializeSocket = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      const user = await User.findById(decoded.id);

      if (!user || user.status !== 'active') {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: any) => {
    console.log(`🔌 User connected: ${socket.user.fullName} (${socket.user._id})`);

    // Join user to their personal room
    socket.join(socket.user._id.toString());

    // Join chat rooms
    socket.on('join_chat', async (chatId: string) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (!chat || !chat.participants.includes(socket.user._id)) {
          socket.emit('error', { message: 'Access denied to this chat' });
          return;
        }

        socket.join(chatId);
        console.log(`👥 User ${socket.user.fullName} joined chat: ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave chat room
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`👋 User ${socket.user.fullName} left chat: ${chatId}`);
    });

    // Send message
    socket.on('send_message', async (data: {
      chatId: string;
      content: string;
      type?: 'text' | 'file' | 'image';
      attachments?: any[];
    }) => {
      try {
        const { chatId, content, type = 'text', attachments } = data;

        // Verify user can send to this chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.user._id)) {
          socket.emit('error', { message: 'Access denied to this chat' });
          return;
        }

        // Create message
        const message = new Message({
          chatId,
          senderId: socket.user._id,
          content,
          type,
          attachments: attachments || []
        });

        await message.save();

        // Update chat's last message
        chat.lastMessage = {
          content,
          senderId: socket.user._id,
          timestamp: new Date(),
          type
        };
        await chat.save();

        // Populate sender info
        await message.populate('senderId', 'profile.firstName profile.lastName profile.avatar');

        // Send to all participants in the chat
        io.to(chatId).emit('new_message', message);

        // Send notification to other participants
        const otherParticipants = chat.participants.filter(
          p => p.toString() !== socket.user._id.toString()
        );

        otherParticipants.forEach(participantId => {
          io.to(participantId.toString()).emit('message_notification', {
            chatId,
            sender: {
              _id: socket.user._id,
              name: socket.user.fullName,
              avatar: socket.user.profile.avatar
            },
            content,
            type
          });
        });

        console.log(`💬 Message sent in chat ${chatId} by ${socket.user.fullName}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async (data: { chatId: string; messageIds: string[] }) => {
      try {
        const { chatId, messageIds } = data;

        // Verify access to chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.user._id)) {
          return;
        }

        // Update messages
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            chatId,
            senderId: { $ne: socket.user._id }
          },
          {
            $addToSet: {
              readBy: {
                userId: socket.user._id,
                readAt: new Date()
              }
            }
          }
        );

        // Notify other participants
        socket.to(chatId).emit('messages_read', {
          userId: socket.user._id,
          messageIds,
          readAt: new Date()
        });

        console.log(`✅ Messages marked as read by ${socket.user.fullName}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Typing indicators
    socket.on('typing_start', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('user_typing', {
        userId: socket.user._id,
        userName: socket.user.fullName
      });
    });

    socket.on('typing_stop', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('user_stopped_typing', {
        userId: socket.user._id
      });
    });

    // Job application notifications
    socket.on('job_application', (data: { teacherId: string; jobId: string; studentName: string }) => {
      io.to(data.teacherId).emit('new_job_application', {
        jobId: data.jobId,
        studentName: data.studentName,
        timestamp: new Date()
      });
    });

    // Job status updates
    socket.on('job_status_update', (data: { 
      studentId: string; 
      jobId: string; 
      status: string; 
      teacherName: string 
    }) => {
      io.to(data.studentId).emit('job_status_updated', {
        jobId: data.jobId,
        status: data.status,
        teacherName: data.teacherName,
        timestamp: new Date()
      });
    });

    // General notifications
    socket.on('send_notification', (data: { 
      userId: string; 
      type: string; 
      title: string; 
      message: string; 
      data?: any 
    }) => {
      io.to(data.userId).emit('notification', {
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.fullName} (${socket.user._id})`);
    });
  });

  return io;
};