'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

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

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  loading: boolean;
  onNewChat: (participantId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onChatSelect,
  loading,
  onNewChat
}) => {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  const formatLastMessageTime = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getParticipantName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    
    if (chat.otherParticipant) {
      return `${chat.otherParticipant.profile.firstName} ${chat.otherParticipant.profile.lastName}`;
    }
    
    return 'Unknown User';
  };

  const getParticipantAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return null; // We can add group avatar logic later
    }
    
    return chat.otherParticipant?.profile?.avatar;
  };

  const getParticipantRole = (chat: Chat) => {
    if (chat.type === 'group') return null;
    return chat.otherParticipant?.role;
  };

  if (loading) {
    return (
      <div className="p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 mb-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setShowNewChatDialog(true)}
          className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Chats Yet</h3>
            <p className="text-gray-600 text-sm">Start a conversation with a teacher or student</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => onChatSelect(chat._id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChatId === chat._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    {getParticipantAvatar(chat) ? (
                      <img
                        src={getParticipantAvatar(chat)}
                        alt={getParticipantName(chat)}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-lg">
                          {getParticipantName(chat).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Role badge */}
                    {getParticipantRole(chat) && (
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        getParticipantRole(chat) === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {getParticipantRole(chat) === 'teacher' ? 'T' : 'S'}
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {getParticipantName(chat)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {chat.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </span>
                        )}
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Last Message */}
                    {chat.lastMessage ? (
                      <div className="flex items-center space-x-1">
                        {chat.lastMessage.type === 'file' && (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        )}
                        {chat.lastMessage.type === 'image' && (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage.type === 'file' ? 'File attachment' :
                           chat.lastMessage.type === 'image' ? 'Image' :
                           truncateMessage(chat.lastMessage.content)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      {showNewChatDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                To start a new chat, visit a teacher's or student's profile and click the "Message" button.
              </p>
              
              <div className="flex space-x-2">
                <a
                  href="/search/teachers"
                  className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-center hover:bg-blue-100 transition-colors"
                >
                  Find Teachers
                </a>
                <a
                  href="/jobs"
                  className="flex-1 bg-green-50 text-green-700 py-2 px-4 rounded-lg text-center hover:bg-green-100 transition-colors"
                >
                  Browse Jobs
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;