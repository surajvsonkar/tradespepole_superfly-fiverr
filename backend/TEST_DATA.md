# Test Data Reference

This document contains all the dummy data that has been seeded into your database for testing.

---

## 🔑 Test Credentials

**All users have the same password:** `password123`

---

## 👤 Homeowners (3 users)

### 1. John Smith

- **Email:** `john.smith@example.com`
- **Password:** `password123`
- **Location:** London, UK
- **Status:** Active, Verified
- **Posted Jobs:** 3 (Kitchen Plumbing, Bathroom Painting, Roof Repair)

### 2. Sarah Johnson

- **Email:** `sarah.johnson@example.com`
- **Password:** `password123`
- **Location:** Manchester, UK
- **Status:** Active, Verified
- **Posted Jobs:** 1 (House Rewiring - Hired Emma Thompson)

### 3. Michael Brown

- **Email:** `michael.brown@example.com`
- **Password:** `password123`
- **Location:** Birmingham, UK
- **Status:** Active, Verified
- **Posted Jobs:** 1 (Custom Wardrobes)

---

## 🔧 Tradespeople (5 users)

### 1. David Wilson (Premium Member)

- **Email:** `david.wilson@example.com`
- **Password:** `password123`
- **Location:** London, UK
- **Trades:** Plumbing, Heating
- **Rating:** 4.8 ⭐ (45 reviews)
- **Verified:** ✅ Yes
- **Credits:** 100
- **Membership:** Premium (expires 2025-12-31)
- **Working Area:** London, 50km radius

### 2. Emma Thompson (Unlimited 5-Year Member)

- **Email:** `emma.thompson@example.com`
- **Password:** `password123`
- **Location:** Manchester, UK
- **Trades:** Electrical, Lighting
- **Rating:** 4.9 ⭐ (67 reviews)
- **Verified:** ✅ Yes
- **Credits:** 150
- **Membership:** Unlimited 5-Year (expires 2029-11-19)
- **Working Area:** Manchester, 40km radius
- **Hired For:** House Rewiring job

### 3. James Anderson (Basic Member)

- **Email:** `james.anderson@example.com`
- **Password:** `password123`
- **Location:** Birmingham, UK
- **Trades:** Carpentry, Joinery
- **Rating:** 4.7 ⭐ (38 reviews)
- **Verified:** ✅ Yes
- **Credits:** 75
- **Membership:** Basic (expires 2025-06-30)
- **Working Area:** Birmingham, 35km radius

### 4. Sophie Martinez (No Membership)

- **Email:** `sophie.martinez@example.com`
- **Password:** `password123`
- **Location:** Leeds, UK
- **Trades:** Painting, Decorating
- **Rating:** 4.6 ⭐ (29 reviews)
- **Verified:** ❌ No (Pending)
- **Credits:** 50
- **Membership:** None
- **Working Area:** Leeds, 30km radius

### 5. Oliver Davis (Premium Member)

- **Email:** `oliver.davis@example.com`
- **Password:** `password123`
- **Location:** London, UK
- **Trades:** Roofing, Guttering
- **Rating:** 4.5 ⭐ (22 reviews)
- **Verified:** ✅ Yes
- **Credits:** 120
- **Membership:** Premium (expires 2025-09-15)
- **Working Area:** London, 45km radius
- **Purchased:** Roof Repair job lead

---

## 💼 Job Leads (5 jobs)

### 1. Kitchen Renovation - Plumbing Work

- **Posted by:** John Smith (London)
- **Category:** Plumbing
- **Budget:** £2000-£3000
- **Urgency:** Medium
- **Status:** Active
- **Interests:** 1 (David Wilson - Pending)
- **Price:** £9.99

### 2. Complete House Rewiring ✅ HIRED

- **Posted by:** Sarah Johnson (Manchester)
- **Category:** Electrical
- **Budget:** £4000-£6000
- **Urgency:** High
- **Status:** Active
- **Purchased by:** Emma Thompson
- **Interests:** 1 (Emma Thompson - Accepted)
- **Hired:** Emma Thompson
- **Price:** £12.99

### 3. Custom Built-in Wardrobes

- **Posted by:** Michael Brown (Birmingham)
- **Category:** Carpentry
- **Budget:** £1500-£2500
- **Urgency:** Low
- **Status:** Active
- **Interests:** 1 (James Anderson - Pending)
- **Price:** £9.99

### 4. Bathroom Painting and Tiling

- **Posted by:** John Smith (London)
- **Category:** Painting
- **Budget:** £800-£1200
- **Urgency:** Medium
- **Status:** Active
- **Interests:** None
- **Price:** £7.99

### 5. Roof Repair - Urgent

- **Posted by:** John Smith (London)
- **Category:** Roofing
- **Budget:** £1000-£1500
- **Urgency:** High
- **Status:** Active
- **Purchased by:** Oliver Davis
- **Price:** £14.99

---

## 💬 Quote Requests (3 requests)

### 1. Garden Decking Installation

- **Posted by:** Sarah Johnson (Manchester)
- **Category:** Carpentry
- **Budget:** £3000-£5000
- **Urgency:** Low
- **Responses:** 1 (James Anderson - £4200, Pending)

### 2. Central Heating System Upgrade ✅ ACCEPTED

- **Posted by:** Michael Brown (Birmingham)
- **Category:** Heating
- **Budget:** £5000-£8000
- **Urgency:** Medium
- **Responses:** 1 (David Wilson - £6800, Accepted)

### 3. Living Room Interior Painting

- **Posted by:** John Smith (London)
- **Category:** Painting
- **Budget:** £1000-£1500
- **Urgency:** Low
- **Responses:** None

---

## ⭐ Reviews (5 reviews)

### 1. Emma Thompson - 5 Stars

- **By:** Sarah Johnson
- **Job:** House Rewiring
- **Comment:** "Excellent work! Emma was professional, punctual, and the rewiring was completed to a very high standard. Highly recommend!"

### 2. David Wilson - 5 Stars

- **By:** John Smith
- **Job:** Kitchen Plumbing
- **Comment:** "David did an amazing job with our kitchen plumbing. Very knowledgeable and tidy. Would definitely use again."

### 3. James Anderson - 4 Stars

- **By:** Michael Brown
- **Job:** Custom Wardrobes
- **Comment:** "Good quality work on the wardrobes. Took a bit longer than expected but the final result is great."

### 4. David Wilson - 5 Stars

- **By:** Michael Brown
- **Comment:** "Fixed our bathroom leak quickly and efficiently. Great service!"

### 5. Emma Thompson - 5 Stars

- **By:** John Smith
- **Comment:** "Emma installed new lighting throughout our house. Professional and reasonably priced."

---

## 🧪 Testing Scenarios

### Scenario 1: Homeowner Posts a Job

1. Login as: `john.smith@example.com`
2. Create a new job lead
3. View posted jobs

### Scenario 2: Tradesperson Browses Jobs

1. Login as: `david.wilson@example.com`
2. Browse available job leads
3. Express interest or purchase a job lead

### Scenario 3: Homeowner Reviews Interests

1. Login as: `john.smith@example.com`
2. View job lead with interests (Kitchen Renovation)
3. Accept or reject interest from David Wilson

### Scenario 4: Quote Request Flow

1. Login as: `sarah.johnson@example.com`
2. View quote request (Garden Decking)
3. Review response from James Anderson

### Scenario 5: Tradesperson Responds to Quote

1. Login as: `james.anderson@example.com`
2. Browse quote requests
3. Submit a quote response

### Scenario 6: Review System

1. Login as: `sarah.johnson@example.com`
2. Submit a review for Emma Thompson
3. View tradesperson profile with reviews

---

## 📊 Database Statistics

- **Total Users:** 8 (3 homeowners, 5 tradespeople)
- **Total Job Leads:** 5
- **Total Quote Requests:** 3
- **Total Reviews:** 5
- **Active Jobs:** 5
- **Completed Jobs:** 1 (House Rewiring)
- **Total Interests:** 3
- **Total Quote Responses:** 2

---

## 🔄 Resetting Test Data

To reset and reseed the database:

```bash
npx ts-node prisma/seed.ts
```

This will:

1. Clear all existing data
2. Create fresh test data
3. Maintain the same test credentials

---

## 💡 Tips for Testing

1. **Login with different user types** to see role-based access control
2. **Test the credits system** by purchasing job leads as a tradesperson
3. **Test membership features** with different membership levels
4. **Test the interest system** by expressing interest and accepting/rejecting
5. **Test reviews** to see automatic rating calculations
6. **Test filters** on job leads and quote requests
7. **Test pagination** with limit and offset parameters

---

## 🔗 Quick API Test Commands

### Login as Homeowner

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.smith@example.com",
    "password": "password123"
  }'
```

### Login as Tradesperson

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "david.wilson@example.com",
    "password": "password123"
  }'
```

### Get All Job Leads

```bash
curl http://localhost:3000/api/jobs
```

### Get All Tradespeople

```bash
curl http://localhost:3000/api/users/tradespeople
```

---

**Happy Testing! 🎉**
