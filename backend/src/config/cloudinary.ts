import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo-cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo-secret',
});

export default cloudinary;