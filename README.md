# 🌿 SWASTHAI (स्वास्थAI)
### AI-Powered AYUSH Clinical & Patient Health Management Platform
*Production-Ready Full-Stack Architecture for Hackathon Demo & Real-World Deployments*

---

## 📌 Executive Summary
**SWASTHAI** bridges traditional AYUSH clinical practices (Ayurveda, Yoga & Naturopathy, Unani, Siddha, Homeopathy) with modern digital health workflows. It delivers real-time vital health monitoring, automated clinical screening indicators (vital alerts), longitudinal patient records, AI-assisted SOAP consultation drafting, and tamper-evident audit logging—backed by a secure **Node.js/Express + MongoDB + JWT** full-stack engine.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │      Frontend Client (Vanilla JS)       │
                                  │  • Doctor Login / Patient Login         │
                                  │  • Practitioner Review & Dashboard      │
                                  │  • Patient Portal & Health Monitoring   │
                                  │  • Consultation Notes & Case Taking     │
                                  └────────────────────┬────────────────────┘
                                                       │
                                        HTTP/REST + JWT Bearer Token
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │     SWASTHAI Express.js API Gateway     │
                                  │  • Port 5000 (Helmet, Rate Limiter)     │
                                  │  • Global Error Handler & Audit Logger  │
                                  └──────┬─────────────┬─────────────┬──────┘
                                         │             │             │
                    ┌────────────────────┘             │             └────────────────────┐
                    ▼                                  ▼                                  ▼
      ┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
      │     Authentication        │      │    Clinical Operations    │      │    AI & Intelligence      │
      │  • /api/auth/login        │      │  • /api/patients          │      │  • /api/ai/analyze        │
      │  • /api/auth/register     │      │  • /api/health-readings   │      │  • /api/ai/assistant      │
      │  • /api/auth/me           │      │  • /api/prescriptions     │      │  • /api/ai/summary        │
      │  • Role-Based Access      │      │  • /api/analytics         │      │  • Google Gemini + Fallback│
      └─────────────┬─────────────┘      └─────────────┬─────────────┘      └───────────────────────────┘
                    │                                  │
                    └─────────────────┬────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   MongoDB Database Layer  │
                        │  • Users & Practitioners  │
                        │  • Patients & Vitals      │
                        │  • Consultations & Rx     │
                        │  • Timeline & Audit Logs  │
                        └───────────────────────────┘
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or v20 LTS recommended)
- **MongoDB** (Local `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Backend Installation & Setup
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the `backend/` folder:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/swasthai
JWT_SECRET=swasthai_clinical_secure_jwt_secret_key_2026_production
JWT_EXPIRES_IN=7d
CLIENT_URL=*
AI_API_KEY=
```

### 4. Seed Demo Data
Populates the database with realistic AYUSH clinical demo data:
```bash
npm run seed
```

### 5. Run Verification Test Suite
```bash
npm test
```

### 6. Start the Backend Server
```bash
npm start
```
*API Base URL:* `http://localhost:5000/api`  
*Frontend Static Host:* `http://localhost:5000/index.html`

---

## 🔑 Demo Credentials (Seeded)

| Role | Username / Identifier | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@ayush.com` | `123456` or `Admin@123` | System audit, user oversight |
| **Lead Practitioner** | `doctor@ayush.com` | `123456` or `Doctor@123` | Full clinical review, consultations, Rx |
| **Practitioner 2** | `dr.verma@ayush.com` | `123456` or `Doctor@123` | Kaya Chikitsa & chronic care |
| **Demo Patient** | `AYU-2026-DEMO` | `123456` or `Patient@123` | Patient portal, vital entry, history |
| **Patient 2** | `AYU-2026-001` | `123456` or `Patient@123` | Patient portal |

---

## 🩺 Clinical Health Monitoring & Alert Engine

The health monitoring module records patient vitals and runs an automatic clinical screening indicator engine:

- **Blood Pressure:** Hypertensive Crisis (`>=180` or `>=120`), Stage 2 (`>=160` or `>=100`), Stage 1 (`>=140` or `>=90`), Hypotension (`<90` or `<60`)
- **Blood Sugar:** Critical Hyperglycemia (`>300`), High (`>200`), Hypoglycemia Alert (`<60`), Low (`<70`), Elevated (`>140`)
- **Oxygen Saturation (SpO2):** Critical Desaturation (`<88%`), Low Saturation (`<92%`), Suboptimal (`<95%`)
- **Heart Rate:** Significant Tachycardia (`>130`), Tachycardia (`>100`), Bradycardia (`<60`), Severe Bradycardia (`<45`)
- **Body Temperature:** High Fever (`>=103°F`), Fever (`>=100.4°F`), Hypothermia (`<96°F`)
- **Weight & BMI Trends**

> **Clinical Disclaimer:** All vital alerts are screening indicators only and do not constitute an autonomous medical diagnosis. Licensed practitioner review is always required.

---

## 🛡️ Security & Privacy Compliance

- **Role-Based Access Control (RBAC):** Admin, Practitioner, and Patient roles enforced via JWT authentication middleware.
- **Password Security:** Salted hashes using `bcryptjs` with 10 rounds. Passwords are never returned in queries or responses.
- **Clinical Audit Trail:** All registrations, logins, vital submissions, prescription issuances, and patient profile edits are recorded in `AuditLog`.
- **File Upload Security:** Multer upload filter limits file types to PDF, JPG, PNG, and WebP, capped at 10 MB per file.
- **Resilience & Graceful Offline Fallback:** When the backend is offline, the client seamlessly switches to demo cached mode without crashing.

---

## 📁 Project Directory Structure

```
SwasthAI/
├── index.html                   # Main Landing Page
├── doctor-login.html            # Practitioner Authentication
├── patient-login.html           # Patient Portal Authentication
├── dashboard.html               # Clinical Operations Dashboard
├── practitioner-review.html     # Holistic Clinical Review & Vitals
├── patient-portal.html          # Patient Dashboard & Self-Monitoring
├── patients.html                # Patient Directory
├── add-patient.html             # New Patient Registration
├── consultation-notes.html      # SOAP Notes & Clinical Scribe
├── case-taking.html             # Eight-fold AYUSH Examination (Ashtavidha)
├── analytics.html               # Cohort Statistics & Health Trends
├── ai-assistant.html            # Clinical Decision Support Assistant
├── js/
│   ├── services/
│   │   ├── api-service.js       # Centralized REST API client (with offline fallback)
│   │   ├── prescription-service.js # Prescription dispatch & persistence
│   │   └── speech-service.js    # Voice-to-text clinical transcription
│   └── ...                      # UI controllers (dashboard, review, portal)
└── backend/
    ├── src/
    │   ├── app.js               # Express application configuration
    │   ├── server.js            # Server entry point
    │   ├── config/db.js         # Mongoose database connector
    │   ├── controllers/         # 10 Business logic controllers
    │   ├── models/              # 10 Mongoose models (User, Patient, HealthReading...)
    │   ├── routes/              # Express REST route definitions
    │   ├── middleware/          # JWT auth, error handlers, upload guards
    │   ├── services/ai.service.js # Clinical AI intelligence engine
    │   ├── validators/          # Input schema validators
    │   └── seed.js              # Comprehensive demo database seeder
    ├── tests/
    │   └── verify-api.js        # Automated API & logic test suite
    ├── uploads/                 # Secure document storage
    ├── .env.example             # Environment template
    └── package.json             # Backend dependencies & npm scripts
```

---

## 📄 License & Intellectual Property
Developed for AYUSH Clinical Innovation & Digital Health Hackathon 2026.
