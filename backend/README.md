# CyberShield Guard Backend API

Backend API server for CyberShield Guard authentication system.

## Features

- User authentication with OTP verification
- JWT-based session management
- PostgreSQL database integration
- Secure password hashing with bcrypt
- Rate limiting and security headers
- Automatic database initialization

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Create a `.env` file in the backend directory with the following:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # PostgreSQL Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/cybershield_db

   # JWT Secret for authentication tokens
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Create the PostgreSQL database:**

   ```bash
   # Using psql
   createdb cybershield_db

   # Or using SQL
   psql -U postgres
   CREATE DATABASE cybershield_db;
   ```

4. **Initialize the database (optional):**

   The database tables will be created automatically when you start the server. However, you can also run the setup manually:

   ```bash
   npm run setup-db
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Public Endpoints

- `GET /health` - Health check endpoint
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/verify-otp` - Verify OTP code

### Protected Endpoints (require authentication)

- `GET /api/auth/me` - Get current user information
- `POST /api/auth/logout` - Logout and invalidate session

## Database Schema

The application uses two main tables:

### Users Table

- `id` - Primary key
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `role` - User role (default: 'superadmin')
- `is_verified` - Email verification status
- `otp_code` - Current OTP code
- `otp_expires_at` - OTP expiration timestamp
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login` - Last login timestamp

### Sessions Table

- `id` - Primary key
- `user_id` - Foreign key to users table
- `token` - JWT token
- `expires_at` - Session expiration timestamp
- `created_at` - Session creation timestamp

## Development

The server uses nodemon for automatic reloading during development. Any changes to the source files will automatically restart the server.

## Security Features

- **Helmet**: Sets security-related HTTP headers
- **CORS**: Configured to only allow requests from the frontend URL
- **Rate Limiting**: Prevents abuse by limiting requests per IP
- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **OTP Verification**: Two-factor authentication for enhanced security

## Troubleshooting

### Port Already in Use

If you get an error that port 5000 is already in use:

**Windows:**

```powershell
# Find the process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify the DATABASE_URL in your `.env` file is correct
3. Check that the database exists
4. Verify your PostgreSQL user has the correct permissions

### OTP in Development

In development mode, the OTP code is returned in the API response and logged to the console. This is for testing purposes only and should be removed in production.

## Production Deployment

Before deploying to production:

1. Change `NODE_ENV` to `production` in your `.env` file
2. Use a strong, unique `JWT_SECRET`
3. Remove the `developmentOTP` field from API responses
4. Configure proper email service for OTP delivery
5. Use environment variables for sensitive configuration
6. Enable SSL for database connections
7. Set up proper logging and monitoring

## License

ISC
