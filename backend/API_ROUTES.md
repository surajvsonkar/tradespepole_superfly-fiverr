# API Routes Summary

## Complete list of all API endpoints for the 24/7 Tradespeople Backend

---

## Authentication Routes (`/api/auth`)

| Method | Endpoint             | Auth Required | Role | Description                                     |
| ------ | -------------------- | ------------- | ---- | ----------------------------------------------- |
| POST   | `/api/auth/register` | No            | -    | Register a new user (homeowner or tradesperson) |
| POST   | `/api/auth/login`    | No            | -    | Login and receive JWT token                     |
| GET    | `/api/auth/me`       | Yes           | Both | Get current user profile                        |

---

## User Routes (`/api/users`)

| Method | Endpoint                  | Auth Required | Role         | Description                                                              |
| ------ | ------------------------- | ------------- | ------------ | ------------------------------------------------------------------------ |
| GET    | `/api/users/tradespeople` | No            | -            | Get all tradespeople with filters (trade, location, verified, minRating) |
| GET    | `/api/users/:id`          | No            | -            | Get user by ID (public profile)                                          |
| PUT    | `/api/users/profile`      | Yes           | Both         | Update own profile (name, avatar, location, trades, workingArea)         |
| PUT    | `/api/users/membership`   | Yes           | Tradesperson | Update membership type                                                   |
| PUT    | `/api/users/credits`      | Yes           | Tradesperson | Add or subtract credits                                                  |

---

## Job Lead Routes (`/api/jobs`)

| Method | Endpoint                                        | Auth Required | Role         | Description                                                            |
| ------ | ----------------------------------------------- | ------------- | ------------ | ---------------------------------------------------------------------- |
| GET    | `/api/jobs`                                     | No            | -            | Get all job leads with filters (category, location, urgency, isActive) |
| GET    | `/api/jobs/:id`                                 | No            | -            | Get job lead by ID                                                     |
| POST   | `/api/jobs`                                     | Yes           | Homeowner    | Create a new job lead                                                  |
| GET    | `/api/jobs/my/jobs`                             | Yes           | Homeowner    | Get my posted jobs                                                     |
| PUT    | `/api/jobs/:id`                                 | Yes           | Homeowner    | Update job lead (only poster can update)                               |
| DELETE | `/api/jobs/:id`                                 | Yes           | Homeowner    | Delete job lead (only poster can delete)                               |
| POST   | `/api/jobs/:id/purchase`                        | Yes           | Tradesperson | Purchase a job lead (costs credits)                                    |
| POST   | `/api/jobs/:id/interest`                        | Yes           | Tradesperson | Express interest in a job                                              |
| PUT    | `/api/jobs/:jobId/interests/:interestId/status` | Yes           | Homeowner    | Accept or reject interest (only poster)                                |

---

## Quote Request Routes (`/api/quotes`)

| Method | Endpoint                                            | Auth Required | Role         | Description                                                       |
| ------ | --------------------------------------------------- | ------------- | ------------ | ----------------------------------------------------------------- |
| GET    | `/api/quotes`                                       | No            | -            | Get all quote requests with filters (category, location, urgency) |
| GET    | `/api/quotes/:id`                                   | No            | -            | Get quote request by ID                                           |
| POST   | `/api/quotes`                                       | Yes           | Homeowner    | Create a new quote request                                        |
| GET    | `/api/quotes/my/requests`                           | Yes           | Homeowner    | Get my quote requests                                             |
| DELETE | `/api/quotes/:id`                                   | Yes           | Homeowner    | Delete quote request (only creator)                               |
| POST   | `/api/quotes/:id/respond`                           | Yes           | Tradesperson | Submit a quote response                                           |
| PUT    | `/api/quotes/:quoteId/responses/:responseId/status` | Yes           | Homeowner    | Accept or decline quote response (only creator)                   |

---

## Review Routes (`/api/reviews`)

| Method | Endpoint                | Auth Required | Role      | Description                               |
| ------ | ----------------------- | ------------- | --------- | ----------------------------------------- |
| GET    | `/api/reviews/user/:id` | No            | -         | Get all reviews for a user (tradesperson) |
| GET    | `/api/reviews/:id`      | No            | -         | Get review by ID                          |
| POST   | `/api/reviews`          | Yes           | Homeowner | Create a review for a tradesperson        |

---

## Summary by Feature

### 🔐 Authentication (3 endpoints)

- Register
- Login
- Get current user

### 👤 User Management (5 endpoints)

- Get tradespeople list
- Get user profile
- Update profile
- Update membership
- Update credits

### 💼 Job Leads (9 endpoints)

- List jobs
- Get job details
- Create job
- Get my jobs
- Update job
- Delete job
- Purchase job lead
- Express interest
- Update interest status

### 💬 Quote Requests (7 endpoints)

- List quote requests
- Get quote details
- Create quote request
- Get my requests
- Delete request
- Submit quote response
- Update response status

### ⭐ Reviews (3 endpoints)

- Get user reviews
- Get review details
- Create review

---

## Total: 27 API Endpoints

### Breakdown by Access:

- **Public endpoints**: 8
- **Authenticated endpoints**: 19
  - Homeowner only: 9
  - Tradesperson only: 5
  - Both roles: 5

---

## Common Query Parameters

### Pagination

- `limit` - Number of results per page (default: 20)
- `offset` - Number of results to skip (default: 0)

### Filters

- `category` - Filter by category
- `location` - Filter by location (partial match)
- `urgency` - Filter by urgency level (Low, Medium, High)
- `isActive` - Filter active/inactive items
- `verified` - Filter verified users
- `minRating` - Minimum rating filter
- `trade` - Filter by trade

---

## Authentication Header Format

```
Authorization: Bearer <jwt_token>
```

---

## Response Formats

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
	"error": "Error message"
}
```

### Paginated Response

```json
{
  "items": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```
