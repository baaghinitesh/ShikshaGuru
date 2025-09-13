import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';

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
  icon?: string;
}

interface AIConversation {
  id: string;
  userId?: string;
  messages: AIMessage[];
  context: {
    userRole?: string;
    currentPage?: string;
    lastActivity?: Date;
    sessionData?: any;
  };
}

// In-memory storage for conversations (in production, use Redis or database)
const conversations = new Map<string, AIConversation>();

/**
 * Generate intelligent AI response based on user input and context
 */
const generateAIResponse = (
  userInput: string, 
  conversation: AIConversation, 
  userRole?: string
): AIMessage => {
  const lowerInput = userInput.toLowerCase();
  const context = conversation.context;
  
  // Enhanced FAQ patterns with contextual responses
  const responses = {
    // Tutor/Teacher Finding
    tutorSearch: {
      keywords: ['tutor', 'teacher', 'find', 'looking for', 'need help', 'subject'],
      response: (userRole?: string) => ({
        content: userRole === 'student' 
          ? "Perfect! As a student, you have two great options to find tutors:\n\n🔍 **Browse & Search**: Explore our teacher profiles with filters for subject, location, price, and ratings\n📝 **Post a Job**: Share your requirements and let qualified teachers apply to you\n\nWhich approach interests you more?"
          : "Great! I can help you find qualified tutors on ShikshaGuru. We have thousands of verified teachers across various subjects and locations. You can search by subject, location, price range, or specific requirements.",
        actions: [
          {
            id: 'search_teachers',
            label: 'Search Teachers',
            type: 'navigation' as const,
            data: { path: '/search/teachers' },
            icon: 'users'
          },
          {
            id: 'browse_all',
            label: 'Browse All Teachers',
            type: 'navigation' as const,
            data: { path: '/teachers' },
            icon: 'star'
          },
          ...(userRole === 'student' ? [{
            id: 'post_job',
            label: 'Post a Job',
            type: 'navigation' as const,
            data: { path: '/student/jobs/create' },
            icon: 'plus'
          }] : [])
        ],
        suggestedResponses: [
          "Search by subject",
          "Find teachers near me", 
          "Show top-rated teachers",
          ...(userRole === 'student' ? ["Post my requirements"] : [])
        ]
      })
    },

    // Job Posting
    jobPosting: {
      keywords: ['job', 'post', 'requirements', 'student need', 'hire', 'looking to hire'],
      response: (userRole?: string) => ({
        content: userRole === 'student'
          ? "Excellent choice! Posting a job is a great way to find the perfect tutor. You'll share your:\n\n📚 **Subject & Level**: What you want to learn\n📍 **Location**: Online, offline, or hybrid\n💰 **Budget**: Your preferred rate range\n📅 **Schedule**: When you're available\n📝 **Details**: Specific requirements or goals\n\nTeachers will then apply with their proposals!"
          : "Job posting is perfect for students looking for tutors! When you post a job, you share your learning requirements and budget, then qualified teachers apply with their proposals. It's a great way to receive multiple options and choose the best fit.",
        actions: userRole === 'student' ? [
          {
            id: 'post_job',
            label: 'Post a Job Now',
            type: 'navigation' as const,
            data: { path: '/student/jobs/create' },
            icon: 'plus'
          },
          {
            id: 'view_examples',
            label: 'View Example Jobs',
            type: 'navigation' as const,
            data: { path: '/jobs' },
            icon: 'eye'
          }
        ] : [
          {
            id: 'view_jobs',
            label: 'View Available Jobs',
            type: 'navigation' as const,
            data: { path: '/jobs' },
            icon: 'briefcase'
          },
          {
            id: 'signup_student',
            label: 'Sign Up as Student',
            type: 'navigation' as const,
            data: { path: '/sign-up' },
            icon: 'user-plus'
          }
        ],
        suggestedResponses: [
          "What information do I need?",
          "How do teachers apply?",
          "Is posting free?",
          "How do I choose the right teacher?"
        ]
      })
    },

    // Teacher Profile Creation
    becomeTeacher: {
      keywords: ['become teacher', 'teach', 'profile', 'join as teacher', 'teacher signup', 'start teaching'],
      response: (userRole?: string) => ({
        content: userRole === 'teacher'
          ? "Welcome to the teacher community! 🎓 As a teacher, you can:\n\n👤 **Create Your Profile**: Showcase qualifications, experience, and teaching style\n💼 **Apply to Jobs**: Respond to student requirements\n🔍 **Get Discovered**: Students can find you through searches\n💬 **Direct Communication**: Chat with potential students\n⭐ **Build Reputation**: Earn reviews and grow your presence"
          : "Fantastic! Joining as a teacher on ShikshaGuru opens up great opportunities. You'll create a comprehensive profile highlighting your qualifications, experience, and teaching expertise. Students can then discover you through searches or you can apply to their posted jobs.",
        actions: userRole === 'teacher' ? [
          {
            id: 'teacher_dashboard',
            label: 'Go to Dashboard',
            type: 'navigation' as const,
            data: { path: '/teacher/dashboard' },
            icon: 'dashboard'
          },
          {
            id: 'edit_profile',
            label: 'Edit My Profile',
            type: 'navigation' as const,
            data: { path: '/teacher/profile/create' },
            icon: 'edit'
          }
        ] : [
          {
            id: 'create_profile',
            label: 'Create Teacher Profile',
            type: 'navigation' as const,
            data: { path: '/teacher/profile/create' },
            icon: 'user'
          },
          {
            id: 'signup_teacher',
            label: 'Sign Up as Teacher',
            type: 'navigation' as const,
            data: { path: '/sign-up' },
            icon: 'user-plus'
          }
        ],
        suggestedResponses: [
          "What qualifications do I need?",
          "How do I set my rates?",
          "Can I teach multiple subjects?",
          "How do I get my first student?"
        ]
      })
    },

    // Platform How-To
    howItWorks: {
      keywords: ['how', 'work', 'platform', 'process', 'steps', 'guide', 'help'],
      response: (userRole?: string) => ({
        content: "ShikshaGuru makes connecting students and teachers simple! Here's how it works:\n\n🎯 **For Students**:\n• Browse teacher profiles or post job requirements\n• Compare qualifications, rates, and reviews\n• Connect directly with chosen teachers\n\n👨‍🏫 **For Teachers**:\n• Create detailed profiles showcasing expertise\n• Apply to student job postings\n• Build reputation through reviews\n\n💬 **For Everyone**:\n• Direct messaging system\n• Location-based matching\n• Secure and transparent process",
        actions: [
          {
            id: 'learn_more',
            label: 'Explore Platform',
            type: 'navigation' as const,
            data: { path: '/' },
            icon: 'info'
          },
          {
            id: 'browse_success',
            label: 'Success Stories',
            type: 'navigation' as const,
            data: { path: '/blog' },
            icon: 'star'
          }
        ],
        suggestedResponses: [
          "How do I sign up?",
          "Is it free to use?",
          "How do payments work?",
          "What subjects are available?"
        ]
      })
    },

    // Pricing and Costs
    pricing: {
      keywords: ['price', 'cost', 'rate', 'fee', 'charge', 'money', 'payment', 'free'],
      response: (userRole?: string) => ({
        content: "Great question about pricing! 💰\n\n✅ **Free to Use**: Browsing, posting jobs, and basic communication are completely free\n\n💵 **Teacher Rates**: Teachers set their own hourly rates based on:\n• Subject complexity\n• Experience level  \n• Location (online vs in-person)\n• Qualifications\n\n📊 **Typical Ranges**:\n• School subjects: ₹200-800/hour\n• Competitive exams: ₹500-1500/hour\n• Professional skills: ₹800-2000/hour\n\nNo platform fees - pay directly to teachers!",
        actions: [
          {
            id: 'browse_rates',
            label: 'See Teacher Rates',
            type: 'navigation' as const,
            data: { path: '/teachers' },
            icon: 'search'
          },
          {
            id: 'pricing_guide',
            label: 'Pricing Guide',
            type: 'navigation' as const,
            data: { path: '/blog' },
            icon: 'help'
          }
        ],
        suggestedResponses: [
          "Find affordable teachers",
          "How do I pay teachers?",
          "Are there any hidden fees?",
          "Can I negotiate rates?"
        ]
      })
    },

    // Location and Search
    location: {
      keywords: ['location', 'near me', 'area', 'city', 'online', 'offline', 'distance'],
      response: (userRole?: string) => ({
        content: "Location flexibility is one of our key features! 📍\n\n🌐 **Online Tutoring**: Connect with teachers from anywhere\n🏠 **Home Tutoring**: Teachers who can visit your location\n🏫 **Coaching Centers**: Teachers with dedicated spaces\n📍 **Distance-Based Search**: Find teachers within your preferred radius\n\nYou can filter by teaching mode and location preferences to find the perfect match!",
        actions: [
          {
            id: 'search_location',
            label: 'Search by Location',
            type: 'navigation' as const,
            data: { path: '/search/teachers' },
            icon: 'map-pin'
          },
          {
            id: 'online_teachers',
            label: 'Online Teachers',
            type: 'search' as const,
            data: { filter: 'online' },
            icon: 'monitor'
          }
        ],
        suggestedResponses: [
          "Find online teachers",
          "Teachers who can visit home",
          "Search in my city",
          "How far do teachers travel?"
        ]
      })
    }
  };

  // Match user input to response patterns
  for (const [key, pattern] of Object.entries(responses)) {
    if (pattern.keywords.some(keyword => lowerInput.includes(keyword))) {
      const responseData = pattern.response(userRole);
      return {
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: responseData.content,
        timestamp: new Date(),
        actions: responseData.actions,
        suggestedResponses: responseData.suggestedResponses
      };
    }
  }

  // Contextual responses based on user role
  if (userRole === 'student' && !lowerInput.includes('teacher')) {
    return {
      id: `msg_${Date.now()}`,
      type: 'ai',
      content: "As a student, I can help you find the perfect tutor! Whether you want to browse teacher profiles, post your learning requirements, or understand how our platform works - I'm here to guide you. What specific subject or type of help are you looking for?",
      timestamp: new Date(),
      actions: [
        {
          id: 'post_job',
          label: 'Post Learning Requirements',
          type: 'navigation',
          data: { path: '/student/jobs/create' },
          icon: 'plus'
        },
        {
          id: 'browse_teachers',
          label: 'Browse Teachers',
          type: 'navigation',
          data: { path: '/teachers' },
          icon: 'users'
        }
      ],
      suggestedResponses: [
        "I need help with Math",
        "Find English teachers",
        "Post my requirements",
        "How do I choose a teacher?"
      ]
    };
  }

  if (userRole === 'teacher' && !lowerInput.includes('student')) {
    return {
      id: `msg_${Date.now()}`,
      type: 'ai',
      content: "Welcome, teacher! 👨‍🏫 I can help you maximize your success on ShikshaGuru. Whether you want to optimize your profile, find relevant job opportunities, or understand how to attract more students - I'm here to assist. What would you like to focus on?",
      timestamp: new Date(),
      actions: [
        {
          id: 'dashboard',
          label: 'Go to Dashboard',
          type: 'navigation',
          data: { path: '/teacher/dashboard' },
          icon: 'dashboard'
        },
        {
          id: 'view_jobs',
          label: 'Find Job Opportunities',
          type: 'navigation',
          data: { path: '/jobs' },
          icon: 'briefcase'
        }
      ],
      suggestedResponses: [
        "How to get more students?",
        "Optimize my profile",
        "Find relevant jobs",
        "Set competitive rates"
      ]
    };
  }

  // Default intelligent response
  return {
    id: `msg_${Date.now()}`,
    type: 'ai',
    content: "I'm here to help you navigate ShikshaGuru! I can assist with finding tutors, posting learning requirements, creating teacher profiles, understanding our platform, or answering questions about subjects, pricing, and locations. What would you like to know more about?",
    timestamp: new Date(),
    actions: [
      {
        id: 'find_tutors',
        label: 'Find Tutors',
        type: 'navigation',
        data: { path: '/teachers' },
        icon: 'search'
      },
      {
        id: 'post_requirement',
        label: 'Post Requirement',
        type: 'navigation',
        data: { path: '/student/jobs/create' },
        icon: 'plus'
      },
      {
        id: 'become_teacher',
        label: 'Become a Teacher',
        type: 'navigation',
        data: { path: '/teacher/profile/create' },
        icon: 'user'
      }
    ],
    suggestedResponses: [
      "How does ShikshaGuru work?",
      "Find Math teachers",
      "Post my learning needs",
      "Become a teacher"
    ]
  };
};

/**
 * Start or continue AI conversation
 * POST /api/ai-chat/conversation
 */
export const startConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, conversationId } = req.body;
    const user = req.user;
    
    let conversation: AIConversation;
    
    if (conversationId && conversations.has(conversationId)) {
      conversation = conversations.get(conversationId)!;
    } else {
      // Create new conversation
      const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const welcomeMessage: AIMessage = {
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: getWelcomeMessage(user),
        timestamp: new Date(),
        actions: getInitialActions(user?.role),
        suggestedResponses: getInitialSuggestions(user?.role)
      };

      conversation = {
        id: newConversationId,
        userId: user?._id?.toString(),
        messages: [welcomeMessage],
        context: {
          userRole: user?.role || 'guest',
          currentPage: req.headers.referer || '/',
          lastActivity: new Date(),
          sessionData: {}
        }
      };
      
      conversations.set(newConversationId, conversation);
    }

    if (message && message.trim()) {
      // Add user message
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}`,
        type: 'user',
        content: message.trim(),
        timestamp: new Date()
      };
      
      conversation.messages.push(userMessage);
      
      // Generate AI response
      const aiResponse = generateAIResponse(message, conversation, user?.role);
      conversation.messages.push(aiResponse);
      
      // Update conversation
      conversation.context.lastActivity = new Date();
      conversations.set(conversation.id, conversation);
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error in AI chat conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process conversation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get conversation history
 * GET /api/ai-chat/conversation/:id
 */
export const getConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Update last activity
    conversation.context.lastActivity = new Date();
    conversations.set(id, conversation);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Handle AI action execution
 * POST /api/ai-chat/action
 */
export const executeAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { actionId, actionData, conversationId } = req.body;
    
    // Log action for analytics
    console.log(`AI Action executed: ${actionId}`, actionData);
    
    // Here you could implement specific action handlers
    // For now, we'll just acknowledge the action
    
    res.json({
      success: true,
      message: 'Action executed successfully',
      data: {
        actionId,
        actionData,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error executing AI action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute action',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper functions
const getWelcomeMessage = (user?: any): string => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  if (user) {
    const firstName = user.profile?.firstName || 'there';
    return `${greeting}, ${firstName}! 👋 I'm your ShikshaGuru AI assistant. I'm here to help you navigate the platform, ${
      user.role === 'student' ? 'find perfect tutors, post learning requirements,' : 
      user.role === 'teacher' ? 'attract students, optimize your profile,' : 
      'explore our features,'
    } or answer any questions you might have. How can I assist you today?`;
  }
  
  return `${greeting}! 👋 Welcome to ShikshaGuru! I'm your AI assistant, here to help you discover our tutoring marketplace. Whether you're looking for a tutor or want to become one, I can guide you through everything. What would you like to know?`;
};

const getInitialActions = (userRole?: string): AIAction[] => {
  const baseActions: AIAction[] = [
    {
      id: 'browse_teachers',
      label: 'Browse Teachers',
      type: 'navigation',
      data: { path: '/teachers' },
      icon: 'users'
    },
    {
      id: 'view_jobs',
      label: 'View Jobs',
      type: 'navigation',
      data: { path: '/jobs' },
      icon: 'briefcase'
    },
    {
      id: 'search_location',
      label: 'Search by Location',
      type: 'navigation',
      data: { path: '/search/teachers' },
      icon: 'map-pin'
    }
  ];

  if (userRole === 'student') {
    baseActions.unshift({
      id: 'post_job',
      label: 'Post Learning Requirements',
      type: 'navigation',
      data: { path: '/student/jobs/create' },
      icon: 'plus'
    });
  } else if (userRole === 'teacher') {
    baseActions.unshift({
      id: 'dashboard',
      label: 'My Dashboard',
      type: 'navigation',
      data: { path: '/teacher/dashboard' },
      icon: 'dashboard'
    });
  }

  return baseActions;
};

const getInitialSuggestions = (userRole?: string): string[] => {
  const baseSuggestions = [
    "How does ShikshaGuru work?",
    "Find teachers near me",
    "What subjects are available?"
  ];

  if (userRole === 'student') {
    return [
      "I'm looking for a tutor",
      "Post my learning requirements",
      ...baseSuggestions
    ];
  } else if (userRole === 'teacher') {
    return [
      "How to get more students?",
      "Optimize my profile",
      ...baseSuggestions
    ];
  }

  return [
    "I'm looking for a tutor",
    "I want to become a teacher",
    ...baseSuggestions
  ];
};

// Cleanup old conversations (run periodically)
export const cleanupConversations = () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  for (const [id, conversation] of conversations.entries()) {
    if (conversation.context.lastActivity && conversation.context.lastActivity < oneHourAgo) {
      conversations.delete(id);
    }
  }
  
  console.log(`AI Chat: Cleaned up old conversations. Active conversations: ${conversations.size}`);
};

// Run cleanup every hour
setInterval(cleanupConversations, 60 * 60 * 1000);