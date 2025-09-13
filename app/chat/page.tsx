'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { useSocket } from '../../lib/contexts/SocketContext';
import { apiClient } from '../../lib/api/client';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import { toast } from 'sonner';

interface Chat {
  _id: string;
  participants: any[];
  type: 'private' | 'group';
  name?: string;
  lastMessage?: {
    content: string;
    senderId: any;
    timestamp: Date;
    type: string;
  };
  otherParticipant?: any;
  unreadCount: number;
  updatedAt: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Listen for new messages to update chat list
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail;
      updateChatLastMessage(message.chatId, message);
    };

    const handleMessageNotification = (event: CustomEvent) => {
      const notification = event.detail;
      // Update unread count for the chat
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === notification.chatId 
            ? { ...chat, unreadCount: chat.unreadCount + 1 }
            : chat
        )
      );
    };

    window.addEventListener('newMessage', handleNewMessage as EventListener);
    window.addEventListener('messageNotification', handleMessageNotification as EventListener);

    return () => {
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
      window.removeEventListener('messageNotification', handleMessageNotification as EventListener);
    };
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getChats();
      
      if (response.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const updateChatLastMessage = (chatId: string, message: any) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage: {
              content: message.content,
              senderId: message.senderId,
              timestamp: message.createdAt,
              type: message.type
            },
            updatedAt: message.createdAt
          };
        }
        return chat;
      });

      // Sort by updatedAt to move recently active chats to top
      return updatedChats.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    
    // Mark chat as read (reset unread count)
    setChats(prevChats => 
      prevChats.map(chat => 
        chat._id === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  };

  const handleNewChat = async (participantId: string) => {
    try {
      const response = await apiClient.createChat({ participantId });
      
      if (response.success) {
        const newChat = response.data;
        
        // Add to chat list if it's truly new
        if (!chats.find(chat => chat._id === newChat._id)) {
          setChats(prevChats => [newChat, ...prevChats]);
        }
        
        // Select the new/existing chat
        setSelectedChatId(newChat._id);
        toast.success(response.message || 'Chat created successfully');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Search by participant name
    if (chat.otherParticipant) {
      const name = `${chat.otherParticipant.profile.firstName} ${chat.otherParticipant.profile.lastName}`.toLowerCase();
      if (name.includes(searchLower)) return true;
    }
    
    // Search by group name
    if (chat.name && chat.name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search by last message content
    if (chat.lastMessage && chat.lastMessage.content.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to access chat.</p>
          <a 
            href="/sign-in" 
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-gray-600 mt-1">
                Chat with teachers and students
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="flex h-[600px]">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                <ChatList
                  chats={filteredChats}
                  selectedChatId={selectedChatId}
                  onChatSelect={handleChatSelect}
                  loading={loading}
                  onNewChat={handleNewChat}
                />
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedChatId ? (
                <ChatWindow
                  chatId={selectedChatId}
                  onChatUpdate={(updatedChat) => {
                    setChats(prevChats => 
                      prevChats.map(chat => 
                        chat._id === updatedChat._id ? updatedChat : chat
                      )
                    );
                  }}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Chat Selected
                    </h3>
                    <p className="text-gray-600">
                      Select a chat from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;