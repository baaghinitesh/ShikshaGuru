'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/auth-context';
import { config } from '../config';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (data: {
    chatId: string;
    content: string;
    type?: string;
    attachments?: any[];
  }) => void;
  markMessagesAsRead: (data: { chatId: string; messageIds: string[] }) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  sendNotification: (data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Create socket connection
      const newSocket = io(config.api.baseUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 Connected to Socket.io server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from Socket.io server:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Chat event handlers
      newSocket.on('new_message', (message) => {
        console.log('📨 New message received:', message);
        // Dispatch custom event for components to listen
        window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
      });

      newSocket.on('message_notification', (notification) => {
        console.log('🔔 Message notification:', notification);
        // Dispatch custom event for notifications
        window.dispatchEvent(new CustomEvent('messageNotification', { detail: notification }));
      });

      newSocket.on('messages_read', (data) => {
        console.log('✅ Messages marked as read:', data);
        window.dispatchEvent(new CustomEvent('messagesRead', { detail: data }));
      });

      newSocket.on('message_edited', (message) => {
        console.log('✏️ Message edited:', message);
        window.dispatchEvent(new CustomEvent('messageEdited', { detail: message }));
      });

      newSocket.on('message_deleted', (data) => {
        console.log('🗑️ Message deleted:', data);
        window.dispatchEvent(new CustomEvent('messageDeleted', { detail: data }));
      });

      // Typing indicators
      newSocket.on('user_typing', (data) => {
        console.log('⌨️ User typing:', data);
        window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
      });

      newSocket.on('user_stopped_typing', (data) => {
        console.log('⌨️ User stopped typing:', data);
        window.dispatchEvent(new CustomEvent('userStoppedTyping', { detail: data }));
      });

      // Job-related notifications
      newSocket.on('new_job_application', (data) => {
        console.log('💼 New job application:', data);
        window.dispatchEvent(new CustomEvent('newJobApplication', { detail: data }));
      });

      newSocket.on('job_status_updated', (data) => {
        console.log('💼 Job status updated:', data);
        window.dispatchEvent(new CustomEvent('jobStatusUpdated', { detail: data }));
      });

      // General notifications
      newSocket.on('notification', (data) => {
        console.log('🔔 General notification:', data);
        window.dispatchEvent(new CustomEvent('notification', { detail: data }));
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        window.dispatchEvent(new CustomEvent('socketError', { detail: error }));
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user, token]);

  // Socket methods
  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket) {
      socket.emit('leave_chat', chatId);
    }
  };

  const sendMessage = (data: {
    chatId: string;
    content: string;
    type?: string;
    attachments?: any[];
  }) => {
    if (socket) {
      socket.emit('send_message', data);
    }
  };

  const markMessagesAsRead = (data: { chatId: string; messageIds: string[] }) => {
    if (socket) {
      socket.emit('mark_read', data);
    }
  };

  const startTyping = (chatId: string) => {
    if (socket) {
      socket.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId: string) => {
    if (socket) {
      socket.emit('typing_stop', { chatId });
    }
  };

  const sendNotification = (data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) => {
    if (socket) {
      socket.emit('send_notification', data);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinChat,
    leaveChat,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    sendNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};