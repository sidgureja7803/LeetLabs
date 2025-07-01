# Thapar Virtual Labs Platform

A comprehensive full-stack virtual laboratory platform built for Thapar Institute of Engineering and Technology. This platform supports role-based access for Students, Teachers, and Administrators with features including assignment management, file submissions, and automated grading.

## 🌟 Features

### 🎓 For Students
- View and submit assignments
- Upload code files and documents
- Track submission status and grades
- Access subject materials
- Real-time progress tracking

### 👨‍🏫 For Teachers
- Create and manage assignments
- Upload assignment files (PDFs, PPTs)
- Review and grade student submissions
- Manage assigned subjects
- Email notifications for submissions

### 👨‍💼 For Administrators
- Manage users (Students, Teachers)
- Assign teachers to subjects
- System analytics and reporting
- Semester data management
- Department and subject management

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: React Context API
- **File Upload**: React Dropzone
- **Animations**: Framer Motion
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Storage**: AWS S3
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL
- **Cache**: Redis
- **Cloud Storage**: AWS S3
- **Deployment**: AWS EC2 + RDS / Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- AWS Account (for S3 and deployment)
- Docker (optional, for containerized development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Capstone
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Copy the `.env` file and update with your credentials:
```bash
cp .env.example .env
```

Update the following variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/thapar_virtual_labs"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="your-s3-bucket-name"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

#### Start Backend Server
```bash
npm run dev
```
Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### Start Frontend Server
```bash
npm run dev
```
Frontend will be available at `http://localhost:3000`

### 4. Docker Setup (Alternative)

Run the entire stack with Docker:
```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379  
- Backend API on port 8000

## 🔐 Default Login Credentials

After running the seed script, you can login with:

- **Admin**: `admin@thapar.edu` / `admin123`
- **Teacher**: `teacher@thapar.edu` / `teacher123`  
- **Student**: `student@thapar.edu` / `student123`

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database, AWS, Email configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Authentication, validation, error handling
│   │   ├── utils/           # Utility functions (email, S3, logging)
│   │   ├── jobs/            # Background jobs
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeding
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/
│   ├── app/                 # Next.js app directory
│   │   ├── dashboard/       # Role-based dashboards
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities, API, types, auth
│   └── styles/              # Global styles
│
└── README.md
```

## 🎨 UI Components

The platform uses **Shadcn/ui** components built on top of **Radix UI** primitives. Key components include:

- **Authentication**: Login forms with validation
- **Dashboards**: Role-specific interfaces
- **File Upload**: Drag & drop with progress
- **Data Tables**: Sortable, filterable tables
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Toast notifications
- **Modals**: Confirmation dialogs
- **Navigation**: Responsive sidebar and navbar

## 🔒 Security Features

- **Authentication**: JWT tokens in HTTP-only cookies
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: API endpoint protection
- **CORS**: Cross-origin request security
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **File Upload**: Type and size restrictions
- **SQL Injection**: Prisma ORM protection

## 📊 Database Schema

### Core Models
- **User**: Students, Teachers, Admins with role-based access
- **Department**: Engineering departments (CSE, ECE, ME, etc.)
- **Subject**: Courses with semester and credit information
- **TeacherSubject**: Teacher-subject assignments per semester
- **Assignment**: Assignment details with file attachments
- **Submission**: Student submissions with grading
- **SystemConfig**: Application configuration

### Key Relationships
- Users belong to Departments
- Teachers are assigned to Subjects per semester
- Assignments belong to Subjects and are created by Teachers
- Students submit files for Assignments
- Submissions can be graded by Teachers

## 🚀 Deployment

### Backend Deployment (AWS EC2)
1. Create EC2 instance with Ubuntu/Amazon Linux
2. Install Node.js, Docker, and PostgreSQL
3. Set up RDS PostgreSQL instance
4. Configure S3 bucket for file storage
5. Set up environment variables
6. Deploy using Docker or PM2

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure custom domain (optional)
4. Deploy automatically on push to main branch

### Database (AWS RDS)
1. Create PostgreSQL RDS instance
2. Configure security groups for access
3. Run migrations and seed data
4. Set up automated backups

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests  
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

## 📈 Performance Optimizations

- **Frontend**: Next.js SSR/SSG, code splitting, image optimization
- **Backend**: Connection pooling, caching with Redis, query optimization
- **Database**: Proper indexing, query optimization
- **Files**: CDN for static assets, S3 for file storage
- **Monitoring**: Winston logging, error tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: support@thapar.edu
- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues]

## 🙏 Acknowledgments

- Thapar Institute of Engineering and Technology
- Open source libraries and frameworks used
- Contributors and maintainers

---

**Built with ❤️ for Thapar Institute of Engineering and Technology** 