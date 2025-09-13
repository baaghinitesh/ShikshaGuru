'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';

interface SearchFilters {
  subject: string;
  classLevel: string;
  teachingMode: 'online' | 'offline' | 'both' | '';
  urgency: string;
  maxDistance: number;
  minBudget: string;
  maxBudget: string;
  experience: string;
  gender: 'male' | 'female' | 'any';
  sortBy: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  teachingMode: 'online' | 'offline' | 'both';
  urgency: 'immediate' | 'within-week' | 'within-month' | 'flexible';
  budget: {
    type: string;
    min: number;
    max: number;
  };
  location: {
    city: string;
    state: string;
  };
  requirements: {
    experience: string;
    gender?: string;
    qualifications: string[];
  };
  studentName: string;
  createdAt: string;
  expiresAt: string;
  distance?: number;
  applications?: number;
  status: string;
}

interface DistanceBucket {
  label: string;
  min: number;
  max: number;
  count: number;
}

interface LocationSuggestion {
  city: string;
  state: string;
  coordinates: [number, number];
  count: number;
  label: string;
}

export default function JobSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [distanceBuckets, setDistanceBuckets] = useState<DistanceBucket[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    subject: searchParams.get('subject') || '',
    classLevel: searchParams.get('classLevel') || '',
    teachingMode: (searchParams.get('teachingMode') as any) || '',
    urgency: searchParams.get('urgency') || '',
    maxDistance: parseInt(searchParams.get('maxDistance') || '25000'),
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    experience: searchParams.get('experience') || '',
    gender: (searchParams.get('gender') as any) || 'any',
    sortBy: searchParams.get('sortBy') || 'distance',
    location: searchParams.get('location') || '',
    latitude: parseFloat(searchParams.get('latitude') || '0') || undefined,
    longitude: parseFloat(searchParams.get('longitude') || '0') || undefined
  });

  const searchJobs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const searchQuery = {
        ...filters,
        page,
        limit: 20
      };

      // Remove empty values
      Object.keys(searchQuery).forEach(key => {
        if (searchQuery[key as keyof typeof searchQuery] === '' || 
            searchQuery[key as keyof typeof searchQuery] === 0) {
          delete searchQuery[key as keyof typeof searchQuery];
        }
      });

      const response = await apiClient.searchJobs(searchQuery);
      
      if (response.success) {
        setJobs(response.data.jobs);
        setTotalResults(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
        setDistanceBuckets(response.data.distanceBuckets || []);
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleLocationSearch = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await apiClient.getLocationSuggestions(query);
      if (response.success) {
        setLocationSuggestions(response.data.suggestions);
        setShowLocationSuggestions(true);
      }
    } catch (error) {
      console.error('Error getting location suggestions:', error);
    }
  };

  const selectLocation = (suggestion: LocationSuggestion) => {
    setFilters(prev => ({
      ...prev,
      location: suggestion.label,
      latitude: suggestion.coordinates[1],
      longitude: suggestion.coordinates[0]
    }));
    setShowLocationSuggestions(false);
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location: 'Current Location'
        }));
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      classLevel: '',
      teachingMode: '',
      urgency: '',
      maxDistance: 25000,
      minBudget: '',
      maxBudget: '',
      experience: '',
      gender: 'any',
      sortBy: 'distance',
      location: '',
      latitude: undefined,
      longitude: undefined
    });
    setCurrentPage(1);
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

  useEffect(() => {
    searchJobs(currentPage);
  }, [searchJobs, currentPage]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        searchJobs(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Teaching Jobs</h1>
          <p className="text-gray-600">
            {totalResults > 0 ? `${totalResults} jobs found` : 'Discover tutoring opportunities in your area'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Location Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => {
                        updateFilters({ location: e.target.value });
                        handleLocationSearch(e.target.value);
                      }}
                      placeholder="Enter city or area"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                      title="Use current location"
                    >
                      {gettingLocation ? (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {locationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => selectLocation(suggestion)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                          >
                            <span>{suggestion.label}</span>
                            <span className="text-sm text-gray-500">{suggestion.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Distance */}
                {filters.latitude && filters.longitude && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Distance: {filters.maxDistance / 1000}km
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="1000"
                      value={filters.maxDistance}
                      onChange={(e) => updateFilters({ maxDistance: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1km</span>
                      <span>50km</span>
                    </div>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => updateFilters({ subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                {/* Class Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Level</label>
                  <select
                    value={filters.classLevel}
                    onChange={(e) => updateFilters({ classLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Classes</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={`Class ${i + 1}`}>Class {i + 1}</option>
                    ))}
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                {/* Teaching Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Mode</label>
                  <select
                    value={filters.teachingMode}
                    onChange={(e) => updateFilters({ teachingMode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Modes</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                  <select
                    value={filters.urgency}
                    onChange={(e) => updateFilters({ urgency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Urgency</option>
                    <option value="immediate">Immediate</option>
                    <option value="within-week">Within a Week</option>
                    <option value="within-month">Within a Month</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                {/* Experience Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Required</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => updateFilters({ experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Experience</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="experienced">Experienced (5-10 years)</option>
                    <option value="expert">Expert (10+ years)</option>
                  </select>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minBudget}
                      onChange={(e) => updateFilters({ minBudget: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget}
                      onChange={(e) => updateFilters({ maxBudget: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Gender Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Gender Preference</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => updateFilters({ gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="any">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                {loading ? 'Searching...' : `Showing ${jobs.length} of ${totalResults} results`}
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="distance">Distance</option>
                <option value="budget-high">Budget: High to Low</option>
                <option value="budget-low">Budget: Low to High</option>
                <option value="urgency">Urgency</option>
                <option value="latest">Latest</option>
              </select>
            </div>

            {/* Distance Buckets */}
            {distanceBuckets.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Jobs by Distance</h3>
                <div className="flex flex-wrap gap-2">
                  {distanceBuckets.map((bucket, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {bucket.label}: {bucket.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs Grid */}
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>Posted by {job.studentName}</span>
                          <span>•</span>
                          <span>{formatDate(job.createdAt)}</span>
                          {job.distance && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">{(job.distance / 1000).toFixed(1)}km away</span>
                            </>
                          )}
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
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-6">
                        <div>
                          <span className="text-sm text-gray-500">Budget: </span>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{job.budget.min} - ₹{job.budget.max}
                          </span>
                          <span className="text-sm text-gray-500">/{job.budget.type.replace('-', ' ')}</span>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-500">Location: </span>
                          <span className="text-sm text-gray-700">
                            {job.location.city}, {job.location.state}
                          </span>
                        </div>
                        
                        {job.applications && (
                          <div>
                            <span className="text-sm text-gray-500">Applications: </span>
                            <span className="text-sm font-medium text-gray-700">{job.applications}</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => router.push(`/jobs/${job._id}`)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        {user?.role === 'teacher' ? 'Apply Now' : 'View Details'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or expanding your search area.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}