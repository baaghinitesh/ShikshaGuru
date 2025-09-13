'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleAuth: (data: GoogleAuthData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  isAuthenticated: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  role?: 'student' | 'teacher';
  phone?: string;
  location?: any;
}

interface GoogleAuthData {
  googleId: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  role?: 'student' | 'teacher';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        // Verify token with backend
        try {
          const response = await apiClient.getMe();
          if (response.success) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          // Token is invalid, clear auth data
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiClient.login({ email, password });
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        toast.success('Login successful!');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await apiClient.register(data);
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        toast.success('Registration successful!');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleAuth = async (data: GoogleAuthData) => {
    try {
      setLoading(true);
      const response = await apiClient.googleAuth(data);
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        toast.success('Google authentication successful!');
      } else {
        throw new Error(response.message || 'Google authentication failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Google authentication failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      clearAuthData();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear auth data even if logout request fails
      clearAuthData();
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    googleAuth,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}