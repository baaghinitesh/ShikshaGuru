'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';

interface TeacherProfileData {
  // Basic Information
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  profilePhoto: string;
  
  // Contact Information
  email: string;
  phone: string;
  whatsappNumber: string;
  hidePhoneNumber: boolean;
  
  // Location
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  travelRadius: number; // in km
  
  // Professional Information
  headline: string;
  bio: string;
  experience: number; // years
  
  // Education
  education: Array<{
    degree: string;
    institution: string;
    year: number;
    percentage: number;
    documents: string[];
  }>;
  
  // Subjects & Teaching
  subjects: string[];
  classLevels: string[];
  languages: string[];
  teachingMode: ('online' | 'offline' | 'both')[];
  
  // Rates & Availability
  hourlyRate: {
    min: number;
    max: number;
  };
  availability: {
    [key: string]: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
    };
  };
  
  // Verification Documents
  documents: {
    aadharCard: string;
    panCard: string;
    educationCertificates: string[];
    experienceCertificates: string[];
    otherDocuments: string[];
  };
  
  // Additional Information
  achievements: string[];
  specializations: string[];
  teachingPhilosophy: string;
  demoVideoUrl: string;
  socialMediaLinks: {
    linkedin: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

export default function CreateTeacherProfile() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<TeacherProfileData>({
    fullName: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    profilePhoto: '',
    email: user?.email || '',
    phone: '',
    whatsappNumber: '',
    hidePhoneNumber: false,
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    travelRadius: 10,
    headline: '',
    bio: '',
    experience: 0,
    education: [{
      degree: '',
      institution: '',
      year: new Date().getFullYear(),
      percentage: 0,
      documents: []
    }],
    subjects: [],
    classLevels: [],
    languages: [],
    teachingMode: [],
    hourlyRate: {
      min: 0,
      max: 0
    },
    availability: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false }
    },
    documents: {
      aadharCard: '',
      panCard: '',
      educationCertificates: [],
      experienceCertificates: [],
      otherDocuments: []
    },
    achievements: [],
    specializations: [],
    teachingPhilosophy: '',
    demoVideoUrl: '',
    socialMediaLinks: {
      linkedin: '',
      facebook: '',
      instagram: '',
      youtube: ''
    }
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
        ...prev[parentField as keyof TeacherProfileData],
        [childField]: value
      }
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        institution: '',
        year: new Date().getFullYear(),
        percentage: 0,
        documents: []
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.fullName || !formData.phone || !formData.headline || !formData.bio) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.subjects.length === 0) {
        alert('Please select at least one subject');
        return;
      }

      if (formData.classLevels.length === 0) {
        alert('Please select at least one class level');
        return;
      }

      // Submit to API
      const response = await apiClient.createTeacherProfile(formData);
      
      if (response.success !== false) {
        alert('Teacher profile created successfully!');
        router.push('/teacher/dashboard');
      } else {
        throw new Error(response.message || 'Failed to create profile');
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      alert(error.message || 'Failed to create teacher profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 
    'Geography', 'Economics', 'Political Science', 'Computer Science', 'Accountancy',
    'Business Studies', 'Psychology', 'Sociology', 'Philosophy', 'Music', 'Art',
    'Physical Education', 'Home Science'
  ];

  const classLevelOptions = [
    'Pre-KG', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
    'Undergraduate', 'Postgraduate', 'Competitive Exams', 'Professional Courses'
  ];

  const languageOptions = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 
    'Urdu', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Teacher Profile</h1>
            <p className="text-gray-600 mt-2">Complete your profile to start teaching on ShikshaGuru</p>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep} of 6</span>
                <span>{Math.round((currentStep / 6) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 12345 67890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 12345 67890"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hidePhoneNumber}
                      onChange={(e) => handleInputChange('hidePhoneNumber', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Hide phone number from public profile
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hideWhatsAppNumber || false}
                      onChange={(e) => handleInputChange('hideWhatsAppNumber', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Hide WhatsApp number from public profile
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Headline *
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Experienced Mathematics Teacher for Classes 9-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio/About Yourself *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell students about your teaching experience, methodology, and what makes you unique..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Location & Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Location & Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your complete address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={formData.address.pincode}
                    onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Radius (km) *
                  </label>
                  <input
                    type="number"
                    value={formData.travelRadius}
                    onChange={(e) => handleInputChange('travelRadius', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                    min="1"
                    max="100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum distance you can travel for home tuitions
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Education & Experience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Education & Experience</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teaching Experience (Years) *
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                  min="0"
                  max="50"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Educational Qualifications</h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Education
                  </button>
                </div>
                
                {formData.education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                      {formData.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Degree/Qualification *
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].degree = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="B.Sc. Mathematics"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution *
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].institution = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="University/College Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year of Completion *
                        </label>
                        <input
                          type="number"
                          value={edu.year}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].year = parseInt(e.target.value);
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="2020"
                          min="1950"
                          max={new Date().getFullYear() + 10}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Percentage/CGPA
                        </label>
                        <input
                          type="number"
                          value={edu.percentage}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].percentage = parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="85.5"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Subjects & Teaching */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Subjects & Teaching Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects You Teach *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {subjectOptions.map((subject) => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              subjects: [...prev.subjects, subject]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              subjects: prev.subjects.filter(s => s !== subject)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Levels *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {classLevelOptions.map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.classLevels.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              classLevels: [...prev.classLevels, level]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              classLevels: prev.classLevels.filter(l => l !== level)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages You Can Teach In *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languageOptions.map((language) => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              languages: [...prev.languages, language]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              languages: prev.languages.filter(l => l !== language)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{language}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teaching Mode *
                </label>
                <div className="space-y-2">
                  {['online', 'offline', 'both'].map((mode) => (
                    <label key={mode} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.teachingMode.includes(mode as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              teachingMode: [...prev.teachingMode, mode as any]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              teachingMode: prev.teachingMode.filter(m => m !== mode)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                  Teaching Philosophy
                </label>
                <textarea
                  value={formData.teachingPhilosophy}
                  onChange={(e) => handleInputChange('teachingPhilosophy', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your teaching approach and philosophy..."
                />
              </div>
            </div>
          )}

          {/* Step 5: Rates & Availability */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Rates & Availability</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Hourly Rate (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate.min}
                    onChange={(e) => handleNestedChange('hourlyRate', 'min', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Hourly Rate (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate.max}
                    onChange={(e) => handleNestedChange('hourlyRate', 'max', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1500"
                    min={formData.hourlyRate.min}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Availability</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Day</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Morning<br/>(6-12 PM)</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Afternoon<br/>(12-6 PM)</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Evening<br/>(6-10 PM)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(formData.availability).map(([day, times]) => (
                        <tr key={day}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                            {day}
                          </td>
                          {['morning', 'afternoon', 'evening'].map((period) => (
                            <td key={period} className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={times[period as keyof typeof times]}
                                onChange={(e) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    availability: {
                                      ...prev.availability,
                                      [day]: {
                                        ...prev.availability[day],
                                        [period]: e.target.checked
                                      }
                                    }
                                  }));
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Additional Information */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievements & Awards
                </label>
                <textarea
                  value={formData.achievements.join('\n')}
                  onChange={(e) => handleInputChange('achievements', e.target.value.split('\n').filter(a => a.trim()))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List your achievements (one per line)..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <textarea
                  value={formData.specializations.join('\n')}
                  onChange={(e) => handleInputChange('specializations', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., IIT-JEE Preparation, NEET Biology, Competitive Mathematics..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo Video URL
                </label>
                <input
                  type="url"
                  value={formData.demoVideoUrl}
                  onChange={(e) => handleInputChange('demoVideoUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.socialMediaLinks.linkedin}
                      onChange={(e) => handleNestedChange('socialMediaLinks', 'linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={formData.socialMediaLinks.youtube}
                      onChange={(e) => handleNestedChange('socialMediaLinks', 'youtube', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://youtube.com/c/..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.socialMediaLinks.facebook}
                      onChange={(e) => handleNestedChange('socialMediaLinks', 'facebook', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.socialMediaLinks.instagram}
                      onChange={(e) => handleNestedChange('socialMediaLinks', 'instagram', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">📋 Document Upload</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  You can upload your verification documents after creating your profile from the dashboard.
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Aadhar Card (for verification)</li>
                  <li>• PAN Card (optional)</li>
                  <li>• Education Certificates</li>
                  <li>• Experience Certificates</li>
                  <li>• Profile Photo</li>
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
            
            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
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
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}