# 🛡️ CyberShield Guard — Enterprise Awareness Suite

A high-fidelity, industrial-grade cybersecurity email awareness & compliance platform. Designed for multi-tenant entity management, this suite enables security leaders to deploy training, track risk scores, and manage enterprise certifications across global departments.

---

## ⚡ Core Concept: Resilience at Scale
**CyberShield Guard** isn't just a training portal; it's a security lifecycle management tool. 
- **Superadmins** orchestrate the entire platform, approving business entities and auditing system integrity.
- **Admins** manage their own company portfolio, assigning specialized curricula to their workforces.
- **Employees/Users** engage in interactive security modules, earn certifications, and contribute to their organization's overall **Awareness Readiness Score**.

---

## 🏗️ Project Architecture & File Structure

```text
emailAwareness/
├── backend/                           # API Enterprise Core (Port 5000)
│   ├── src/
│   │   ├── controllers/               # Business Logic (Companies, Employees, Exams)
│   │   ├── routes/                    # API Routing (Admin Registry, Auth, Payments)
│   │   ├── utils/                     # Services (Nodemailer, Cloudinary, Certificate PDF)
│   │   ├── middleware/                # Security Gates (JWT, RBAC - Role Based Access)
│   │   └── server.js                  # Entrypoint
│   ├── database/                      # SQL Schema & Migrations
│   ├── .env.example                   # Template for backend secrets
│   └── package.json
│
├── src/                               # Frontend Command Center (Port 3000)
│   ├── app/                           # Next.js 15 App Router
│   │   ├── admin/                     # Admin Portfolio Management
│   │   │   └── dashboard/[id]/        # Entity Drill-down (Bills, Employees, Courses)
│   │   ├── superadmin/                # Global Command Center
│   │   └── user/                      # Employee Learning Portal
│   ├── components/                    # Modular UI components (Sidebar, Charts, Receipt)
│   ├── lib/redux/                     # Global State Synchronization
│   └── public/                        # Static Assets (Logos, Icons)
│
├── .env.local                         # Frontend Environment Config
├── setup-database.ps1                 # Automated PostgreSQL Provisioning
└── package.json
```

---

## 🛰️ Quick-Start Deployment

### 1. Provision the Database
Run the provided script to initialize the PostgreSQL schema and seed the initial Superadmin credentials.
```powershell
.\setup-database.ps1
```

### 2. Configure Environment Secrets
Create a `.env` file in the `backend/` directory and a `.env.local` in the root.

#### **Backend Secrets (`backend/.env`)**
```env
# Database Connectivity
DATABASE_URL=postgresql://user:password@localhost:5432/emailawareness

# Cryptography & Security
JWT_ACCESS_SECRET=your_high_entropy_secret
JWT_REFRESH_SECRET=another_high_entropy_secret

# Managed Communication (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Media Operations (Cloudinary)
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

# Global Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
```

#### **Frontend Config (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Launch the Stack
```bash
# Start Backend
cd backend && npm install && npm run dev

# Start Frontend (in a new terminal)
npm install && npm run dev
```

---

## 💎 Key Capabilities

### 🏢 Multi-Tenant Entity Hub
Admins can manage multiple companies under a single account. Each company operates in its own sandbox with independent employee lists and course progress logs.

### 🧾 Professional Billing & PDF Receipts
Full-fidelity transaction management for plan upgrades.
- **Dynamic Invoicing**: Generates premium, brand-consistent receipts with transaction watermarks.
- **PDF Engine**: Client-side PDF generation using `jspdf` and `html2canvas`.
- **Direct Mailing**: Automatic receipt delivery to corporate email addresses upon checkout.

### 🎓 Curated Learning Curricula
- **Tiered Plans**: Choose from Basic, Standard, or Premium tiers based on entity size.
- **Mastery Gating**: Employees must meet strict competency thresholds to unlock official credentials.
- **Automated Certification**: High-fidelity PDF certificates automatically dispatched upon course completion.

### 🔒 Enterprise Governance
- **Role-Based Guards**: Strict redirection logic for Superadmins, Admins, and Users.
- **Approval Workflow**: All admin registrations require Superadmin verification before system access.
- **Audit Logging**: Every sensitive action is logged with IP, Date, and User-Agent metadata.

---

## 🛠️ Technology Stack

| Domain | Technology |
|--------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL + SQL Serialization |
| **State** | Redux Toolkit (RTK) |
| **Auth** | Dual-Token JWT (Access/Refresh) |
| **Email** | Nodemailer (Gmail Cluster) |
| **Assets** | Cloudinary (Media Ops) |

---

## 📜 Role Reference & Credentials

### 🔴 Superadmin (Global Oversight)
- **Pre-seeded**: Used for entity verification & system audits.
- **Login**: `superadmin@cybershieldguard.com` / `SuperAdmin@123`

### 🟡 Admin (Entity Management)
- **Workflow**: Signup -> OTP -> Superadmin Approval -> Full Access.
- **Capabilities**: Company creation, billing, progress tracking.

### 🟢 User (Employee/Learner)
- **Workflow**: Signup -> OTP -> Access.
- **Capabilities**: Training attendance, quiz participation, certificate collection.

---

## 📜 License
MIT — Engineered for enterprise cybersecurity educational environments.
