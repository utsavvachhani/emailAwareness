# Quick Database Setup Script for Windows PowerShell
# Run this script to quickly set up the database

Write-Host "🚀 CyberShield Guard - Database Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Please enter your PostgreSQL credentials:" -ForegroundColor Yellow
$pgUser = Read-Host "PostgreSQL username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($pgUser)) {
    $pgUser = "postgres"
}

$pgPassword = Read-Host "PostgreSQL password" -AsSecureString
$pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))

$pgHost = Read-Host "PostgreSQL host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($pgHost)) {
    $pgHost = "localhost"
}

$pgPort = Read-Host "PostgreSQL port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($pgPort)) {
    $pgPort = "5432"
}

$dbName = "cybershield_db"

Write-Host ""
Write-Host "Creating database '$dbName'..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable for authentication
$env:PGPASSWORD = $pgPasswordPlain

# Create database
$createDbCommand = "CREATE DATABASE $dbName;"
$createDbResult = $createDbCommand | psql -U $pgUser -h $pgHost -p $pgPort -d postgres 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully" -ForegroundColor Green
} else {
    if ($createDbResult -like "*already exists*") {
        Write-Host "⚠️  Database already exists, continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to create database: $createDbResult" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Running database schema..." -ForegroundColor Yellow

# Run schema file
$schemaPath = Join-Path $PSScriptRoot "backend\database\schema.sql"
if (Test-Path $schemaPath) {
    psql -U $pgUser -h $pgHost -p $pgPort -d $dbName -f $schemaPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema applied successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to apply schema" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Schema file not found at: $schemaPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Updating .env.local file..." -ForegroundColor Yellow

# Create DATABASE_URL
$databaseUrl = "postgresql://${pgUser}:${pgPasswordPlain}@${pgHost}:${pgPort}/${dbName}"

# Update or create .env.local
$envPath = Join-Path $PSScriptRoot ".env.local"
$envContent = @"
# PostgreSQL Database Configuration
DATABASE_URL=$databaseUrl

# JWT Secret for authentication tokens
JWT_SECRET=$(New-Guid)

# Node Environment
NODE_ENV=development
"@

$envContent | Set-Content -Path $envPath -Force
Write-Host "✅ Environment file updated" -ForegroundColor Green

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm install' or 'bun install' to install dependencies" -ForegroundColor White
Write-Host "2. Run 'npm run dev' or 'bun dev' to start the development server" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000/superadmin/signin" -ForegroundColor White
Write-Host ""
Write-Host "Demo credentials:" -ForegroundColor Yellow
Write-Host "Email: superadmin@cybersecurity.com" -ForegroundColor White
Write-Host "Password: SuperAdmin@123" -ForegroundColor White
Write-Host ""
