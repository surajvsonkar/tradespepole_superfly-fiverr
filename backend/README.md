# 24/7 Tradespeople Backend API

Complete backend API for the 24/7 Tradespeople platform built with Express.js, PostgreSQL, and Prisma.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/tradespeople_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

3. **Set up the database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev:watch

# Or standard development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register a new user
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "type": "homeowner",  // or "tradesperson"
  "location": "London, UK",
  "trades": ["Plumbing", "Heating"],  // Only for tradesperson
  "workingArea": {
    "centerLocation": "London",
    "radius": 50,
    "coordinates": { "lat": 51.5074, "lng": -0.1278 }
  }
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get current user profile
```http
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "type": "homeowner",
    ...
  }
}
```

---

## 👤 User Endpoints

### Get user by ID (Public profile)
```http
GET /api/users/:id
```

### Get all tradespeople (with filters)
```http
GET /api/users/tradespeople?trade=Plumbing&location=London&verified=true&minRating=4.0&limit=20&offset=0
```

**Query Parameters:**
- `trade` - Filter by trade
- `location` - Filter by location (partial match)
- `verified` - Filter verified tradespeople (true/false)
- `minRating` - Minimum rating (0-5)
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset (default: 0)

### Update profile
```http
PUT /api/users/profile
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg",
  "location": "Manchester, UK",
  "trades": ["Plumbing", "Heating", "Gas"],
  "workingArea": { ... }
}
```

### Update membership
```http
PUT /api/users/membership
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "membershipType": "premium"  // none, basic, premium, unlimited_5_year
}
```

### Update credits
```http
PUT /api/users/credits
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 50.00,
  "operation": "add"  // or "subtract"
}
```

---

## 💼 Job Lead Endpoints

### Create a job lead (Homeowner only)
```http
POST /api/jobs
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Kitchen Renovation",
  "description": "Need a complete kitchen renovation including plumbing and electrical work",
  "category": "Plumbing",
  "location": "London, UK",
  "budget": "£5000-£10000",
  "urgency": "Medium",  // Low, Medium, High
  "contactDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+44 1234 567890"
  },
  "maxPurchases": 6,
  "price": 9.99
}
```

### Get all job leads (with filters)
```http
GET /api/jobs?category=Plumbing&location=London&urgency=High&isActive=true&limit=20&offset=0
```

### Get job lead by ID
```http
GET /api/jobs/:id
```

### Get my posted jobs (Homeowner only)
```http
GET /api/jobs/my/jobs
```
**Headers:** `Authorization: Bearer <token>`

### Purchase a job lead (Tradesperson only)
```http
POST /api/jobs/:id/purchase
```
**Headers:** `Authorization: Bearer <token>`

### Express interest in a job (Tradesperson only)
```http
POST /api/jobs/:id/interest
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "I'm interested in this job and have 10 years of experience",
  "price": 7500.00
}
```

### Update interest status (Homeowner only)
```http
PUT /api/jobs/:jobId/interests/:interestId/status
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "accepted"  // or "rejected"
}
```

### Update job lead (Homeowner only)
```http
PUT /api/jobs/:id
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "isActive": false
}
```

### Delete job lead (Homeowner only)
```http
DELETE /api/jobs/:id
```
**Headers:** `Authorization: Bearer <token>`

---

## 💬 Quote Request Endpoints

### Create a quote request (Homeowner only)
```http
POST /api/quotes
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "projectTitle": "Bathroom Renovation",
  "projectDescription": "Complete bathroom renovation with new fixtures",
  "category": "Plumbing",
  "location": "London, UK",
  "budget": "£3000-£5000",
  "urgency": "Medium",
  "contactDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+44 1234 567890"
  },
  "maxResponses": 5
}
```

### Get all quote requests (with filters)
```http
GET /api/quotes?category=Plumbing&location=London&urgency=High&limit=20&offset=0
```

### Get quote request by ID
```http
GET /api/quotes/:id
```

### Get my quote requests (Homeowner only)
```http
GET /api/quotes/my/requests
```
**Headers:** `Authorization: Bearer <token>`

### Submit a quote response (Tradesperson only)
```http
POST /api/quotes/:id/respond
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quotedPrice": 4500.00,
  "description": "I can complete this project with high-quality materials",
  "timeline": "2 weeks",
  "paidAmount": 10.00,
  "membershipDiscount": 2.00
}
```

### Update quote response status (Homeowner only)
```http
PUT /api/quotes/:quoteId/responses/:responseId/status
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "accepted"  // or "declined"
}
```

### Delete quote request (Homeowner only)
```http
DELETE /api/quotes/:id
```
**Headers:** `Authorization: Bearer <token>`

---

## ⭐ Review Endpoints

### Create a review
```http
POST /api/reviews
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "jobId": "uuid",
  "tradespersonId": "uuid",
  "rating": 5,
  "comment": "Excellent work, very professional!"
}
```

### Get reviews for a user
```http
GET /api/reviews/user/:id?limit=20&offset=0
```

### Get review by ID
```http
GET /api/reviews/:id
```

---

## 📊 Database Schema

### Users Table
- Stores both homeowners and tradespeople
- Includes profile, verification, credits, and membership data

### Job Leads Table
- Job postings from homeowners
- Tracks purchases and interests from tradespeople

### Quote Requests Table
- Quote requests from homeowners
- Tracks responses from tradespeople

### Reviews Table
- Reviews for tradespeople from homeowners
- Automatically updates tradesperson ratings

### Messages & Conversations Tables
- Direct messaging between users
- Linked to job leads

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control**: Separate permissions for homeowners and tradespeople
- **Input Validation**: Request validation on all endpoints
- **CORS Protection**: Configurable CORS settings

---

## 🛠️ Development

### Database Management

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Push schema changes without migration
npm run prisma:push

# Open Prisma Studio (Database GUI)
npm run prisma:studio
```

### Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── configs/
│   │   └── database.ts        # Prisma client
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── jobController.ts
│   │   ├── quoteController.ts
│   │   └── reviewController.ts
│   ├── middlewares/
│   │   └── authMiddleware.ts  # JWT & role-based auth
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── jobRoutes.ts
│   │   ├── quoteRoutes.ts
│   │   └── reviewRoutes.ts
│   └── app.ts                 # Main Express app
├── .env                       # Environment variables
├── .env.example              # Environment template
├── package.json
└── tsconfig.json
```

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | 7d |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

---

## 🚨 Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 📄 License

ISC

---

## 🤝 Support

For issues or questions, please contact the development team.
