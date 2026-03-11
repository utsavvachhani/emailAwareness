# CyberShield Guard - Authentication Setup Guide

## 🚀 Dynamic Authentication with PostgreSQL & Node.js

This guide will help you set up the complete authentication system with PostgreSQL database and Node.js backend.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **bun** package manager

## 🔧 Setup Instructions

### Step 1: Install PostgreSQL

#### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

#### Verify Installation:
```bash
psql --version
```

### Step 2: Create Database

1. Open **pgAdmin** (comes with PostgreSQL) or use command line
2. Connect to PostgreSQL:
```bash
psql -U postgres
```

3. Create the database:
```sql
CREATE DATABASE cybershield_db;
```

4. Exit psql:
```sql
\q
```

### Step 3: Run Database Schema

Navigate to your project directory and run the schema file:

```bash
psql -U postgres -d cybershield_db -f database/schema.sql
```

Or manually execute the SQL in `database/schema.sql` using pgAdmin.

### Step 4: Configure Environment Variables

1. Open `.env.local` file in the project root
2. Update the `DATABASE_URL` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cybershield_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

Replace:
- `YOUR_PASSWORD` with your PostgreSQL password
- `your-super-secret-jwt-key-change-this-in-production` with a strong random string

### Step 5: Install Dependencies

```bash
npm install
# or
bun install
```

### Step 6: Start Development Server

```bash
npm run dev
# or
bun dev
```

The application will be available at: http://localhost:3000

## 🎯 Testing the Authentication

### Sign Up Flow:
1. Navigate to: http://localhost:3000/superadmin/signup
2. Fill in the registration form:
   - First Name
   - Last Name
   - Email
   - Password (must meet requirements)
   - Confirm Password
3. Click "Create Account"
4. You'll receive an OTP (displayed in console and on screen in development mode)
5. Enter the OTP to verify your account
6. You'll be redirected to the dashboard

### Sign In Flow:
1. Navigate to: http://localhost:3000/superadmin/signin
2. Enter your credentials:
   - Email
   - Password
3. Click "Sign In"
4. Enter the OTP sent to your email (displayed in console in development)
5. You'll be redirected to the dashboard

### Demo Account:
A demo super admin account is automatically created:
- **Email**: superadmin@cybersecurity.com
- **Password**: SuperAdmin@123

## 🔐 Password Requirements

Passwords must meet the following criteria:
- At least 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

## 📊 Database Schema

### Users Table:
- `id` - Primary key
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `role` - User role (default: superadmin)
- `is_verified` - Email verification status
- `otp_code` - Current OTP code
- `otp_expires_at` - OTP expiration timestamp
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login` - Last login timestamp

### Sessions Table:
- `id` - Primary key
- `user_id` - Foreign key to users table
- `token` - JWT authentication token
- `expires_at` - Token expiration timestamp
- `created_at` - Session creation timestamp

## 🛠️ API Endpoints

### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "superadmin"
  },
  "developmentOTP": "123456"
}
```

### POST /api/auth/login
Authenticate user and generate OTP.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful. Please verify with OTP.",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "superadmin",
    "isVerified": true
  },
  "requiresOTP": true,
  "developmentOTP": "123456"
}
```

### POST /api/auth/verify-otp
Verify OTP and create session.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "superadmin",
    "isVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🔍 Troubleshooting

### Database Connection Error:
- Verify PostgreSQL is running
- Check your DATABASE_URL in `.env.local`
- Ensure the database exists
- Verify your PostgreSQL credentials

### OTP Not Showing:
- Check the browser console (F12)
- Check the terminal where the dev server is running
- OTP is logged to console in development mode

### Authentication Token Issues:
- Clear browser localStorage and sessionStorage
- Sign in again to get a new token

## 📝 Production Deployment

Before deploying to production:

1. **Remove Development OTP Display**:
   - OTP should only be sent via email
   - Remove `developmentOTP` from API responses

2. **Secure Environment Variables**:
   - Use strong, random JWT_SECRET
   - Use production database credentials
   - Set NODE_ENV=production

3. **Enable SSL for Database**:
   - Update DATABASE_URL to use SSL
   - Configure PostgreSQL for SSL connections

4. **Implement Email Service**:
   - Integrate email service (SendGrid, AWS SES, etc.)
   - Send OTP via email instead of console logging

5. **Rate Limiting**:
   - Add rate limiting to prevent brute force attacks
   - Limit OTP generation requests

## 🎨 Features

✅ User Registration with validation
✅ Secure password hashing with bcrypt
✅ Email-based authentication
✅ Two-factor authentication with OTP
✅ JWT token-based sessions
✅ Password strength validation
✅ Session management
✅ Responsive UI design
✅ Error handling and user feedback
✅ Auto-focus and paste support for OTP input

## 📚 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **UI Components**: Lucide React icons, Custom components

## 🤝 Support

If you encounter any issues, please check:
1. PostgreSQL is running
2. Database schema is properly set up
3. Environment variables are correctly configured
4. All dependencies are installed

For additional help, check the console logs for detailed error messages.
