'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  Clock, 
  BookOpen, 
  MessageCircle,
  Phone,
  User
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/auth-context';

interface Teacher {
  _id: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  profile: {
    title: string;
    tagline: string;
    experience: number;
    rating: number;
    hourlyRate: {
      min: number;
      max: number;
    };
    languages: string[];
    specializations: string[];
  };
  subjects: Array<{
    name: string;
    level: string;
    category: string;
  }>;
  teachingModes: string[];
  location: {
    city?: string;
    state?: string;
  };
  verification: {
    status: string;
  };
  statistics: {
    profileViews: number;
    responseRate: number;
    responseTime: number;
  };
}

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    level: '',
    experience: '',
    priceRange: '',
    location: '',
    teachingMode: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // For now, using mock data since backend controllers aren't implemented yet
      const mockTeachers: Teacher[] = [
        {
          _id: '1',
          userId: {
            _id: '1',
            profile: {
              firstName: 'Dr. Priya',
              lastName: 'Sharma',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=150'
            }
          },
          profile: {
            title: 'Dr.',
            tagline: 'Experienced Mathematics Teacher with 10+ years',
            experience: 10,
            rating: 4.8,
            hourlyRate: { min: 500, max: 800 },
            languages: ['English', 'Hindi'],
            specializations: ['Advanced Mathematics', 'JEE Preparation']
          },
          subjects: [
            { name: 'Mathematics', level: 'Class 11-12', category: 'Science' },
            { name: 'Physics', level: 'Class 11-12', category: 'Science' }
          ],
          teachingModes: ['online', 'offline'],
          location: { city: 'Delhi', state: 'Delhi' },
          verification: { status: 'verified' },
          statistics: { profileViews: 245, responseRate: 95, responseTime: 30 }
        },
        {
          _id: '2',
          userId: {
            _id: '2',
            profile: {
              firstName: 'Rajesh',
              lastName: 'Kumar',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
            }
          },
          profile: {
            title: 'Mr.',
            tagline: 'English Literature Expert & IELTS Coach',
            experience: 7,
            rating: 4.6,
            hourlyRate: { min: 300, max: 600 },
            languages: ['English'],
            specializations: ['IELTS', 'Creative Writing', 'Literature']
          },
          subjects: [
            { name: 'English', level: 'All Levels', category: 'Language' },
            { name: 'Literature', level: 'Graduate', category: 'Arts' }
          ],
          teachingModes: ['online'],
          location: { city: 'Mumbai', state: 'Maharashtra' },
          verification: { status: 'verified' },
          statistics: { profileViews: 189, responseRate: 88, responseTime: 45 }
        },
        {
          _id: '3',
          userId: {
            _id: '3',
            profile: {
              firstName: 'Anita',
              lastName: 'Singh',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
            }
          },
          profile: {
            title: 'Ms.',
            tagline: 'Computer Science & Programming Tutor',
            experience: 5,
            rating: 4.9,
            hourlyRate: { min: 400, max: 700 },
            languages: ['English', 'Hindi'],
            specializations: ['Python', 'Java', 'Web Development']
          },
          subjects: [
            { name: 'Computer Science', level: 'Class 11-12', category: 'Technology' },
            { name: 'Programming', level: 'All Levels', category: 'Technology' }
          ],
          teachingModes: ['online', 'offline'],
          location: { city: 'Bangalore', state: 'Karnataka' },
          verification: { status: 'verified' },
          statistics: { profileViews: 156, responseRate: 92, responseTime: 25 }
        }
      ];
      
      setTeachers(mockTeachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (teacher: Teacher) => {
    const message = `Hi ${teacher.profile.title} ${teacher.userId.profile.firstName}, I found your profile on ShikshaGuru and I'm interested in your tutoring services. Could we discuss further?`;
    const encodedMessage = encodeURIComponent(message);
    // This would need actual phone number - for demo purposes
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Tutor</h1>
              <p className="text-gray-600">Browse verified teachers and connect instantly</p>
            </div>
            <Link 
              href="/search/teachers"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Search by Location
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by subject, teacher name, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {['Mathematics', 'English', 'Science', 'Computer Science', 'Hindi'].map((subject) => (
              <Badge key={subject} variant="outline" className="cursor-pointer hover:bg-blue-50">
                {subject}
              </Badge>
            ))}
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teacher.userId.profile.avatar} />
                    <AvatarFallback>
                      {teacher.userId.profile.firstName[0]}{teacher.userId.profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {teacher.profile.title} {teacher.userId.profile.firstName} {teacher.userId.profile.lastName}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{teacher.profile.rating}</span>
                      <span className="text-sm text-gray-500">({teacher.statistics.profileViews} views)</span>
                    </div>
                  </div>
                  {teacher.verification.status === 'verified' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {teacher.profile.tagline}
                </p>

                {/* Subjects */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Subjects</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.slice(0, 3).map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subject.name}
                      </Badge>
                    ))}
                    {teacher.subjects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{teacher.subjects.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Experience and Location */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{teacher.profile.experience} years exp</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{teacher.location.city}</span>
                  </div>
                </div>

                {/* Price Range */}
                <div className="text-lg font-semibold text-green-600">
                  ₹{teacher.profile.hourlyRate.min} - ₹{teacher.profile.hourlyRate.max}/hour
                </div>

                {/* Teaching Modes */}
                <div className="flex gap-2">
                  {teacher.teachingModes.map((mode) => (
                    <Badge key={mode} variant="secondary" className="text-xs capitalize">
                      {mode}
                    </Badge>
                  ))}
                </div>

                {/* Languages */}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Languages:</span> {teacher.profile.languages.join(', ')}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {user ? (
                    <>
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleWhatsAppClick(teacher)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button asChild size="sm" className="flex-1">
                      <Link href="/sign-in">
                        <User className="h-4 w-4 mr-1" />
                        Sign in to Contact
                      </Link>
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/teachers/${teacher._id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Teachers
          </Button>
        </div>
      </div>
    </div>
  );
}