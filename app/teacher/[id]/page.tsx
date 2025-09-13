'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import WhatsAppContact from '@/components/whatsapp-contact';

interface TeacherProfile {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  profilePhoto: string;
  experience: number;
  subjects: string[];
  classLevels: string[];
  languages: string[];
  teachingMode: string[];
  hourlyRate: {
    min: number;
    max: number;
  };
  location: {
    city: string;
    state: string;
  };
  travelRadius: number;
  rating: number;
  totalReviews: number;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
    percentage: number;
  }>;
  achievements: string[];
  specializations: string[];
  teachingPhilosophy: string;
  demoVideoUrl: string;
  socialMediaLinks: {
    linkedin: string;
    youtube: string;
    facebook: string;
    instagram: string;
  };
  availability: {
    [key: string]: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
    };
  };
  phoneVisible: boolean;
  phone: string;
  whatsappNumber: string;
  reviews: Array<{
    id: string;
    studentName: string;
    rating: number;
    comment: string;
    subject: string;
    date: string;
  }>;
}

export default function TeacherProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    // TODO: Fetch teacher profile from API
    setTimeout(() => {
      const mockTeacher: TeacherProfile = {
        id: teacherId,
        fullName: 'Dr. Rajesh Kumar',
        headline: 'Experienced Mathematics Teacher for Classes 9-12 & JEE Preparation',
        bio: 'I am a passionate mathematics teacher with over 8 years of experience in teaching students from classes 9-12 and preparing them for competitive exams like JEE. My teaching methodology focuses on building strong fundamentals and problem-solving skills.',
        profilePhoto: 'https://via.placeholder.com/200x200?text=Teacher',
        experience: 8,
        subjects: ['Mathematics', 'Physics'],
        classLevels: ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Competitive Exams'],
        languages: ['English', 'Hindi'],
        teachingMode: ['both'],
        hourlyRate: {
          min: 800,
          max: 1500
        },
        location: {
          city: 'Delhi',
          state: 'Delhi'
        },
        travelRadius: 15,
        rating: 4.8,
        totalReviews: 47,
        education: [
          {
            degree: 'M.Sc. Mathematics',
            institution: 'Delhi University',
            year: 2015,
            percentage: 87.5
          },
          {
            degree: 'B.Sc. Mathematics Honors',
            institution: 'St. Stephens College',
            year: 2013,
            percentage: 85.0
          }
        ],
        achievements: [
          'Best Teacher Award 2023 - Local Education Board',
          '100% success rate in JEE Main preparation',
          'Published research paper on innovative teaching methods'
        ],
        specializations: [
          'JEE Main & Advanced Preparation',
          'CBSE Board Exam Coaching',
          'Calculus and Trigonometry Expert'
        ],
        teachingPhilosophy: 'I believe in making mathematics fun and accessible to all students. My approach is to start with basic concepts and gradually build complexity, ensuring every student understands the fundamentals before moving forward.',
        demoVideoUrl: 'https://youtube.com/watch?v=demo123',
        socialMediaLinks: {
          linkedin: 'https://linkedin.com/in/rajeshkumar',
          youtube: 'https://youtube.com/c/rajeshmath',
          facebook: '',
          instagram: ''
        },
        availability: {
          monday: { morning: true, afternoon: true, evening: false },
          tuesday: { morning: true, afternoon: true, evening: true },
          wednesday: { morning: true, afternoon: false, evening: true },
          thursday: { morning: true, afternoon: true, evening: true },
          friday: { morning: true, afternoon: true, evening: false },
          saturday: { morning: true, afternoon: true, evening: true },
          sunday: { morning: false, afternoon: false, evening: false }
        },
        phoneVisible: false,
        phone: '+91 98765 43210',
        whatsappNumber: '+91 98765 43210',
        reviews: [
          {
            id: '1',
            studentName: 'Priya S.',
            rating: 5,
            comment: 'Excellent teacher! Helped me improve my math scores from 60% to 90% in just 6 months.',
            subject: 'Mathematics',
            date: '2024-01-10'
          },
          {
            id: '2',
            studentName: 'Arjun M.',
            rating: 5,
            comment: 'Best JEE preparation teacher. His problem-solving techniques are amazing.',
            subject: 'Mathematics',
            date: '2024-01-05'
          },
          {
            id: '3',
            studentName: 'Sneha R.',
            rating: 4,
            comment: 'Very patient teacher. Explains concepts clearly and provides good practice materials.',
            subject: 'Mathematics',
            date: '2023-12-28'
          }
        ]
      };
      
      setTeacher(mockTeacher);
      setLoading(false);
    }, 1000);
  }, [teacherId]);

  const handleContactTeacher = () => {
    setShowContact(true);
  };

  // WhatsApp contact now handled by WhatsAppContact component

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Teacher Not Found</h1>
          <p className="text-gray-600">The teacher profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={teacher.profilePhoto}
                alt={teacher.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {teacher.fullName}
                </h1>
                <p className="text-xl text-gray-600 mb-3">
                  {teacher.headline}
                </p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {renderStars(teacher.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {teacher.rating} ({teacher.totalReviews} reviews)
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">
                    {teacher.experience} years experience
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">
                    {teacher.location.city}, {teacher.location.state}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {teacher.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{teacher.hourlyRate.min} - ₹{teacher.hourlyRate.max}
                  </div>
                  <div className="text-sm text-gray-600">per hour</div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleContactTeacher}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Contact Teacher
                  </button>
                  <WhatsAppContact
                    contact={{
                      name: teacher.fullName,
                      whatsappNumber: teacher.whatsappNumber,
                      role: 'teacher',
                      subjects: teacher.subjects,
                      experience: teacher.experience,
                      location: teacher.location,
                      hourlyRate: teacher.hourlyRate
                    }}
                    variant="button"
                    size="md"
                    showTemplates={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{teacher.bio}</p>
                
                {teacher.teachingPhilosophy && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Teaching Philosophy</h3>
                    <p className="text-gray-700 leading-relaxed">{teacher.teachingPhilosophy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {teacher.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>Year: {edu.year}</span>
                        {edu.percentage > 0 && <span>Score: {edu.percentage}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Specializations & Achievements */}
            {(teacher.specializations.length > 0 || teacher.achievements.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  {teacher.specializations.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Specializations</h2>
                      <div className="flex flex-wrap gap-2">
                        {teacher.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {teacher.achievements.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
                      <ul className="space-y-2">
                        {teacher.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <svg
                              className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-700">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Reviews ({teacher.totalReviews})
                </h2>
                <div className="space-y-4">
                  {teacher.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.studentName}</h4>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-600">{review.subject}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Class Levels:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {teacher.classLevels.map((level) => (
                        <span
                          key={level}
                          className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">Languages:</span>
                    <p className="text-sm text-gray-800 mt-1">
                      {teacher.languages.join(', ')}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">Teaching Mode:</span>
                    <p className="text-sm text-gray-800 mt-1 capitalize">
                      {teacher.teachingMode.join(', ').replace('both', 'Online & Offline')}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">Travel Radius:</span>
                    <p className="text-sm text-gray-800 mt-1">
                      Up to {teacher.travelRadius} km
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                <div className="space-y-2">
                  {Object.entries(teacher.availability).map(([day, times]) => (
                    <div key={day} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700 capitalize">{day}</span>
                      <div className="flex space-x-1">
                        {times.morning && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Morning
                          </span>
                        )}
                        {times.afternoon && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Afternoon
                          </span>
                        )}
                        {times.evening && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            Evening
                          </span>
                        )}
                        {!times.morning && !times.afternoon && !times.evening && (
                          <span className="text-gray-400 text-xs">Not Available</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information Modal */}
            {showContact && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    <button
                      onClick={() => setShowContact(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {teacher.phoneVisible && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <p className="text-lg font-semibold text-gray-900">{teacher.phone}</p>
                      </div>
                    )}
                    
                    {teacher.whatsappNumber && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">WhatsApp:</span>
                        <p className="text-lg font-semibold text-gray-900">{teacher.whatsappNumber}</p>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">
                        Connect with {teacher.fullName} on social media:
                      </p>
                      <div className="flex space-x-3">
                        {teacher.socialMediaLinks.linkedin && (
                          <a
                            href={teacher.socialMediaLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            LinkedIn
                          </a>
                        )}
                        {teacher.socialMediaLinks.youtube && (
                          <a
                            href={teacher.socialMediaLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700"
                          >
                            YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}