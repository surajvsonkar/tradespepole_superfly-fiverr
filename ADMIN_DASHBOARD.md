# Admin Dashboard Guide

## Admin Authentication

The admin dashboard is now protected by a dedicated authentication system separate from the main user authentication.

### Default Credentials
- **Email**: `3123surajssvjc@gmail.com`
- **Password**: `admin@123`

### Features
- **Dedicated Login Page**: Access via `/admin/login` or simply navigate to `/admin`
- **Forgot Password**: Request an OTP via email to reset password
- **Secure Access**: Admin routes are protected by JWT tokens specific to admins
- **Database Storage**: Admin details are stored in a dedicated `admins` table

## Setup Instructions

### 1. Environment Variables
Ensure the following variables are set in your backend `.env` file:
```
JWT_SECRET=your-secret-key
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```
*Note: SMTP settings are required for the "Forgot Password" functionality to work.*

### 2. Database Migration
The `admins` table has been added to the database. If you haven't run the migration yet:
```bash
cd backend
npx prisma migrate dev
```

### 3. Seeding Admin User
To create the initial admin user:
```bash
cd backend
npx ts-node src/prisma/seedAdmin.ts
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/forgot-password` - Request password reset OTP
- `POST /api/admin/reset-password` - Reset password using OTP

### Protected Resources
All other `/api/admin/*` endpoints require the `Authorization: Bearer <token>` header with a valid admin token.

## Frontend Routes

- `/admin/login` - Login page
- `/admin/dashboard` - Main dashboard (protected)
- `/admin` - Redirects to dashboard (or login if unauthenticated)

## Security Notes

- The admin token is stored in `localStorage` as `adminToken`.
- The admin session expires after 24 hours.
- OTPs for password reset are valid for 15 minutes.
