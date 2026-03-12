# 🛡️ CyberShield Guard — Email Awareness Training Platform

A full-stack multi-role cybersecurity email awareness training platform built with **Next.js** (frontend) and **Node.js / Express / PostgreSQL** (backend).

---

## 🏗️ Architecture Overview

```
emailAwareness/
├── backend/                  # Node.js + Express API (Port 5000)
│   ├── database/
│   │   └── schema.sql        # PostgreSQL schema + migrations
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js   # PostgreSQL connection pool
│   │   │   └── initDb.js     # DB init + superadmin seeding
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # Login / signup / OTP
│   │   │   └── superadmin.controller.js  # Admin approvals / audit
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  # JWT auth + role guards
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # /api/auth/*
│   │   │   └── superadmin.routes.js  # /api/superadmin/*
│   │   ├── utils/
│   │   │   ├── auth.js    # JWT + bcrypt helpers
│   │   │   └── email.js   # Nodemailer templates
│   │   └── server.js      # Express app entry point
│   ├── .env               # Backend environment variables
│   └── package.json
│
├── src/                      # Next.js frontend (Port 3000)
│   ├── app/
│   │   ├── superadmin/
│   │   │   ├── signin/page.tsx        # Superadmin login
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           # Superadmin dashboard
│   │   │       ├── admins/page.tsx    # ✅ Admin approval panel
│   │   │       └── ... (other pages)
│   │   ├── admin/
│   │   │   ├── signin/page.tsx        # Admin login
│   │   │   ├── signup/page.tsx        # Admin registration
│   │   │   ├── otp/page.tsx           # Email OTP verification
│   │   │   └── dashboard/page.tsx     # Admin dashboard
│   │   └── user/
│   │       ├── signin/page.tsx        # User login
│   │       ├── signup/page.tsx        # User registration
│   │       ├── otp/page.tsx           # Email OTP verification
│   │       └── dashboard/page.tsx     # User dashboard
│   ├── components/layout/Sidebar.tsx  # Superadmin sidebar nav
│   └── lib/redux/                     # State management
│
├── .env.local            # Frontend environment variables
└── README.md             # This file
```

---

## 👥 Roles & Access Flow

### 🔴 Superadmin
| Feature | Detail |
|---------|--------|
| **Created** | Pre-seeded in database — **no UI signup** |
| **Login** | `/superadmin/signin` → direct access to dashboard |
| **OTP** | Not required |
| **Email Alert** | 🔔 Every login sends an alert email to monitoring addresses |
| **Capabilities** | Approve/reject admin accounts, view all users, login audit log |

**Credentials (pre-seeded):**
```
Email:    superadmin@cybershieldguard.com
Password: SuperAdmin@123
```

---

### 🟡 Admin
| Feature | Detail |
|---------|--------|
| **Created** | Self-registration via `/admin/signup` |
| **Verification** | Email OTP verification required |
| **Approval** | **Must be approved by superadmin** before login works |
| **Login** | `/admin/signin` → direct to dashboard (after approval) |
| **Email** | Gets notified when approved or rejected |

**Flow:**
```
Signup → Email OTP Verify → Pending Approval → Superadmin Approves → Login OK
```

---

### 🟢 User
| Feature | Detail |
|---------|--------|
| **Created** | Self-registration via `/user/signup` |
| **Verification** | Email OTP verification required |
| **Login** | `/user/signin` → direct to dashboard (immediately after OTP verify) |
| **Capabilities** | Training modules, quizzes, security score |

**Flow:**
```
Signup → Email OTP Verify → Automatically Logged In → Dashboard
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gmail account (for email sending)

### 1. Database Setup

```powershell
# Option A: Use the automated setup script
.\setup-database.ps1

# Option B: Manual
psql -U postgres -c "CREATE DATABASE emailawareness;"
```

### 2. Backend Setup

```bash
cd backend
npm install
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your values, then:
npm run dev
```

The server will:
1. Connect to PostgreSQL
2. Run the schema (migrate existing tables safely)
3. Seed/sync the superadmin account
4. Start on port 5000

### 3. Frontend Setup

```bash
# In the root directory
npm install
npm run dev
```

Frontend starts on **http://localhost:3000**

---

## ⚙️ Environment Variables

### `backend/.env`
```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/emailawareness

# JWT Secrets (use strong random values in production)
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Email (Gmail with App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

### `.env.local` (frontend root)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/superadmin/signin` | Superadmin | Login (sends alert email) |
| `POST` | `/auth/admin/signup` | Admin | Register + sends OTP |
| `POST` | `/auth/user/signup` | User | Register + sends OTP |
| `POST` | `/auth/signin` | Admin/User | Login (checks approval for admin) |
| `POST` | `/auth/verify-otp` | All | Verify email OTP |
| `POST` | `/auth/resend-otp` | All | Resend verification OTP |
| `POST` | `/auth/forgot-password` | All | Send password reset OTP |
| `POST` | `/auth/reset-password` | All | Reset password with OTP |
| `POST` | `/auth/logout` | Authenticated | Clear session |
| `POST` | `/auth/refresh-token` | Authenticated | Rotate access token |
| `GET` | `/auth/profile` | Authenticated | Get own profile |
| `PUT` | `/auth/profile/update` | Authenticated | Update own profile |
| `GET` | `/auth/me` | Authenticated | Get current user info |

### Superadmin — `/api/superadmin` *(requires superadmin role)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/superadmin/admins/pending` | List pending admin requests |
| `GET` | `/superadmin/admins` | List all admins (any status) |
| `POST` | `/superadmin/admins/:id/approve` | Approve an admin |
| `POST` | `/superadmin/admins/:id/reject` | Reject an admin |
| `GET` | `/superadmin/users` | List all users |
| `GET` | `/superadmin/audit` | View login audit log |

---

## 📧 Email Notifications

| Trigger | Recipients | Description |
|---------|-----------|-------------|
| Superadmin login | `utsavvachhani.it22@scet.ac.in`, `uvachhani03@gmail.com` | Login alert with time + IP |
| Admin registers | Same monitoring emails | New admin awaiting approval |
| Admin approved | Admin's email | Account activated |
| Admin rejected | Admin's email | Application declined |
| Admin/User signup | User's own email | 6-digit OTP, valid 10 mins |
| Password reset | User's own email | 6-digit OTP, valid 10 mins |

---

## 🔐 Security Features

- **JWT Access Tokens** — 15-minute lifespan stored in httpOnly cookie
- **JWT Refresh Tokens** — 7-day lifespan, stored in DB + httpOnly cookie
- **bcrypt Password Hashing** — 10 salt rounds
- **OTP Expiry** — 10 minutes, single-use
- **Rate Limiting** — 200 requests / 15 minutes per IP
- **Role Guards** — `requireRole()` middleware blocks unauthorized access
- **Approval Guard** — `requireApproved()` blocks pending/rejected admins
- **Login Audit Trail** — All superadmin logins recorded with IP + user-agent
- **CORS** — Locked to `FRONTEND_URL` only

---

## 🛠️ Tech Stack

### Backend
| Package | Use |
|---------|-----|
| `express` | HTTP server & routing |
| `pg` | PostgreSQL client |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT access & refresh tokens |
| `nodemailer` | Email transporter |
| `cookie-parser` | httpOnly cookie handling |
| `helmet` | Security headers |
| `morgan` | Request logging |
| `express-rate-limit` | Rate limiting |
| `dotenv` | Environment variables |

### Frontend
| Package | Use |
|---------|-----|
| `next` 15 | React framework + App Router |
| `@reduxjs/toolkit` | State management |
| `sonner` | Toast notifications |
| `lucide-react` | Icons |
| `tailwindcss` | Utility-first CSS |

---

## 🗺️ Frontend Routes

| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Landing page |
| `/superadmin/signin` | Public | Superadmin login |
| `/superadmin/dashboard` | 🔴 Superadmin | Main dashboard |
| `/superadmin/dashboard/admins` | 🔴 Superadmin | Admin approval panel |
| `/admin/signup` | Public | Admin registration |
| `/admin/otp` | Public | Admin email verification |
| `/admin/signin` | Public | Admin login |
| `/admin/dashboard` | 🟡 Admin | Admin dashboard |
| `/user/signup` | Public | User registration |
| `/user/otp` | Public | User email verification |
| `/user/signin` | Public | User login |
| `/user/dashboard` | 🟢 User | Training dashboard |

---

## 🐛 Troubleshooting

### `column "status" does not exist`
The database was created before the new schema. The schema now runs `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` migrations automatically. Simply restart the backend server.

### Email not sending
1. Ensure `EMAIL_USER` and `EMAIL_PASS` are set in `backend/.env`
2. Use a **Gmail App Password** (not your regular password): [Create App Password](https://myaccount.google.com/apppasswords)
3. Enable 2-Factor Authentication on the Gmail account first

### Cannot connect to database
1. Ensure PostgreSQL is running: `pg_ctl status` or check Services
2. Verify `DATABASE_URL` in `backend/.env` has correct host, port, user, password, and database name
3. Check the database exists: `psql -U postgres -l`

---

## 📜 License

MIT — Built for cybersecurity education purposes.
