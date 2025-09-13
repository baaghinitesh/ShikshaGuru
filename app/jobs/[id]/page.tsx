'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';

interface JobDetails {
  id: string;
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
  studentName: string;
  studentContact?: string;
  postedAt: string;
  expiresAt: string;
  applicationsCount: number;
  status: 'active' | 'closed' | 'filled';
  applications?: Array<{
    id: string;
    teacherName: string;
    teacherRating: number;
    appliedAt: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJob(jobId);
      
      if (response.job) {
        setJob(response.job);
      } else {
        // Mock data for development
        const mockJob: JobDetails = {
          id: jobId,
          title: 'Mathematics tutor needed for Class 10 CBSE',
          description: 'Looking for an experienced mathematics teacher to help my daughter with Class 10 CBSE curriculum. She is currently struggling with algebra and needs focused attention on problem-solving techniques. We need someone who can explain concepts clearly and help build confidence in the subject.',
          subject: 'Mathematics',
          classLevel: 'Class 10',
          teachingMode: 'both',
          duration: {
            type: 'long-term',
            hours: 2,
            frequency: 'weekly'
          },
          schedule: {
            startDate: '2024-02-01',
            endDate: '2024-06-30',
            preferredTimes: ['Evening (3-6 PM)', 'Late Evening (6-9 PM)'],
            flexibility: 'flexible'
          },
          budget: {
            type: 'hourly',
            min: 800,
            max: 1200
          },
          location: {
            address: 'Sector 18, Noida',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301'
          },
          requirements: {
            experience: 'intermediate',
            qualifications: ['B.Ed', 'Masters Degree'],
            languages: ['English', 'Hindi'],
            gender: 'any',
            maxDistance: 15
          },
          urgency: 'within-week',
          contactPreference: 'whatsapp',
          additionalDetails: 'My daughter is a bright student but lacks confidence in mathematics. We are looking for a patient teacher who can help her understand concepts rather than just memorizing formulas. Previous experience with CBSE curriculum is preferred.',
          studentName: 'Priya Sharma',
          studentContact: '+91 98765 43210',
          postedAt: '2024-01-15T10:30:00Z',
          expiresAt: '2024-02-15T10:30:00Z',
          applicationsCount: 12,
          status: 'active',
          applications: [
            {
              id: '1',
              teacherName: 'Dr. Rajesh Kumar',
              teacherRating: 4.8,
              appliedAt: '2024-01-16T09:00:00Z',
              message: 'I have 8 years of experience teaching CBSE mathematics and specialize in helping students overcome their fear of the subject.',
              status: 'pending'
            },
            {
              id: '2',
              teacherName: 'Prof. Anita Mehta',
              teacherRating: 4.9,
              appliedAt: '2024-01-16T11:30:00Z',
              message: 'I am a mathematics teacher with B.Ed and 10 years of experience. I use interactive teaching methods to make math enjoyable.',
              status: 'pending'
            }
          ]
        };
        setJob(mockJob);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      alert('Please login to apply for this job');
      return;
    }

    if (user.role !== 'teacher') {
      alert('Only teachers can apply to jobs');
      return;
    }

    setApplying(true);
    try {
      const response = await apiClient.applyToJob(jobId, {
        message: applicationMessage || 'I am interested in this teaching opportunity and would like to discuss further.'
      });

      alert('Application submitted successfully!');
      setShowApplicationForm(false);
      setApplicationMessage('');
      fetchJobDetails(); // Refresh to update application count
    } catch (error: any) {
      console.error('Error applying to job:', error);
      alert(error.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'bg-red-100 text-red-800';
      case 'within-week':
        return 'bg-orange-100 text-orange-800';
      case 'within-month':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Posted by {job.studentName}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(job.postedAt)}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {job.applicationsCount} applications
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(job.urgency)}`}>
                    {job.urgency.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {job.subject}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {job.classLevel}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                  {job.teachingMode === 'both' ? 'Online & Offline' : job.teachingMode}
                </span>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 mb-2">
                ₹{job.budget.min} - ₹{job.budget.max}
                <span className="text-lg font-normal text-gray-600">/{job.budget.type.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{job.description}</p>
              
              {job.additionalDetails && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Details</h3>
                  <p className="text-gray-700 leading-relaxed">{job.additionalDetails}</p>
                </div>
              )}
            </div>

            {/* Schedule & Duration */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule & Duration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                  <p className="text-gray-700 capitalize">{job.duration.type.replace('-', ' ')}</p>
                  <p className="text-gray-600 text-sm">
                    {job.duration.hours} hour{job.duration.hours > 1 ? 's' : ''} per session, {job.duration.frequency}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
                  <p className="text-gray-700">Start: {formatDate(job.schedule.startDate)}</p>
                  {job.schedule.endDate && (
                    <p className="text-gray-700">End: {formatDate(job.schedule.endDate)}</p>
                  )}
                </div>
              </div>
              
              {job.schedule.preferredTimes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Preferred Time Slots</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.schedule.preferredTimes.map((time, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {time}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mt-2 capitalize">
                    Schedule flexibility: {job.schedule.flexibility.replace('-', ' ')}
                  </p>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="space-y-4">
                {job.requirements.experience && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Experience Level</h3>
                    <p className="text-gray-700 capitalize">{job.requirements.experience.replace('-', ' ')}</p>
                  </div>
                )}
                
                {job.requirements.qualifications.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Preferred Qualifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.qualifications.map((qual, index) => (
                        <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {job.requirements.languages.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Languages</h3>
                    <p className="text-gray-700">{job.requirements.languages.join(', ')}</p>
                  </div>
                )}
                
                {job.requirements.gender && job.requirements.gender !== 'any' && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Gender Preference</h3>
                    <p className="text-gray-700 capitalize">{job.requirements.gender} teacher preferred</p>
                  </div>
                )}
              </div>
            </div>

            {/* Applications (for job owner) */}
            {user?.role === 'student' && job.applications && job.applications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Applications Received</h2>
                <div className="space-y-4">
                  {job.applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{application.teacherName}</h3>
                          <div className="flex items-center mt-1">
                            {renderStars(application.teacherRating)}
                            <span className="ml-2 text-sm text-gray-600">{application.teacherRating}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(application.appliedAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{application.message}</p>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          Accept
                        </button>
                        <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                          View Profile
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Location:</span>
                  <p className="text-sm text-gray-800">
                    {job.location.city}, {job.location.state}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Max Distance:</span>
                  <p className="text-sm text-gray-800">{job.requirements.maxDistance} km</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Contact Preference:</span>
                  <p className="text-sm text-gray-800 capitalize">
                    {job.contactPreference === 'any' ? 'Any method' : job.contactPreference}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Expires on:</span>
                  <p className="text-sm text-gray-800">{formatDate(job.expiresAt)}</p>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            {user?.role === 'teacher' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for this Job</h3>
                {!showApplicationForm ? (
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Apply Now
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Message
                      </label>
                      <textarea
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell the student why you're the right fit for this job..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                      >
                        {applying ? 'Submitting...' : 'Submit Application'}
                      </button>
                      <button
                        onClick={() => setShowApplicationForm(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Student */}
            {user?.role === 'teacher' && job.studentContact && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Student</h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${job.studentContact}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Now
                  </a>
                  <a
                    href={`https://wa.me/${job.studentContact.replace(/[^0-9]/g, '')}?text=Hi, I saw your tutoring job posting on ShikshaGuru and I'm interested in teaching ${job.subject} for ${job.classLevel}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}