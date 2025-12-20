# Learning Management System (LMS)

A full-stack Learning Management System built with modern technologies for seamless course management and student progress tracking.

## 🚀 Tech Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **TypeScript** - Type safety and better development experience
- **Prisma** - Database ORM with PostgreSQL
- **Zod** - Runtime type validation
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **PDFKit** - Certificate generation

### Frontend
- **React 18** with **TypeScript**
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components

### Database
- **PostgreSQL** - Primary database
- **Prisma** - Database schema and migrations

## 📋 Features

### 🔐 Authentication & Authorization
- **Role-based access control** (Student, Mentor, Admin)
- **JWT-based authentication**
- **Mentor approval system** - Mentors require admin approval
- **Secure password hashing**

### 👨‍🎓 Student Features
- **Course enrollment** and progress tracking
- **Sequential chapter access** - Must complete chapters in order
- **Progress percentage** calculation
- **Certificate generation** upon course completion
- **Personal dashboard** with enrolled courses

### 👨‍🏫 Mentor Features
- **Course creation** and management
- **Chapter management** with sequence ordering
- **Student enrollment** (individual and bulk)
- **Student progress monitoring**
- **Course roster** with progress insights
- **Student search** functionality

### 👨‍💼 Admin Features
- **User management** (create, approve, delete)
- **Mentor approval/rejection**
- **System-wide statistics**
- **Course oversight** with enrollment counts
- **Enrollment management** across all courses

### 📚 Course Management
- **Structured courses** with sequential chapters
- **Rich media support** (videos, images)
- **Progress tracking** per student
- **Bulk student assignment**
- **Course completion certificates**

## 🏗️ Project Structure

```
LearningMangementSystem/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-specific components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── lib/           # Utilities and helpers
│   │   └── types/         # TypeScript type definitions
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API route definitions
│   │   ├── middlewares/    # Custom middleware
│   │   ├── utils/          # Utilities and schemas
│   │   ├── config/         # Configuration files
│   │   └── types/          # TypeScript type definitions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lms_db"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=4000
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed database (optional)
   npx prisma db seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### User Management (Admin)
- `GET /api/users` - List all users
- `GET /api/users/search-students` - Search students
- `POST /api/users` - Create user (any role)
- `PUT /api/users/:id/approve-mentor` - Approve mentor
- `PUT /api/users/:id/reject-mentor` - Reject mentor
- `DELETE /api/users/:id` - Delete user

### Course Management
- `GET /api/courses` - List courses
- `GET /api/courses/my` - Get user's courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Mentor)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Chapter Management
- `GET /api/courses/:id/chapters` - Get course chapters
- `GET /api/courses/:courseId/chapters/:chapterId` - Get single chapter
- `POST /api/courses/:id/chapters` - Add chapter

### Enrollment
- `POST /api/courses/:id/assign` - Assign single student
- `POST /api/courses/:id/assign/bulk` - Bulk assign students
- `GET /api/courses/:id/students` - Get course roster

### Progress Tracking
- `GET /api/progress/my` - Get student progress
- `POST /api/progress/:chapterId/complete` - Mark chapter complete
- `GET /api/courses/:id/progress` - Get student progress (Mentor)

### Admin Analytics
- `GET /api/admin/courses` - Admin course list with stats
- `GET /api/admin/enrollments` - All enrollments overview
- `GET /api/admin/stats` - System statistics

### Certificates
- `GET /api/certificates/:courseId` - Download completion certificate

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Role-based authorization** middleware
- **Password hashing** with bcrypt
- **Input validation** with Zod schemas
- **SQL injection protection** via Prisma ORM
- **CORS configuration** for cross-origin requests

## 📊 Database Schema

### Core Entities
- **Users** - Students, Mentors, Admins with approval system
- **Courses** - Created by mentors, enrolled by students
- **Chapters** - Sequential course content with media
- **Enrollments** - Student-course relationships
- **Progress** - Chapter completion tracking

### Key Relationships
- Users → Courses (mentor ownership)
- Users → Enrollments → Courses (student enrollment)
- Chapters → Progress (completion tracking)
- Sequential chapter access control

## 🎯 Business Logic

### Sequential Learning
- Students must complete chapters in sequence
- Previous chapters must be completed before accessing next
- Progress percentage calculated automatically

### Mentor Approval
- Mentors require admin approval before creating courses
- Unapproved mentors have limited access

### Certificate Generation
- Automatic PDF certificate generation
- Only available after 100% course completion
- Includes student name, course title, and completion date

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Run database migrations
3. Build and start the application
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment
1. Build the React application
   ```bash
   npm run build
   ```
2. Serve the `dist` folder with a web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by educational platform best practices
- Designed for scalability and maintainability