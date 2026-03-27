# 🔐 Environment Backup Documentation

This document contains environment configurations for multiple projects, organized by project name and their respective backend/frontend services.

---

# 📁 Project: Email Awareness

## 🔧 Backend (.env)

```
# Server Configuration
PORT=5001
NODE_ENV=development

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:utsav21@localhost:5432/emailawareness

# JWT Authentication
JWT_ACCESS_SECRET=utsavpriya
JWT_REFRESH_SECRET=priyautsav

# Email Configuration
EMAIL_USER=uvachhani03@gmail.com
EMAIL_PASS=yzohwjlpuaypybbf

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500

# Cloudinary Configuration
CLOUD_NAME=dp1v6ynfs
CLOUD_API_KEY=658769713712352
CLOUD_API_SECRET=p3F3_QRwf8PZxwlLqvjP1SUfwsc
```

---

## 🎨 Frontend (.env)

```
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

# 📁 Project: Shoapzya

## 🛠 Admin Frontend (.env)

```
VITE_API_URL=http://localhost:5000/
```

---

## 🔧 Backend (.env)

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
# CONNECTION_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopazya
CONNECTION_URL=mongodb://localhost:27018/shoapzya-mongo

# Authentication
SUPERADMIN_PASSWORD=Uts@vHarshil@2026
JWT_SECRET=harshilutsav2026

# Email Configuration
EMAIL_USER=uvachhani03@gmail.com
EMAIL_PASS=yzohwjlpuaypybbf

# Cloudinary Configuration
CLOUD_NAME=dp1v6ynfs
CLOUD_API_KEY=658769713712352
CLOUD_API_SECRET=p3F3_QRwf8PZxwlLqvjP1SUfwsc
```

---

# 📁 Project: Gym Next App

## 📱 Frontend (Next.js .env)

```
NEXT_PUBLIC_SERVER_URL=http://localhost:5000/api
```

---

## 🔧 Backend (.env)

```
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/gym-app

# JWT Authentication
JWT_ACCESS_SECRET=utsavpriya
JWT_REFRESH_SECRET=priyautsav

# Email Configuration
EMAIL_USER=vachhaniutsav2@gmail.com
EMAIL_PASS=zxepdkfefkrpavtm

# Cloudinary Configuration
CLOUD_NAME=dp1v6ynfs
CLOUD_API_KEY=658769713712352
CLOUD_API_SECRET=p3F3_QRwf8PZxwlLqvjP1SUfwsc
```

---

# ⚠️ Security Notes

- 🚫 Do NOT commit this file to public repositories.
- 🔒 Rotate all secrets periodically (DB credentials, JWT secrets, API keys).
- 📦 Use `.env.example` files for sharing structure without exposing secrets.
- ☁️ For production, use a secret manager (AWS Secrets Manager, Vault, etc.).

---

# ✅ Usage Instructions

1. Copy the required section into your project.
2. Create a `.env` file in the root directory.
3. Paste the configuration.
4. Restart your server after changes.

---
