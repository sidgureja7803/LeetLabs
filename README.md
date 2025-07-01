# Thapar Virtual Labs

A comprehensive, production-ready virtual laboratory platform for **Thapar Institute of Engineering and Technology**, built with modern web technologies and AI integration.

## 🌟 Overview

Thapar Virtual Labs is a full-stack educational platform that provides:
- **Role-based dashboards** for Admins, Teachers, and Students
- **Advanced quiz management** with scheduling and auto-grading
- **Assignment creation and submission** with file upload
- **Real-time notifications** and announcements
- **AI-powered chatbot** with Llama integration
- **Email verification** and secure authentication
- **Comprehensive grade tracking** and analytics
- **Mobile-responsive design** with modern UI

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **Axios** for API communication
- **React Hooks** for state management

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Prisma ORM** with **PostgreSQL**
- **JWT Authentication** with HTTP-only cookies
- **AWS S3** for file storage
- **Nodemailer** for emails
- **bcrypt** for password hashing
- **Rate limiting** and security middleware

### Infrastructure
- **Docker** for containerization
- **AWS EC2** for backend hosting
- **AWS RDS** for PostgreSQL database
- **AWS S3** for file storage
- **Vercel/AWS CloudFront** for frontend

## ✨ Key Features

### 🔐 Authentication & Security
- ✅ Email verification for new accounts
- ✅ Password reset functionality
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Rate limiting and CORS protection
- ✅ Account lockout for security

### 👨‍🏫 Teacher Features
- ✅ **Quiz Management**: Create, schedule, and auto-grade quizzes
- ✅ **Assignment System**: Create assignments with deadlines
- ✅ **Grading Tools**: Grade submissions with feedback
- ✅ **Class Management**: Monitor student progress
- ✅ **Announcements**: Send notifications to students
- ✅ **File Upload**: Support for attachments and rubrics

### 👨‍🎓 Student Features
- ✅ **Quiz Taking**: Timed quizzes with multiple question types
- ✅ **Assignment Submission**: Upload files and text submissions
- ✅ **Grade Tracking**: View grades and performance analytics
- ✅ **Calendar View**: Track assignment deadlines
- ✅ **Notifications**: Real-time updates on new content
- ✅ **Progress Monitoring**: Track academic performance

### 👨‍💼 Admin Features
- ✅ **User Management**: Create and manage users
- ✅ **System Analytics**: Platform usage statistics
- ✅ **Semester Management**: Configure academic terms
- ✅ **Department Management**: Organize by departments
- ✅ **Audit Logs**: Track system activities
- ✅ **Bulk Operations**: Efficient user management

### 🤖 AI Features
- ✅ **Chatbot Integration**: Llama-powered assistant
- ✅ **Contextual Help**: Subject-specific assistance
- ✅ **Code Help**: Programming support and debugging
- ✅ **24/7 Availability**: Always available support

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js 18+**
- **PostgreSQL 14+**
- **AWS Account** (for S3 and deployment)
- **Llama API Key** (for chatbot)

### 1. Clone Repository
```bash
git clone <repository-url>
cd thapar-virtual-labs
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

#### Backend Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/thapar_labs"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Email Configuration (Gmail example)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Thapar Virtual Labs <your-email@gmail.com>"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-west-2"
AWS_S3_BUCKET="thapar-labs-files"

# Llama API
LLAMA_API_URL="https://api.llama-api.com/chat/completions"
LLAMA_API_KEY="your-llama-api-key"

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Node Environment
NODE_ENV="development"
PORT=5000
```

#### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database with sample data
npx prisma db seed
```

#### Start Backend
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

#### Frontend Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
```

#### Start Frontend
```bash
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🧪 Demo Credentials

The platform comes with pre-seeded demo accounts:

### Admin Account
- **Email**: admin@thapar.edu
- **Password**: admin123
- **Role**: Administrator

### Teacher Account
- **Email**: teacher@thapar.edu
- **Password**: teacher123
- **Role**: Teacher

### Student Account
- **Email**: student@thapar.edu
- **Password**: student123
- **Role**: Student

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Backend
cd backend
docker build -t thapar-labs-backend .

# Frontend
cd frontend
docker build -t thapar-labs-frontend .
```

## ☁️ Production Deployment

### AWS Infrastructure Setup

#### 1. Database (AWS RDS)
```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier thapar-labs-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password yourpassword \
  --allocated-storage 20
```

#### 2. File Storage (AWS S3)
```bash
# Create S3 bucket
aws s3 mb s3://thapar-labs-files

# Configure CORS policy
aws s3api put-bucket-cors \
  --bucket thapar-labs-files \
  --cors-configuration file://cors.json
```

#### 3. Backend (AWS EC2)
```bash
# Launch EC2 instance
# Install Docker and Docker Compose
# Deploy backend container
# Configure nginx reverse proxy
# Setup SSL certificate with Let's Encrypt
```

#### 4. Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Environment Variables for Production
Update all environment variables with production values:
- Database connection strings
- AWS credentials and regions
- Email service configuration
- Llama API keys
- Frontend/backend URLs

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
POST   /api/auth/verify-email       # Verify email address
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password
GET    /api/auth/me                 # Get current user
```

### Quiz Endpoints
```
POST   /api/quizzes                 # Create quiz (Teacher/Admin)
GET    /api/quizzes/teacher         # Get teacher's quizzes
GET    /api/quizzes/student         # Get student's quizzes
POST   /api/quizzes/:id/start       # Start quiz attempt
POST   /api/quizzes/attempts/:id/submit  # Submit quiz
```

### Assignment Endpoints
```
POST   /api/assignments             # Create assignment
GET    /api/assignments             # Get assignments
POST   /api/assignments/:id/submit  # Submit assignment
GET    /api/assignments/:id/submissions  # Get submissions
```

### Notification Endpoints
```
GET    /api/notifications           # Get user notifications
PUT    /api/notifications/:id/read  # Mark as read
DELETE /api/notifications/:id       # Delete notification
```

### Chatbot Endpoints
```
POST   /api/chatbot/init            # Initialize chat session
POST   /api/chatbot/message         # Send message
GET    /api/chatbot/sessions        # Get chat sessions
```

## 🔧 Development Guidelines

### Code Style
- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **conventional commits** for git messages
- Write **unit tests** for critical functions

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Features Roadmap

### Completed ✅
- [x] User authentication with email verification
- [x] Role-based dashboards (Admin, Teacher, Student)
- [x] Quiz creation and management system
- [x] Assignment creation and submission
- [x] Real-time notifications
- [x] AI chatbot integration
- [x] File upload and management
- [x] Grade tracking and analytics
- [x] Email notifications
- [x] Mobile-responsive design

### In Development 🚧
- [ ] Judge0 compiler integration for code execution
- [ ] Advanced analytics dashboard
- [ ] Video conferencing integration
- [ ] Plagiarism detection
- [ ] LMS integration capabilities
- [ ] Mobile app development

### Future Features 🔮
- [ ] Blockchain-based certificates
- [ ] AR/VR lab simulations
- [ ] Machine learning-powered recommendations
- [ ] Advanced reporting and insights
- [ ] Multi-language support
- [ ] API marketplace for extensions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@thapar.edu
- **Documentation**: [Wiki](wiki-url)
- **Issues**: [GitHub Issues](issues-url)

## 🙏 Acknowledgments

- **Thapar Institute of Engineering and Technology**
- **Open source community** for amazing tools and libraries
- **Contributors** who help improve the platform

---

**Built with ❤️ for education at Thapar Institute of Engineering and Technology** 