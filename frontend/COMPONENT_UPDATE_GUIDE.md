# Component Update Implementation Guide

This guide provides the exact code changes needed to integrate each component with the backend API.

## 1. Header Component - Add Logout Functionality

**File:** `src/components/Header.tsx`

Add logout functionality to the header:

```typescript
import { authService } from '../services/authService';

// In the user menu dropdown, add logout button:
<button
  onClick={() => {
    authService.logout();
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_VIEW', payload: 'home' });
  }}
  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
>
  Sign Out
</button>
```

## 2. JobLeads Component - Fetch and Purchase Jobs

**File:** `src/components/JobLeads.tsx`

Add these imports at the top:

```typescript
import { jobService } from '../services/jobService';
import { useEffect } from 'react';
```

Add state for loading and fetching jobs:

```typescript
const [jobs, setJobs] = useState<JobLead[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

Add useEffect to fetch jobs:

```typescript
useEffect(() => {
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await jobService.getJobLeads({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        isActive: true
      });
      setJobs(response.jobLeads || []);
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchJobs();
}, [categoryFilter]);
```

Update the purchase handler:

```typescript
const handlePurchaseLead = async (leadId: string) => {
  if (!state.currentUser) {
    dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'tradesperson' } });
    return;
  }

  if (state.currentUser.type !== 'tradesperson') {
    alert('Only tradespeople can purchase leads');
    return;
  }

  setLoading(true);
  try {
    const response = await jobService.purchaseJobLead(leadId);
    alert('Lead purchased successfully! Contact details are now available.');
    
    // Refresh jobs
    const updatedJobs = await jobService.getJobLeads({ isActive: true });
    setJobs(updatedJobs.jobLeads || []);
    
    // Update user credits
    const userResponse = await authService.getMe();
    dispatch({ type: 'SET_USER', payload: userResponse.user });
  } catch (err: any) {
    console.error('Failed to purchase lead:', err);
    alert(err.message || 'Failed to purchase lead');
  } finally {
    setLoading(false);
  }
};
```

Update express interest handler:

```typescript
const submitInterest = async () => {
  if (!selectedLead || !state.currentUser) return;

  setLoading(true);
  try {
    await jobService.expressInterest(selectedLead, {
      message: interestMessage,
      price: calculateInterestPrice(state.currentUser.membershipType).finalPrice
    });
    
    setShowInterestModal(false);
    setInterestMessage('');
    setSelectedLead(null);
    alert('Interest expressed successfully!');
    
    // Refresh jobs
    const updatedJobs = await jobService.getJobLeads({ isActive: true });
    setJobs(updatedJobs.jobLeads || []);
  } catch (err: any) {
    console.error('Failed to express interest:', err);
    alert(err.message || 'Failed to express interest');
  } finally {
    setLoading(false);
  }
};
```

Replace `state.jobLeads` with `jobs` in the component render.

## 3. QuoteRequest Component - Create Quote Requests

**File:** `src/components/QuoteRequest.tsx`

Add imports:

```typescript
import { quoteService } from '../services/quoteService';
import { useState } from 'react';
```

Add state:

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
```

Update submit handler:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(false);
  
  if (!state.currentUser) {
    dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'homeowner' } });
    return;
  }

  setLoading(true);

  try {
    await quoteService.createQuoteRequest({
      projectTitle: formData.title,
      projectDescription: formData.description,
      category: formData.category,
      location: formData.location,
      budget: formData.budget,
      urgency: formData.urgency,
      contactDetails: {
        name: formData.contactName,
        email: formData.contactEmail,
        phone: formData.contactPhone
      }
    });

    setSuccess(true);
    // Reset form
    setFormData({
      title: '', description: '', category: '', location: '', budget: '',
      urgency: 'Medium', contactName: '', contactEmail: '', contactPhone: ''
    });

    setTimeout(() => {
      dispatch({ type: 'SET_VIEW', payload: 'profile' });
    }, 1500);
  } catch (err: any) {
    console.error('Failed to create quote request:', err);
    setError(err.message || 'Failed to submit quote request');
  } finally {
    setLoading(false);
  }
};
```

## 4. BrowseExperts Component - Fetch Tradespeople

**File:** `src/components/BrowseExperts.tsx`

Add imports:

```typescript
import { userService } from '../services/userService';
import { useEffect, useState } from 'react';
```

Add state:

```typescript
const [tradespeople, setTradespeople] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

Add useEffect:

```typescript
useEffect(() => {
  const fetchTradespeople = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getTradespeople({
        trade: serviceFilter || undefined,
        verified: true,
        limit: 50
      });
      setTradespeople(response.tradespeople || []);
    } catch (err: any) {
      console.error('Failed to fetch tradespeople:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchTradespeople();
}, [serviceFilter]);
```

Replace references to `state.users.filter(...)` with `tradespeople`.

## 5. HomeownerProfile Component - Fetch My Jobs

**File:** `src/components/HomeownerProfile.tsx`

Add imports:

```typescript
import { jobService, quoteService } from '../services';
import { useEffect, useState } from 'react';
```

Add state:

```typescript
const [myJobs, setMyJobs] = useState<JobLead[]>([]);
const [myQuotes, setMyQuotes] = useState<QuoteRequest[]>([]);
const [loading, setLoading] = useState(false);
```

Add useEffect:

```typescript
useEffect(() => {
  const fetchMyData = async () => {
    if (!state.currentUser) return;
    
    setLoading(true);
    try {
      const [jobsResponse, quotesResponse] = await Promise.all([
        jobService.getMyJobs(),
        quoteService.getMyQuoteRequests()
      ]);
      
      setMyJobs(jobsResponse.jobLeads || []);
      setMyQuotes(quotesResponse.quoteRequests || []);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchMyData();
}, [state.currentUser]);
```

## 6. TradespersonProfile Component - Update Profile

**File:** `src/components/TradespersonProfile.tsx`

Add imports:

```typescript
import { userService } from '../services/userService';
import { useState } from 'react';
```

Add update profile handler:

```typescript
const handleUpdateProfile = async (updates: any) => {
  setLoading(true);
  try {
    const response = await userService.updateProfile(updates);
    dispatch({ type: 'SET_USER', payload: response.user });
    alert('Profile updated successfully!');
  } catch (err: any) {
    console.error('Failed to update profile:', err);
    alert(err.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};
```

## 7. Reviews Component - Fetch and Create Reviews

**File:** `src/components/Reviews.tsx`

Add imports:

```typescript
import { reviewService } from '../services/reviewService';
import { useEffect, useState } from 'react';
```

Add state:

```typescript
const [reviews, setReviews] = useState<Review[]>([]);
const [loading, setLoading] = useState(false);
```

Fetch reviews:

```typescript
useEffect(() => {
  const fetchReviews = async () => {
    if (!tradespersonId) return;
    
    setLoading(true);
    try {
      const response = await reviewService.getUserReviews(tradespersonId);
      setReviews(response.reviews || []);
    } catch (err: any) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchReviews();
}, [tradespersonId]);
```

Create review:

```typescript
const handleSubmitReview = async (reviewData: CreateReviewData) => {
  setLoading(true);
  try {
    await reviewService.createReview(reviewData);
    alert('Review submitted successfully!');
    
    // Refresh reviews
    const response = await reviewService.getUserReviews(reviewData.tradespersonId);
    setReviews(response.reviews || []);
  } catch (err: any) {
    console.error('Failed to submit review:', err);
    alert(err.message || 'Failed to submit review');
  } finally {
    setLoading(false);
  }
};
```

## 8. AppContext - Initialize User from Token

**File:** `src/context/AppContext.tsx`

Add this useEffect in AppProvider:

```typescript
useEffect(() => {
  const initializeAuth = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const response = await authService.getMe();
        dispatch({ type: 'SET_USER', payload: response.user });
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.logout();
      }
    }
  };

  initializeAuth();
}, []);
```

## Loading States Pattern

For all components, add loading indicators:

```typescript
{loading && (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)}
```

## Error Handling Pattern

For all components, add error displays:

```typescript
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <p className="text-red-800">{error}</p>
  </div>
)}
```

## Success Messages Pattern

```typescript
{success && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
    <p className="text-green-800">Operation completed successfully!</p>
  </div>
)}
```

## Testing Checklist

After implementing these changes:

1. Test user registration and login
2. Test creating a job lead
3. Test purchasing a job lead
4. Test expressing interest
5. Test creating a quote request
6. Test submitting a quote response
7. Test creating a review
8. Test profile updates
9. Test logout functionality
10. Verify token persistence across page refreshes

## Common Issues and Solutions

### Issue: "Unauthorized" errors
**Solution**: Check if token is being sent in headers. Verify token in localStorage.

### Issue: CORS errors
**Solution**: Ensure backend CORS is configured for `http://localhost:5173`

### Issue: Data not refreshing
**Solution**: Call the fetch function again after mutations

### Issue: Token expires
**Solution**: Implement token refresh or redirect to login

## Next Steps

1. Implement all changes component by component
2. Test each component individually
3. Test the complete user flow
4. Add proper error boundaries
5. Implement loading skeletons
6. Add optimistic UI updates
7. Implement caching strategy
8. Add offline support (optional)

## Production Checklist

Before deploying:

- [ ] All API calls use production URLs
- [ ] Error messages are user-friendly
- [ ] Loading states are implemented
- [ ] Token refresh is implemented
- [ ] HTTPS is enforced
- [ ] Environment variables are set
- [ ] Error logging is configured
- [ ] Analytics are integrated
- [ ] Performance is optimized
- [ ] Security headers are set
