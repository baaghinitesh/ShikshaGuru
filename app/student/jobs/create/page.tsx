'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';

interface JobPostingData {
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  teachingMode: 'online' | 'offline' | 'both';
  duration: {
    type: 'short-term' | 'long-term' | 'ongoing';
    hours: number;
    frequency: string;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    preferredTimes: string[];
    flexibility: 'strict' | 'flexible' | 'very-flexible';
  };
  budget: {
    type: 'hourly' | 'per-session' | 'monthly' | 'total';
    min: number;
    max: number;
  };
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: [number, number];
  };
  requirements: {
    experience: string;
    qualifications: string[];
    languages: string[];
    gender?: 'male' | 'female' | 'any';
    maxDistance: number;
  };
  urgency: 'immediate' | 'within-week' | 'within-month' | 'flexible';
  contactPreference: 'phone' | 'whatsapp' | 'email' | 'any';
  additionalDetails: string;
}

export default function CreateJobPosting() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<JobPostingData>({
    title: '',
    description: '',
    subject: '',
    classLevel: '',
    teachingMode: 'both',
    duration: {
      type: 'long-term',
      hours: 1,
      frequency: 'weekly'
    },
    schedule: {
      startDate: '',
      endDate: '',
      preferredTimes: [],
      flexibility: 'flexible'
    },
    budget: {
      type: 'hourly',
      min: 0,
      max: 0
    },
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: [0, 0]
    },
    requirements: {
      experience: '',
      qualifications: [],
      languages: [],
      gender: 'any',
      maxDistance: 10
    },
    urgency: 'flexible',
    contactPreference: 'any',
    additionalDetails: ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof JobPostingData],
        [childField]: value
      }
    }));
  };

  const handleArrayToggle = (parentField: string, childField: string, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[parentField as keyof JobPostingData] as any)[childField] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item: string) => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [parentField]: {
          ...prev[parentField as keyof JobPostingData],
          [childField]: newArray
        }
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.subject || !formData.classLevel) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.budget.min <= 0 || formData.budget.max <= 0) {
        alert('Please set a valid budget range');
        return;
      }

      if (!formData.location.address || !formData.location.city) {
        alert('Please provide location details');
        return;
      }

      // Submit to API
      const response = await apiClient.createJob(formData);
      
      if (response.success !== false) {
        alert('Job posted successfully!');
        router.push('/student/dashboard');
      } else {
        throw new Error(response.message || 'Failed to create job posting');
      }
    } catch (error: any) {
      console.error('Error creating job posting:', error);
      alert(error.message || 'Failed to create job posting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 
    'Geography', 'Economics', 'Political Science', 'Computer Science', 'Accountancy',
    'Business Studies', 'Psychology', 'Sociology', 'Philosophy', 'Music', 'Art'
  ];

  const classLevelOptions = [
    'Pre-KG', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
    'Undergraduate', 'Postgraduate', 'Competitive Exams'
  ];

  const languageOptions = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu'
  ];

  const qualificationOptions = [
    'B.Ed', 'M.Ed', 'PhD', 'Masters Degree', 'Bachelors Degree', 'Teaching Experience',
    'Subject Expertise', 'Competition Coaching Experience'
  ];

  const timeSlots = [
    'Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-3 PM)',
    'Evening (3-6 PM)', 'Late Evening (6-9 PM)', 'Night (9-11 PM)'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Post a Tutoring Job</h1>
            <p className="text-gray-600 mt-2">Find the perfect teacher for your learning needs</p>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep} of 4</span>
                <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mathematics tutor needed for Class 10 CBSE"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what you're looking for, learning goals, current level, specific topics to cover..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Level *
                  </label>
                  <select
                    value={formData.classLevel}
                    onChange={(e) => handleInputChange('classLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Class Level</option>
                    {classLevelOptions.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teaching Mode *
                </label>
                <div className="flex space-x-4">
                  {['online', 'offline', 'both'].map((mode) => (
                    <label key={mode} className="flex items-center">
                      <input
                        type="radio"
                        name="teachingMode"
                        value={mode}
                        checked={formData.teachingMode === mode}
                        onChange={(e) => handleInputChange('teachingMode', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {mode === 'both' ? 'Both Online & Offline' : mode}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="immediate">Need Immediately</option>
                  <option value="within-week">Within a Week</option>
                  <option value="within-month">Within a Month</option>
                  <option value="flexible">Flexible Timeline</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Schedule & Duration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Schedule & Duration</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Duration Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['short-term', 'long-term', 'ongoing'].map((type) => (
                    <label key={type} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="durationType"
                        value={type}
                        checked={formData.duration.type === type}
                        onChange={(e) => handleNestedChange('duration', 'type', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {type.replace('-', ' ')}
                        </span>
                        <p className="text-xs text-gray-600">
                          {type === 'short-term' && '1-4 weeks'}
                          {type === 'long-term' && '1-6 months'}
                          {type === 'ongoing' && 'Regular sessions'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours per Session
                  </label>
                  <select
                    value={formData.duration.hours}
                    onChange={(e) => handleNestedChange('duration', 'hours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0.5}>30 minutes</option>
                    <option value={1}>1 hour</option>
                    <option value={1.5}>1.5 hours</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.duration.frequency}
                    onChange={(e) => handleNestedChange('duration', 'frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="alternate-days">Alternate Days</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.schedule.startDate}
                    onChange={(e) => handleNestedChange('schedule', 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.schedule.endDate}
                    onChange={(e) => handleNestedChange('schedule', 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time Slots
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <label key={slot} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.schedule.preferredTimes.includes(slot)}
                        onChange={() => {
                          const newTimes = formData.schedule.preferredTimes.includes(slot)
                            ? formData.schedule.preferredTimes.filter(t => t !== slot)
                            : [...formData.schedule.preferredTimes, slot];
                          handleNestedChange('schedule', 'preferredTimes', newTimes);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{slot}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Flexibility
                </label>
                <div className="flex space-x-4">
                  {['strict', 'flexible', 'very-flexible'].map((flex) => (
                    <label key={flex} className="flex items-center">
                      <input
                        type="radio"
                        name="flexibility"
                        value={flex}
                        checked={formData.schedule.flexibility === flex}
                        onChange={(e) => handleNestedChange('schedule', 'flexibility', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {flex.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Budget & Location</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Budget Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['hourly', 'per-session', 'monthly', 'total'].map((type) => (
                    <label key={type} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="budgetType"
                        value={type}
                        checked={formData.budget.type === type}
                        onChange={(e) => handleNestedChange('budget', 'type', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                        {type.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.budget.min}
                    onChange={(e) => handleNestedChange('budget', 'min', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.budget.max}
                    onChange={(e) => handleNestedChange('budget', 'max', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1500"
                    min={formData.budget.min}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => handleNestedChange('location', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={formData.location.pincode}
                    onChange={(e) => handleNestedChange('location', 'pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Distance for Home Tuition (km)
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={formData.requirements.maxDistance}
                  onChange={(e) => handleNestedChange('requirements', 'maxDistance', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>1 km</span>
                  <span>{formData.requirements.maxDistance} km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Requirements & Contact */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Teacher Requirements & Contact</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Experience Required
                </label>
                <select
                  value={formData.requirements.experience}
                  onChange={(e) => handleNestedChange('requirements', 'experience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No specific requirement</option>
                  <option value="fresher">Fresher (0-1 year)</option>
                  <option value="beginner">Beginner (1-2 years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="experienced">Experienced (5+ years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Qualifications
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {qualificationOptions.map((qualification) => (
                    <label key={qualification} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requirements.qualifications.includes(qualification)}
                        onChange={() => handleArrayToggle('requirements', 'qualifications', qualification)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{qualification}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language Requirements
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {languageOptions.map((language) => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requirements.languages.includes(language)}
                        onChange={() => handleArrayToggle('requirements', 'languages', language)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{language}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Preference (Optional)
                </label>
                <div className="flex space-x-4">
                  {['any', 'male', 'female'].map((gender) => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.requirements.gender === gender}
                        onChange={(e) => handleNestedChange('requirements', 'gender', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {gender === 'any' ? 'No Preference' : gender}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['any', 'phone', 'whatsapp', 'email'].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="radio"
                        name="contactPreference"
                        value={method}
                        checked={formData.contactPreference === method}
                        onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {method === 'any' ? 'Any Method' : method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={formData.additionalDetails}
                  onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional requirements, expectations, or information about the student's learning style, goals, etc."
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📋 Job Posting Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Be specific about your learning goals and current level</li>
                  <li>• Mention any upcoming exams or deadlines</li>
                  <li>• Include your preferred communication style</li>
                  <li>• Be realistic about budget and time commitments</li>
                  <li>• Specify if you need help with specific topics or overall subject</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Posting Job...' : 'Post Job'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}