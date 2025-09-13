'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { useSocket } from '../../lib/contexts/SocketContext';
import { apiClient } from '../../lib/api/client';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  _id: string;
  chatId: string;
  senderId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    role: string;
  };
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  attachments: any[];
  readBy: any[];
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

interface Chat {
  _id: string;
  participants: any[];
  type: 'private' | 'group';
  name?: string;
  otherParticipant?: any;
  unreadCount: number;
}

interface ChatWindowProps {
  chatId: string;
  onChatUpdate: (chat: Chat) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onChatUpdate }) => {
  const { user } = useAuth();
  const { joinChat, leaveChat, startTyping, stopTyping, markMessagesAsRead } = useSocket();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load chat and messages
  useEffect(() => {
    if (chatId) {
      loadChat();
      loadMessages();
      joinChat(chatId);
      
      return () => {
        leaveChat(chatId);
      };
    }
  }, [chatId]);

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // Mark as read if chat is active
        if (message.senderId._id !== user?._id) {
          markMessagesAsRead({ chatId, messageIds: [message._id] });
        }
      }
    };

    const handleMessageEdited = (event: CustomEvent) => {
      const editedMessage = event.detail;
      if (editedMessage.chatId === chatId) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === editedMessage._id ? editedMessage : msg
          )
        );
      }
    };

    const handleMessageDeleted = (event: CustomEvent) => {
      const { messageId } = event.detail;
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, deletedAt: new Date() } : msg
        )
      );
    };

    const handleUserTyping = (event: CustomEvent) => {
      const { userId, userName } = event.detail;
      if (userId !== user?._id) {
        setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
        
        // Remove after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(id => id !== userId));
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (event: CustomEvent) => {
      const { userId } = event.detail;
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    window.addEventListener('newMessage', handleNewMessage as EventListener);
    window.addEventListener('messageEdited', handleMessageEdited as EventListener);
    window.addEventListener('messageDeleted', handleMessageDeleted as EventListener);
    window.addEventListener('userTyping', handleUserTyping as EventListener);
    window.addEventListener('userStoppedTyping', handleUserStoppedTyping as EventListener);

    return () => {
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
      window.removeEventListener('messageEdited', handleMessageEdited as EventListener);
      window.removeEventListener('messageDeleted', handleMessageDeleted as EventListener);
      window.removeEventListener('userTyping', handleUserTyping as EventListener);
      window.removeEventListener('userStoppedTyping', handleUserStoppedTyping as EventListener);
    };
  }, [chatId, user]);

  const loadChat = async () => {
    try {
      const response = await apiClient.getChat(chatId);
      if (response.success) {
        setChat(response.data);
        onChatUpdate(response.data);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat details');
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getChatMessages(chatId);
      
      if (response.success) {
        setMessages(response.data.messages);
        scrollToBottom();
        
        // Mark unread messages as read
        const unreadMessages = response.data.messages.filter((msg: Message) => 
          msg.senderId._id !== user?._id && 
          !msg.readBy.some((read: any) => read.userId === user?._id)
        );
        
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map((msg: Message) => msg._id);
          markMessagesAsRead({ chatId, messageIds });
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    try {
      await apiClient.sendMessage(chatId, {
        content: messageContent,
        type: 'text'
      });
      
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    startTyping(chatId);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(chatId);
    }, 1000);
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await apiClient.editMessage(chatId, messageId, content);
      setEditingMessageId(null);
      setEditContent('');
      toast.success('Message updated');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await apiClient.deleteMessage(chatId, messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const getChatTitle = () => {
    if (!chat) return 'Loading...';
    
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    
    if (chat.otherParticipant) {
      return `${chat.otherParticipant.profile.firstName} ${chat.otherParticipant.profile.lastName}`;
    }
    
    return 'Chat';
  };

  const getChatSubtitle = () => {
    if (!chat || chat.type === 'group') return '';
    
    if (chat.otherParticipant) {
      const role = chat.otherParticipant.role;
      return role === 'teacher' ? 'Teacher' : 'Student';
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {chat?.otherParticipant?.profile?.avatar ? (
            <img
              src={chat.otherParticipant.profile.avatar}
              alt={getChatTitle()}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {getChatTitle().charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div>
            <h2 className="font-semibold text-gray-900">{getChatTitle()}</h2>
            {getChatSubtitle() && (
              <p className="text-sm text-gray-600">{getChatSubtitle()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-gray-600">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId._id === user?._id;
            const isDeleted = message.deletedAt;
            
            return (
              <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  {/* Message Bubble */}
                  <div className={`px-4 py-2 rounded-lg ${
                    isOwn 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-900'
                  } ${isDeleted ? 'opacity-50' : ''}`}>
                    {isDeleted ? (
                      <p className="italic text-sm">This message was deleted</p>
                    ) : editingMessageId === message._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 border rounded text-gray-900 resize-none"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditMessage(message._id, editContent)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingMessageId(null);
                              setEditContent('');
                            }}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="break-words">{message.content}</p>
                        {message.editedAt && (
                          <p className="text-xs mt-1 opacity-75">(edited)</p>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Message Info */}
                  <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${
                    isOwn ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{formatMessageTime(message.createdAt)}</span>
                    
                    {/* Message Actions (only for own messages) */}
                    {isOwn && !isDeleted && editingMessageId !== message._id && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingMessageId(message._id);
                            setEditContent(message.content);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;