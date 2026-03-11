# CyberShield Guard - Separate Backend & Frontend Setup

## 🏗️ Architecture Overview

This project uses a **separate backend and frontend architecture**:

- **Backend**: Node.js + Express.js REST API (Port 5000)
- **Frontend**: Next.js 15 React Application (Port 3000)
- **Database**: PostgreSQL

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js        │────────▶│  Express.js     │────────▶│  PostgreSQL     │
│  Frontend       │  HTTP   │  Backend API    │  SQL    │  Database       │
│  (Port 3000)    │◀────────│  (Port 5000)    │◀────────│  (Port 5432)    │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## 📋 Prerequisites

- **Node.js** v18+
- **PostgreSQL** v12+
- **npm** or **bun**

## 🚀 Quick Start Guide

### Step 1: Install PostgreSQL

#### Windows:

1. Download from: https://www.postgresql.org/download/windows/
2. Install and remember your password
3. Default port: 5432

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cybershield_db;

# Exit
\q
```

### Step 3: Run Database Schema

```bash
# Navigate to project root
cd c:\utsav\cybersecurity\cybershield-guard-main

# Run schema
psql -U postgres -d cybershield_db -f database/schema.sql
```

### Step 4: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment
# Edit backend/.env and update:
# - DATABASE_URL with your PostgreSQL password
# - JWT_SECRET with a strong random string

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

### Step 5: Setup Frontend

```bash
# Navigate to project root (open new terminal)
cd c:\utsav\cybersecurity\cybershield-guard-main

# Install dependencies (if not already done)
npm install

# Frontend .env.local is already configured to point to backend

# Start frontend server
npm run dev
```

Frontend will run on: **http://localhost:3000**

## 📁 Project Structure

```
cybershield-guard-main/
├── backend/                      # Separate Backend Server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js      # PostgreSQL connection
│   │   ├── controllers/
│   │   │   └── authController.js # Auth logic
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT middleware
│   │   ├── routes/
│   │   │   └── authRoutes.js    # API routes
│   │   ├── utils/
│   │   │   └── auth.js          # Auth utilities
│   │   └── server.js            # Express server
│   ├── .env                     # Backend config
│   └── package.json
│
├── src/                         # Frontend (Next.js)
│   ├── app/
│   │   └── superadmin/
│   │       ├── signin/          # Login page
│   │       ├── signup/          # Registration page
│   │       └── otp/             # OTP verification
│   └── ...
│
├── database/
│   └── schema.sql               # Database schema
│
├── .env.local                   # Frontend config
└── package.json                 # Frontend dependencies
```

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

#### 1. Health Check

```
GET /health
```

#### 2. Sign Up

```
POST /api/auth/signup

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}

Response:
{
  "success": true,
  "message": "Account created successfully",
  "user": {...},
  "developmentOTP": "123456"
}
```

#### 3. Login

```
POST /api/auth/login

Body:
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {...},
  "requiresOTP": true,
  "developmentOTP": "123456"
}
```

#### 4. Verify OTP

```
POST /api/auth/verify-otp

Body:
{
  "email": "john@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "OTP verified successfully",
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 5. Get Current User (Protected)

```
GET /api/auth/me

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {...}
}
```

#### 6. Logout (Protected)

```
POST /api/auth/logout

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

## ⚙️ Configuration Files

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cybershield_db
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🧪 Testing the Application

### 1. Start Both Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

### 2. Test Sign Up Flow

1. Visit: http://localhost:3000/superadmin/signup
2. Fill in the form
3. Check terminal for OTP code
4. Enter OTP on verification page
5. You'll be redirected to dashboard

### 3. Test Sign In Flow

1. Visit: http://localhost:3000/superadmin/signin
2. Use demo credentials:
   - Email: `superadmin@cybersecurity.com`
   - Password: `SuperAdmin@123`
3. Check terminal for OTP
4. Enter OTP
5. Access dashboard

## 🔐 Security Features

✅ **Password Hashing**: bcrypt with 10 salt rounds
✅ **JWT Authentication**: 7-day token expiration
✅ **Two-Factor Authentication**: OTP verification
✅ **Rate Limiting**: 100 requests per 15 minutes
✅ **CORS Protection**: Configured for frontend URL
✅ **Helmet.js**: Security headers
✅ **Input Validation**: Email and password strength checks
✅ **SQL Injection Protection**: Parameterized queries

## 🛠️ Development Scripts

### Backend

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

### Frontend

```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm start        # Start production server
```

## 📊 Database Schema

### Users Table

```sql
- id (SERIAL PRIMARY KEY)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- role (VARCHAR)
- is_verified (BOOLEAN)
- otp_code (VARCHAR)
- otp_expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

### Sessions Table

```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK)
- token (VARCHAR)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

## 🐛 Troubleshooting

### Backend Won't Start

- Check if PostgreSQL is running
- Verify DATABASE_URL in backend/.env
- Ensure port 5000 is not in use

### Frontend Can't Connect to Backend

- Verify backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check browser console for CORS errors

### Database Connection Error

- Verify PostgreSQL credentials
- Check if database exists
- Ensure PostgreSQL service is running

### OTP Not Showing

- Check backend terminal console
- OTP is logged in development mode
- Check sessionStorage in browser DevTools

## 🚀 Production Deployment

### Backend Deployment

1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Enable database SSL
4. Configure email service for OTP
5. Set up proper logging
6. Use process manager (PM2)

### Frontend Deployment

1. Update NEXT_PUBLIC_API_URL to production backend URL
2. Build: `npm run build`
3. Deploy to Vercel/Netlify/etc.

### Database

1. Use managed PostgreSQL (AWS RDS, Heroku, etc.)
2. Enable SSL connections
3. Set up backups
4. Configure connection pooling

## 📝 Environment Variables Summary

| Variable              | Location | Description                  |
| --------------------- | -------- | ---------------------------- |
| `PORT`                | Backend  | Server port (5000)           |
| `DATABASE_URL`        | Backend  | PostgreSQL connection string |
| `JWT_SECRET`          | Backend  | Secret for JWT signing       |
| `FRONTEND_URL`        | Backend  | Frontend URL for CORS        |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API URL              |

## 🎯 Key Features

✅ Separate backend and frontend
✅ RESTful API architecture
✅ JWT-based authentication
✅ Two-factor authentication (OTP)
✅ PostgreSQL database
✅ Password strength validation
✅ Rate limiting
✅ CORS protection
✅ Secure session management
✅ Beautiful responsive UI

## 📚 Tech Stack

**Backend:**

- Node.js
- Express.js
- PostgreSQL (pg)
- bcryptjs
- jsonwebtoken
- helmet
- cors
- express-rate-limit

**Frontend:**

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide React Icons

## 🤝 Support

For issues:

1. Check both backend and frontend terminals
2. Verify all environment variables
3. Ensure PostgreSQL is running
4. Check browser console and Network tab

---

**Happy Coding! 🚀**
