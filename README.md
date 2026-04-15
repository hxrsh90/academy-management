# Academy Management System

A comprehensive sports/fitness academy management platform designed for the Indian market. Built with Node.js, PostgreSQL (Neon), and React.

## Features

- **Multi-Role System**: Super Admin, Admin, Coach, Student, Parent
- **Student Management**: Enrollment, profiles, medical info, skill levels
- **Class/Batch Management**: Schedule, capacity, coach assignment
- **Attendance Tracking**: Mark attendance by class/date with multiple status options
- **Payment Management**: Fee recording, dues tracking, payment history
- **OTP Authentication**: Mobile-based login for Indian market
- **Reports & Dashboard**: Revenue, attendance, enrollment analytics

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (Neon DB for serverless)
- JWT Authentication + OTP (SMS via Twilio)
- Raw SQL queries with `pg` library

### Frontend
- React 18
- React Router v6
- Tailwind CSS (via CDN)
- Axios for API calls

## Project Structure

```
academy-platform/
├── src/
│   ├── config/          # Database config
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database queries
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, error handling
│   ├── utils/           # JWT, OTP, SMS helpers
│   └── server.js        # Entry point
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Layout, PrivateRoute
│   │   ├── pages/       # Dashboard, Students, Classes, etc.
│   │   ├── context/     # AuthContext
│   │   └── services/    # API service
│   └── public/
├── database/
│   └── migrations/      # SQL schema
├── uploads/             # File uploads
└── .env.example         # Environment template
```

## Quick Start

### 1. Automated Setup

```bash
# Run the setup script
node setup.js
```

Or manual setup:

```bash
# Install dependencies
npm install
cd client && npm install

# Copy environment file
cp .env.example .env
```

### 2. Database Setup (Neon)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and copy the connection string
3. Add the connection string to your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@host.region.aws.neon.tech/database?sslmode=require
   ```
4. Run migrations and seed data:

```bash
npm run db:migrate
npm run db:seed
```

This creates default users:
- Admin: `9999999999` / `admin123`
- Coach: `8888888888` / `coach123`

### 3. Environment Variables

Required in `.env`:

```env
# Database (Neon)
DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Optional: SMS (Twilio) for OTP
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

### 4. Run the Application

```bash
# Run both backend and frontend together
npm run dev:full

# Or run separately:
npm run dev          # Backend: http://localhost:5000
cd client && npm start   # Frontend: http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with password
- `POST /api/v1/auth/otp/send` - Send OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP & login
- `GET /api/v1/auth/profile` - Get current user

### Students
- `GET /api/v1/students` - List students
- `POST /api/v1/students` - Create student
- `GET /api/v1/students/:id` - Get student details
- `PUT /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Delete student
- `GET /api/v1/students/:id/attendance` - Student attendance
- `GET /api/v1/students/:id/payments` - Student payments

### Classes
- `GET /api/v1/classes` - List classes
- `POST /api/v1/classes` - Create class
- `GET /api/v1/classes/:id` - Get class details
- `PUT /api/v1/classes/:id` - Update class
- `DELETE /api/v1/classes/:id` - Delete class
- `GET /api/v1/classes/:id/students` - Class students
- `POST /api/v1/classes/:id/students` - Add student
- `DELETE /api/v1/classes/:id/students/:studentId` - Remove student

### Attendance
- `GET /api/v1/attendance` - List attendance
- `POST /api/v1/attendance` - Mark attendance
- `POST /api/v1/attendance/bulk` - Bulk mark attendance
- `GET /api/v1/attendance/class` - Get class attendance by date

### Payments
- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Record payment
- `GET /api/v1/payments/pending` - Pending dues
- `GET /api/v1/payments/revenue` - Revenue stats

### Reports
- `GET /api/v1/reports/dashboard` - Dashboard stats
- `GET /api/v1/reports/attendance` - Attendance report
- `GET /api/v1/reports/payments` - Payment report
- `GET /api/v1/reports/enrollment` - Enrollment trends

## User Roles & Permissions

### Available Roles
- **super_admin** - Highest level, full system control
- **admin** - Administrative access for daily operations
- **coach** - Instructor access for class management
- **student** - Student access for self-service
- **parent** - Parent/guardian access to child's data

### Permission Matrix

#### Users Module (`/api/v1/users`)
| Action | super_admin | admin | coach | student | parent |
|--------|-------------|-------|-------|---------|--------|
| List users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ | ❌ | ❌ |
| Get user by ID | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update user | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Students Module (`/api/v1/students`)
| Action | super_admin | admin | coach | student | parent |
|--------|-------------|-------|-------|---------|--------|
| List students | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create student | ✅ | ✅ | ❌ | ❌ | ❌ |
| Get student details | ✅ | ✅ | ✅ | ✅* | ❌ |
| Update student | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete student | ✅ | ✅ | ❌ | ❌ | ❌ |
| View student classes | ✅ | ✅ | ✅ | ✅* | ❌ |
| View student attendance | ✅ | ✅ | ✅ | ✅* | ❌ |
| View student payments | ✅ | ✅ | ❌ | ✅* | ✅* |

*\* Can only view their own data*

#### Classes Module (`/api/v1/classes`)
| Action | super_admin | admin | coach | student | parent |
|--------|-------------|-------|-------|---------|--------|
| List classes | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create class | ✅ | ✅ | ❌ | ❌ | ❌ |
| Get class details | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update class | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete class | ✅ | ✅ | ❌ | ❌ | ❌ |
| View class students | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add student to class | ✅ | ✅ | ❌ | ❌ | ❌ |

#### Attendance Module (`/api/v1/attendance`)
| Action | super_admin | admin | coach | student | parent |
|--------|-------------|-------|-------|---------|--------|
| Mark attendance | ✅ | ✅ | ✅ | ❌ | ❌ |
| View attendance records | ✅ | ✅ | ✅ | ✅* | ❌ |

#### Payments Module (`/api/v1/payments`)
| Action | super_admin | admin | coach | student | parent |
|--------|-------------|-------|-------|---------|--------|
| Record payment | ✅ | ✅ | ❌ | ❌ | ❌ |
| View payments | ✅ | ✅ | ❌ | ✅* | ✅* |

### Creating Users

**Super Admin Creating Staff:**
```bash
POST /api/v1/users
{
  "email": "coach@academy.com",
  "mobile": "9876543210",
  "password": "password123",
  "role": "coach"
}
```

**Public Student Registration:**
```bash
POST /api/v1/auth/register
{
  "mobile": "9876543210",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Default Seeded Users
- **Super Admin:** `9999999999` / `admin123`
- **Coach:** `8888888888` / `coach123`

## Project Structure

```
academy-platform/
├── src/                 # Backend source
│   ├── config/          # Database config
│   ├── controllers/     # API controllers
│   ├── services/        # Business logic
│   ├── models/          # Database queries
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, errors
│   └── utils/           # JWT, OTP, SMS helpers
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Layout, PrivateRoute
│   │   ├── pages/       # Dashboard, Students, etc.
│   │   ├── context/     # AuthContext
│   │   └── services/    # API service
│   └── public/
├── database/
│   ├── migrations/      # SQL schema
│   └── seeds/           # Initial data
├── uploads/             # File uploads
└── .windsurf/           # Windsurf skills (Claude plugins)
```

## Available Scripts

- `npm run setup` - Automated project setup
- `npm run dev` - Start backend with hot reload
- `npm run dev:full` - Start both backend and frontend
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed initial data
- `npm run client` - Start frontend only
- `npm run build` - Build production frontend

## License

MIT License - See LICENSE file for details

## Branching Strategy

This project uses a three-branch workflow:

```
main (production)
  ↑
staging (pre-production)
  ↑
dev (development)
```

| Branch | Purpose | Deployment | Database |
|--------|---------|------------|----------|
| `main` | Production code | Vercel Production | Neon `neondb` |
| `staging` | Pre-production testing | Vercel Staging | Neon `neondb-staging` |
| `dev` | Daily development | Vercel Preview + Local | Neon `neondb-dev` |

See [WORKFLOW.md](./WORKFLOW.md) for detailed development workflow.

## Current Project Status

### ✅ Completed Features
- **Backend API**: All CRUD operations for users, students, classes, attendance, payments
- **Authentication**: JWT-based auth with password and OTP login support
- **Role-Based Access Control**: Full permission matrix implemented
- **Database Schema**: Complete PostgreSQL schema with migrations
- **Seed Data**: Default admin and coach users
- **Frontend Pages**: Login, Register, Dashboard, Students, Classes, Attendance, Payments, Reports
- **Deployment Config**: Vercel configuration for serverless deployment
- **Neon DB Integration**: Optimized for serverless connection pooling

### ⚠️ Known Limitations
- **Student Dashboard**: Basic version with quick links only (no progress tracking, upcoming classes)
- **Parent Dashboard**: Not implemented separately (parents use student view)
- **Real-time Features**: No WebSocket for live updates
- **Email Notifications**: SendGrid integration configured but not implemented in frontend
- **File Uploads**: Uploads configured but no UI for profile photos

### 🚀 Deployment
- **GitHub**: Private repo at `https://github.com/hxrsh90/academy-management`
- **Vercel**: Configured for auto-deployment from GitHub
- **Neon DB**: Connected to Vercel for production database
- **Environment**: Use Vercel environment variables for production secrets

### 📝 Development Notes
- Backend runs on port 5001 (dev) / 5000 (default)
- Frontend runs on port 3000
- Neon DB connection string required for both local dev and production
- SMS provider (Twilio) optional - falls back to mock mode
- All API routes prefixed with `/api/v1`

### 🔧 Troubleshooting
- **Port 5000 in use**: Change `PORT` in `.env` to 5001
- **Database connection failed**: Verify `DATABASE_URL` in `.env` matches Neon connection string
- **CORS errors**: Check `CLIENT_URL` in `.env` matches frontend URL
- **Login 500 error**: Check backend logs, ensure database migrations ran successfully
