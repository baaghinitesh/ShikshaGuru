import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Teacher, Student } from '../models';
import { UserRole, UserStatus } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

// Generate JWT Token
const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  return (jwt as any).sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send token response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, phone, whatsappNumber, role = UserRole.STUDENT, profile, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      phone,
      whatsappNumber,
      role,
      profile,
      location,
      status: UserStatus.ACTIVE
    });

    // Create role-specific profile
    if (role === UserRole.TEACHER) {
      // Create teacher profile with minimal required fields
      await Teacher.create({
        userId: user._id,
        profile: {
          title: 'Mr.',
          tagline: 'Passionate educator',
          experience: 0,
          hourlyRate: { min: 100, max: 500 },
          languages: ['English'],
          specializations: []
        },
        subjects: [],
        teachingModes: ['online'],
        availability: [],
        location: location || {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Default to Delhi
          city: 'Delhi',
          country: 'India'
        }
      });
    } else if (role === UserRole.STUDENT) {
      // Create student profile
      await Student.create({
        userId: user._id,
        preferences: {
          teachingMode: ['online'],
          budget: { min: 100, max: 1000 },
          preferredLanguages: ['English']
        },
        location: location || {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Default to Delhi
          city: 'Delhi',
          country: 'India'
        }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await (user as any).comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { googleId, email, profile, role = UserRole.STUDENT } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID and email are required'
      });
    }

    // Check if user exists
    let user = await User.findOne({
      $or: [{ email }, { googleId }]
    });

    if (user) {
      // User exists, update Google ID if needed
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        googleId,
        role,
        profile: {
          firstName: profile?.firstName || 'User',
          lastName: profile?.lastName || '',
          avatar: profile?.avatar
        },
        status: UserStatus.ACTIVE,
        emailVerified: true
      });

      // Create role-specific profile
      if (role === UserRole.TEACHER) {
        await Teacher.create({
          userId: user._id,
          profile: {
            title: 'Mr.',
            tagline: 'Passionate educator',
            experience: 0,
            hourlyRate: { min: 100, max: 500 },
            languages: ['English'],
            specializations: []
          },
          subjects: [],
          teachingModes: ['online'],
          availability: [],
          location: {
            type: 'Point',
            coordinates: [77.1025, 28.7041],
            city: 'Delhi',
            country: 'India'
          }
        });
      } else if (role === UserRole.STUDENT) {
        await Student.create({
          userId: user._id,
          preferences: {
            teachingMode: ['online'],
            budget: { min: 100, max: 1000 },
            preferredLanguages: ['English']
          },
          location: {
            type: 'Point',
            coordinates: [77.1025, 28.7041],
            city: 'Delhi',
            country: 'India'
          }
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fieldsToUpdate: any = {};

    // Allow updating specific fields
    const allowedFields = [
      'profile.firstName',
      'profile.lastName',
      'profile.avatar',
      'profile.dateOfBirth',
      'profile.gender',
      'profile.bio',
      'phone',
      'location',
      'preferences'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: 'User not found or password not set'
      });
    }

    // Check current password
    const isMatch = await (user as any).comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, just return success message
    // In production, implement email sending
    res.status(200).json({
      success: true,
      message: 'Reset password email sent (feature not implemented yet)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, just return success message
    // In production, implement token verification and password reset
    res.status(200).json({
      success: true,
      message: 'Password reset successfully (feature not implemented yet)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, just return success message
    // In production, implement email verification
    res.status(200).json({
      success: true,
      message: 'Email verified successfully (feature not implemented yet)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, just return success message
    // In production, implement email sending
    res.status(200).json({
      success: true,
      message: 'Verification email sent (feature not implemented yet)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};