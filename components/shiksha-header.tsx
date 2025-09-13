'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User as UserIcon, Menu, X, Search, MessageCircle, BookOpen, Settings, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import ThemeControls from './theme-controls';
import { config } from '@/lib/config';

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isStudent, isTeacher, isAdmin } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-2">
        <Button asChild variant="ghost" className="hidden lg:flex" size="sm">
          <Link href="/teachers">Find Tutors</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="text-sm px-3">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild size="sm" className="text-sm px-3">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const getDashboardLink = () => {
    if (isAdmin) return '/dashboard/admin';
    if (isTeacher) return '/dashboard/teacher';
    return '/dashboard/student';
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Actions - Only show on larger screens */}
      <Button asChild variant="ghost" size="sm" className="hidden lg:flex">
        <Link href="/chat">
          <MessageCircle className="h-4 w-4 mr-2" />
          Messages
        </Link>
      </Button>
      
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="cursor-pointer h-8 w-8 ring-2 ring-transparent hover:ring-blue-200 transition-all">
            <AvatarImage src={user.profile?.avatar} alt={user.profile?.firstName || user.email} />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
              {user.profile?.firstName?.[0] || user.email[0]}{user.profile?.lastName?.[0] || user.email[1] || ''}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-0" sideOffset={8}>
          {/* User Info Header */}
          <div className="px-4 py-3 bg-gray-50 border-b">
            <div className="font-medium text-gray-900">
              {user.profile?.firstName && user.profile?.lastName 
                ? `${user.profile.firstName} ${user.profile.lastName}` 
                : user.email}
            </div>
            <div className="text-sm text-gray-500 truncate">{user.email}</div>
            <div className="text-xs text-blue-600 capitalize font-medium mt-1">{user.role}</div>
          </div>
          
          {/* Navigation Items */}
          <div className="py-2">
            <DropdownMenuItem asChild>
              <Link href={getDashboardLink()} className="cursor-pointer px-4 py-2 flex items-center">
                <UserIcon className="mr-3 h-4 w-4 text-gray-500" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer px-4 py-2 flex items-center">
                <UserIcon className="mr-3 h-4 w-4 text-gray-500" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/chat" className="cursor-pointer px-4 py-2 flex items-center">
                <MessageCircle className="mr-3 h-4 w-4 text-gray-500" />
                <span>Messages</span>
              </Link>
            </DropdownMenuItem>
            
            {isTeacher && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/teacher/profile/create" className="cursor-pointer px-4 py-2 flex items-center">
                    <GraduationCap className="mr-3 h-4 w-4 text-gray-500" />
                    <span>Teacher Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/jobs" className="cursor-pointer px-4 py-2 flex items-center">
                    <Search className="mr-3 h-4 w-4 text-gray-500" />
                    <span>Browse Jobs</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            
            {isStudent && (
              <DropdownMenuItem asChild>
                <Link href="/student/jobs/create" className="cursor-pointer px-4 py-2 flex items-center">
                  <Search className="mr-3 h-4 w-4 text-gray-500" />
                  <span>Post a Job</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            {isAdmin && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link href="/admin/blogs" className="cursor-pointer px-4 py-2 flex items-center">
                    <FileText className="mr-3 h-4 w-4 text-gray-500" />
                    <span>Manage Blogs</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer px-4 py-2 flex items-center">
                    <Settings className="mr-3 h-4 w-4 text-gray-500" />
                    <span>Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </div>
          
          <DropdownMenuSeparator className="my-0" />
          
          {/* Sign Out */}
          <div className="py-2">
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="cursor-pointer text-red-600 hover:bg-red-50 px-4 py-2 flex items-center"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, isStudent, isTeacher, isAdmin, logout } = useAuth();
  const router = useRouter();
  
  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <div className="md:hidden relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="absolute top-full right-0 w-64 bg-background border border-border shadow-lg z-50 rounded-lg mt-2">
            <div className="px-4 py-3 space-y-1">
              {/* Navigation Links */}
              <Link 
                href="/teachers" 
                className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Search className="h-4 w-4 mr-3 text-blue-600" />
                Find Tutors
              </Link>
              <Link 
                href="/jobs" 
                className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Search className="h-4 w-4 mr-3 text-blue-600" />
                Browse Jobs
              </Link>
              <Link 
                href="/search/teachers" 
                className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Search className="h-4 w-4 mr-3 text-blue-600" />
                Search Teachers
              </Link>
              <Link 
                href="/blog" 
                className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <BookOpen className="h-4 w-4 mr-3 text-blue-600" />
                Blog
              </Link>
              <Link 
                href="/search/jobs" 
                className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Search className="h-4 w-4 mr-3 text-blue-600" />
                Search Jobs
              </Link>
              
              {isAuthenticated && user ? (
                <>
                  <hr className="my-3 border-gray-200" />
                  
                  {/* User Info */}
                  <div className="px-2 py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs text-blue-600 capitalize font-medium">{user.role}</div>
                  </div>
                  
                  <hr className="my-3 border-gray-200" />
                  
                  {/* Authenticated User Links */}
                  <Link 
                    href="/chat" 
                    className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4 mr-3 text-blue-600" />
                    Messages
                  </Link>
                  
                  {isTeacher && (
                    <>
                      <Link 
                        href="/teacher/dashboard" 
                        className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3 text-blue-600" />
                        Dashboard
                      </Link>
                      <Link 
                        href="/teacher/profile/create" 
                        className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <GraduationCap className="h-4 w-4 mr-3 text-blue-600" />
                        Profile
                      </Link>
                    </>
                  )}
                  
                  {isStudent && (
                    <Link 
                      href="/student/jobs/create" 
                      className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Search className="h-4 w-4 mr-3 text-blue-600" />
                      Post a Job
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <>
                      <hr className="my-3 border-gray-200" />
                      <Link 
                        href="/admin/blogs" 
                        className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <FileText className="h-4 w-4 mr-3 text-blue-600" />
                        Manage Blogs
                      </Link>
                      <Link 
                        href="/admin" 
                        className="flex items-center py-3 px-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3 text-blue-600" />
                        Admin Panel
                      </Link>
                    </>
                  )}
                  
                  <hr className="my-3 border-gray-200" />
                  
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center w-full py-3 px-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-3 border-gray-200" />
                  <div className="px-2 space-y-2">
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ShikshaHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 min-w-0">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {config.app?.name || 'ShikshaGuru'}
            </span>
          </Link>
          
          {/* Navigation - Hidden on smaller screens, shown on medium+ */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/teachers" className="text-sm font-medium hover:text-blue-600 transition-colors whitespace-nowrap">
              Find Tutors
            </Link>
            <Link href="/jobs" className="text-sm font-medium hover:text-blue-600 transition-colors whitespace-nowrap">
              Browse Jobs
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:text-blue-600 transition-colors whitespace-nowrap">
              Blog
            </Link>
            <Link href="/search/teachers" className="text-sm font-medium hover:text-blue-600 transition-colors whitespace-nowrap">
              Search Teachers
            </Link>
            <Link href="/search/jobs" className="text-sm font-medium hover:text-blue-600 transition-colors whitespace-nowrap">
              Search Jobs
            </Link>
          </nav>
          
          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Hide theme controls on very small screens */}
            <div className="hidden sm:block">
              <ThemeControls />
            </div>
            
            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <Suspense fallback={<div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />}>
                <UserMenu />
              </Suspense>
            </div>
            
            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}