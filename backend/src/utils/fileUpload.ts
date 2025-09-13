import cloudinary from '../config/cloudinary';
import sharp from 'sharp';
import { Readable } from 'stream';

export interface UploadOptions {
  folder?: string;
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[];
  quality?: number; // for image compression (0-100)
  resize?: {
    width?: number;
    height?: number;
  };
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  size?: number;
  format?: string;
  error?: string;
}

/**
 * Upload file to Cloudinary with optional compression
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const {
      folder = 'shikshaguru',
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'],
      quality = 80,
      resize
    } = options;

    // Check file size
    if (buffer.length > maxSize) {
      return {
        success: false,
        error: `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
      };
    }

    // Detect file type from buffer
    const fileType = await getFileType(buffer);
    if (!allowedTypes.includes(fileType)) {
      return {
        success: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    let processedBuffer = buffer;

    // Compress image if it's an image file
    if (fileType.startsWith('image/')) {
      try {
        processedBuffer = await compressImage(buffer, {
          quality,
          resize,
          targetSize: 512 * 1024 // Target 512KB for images
        });
      } catch (compressionError) {
        console.warn('Image compression failed, using original:', compressionError);
        // Continue with original buffer if compression fails
      }
    }

    // Upload to Cloudinary
    const stream = Readable.from(processedBuffer);
    
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          public_id: generatePublicId(filename),
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.pipe(uploadStream);
    });

    return {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      size: uploadResult.bytes,
      format: uploadResult.format
    };

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Failed to delete file' 
      };
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

/**
 * Compress image using Sharp
 */
async function compressImage(
  buffer: Buffer, 
  options: { 
    quality: number; 
    resize?: { width?: number; height?: number };
    targetSize: number;
  }
): Promise<Buffer> {
  let sharpInstance = sharp(buffer);

  // Resize if specified
  if (options.resize && (options.resize.width || options.resize.height)) {
    sharpInstance = sharpInstance.resize(
      options.resize.width, 
      options.resize.height, 
      { 
        fit: 'inside',
        withoutEnlargement: true 
      }
    );
  }

  // Compress based on format
  const metadata = await sharp(buffer).metadata();
  
  let compressed: Buffer;
  
  switch (metadata.format) {
    case 'jpeg':
    case 'jpg':
      compressed = await sharpInstance
        .jpeg({ quality: options.quality, progressive: true })
        .toBuffer();
      break;
    case 'png':
      compressed = await sharpInstance
        .png({ quality: options.quality, compressionLevel: 9 })
        .toBuffer();
      break;
    case 'webp':
      compressed = await sharpInstance
        .webp({ quality: options.quality })
        .toBuffer();
      break;
    default:
      // Convert to JPEG for other formats
      compressed = await sharpInstance
        .jpeg({ quality: options.quality, progressive: true })
        .toBuffer();
  }

  // If still too large, reduce quality further
  if (compressed.length > options.targetSize && options.quality > 20) {
    return compressImage(buffer, {
      ...options,
      quality: Math.max(20, options.quality - 10)
    });
  }

  return compressed;
}

/**
 * Detect file type from buffer
 */
async function getFileType(buffer: Buffer): Promise<string> {
  // Check magic bytes for common file types
  const magicBytes = buffer.slice(0, 8);
  
  // JPEG
  if (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8) {
    return 'image/jpeg';
  }
  
  // PNG
  if (magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && 
      magicBytes[2] === 0x4E && magicBytes[3] === 0x47) {
    return 'image/png';
  }
  
  // GIF
  if (magicBytes[0] === 0x47 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46) {
    return 'image/gif';
  }
  
  // WebP
  if (magicBytes[0] === 0x52 && magicBytes[1] === 0x49 && 
      magicBytes[2] === 0x46 && magicBytes[3] === 0x46 &&
      magicBytes[8] === 0x57 && magicBytes[9] === 0x45 && 
      magicBytes[10] === 0x42 && magicBytes[11] === 0x50) {
    return 'image/webp';
  }
  
  // PDF
  if (magicBytes[0] === 0x25 && magicBytes[1] === 0x50 && 
      magicBytes[2] === 0x44 && magicBytes[3] === 0x46) {
    return 'application/pdf';
  }

  // Default to text for unknown types
  return 'text/plain';
}

/**
 * Generate unique public ID for Cloudinary
 */
function generatePublicId(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const cleanFilename = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.[^/.]+$/, ""); // Remove extension
  
  return `${cleanFilename}_${timestamp}_${random}`;
}