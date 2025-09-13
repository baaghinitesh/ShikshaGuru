'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User as UserIcon, Menu, X, Search, MessageCircle } from 'lucide-react';
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
        <Button asChild variant="ghost" className="hidden sm:flex">
          <Link href="/teachers">Find Tutors</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild size="sm">
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
      {/* Quick Actions */}
      <Button asChild variant="ghost" size="sm" className="hidden md:flex">
        <Link href="/chat">
          <MessageCircle className="h-4 w-4 mr-2" />
          Messages
        </Link>
      </Button>
      
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer h-8 w-8">
            <AvatarImage src={user.profile.avatar} alt={user.profile.firstName} />
            <AvatarFallback>
              {user.profile.firstName[0]}{user.profile.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium">{user.profile.firstName} {user.profile.lastName}</div>
            <div className="text-muted-foreground">{user.email}</div>
            <div className="text-xs text-blue-600 capitalize font-medium">{user.role}</div>
          </div>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href={getDashboardLink()} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile Settings
            </Link>
          </DropdownMenuItem>
          
          {isTeacher && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/teacher/profile" className="cursor-pointer">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Teacher Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/jobs" className="cursor-pointer">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Jobs
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          {isStudent && (
            <DropdownMenuItem asChild>
              <Link href="/jobs/create" className="cursor-pointer">
                <Search className="mr-2 h-4 w-4" />
                Post a Job
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50">
          <div className="px-4 py-2 space-y-2">
            <Link 
              href="/teachers" 
              className="block py-2 text-sm hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Find Tutors
            </Link>
            <Link 
              href="/jobs" 
              className="block py-2 text-sm hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Browse Jobs
            </Link>
            <Link 
              href="/blog" 
              className="block py-2 text-sm hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            
            {isAuthenticated && user && (
              <>
                <hr className="my-2" />
                <Link 
                  href="/chat" 
                  className="block py-2 text-sm hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Messages
                </Link>
                <Link 
                  href="/dashboard" 
                  className="block py-2 text-sm hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShikshaHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">{config.app.name}</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/teachers" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Find Tutors
            </Link>
            <Link href="/jobs" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Browse Jobs
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Blog
            </Link>
          </nav>
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeControls />
            <Suspense fallback={<div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />}>
              <UserMenu />
            </Suspense>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}