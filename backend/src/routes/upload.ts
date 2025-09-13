import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth';
import { uploadToCloudinary, deleteFromCloudinary, UploadOptions } from '../utils/fileUpload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Upload general file
const uploadFile = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const options: UploadOptions = {
      folder: req.body.folder || 'shikshaguru/documents',
      maxSize: 5 * 1024 * 1024, // 5MB for general files
      allowedTypes: [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ]
    };

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      options
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: result.url,
          publicId: result.publicId,
          size: result.size,
          format: result.format,
          originalName: req.file.originalname
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Upload failed'
      });
    }
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during file upload'
    });
  }
};

// Upload image with compression
const uploadImage = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    const options: UploadOptions = {
      folder: req.body.folder || 'shikshaguru/images',
      maxSize: 10 * 1024 * 1024, // 10MB for images (will be compressed)
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      quality: parseInt(req.body.quality) || 80,
      resize: {
        width: req.body.width ? parseInt(req.body.width) : undefined,
        height: req.body.height ? parseInt(req.body.height) : undefined
      }
    };

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      options
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: result.url,
          publicId: result.publicId,
          size: result.size,
          format: result.format,
          originalName: req.file.originalname
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Image upload failed'
      });
    }
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during image upload'
    });
  }
};

// Upload profile avatar
const uploadAvatar = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar image provided'
      });
    }

    const options: UploadOptions = {
      folder: 'shikshaguru/avatars',
      maxSize: 5 * 1024 * 1024, // 5MB for avatars
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      quality: 90,
      resize: {
        width: 400,
        height: 400
      }
    };

    const result = await uploadToCloudinary(
      req.file.buffer,
      `avatar_${req.user.id}_${Date.now()}`,
      options
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: result.url,
          publicId: result.publicId,
          size: result.size,
          format: result.format
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Avatar upload failed'
      });
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during avatar upload'
    });
  }
};

// Delete file from Cloudinary
const deleteFile = async (req: any, res: any) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteFromCloudinary(decodedPublicId);

    if (result.success) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Delete failed'
      });
    }
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during file deletion'
    });
  }
};

// Multiple file upload
const uploadMultiple = async (req: any, res: any) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
      const options: UploadOptions = {
        folder: req.body.folder || 'shikshaguru/multiple',
        maxSize: 5 * 1024 * 1024,
        quality: 80
      };

      const result = await uploadToCloudinary(file.buffer, file.originalname, options);
      
      return {
        originalName: file.originalname,
        ...result
      };
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    res.json({
      success: true,
      message: `${successful.length} files uploaded successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
      data: {
        successful,
        failed: failed.length > 0 ? failed : undefined
      }
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during multiple file upload'
    });
  }
};

// All upload routes require authentication
router.use(protect);

// Single file upload routes
router.post('/file', upload.single('file'), uploadFile);
router.post('/image', upload.single('image'), uploadImage);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// Multiple file upload
router.post('/multiple', upload.array('files', 10), uploadMultiple);

// Delete file
router.delete('/:publicId', deleteFile);

export default router;