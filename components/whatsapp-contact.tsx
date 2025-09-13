'use client';

import { useState } from 'react';
import { MessageSquare, Phone, Copy, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import WhatsAppService from '@/lib/services/whatsapp';

interface ContactInfo {
  name: string;
  whatsappNumber?: string;
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

interface WhatsAppContactProps {
  contact: ContactInfo;
  variant?: 'button' | 'icon' | 'link';
  size?: 'sm' | 'md' | 'lg';
  showTemplates?: boolean;
  customMessage?: string;
  jobTitle?: string; // For student contacts
  className?: string;
  children?: React.ReactNode;
}

export default function WhatsAppContact({
  contact,
  variant = 'button',
  size = 'md',
  showTemplates = true,
  customMessage,
  jobTitle,
  className = '',
  children
}: WhatsAppContactProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [message, setMessage] = useState(customMessage || '');

  if (!contact.whatsappNumber) {
    return null;
  }

  if (!WhatsAppService.isValidWhatsAppNumber(contact.whatsappNumber)) {
    return null;
  }

  const templates = contact.role === 'teacher' 
    ? WhatsAppService.getTeacherContactTemplates(contact)
    : WhatsAppService.getStudentContactTemplates(contact, jobTitle);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === 'custom') {
      setMessage(customMessage || '');
    } else if (templateId === 'quick') {
      setMessage(WhatsAppService.getQuickContactTemplate(contact.name));
    } else {
      const template = templates.find((_, index) => index.toString() === templateId);
      if (template) {
        setMessage(template.message);
      }
    }
  };

  const handleSendMessage = (useWhatsAppWeb = false) => {
    if (!message.trim()) {
      toast.error('Please enter a message before sending.');
      return;
    }

    const finalMessage = WhatsAppService.addSignature(message);
    
    if (useWhatsAppWeb) {
      WhatsAppService.openWhatsAppWeb(contact.whatsappNumber!, finalMessage);
    } else {
      WhatsAppService.openWhatsApp(contact.whatsappNumber!, finalMessage);
    }
    
    setIsOpen(false);
    
    toast.success(`Redirecting to WhatsApp to contact ${contact.name}`);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Message copied to clipboard');
  };

  const handleQuickContact = () => {
    const quickMessage = WhatsAppService.getQuickContactTemplate(contact.name);
    const finalMessage = WhatsAppService.addSignature(quickMessage);
    WhatsAppService.openWhatsApp(contact.whatsappNumber!, finalMessage);
    
    toast.success(`Sending quick message to ${contact.name}`);
  };

  const formattedNumber = WhatsAppService.formatPhoneNumber(contact.whatsappNumber);

  // Quick contact without template selection
  if (!showTemplates) {
    const buttonContent = children || (
      <>
        <MessageSquare className="w-4 h-4 mr-2" />
        WhatsApp
      </>
    );

    if (variant === 'icon') {
      return (
        <button
          onClick={handleQuickContact}
          className={`p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors ${className}`}
          title={`Contact ${contact.name} on WhatsApp`}
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      );
    }

    if (variant === 'link') {
      return (
        <button
          onClick={handleQuickContact}
          className={`text-green-600 hover:text-green-700 flex items-center ${className}`}
        >
          {buttonContent}
        </button>
      );
    }

    return (
      <Button
        onClick={handleQuickContact}
        variant="outline"
        size={size}
        className={`bg-green-600 text-white hover:bg-green-700 border-green-600 ${className}`}
      >
        {buttonContent}
      </Button>
    );
  }

  // Full template selection dialog
  const triggerContent = children || (
    <>
      <MessageSquare className="w-4 h-4 mr-2" />
      WhatsApp
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <button
            className={`p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors ${className}`}
            title={`Contact ${contact.name} on WhatsApp`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        ) : variant === 'link' ? (
          <button className={`text-green-600 hover:text-green-700 flex items-center ${className}`}>
            {triggerContent}
          </button>
        ) : (
          <Button
            variant="outline"
            size={size}
            className={`bg-green-600 text-white hover:bg-green-700 border-green-600 ${className}`}
          >
            {triggerContent}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Contact {contact.name} on WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{contact.name}</p>
                {contact.role && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {contact.role}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  +{formattedNumber}
                </p>
                {contact.location?.city && (
                  <p className="text-xs text-gray-500">
                    {contact.location.city}, {contact.location.state}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {(contact.subjects || contact.experience || contact.hourlyRate) && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                {contact.subjects && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {contact.subjects.slice(0, 3).map((subject) => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {contact.subjects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{contact.subjects.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-600">
                  {contact.experience && (
                    <span>{contact.experience} years exp</span>
                  )}
                  {contact.hourlyRate && (
                    <span>₹{contact.hourlyRate.min}-₹{contact.hourlyRate.max}/hr</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Choose Message Template
            </label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a message template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick">Quick Contact</SelectItem>
                {templates.map((template, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {template.subject}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Editor */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[120px]"
              maxLength={4000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {message.length}/4000 characters
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMessage}
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleSendMessage(false)}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!message.trim()}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send via WhatsApp
            </Button>
            <Button
              onClick={() => handleSendMessage(true)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
              disabled={!message.trim()}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              WhatsApp Web
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This will open WhatsApp with your message pre-filled. You can edit it before sending.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}