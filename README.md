# 🌾 AgriTrack

**A Comprehensive Agricultural Management System**

Developed by Batch 2022-2026 IT Students of City College of Calamba, Laguna, Philippines.  
In Partial Fulfillment of the Requirements for the Degree of B.Sc., in Information Technology.

In collaboration with the **City Agricultural Services Department, City Government of Calamba, Laguna, Philippines**.

---

## 👥 Research Team

- **Jerico Ryan M. Celestino** – Lead Developer
- **Rainer M. Culubong** – Researcher
- **John Christian G. Guevara** – Researcher
- **Jenelle G. Recalde** – Researcher

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [System Architecture](#️-system-architecture)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Modules](#-modules)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**AgriTrack** is a comprehensive web-based agricultural management system designed to streamline operations for the City Agricultural Services Department of Calamba, Laguna. The system provides multiple integrated modules to manage document tracking, high-value crops monitoring, agricultural machinery scheduling, and system administration.

### Key Objectives

- **Digitize** agricultural operations and document management
- **Streamline** farmer registration and crop data collection
- **Optimize** machinery utilization and scheduling
- **Enhance** transparency through QR code-based document tracking
- **Provide** real-time analytics and reporting capabilities

---

## ✨ Features

### 🔐 Authentication & Security
- Multi-factor authentication (2FA) with OTP
- Role-based access control (RBAC)
- JWT-based authentication with secure cookie management
- Password encryption using bcrypt
- Rate limiting and helmet security headers

### 📄 Document Tracking Module
- QR code generation and scanning for document lifecycle management
- Real-time document status tracking (Incoming, Pending, Outgoing)
- Document archival and disposal management
- Dashboard analytics for document flow
- Release and archive history tracking

### 🌱 High-Value Crops Module
- Farmer registration and data collection
- Crop production monitoring (Industrial & Other crops)
- Harvest tracking and reporting
- Production reports (SaMPR, PR)
- Farmer consent management with digital signatures
- Form scheduling with automated open/close functionality
- SMS notifications via Semaphore API

### 🚜 Machineries Module
- Agricultural machinery inventory management
- Equipment rental/ticketing system
- Schedule management and conflict prevention
- Machine unit status tracking (Available, In Use, Under Maintenance)
- Automated status updates via cron jobs
- Ticketing workflow (Add, Ongoing, Return, Completed)

### 👤 System Administration
- User management (Employees, Farmers, System Admins)
- System logs and audit trails
- Activity monitoring
- Role assignment and permissions

### 📧 Communications
- Email notifications via Mailtrap
- SMS notifications via Semaphore API
- Automated email templates for authentication and notifications

### ☁️ Cloud Integration
- Google Drive integration for file storage

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT, OTPlib (2FA)
- **File Storage:** Google Drive API
- **PDF Generation:** PDFKit
- **Excel Export:** ExcelJS
- **QR Code:** qrcode library
- **Task Scheduling:** node-cron
- **Email Service:** Mailtrap
- **SMS Service:** Semaphore (ClickSend)
- **Security:** Helmet, bcryptjs, express-rate-limit
- **Other:** CORS, cookie-parser, multer, uuid

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **UI Library:** Chakra UI
- **State Management:** Zustand
- **Routing:** React Router DOM v7
- **Data Fetching:** TanStack Query (React Query), Axios
- **Date Handling:** date-fns, moment, moment-timezone
- **QR Scanner:** @yudiel/react-qr-scanner
- **Icons:** Lucide React, React Icons
- **Forms:** React Datepicker, React Signature Canvas
- **Calendar:** React Big Calendar
- **Animations:** Framer Motion

### DevOps & Deployment
- **Hosting:** Render (Frontend & Backend)
- **Version Control:** Git
- **Environment Management:** dotenv

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   React Frontend │ (Vite + Chakra UI)
└────────┬────────┘
         │ HTTP/REST API
         │ JWT + Cookies
┌────────▼────────┐
│  Express Backend │ (Node.js)
└────────┬────────┘
         │
    ┌────┼────┬──────────┬──────────┐
    │    │    │          │          │
┌───▼┐ ┌─▼──┐ ┌▼────────┐ ┌▼───────┐ ┌▼──────┐
│ DB │ │ GD │ │Mailtrap │ │Semaphore│ │ Cron │
└────┘ └────┘ └─────────┘ └─────────┘ └───────┘
MongoDB  Drive   Email       SMS       Jobs
```

---

## 📁 Project Structure

```
AgriTrack/
├── backend/
│   ├── config/              # App initializers and configurations
│   ├── controller/          # Business logic controllers
│   │   ├── authentication/
│   │   ├── doc-track/
│   │   ├── global/
│   │   ├── high-value-crops/
│   │   ├── machineries/
│   │   ├── system admin/
│   │   └── userSettings/
│   ├── credentials/         # Google Drive credentials
│   ├── mailtrap/           # Email service
│   ├── middleware/         # Auth, rate limiting, role verification
│   ├── models/             # MongoDB schemas
│   │   ├── doc-track/
│   │   ├── global/
│   │   ├── high-value-crops/
│   │   ├── machineries/
│   │   └── system admin/
│   ├── routes/             # API routes
│   ├── semaphore/          # SMS service
│   ├── utils/              # Helper functions and utilities
│   ├── .env                # Environment variables
│   ├── package.json
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── Apps/           # Main app modules
│   │   ├── auth/           # Authentication pages & store
│   │   ├── components/     # Shared components
│   │   ├── doc-track/      # Document tracking module
│   │   ├── high-value-crops/ # HVC module
│   │   ├── machineries/    # Machineries module
│   │   ├── system admin/   # Admin module
│   │   ├── images/         # Static assets
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env                # Environment variables
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**
- **Git**

### Clone the Repository

```bash
git clone https://github.com/yourusername/agritrack.git
cd agritrack
```

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Client URL
CLIENT_URL=http://localhost:5173

# Google Drive API
GOOGLE_DRIVE_CREDENTIALS_PATH=./credentials/agritrack-driveintegration.json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Mailtrap
MAILTRAP_API_TOKEN=your_mailtrap_token
MAILTRAP_SENDER_EMAIL=your_sender_email

# Semaphore SMS
SEMAPHORE_API_KEY=your_semaphore_api_key
SEMAPHORE_SENDER_NAME=your_sender_name

# Encryption
ENCRYPTION_KEY=your_encryption_key_32_chars
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🏃 Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Build

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```
### Note that all enpoints are not shown here, just the major ones;

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-2fa` - Verify 2FA token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Document Track Endpoints
- `GET /api/doc-track/documents` - Get all documents
- `POST /api/doc-track/register` - Register new document
- `PUT /api/doc-track/update/:id` - Update document
- `GET /api/doc-track/qr/:code` - Get document by QR code

### High-Value Crops Endpoints
- `GET /api/hvc/farmers` - Get all farmers
- `POST /api/hvc/farmer-form` - Submit farmer form
- `GET /api/hvc/reports/sampr` - Get SaMPR report
- `GET /api/hvc/reports/production` - Get production report

### Machineries Endpoints
- `GET /api/machineries/inventory` - Get machinery inventory
- `POST /api/machineries/ticket` - Create ticket request
- `PUT /api/machineries/ticket/:id` - Update ticket status
- `GET /api/machineries/schedule` - Get machinery schedule

### System Admin Endpoints
- `GET /api/system-admin/users` - Get all users
- `POST /api/system-admin/register-employee` - Register employee
- `GET /api/system-admin/logs` - Get system logs

---

## 🎯 Modules

### 1. Document Tracking System
**Purpose:** Manage the complete lifecycle of government documents  
**Key Features:**
- QR code-based tracking
- Document status management
- Archival and disposal workflows
- Dashboard analytics

### 2. High-Value Crops Management
**Purpose:** Monitor and manage agricultural crop production  
**Key Features:**
- Farmer data collection
- Crop records (Industrial & Other)
- Harvest tracking
- Production reporting
- Form scheduling
- SMS notifications

### 3. Machineries Management
**Purpose:** Optimize agricultural machinery utilization  
**Key Features:**
- Equipment inventory
- Rental/ticketing system
- Schedule management
- Automated status updates
- Conflict prevention

### 4. System Administration
**Purpose:** Manage users and system operations  
**Key Features:**
- User management
- Role assignment
- System logs
- Activity monitoring

---

## 🤝 Contributing

For future developers who wants to improve and will be contributing, Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is developed as part of an academic requirement and is in collaboration with the City Agricultural Services Department, City Government of Calamba, Laguna, Philippines.

---

## 📞 Contact

For support, please contact:

**Lead Developer:** Jerico Ryan M. Celestino  
**Institution:** City College of Calamba  
**Email:** jericoryancelestino25@gmail.com

---

## 🙏 Acknowledgments

- **City College of Calamba** - For academic support and guidance
- **City Agricultural Services Department, Calamba** - For collaboration and domain expertise
- **Research Team** - For dedication and hard work
- **Faculty Advisers** - For mentorship and guidance

---

**© 2022-2026 Batch IT Students, City College of Calamba. All rights reserved.**
