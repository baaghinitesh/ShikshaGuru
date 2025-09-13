interface WhatsAppMessageTemplate {
  subject: string;
  message: string;
}

interface ContactInfo {
  name: string;
  role?: 'teacher' | 'student';
  subjects?: string[];
  experience?: number;
  location?: {
    city?: string;
    state?: string;
  };
  hourlyRate?: {
    min?: number;
    max?: number;
  };
}

export class WhatsAppService {
  private static platformName = 'ShikshaGuru';
  private static platformUrl = 'https://shikshaguru.com';

  /**
   * Format phone number for WhatsApp
   * Removes special characters and ensures proper format
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    
    // If number doesn't start with country code, assume India (+91)
    if (cleaned.length === 10 && cleaned.match(/^[6-9]/)) {
      return `91${cleaned}`;
    }
    
    // If starts with 0, remove it and add India code
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `91${cleaned.substring(1)}`;
    }
    
    // If already has country code or is international
    return cleaned;
  }

  /**
   * Validate WhatsApp number format
   */
  static isValidWhatsAppNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    
    // Check if it's a valid length (5-15 digits as per E.164)
    if (cleaned.length < 5 || cleaned.length > 15) {
      return false;
    }
    
    // Check if it's a valid Indian number (if 10 digits)
    if (cleaned.length === 10) {
      return /^[6-9]\d{9}$/.test(cleaned);
    }
    
    // For international numbers, basic validation
    return /^[1-9]\d{4,14}$/.test(cleaned);
  }

  /**
   * Generate teacher contact message templates
   */
  static getTeacherContactTemplates(teacher: ContactInfo): WhatsAppMessageTemplate[] {
    const templates: WhatsAppMessageTemplate[] = [
      {
        subject: 'General Inquiry',
        message: `Hi ${teacher.name}, I found your profile on ${this.platformName} and I'm interested in your teaching services. Could we discuss my learning requirements?`
      },
      {
        subject: 'Subject Specific',
        message: `Hello ${teacher.name}, I need help with ${teacher.subjects?.join(', ') || 'studies'} and found your profile on ${this.platformName}. Would you be available for tutoring sessions?`
      },
      {
        subject: 'Schedule Discussion',
        message: `Hi ${teacher.name}, I'm looking for a tutor ${teacher.location?.city ? `in ${teacher.location.city}` : ''} and came across your profile on ${this.platformName}. Can we discuss your availability and schedule?`
      }
    ];

    if (teacher.hourlyRate?.min && teacher.hourlyRate?.max) {
      templates.push({
        subject: 'Pricing Inquiry',
        message: `Hello ${teacher.name}, I saw your teaching profile on ${this.platformName}. I'm interested in your services and would like to know more about your pricing structure (₹${teacher.hourlyRate.min}-₹${teacher.hourlyRate.max}/hour). When would be a good time to discuss?`
      });
    }

    return templates;
  }

  /**
   * Generate student contact message templates
   */
  static getStudentContactTemplates(student: ContactInfo, jobTitle?: string): WhatsAppMessageTemplate[] {
    return [
      {
        subject: 'Job Application',
        message: `Hi ${student.name}, I'm interested in the tutoring opportunity${jobTitle ? ` for "${jobTitle}"` : ''} you posted on ${this.platformName}. I'd like to discuss how I can help with the requirements.`
      },
      {
        subject: 'Follow up',
        message: `Hello ${student.name}, I applied for your tutoring request on ${this.platformName}. I wanted to follow up and see if you'd like to discuss the teaching opportunity further.`
      },
      {
        subject: 'Introduction',
        message: `Hi ${student.name}, I came across your tutoring requirement on ${this.platformName}. With my teaching experience, I believe I can help achieve your learning goals. Could we schedule a brief call?`
      }
    ];
  }

  /**
   * Generate emergency/quick contact template
   */
  static getQuickContactTemplate(contactName: string, senderName?: string): string {
    const greeting = senderName ? `Hi ${contactName}, this is ${senderName}` : `Hi ${contactName}`;
    return `${greeting}, I found your profile on ${this.platformName} and would like to connect. Are you available for a quick chat?`;
  }

  /**
   * Generate booking confirmation template
   */
  static getBookingTemplate(teacherName: string, studentName: string, subject: string, dateTime: string): string {
    return `Hi ${teacherName}, ${studentName} has booked a session with you for ${subject} on ${dateTime} through ${this.platformName}. Please confirm your availability.`;
  }

  /**
   * Generate lesson reminder template
   */
  static getLessonReminderTemplate(recipientName: string, subject: string, time: string, isTeacher = false): string {
    const role = isTeacher ? 'lesson' : 'session';
    return `Hi ${recipientName}, this is a reminder about your ${subject} ${role} scheduled for ${time}. Looking forward to our session! - ${this.platformName}`;
  }

  /**
   * Open WhatsApp with pre-filled message
   */
  static openWhatsApp(phoneNumber: string, message: string, newTab = true): void {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    
    if (newTab) {
      window.open(whatsappUrl, '_blank');
    } else {
      window.location.href = whatsappUrl;
    }
  }

  /**
   * Open WhatsApp Web with pre-filled message
   */
  static openWhatsAppWeb(phoneNumber: string, message: string): void {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Get WhatsApp business features for teachers
   */
  static getBusinessFeatures() {
    return {
      quickReplies: [
        'Thank you for your interest! I am currently accepting new students.',
        'I offer both online and offline classes. Which would you prefer?',
        'My typical response time is within 2-4 hours during business hours.',
        'I provide trial classes to help students understand my teaching methodology.',
        'I offer flexible scheduling to accommodate your preferred time slots.'
      ],
      awayMessage: 'Thank you for contacting me! I am currently away but will respond to your message as soon as possible. For urgent inquiries, please mention "URGENT" in your message.',
      welcomeMessage: `Welcome to my teaching services! I'm glad you found me through ${this.platformName}. How can I help you with your learning goals today?`
    };
  }

  /**
   * Generate platform signature for messages
   */
  static getPlatformSignature(): string {
    return `\n\n--\nConnected via ${this.platformName}\n${this.platformUrl}`;
  }

  /**
   * Add platform signature to message
   */
  static addSignature(message: string): string {
    return message + this.getPlatformSignature();
  }

  /**
   * Generate sharing message for profiles
   */
  static generateProfileShareMessage(profileType: 'teacher' | 'student', name: string, profileUrl: string): string {
    const action = profileType === 'teacher' ? 'teaching services' : 'tutoring requirements';
    return `Check out ${name}'s ${action} on ${this.platformName}: ${profileUrl}`;
  }
}

// Export constants for easy use
export const WHATSAPP_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 4096, // WhatsApp message character limit
  BUSINESS_HOURS: {
    START: '09:00',
    END: '21:00'
  },
  COMMON_SUBJECTS: [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'Hindi', 'Science', 'Computer Science', 'Economics', 'Accountancy'
  ]
};

export default WhatsAppService;