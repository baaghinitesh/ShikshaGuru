'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  teachingMode: 'online' | 'offline' | 'both';
  budget: {
    type: 'hourly' | 'per-session' | 'monthly' | 'total';
    min: number;
    max: number;
  };
  location: {
    city: string;
    state: string;
  };
  duration: {
    type: 'short-term' | 'long-term' | 'ongoing';
    hours: number;
    frequency: string;
  };
  requirements: {
    experience: string;
    qualifications: string[];
    languages: string[];
    gender?: 'male' | 'female' | 'any';
  };
  urgency: 'immediate' | 'within-week' | 'within-month' | 'flexible';
  studentName: string;
  postedAt: string;
  applicationsCount: number;
  status: 'active' | 'closed' | 'filled';
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    classLevel: '',
    teachingMode: '',
    minBudget: '',
    maxBudget: '',
    location: '',
    urgency: '',
    experience: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await apiClient.getJobs(params);
      if (response.jobs) {
        setJobs(response.jobs);
      } else {
        // Mock data for development
        setJobs([
          {
            id: '1',
            title: 'Mathematics tutor needed for Class 10 CBSE',
            description: 'Looking for an experienced mathematics teacher to help my daughter with Class 10 CBSE curriculum. Focus on algebra, geometry, and trigonometry. Need help preparing for board exams.',
            subject: 'Mathematics',
            classLevel: 'Class 10',
            teachingMode: 'both',
            budget: {
              type: 'hourly',
              min: 800,
              max: 1200
            },
            location: {
              city: 'Delhi',
              state: 'Delhi'
            },
            duration: {
              type: 'long-term',
              hours: 2,
              frequency: 'weekly'
            },
            requirements: {
              experience: 'intermediate',
              qualifications: ['B.Ed', 'Masters Degree'],
              languages: ['English', 'Hindi'],
              gender: 'any'
            },
            urgency: 'within-week',
            studentName: 'Priya Sharma',
            postedAt: '2024-01-15T10:30:00Z',
            applicationsCount: 12,
            status: 'active'
          },
          {
            id: '2',
            title: 'Physics teacher for JEE Main preparation',
            description: 'Need an expert physics teacher for JEE Main preparation. Strong focus on mechanics, waves, and thermodynamics. Student has good foundation but needs advanced problem-solving skills.',
            subject: 'Physics',
            classLevel: 'Competitive Exams',
            teachingMode: 'online',
            budget: {
              type: 'hourly',
              min: 1500,
              max: 2500
            },
            location: {
              city: 'Bangalore',
              state: 'Karnataka'
            },
            duration: {
              type: 'short-term',
              hours: 3,
              frequency: 'daily'
            },
            requirements: {
              experience: 'expert',
              qualifications: ['JEE Coaching Experience', 'Masters Degree'],
              languages: ['English'],
              gender: 'any'
            },
            urgency: 'immediate',
            studentName: 'Arjun Patel',
            postedAt: '2024-01-14T14:20:00Z',
            applicationsCount: 25,
            status: 'active'
          },
          {
            id: '3',
            title: 'English Literature tutor for Class 12',
            description: 'Seeking an English literature teacher for CBSE Class 12. Need help with poetry analysis, prose comprehension, and essay writing. Student aims for 90+ marks in boards.',
            subject: 'English',
            classLevel: 'Class 12',
            teachingMode: 'offline',
            budget: {
              type: 'hourly',
              min: 600,
              max: 1000
            },
            location: {
              city: 'Mumbai',
              state: 'Maharashtra'
            },
            duration: {
              type: 'long-term',
              hours: 1.5,
              frequency: 'bi-weekly'
            },
            requirements: {
              experience: 'intermediate',
              qualifications: ['B.Ed', 'English Literature Background'],
              languages: ['English', 'Hindi'],
              gender: 'female'
            },
            urgency: 'within-month',
            studentName: 'Ananya Singh',
            postedAt: '2024-01-13T09:15:00Z',
            applicationsCount: 8,
            status: 'active'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = async (jobId: string) => {
    try {
      if (!user) {
        alert('Please login to apply for jobs');
        return;
      }

      if (user.role !== 'teacher') {
        alert('Only teachers can apply to jobs');
        return;
      }

      const response = await apiClient.applyToJob(jobId, {
        message: 'I am interested in this teaching opportunity and would like to discuss further.'
      });

      alert('Application submitted successfully!');
      fetchJobs(); // Refresh to update application count
    } catch (error: any) {
      console.error('Error applying to job:', error);
      alert(error.message || 'Failed to submit application');
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
      month: 'short',
      year: 'numeric'
    });
  };

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 
    'Geography', 'Economics', 'Political Science', 'Computer Science'
  ];

  const classLevelOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 
    'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Competitive Exams'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'teacher' ? 'Teaching Opportunities' : 'Browse Tutoring Jobs'}
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'teacher' 
                  ? 'Find students who need your expertise' 
                  : 'Find the perfect teacher for your needs'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/search/jobs"
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Search by Location
              </Link>
              {user?.role === 'student' && (
                <Link
                  href="/student/jobs/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post a Job
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Jobs</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Subjects</option>
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Level</label>
                  <select
                    value={filters.classLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, classLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    {classLevelOptions.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Mode</label>
                  <select
                    value={filters.teachingMode}
                    onChange={(e) => setFilters(prev => ({ ...prev, teachingMode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Modes</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (₹)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minBudget}
                      onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                  <select
                    value={filters.urgency}
                    onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="immediate">Immediate</option>
                    <option value="within-week">Within a Week</option>
                    <option value="within-month">Within a Month</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setFilters({
                    subject: '', classLevel: '', teachingMode: '', minBudget: '', 
                    maxBudget: '', location: '', urgency: '', experience: ''
                  })}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading jobs...</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or check back later for new opportunities.</p>
                {user?.role === 'student' && (
                  <Link
                    href="/student/jobs/create"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post Your First Job
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {job.studentName}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location.city}, {job.location.state}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(job.postedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                          {job.urgency.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    
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
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        ₹{job.budget.min}-{job.budget.max}/{job.budget.type.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {job.applicationsCount} applications
                        </span>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          View Details
                        </Link>
                        {user?.role === 'teacher' && (
                          <button
                            onClick={() => handleApplyToJob(job.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}