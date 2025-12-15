# 🧪 Superfly Tradespeople - Complete Testing Guide

This guide walks you through setting up and testing the application from scratch.

### Step 1: Install Node.js

1. Download Node.js from https://nodejs.org (LTS version recommended)
2. Run the installer and follow the prompts
3. Verify installation:

   ```bash
   node --version
   # Should show v18.x.x or higher

   npm --version
   # Should show v9.x.x or higher
   ```

### Step 2: Extract Project Files

1. Extract the project zip file to your desired location
2. Open a terminal/command prompt
3. Navigate to the project folder:
   ```bash
   cd path/to/superfly136
   ```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Configure Backend Environment

The `.env` file is already included. Verify/update the database connection:

```bash
# Open backend/.env and verify DATABASE_URL matches your PostgreSQL setup:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/superfly_tradespeople"
```

**Replace `YOUR_PASSWORD` with your PostgreSQL password.**

### Step 5: Set Up Database Schema

```bash
# Still in the backend folder
npx prisma generate --schema src/prisma/schema.prisma
npx prisma db push --schema src/prisma/schema.prisma
```

### Step 6: Seed Database with Test Data

```bash
# Make sure you're in the backend folder
cd backend

# Option 1: Run the seed script directly (Recommended)
npx ts-node src/prisma/seed.ts

# Option 2: Use prisma db seed (without --schema flag)
npx prisma db seed
```

This creates:

- Admin account
- Test homeowners
- Test tradespeople
- Sample jobs
- Sample reviews
- Sample conversations

### Step 7: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 8: Verify Environment Files

Both `.env` files should already be configured:

**Backend (backend/.env):**

- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Authentication secret
- `STRIPE_SECRET_KEY` - Stripe test key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook
- `GOOGLE_MAPS_API_KEY` - Google Maps
- `TWILIO_*` - SMS notifications

**Frontend (frontend/.env):**

- `VITE_API_URL` - Backend API URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth

---

## 🚀 Start the Servers

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

✅ **Expected output:**

```
Server running on port 3001
Connected to PostgreSQL database
WebSocket server initialized
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

✅ **Expected output:**

```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Verify Setup

1. Open browser: http://localhost:5173
2. You should see the Superfly homepage
3. Click "Login" and use test credentials below

---

## 📋 Test Credentials Quick Reference

| Role                        | Email                                 | Password  | Notes                                   |
| --------------------------- | ------------------------------------- | --------- | --------------------------------------- |
| **Admin**                   | admin@superfly.com                    | Admin@123 | Full access                             |
| **Homeowner**               | john.smith@email.com                  | Test@123  | Can post jobs                           |
| **Homeowner**               | sarah.johnson@email.com               | Test@123  | Can post jobs                           |
| **Tradesperson (With Sub)** | james.wilson@tradesperson.com         | Test@123  | Premium + Directory - CAN view jobs     |
| **Tradesperson (With Sub)** | robert.taylor@tradesperson.com        | Test@123  | Premium + Directory - CAN view jobs     |
| **Tradesperson (With Sub)** | william.anderson@tradesperson.com     | Test@123  | Unlimited + Directory - CAN view jobs   |
| **Tradesperson (NO Sub)**   | no.subscription@tradesperson.com      | Test@123  | NO directory listing - CANNOT view jobs |
| **Tradesperson (Expired)**  | expired.subscription@tradesperson.com | Test@123  | Expired listing - CANNOT view jobs      |
| **Tradesperson (Basic)**    | thomas.martin@tradesperson.com        | Test@123  | Basic membership, no directory          |

---

## 💳 Stripe Test Cards

Use these test card numbers for payment testing:

| Card Number           | Description        |
| --------------------- | ------------------ |
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined      |
| `4000 0000 0000 9995` | Insufficient funds |

- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

---

## 🔐 1. Authentication Testing

### 1.1 Traditional Email/Password Login

**Test Homeowner Login:**

1. Open `http://localhost:5173`
2. Click "Login" in the navigation
3. Enter email: `john.smith@email.com`
4. Enter password: `Test@123`
5. Click "Sign In"
6. ✅ **Expected:** Redirected to dashboard, user name displayed in header

**Test Tradesperson Login:**

1. Log out (click profile icon → Logout)
2. Click "Login"
3. Enter email: `james.wilson@tradesperson.com`
4. Enter password: `Test@123`
5. Click "Sign In"
6. ✅ **Expected:** Redirected to tradesperson dashboard

### 1.2 New User Registration (Homeowner)

1. Log out if logged in
2. Click "Sign Up"
3. Select "Homeowner"
4. Fill in:
   - Name: `Test Homeowner`
   - Email: `testhomeowner@example.com`
   - Password: `Test@123`
   - Phone: `+447123456789`
   - Location: `London`
   - Postcode: `SW1A 1AA`
5. Complete CAPTCHA (in dev mode, shows "Development mode - CAPTCHA disabled")
6. Click "Create Account"
7. ✅ **Expected:** Account created message appears

### 1.3 New Tradesperson Registration (with Trades Selection)

1. Log out if logged in
2. Click "Sign Up"
3. Select "Tradesperson"
4. Fill in:
   - Name: `Test Tradesperson`
   - Email: `testtradesperson@example.com`
   - Password: `Test@123`
   - Phone: `+447123456789`
   - Location: `Manchester`
   - Postcode: `M1 1AA`
5. **Select Trades:**
   - ✅ **Expected:** Trade selection list appears
   - Select multiple trades (e.g., Plumber, Electrician, Builder, Roofer)
   - ✅ **Expected:** NO limit - can select as many as you want
   - Selected trades appear as blue chips above the list
   - Click × on a chip to remove a trade
6. Click "Create Account"
7. ✅ **Expected:** Account created with selected trades

### 1.4 Password Recovery

1. Click "Login"
2. Click "Forgot Password?"
3. Enter email: `john.smith@email.com`
4. Click "Send Reset Link"
5. ✅ **Expected:** In development mode, a green button appears with the reset link
6. Click the reset link button
7. Enter new password and confirm
8. ✅ **Expected:** Password reset successfully

### 1.5 Password Visibility Toggle

1. On any login/signup form
2. Click the eye icon next to password field
3. ✅ **Expected:** Password becomes visible/hidden

---

## 🏠 2. Homeowner Features Testing

### 2.1 Post a New Job

1. Login as homeowner: `john.smith@email.com` / `Test@123`
2. Click "Post a Job" or "Submit Project"
3. Fill in the form:
   - **Title:** "Test Bathroom Renovation"
   - **Description:** "Need a complete bathroom renovation"
   - **Category:** Start typing "Bathroom" → Select "Bathroom Fitter"
   - **Location:** Click **"Use Current"** button
   - **Budget:** Select "£5,000 - £10,000"
   - **Urgency:** Select "Medium"
4. Click "Submit Project"
5. ✅ **Expected:** Job created successfully

### 2.2 View My Posted Jobs

1. Click on your profile icon
2. Select "My Jobs" or go to Profile → Posted Jobs tab
3. ✅ **Expected:** See list of your posted jobs
4. Click on a job to see details

### 2.3 Browse Tradespeople Directory

**Test WITH Directory Access:**

1. Login as: `john.smith@email.com` / `Test@123` (has directory access)
2. Click "Browse Experts" in navigation
3. ✅ **Expected:** Full list of tradespeople displayed

**Test WITHOUT Directory Access:**

1. Login as: `sarah.johnson@email.com` / `Test@123` (no directory access)
2. Click "Browse Experts"
3. ✅ **Expected:** Subscription modal appears asking to subscribe for £1/month

### 2.4 Directory Subscription (£1/month)

1. Login as: `sarah.johnson@email.com` / `Test@123`
2. Click "Browse Experts"
3. Subscription modal appears
4. Click "Subscribe for £1/month"
5. Enter test card: `4242 4242 4242 4242`, any future date, any CVC
6. Click "Subscribe"
7. ✅ **Expected:** Subscription activated, directory now accessible

---

## 💳 3. €1/Month Subscription Testing (View Job Leads)

### 3.1 Test WITHOUT Subscription (Blocked Access)

1. Login as: `no.subscription@tradesperson.com` / `Test@123`
2. Click "Job Leads" or "Find Jobs"
3. ✅ **Expected:**
   - Blue banner appears: "Subscription Required to View Job Leads"
   - Job leads are hidden behind a blurred overlay
   - "Subscribe Now - €1/month" button visible
4. Click "Subscribe Now" button
5. ✅ **Expected:** Subscription modal opens

### 3.2 Complete Subscription Payment

1. From the subscription modal, click "Subscribe Now"
2. Enter test card: `4242 4242 4242 4242`
3. Enter any future expiry date (e.g., 12/25)
4. Enter any CVC (e.g., 123)
5. Click "Subscribe"
6. ✅ **Expected:**
   - "Subscription Activated!" message
   - Page refreshes
   - Job leads are now visible

### 3.3 Test WITH Subscription (Full Access)

1. Login as: `james.wilson@tradesperson.com` / `Test@123`
2. Click "Job Leads"
3. ✅ **Expected:**
   - NO subscription prompt
   - All job leads visible immediately
   - Can view, purchase leads, express interest

### 3.4 Test EXPIRED Subscription

1. Login as: `expired.subscription@tradesperson.com` / `Test@123`
2. Click "Job Leads"
3. ✅ **Expected:**
   - Subscription prompt appears (listing expired)
   - Job leads hidden behind blur

---

## 👷 4. Tradesperson Features Testing

### 4.1 Trades-Based Job Filtering

1. Login as: `james.wilson@tradesperson.com` / `Test@123`
   - This user has trades: Plumber, Gas Engineer, Heating Engineer
2. Click "Job Leads"
3. ✅ **Expected:** Only jobs matching your trades are shown

   - Plumbing jobs ✓
   - Gas Engineer jobs ✓
   - Heating jobs ✓
   - Kitchen Fitter jobs ✗ (different trade)

4. Login as: `no.subscription@tradesperson.com` (after subscribing)
   - This user has trades: Plumber, Electrician, Builder, Roofer, Gardener
5. ✅ **Expected:** More job categories visible due to more trades

### 4.2 Change Your Trades (Profile Settings)

1. Login as any tradesperson with subscription
2. Go to Profile → "Lead Settings" or "Services" tab
3. ✅ **Expected:**
   - Current trades shown as blue chips
   - Can add/remove trades (no limit)
4. Add or remove some trades
5. Click "Save Lead Settings"
6. Go to Job Leads
7. ✅ **Expected:** Jobs filtered based on new trade selection

### 4.3 View Available Jobs (Requires Subscription)

1. Login as: `james.wilson@tradesperson.com` / `Test@123` (has subscription)
2. Click "Find Jobs" or "Available Leads"
3. ✅ **Expected:** List of active job leads displayed
4. Apply filters by category and location

### 4.4 View Job on Map

1. Login as tradesperson
2. Click "Map View" in navigation
3. ✅ **Expected:** Interactive map showing job markers
4. Click on a job marker to see details
5. Click "My Location" to center map on your location

### 4.5 Express Interest in a Job

1. Click on a job
2. Click "Express Interest"
3. Enter message and price quote
4. Click "Submit Interest"
5. ✅ **Expected:** Interest submitted successfully

### 4.6 Purchase a Job Lead

1. View a job you haven't purchased
2. Click "Purchase Lead" (shows price, e.g., £9.99)
3. Confirm purchase
4. ✅ **Expected:** Lead purchased, contact details revealed

### 4.7 Balance Top-Up

1. Go to Profile → "Balance" tab
2. Click "Top Up Balance"
3. Select or enter amount (€10 - €1000)
4. Enter test card: `4242 4242 4242 4242`
5. Complete payment
6. ✅ **Expected:** Balance increases

### 4.8 Purchase Boost Plan

1. Go to Profile → "Boost" or "Membership" tab
2. Select a boost plan (1 Week, 1 Month, 3 Month, or 5 Year)
3. Click "Upgrade"
4. Enter test card: `4242 4242 4242 4242`
5. Complete payment
6. ✅ **Expected:** Membership upgraded, features activated

---

## 💬 5. Messaging Testing

### 5.1 Real-time Messaging Test

**Setup:** Open two browser windows

**Window 1:** Login as `john.smith@email.com` / `Test@123`
**Window 2:** Login as `james.wilson@tradesperson.com` / `Test@123`

1. Both go to Messages
2. In Window 1, send a message
3. ✅ **Expected:** Message appears instantly in Window 2

---

## 👑 6. Admin Dashboard Testing

### 6.1 Admin Login

1. Go to `http://localhost:5173/admin`
2. Enter:
   - Email: `admin@superfly.com`
   - Password: `Admin@123`
3. ✅ **Expected:** Admin dashboard loads

### 6.2 View Transactions

1. Click "Transactions" tab
2. ✅ **Expected:** All transactions from both homeowners and tradespeople
3. Filter by type: Balance Top-ups, Lead Purchases, Boost Plans

### 6.3 Change Admin Password

1. Go to "Settings" tab
2. Find "Change Password" section
3. Enter current password: `Admin@123`
4. Enter new password (min 8 characters)
5. Confirm new password
6. Click "Change Password"
7. ✅ **Expected:** Password changed successfully

### 6.4 Update Boost Plan Prices

1. Go to "Settings" tab
2. Find "Boost Plan Pricing" section
3. Modify any plan's price
4. Click "Update Prices"
5. ✅ **Expected:** Prices updated successfully

### 6.5 User Management

1. Go to "Homeowners" or "Tradespeople" tab
2. Click eye icon on any user
3. ✅ **Expected:** User details modal opens
4. Can change account status (Active/Parked/Suspended)
5. Can change verification status

### 6.6 Edit User Trades (Admin)

1. Go to "Tradespeople" tab
2. Click eye icon on any tradesperson
3. Click "Edit" button
4. ✅ **Expected:** Edit form appears
5. Scroll to "Trades" section
6. ✅ **Expected:**
   - Current trades shown as blue chips
   - Can add/remove trades (no limit)
   - Checkbox list of all available trades
7. Add or remove some trades
8. Click "Save Changes"
9. ✅ **Expected:** Trades updated successfully

10. Go to "Homeowners" or "Tradespeople" tab
11. Click eye icon on any user
12. ✅ **Expected:** User details modal opens
13. Can change account status (Active/Parked/Suspended)
14. Can change verification status

---

## 🗺️ 7. Google Maps Integration Testing

### 7.1 Map View - Jobs

1. Login as tradesperson
2. Click "Map View"
3. ✅ **Expected:**
   - Map displays with job markers
   - Jobs clustered in UK cities

### 7.2 Map Controls

1. Use zoom controls (+/-)
2. Click "My Location" button
3. ✅ **Expected:** Map centers on your current location

### 7.3 Map Filters

1. Filter by category
2. Filter by distance (miles radius)
3. ✅ **Expected:** Map updates to show filtered results

---

## ✅ Testing Checklist

### Setup & Installation

- [ ] Node.js installed (v18+)
- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database schema pushed
- [ ] Database seeded with test data
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 5173

### Authentication

- [ ] Homeowner login
- [ ] Tradesperson login
- [ ] Admin login
- [ ] New homeowner registration
- [ ] New tradesperson registration (with trades selection)
- [ ] Select multiple trades during signup (unlimited)
- [ ] Password recovery (dev mode with reset link)
- [ ] Password visibility toggle

### Homeowner Features

- [ ] Post a job
- [ ] Use current location
- [ ] View my jobs
- [ ] Accept/reject interests
- [ ] Browse directory (with subscription)
- [ ] Directory subscription payment
- [ ] Message tradespeople

### €1/Month Subscription (Job Leads Access)

- [ ] Login without subscription - see subscription prompt
- [ ] Job leads hidden behind blur
- [ ] Click "Subscribe Now" opens modal
- [ ] Complete €1/month subscription payment
- [ ] After subscribing - job leads visible
- [ ] Test expired subscription - sees prompt again

### Tradesperson Features

- [ ] View available jobs (requires subscription)
- [ ] Jobs filtered by selected trades
- [ ] Change trades in Profile > Lead Settings
- [ ] Filter jobs by category/location
- [ ] Express interest in job
- [ ] Purchase job lead
- [ ] View purchased leads
- [ ] Balance top-up (€10 - €1000)
- [ ] Purchase boost plan
- [ ] Message homeowners
- [ ] View my reviews

### Map Features

- [ ] View jobs on map
- [ ] Filter map by category
- [ ] Filter map by distance
- [ ] Use current location
- [ ] View job details from map

### Payments

- [ ] View payment history
- [ ] Top up balance
- [ ] Purchase job lead
- [ ] Subscribe to directory
- [ ] Purchase boost plan
- [ ] Failed payment handling

### Admin Dashboard

- [ ] Admin login
- [ ] View all transactions
- [ ] Filter transactions by type
- [ ] View all homeowners
- [ ] View all tradespeople
- [ ] Edit user trades (unlimited selection)
- [ ] Change admin password
- [ ] Update boost plan prices
- [ ] Update user status/verification

### Real-time Features

- [ ] Send/receive messages instantly
- [ ] Notifications update

---

## 🐛 Troubleshooting

### "Cannot find module" error

```bash
cd backend
npm install
cd ../frontend
npm install
```

### Backend not starting

```bash
cd backend
npm install
npx prisma generate --schema src/prisma/schema.prisma
npm run dev
```

### Database connection issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL in backend/.env matches your setup
3. Run:
   ```bash
   cd backend
   npx prisma db push --schema src/prisma/schema.prisma
   ```

### "No data showing" - Seed the database

```bash
cd backend
npx ts-node src/prisma/seed.ts
```

### Clear and reseed database

```bash
cd backend
npx prisma migrate reset --schema src/prisma/schema.prisma
# Then run the seed script
npx ts-node src/prisma/seed.ts
```

### Port already in use

**Backend (3001):**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

**Frontend (5173):**

```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

### Stripe payments not working

1. Verify Stripe keys in .env files are test keys (start with `pk_test_` and `sk_test_`)
2. Use test cards listed above
3. Check browser console for errors

### Google Maps not showing

1. Verify GOOGLE_MAPS_API_KEY in .env files
2. Check if Maps API is enabled in Google Cloud Console
3. Check browser console for API errors

### Email not sending (development)

In development mode, emails are logged to the console instead of being sent.
Check the backend terminal for email content.

---

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the backend console for error messages
3. Check browser developer console (F12) for frontend errors
4. Verify all environment variables are correctly set

---

**Happy Testing! 🎉**
