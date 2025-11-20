# Quick Reference - Current App State

## What's Working Right Now

### Authentication

- User registration (homeowner & tradesperson)
- User login with JWT tokens
- Automatic login on page refresh
- Token stored in localStorage
- Logout functionality (needs to be added to Header)

### Job Management

- Job creation by homeowners
- Form validation
- Success/error messages
- Loading states

### State Management

- AppContext with backend integration
- User state persistence
- View navigation
- Auth modal control

## Quick Test Guide

### Test 1: Register New User

```
1. Open http://localhost:5173
2. Click any "Sign Up" button
3. Select "Homeowner" or "Tradesperson"
4. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Location: London, UK
   - (Trades if tradesperson)
5. Click "Create Account"
6. Check localStorage for 'authToken'
```

### Test 2: Login Existing User

```
1. Click "Sign In"
2. Enter:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"
4. Should see user logged in
```

### Test 3: Auto-Login

```
1. Login as above
2. Refresh page (F5)
3. Should stay logged in
4. Check console - should see auth initialization
```

### Test 4: Create Job

```
1. Login as homeowner
2. Navigate to "Submit Project"
3. Fill in all fields
4. Click "Submit Project"
5. Should see success message
6. Check backend logs for API call
```

## API Endpoints Being Used

### Currently Active

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/jobs

### Available (Not Yet Used in UI)

- GET /api/jobs
- GET /api/jobs/:id
- POST /api/jobs/:id/purchase
- POST /api/jobs/:id/interest
- GET /api/users/tradespeople
- POST /api/quotes
- POST /api/reviews
- And 18 more...

## Component Status

### Fully Integrated

- AuthModal.tsx
- SubmitProject.tsx
- AppContext.tsx
- App.tsx

### Needs Integration

- JobLeads.tsx (fetch jobs, purchase, express interest)
- QuoteRequest.tsx (create quotes)
- BrowseExperts.tsx (fetch tradespeople)
- HomeownerProfile.tsx (fetch user data)
- TradespersonProfile.tsx (update profile)
- Reviews.tsx (fetch/create reviews)
- Header.tsx (add logout button)

### No Changes Needed

- Hero.tsx
- ServiceCategories.tsx
- HowItWorks.tsx
- FeaturedTradespeople.tsx
- Footer.tsx
- Privacy/Terms/Cookie pages

## How to Add Logout

In Header.tsx, add this button in the user menu:

```typescript
import { authService } from '../services';

<button
	onClick={() => {
		authService.logout();
		dispatch({ type: 'SET_USER', payload: null });
		dispatch({ type: 'SET_VIEW', payload: 'home' });
	}}
	className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
>
	Sign Out
</button>;
```

## Debugging Tips

### Check if User is Logged In

```javascript
// In browser console:
localStorage.getItem('authToken');
// Should show JWT token if logged in
```

### Check Current User State

```javascript
// In React DevTools:
// Look for AppContext > state > currentUser
```

### Check API Calls

```javascript
// In Network tab:
// Filter by "api"
// Check request headers for Authorization: Bearer <token>
```

### Common Errors

**"Cannot find module './context/AppContext'"**

- Restart dev server: Ctrl+C, then `npm run dev`

**"Unauthorized" on API calls**

- Check if token exists in localStorage
- Try logging in again
- Check backend is running

**CORS errors**

- Verify backend CORS is set to http://localhost:5173
- Check backend/.env CORS_ORIGIN setting

**User not staying logged in**

- Check AppContext useEffect is calling getMe()
- Verify token is in localStorage
- Check browser console for errors

## Environment Variables

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend (.env)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Development Workflow

### Starting the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Making Changes

1. Edit component file
2. Save (Vite hot-reloads automatically)
3. Test in browser
4. Check console for errors
5. Check Network tab for API calls

### Adding New API Integration

1. Import service: `import { jobService } from '../services';`
2. Add state: `const [data, setData] = useState([]);`
3. Add loading: `const [loading, setLoading] = useState(false);`
4. Add error: `const [error, setError] = useState(null);`
5. Add useEffect to fetch data
6. Add try/catch for error handling
7. Update UI to show loading/error/data

## Quick Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint
```

## Browser DevTools

### Essential Tabs

1. **Console** - See errors and logs
2. **Network** - Monitor API calls
3. **Application** - Check localStorage
4. **React DevTools** - Inspect component state

### What to Check

- localStorage has 'authToken'
- Network shows API calls with 200 status
- Console has no errors
- React state shows currentUser

## Next Development Steps

1. Add logout to Header
2. Update JobLeads to fetch from API
3. Update BrowseExperts to fetch tradespeople
4. Update QuoteRequest to create quotes
5. Update profile components
6. Add loading skeletons
7. Add error boundaries
8. Test all features
9. Deploy to production

## Production Checklist

Before deploying:

- [ ] Update VITE_API_BASE_URL to production API
- [ ] Test all features
- [ ] Check for console errors
- [ ] Verify all API calls work
- [ ] Test on mobile
- [ ] Run `npm run build`
- [ ] Test production build locally
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Update CORS_ORIGIN in backend
- [ ] Test production deployment

## Support Resources

- Backend API Docs: `backend/README.md`
- API Routes: `backend/API_ROUTES.md`
- Test Data: `backend/TEST_DATA.md`
- Integration Guide: `frontend/INTEGRATION_GUIDE.md`
- Component Updates: `frontend/COMPONENT_UPDATE_GUIDE.md`
- Fixes Summary: `frontend/FIXES_SUMMARY.md`

## Current Versions

- React: 18.x
- TypeScript: 5.x
- Vite: 5.x
- Backend: Express + PostgreSQL + Prisma

Everything is working and ready for continued development!
