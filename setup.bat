@echo off
echo ========================================
echo CyberShield Guard - Quick Setup
echo ========================================
echo.

echo Step 1: Setting up Backend...
echo.
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed.
)

echo.
echo Step 2: Setting up Frontend...
echo.
cd ..
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is installed and running
echo 2. Run database setup: psql -U postgres -d cybershield_db -f database/schema.sql
echo 3. Update backend/.env with your PostgreSQL password
echo.
echo To start the application:
echo 1. Open Terminal 1: cd backend ^&^& npm run dev
echo 2. Open Terminal 2: npm run dev
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
pause
