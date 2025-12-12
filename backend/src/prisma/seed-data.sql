-- ============================================
-- SUPERFLY TRADESPEOPLE - TEST DATA SEED
-- ============================================
-- Run this SQL file to populate the database with test data
-- Password for all test users: Test@123 (hashed below)
-- Admin password: Admin@123

-- Clear existing data (run in order due to foreign keys)
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM reviews;
DELETE FROM subscriptions;
DELETE FROM payments;
DELETE FROM stripe_customers;
DELETE FROM quote_requests;
DELETE FROM job_leads;
DELETE FROM admins;
DELETE FROM users;

-- ============================================
-- ADMIN USER
-- ============================================
INSERT INTO admins (id, email, password_hash, name, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@superfly.com',
  '$2b$10$8KxE5dZ6nG2MxM7M9K5Xku3yL8qT6vW4nJ9pR2sH1gF3bC7dA0eIi', -- Admin@123
  'Super Admin',
  NOW(),
  NOW()
);

-- ============================================
-- HOMEOWNERS
-- ============================================
-- Password hash for 'Test@123': $2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh

INSERT INTO users (id, name, email, phone, password_hash, type, location, latitude, longitude, is_email_verified, has_directory_access, directory_subscription_expiry, account_status, created_at, updated_at)
VALUES
  ('h0000000-0000-0000-0000-000000000001', 'John Smith', 'john.smith@email.com', '+447700900001', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'homeowner', 'London, UK', 51.5074, -0.1278, true, true, NOW() + INTERVAL '30 days', 'active', NOW(), NOW()),
  ('h0000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'sarah.johnson@email.com', '+447700900002', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'homeowner', 'Manchester, UK', 53.4808, -2.2426, true, false, NULL, 'active', NOW(), NOW()),
  ('h0000000-0000-0000-0000-000000000003', 'Michael Brown', 'michael.brown@email.com', '+447700900003', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'homeowner', 'Birmingham, UK', 52.4862, -1.8904, true, true, NOW() + INTERVAL '15 days', 'active', NOW(), NOW()),
  ('h0000000-0000-0000-0000-000000000004', 'Emily Davis', 'emily.davis@email.com', '+447700900004', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'homeowner', 'Leeds, UK', 53.8008, -1.5491, false, false, NULL, 'active', NOW(), NOW()),
  ('h0000000-0000-0000-0000-000000000005', 'David Wilson', 'david.wilson@email.com', '+447700900005', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'homeowner', 'Bristol, UK', 51.4545, -2.5879, true, true, NOW() + INTERVAL '60 days', 'active', NOW(), NOW());

-- ============================================
-- TRADESPEOPLE
-- ============================================
INSERT INTO users (id, name, email, phone, password_hash, type, avatar, location, latitude, longitude, trades, rating, reviews, verified, credits, membership_type, membership_expiry, verification_status, is_email_verified, account_status, working_area, created_at, updated_at)
VALUES
  -- Premium Verified Tradespeople
  ('t0000000-0000-0000-0000-000000000001', 'James Wilson - Elite Plumbing', 'james.wilson@tradesperson.com', '+447700800001', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'London, UK', 51.5074, -0.1278, ARRAY['Plumber', 'Gas Engineer', 'Heating Engineer'], 4.90, 127, true, 250.00, 'premium', NOW() + INTERVAL '365 days', 'verified', true, 'active', '{"radius": 25, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000002', 'Robert Taylor - Spark Electrical', 'robert.taylor@tradesperson.com', '+447700800002', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Manchester, UK', 53.4808, -2.2426, ARRAY['Electrician', 'Security System Installer'], 4.80, 89, true, 175.50, 'premium', NOW() + INTERVAL '300 days', 'verified', true, 'active', '{"radius": 30, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000003', 'William Anderson - Master Builders', 'william.anderson@tradesperson.com', '+447700800003', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Birmingham, UK', 52.4862, -1.8904, ARRAY['Builder', 'Extension Builder', 'Bricklayer'], 4.70, 156, true, 500.00, 'unlimited_5_year', NOW() + INTERVAL '1825 days', 'verified', true, 'active', '{"radius": 40, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000004', 'Thomas Martin - Perfect Painting', 'thomas.martin@tradesperson.com', '+447700800004', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Leeds, UK', 53.8008, -1.5491, ARRAY['Painter & Decorator', 'Plasterer'], 4.60, 67, true, 75.00, 'basic', NOW() + INTERVAL '180 days', 'verified', true, 'active', '{"radius": 15, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000005', 'Christopher White - Kitchen Dreams', 'christopher.white@tradesperson.com', '+447700800005', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'Bristol, UK', 51.4545, -2.5879, ARRAY['Kitchen Fitter', 'Cabinet Maker', 'Carpenter & Joiner'], 4.90, 203, true, 350.00, 'premium', NOW() + INTERVAL '400 days', 'verified', true, 'active', '{"radius": 35, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000006', 'Daniel Harris - Harris Roofing', 'daniel.harris@tradesperson.com', '+447700800006', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', NULL, 'Liverpool, UK', 53.4084, -2.9916, ARRAY['Roofer', 'Guttering Installer', 'Fascias & Soffits Installer'], 4.50, 34, false, 50.00, 'basic', NOW() + INTERVAL '90 days', 'pending', true, 'active', '{"radius": 20, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000007', 'Matthew Clark - Green Gardens', 'matthew.clark@tradesperson.com', '+447700800007', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', NULL, 'Sheffield, UK', 53.3811, -1.4701, ARRAY['Gardener', 'Landscaper', 'Fencer', 'Decking Installer'], 4.40, 45, true, 125.00, 'basic', NOW() + INTERVAL '200 days', 'verified', true, 'active', '{"radius": 25, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000008', 'Andrew Lewis - Tile Pro', 'andrew.lewis@tradesperson.com', '+447700800008', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'Newcastle, UK', 54.9783, -1.6178, ARRAY['Tiler', 'Bathroom Fitter', 'Flooring Fitter'], 4.70, 78, true, 200.00, 'premium', NOW() + INTERVAL '350 days', 'verified', true, 'active', '{"radius": 30, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000009', 'Joseph Walker - Walker Windows', 'joseph.walker@tradesperson.com', '+447700800009', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', NULL, 'Edinburgh, UK', 55.9533, -3.1883, ARRAY['Window Fitter', 'Door Fitter', 'Glazier', 'Conservatory Installer'], 4.60, 92, true, 180.00, 'premium', NOW() + INTERVAL '280 days', 'verified', true, 'active', '{"radius": 40, "unit": "miles"}', NOW(), NOW()),
  
  ('t0000000-0000-0000-0000-000000000010', 'Charles Robinson - Quick Locksmith', 'charles.robinson@tradesperson.com', '+447700800010', '$2b$10$5QzE3dY5mF1LxL6L8J4Wju2xK7qS5uV3mI8oQ1rG0fE2aC6cZ9dHh', 'tradesperson', NULL, 'Glasgow, UK', 55.8642, -4.2518, ARRAY['Locksmith', 'Security System Installer'], 4.80, 156, true, 300.00, 'premium', NOW() + INTERVAL '365 days', 'verified', true, 'active', '{"radius": 50, "unit": "miles"}', NOW(), NOW());

-- ============================================
-- JOB LEADS
-- ============================================
INSERT INTO job_leads (id, title, description, category, location, latitude, longitude, budget, urgency, posted_by, contact_details, max_purchases, price, is_active, created_at, updated_at)
VALUES
  ('j0000000-0000-0000-0000-000000000001', 'Kitchen Renovation - Complete Remodel', 'Looking for a professional to completely renovate our kitchen. This includes removing old cabinets, installing new ones, fitting a new sink, and tiling the backsplash. The kitchen is approximately 15 square meters.', 'Kitchen Fitter', 'London, UK', 51.5200, -0.1150, '£10,000 - £25,000', 'Medium', 'h0000000-0000-0000-0000-000000000001', '{"name": "John Smith", "email": "john.smith@email.com", "phone": "+447700900001"}', 6, 14.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000002', 'Emergency Boiler Repair', 'Our boiler has stopped working and we have no hot water or heating. Need an urgent repair or replacement. Boiler is a Worcester Bosch, about 8 years old.', 'Plumber', 'Manchester, UK', 53.4750, -2.2500, '£500 - £1,000', 'High', 'h0000000-0000-0000-0000-000000000002', '{"name": "Sarah Johnson", "email": "sarah.johnson@email.com", "phone": "+447700900002"}', 4, 9.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000003', 'Full House Rewiring', 'Victorian terraced house needs complete rewiring. 3 bedrooms, 2 reception rooms, kitchen, and bathroom. Consumer unit also needs upgrading to meet current regulations.', 'Electrician', 'Birmingham, UK', 52.4900, -1.8800, '£5,000 - £10,000', 'Medium', 'h0000000-0000-0000-0000-000000000003', '{"name": "Michael Brown", "email": "michael.brown@email.com", "phone": "+447700900003"}', 5, 12.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000004', 'Garden Landscaping Project', 'Large garden needs complete landscaping. Looking for new lawn, patio area, raised flower beds, and possibly a small water feature. Garden is approximately 200 square meters.', 'Landscaper', 'Leeds, UK', 53.7950, -1.5500, '£5,000 - £10,000', 'Low', 'h0000000-0000-0000-0000-000000000004', '{"name": "Emily Davis", "email": "emily.davis@email.com", "phone": "+447700900004"}', 6, 11.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000005', 'Bathroom Fitting - En-Suite', 'Converting a small bedroom into an en-suite bathroom. Need full plumbing, tiling, shower installation, toilet, and sink. Approximately 4 square meters.', 'Bathroom Fitter', 'Bristol, UK', 51.4600, -2.5900, '£5,000 - £10,000', 'Medium', 'h0000000-0000-0000-0000-000000000005', '{"name": "David Wilson", "email": "david.wilson@email.com", "phone": "+447700900005"}', 5, 10.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000006', 'Single Storey Extension', 'Planning permission approved for 4m x 6m single storey rear extension. Need builders to complete the full build including foundations, walls, roof, and basic interior finishing.', 'Extension Builder', 'London, UK', 51.5300, -0.0900, 'Over £25,000', 'Low', 'h0000000-0000-0000-0000-000000000001', '{"name": "John Smith", "email": "john.smith@email.com", "phone": "+447700900001"}', 4, 24.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000007', 'Interior Painting - Whole House', '4 bedroom detached house needs full interior painting. All rooms including hallways and staircase. Walls and ceilings. We will provide the paint.', 'Painter & Decorator', 'Sheffield, UK', 53.3900, -1.4700, '£1,000 - £5,000', 'Low', 'h0000000-0000-0000-0000-000000000002', '{"name": "Sarah Johnson", "email": "sarah.johnson@email.com", "phone": "+447700900002"}', 6, 8.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000008', 'Roof Repair - Storm Damage', 'Several tiles blown off during recent storm. Some potential water damage to the felt underneath. Need urgent assessment and repair before more rain.', 'Roofer', 'Liverpool, UK', 53.4100, -2.9800, '£500 - £1,000', 'High', 'h0000000-0000-0000-0000-000000000003', '{"name": "Michael Brown", "email": "michael.brown@email.com", "phone": "+447700900003"}', 4, 9.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000009', 'New Driveway Installation', 'Replace existing cracked concrete driveway with block paving. Driveway is approximately 40 square meters. Would like a decorative border.', 'Driveways Installer', 'Edinburgh, UK', 55.9500, -3.1900, '£5,000 - £10,000', 'Low', 'h0000000-0000-0000-0000-000000000004', '{"name": "Emily Davis", "email": "emily.davis@email.com", "phone": "+447700900004"}', 5, 12.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000010', 'Security System Installation', 'Looking to install a comprehensive home security system including CCTV cameras (4-6), alarm system, and smart doorbell. Prefer a system that can be monitored via smartphone.', 'Security System Installer', 'Glasgow, UK', 55.8600, -4.2500, '£1,000 - £5,000', 'Medium', 'h0000000-0000-0000-0000-000000000005', '{"name": "David Wilson", "email": "david.wilson@email.com", "phone": "+447700900005"}', 5, 10.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000011', 'Gas Boiler Service and Safety Check', 'Annual boiler service required. Boiler is a Vaillant ecoTEC plus, installed 3 years ago. Need gas safety certificate for rental property.', 'Gas Engineer', 'London, UK', 51.5100, -0.1300, 'Under £500', 'Medium', 'h0000000-0000-0000-0000-000000000001', '{"name": "John Smith", "email": "john.smith@email.com", "phone": "+447700900001"}', 4, 7.99, true, NOW(), NOW()),
  
  ('j0000000-0000-0000-0000-000000000012', 'Loft Conversion - 2 Bedrooms', 'Want to convert our loft into 2 bedrooms with a shared bathroom. Looking for a full design and build service. Roof height is good, approximately 2.4m at the highest point.', 'Loft Conversion Company', 'Manchester, UK', 53.4700, -2.2400, 'Over £25,000', 'Low', 'h0000000-0000-0000-0000-000000000002', '{"name": "Sarah Johnson", "email": "sarah.johnson@email.com", "phone": "+447700900002"}', 3, 29.99, true, NOW(), NOW());

-- ============================================
-- QUOTE REQUESTS
-- ============================================
INSERT INTO quote_requests (id, homeowner_id, homeowner_name, project_title, project_description, category, location, budget, urgency, contact_details, max_responses, created_at, updated_at)
VALUES
  ('q0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 'John Smith', 'Conservatory Cleaning', 'Looking for quotes to professionally clean our conservatory. The conservatory is approximately 4m x 3m with a polycarbonate roof.', 'Handyman', 'London, UK', 'Under £500', 'Low', '{"name": "John Smith", "email": "john.smith@email.com", "phone": "+447700900001"}', 5, NOW(), NOW()),
  
  ('q0000000-0000-0000-0000-000000000002', 'h0000000-0000-0000-0000-000000000003', 'Michael Brown', 'Tree Removal', 'Large oak tree in back garden needs removing. The tree is approximately 15 meters tall and overhanging neighboring property.', 'Tree Surgeon', 'Birmingham, UK', '£500 - £1,000', 'Medium', '{"name": "Michael Brown", "email": "michael.brown@email.com", "phone": "+447700900003"}', 5, NOW(), NOW()),
  
  ('q0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000005', 'David Wilson', 'Chimney Repair and Repointing', 'Chimney stack needs repointing and a new chimney pot. Some bricks are loose and mortar is crumbling.', 'Chimney Repair Specialist', 'Bristol, UK', '£500 - £1,000', 'High', '{"name": "David Wilson", "email": "david.wilson@email.com", "phone": "+447700900005"}', 5, NOW(), NOW());

-- ============================================
-- REVIEWS
-- ============================================
INSERT INTO reviews (id, job_id, tradesperson_id, homeowner_id, rating, comment, created_at)
VALUES
  ('r0000000-0000-0000-0000-000000000001', 'j0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 5, 'Excellent service! James arrived on time and fixed our boiler issue within an hour. Very professional and clean. Highly recommend!', NOW() - INTERVAL '10 days'),
  
  ('r0000000-0000-0000-0000-000000000002', 'j0000000-0000-0000-0000-000000000011', 't0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000002', 5, 'Fantastic work on our heating system. James explained everything clearly and the price was very fair. Will definitely use again.', NOW() - INTERVAL '8 days'),
  
  ('r0000000-0000-0000-0000-000000000003', 'j0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000003', 4, 'Good job overall. Slight delay in arriving but the work itself was excellent quality.', NOW() - INTERVAL '5 days'),
  
  ('r0000000-0000-0000-0000-000000000004', 'j0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000002', 'h0000000-0000-0000-0000-000000000003', 5, 'Robert rewired our entire house and did an amazing job. Very neat work, all cables hidden properly. Passed inspection first time!', NOW() - INTERVAL '15 days'),
  
  ('r0000000-0000-0000-0000-000000000005', 'j0000000-0000-0000-0000-000000000010', 't0000000-0000-0000-0000-000000000002', 'h0000000-0000-0000-0000-000000000005', 5, 'Installed our security system perfectly. Showed us how to use the app and answered all our questions. Very patient and professional.', NOW() - INTERVAL '7 days'),
  
  ('r0000000-0000-0000-0000-000000000006', 'j0000000-0000-0000-0000-000000000006', 't0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000001', 5, 'William and his team built our extension to an incredibly high standard. Project came in on time and on budget. The finish is beautiful!', NOW() - INTERVAL '20 days'),
  
  ('r0000000-0000-0000-0000-000000000007', 'j0000000-0000-0000-0000-000000000012', 't0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000002', 4, 'Great loft conversion. Minor snagging issues but all resolved quickly. Happy with the final result.', NOW() - INTERVAL '12 days'),
  
  ('r0000000-0000-0000-0000-000000000008', 'j0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000005', 'h0000000-0000-0000-0000-000000000001', 5, 'Our new kitchen is absolutely stunning! Christopher has incredible attention to detail. Every cabinet is perfectly aligned.', NOW() - INTERVAL '3 days'),
  
  ('r0000000-0000-0000-0000-000000000009', 'j0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000005', 'h0000000-0000-0000-0000-000000000004', 5, 'Transformed our old kitchen into something from a magazine. Worth every penny. Highly recommend Kitchen Dreams!', NOW() - INTERVAL '6 days'),
  
  ('r0000000-0000-0000-0000-000000000010', 'j0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000008', 'h0000000-0000-0000-0000-000000000005', 5, 'Beautiful tiling work in our new bathroom. Andrew suggested some design improvements that made it even better. Very skilled craftsman.', NOW() - INTERVAL '4 days');

-- ============================================
-- CONVERSATIONS
-- ============================================
INSERT INTO conversations (id, job_id, job_title, homeowner_id, tradesperson_id, created_at, updated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'j0000000-0000-0000-0000-000000000001', 'Kitchen Renovation - Complete Remodel', 'h0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '3 days', NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'j0000000-0000-0000-0000-000000000002', 'Emergency Boiler Repair', 'h0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'j0000000-0000-0000-0000-000000000003', 'Full House Rewiring', 'h0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days', NOW());

-- ============================================
-- MESSAGES
-- ============================================
INSERT INTO messages (id, conversation_id, sender_id, sender_name, content, read, timestamp)
VALUES
  -- Conversation 1: Kitchen Renovation
  ('m0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000005', 'Christopher White - Kitchen Dreams', 'Hi John, I saw your kitchen renovation project and I''d love to help. I have over 15 years of experience with kitchen fitting. Would you be available for a site visit this week?', true, NOW() - INTERVAL '3 days'),
  ('m0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 'John Smith', 'Hi Christopher, thanks for reaching out. Yes, I''d be happy to arrange a site visit. Are you available Thursday afternoon?', true, NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
  ('m0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000005', 'Christopher White - Kitchen Dreams', 'Thursday at 2pm works perfectly for me. Could you send me your address? Also, do you have any design ideas in mind or would you like me to bring some suggestions?', true, NOW() - INTERVAL '2 days'),
  ('m0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 'John Smith', 'I''ll send the address in a private message. We''re thinking modern grey with white countertops, but open to suggestions. Do you supply the units or should we source them?', true, NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
  ('m0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000005', 'Christopher White - Kitchen Dreams', 'I can supply everything including units, worktops, and appliances at trade prices. I work with several suppliers so can match most budgets. I''ll bring some samples on Thursday.', false, NOW() - INTERVAL '1 day'),
  
  -- Conversation 2: Boiler Repair
  ('m0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'James Wilson - Elite Plumbing', 'Hi Sarah, I can come out today to look at your boiler. I''m Gas Safe registered and carry most common parts in my van. What''s your postcode?', true, NOW() - INTERVAL '1 day'),
  ('m0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 'h0000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'That would be amazing! We''re at M14 5RG. How soon could you get here?', true, NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'),
  ('m0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'James Wilson - Elite Plumbing', 'I can be there within the hour. My call-out fee is £60 which includes the first hour of labour. Parts will be extra if needed. Is that okay?', true, NOW() - INTERVAL '1 day' + INTERVAL '20 minutes'),
  ('m0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000002', 'h0000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'Yes, that''s fine. Please come as soon as you can. The boiler is a Worcester Bosch Greenstar 30i, about 8 years old. It just stopped working this morning.', true, NOW() - INTERVAL '1 day' + INTERVAL '25 minutes'),
  ('m0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'James Wilson - Elite Plumbing', 'On my way now. I''ve worked on many Worcester boilers so hopefully it''s a straightforward fix. See you soon!', true, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
  
  -- Conversation 3: Rewiring
  ('m0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000002', 'Robert Taylor - Spark Electrical', 'Hello Michael, I''ve reviewed your rewiring project. Victorian properties are my specialty - I''ve done dozens of similar jobs. Would you like me to visit for a detailed quote?', true, NOW() - INTERVAL '5 days'),
  ('m0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000003', 'Michael Brown', 'Yes please, Robert. The house was built in 1895 and I think some of the original wiring is still in place. When could you visit?', true, NOW() - INTERVAL '5 days' + INTERVAL '4 hours'),
  ('m0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000002', 'Robert Taylor - Spark Electrical', 'I''m free Saturday morning if that works? Original 1895 wiring would definitely need replacing. I can also check if there''s any dangerous DIY work that''s been done over the years.', true, NOW() - INTERVAL '4 days'),
  ('m0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000003', 'Michael Brown', 'Saturday 10am would be perfect. What should I expect cost-wise for a full rewire of a 3-bed Victorian terrace?', true, NOW() - INTERVAL '4 days' + INTERVAL '2 hours'),
  ('m0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000002', 'Robert Taylor - Spark Electrical', 'For a 3-bed Victorian, typically £4,500-£6,500 depending on complexity and finish. This includes all new cabling, consumer unit, sockets, switches, and certificate. I''ll give you an accurate quote after the survey.', false, NOW() - INTERVAL '3 days');

-- ============================================
-- PAYMENTS
-- ============================================
INSERT INTO payments (id, user_id, amount, currency, type, status, stripe_payment_id, description, metadata, created_at, updated_at)
VALUES
  ('p0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 9.99, 'gbp', 'job_lead_purchase', 'succeeded', 'pi_test_001', 'Job lead purchase: Emergency Boiler Repair', '{"jobLeadId": "j0000000-0000-0000-0000-000000000002"}', NOW() - INTERVAL '5 days', NOW()),
  ('p0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000003', 29.99, 'gbp', 'job_lead_purchase', 'succeeded', 'pi_test_002', 'Job lead purchase: Loft Conversion - 2 Bedrooms', '{"jobLeadId": "j0000000-0000-0000-0000-000000000012"}', NOW() - INTERVAL '4 days', NOW()),
  ('p0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000005', 14.99, 'gbp', 'job_lead_purchase', 'succeeded', 'pi_test_003', 'Job lead purchase: Kitchen Renovation - Complete Remodel', '{"jobLeadId": "j0000000-0000-0000-0000-000000000001"}', NOW() - INTERVAL '3 days', NOW()),
  ('p0000000-0000-0000-0000-000000000004', 'h0000000-0000-0000-0000-000000000001', 1.00, 'gbp', 'directory_subscription', 'succeeded', 'pi_test_004', 'Directory subscription - Monthly', NULL, NOW() - INTERVAL '15 days', NOW()),
  ('p0000000-0000-0000-0000-000000000005', 'h0000000-0000-0000-0000-000000000003', 1.00, 'gbp', 'directory_subscription', 'succeeded', 'pi_test_005', 'Directory subscription - Monthly', NULL, NOW() - INTERVAL '5 days', NOW()),
  ('p0000000-0000-0000-0000-000000000006', 't0000000-0000-0000-0000-000000000001', 100.00, 'gbp', 'credits_topup', 'succeeded', 'pi_test_006', 'Credits top-up: £100', NULL, NOW() - INTERVAL '10 days', NOW()),
  ('p0000000-0000-0000-0000-000000000007', 't0000000-0000-0000-0000-000000000003', 250.00, 'gbp', 'credits_topup', 'succeeded', 'pi_test_007', 'Credits top-up: £250', NULL, NOW() - INTERVAL '8 days', NOW()),
  ('p0000000-0000-0000-0000-000000000008', 't0000000-0000-0000-0000-000000000003', 999.00, 'gbp', 'membership_purchase', 'succeeded', 'pi_test_008', 'Unlimited 5-Year Membership', NULL, NOW() - INTERVAL '30 days', NOW()),
  ('p0000000-0000-0000-0000-000000000009', 't0000000-0000-0000-0000-000000000006', 50.00, 'gbp', 'credits_topup', 'failed', 'pi_test_009', 'Credits top-up: £50 (Failed)', NULL, NOW() - INTERVAL '2 days', NOW()),
  ('p0000000-0000-0000-0000-000000000010', 't0000000-0000-0000-0000-000000000004', 9.99, 'gbp', 'job_lead_purchase', 'refunded', 'pi_test_010', 'Job lead purchase (Refunded)', NULL, NOW() - INTERVAL '7 days', NOW());

-- Update the failed payment with failure reason
UPDATE payments SET failure_reason = 'Card declined - insufficient funds' WHERE id = 'p0000000-0000-0000-0000-000000000009';

-- Update the refunded payment with refund details
UPDATE payments SET refunded_amount = 9.99, refund_reason = 'Job cancelled by homeowner before any contact' WHERE id = 'p0000000-0000-0000-0000-000000000010';

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
INSERT INTO subscriptions (id, user_id, type, status, stripe_subscription_id, stripe_price_id, current_period_start, current_period_end, created_at, updated_at)
VALUES
  ('s0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 'directory_access', 'active', 'sub_test_001', 'price_directory_monthly', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW(), NOW()),
  ('s0000000-0000-0000-0000-000000000002', 'h0000000-0000-0000-0000-000000000003', 'directory_access', 'active', 'sub_test_002', 'price_directory_monthly', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW(), NOW()),
  ('s0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000005', 'directory_access', 'active', 'sub_test_003', 'price_directory_monthly', NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
  ('s0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000001', 'premium_membership', 'active', 'sub_test_004', 'price_premium_annual', NOW() - INTERVAL '100 days', NOW() + INTERVAL '265 days', NOW(), NOW()),
  ('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000002', 'premium_membership', 'active', 'sub_test_005', 'price_premium_annual', NOW() - INTERVAL '65 days', NOW() + INTERVAL '300 days', NOW(), NOW()),
  ('s0000000-0000-0000-0000-000000000006', 't0000000-0000-0000-0000-000000000003', 'unlimited_5_year', 'active', 'sub_test_006', 'price_unlimited_5year', NOW() - INTERVAL '30 days', NOW() + INTERVAL '1825 days', NOW(), NOW()),
  ('s0000000-0000-0000-0000-000000000007', 'h0000000-0000-0000-0000-000000000004', 'directory_access', 'cancelled', 'sub_test_007', 'price_directory_monthly', NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days', NOW(), NOW()),
  ('s0000000-0000-0000-0000-000000000008', 't0000000-0000-0000-0000-000000000004', 'basic_membership', 'active', 'sub_test_008', 'price_basic_annual', NOW() - INTERVAL '185 days', NOW() + INTERVAL '180 days', NOW(), NOW());

-- Update cancelled subscription
UPDATE subscriptions SET cancelled_at = NOW() - INTERVAL '20 days' WHERE id = 's0000000-0000-0000-0000-000000000007';

-- ============================================
-- STRIPE CUSTOMERS
-- ============================================
INSERT INTO stripe_customers (id, user_id, stripe_customer_id, created_at, updated_at)
VALUES
  ('sc000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 'cus_test_homeowner_001', NOW(), NOW()),
  ('sc000000-0000-0000-0000-000000000002', 'h0000000-0000-0000-0000-000000000003', 'cus_test_homeowner_002', NOW(), NOW()),
  ('sc000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', 'cus_test_tradesperson_001', NOW(), NOW()),
  ('sc000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000002', 'cus_test_tradesperson_002', NOW(), NOW()),
  ('sc000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000003', 'cus_test_tradesperson_003', NOW(), NOW());

-- ============================================
-- SUMMARY
-- ============================================
-- 
-- TEST CREDENTIALS:
-- ================
-- 
-- ADMIN:
--   Email: admin@superfly.com
--   Password: Admin@123
-- 
-- HOMEOWNERS (Password for all: Test@123):
--   1. john.smith@email.com - London [Directory Access]
--   2. sarah.johnson@email.com - Manchester
--   3. michael.brown@email.com - Birmingham [Directory Access]
--   4. emily.davis@email.com - Leeds (email not verified)
--   5. david.wilson@email.com - Bristol [Directory Access]
-- 
-- TRADESPEOPLE (Password for all: Test@123):
--   1. james.wilson@tradesperson.com - Plumber, Gas Engineer (London, Premium)
--   2. robert.taylor@tradesperson.com - Electrician (Manchester, Premium)
--   3. william.anderson@tradesperson.com - Builder (Birmingham, Unlimited 5-Year)
--   4. thomas.martin@tradesperson.com - Painter & Decorator (Leeds, Basic)
--   5. christopher.white@tradesperson.com - Kitchen Fitter (Bristol, Premium)
--   6. daniel.harris@tradesperson.com - Roofer (Liverpool, Basic, Pending Verification)
--   7. matthew.clark@tradesperson.com - Gardener, Landscaper (Sheffield, Basic)
--   8. andrew.lewis@tradesperson.com - Tiler, Bathroom Fitter (Newcastle, Premium)
--   9. joseph.walker@tradesperson.com - Window Fitter (Edinburgh, Premium)
--   10. charles.robinson@tradesperson.com - Locksmith (Glasgow, Premium)
-- 
-- LOCATIONS WITH COORDINATES:
--   London:     51.5074, -0.1278
--   Manchester: 53.4808, -2.2426
--   Birmingham: 52.4862, -1.8904
--   Leeds:      53.8008, -1.5491
--   Bristol:    51.4545, -2.5879
--   Liverpool:  53.4084, -2.9916
--   Sheffield:  53.3811, -1.4701
--   Newcastle:  54.9783, -1.6178
--   Edinburgh:  55.9533, -3.1883
--   Glasgow:    55.8642, -4.2518

