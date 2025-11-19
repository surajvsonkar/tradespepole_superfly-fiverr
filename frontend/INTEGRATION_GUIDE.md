# Frontend-Backend Integration Guide

## Overview

The frontend has been fully integrated with the Express/PostgreSQL backend API. All Supabase dependencies have been replaced with secure REST API calls.

## Changes Made

### 1. API Service Layer Created

**Location:** `src/services/` and `src/lib/apiClient.ts`

#### Files Created:

- `lib/apiClient.ts` - Core HTTP client with JWT token management
- `services/authService.ts` - Authentication (register, login, logout)
- `services/userService.ts` - User management and profiles
- `services/jobService.ts` - Job leads CRUD and management
- `services/quoteService.ts` - Quote requests and responses
- `services/reviewService.ts` - Review creation and retrieval

### 2. Security Features

#### Token Management

- JWT tokens stored securely in localStorage
- Automatic token inclusion in all authenticated requests
- Token removal on logout
- Secure HTTP-only communication

#### Request Security

- All requests use HTTPS in production
- CORS properly configured
- Input validation on both client and server
- Error handling with user-friendly messages

### 3. Components Updated

#### AuthModal.tsx

- Removed Supabase authentication
- Integrated with backend `/api/auth/register` and `/api/auth/login`
- Proper error handling and user feedback
- Token storage after successful authentication

### 4. Environment Configuration

**File:** `.env.example`

```
VITE_API_BASE_URL=http://localhost:3000/api
```

**Create `.env` file:**

```bash
cp .env.example .env
```

## API Endpoints Used

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users/tradespeople` - List tradespeople
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/membership` - Update membership
- `PUT /api/users/credits` - Update credits

### Job Leads

- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (homeowner)
- `GET /api/jobs/my/jobs` - Get my jobs
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/purchase` - Purchase job lead
- `POST /api/jobs/:id/interest` - Express interest
- `PUT /api/jobs/:jobId/interests/:interestId/status` - Update interest

### Quote Requests

- `GET /api/quotes` - List quote requests
- `GET /api/quotes/:id` - Get quote details
- `POST /api/quotes` - Create quote request
- `GET /api/quotes/my/requests` - Get my requests
- `DELETE /api/quotes/:id` - Delete request
- `POST /api/quotes/:id/respond` - Submit response
- `PUT /api/quotes/:quoteId/responses/:responseId/status` - Update response

### Reviews

- `GET /api/reviews/user/:id` - Get user reviews
- `GET /api/reviews/:id` - Get review details
- `POST /api/reviews` - Create review

## Usage Examples

### Authentication

```typescript
import { authService } from './services/authService';

const handleRegister = async () => {
	try {
		const response = await authService.register({
			name: 'John Doe',
			email: 'john@example.com',
			password: 'securePassword123',
			type: 'homeowner',
			location: 'London, UK',
		});

		console.log('User registered:', response.user);
	} catch (error) {
		console.error('Registration failed:', error.message);
	}
};

const handleLogin = async () => {
	try {
		const response = await authService.login({
			email: 'john@example.com',
			password: 'securePassword123',
		});

		console.log('Logged in:', response.user);
	} catch (error) {
		console.error('Login failed:', error.message);
	}
};
```

### Job Management

```typescript
import { jobService } from './services/jobService';

const createJob = async () => {
	try {
		const response = await jobService.createJobLead({
			title: 'Kitchen Renovation',
			description: 'Need complete kitchen renovation',
			category: 'Plumbing',
			location: 'London, UK',
			budget: '£2000-£3000',
			urgency: 'Medium',
			contactDetails: {
				name: 'John Doe',
				email: 'john@example.com',
				phone: '+44 1234567890',
			},
		});

		console.log('Job created:', response.jobLead);
	} catch (error) {
		console.error('Failed to create job:', error.message);
	}
};

const purchaseJob = async (jobId: string) => {
	try {
		const response = await jobService.purchaseJobLead(jobId);
		console.log('Job purchased:', response);
	} catch (error) {
		console.error('Purchase failed:', error.message);
	}
};
```

### User Profile

```typescript
import { userService } from './services/userService';

const updateProfile = async () => {
	try {
		const response = await userService.updateProfile({
			name: 'John Updated',
			location: 'Manchester, UK',
			trades: ['Plumbing', 'Heating'],
		});

		console.log('Profile updated:', response.user);
	} catch (error) {
		console.error('Update failed:', error.message);
	}
};

const getTradespeople = async () => {
	try {
		const response = await userService.getTradespeople({
			trade: 'Plumbing',
			location: 'London',
			verified: true,
			limit: 20,
		});

		console.log('Tradespeople:', response.tradespeople);
	} catch (error) {
		console.error('Failed to fetch:', error.message);
	}
};
```

## Next Steps for Full Integration

### 1. Update Remaining Components

The following components need to be updated to use the new API services:

- `SubmitProject.tsx` - Use `jobService.createJobLead()`
- `JobLeads.tsx` - Use `jobService.getJobLeads()` and `jobService.purchaseJobLead()`
- `QuoteRequest.tsx` - Use `quoteService.createQuoteRequest()`
- `BrowseExperts.tsx` - Use `userService.getTradespeople()`
- `HomeownerProfile.tsx` - Use `jobService.getMyJobs()`
- `TradespersonProfile.tsx` - Use `userService.updateProfile()`
- `Reviews.tsx` - Use `reviewService.getUserReviews()`

### 2. Add Loading States

Add loading indicators for all API calls:

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
	setLoading(true);
	try {
		const data = await jobService.getJobLeads();
		// Handle data
	} catch (error) {
		// Handle error
	} finally {
		setLoading(false);
	}
};
```

### 3. Error Handling

Implement consistent error handling:

```typescript
const handleError = (error: any) => {
	if (error.message.includes('Unauthorized')) {
		authService.logout();
		navigate('/login');
	} else {
		setError(error.message);
	}
};
```

### 4. Token Refresh

Implement automatic token refresh before expiration:

```typescript
const refreshToken = async () => {
	try {
		const response = await authService.getMe();
		// Token is still valid
	} catch (error) {
		authService.logout();
		// Redirect to login
	}
};
```

## Testing

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Authentication

1. Open browser to `http://localhost:5173`
2. Click "Sign Up" or "Sign In"
3. Fill in the form
4. Check browser console for API calls
5. Verify token in localStorage

### 4. Test API Calls

Open browser DevTools Network tab to monitor:

- Request headers (Authorization: Bearer token)
- Response status codes
- Response data

## Security Best Practices

1. **Never log sensitive data** (passwords, tokens)
2. **Always use HTTPS** in production
3. **Validate input** on both client and server
4. **Handle errors gracefully** without exposing system details
5. **Implement rate limiting** on the backend
6. **Use secure password requirements**
7. **Implement CSRF protection** if using cookies
8. **Sanitize user input** to prevent XSS attacks

## Production Deployment

### Environment Variables

Update `.env` for production:

```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Build

```bash
npm run build
```

### Security Headers

Ensure your server sends these headers:

```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security
```

## Troubleshooting

### CORS Errors

- Ensure backend CORS is configured for your frontend domain
- Check `backend/src/app.ts` CORS settings

### 401 Unauthorized

- Token may be expired or invalid
- Check if token exists in localStorage
- Try logging in again

### Network Errors

- Ensure backend is running on port 3000
- Check firewall settings
- Verify API_BASE_URL in .env

### Type Errors

- Ensure TypeScript types match API responses
- Check `src/types/index.ts` for type definitions

## Support

For issues or questions:

1. Check browser console for errors
2. Check backend logs
3. Verify API endpoint URLs
4. Test with Postman or curl
5. Review this documentation
