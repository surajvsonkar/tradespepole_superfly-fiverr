# Backend Setup Guide - Step by Step

This guide will walk you through setting up the backend from scratch.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- ✅ **npm** or **yarn** (comes with Node.js)
- ✅ **Git** (optional, for version control)

---

## Step 1: Install Dependencies

Navigate to the backend directory and install all required packages:

```bash
cd backend
npm install
```

This will install:

- Express.js (web framework)
- Prisma (ORM)
- PostgreSQL driver
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- cors (CORS middleware)
- dotenv (environment variables)
- TypeScript and type definitions

---

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL Installation

1. **Install PostgreSQL** on your machine
2. **Create a new database**:

```sql
CREATE DATABASE tradespeople_db;
```

3. **Create a user** (optional):

```sql
CREATE USER tradespeople_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tradespeople_db TO tradespeople_user;
```

### Option B: Use a Cloud Database

You can use services like:

- [Supabase](https://supabase.com/) (Free tier available)
- [Neon](https://neon.tech/) (Free tier available)
- [Railway](https://railway.app/)
- [Render](https://render.com/)

---

## Step 3: Configure Environment Variables

1. **Copy the example environment file**:

```bash
cp .env.example .env
```

2. **Edit the `.env` file** with your actual values:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/tradespeople_db"

# JWT Secret - Generate a strong random string
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# CORS - Update with your frontend URL
CORS_ORIGIN="http://localhost:5173"
```

**Important**:

- Replace `username` and `password` with your PostgreSQL credentials
- Generate a strong JWT secret (you can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

---

## Step 4: Set Up Prisma and Database Schema

### 4.1 Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your schema.

### 4.2 Create Database Tables

You have two options:

**Option A: Using Migrations (Recommended for production)**

```bash
npm run prisma:migrate
```

This will:

- Create migration files
- Apply migrations to your database
- Create all tables with proper relationships

**Option B: Push Schema Directly (Good for development)**

```bash
npm run prisma:push
```

This directly syncs your Prisma schema with the database without creating migration files.

### 4.3 Verify Database Setup

Open Prisma Studio to view your database:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit your data.

---

## Step 5: Build the TypeScript Code

Compile TypeScript to JavaScript:

```bash
npm run build
```

This creates a `dist` folder with compiled JavaScript files.

---

## Step 6: Start the Server

### Development Mode (with auto-reload)

```bash
npm run dev:watch
```

This uses `nodemon` to automatically restart the server when you make changes.

### Development Mode (standard)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

---

## Step 7: Test the API

### 7.1 Check if server is running

Open your browser or use curl:

```bash
curl http://localhost:3000
```

You should see:

```json
{
	"message": "24/7 Tradespeople API",
	"version": "1.0.0",
	"status": "running"
}
```

### 7.2 Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### 7.3 Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "type": "homeowner",
    "location": "London, UK"
  }'
```

You should receive a response with a user object and JWT token.

---

## Step 8: (Optional) Seed Sample Data

You can manually add sample data using Prisma Studio or create a seed script.

### Using Prisma Studio:

1. Run `npm run prisma:studio`
2. Navigate to the Users table
3. Add sample users, job leads, etc.

---

## Common Issues and Solutions

### Issue 1: Database Connection Error

**Error**: `Can't reach database server`

**Solution**:

- Check if PostgreSQL is running
- Verify your DATABASE_URL in `.env`
- Ensure the database exists
- Check firewall settings

### Issue 2: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:

- Change the PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000:

  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F

  # Mac/Linux
  lsof -ti:3000 | xargs kill -9
  ```

### Issue 3: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:

```bash
npm run prisma:generate
```

### Issue 4: Migration Errors

**Error**: Migration failed

**Solution**:

- Reset the database: `npx prisma migrate reset`
- Or push schema directly: `npm run prisma:push`

---

## Development Workflow

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Generate Prisma Client: `npm run prisma:generate`
3. Create migration: `npm run prisma:migrate`
4. Restart server

### Adding New Routes

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Import and use route in `src/app.ts`
4. Restart server

---

## Next Steps

1. ✅ **Test all endpoints** using Postman or Thunder Client
2. ✅ **Connect your frontend** to the backend API
3. ✅ **Set up proper error logging** (e.g., Winston, Morgan)
4. ✅ **Add input validation** (e.g., Joi, Zod)
5. ✅ **Implement rate limiting** (e.g., express-rate-limit)
6. ✅ **Set up testing** (e.g., Jest, Supertest)
7. ✅ **Deploy to production** (e.g., Heroku, Railway, Render)

---

## Useful Commands Reference

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start dev server
npm run dev:watch        # Start with auto-reload

# Build
npm run build            # Compile TypeScript

# Production
npm start                # Start production server

# Prisma
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:push      # Push schema to DB
npm run prisma:studio    # Open Prisma Studio

# Database
npx prisma migrate reset # Reset database
npx prisma db seed       # Seed database
```

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── configs/
│   │   └── database.ts        # Prisma client instance
│   ├── controllers/
│   │   ├── authController.ts  # Authentication logic
│   │   ├── userController.ts  # User management
│   │   ├── jobController.ts   # Job leads
│   │   ├── quoteController.ts # Quote requests
│   │   └── reviewController.ts # Reviews
│   ├── middlewares/
│   │   └── authMiddleware.ts  # JWT & role-based auth
│   ├── routes/
│   │   ├── authRoutes.ts      # Auth endpoints
│   │   ├── userRoutes.ts      # User endpoints
│   │   ├── jobRoutes.ts       # Job endpoints
│   │   ├── quoteRoutes.ts     # Quote endpoints
│   │   └── reviewRoutes.ts    # Review endpoints
│   └── app.ts                 # Main Express application
├── dist/                      # Compiled JavaScript (generated)
├── node_modules/              # Dependencies (generated)
├── .env                       # Environment variables (not in git)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Main documentation
├── API_ROUTES.md             # API routes reference
└── SETUP_GUIDE.md            # This file
```

---

## Support

If you encounter any issues:

1. Check the error logs in the console
2. Verify your environment variables
3. Ensure PostgreSQL is running
4. Check the README.md for detailed API documentation
5. Review the API_ROUTES.md for endpoint details

---

## Security Checklist for Production

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set up logging and monitoring
- [ ] Use connection pooling for database
- [ ] Implement proper error handling
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Set up CI/CD pipeline
- [ ] Configure database backups

---

**You're all set! 🚀**

Your backend API should now be running at `http://localhost:3000`
