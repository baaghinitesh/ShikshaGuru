'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  BookOpen,
  Users,
  MapPin,
  Settings,
  Star,
  Heart
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AIMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
  suggestedResponses?: string[];
}

interface AIAction {
  id: string;
  label: string;
  type: 'navigation' | 'search' | 'form' | 'external';
  data?: any;
  icon?: React.ReactNode;
}

interface AIConversation {
  id: string;
  messages: AIMessage[];
  context: {
    userRole?: string;
    currentPage?: string;
    lastActivity?: Date;
  };
}

const AIChatAssistant: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !conversation) {
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.startAIConversation({});
      
      if (response.success) {
        setConversation(response.data);
      } else {
        toast.error('Failed to start AI assistant');
      }
    } catch (error) {
      console.error('Error initializing AI conversation:', error);
      toast.error('Failed to start AI assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!conversation || !inputMessage.trim()) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await apiClient.startAIConversation({
        message: messageContent,
        conversationId: conversation.id
      });
      
      if (response.success) {
        setConversation(response.data);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = async (action: AIAction) => {
    try {
      // Log action execution
      if (conversation) {
        await apiClient.executeAIAction({
          actionId: action.id,
          actionData: action.data,
          conversationId: conversation.id
        });
      }
      
      // Execute the action
      if (action.type === 'navigation' && action.data?.path) {
        window.location.href = action.data.path;
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      // Still execute the action even if logging fails
      if (action.type === 'navigation' && action.data?.path) {
        window.location.href = action.data.path;
        setIsOpen(false);
      }
    }
  };

  const handleSuggestedResponseClick = async (response: string) => {
    if (!conversation) return;

    setIsTyping(true);
    try {
      const apiResponse = await apiClient.startAIConversation({
        message: response,
        conversationId: conversation.id
      });
      
      if (apiResponse.success) {
        setConversation(apiResponse.data);
      } else {
        toast.error('Failed to send suggested response');
      }
    } catch (error) {
      console.error('Error sending suggested response:', error);
      toast.error('Failed to send suggested response');
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = (message: AIMessage) => {
    const isAI = message.type === 'ai' || message.type === 'system';
    
    return (
      <div key={message.id} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
        {isAI && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isAI ? 'order-2' : 'order-1'}`}>
          <div className={`rounded-lg px-4 py-2 ${
            isAI 
              ? 'bg-muted text-muted-foreground' 
              : 'bg-primary text-primary-foreground ml-auto'
          }`}>
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1 px-1">
            {format(new Date(message.timestamp), 'HH:mm')}
          </div>

          {/* Action Buttons */}
          {message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  className="text-xs h-8 flex items-center gap-1"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Suggested Responses */}
          {message.suggestedResponses && message.suggestedResponses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.suggestedResponses.map((response, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestedResponseClick(response)}
                  className="text-xs h-8 bg-primary/5 hover:bg-primary/10 text-primary"
                >
                  {response}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {!isAI && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
    );
  };

  // Don't render if not open
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-96 shadow-xl border-0 z-50 transition-all duration-200 ${
      isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-2rem)]'
    }`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-base sm:text-lg truncate">ShikshaGuru Assistant</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex items-center gap-2 text-sm opacity-90">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            {isAuthenticated ? (
              <span>Logged in as {user?.firstName || 'User'}</span>
            ) : (
              <span>Guest user</span>
            )}
          </div>
        )}
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-120px)]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : conversation ? (
              <>
                {conversation.messages.map(renderMessage)}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Failed to load conversation</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading || isTyping}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isTyping}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AIChatAssistant;