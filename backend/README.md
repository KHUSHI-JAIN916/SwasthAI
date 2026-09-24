# SWASTHAI Backend

## Clinical Management Platform — Express.js + MongoDB + JWT

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy .env.example and edit)
cp .env.example .env
# Edit .env: set JWT_SECRET to a secure random string

# 3. Ensure MongoDB is running locally
# Windows: net start MongoDB | macOS: brew services start mongodb-community

# 4. Seed demo data
npm run seed

# 5. Start the backend
npm start

# Server runs on: http://localhost:5000
# API Base URL:   http://localhost:5000/api
```

## Demo Credentials (after seeding)

| Role        | ID / Email           | Password |
|-------------|----------------------|----------|
| Doctor      | doctor@ayush.com     | 123456   |
| Patient     | AYU-2026-DEMO        | 123456   |
| Patient     | AYU-2026-001         | patient1 |
| Patient     | AYU-2026-002         | patient2 |

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register doctor or patient |
| `POST` | `/api/auth/login` | Login (doctor or patient) |
| `GET`  | `/api/auth/me` | Get current user (JWT required) |
| `POST` | `/api/auth/logout` | Logout |

### Patients
| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/patients` | List all patients |
| `POST` | `/api/patients` | Create patient |
| `GET`  | `/api/patients/:id` | Get patient by ID |
| `PUT`  | `/api/patients/:id` | Update patient |
| `GET`  | `/api/patients/:id/dossier` | Full clinical dossier |
| `POST` | `/api/patients/:id/diseases` | Add reported disease |
| `POST` | `/api/patients/:id/past-records` | Add past doctor record |

### Health Readings
| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/health-readings?patientId=X` | Get readings (paginated) |
| `POST` | `/api/health-readings` | Save reading (validated) |
| `GET`  | `/api/health-readings/summary/:id` | Latest vitals + evaluation |
| `GET`  | `/api/health-readings/trends/:id` | Trend data for charts |
| `DELETE` | `/api/health-readings/:id` | Delete reading (auth required) |

### Prescriptions
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/prescriptions` | Issue prescription |
| `GET`  | `/api/prescriptions/:patientId` | Get patient prescriptions |

### AI
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/analyze` | Analyze case (red flags, allergy conflicts) |
| `POST` | `/api/ai/summary` | Generate SOAP consultation summary |
| `POST` | `/api/ai/assistant` | AI clinical assistant chat |
| `POST` | `/api/ai/notes` | Generate consultation notes from transcript |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/analytics/dashboard` | Doctor dashboard metrics |
| `GET`  | `/api/analytics/overview` | Prakriti, complaints distribution |
| `GET`  | `/api/analytics/insights` | AI-generated clinical insights |

### Other
| `GET`  | `/api/health` | Server health check |
| `POST` | `/api/reports/upload` | Upload diagnostic report (multipart) |
| `GET`  | `/api/reports/:patientId` | Get patient reports |

## Architecture

```
backend/
├── src/
│   ├── app.js              # Express app (middleware, routes, static serving)
│   ├── server.js           # Entry point (dotenv, DB, listen)
│   ├── config/
│   │   └── db.js           # MongoDB connection with graceful fallback
│   ├── models/             # 10 Mongoose schemas (User, Patient, HealthReading, ...)
│   ├── controllers/        # Business logic (10 controllers)
│   ├── routes/             # Express routers (10 route files)
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verify, role guards
│   │   ├── error.middleware.js   # Centralized error handler
│   │   └── upload.middleware.js  # Multer file upload config
│   ├── services/
│   │   └── ai.service.js        # Gemini API with rule-based fallback
│   ├── validators/
│   │   └── health.validator.js  # Clinical range validation
│   └── seed.js             # Demo data seeder
├── tests/
│   └── verify-api.js       # Smoke test suite (npm test)
├── uploads/                # Report file storage (gitignored)
├── .env                    # Secrets (gitignored)
├── .env.example            # Template
└── .gitignore
```

## Security

- **JWT** authentication for all sensitive operations
- **bcryptjs** password hashing (10 rounds)
- **Helmet** security headers
- **Rate limiting** (1000 req/15min per IP)
- **Input validation** on all health reading endpoints
- Passwords never returned in API responses
- All audit trail logged to `AuditLog` collection

## Testing

```bash
# Run API smoke tests (backend must be running)
npm test

# Or with custom base URL:
node tests/verify-api.js http://localhost:5000
```

## AI Integration

The app works fully without an AI key using rule-based clinical logic. To enable Gemini AI:

1. Get key from [Google AI Studio](https://aistudio.google.com)
2. Add to `.env`: `AI_API_KEY=your_key_here`
3. Restart server

> ⚠️ **Important**: All AI output is clinical decision **support** only. It is NOT an autonomous medical diagnosis. Practitioner review is always required.
