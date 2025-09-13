export const config = {
  // Database configuration for backend
  database: {
    url: process.env.DATABASE_URL || "mongodb://admin:kdOwqsCH@127.0.0.1:27017/shikshaguru?authSource=admin",
  },
  
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  },
  
  // Authentication configuration  
  auth: {
    secret: process.env.AUTH_SECRET || "shikshaguru_auth_secret_key_2024",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  
  // App configuration
  app: {
    name: "ShikshaGuru",
    description: "Complete MERN Tutoring Marketplace Platform",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  
  // Theme configuration
  theme: {
    defaultAccentColor: "#3B82F6",
    availableColors: [
      "#3B82F6", // blue
      "#10B981", // emerald  
      "#8B5CF6", // violet
      "#F59E0B", // amber
      "#EF4444", // red
      "#6366F1", // indigo
    ]
  },
  
  // Upload configuration
  upload: {
    maxFileSize: 0.5 * 1024 * 1024, // 0.5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  }
};