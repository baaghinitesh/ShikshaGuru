# ShikshaGuru - Complete MERN Tutoring Marketplace Platform

## 🎯 Project Overview

ShikshaGuru is a comprehensive tutoring marketplace that connects passionate educators with eager learners. Built with modern web technologies, this platform provides a seamless experience for both tutors and students to find their perfect match.

## ✨ Key Features

### 🧑‍🏫 For Teachers
- **Comprehensive Profile Management**: Create detailed profiles with qualifications, experience, and teaching preferences
- **Portfolio Showcase**: Upload documents, certificates, and showcase your expertise
- **Flexible Pricing**: Set your own rates and availability
- **Application Management**: Receive and manage student applications
- **Performance Analytics**: Track your success and student feedback

### 🎓 For Students  
- **Smart Search & Discovery**: Find tutors by subject, location, price, and ratings
- **Requirement Posting**: Post your learning needs and let qualified tutors apply
- **Detailed Teacher Profiles**: View qualifications, experience, and student reviews
- **Direct Communication**: Built-in messaging system for seamless interaction
- **Location-Based Matching**: Find tutors in your neighborhood

### 💬 Communication & Collaboration
- **Real-Time Chat System**: Instant messaging with typing indicators
- **File Sharing**: Share study materials and documents
- **Message History**: Access complete conversation history
- **Professional Interface**: Clean, intuitive chat experience

### 🤖 AI-Powered Assistant
- **Smart Recommendations**: AI suggests relevant tutors and opportunities
- **Query Resolution**: Get instant answers to platform-related questions
- **Personalized Guidance**: Contextual help based on user role and activity
- **24/7 Support**: Always available virtual assistant

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Authentication**: JWT with secure cookie storage

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM (Fully Migrated from PostgreSQL)
- **Authentication**: JWT tokens with bcrypt
- **Real-time**: Socket.IO for live messaging
- **File Upload**: Multer for document handling
- **API Architecture**: RESTful APIs with proper error handling

### Database Design
- **Primary Database**: MongoDB (Document-based) - **FULLY MIGRATED** ✅
- **Schema Management**: Mongoose with TypeScript interfaces
- **Indexing**: Geospatial indexing for location-based search
- **Data Validation**: Comprehensive schema validation
- **Migration Status**: PostgreSQL completely removed, MongoDB-only architecture

### DevOps & Deployment
- **Environment**: Docker containerization
- **Process Management**: PM2 for production
- **Environment Variables**: Secure configuration management
- **Logging**: Comprehensive application logging

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/baaghinitesh/ShikshaGuru.git
   cd ShikshaGuru
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Update with your MongoDB connection string
   MONGO_URI=mongodb://localhost:27017/shikshaguru
   AUTH_SECRET=your-jwt-secret-key
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   mongod
   
   # The application will automatically create indexes on startup
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Test Credentials
- **Email**: test@test.com
- **Password**: admin123
- **Role**: Student
- **Status**: Active account ready for testing

## 📱 Features in Detail

### Authentication System
- Secure JWT-based authentication with MongoDB ObjectIds
- Role-based access control (Student/Teacher/Admin)
- Google OAuth integration ready
- Password reset functionality
- Email verification system

### Teacher Management
- Detailed profile creation with 25+ fields
- Document upload and verification
- Availability scheduling
- Rate and pricing management
- Application tracking system

### Student Features
- Advanced search with multiple filters
- Job posting system
- Teacher application management
- Favorites and shortlisting
- Learning progress tracking

### Communication Platform
- Real-time messaging with Socket.IO
- File and document sharing
- Typing indicators and read receipts
- Message search and filtering
- Professional chat interface

### Location Services
- Geospatial search capabilities
- Distance-based teacher matching
- Location autocomplete
- Maps integration ready
- Regional preference settings

## 🌟 Advanced Features

### AI Chat Assistant - FULLY FUNCTIONAL ✅
- Context-aware responses based on user role
- Interactive action buttons for navigation
- Suggested responses for common queries
- Real-time conversation management
- Guest and authenticated user support
- Debug logging for troubleshooting

### Analytics Dashboard
- Teacher performance metrics
- Student engagement tracking
- Platform usage statistics
- Revenue analytics
- Growth insights

### Mobile Responsiveness
- Mobile-first design approach
- Touch-friendly interface
- Responsive layouts
- Progressive Web App features
- Cross-platform compatibility

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- Secure file upload handling
- Environment variable protection

## 🔄 Recent Major Updates

### MongoDB Migration (Latest) ✅
- **Complete database migration** from PostgreSQL to MongoDB
- **Removed all PostgreSQL dependencies**: drizzle-kit, drizzle-orm, postgres
- **Added Mongoose ODM** with proper TypeScript schemas
- **Updated authentication system** to work with MongoDB ObjectIds
- **Fixed sign-in/sign-up issues** by aligning frontend and backend schemas
- **AI Chat Assistant fully operational** with proper error handling
- **Created test user account** for immediate testing
- **All API endpoints verified** and working correctly

### Performance Improvements
- Optimized database queries with proper indexing
- Enhanced error handling and logging
- Improved real-time communication
- Better mobile responsiveness

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: Nitesh Jha (@baaghinitesh)
- **Architecture**: Full-stack MERN development with MongoDB
- **Design**: Modern UI/UX with Tailwind CSS
- **AI Integration**: Smart assistant with contextual responses

## 🎉 Status

**Current Version**: 2.1.0  
**Status**: Production Ready ✅  
**MongoDB Migration**: Complete ✅  
**AI Chat Assistant**: Fully Functional ✅  
**Real-time Features**: Operational ✅  
**Authentication**: Working with Test Account ✅  
**API Endpoints**: All Verified ✅

---

**ShikshaGuru** - *Connecting Knowledge, Empowering Futures* 🚀

*Now powered entirely by MongoDB for better scalability and performance!*