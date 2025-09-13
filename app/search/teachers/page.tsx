'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface SearchFilters {
  subject: string;
  classLevel: string;
  teachingMode: 'online' | 'offline' | 'both' | '';
  experience: string;
  minRating: number;
  maxDistance: number;
  minBudget: string;
  maxBudget: string;
  gender: 'male' | 'female' | 'any';
  sortBy: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

interface Teacher {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    gender: string;
  };
  expertise: {
    subjects: Array<{ name: string; level: string }>;
    classLevels: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  pricing: {
    hourlyRate: number;
  };
  location: {
    city: string;
    state: string;
  };
  distance?: number;
  isVerified: boolean;
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

export default function TeacherSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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
    experience: searchParams.get('experience') || '',
    minRating: parseFloat(searchParams.get('minRating') || '0'),
    maxDistance: parseInt(searchParams.get('maxDistance') || '25000'),
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    gender: (searchParams.get('gender') as any) || 'any',
    sortBy: searchParams.get('sortBy') || 'distance',
    location: searchParams.get('location') || '',
    latitude: parseFloat(searchParams.get('latitude') || '0') || undefined,
    longitude: parseFloat(searchParams.get('longitude') || '0') || undefined
  });

  const searchTeachers = useCallback(async (page = 1) => {
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

      const response = await apiClient.searchTeachers(searchQuery);
      
      if (response.success) {
        setTeachers(response.data.teachers);
        setTotalResults(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
        setDistanceBuckets(response.data.distanceBuckets || []);
      }
    } catch (error) {
      console.error('Error searching teachers:', error);
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
      experience: '',
      minRating: 0,
      maxDistance: 25000,
      minBudget: '',
      maxBudget: '',
      gender: 'any',
      sortBy: 'distance',
      location: '',
      latitude: undefined,
      longitude: undefined
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    searchTeachers(currentPage);
  }, [searchTeachers, currentPage]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        searchTeachers(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Teachers</h1>
          <p className="text-gray-600">
            {totalResults > 0 ? `${totalResults} teachers found` : 'Search for qualified teachers in your area'}
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

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => updateFilters({ experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Experience</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="experienced">Experienced (5-10 years)</option>
                    <option value="expert">Expert (10+ years)</option>
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating: {filters.minRating > 0 ? filters.minRating : 'Any'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => updateFilters({ minRating: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Any</span>
                    <span>5★</span>
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹/hour)</label>
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

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender Preference</label>
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
                {loading ? 'Searching...' : `Showing ${teachers.length} of ${totalResults} results`}
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Distance Buckets */}
            {distanceBuckets.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Results by Distance</h3>
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

            {/* Teachers Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : teachers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachers.map((teacher) => (
                  <div key={teacher._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {teacher.personalInfo.profilePhoto ? (
                          <img
                            src={teacher.personalInfo.profilePhoto}
                            alt={`${teacher.personalInfo.firstName} ${teacher.personalInfo.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-xl font-medium">
                            {teacher.personalInfo.firstName[0]}{teacher.personalInfo.lastName[0]}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {teacher.personalInfo.firstName} {teacher.personalInfo.lastName}
                              {teacher.isVerified && (
                                <svg className="inline w-5 h-5 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </h3>
                            
                            <div className="flex items-center mb-2">
                              {renderStars(teacher.rating.average)}
                              <span className="ml-2 text-sm text-gray-600">
                                {teacher.rating.average.toFixed(1)} ({teacher.rating.count} reviews)
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {teacher.location.city}, {teacher.location.state}
                              {teacher.distance && (
                                <span className="ml-2 text-blue-600">
                                  • {(teacher.distance / 1000).toFixed(1)}km away
                                </span>
                              )}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{teacher.pricing.hourlyRate}
                            </div>
                            <div className="text-sm text-gray-500">per hour</div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {teacher.expertise.subjects.slice(0, 3).map((subject, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {subject.name}
                              </span>
                            ))}
                            {teacher.expertise.subjects.length > 3 && (
                              <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                                +{teacher.expertise.subjects.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-1">
                            {teacher.expertise.classLevels.slice(0, 2).map((level, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                              >
                                {level}
                              </span>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => router.push(`/teacher/${teacher._id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
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