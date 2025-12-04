# React Router Implementation Guide

## Overview

The frontend has been updated to use **React Router** for navigation instead of the previous view-based state management system. This provides proper URL-based routing with browser history support.

## What Changed

### Before (View-Based Navigation)

```tsx
dispatch({ type: 'SET_VIEW', payload: 'profile' });
```

### After (React Router)

```tsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/profile');
```

## Routes

All routes are defined in `App.tsx`:

### Public Routes

- `/` - Home page
- `/privacy-policy` - Privacy Policy
- `/terms-of-use` - Terms of Use
- `/cookie-policy` - Cookie Policy
- `/profile-mockup` - Profile Mockup

### Protected Routes (Require Login)

- `/profile` - User profile (redirects to homeowner or tradesperson profile based on user type)
- `/submit-project` - Submit a new project
- `/job-leads` - Browse job leads (tradespeople only)
- `/browse-experts` - Browse tradespeople
- `/membership` - Membership plans
- `/quote-requests` - Quote requests
- `/boost` - Boost profile
- `/admin` - Admin dashboard

## Key Components Updated

### 1. App.tsx

- Wrapped in `<Router>` component
- Uses `<Routes>` and `<Route>` for routing
- Implements `<ProtectedRoute>` wrapper for authenticated routes
- Implements `<ProfileRoute>` for user-type-based profile routing

### 2. Header.tsx

- Uses `<Link>` components instead of buttons for navigation
- Uses `useLocation()` to highlight active route
- Uses `useNavigate()` for programmatic navigation (logout, etc.)

### 3. AdminDashboard.tsx

- Uses `useNavigate()` for "Back to Home" button

## How to Navigate

### Using Links (Declarative)

```tsx
import { Link } from 'react-router-dom';

<Link to="/profile">Go to Profile</Link>;
```

### Using Navigate (Programmatic)

```tsx
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate('/profile');
	};

	return <button onClick={handleClick}>Go to Profile</button>;
};
```

### Checking Current Route

```tsx
import { useLocation } from 'react-router-dom';

const MyComponent = () => {
	const location = useLocation();

	const isActive = location.pathname === '/profile';

	return <div className={isActive ? 'active' : ''}>Profile</div>;
};
```

## Protected Routes

Protected routes automatically redirect to home if the user is not logged in:

```tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { state } = useApp();

	if (!state.currentUser) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};
```

## Migration Guide for Remaining Components

If you need to update other components that still use `dispatch({ type: 'SET_VIEW' })`:

1. **Import useNavigate:**

   ```tsx
   import { useNavigate } from 'react-router-dom';
   ```

2. **Get navigate function:**

   ```tsx
   const navigate = useNavigate();
   ```

3. **Replace dispatch calls:**

   ```tsx
   // Old
   dispatch({ type: 'SET_VIEW', payload: 'profile' });

   // New
   navigate('/profile');
   ```

### Route Mapping

- `'home'` → `'/'`
- `'profile'` → `'/profile'`
- `'submit-project'` → `'/submit-project'`
- `'job-leads'` → `'/job-leads'`
- `'browse-experts'` → `'/browse-experts'`
- `'membership'` → `'/membership'`
- `'quote-requests'` → `'/quote-requests'`
- `'boost'` → `'/boost'`
- `'admin'` → `'/admin'`
- `'privacy-policy'` → `'/privacy-policy'`
- `'terms-of-use'` → `'/terms-of-use'`
- `'cookie-policy'` → `'/cookie-policy'`
- `'profile-mockup'` → `'/profile-mockup'`

## Benefits of React Router

1. **Proper URLs**: Users can bookmark specific pages
2. **Browser History**: Back/forward buttons work correctly
3. **Deep Linking**: Can share direct links to specific pages
4. **SEO Friendly**: Search engines can crawl different pages
5. **Better UX**: URL bar reflects current page
6. **Code Splitting**: Can lazy load routes for better performance

## State Management

The AppContext still manages application state (user, reviews, etc.), but no longer manages the current view. Navigation is now handled entirely by React Router.

## Testing

To test the routing:

1. Navigate to different pages using the header links
2. Use browser back/forward buttons
3. Refresh the page - you should stay on the same route
4. Try accessing protected routes without logging in - should redirect to home
5. Copy a URL and open in a new tab - should navigate to that page

## Future Improvements

- Implement lazy loading for routes
- Add route-based code splitting
- Add loading states for route transitions
- Implement scroll restoration
- Add route-based analytics tracking
