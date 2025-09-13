import { Request, Response } from 'express';
import { Teacher } from '../models/Teacher';
import { User } from '../models/User';
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

// Create teacher profile
export const createTeacherProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user already has a teacher profile
    const existingTeacher = await Teacher.findOne({ userId });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher profile already exists' });
    }

    // Create teacher profile
    const teacherData = {
      userId,
      ...req.body,
      isVerified: false, // Default to unverified
      isActive: true,
      rating: {
        average: 0,
        count: 0
      }
    };

    const teacher = new Teacher(teacherData);
    await teacher.save();

    // Update user role to teacher
    await User.findByIdAndUpdate(userId, { role: 'teacher' });

    res.status(201).json({
      message: 'Teacher profile created successfully',
      teacher: teacher
    });
  } catch (error: any) {
    console.error('Error creating teacher profile:', error);
    res.status(500).json({ 
      message: 'Error creating teacher profile',
      error: error.message 
    });
  }
};

// Get teacher profile by ID
export const getTeacherProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const teacher = await Teacher.findById(id)
      .populate('userId', 'name email')
      .populate('reviews.studentId', 'name');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ teacher });
  } catch (error: any) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({ 
      message: 'Error fetching teacher profile',
      error: error.message 
    });
  }
};

// Get teacher profile by user ID
export const getTeacherByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const teacher = await Teacher.findOne({ userId })
      .populate('userId', 'name email')
      .populate('reviews.studentId', 'name');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.json({ teacher });
  } catch (error: any) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({ 
      message: 'Error fetching teacher profile',
      error: error.message 
    });
  }
};

// Update teacher profile
export const updateTeacherProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const teacher = await Teacher.findOneAndUpdate(
      { userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.json({
      message: 'Teacher profile updated successfully',
      teacher
    });
  } catch (error: any) {
    console.error('Error updating teacher profile:', error);
    res.status(500).json({ 
      message: 'Error updating teacher profile',
      error: error.message 
    });
  }
};

// Search teachers
export const searchTeachers = async (req: Request, res: Response) => {
  try {
    const {
      subjects,
      classLevels,
      location,
      minRate,
      maxRate,
      teachingMode,
      languages,
      rating,
      sortBy = 'rating.average',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    const query: any = { isActive: true };

    if (subjects) {
      const subjectsArray = Array.isArray(subjects) ? subjects : [subjects];
      query.subjects = { $in: subjectsArray };
    }

    if (classLevels) {
      const levelsArray = Array.isArray(classLevels) ? classLevels : [classLevels];
      query.classLevels = { $in: levelsArray };
    }

    if (teachingMode) {
      const modesArray = Array.isArray(teachingMode) ? teachingMode : [teachingMode];
      query.teachingMode = { $in: modesArray };
    }

    if (languages) {
      const languagesArray = Array.isArray(languages) ? languages : [languages];
      query.languages = { $in: languagesArray };
    }

    if (minRate || maxRate) {
      query['hourlyRate.min'] = {};
      if (minRate) query['hourlyRate.min'].$gte = parseInt(minRate as string);
      if (maxRate) query['hourlyRate.max'] = { $lte: parseInt(maxRate as string) };
    }

    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating as string) };
    }

    // Location-based search (if coordinates provided)
    if (location) {
      const [longitude, latitude] = (location as string).split(',').map(Number);
      if (longitude && latitude) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: 50000 // 50km radius
          }
        };
      }
    }

    // Execute search with pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const teachers = await Teacher.find(query)
      .populate('userId', 'name email')
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);

    const totalTeachers = await Teacher.countDocuments(query);
    const totalPages = Math.ceil(totalTeachers / limitNum);

    res.json({
      teachers,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalTeachers,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error: any) {
    console.error('Error searching teachers:', error);
    res.status(500).json({ 
      message: 'Error searching teachers',
      error: error.message 
    });
  }
};

// Add review to teacher
export const addTeacherReview = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId } = req.params;
    const { rating, comment, subject } = req.body;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if student already reviewed this teacher
    const existingReview = teacher.reviews.find(
      review => review.studentId.toString() === studentId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this teacher' });
    }

    // Add review
    const newReview = {
      studentId,
      rating,
      comment,
      subject,
      date: new Date()
    };

    teacher.reviews.push(newReview as any);

    // Update rating average
    const totalRating = teacher.reviews.reduce((sum, review) => sum + review.rating, 0);
    (teacher as any).rating.average = totalRating / teacher.reviews.length;
    (teacher as any).rating.count = teacher.reviews.length;

    await teacher.save();

    res.json({
      message: 'Review added successfully',
      teacher
    });
  } catch (error: any) {
    console.error('Error adding teacher review:', error);
    res.status(500).json({ 
      message: 'Error adding teacher review',
      error: error.message 
    });
  }
};

// Get teacher stats (for dashboard)
export const getTeacherStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // TODO: Get actual stats from applications, messages, etc.
    const stats = {
      profileViews: (teacher as any).profileViews || 0,
      applicationsSent: 0, // TODO: Count from Job applications
      acceptedApplications: 0, // TODO: Count accepted applications
      activeChats: 0, // TODO: Count active conversations
      totalEarnings: 0, // TODO: Calculate from completed sessions
      rating: (teacher as any).rating.average,
      totalReviews: (teacher as any).rating.count
    };

    res.json({ stats });
  } catch (error: any) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({ 
      message: 'Error fetching teacher stats',
      error: error.message 
    });
  }
};

// Toggle teacher profile visibility
export const toggleTeacherVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    (teacher as any).isActive = !(teacher as any).isActive;
    await teacher.save();

    res.json({
      message: `Teacher profile ${(teacher as any).isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: (teacher as any).isActive
    });
  } catch (error: any) {
    console.error('Error toggling teacher visibility:', error);
    res.status(500).json({ 
      message: 'Error toggling teacher visibility',
      error: error.message 
    });
  }
};

// Upload teacher documents
export const uploadTeacherDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { documentType, documentUrl } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Update document based on type
    switch (documentType) {
      case 'aadharCard':
        (teacher as any).documents.aadharCard = documentUrl;
        break;
      case 'panCard':
        (teacher as any).documents.panCard = documentUrl;
        break;
      case 'educationCertificate':
        (teacher as any).documents.educationCertificates.push(documentUrl);
        break;
      case 'experienceCertificate':
        (teacher as any).documents.experienceCertificates.push(documentUrl);
        break;
      case 'profilePhoto':
        (teacher as any).profilePhoto = documentUrl;
        break;
      default:
        (teacher as any).documents.otherDocuments.push(documentUrl);
    }

    await teacher.save();

    res.json({
      message: 'Document uploaded successfully',
      teacher
    });
  } catch (error: any) {
    console.error('Error uploading teacher document:', error);
    res.status(500).json({ 
      message: 'Error uploading teacher document',
      error: error.message 
    });
  }
};