# BitNet Setup Guide

## Sprint 1.1 Complete ✅

The basic authentication system has been implemented successfully! Here's what's ready:

### ✅ Backend Features Implemented:
- **User Registration API** (`POST /api/auth/register`)
- **User Login API** (`POST /api/auth/login`)
- **JWT Authentication** with 7-day token expiration
- **Authentication Middleware** for protected routes
- **User Profile API** (`GET /api/auth/profile`)
- **PostgreSQL User Model** with bcrypt password hashing

### ✅ Mobile App Features Implemented:
- **Login Screen** with email/password validation
- **Registration Screen** with form validation
- **Home Screen** for authenticated users
- **Authentication Service** with AsyncStorage persistence
- **Navigation Structure** (Auth/App navigators)
- **Automatic Auth State Management**

## 🚀 Quick Start Instructions

### Prerequisites
1. **Node.js** (v16+)
2. **PostgreSQL** (v12+) - **REQUIRED** for authentication to work
3. **Expo CLI** (`npm install -g @expo/cli`)

### 1. Database Setup (CRITICAL)

**Install PostgreSQL:**
- Windows: Download from https://www.postgresql.org/download/
- Mac: `brew install postgresql`
- Ubuntu: `sudo apt install postgresql`

**Create Database:**
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database and user
CREATE DATABASE bitnet_db;
CREATE USER bitnet_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bitnet_db TO bitnet_user;
\q
```

**Update Backend Environment:**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials:
# DB_USER=bitnet_user
# DB_PASSWORD=your_password
```

**Initialize Database Schema:**
```bash
cd backend
npm run setup-db
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

### 3. Start Mobile App
```bash
cd mobile
npm start
# Scan QR code with Expo Go app
```



## 🧪 Testing the Authentication Flow

### Test Registration (API):
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Test Corp",
    "jobTitle": "Developer"
  }'
```

### Test Login (API):
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Mobile App Testing:
1. Open app in Expo Go
2. Register new account with valid email/password
3. Verify successful login and navigation to Home screen
4. Test logout functionality
5. Verify login persistence (close/reopen app)

## 📱 Mobile App Features

### Authentication Screens:
- **Login**: Email/password with validation
- **Register**: Full form with field validation
- **Home**: Welcome screen with user info

### Key Features:
- Form validation (email format, password length, required fields)
- Loading states during API calls
- Error handling with user-friendly alerts
- Automatic token storage and retrieval
- Navigation between auth and app states
- Logout functionality

## 🔧 API Endpoints Available

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/health` | GET | Health check | No |
| `/api/auth/register` | POST | User registration | No |
| `/api/auth/login` | POST | User login | No |
| `/api/auth/profile` | GET | Get user profile | Yes |

## 🔐 Security Features

- **JWT Tokens** with 7-day expiration
- **bcrypt Password Hashing** (10 rounds)
- **Input Validation** on both frontend and backend
- **CORS Protection** enabled
- **Helmet Security Headers**
- **Request Logging** with Morgan

## 🐛 Troubleshooting

**Database Connection Error:**
- Ensure PostgreSQL is running: `pg_ctl status`
- Check database credentials in `.env`
- Verify database and user exist

**Mobile App Won't Connect:**
- Ensure backend server is running on port 3000
- Check network connectivity
- Verify API_BASE_URL in authService.js

**Registration/Login Fails:**
- Check server logs for errors
- Verify database schema is initialized
- Test API endpoints directly with curl

## ✅ Sprint 1.1 Success Criteria Met:

1. ✅ **Users can register** - Full registration form with validation
2. ✅ **Users can login** - Secure login with JWT tokens
3. ✅ **Users stay authenticated** - Token persistence with AsyncStorage
4. ✅ **JWT authentication** - 7-day tokens with proper middleware
5. ✅ **Simple user model** - Email, password, basic info stored in PostgreSQL

## 🎯 Next Steps (Sprint 1.2):
- User profile editing
- Password reset functionality
- Enhanced error handling
- Loading states optimization
- Basic networking features