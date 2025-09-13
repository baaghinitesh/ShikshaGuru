'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { 
  CalendarDays, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  User, 
  ArrowLeft, 
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface Author {
  _id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: Author;
  category: string;
  tags: string[];
  publishedAt: string;
  views: number;
  readingTime: number;
  totalLikes: number;
  totalComments: number;
  likes: string[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export default function BlogPostPage() {
  const params = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchBlog(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    if (blog && user) {
      setLiked(blog.likes.includes(user._id));
    }
  }, [blog, user]);

  const fetchBlog = async (slug: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getBlog(slug);
      
      if (response.success) {
        setBlog(response.data.blog);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    if (!blog) return;

    try {
      const response = await apiClient.likeBlog(blog._id);
      
      if (response.success) {
        setLiked(response.data.liked);
        setBlog(prev => prev ? {
          ...prev,
          totalLikes: response.data.totalLikes,
          likes: response.data.liked 
            ? [...prev.likes, user._id]
            : prev.likes.filter(id => id !== user._id)
        } : null);
        
        toast.success(response.data.liked ? 'Post liked!' : 'Post unliked!');
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      toast.error('Failed to like post');
    }
  };

  const handleShare = () => {
    if (navigator.share && blog) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Simple content formatting - convert line breaks to paragraphs
    return content.split('\\n\\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Loading blog post...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h1>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Main Article */}
        <Card className="mb-8">
          {blog.featuredImage && (
            <div className="relative h-64 md:h-96 overflow-hidden rounded-t-lg">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-blue-600">
                {blog.category}
              </Badge>
            </div>
          )}
          
          <CardHeader>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {blog.title}
            </h1>
            
            {/* Author and Meta Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{blog.author.name}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(blog.publishedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{blog.readingTime} min read</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{blog.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  disabled={!user}
                >
                  <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                  {blog.totalLikes}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-4">
              {blog.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Excerpt */}
            <div className="text-xl text-gray-600 font-medium mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
              {blog.excerpt}
            </div>
            
            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {formatContent(blog.content)}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Comments ({blog.totalComments})
            </h3>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-3">Please log in to comment</p>
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Comments feature coming soon!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}