import { PrismaClient, UserType, UrgencyLevel, PaymentStatus, PaymentType, SubscriptionStatus, VerificationStatus, MembershipType, AccountStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ENHANCED database seed for testing new features...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.stripeCustomer.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.jobLead.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Hash password for all test users
  const passwordHash = await bcrypt.hash('Test@123', 10);

  // ============= CREATE ADMIN =============
  console.log('👑 Creating admin user...');
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@superfly.com',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      name: 'Super Admin',
    }
  });
  console.log(`✅ Admin created: ${admin.email}\n`);

  // ============= CREATE HOMEOWNERS =============
  console.log('🏠 Creating homeowners...');
  
  const homeowners = await Promise.all([
    // VERIFIED HOMEOWNER - For testing full job workflow
    prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+447700900001',
        passwordHash,
        type: UserType.homeowner,
        location: 'London, UK',
        workPostcode: 'SW1A 1AA',
        latitude: 51.5074,
        longitude: -0.1278,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        verificationStatus: VerificationStatus.verified,
      }
    }),
    // HOMEOWNER with multiple active jobs
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+447700900002',
        passwordHash,
        type: UserType.homeowner,
        location: 'Manchester, UK',
        workPostcode: 'M1 1AA',
        latitude: 53.4808,
        longitude: -2.2426,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        verificationStatus: VerificationStatus.verified,
      }
    }),
    // HOMEOWNER for testing job completion workflow
    prisma.user.create({
      data: {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+447700900003',
        passwordHash,
        type: UserType.homeowner,
        location: 'Birmingham, UK',
        workPostcode: 'B1 1AA',
        latitude: 52.4862,
        longitude: -1.8904,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        verificationStatus: VerificationStatus.verified,
      }
    }),
    // UNVERIFIED EMAIL - For testing email verification gate
    prisma.user.create({
      data: {
        name: 'Emily Davis (Unverified)',
        email: 'emily.unverified@email.com',
        phone: '+447700900004',
        passwordHash,
        type: UserType.homeowner,
        location: 'Leeds, UK',
        workPostcode: 'LS1 1AA',
        latitude: 53.8008,
        longitude: -1.5491,
        isEmailVerified: false,
        emailVerificationToken: 'test-verification-token-123',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        accountStatus: AccountStatus.active,
        verificationStatus: VerificationStatus.pending,
      }
    }),
  ]);
  console.log(`✅ Created ${homeowners.length} homeowners\n`);

  // ============= CREATE TRADESPEOPLE =============
  console.log('👷 Creating tradespeople...');

  const tradespeople = await Promise.all([
    // PREMIUM TRADESPERSON - Full features for testing quote workflow
    prisma.user.create({
      data: {
        name: 'James Wilson - Elite Plumbing',
        email: 'james.wilson@tradesperson.com',
        phone: '+447700800001',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        location: 'London, UK',
        workPostcode: 'W1K 3DE',
        jobRadius: 25,
        latitude: 51.5074,
        longitude: -0.1278,
        trades: ['Plumber', 'Gas Engineer', 'Heating Engineer'],
        rating: 4.9,
        reviews: 127,
        verified: true,
        credits: 250.00,
        membershipType: MembershipType.premium,
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { 
          centerLocation: 'W1K 3DE',
          radius: 25,
          unit: 'miles',
          coordinates: { lat: 51.5074, lng: -0.1278 }
        },
        hasDirectoryListing: true,
        directoryListingExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    }),
    // TRADESPERSON for testing quote ACCEPTANCE notifications
    prisma.user.create({
      data: {
        name: 'Robert Taylor - Spark Electrical',
        email: 'robert.taylor@tradesperson.com',
        phone: '+447700800002',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        location: 'Manchester, UK',
        workPostcode: 'M1 1AA',
        jobRadius: 30,
        latitude: 53.4808,
        longitude: -2.2426,
        trades: ['Electrician', 'Security System Installer'],
        rating: 4.8,
        reviews: 89,
        verified: true,
        credits: 175.50,
        membershipType: MembershipType.premium,
        membershipExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { 
          centerLocation: 'M1 1AA',
          radius: 30,
          unit: 'miles',
          coordinates: { lat: 53.4808, lng: -2.2426 }
        },
        hasDirectoryListing: true,
        directoryListingExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    }),
    // VIP UNLIMITED MEMBER - For testing free job purchases
    prisma.user.create({
      data: {
        name: 'William Anderson - Master Builders',
        email: 'william.anderson@tradesperson.com',
        phone: '+447700800003',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        location: 'Birmingham, UK',
        workPostcode: 'B1 1AA',
        jobRadius: 40,
        latitude: 52.4862,
        longitude: -1.8904,
        trades: ['Builder', 'Extension Builder', 'Bricklayer'],
        rating: 4.7,
        reviews: 156,
        verified: true,
        credits: 500.00,
        membershipType: MembershipType.unlimited_5_year,
        membershipExpiry: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        hasDirectoryListing: true,
        directoryListingExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        workingArea: { 
          centerLocation: 'B1 1AA',
          radius: 40,
          unit: 'miles',
          coordinates: { lat: 52.4862, lng: -1.8904 }
        },
      }
    }),
    // NO SUBSCRIPTION - For testing subscription gate
    prisma.user.create({
      data: {
        name: 'No Subscription Tradesperson',
        email: 'no.subscription@tradesperson.com',
        phone: '+447700800004',
        passwordHash,
        type: UserType.tradesperson,
        location: 'London, UK',
        workPostcode: 'W1K 3DE',
        jobRadius: 25,
        latitude: 51.5074,
        longitude: -0.1278,
        trades: ['Plumber', 'Electrician', 'Builder'],
        rating: 4.5,
        reviews: 20,
        verified: true,
        credits: 100.00,
        membershipType: MembershipType.none,
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        hasDirectoryListing: false,
        workingArea: { 
          centerLocation: 'W1K 3DE',
          radius: 25,
          unit: 'miles',
          coordinates: { lat: 51.5074, lng: -0.1278 }
        },
      }
    }),
  ]);
  console.log(`✅ Created ${tradespeople.length} tradespeople\n`);

  // ============= CREATE JOB LEADS =============
  console.log('📋 Creating job leads for testing new features...');

  const jobLeads = await Promise.all([
    // JOB 1: ACTIVE - No tradesperson hired yet (Test: Homeowner can see, accept quotes)
    prisma.jobLead.create({
      data: {
        title: 'Kitchen Renovation - Complete Remodel',
        description: 'Looking for a professional to completely renovate our kitchen.',
        category: 'Kitchen Fitter',
        location: 'London, UK',
        postcode: 'SW1A 1AA',
        latitude: 51.5200,
        longitude: -0.1150,
        budget: '£10,000 - £25,000',
        urgency: UrgencyLevel.Medium,
        postedBy: homeowners[0].id,
        contactDetails: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+447700900001',
        },
        maxPurchases: 6,
        price: 14.99,
        isActive: true,
        interests: [
          {
            id: 'interest-001',
            tradespersonId: tradespeople[0].id,
            tradespersonName: 'James Wilson - Elite Plumbing',
            message: 'Hi, I would love to help with your kitchen renovation!',
            price: 12000,
            date: new Date().toISOString(),
            status: 'pending',
          }
        ],
        purchasedBy: [tradespeople[0].id],
      }
    }),
    // JOB 2: WITH HIRED TRADESPERSON + ACTIVE (Test: "Work in Progress" status)
    prisma.jobLead.create({
      data: {
        title: 'Emergency Boiler Repair',
        description: 'Boiler has stopped working. Need urgent repair.',
        category: 'Plumber',
        location: 'Manchester, UK',
        postcode: 'M1 1AA',
        latitude: 53.4750,
        longitude: -2.2500,
        budget: '£500 - £1,000',
        urgency: UrgencyLevel.High,
        postedBy: homeowners[1].id,
        contactDetails: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+447700900002',
        },
        maxPurchases: 4,
        price: 9.99,
        isActive: true,
        hiredTradesperson: tradespeople[0].id,
        purchasedBy: [tradespeople[0].id],
        interests: [
          {
            id: 'interest-002',
            tradespersonId: tradespeople[0].id,
            tradespersonName: 'James Wilson - Elite Plumbing',
            message: 'I can fix this today. I am Gas Safe registered.',
            price: 85,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'accepted',
          }
        ],
      }
    }),
    // JOB 3: COMPLETED (isActive = false, hiredTradesperson = set) (Test: "Job Completed" + Review button)
    prisma.jobLead.create({
      data: {
        title: 'Full House Rewiring - COMPLETED',
        description: 'Victorian terraced house needs complete rewiring. THIS JOB IS COMPLETE.',
        category: 'Electrician',
        location: 'Birmingham, UK',
        postcode: 'B1 1AA',
        latitude: 52.4900,
        longitude: -1.8800,
        budget: '£5,000 - £10,000',
        urgency: UrgencyLevel.Medium,
        postedBy: homeowners[2].id,
        contactDetails: {
          name: 'Michael Brown',
          email: 'michael.brown@email.com',
          phone: '+447700900003',
        },
        maxPurchases: 5,
        price: 12.99,
        isActive: false,
        hiredTradesperson: tradespeople[1].id,
        purchasedBy: [tradespeople[1].id],
        interests: [
          {
            id: 'interest-003',
            tradespersonId: tradespeople[1].id,
            tradespersonName: 'Robert Taylor - Spark Electrical',
            message: 'Victorian properties are my specialty!',
            price: 5500,
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'accepted',
          }
        ],
      }
    }),
    // JOB 4: CANCELLED (isActive = false, hiredTradesperson = null) (Test: "Cancelled" status)
    prisma.jobLead.create({
      data: {
        title: 'Garden Landscaping - CANCELLED',
        description: 'This job was cancelled by the homeowner.',
        category: 'Landscaper',
        location: 'Leeds, UK',
        postcode: 'LS1 1AA',
        latitude: 53.7950,
        longitude: -1.5500,
        budget: '£5,000 - £10,000',
        urgency: UrgencyLevel.Low,
        postedBy: homeowners[0].id,
        contactDetails: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+447700900001',
        },
        maxPurchases: 6,
        price: 11.99,
        isActive: false,
        cancelledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }
    }),
    // JOB 5: ACTIVE - For testing new tradesperson interests
    prisma.jobLead.create({
      data: {
        title: 'Security System Installation',
        description: 'Need to install CCTV cameras and alarm system.',
        category: 'Security System Installer',
        location: 'London, UK',
        postcode: 'SW1A 1AA',
        latitude: 51.5100,
        longitude: -0.1300,
        budget: '£1,000 - £5,000',
        urgency: UrgencyLevel.Medium,
        postedBy: homeowners[0].id,
        contactDetails: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+447700900001',
        },
        maxPurchases: 5,
        price: 10.99,
        isActive: true,
      }
    }),
  ]);
  console.log(`✅ Created ${jobLeads.length} job leads\n`);

  // ============= CREATE QUOTE REQUESTS =============
  console.log('💬 Creating quote requests for testing acceptance workflow...');

  const quoteRequests = await Promise.all([
    // QUOTE REQUEST with PENDING response (Test: Accept Quote flow)
    prisma.quoteRequest.create({
      data: {
        homeownerId: homeowners[0].id,
        homeownerName: 'John Smith',
        projectTitle: 'Bathroom Renovation Quote',
        projectDescription: 'Looking for quotes to renovate our main bathroom.',
        category: 'Bathroom Fitter',
        location: 'London, UK',
        budget: '£3,000 - £5,000',
        urgency: UrgencyLevel.Medium,
        contactDetails: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+447700900001',
        },
        responses: [
          {
            id: 'quote-resp-001',
            tradespersonId: tradespeople[0].id,
            tradespersonName: 'James Wilson - Elite Plumbing',
            quotedPrice: 4500,
            description: 'I can complete the full bathroom renovation including new fixtures.',
            timeline: '2-3 weeks',
            createdAt: new Date().toISOString(),
            status: 'pending',
          },
          {
            id: 'quote-resp-002',
            tradespersonId: tradespeople[1].id,
            tradespersonName: 'Robert Taylor - Spark Electrical',
            quotedPrice: 4200,
            description: 'I can handle the electrical work for the bathroom.',
            timeline: '1-2 weeks',
            createdAt: new Date().toISOString(),
            status: 'pending',
          }
        ],
      }
    }),
    // QUOTE REQUEST with ACCEPTED response (Test: Contact details visible)
    prisma.quoteRequest.create({
      data: {
        homeownerId: homeowners[1].id,
        homeownerName: 'Sarah Johnson',
        projectTitle: 'Boiler Service Quote',
        projectDescription: 'Annual boiler service required.',
        category: 'Gas Engineer',
        location: 'Manchester, UK',
        budget: 'Under £500',
        urgency: UrgencyLevel.Low,
        contactDetails: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+447700900002',
        },
        responses: [
          {
            id: 'quote-resp-003',
            tradespersonId: tradespeople[0].id,
            tradespersonName: 'James Wilson - Elite Plumbing',
            quotedPrice: 85,
            description: 'Annual boiler service including gas safety certificate.',
            timeline: '1-2 hours',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'accepted',
          }
        ],
      }
    }),
  ]);
  console.log(`✅ Created ${quoteRequests.length} quote requests\n`);

  // ============= CREATE REVIEWS =============
  console.log('⭐ Creating reviews...');

  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        jobId: jobLeads[2].id,
        tradespersonId: tradespeople[1].id,
        homeownerId: homeowners[2].id,
        rating: 5,
        comment: 'Excellent rewiring job! Robert explained everything clearly and the work was completed on time. Highly recommend!',
      }
    }),
    prisma.review.create({
      data: {
        jobId: jobLeads[1].id,
        tradespersonId: tradespeople[0].id,
        homeownerId: homeowners[1].id,
        rating: 5,
        comment: 'James arrived within the hour and fixed our boiler quickly. Very professional and fair pricing.',
      }
    }),
  ]);
  console.log(`✅ Created ${reviews.length} reviews\n`);

  // ============= CREATE CONVERSATIONS =============
  console.log('💭 Creating conversations...');

  const conversation1 = await prisma.conversation.create({
    data: {
      jobId: jobLeads[1].id,
      jobTitle: jobLeads[1].title,
      homeownerId: homeowners[1].id,
      tradespersonId: tradespeople[0].id,
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        senderId: tradespeople[0].id,
        senderName: 'James Wilson - Elite Plumbing',
        content: 'Hi Sarah, I can come out today to look at your boiler. I am Gas Safe registered.',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderId: homeowners[1].id,
        senderName: 'Sarah Johnson',
        content: 'That would be great! Please come as soon as you can.',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderId: tradespeople[0].id,
        senderName: 'James Wilson - Elite Plumbing',
        content: 'On my way now! Should be there in about 30 minutes.',
        read: false,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      },
    ]
  });

  console.log('✅ Created conversations with messages\n');

  // ============= SUMMARY =============
  console.log('═══════════════════════════════════════════════════════════');
  console.log('        🎉 ENHANCED SEED FOR NEW FEATURES COMPLETED! 🎉     ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📊 DATA SUMMARY:');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   👑 Admin:           1`);
  console.log(`   🏠 Homeowners:      ${homeowners.length}`);
  console.log(`   👷 Tradespeople:    ${tradespeople.length}`);
  console.log(`   📋 Job Leads:       ${jobLeads.length}`);
  console.log(`   💬 Quote Requests:  ${quoteRequests.length}`);
  console.log(`   ⭐ Reviews:         ${reviews.length}`);
  console.log(`   💭 Conversations:   1`);
  console.log('────────────────────────────────────────────────────────────\n');

  console.log('🔐 TEST CREDENTIALS (Password for all: Test@123):');
  console.log('────────────────────────────────────────────────────────────');
  console.log('   ADMIN: admin@superfly.com / Admin@123');
  console.log('');
  console.log('   HOMEOWNERS:');
  console.log('     • john.smith@email.com       - Has 3 jobs (Active, Cancelled)');
  console.log('     • sarah.johnson@email.com    - Has Work in Progress job');
  console.log('     • michael.brown@email.com    - Has COMPLETED job (can leave review)');
  console.log('     • emily.unverified@email.com - UNVERIFIED EMAIL (cannot login)');
  console.log('');
  console.log('   TRADESPEOPLE:');
  console.log('     • james.wilson@tradesperson.com    - Premium, has quotes');
  console.log('     • robert.taylor@tradesperson.com   - Premium, has accepted quote');
  console.log('     • william.anderson@tradesperson.com- VIP Unlimited, free jobs');
  console.log('     • no.subscription@tradesperson.com - NO SUBSCRIPTION (blocked)');
  console.log('────────────────────────────────────────────────────────────\n');

  console.log('🧪 NEW FEATURES TO TEST:');
  console.log('────────────────────────────────────────────────────────────');
  console.log('');
  console.log('   1. HOMEOWNER JOB VISIBILITY:');
  console.log('      ✓ Login: john.smith@email.com');
  console.log('      ✓ Go to Profile > My Projects');
  console.log('      ✓ Should see: Kitchen Renovation (Active)');
  console.log('      ✓ Should see: Garden Landscaping (Cancelled)');
  console.log('      ✓ Should see: Security System (Active)');
  console.log('');
  console.log('   2. JOB STATUS STATES:');
  console.log('      ✓ Login: sarah.johnson@email.com');
  console.log('      ✓ See "Work in Progress" status (blue)');
  console.log('      ✓ Click "Mark as Complete" -> status changes to "Completed"');
  console.log('      ✓ Login: michael.brown@email.com');
  console.log('      ✓ See "Job Completed" status (green) + Review button');
  console.log('');
  console.log('   3. QUOTE ACCEPTANCE & NOTIFICATIONS:');
  console.log('      ✓ Login: john.smith@email.com');
  console.log('      ✓ Go to Quote Requests > "Bathroom Renovation Quote"');
  console.log('      ✓ Accept quote from James Wilson');
  console.log('      ✓ Check backend logs for EMAIL/SMS notification');
  console.log('      ✓ After acceptance, tradesperson contact details visible');
  console.log('');
  console.log('   4. CONTACT DETAILS REVEAL:');
  console.log('      ✓ Login: sarah.johnson@email.com');
  console.log('      ✓ Go to Quote Requests > "Boiler Service Quote"');
  console.log('      ✓ This quote is ACCEPTED');
  console.log('      ✓ Should see James Wilson phone/email');
  console.log('');
  console.log('   5. UK POSTCODE VALIDATION:');
  console.log('      ✓ Try registering with invalid postcode (e.g., "12345")');
  console.log('      ✓ Should see "Invalid UK postcode" error');
  console.log('      ✓ Try valid postcodes: SW1A 1AA, M1 1AA, B1 1AA');
  console.log('');
  console.log('   6. EMAIL VERIFICATION:');
  console.log('      ✓ Try login: emily.unverified@email.com');
  console.log('      ✓ Should see "Please verify your email" error');
  console.log('');
  console.log('   7. JOB LEADS FILTER:');
  console.log('      ✓ Login: james.wilson@tradesperson.com');
  console.log('      ✓ Go to Job Leads page');
  console.log('      ✓ Select category filter -> API refetches with filter');
  console.log('────────────────────────────────────────────────────────────\n');

  console.log('✅ Enhanced seed complete! Test all features above.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
