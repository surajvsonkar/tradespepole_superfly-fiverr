import { PrismaClient, UserType, UrgencyLevel, PaymentStatus, PaymentType, SubscriptionStatus, VerificationStatus, MembershipType, AccountStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

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
    prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+447700900001',
        passwordHash,
        type: UserType.homeowner,
        location: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        isEmailVerified: true,
        hasDirectoryAccess: true,
        directorySubscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        accountStatus: AccountStatus.active,
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+447700900002',
        passwordHash,
        type: UserType.homeowner,
        location: 'Manchester, UK',
        latitude: 53.4808,
        longitude: -2.2426,
        isEmailVerified: true,
        hasDirectoryAccess: false,
        accountStatus: AccountStatus.active,
      }
    }),
    prisma.user.create({
      data: {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+447700900003',
        passwordHash,
        type: UserType.homeowner,
        location: 'Birmingham, UK',
        latitude: 52.4862,
        longitude: -1.8904,
        isEmailVerified: true,
        hasDirectoryAccess: true,
        directorySubscriptionExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        accountStatus: AccountStatus.active,
      }
    }),
    prisma.user.create({
      data: {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+447700900004',
        passwordHash,
        type: UserType.homeowner,
        location: 'Leeds, UK',
        latitude: 53.8008,
        longitude: -1.5491,
        isEmailVerified: false,
        accountStatus: AccountStatus.active,
      }
    }),
    prisma.user.create({
      data: {
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '+447700900005',
        passwordHash,
        type: UserType.homeowner,
        location: 'Bristol, UK',
        latitude: 51.4545,
        longitude: -2.5879,
        isEmailVerified: true,
        hasDirectoryAccess: true,
        directorySubscriptionExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        accountStatus: AccountStatus.active,
      }
    }),
  ]);
  console.log(`✅ Created ${homeowners.length} homeowners\n`);

  // ============= CREATE TRADESPEOPLE =============
  console.log('👷 Creating tradespeople...');

  const tradespeople = await Promise.all([
    // Verified Premium Tradespeople
    prisma.user.create({
      data: {
        name: 'James Wilson - Elite Plumbing',
        email: 'james.wilson@tradesperson.com',
        phone: '+447700800001',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        location: 'London, UK',
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
        workingArea: { radius: 25, unit: 'miles' },
        verificationData: {
          idVerified: true,
          insuranceVerified: true,
          qualificationsVerified: true,
          gasRegistered: true,
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Robert Taylor - Spark Electrical',
        email: 'robert.taylor@tradesperson.com',
        phone: '+447700800002',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        location: 'Manchester, UK',
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
        workingArea: { radius: 30, unit: 'miles' },
        verificationData: {
          idVerified: true,
          insuranceVerified: true,
          qualificationsVerified: true,
          niciecCertified: true,
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'William Anderson - Master Builders',
        email: 'william.anderson@tradesperson.com',
        phone: '+447700800003',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        location: 'Birmingham, UK',
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
        workingArea: { radius: 40, unit: 'miles' },
        verificationData: {
          idVerified: true,
          insuranceVerified: true,
          qualificationsVerified: true,
          nhbcRegistered: true,
        }
      }
    }),
    
    // Basic Membership Tradespeople
    prisma.user.create({
      data: {
        name: 'Thomas Martin - Perfect Painting',
        email: 'thomas.martin@tradesperson.com',
        phone: '+447700800004',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        location: 'Leeds, UK',
        latitude: 53.8008,
        longitude: -1.5491,
        trades: ['Painter & Decorator', 'Plasterer'],
        rating: 4.6,
        reviews: 67,
        verified: true,
        credits: 75.00,
        membershipType: MembershipType.basic,
        membershipExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { radius: 15, unit: 'miles' },
      }
    }),
    prisma.user.create({
      data: {
        name: 'Christopher White - Kitchen Dreams',
        email: 'christopher.white@tradesperson.com',
        phone: '+447700800005',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
        location: 'Bristol, UK',
        latitude: 51.4545,
        longitude: -2.5879,
        trades: ['Kitchen Fitter', 'Cabinet Maker', 'Carpenter & Joiner'],
        rating: 4.9,
        reviews: 203,
        verified: true,
        credits: 350.00,
        membershipType: MembershipType.premium,
        membershipExpiry: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { radius: 35, unit: 'miles' },
      }
    }),
    
    // Newly Registered / Pending Verification
    prisma.user.create({
      data: {
        name: 'Daniel Harris - Harris Roofing',
        email: 'daniel.harris@tradesperson.com',
        phone: '+447700800006',
        passwordHash,
        type: UserType.tradesperson,
        location: 'Liverpool, UK',
        latitude: 53.4084,
        longitude: -2.9916,
        trades: ['Roofer', 'Guttering Installer', 'Fascias & Soffits Installer'],
        rating: 4.5,
        reviews: 34,
        verified: false,
        credits: 50.00,
        membershipType: MembershipType.basic,
        membershipExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.pending,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { radius: 20, unit: 'miles' },
      }
    }),
    prisma.user.create({
      data: {
        name: 'Matthew Clark - Green Gardens',
        email: 'matthew.clark@tradesperson.com',
        phone: '+447700800007',
        passwordHash,
        type: UserType.tradesperson,
        location: 'Sheffield, UK',
        latitude: 53.3811,
        longitude: -1.4701,
        trades: ['Gardener', 'Landscaper', 'Fencer', 'Decking Installer'],
        rating: 4.4,
        reviews: 45,
        verified: true,
        credits: 125.00,
        membershipType: MembershipType.basic,
        membershipExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { radius: 25, unit: 'miles' },
      }
    }),
    prisma.user.create({
      data: {
        name: 'Andrew Lewis - Tile Pro',
        email: 'andrew.lewis@tradesperson.com',
        phone: '+447700800008',
        passwordHash,
        type: UserType.tradesperson,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        location: 'Newcastle, UK',
        latitude: 54.9783,
        longitude: -1.6178,
        trades: ['Tiler', 'Bathroom Fitter', 'Flooring Fitter'],
        rating: 4.7,
        reviews: 78,
        verified: true,
        credits: 200.00,
        membershipType: MembershipType.premium,
        membershipExpiry: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { radius: 30, unit: 'miles' },
      }
    }),
    prisma.user.create({
      data: {
        name: 'Joseph Walker - Walker Windows',
        email: 'joseph.walker@tradesperson.com',
        phone: '+447700800009',
        passwordHash,
        type: UserType.tradesperson,
        location: 'Edinburgh, UK',
        latitude: 55.9533,
        longitude: -3.1883,
        trades: ['Window Fitter', 'Door Fitter', 'Glazier', 'Conservatory Installer'],
        rating: 4.6,
        reviews: 92,
        verified: true,
        credits: 180.00,
        membershipType: MembershipType.premium,
        membershipExpiry: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { radius: 40, unit: 'miles' },
      }
    }),
    prisma.user.create({
      data: {
        name: 'Charles Robinson - Quick Locksmith',
        email: 'charles.robinson@tradesperson.com',
        phone: '+447700800010',
        passwordHash,
        type: UserType.tradesperson,
        location: 'Glasgow, UK',
        latitude: 55.8642,
        longitude: -4.2518,
        trades: ['Locksmith', 'Security System Installer'],
        rating: 4.8,
        reviews: 156,
        verified: true,
        credits: 300.00,
        membershipType: MembershipType.premium,
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.active,
        workingArea: { radius: 50, unit: 'miles' },
      }
    }),
    
    // Parked Account (inactive)
    prisma.user.create({
      data: {
        name: 'George Hall - Hall Handyman Services',
        email: 'george.hall@tradesperson.com',
        phone: '+447700800011',
        passwordHash,
        type: UserType.tradesperson,
        location: 'Cardiff, UK',
        latitude: 51.4816,
        longitude: -3.1791,
        trades: ['Handyman'],
        rating: 4.2,
        reviews: 23,
        verified: true,
        credits: 25.00,
        membershipType: MembershipType.none,
        verificationStatus: VerificationStatus.verified,
        isEmailVerified: true,
        accountStatus: AccountStatus.parked,
        parkedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        workingArea: { radius: 10, unit: 'miles' },
      }
    }),
  ]);
  console.log(`✅ Created ${tradespeople.length} tradespeople\n`);

  // ============= CREATE JOB LEADS =============
  console.log('📋 Creating job leads...');

  const jobLeads = await Promise.all([
    // Active Jobs - Various Categories
    prisma.jobLead.create({
      data: {
        title: 'Kitchen Renovation - Complete Remodel',
        description: 'Looking for a professional to completely renovate our kitchen. This includes removing old cabinets, installing new ones, fitting a new sink, and tiling the backsplash. The kitchen is approximately 15 square meters.',
        category: 'Kitchen Fitter',
        location: 'London, UK',
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
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Emergency Boiler Repair',
        description: 'Our boiler has stopped working and we have no hot water or heating. Need an urgent repair or replacement. Boiler is a Worcester Bosch, about 8 years old.',
        category: 'Plumber',
        location: 'Manchester, UK',
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
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Full House Rewiring',
        description: 'Victorian terraced house needs complete rewiring. 3 bedrooms, 2 reception rooms, kitchen, and bathroom. Consumer unit also needs upgrading to meet current regulations.',
        category: 'Electrician',
        location: 'Birmingham, UK',
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
        isActive: true,
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Garden Landscaping Project',
        description: 'Large garden needs complete landscaping. Looking for new lawn, patio area, raised flower beds, and possibly a small water feature. Garden is approximately 200 square meters.',
        category: 'Landscaper',
        location: 'Leeds, UK',
        latitude: 53.7950,
        longitude: -1.5500,
        budget: '£5,000 - £10,000',
        urgency: UrgencyLevel.Low,
        postedBy: homeowners[3].id,
        contactDetails: {
          name: 'Emily Davis',
          email: 'emily.davis@email.com',
          phone: '+447700900004',
        },
        maxPurchases: 6,
        price: 11.99,
        isActive: true,
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Bathroom Fitting - En-Suite',
        description: 'Converting a small bedroom into an en-suite bathroom. Need full plumbing, tiling, shower installation, toilet, and sink. Approximately 4 square meters.',
        category: 'Bathroom Fitter',
        location: 'Bristol, UK',
        latitude: 51.4600,
        longitude: -2.5900,
        budget: '£5,000 - £10,000',
        urgency: UrgencyLevel.Medium,
        postedBy: homeowners[4].id,
        contactDetails: {
          name: 'David Wilson',
          email: 'david.wilson@email.com',
          phone: '+447700900005',
        },
        maxPurchases: 5,
        price: 10.99,
        isActive: true,
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Single Storey Extension',
        description: 'Planning permission approved for 4m x 6m single storey rear extension. Need builders to complete the full build including foundations, walls, roof, and basic interior finishing.',
        category: 'Extension Builder',
        location: 'London, UK',
        latitude: 51.5300,
        longitude: -0.0900,
        budget: 'Over £25,000',
        urgency: UrgencyLevel.Low,
        postedBy: homeowners[0].id,
        contactDetails: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+447700900001',
        },
        maxPurchases: 4,
        price: 24.99,
        isActive: true,
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Interior Painting - Whole House',
        description: '4 bedroom detached house needs full interior painting. All rooms including hallways and staircase. Walls and ceilings. We will provide the paint.',
        category: 'Painter & Decorator',
        location: 'Sheffield, UK',
        latitude: 53.3900,
        longitude: -1.4700,
        budget: '£1,000 - £5,000',
        urgency: UrgencyLevel.Low,
        postedBy: homeowners[1].id,
        contactDetails: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+447700900002',
        },
        maxPurchases: 6,
        price: 8.99,
        isActive: true,
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Roof Repair - Storm Damage',
        description: 'Several tiles blown off during recent storm. Some potential water damage to the felt underneath. Need urgent assessment and repair before more rain.',
        category: 'Roofer',
        location: 'Liverpool, UK',
        latitude: 53.4100,
        longitude: -2.9800,
        budget: '£500 - £1,000',
        urgency: UrgencyLevel.High,
        postedBy: homeowners[2].id,
        contactDetails: {
          name: 'Michael Brown',
          email: 'michael.brown@email.com',
          phone: '+447700900003',
        },
        maxPurchases: 4,
        price: 9.99,
        isActive: true,
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'New Driveway Installation',
        description: 'Replace existing cracked concrete driveway with block paving. Driveway is approximately 40 square meters. Would like a decorative border.',
        category: 'Driveways Installer',
        location: 'Edinburgh, UK',
        latitude: 55.9500,
        longitude: -3.1900,
        budget: '£5,000 - £10,000',
        urgency: UrgencyLevel.Low,
        postedBy: homeowners[3].id,
        contactDetails: {
          name: 'Emily Davis',
          email: 'emily.davis@email.com',
          phone: '+447700900004',
        },
        maxPurchases: 5,
        price: 12.99,
        isActive: true,
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Security System Installation',
        description: 'Looking to install a comprehensive home security system including CCTV cameras (4-6), alarm system, and smart doorbell. Prefer a system that can be monitored via smartphone.',
        category: 'Security System Installer',
        location: 'Glasgow, UK',
        latitude: 55.8600,
        longitude: -4.2500,
        budget: '£1,000 - £5,000',
        urgency: UrgencyLevel.Medium,
        postedBy: homeowners[4].id,
        contactDetails: {
          name: 'David Wilson',
          email: 'david.wilson@email.com',
          phone: '+447700900005',
        },
        maxPurchases: 5,
        price: 10.99,
        isActive: true,
      }
    }),
    
    // Jobs with existing interests/purchases
    prisma.jobLead.create({
      data: {
        title: 'Gas Boiler Service and Safety Check',
        description: 'Annual boiler service required. Boiler is a Vaillant ecoTEC plus, installed 3 years ago. Need gas safety certificate for rental property.',
        category: 'Gas Engineer',
        location: 'London, UK',
        latitude: 51.5100,
        longitude: -0.1300,
        budget: 'Under £500',
        urgency: UrgencyLevel.Medium,
        postedBy: homeowners[0].id,
        contactDetails: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+447700900001',
        },
        maxPurchases: 4,
        price: 7.99,
        isActive: true,
        purchasedBy: [tradespeople[0].id],
        interests: [
          {
            id: 'int-001',
            tradespersonId: tradespeople[0].id,
            tradespersonName: 'James Wilson - Elite Plumbing',
            message: 'Hi, I can complete this service next week. I\'m Gas Safe registered and can provide the certificate same day.',
            price: 85,
            date: new Date().toISOString(),
            status: 'pending',
          }
        ],
      }
    }),
    prisma.jobLead.create({
      data: {
        title: 'Loft Conversion - 2 Bedrooms',
        description: 'Want to convert our loft into 2 bedrooms with a shared bathroom. Looking for a full design and build service. Roof height is good, approximately 2.4m at the highest point.',
        category: 'Loft Conversion Company',
        location: 'Manchester, UK',
        latitude: 53.4700,
        longitude: -2.2400,
        budget: 'Over £25,000',
        urgency: UrgencyLevel.Low,
        postedBy: homeowners[1].id,
        contactDetails: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+447700900002',
        },
        maxPurchases: 3,
        price: 29.99,
        isActive: true,
        purchasedBy: [tradespeople[2].id],
        interests: [
          {
            id: 'int-002',
            tradespersonId: tradespeople[2].id,
            tradespersonName: 'William Anderson - Master Builders',
            message: 'I specialize in loft conversions and can provide a free survey and quote. I\'ve completed over 50 similar projects.',
            price: 35000,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'accepted',
          }
        ],
        hiredTradesperson: tradespeople[2].id,
      }
    }),
  ]);
  console.log(`✅ Created ${jobLeads.length} job leads\n`);

  // ============= CREATE QUOTE REQUESTS =============
  console.log('💬 Creating quote requests...');

  const quoteRequests = await Promise.all([
    prisma.quoteRequest.create({
      data: {
        homeownerId: homeowners[0].id,
        homeownerName: 'John Smith',
        projectTitle: 'Conservatory Cleaning',
        projectDescription: 'Looking for quotes to professionally clean our conservatory. The conservatory is approximately 4m x 3m with a polycarbonate roof.',
        category: 'Handyman',
        location: 'London, UK',
        budget: 'Under £500',
        urgency: UrgencyLevel.Low,
        contactDetails: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+447700900001',
        },
        responses: [
          {
            id: 'resp-001',
            tradespersonId: tradespeople[3].id,
            tradespersonName: 'Thomas Martin - Perfect Painting',
            message: 'I can clean your conservatory for £150. This includes cleaning the roof, frames, and glass.',
            price: 150,
            date: new Date().toISOString(),
            status: 'pending',
          }
        ],
      }
    }),
    prisma.quoteRequest.create({
      data: {
        homeownerId: homeowners[2].id,
        homeownerName: 'Michael Brown',
        projectTitle: 'Tree Removal',
        projectDescription: 'Large oak tree in back garden needs removing. The tree is approximately 15 meters tall and overhanging neighboring property.',
        category: 'Tree Surgeon',
        location: 'Birmingham, UK',
        budget: '£500 - £1,000',
        urgency: UrgencyLevel.Medium,
        contactDetails: {
          name: 'Michael Brown',
          email: 'michael.brown@email.com',
          phone: '+447700900003',
        },
        responses: [],
      }
    }),
    prisma.quoteRequest.create({
      data: {
        homeownerId: homeowners[4].id,
        homeownerName: 'David Wilson',
        projectTitle: 'Chimney Repair and Repointing',
        projectDescription: 'Chimney stack needs repointing and a new chimney pot. Some bricks are loose and mortar is crumbling.',
        category: 'Chimney Repair Specialist',
        location: 'Bristol, UK',
        budget: '£500 - £1,000',
        urgency: UrgencyLevel.High,
        contactDetails: {
          name: 'David Wilson',
          email: 'david.wilson@email.com',
          phone: '+447700900005',
        },
        responses: [],
      }
    }),
  ]);
  console.log(`✅ Created ${quoteRequests.length} quote requests\n`);

  // ============= CREATE REVIEWS =============
  console.log('⭐ Creating reviews...');

  const reviews = await Promise.all([
    // Reviews for James Wilson (Plumber)
    prisma.review.create({
      data: {
        jobId: jobLeads[1].id,
        tradespersonId: tradespeople[0].id,
        homeownerId: homeowners[0].id,
        rating: 5,
        comment: 'Excellent service! James arrived on time and fixed our boiler issue within an hour. Very professional and clean. Highly recommend!',
      }
    }),
    prisma.review.create({
      data: {
        jobId: jobLeads[10].id,
        tradespersonId: tradespeople[0].id,
        homeownerId: homeowners[1].id,
        rating: 5,
        comment: 'Fantastic work on our heating system. James explained everything clearly and the price was very fair. Will definitely use again.',
      }
    }),
    prisma.review.create({
      data: {
        jobId: jobLeads[0].id,
        tradespersonId: tradespeople[0].id,
        homeownerId: homeowners[2].id,
        rating: 4,
        comment: 'Good job overall. Slight delay in arriving but the work itself was excellent quality.',
      }
    }),
    
    // Reviews for Robert Taylor (Electrician)
    prisma.review.create({
      data: {
        jobId: jobLeads[2].id,
        tradespersonId: tradespeople[1].id,
        homeownerId: homeowners[2].id,
        rating: 5,
        comment: 'Robert rewired our entire house and did an amazing job. Very neat work, all cables hidden properly. Passed inspection first time!',
      }
    }),
    prisma.review.create({
      data: {
        jobId: jobLeads[9].id,
        tradespersonId: tradespeople[1].id,
        homeownerId: homeowners[4].id,
        rating: 5,
        comment: 'Installed our security system perfectly. Showed us how to use the app and answered all our questions. Very patient and professional.',
      }
    }),
    
    // Reviews for William Anderson (Builder)
    prisma.review.create({
      data: {
        jobId: jobLeads[5].id,
        tradespersonId: tradespeople[2].id,
        homeownerId: homeowners[0].id,
        rating: 5,
        comment: 'William and his team built our extension to an incredibly high standard. Project came in on time and on budget. The finish is beautiful!',
      }
    }),
    prisma.review.create({
      data: {
        jobId: jobLeads[11].id,
        tradespersonId: tradespeople[2].id,
        homeownerId: homeowners[1].id,
        rating: 4,
        comment: 'Great loft conversion. Minor snagging issues but all resolved quickly. Happy with the final result.',
      }
    }),
    
    // Reviews for Christopher White (Kitchen Fitter)
    prisma.review.create({
      data: {
        jobId: jobLeads[0].id,
        tradespersonId: tradespeople[4].id,
        homeownerId: homeowners[0].id,
        rating: 5,
        comment: 'Our new kitchen is absolutely stunning! Christopher has incredible attention to detail. Every cabinet is perfectly aligned.',
      }
    }),
    prisma.review.create({
      data: {
        jobId: jobLeads[4].id,
        tradespersonId: tradespeople[4].id,
        homeownerId: homeowners[3].id,
        rating: 5,
        comment: 'Transformed our old kitchen into something from a magazine. Worth every penny. Highly recommend Kitchen Dreams!',
      }
    }),
    
    // Reviews for Andrew Lewis (Tiler)
    prisma.review.create({
      data: {
        jobId: jobLeads[4].id,
        tradespersonId: tradespeople[7].id,
        homeownerId: homeowners[4].id,
        rating: 5,
        comment: 'Beautiful tiling work in our new bathroom. Andrew suggested some design improvements that made it even better. Very skilled craftsman.',
      }
    }),
  ]);
  console.log(`✅ Created ${reviews.length} reviews\n`);

  // ============= CREATE CONVERSATIONS & MESSAGES =============
  console.log('💭 Creating conversations and messages...');

  const conversation1 = await prisma.conversation.create({
    data: {
      jobId: jobLeads[0].id,
      jobTitle: jobLeads[0].title,
      homeownerId: homeowners[0].id,
      tradespersonId: tradespeople[4].id,
    }
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      jobId: jobLeads[1].id,
      jobTitle: jobLeads[1].title,
      homeownerId: homeowners[1].id,
      tradespersonId: tradespeople[0].id,
    }
  });

  const conversation3 = await prisma.conversation.create({
    data: {
      jobId: jobLeads[2].id,
      jobTitle: jobLeads[2].title,
      homeownerId: homeowners[2].id,
      tradespersonId: tradespeople[1].id,
    }
  });

  // Messages for conversation 1 (Kitchen Renovation)
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        senderId: tradespeople[4].id,
        senderName: 'Christopher White - Kitchen Dreams',
        content: 'Hi John, I saw your kitchen renovation project and I\'d love to help. I have over 15 years of experience with kitchen fitting. Would you be available for a site visit this week?',
        read: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderId: homeowners[0].id,
        senderName: 'John Smith',
        content: 'Hi Christopher, thanks for reaching out. Yes, I\'d be happy to arrange a site visit. Are you available Thursday afternoon?',
        read: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderId: tradespeople[4].id,
        senderName: 'Christopher White - Kitchen Dreams',
        content: 'Thursday at 2pm works perfectly for me. Could you send me your address? Also, do you have any design ideas in mind or would you like me to bring some suggestions?',
        read: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderId: homeowners[0].id,
        senderName: 'John Smith',
        content: 'I\'ll send the address in a private message. We\'re thinking modern grey with white countertops, but open to suggestions. Do you supply the units or should we source them?',
        read: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderId: tradespeople[4].id,
        senderName: 'Christopher White - Kitchen Dreams',
        content: 'I can supply everything including units, worktops, and appliances at trade prices. I work with several suppliers so can match most budgets. I\'ll bring some samples on Thursday.',
        read: false,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]
  });

  // Messages for conversation 2 (Boiler Repair)
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation2.id,
        senderId: tradespeople[0].id,
        senderName: 'James Wilson - Elite Plumbing',
        content: 'Hi Sarah, I can come out today to look at your boiler. I\'m Gas Safe registered and carry most common parts in my van. What\'s your postcode?',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderId: homeowners[1].id,
        senderName: 'Sarah Johnson',
        content: 'That would be amazing! We\'re at M14 5RG. How soon could you get here?',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderId: tradespeople[0].id,
        senderName: 'James Wilson - Elite Plumbing',
        content: 'I can be there within the hour. My call-out fee is £60 which includes the first hour of labour. Parts will be extra if needed. Is that okay?',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderId: homeowners[1].id,
        senderName: 'Sarah Johnson',
        content: 'Yes, that\'s fine. Please come as soon as you can. The boiler is a Worcester Bosch Greenstar 30i, about 8 years old. It just stopped working this morning.',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderId: tradespeople[0].id,
        senderName: 'James Wilson - Elite Plumbing',
        content: 'On my way now. I\'ve worked on many Worcester boilers so hopefully it\'s a straightforward fix. See you soon!',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      },
    ]
  });

  // Messages for conversation 3 (Rewiring)
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation3.id,
        senderId: tradespeople[1].id,
        senderName: 'Robert Taylor - Spark Electrical',
        content: 'Hello Michael, I\'ve reviewed your rewiring project. Victorian properties are my specialty - I\'ve done dozens of similar jobs. Would you like me to visit for a detailed quote?',
        read: true,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        senderId: homeowners[2].id,
        senderName: 'Michael Brown',
        content: 'Yes please, Robert. The house was built in 1895 and I think some of the original wiring is still in place. When could you visit?',
        read: true,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        senderId: tradespeople[1].id,
        senderName: 'Robert Taylor - Spark Electrical',
        content: 'I\'m free Saturday morning if that works? Original 1895 wiring would definitely need replacing. I can also check if there\'s any dangerous DIY work that\'s been done over the years.',
        read: true,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        senderId: homeowners[2].id,
        senderName: 'Michael Brown',
        content: 'Saturday 10am would be perfect. What should I expect cost-wise for a full rewire of a 3-bed Victorian terrace?',
        read: true,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        senderId: tradespeople[1].id,
        senderName: 'Robert Taylor - Spark Electrical',
        content: 'For a 3-bed Victorian, typically £4,500-£6,500 depending on complexity and finish. This includes all new cabling, consumer unit, sockets, switches, and certificate. I\'ll give you an accurate quote after the survey.',
        read: false,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ]
  });

  console.log('✅ Created 3 conversations with messages\n');

  // ============= CREATE PAYMENTS =============
  console.log('💳 Creating payment records...');

  const payments = await Promise.all([
    // Job lead purchases
    prisma.payment.create({
      data: {
        userId: tradespeople[0].id,
        amount: 9.99,
        currency: 'gbp',
        type: PaymentType.job_lead_purchase,
        status: PaymentStatus.succeeded,
        stripePaymentId: 'pi_test_001',
        description: 'Job lead purchase: Emergency Boiler Repair',
        metadata: { jobLeadId: jobLeads[1].id },
      }
    }),
    prisma.payment.create({
      data: {
        userId: tradespeople[2].id,
        amount: 29.99,
        currency: 'gbp',
        type: PaymentType.job_lead_purchase,
        status: PaymentStatus.succeeded,
        stripePaymentId: 'pi_test_002',
        description: 'Job lead purchase: Loft Conversion - 2 Bedrooms',
        metadata: { jobLeadId: jobLeads[11].id },
      }
    }),
    prisma.payment.create({
      data: {
        userId: tradespeople[4].id,
        amount: 14.99,
        currency: 'gbp',
        type: PaymentType.job_lead_purchase,
        status: PaymentStatus.succeeded,
        stripePaymentId: 'pi_test_003',
        description: 'Job lead purchase: Kitchen Renovation - Complete Remodel',
        metadata: { jobLeadId: jobLeads[0].id },
      }
    }),
    
    // Directory subscriptions
    prisma.payment.create({
      data: {
        userId: homeowners[0].id,
        amount: 1.00,
        currency: 'gbp',
        type: PaymentType.directory_subscription,
        status: PaymentStatus.succeeded,
        stripePaymentId: 'pi_test_004',
        description: 'Directory subscription - Monthly',
      }
    }),
    prisma.payment.create({
      data: {
        userId: homeowners[2].id,
        amount: 1.00,
        currency: 'gbp',
        type: PaymentType.directory_subscription,
        status: PaymentStatus.succeeded,
        stripePaymentId: 'pi_test_005',
        description: 'Directory subscription - Monthly',
      }
    }),
    
    // Credits top-up
    prisma.payment.create({
      data: {
        userId: tradespeople[0].id,
        amount: 100.00,
        currency: 'gbp',
        type: PaymentType.credits_topup,
        status: PaymentStatus.succeeded,
        stripePaymentId: 'pi_test_006',
        description: 'Credits top-up: £100',
      }
    }),
    prisma.payment.create({
      data: {
        userId: tradespeople[2].id,
        amount: 250.00,
        currency: 'gbp',
        type: PaymentType.credits_topup,
        status: PaymentStatus.succeeded,
        stripePaymentId: 'pi_test_007',
        description: 'Credits top-up: £250',
      }
    }),
    
    // Membership purchase
    prisma.payment.create({
      data: {
        userId: tradespeople[2].id,
        amount: 999.00,
        currency: 'gbp',
        type: PaymentType.membership_purchase,
        status: PaymentStatus.succeeded,
        stripePaymentId: 'pi_test_008',
        description: 'Unlimited 5-Year Membership',
      }
    }),
    
    // Failed payment
    prisma.payment.create({
      data: {
        userId: tradespeople[5].id,
        amount: 50.00,
        currency: 'gbp',
        type: PaymentType.credits_topup,
        status: PaymentStatus.failed,
        stripePaymentId: 'pi_test_009',
        description: 'Credits top-up: £50 (Failed)',
        failureReason: 'Card declined - insufficient funds',
      }
    }),
    
    // Refunded payment
    prisma.payment.create({
      data: {
        userId: tradespeople[3].id,
        amount: 9.99,
        currency: 'gbp',
        type: PaymentType.job_lead_purchase,
        status: PaymentStatus.refunded,
        stripePaymentId: 'pi_test_010',
        description: 'Job lead purchase (Refunded)',
        refundedAmount: 9.99,
        refundReason: 'Job cancelled by homeowner before any contact',
      }
    }),
  ]);
  console.log(`✅ Created ${payments.length} payment records\n`);

  // ============= CREATE SUBSCRIPTIONS =============
  console.log('📅 Creating subscriptions...');

  const subscriptions = await Promise.all([
    // Active directory subscriptions for homeowners
    prisma.subscription.create({
      data: {
        userId: homeowners[0].id,
        type: 'directory_access',
        status: SubscriptionStatus.active,
        stripeSubscriptionId: 'sub_test_001',
        stripePriceId: 'price_directory_monthly',
        currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.subscription.create({
      data: {
        userId: homeowners[2].id,
        type: 'directory_access',
        status: SubscriptionStatus.active,
        stripeSubscriptionId: 'sub_test_002',
        stripePriceId: 'price_directory_monthly',
        currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.subscription.create({
      data: {
        userId: homeowners[4].id,
        type: 'directory_access',
        status: SubscriptionStatus.active,
        stripeSubscriptionId: 'sub_test_003',
        stripePriceId: 'price_directory_monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    }),
    
    // Premium membership subscriptions for tradespeople
    prisma.subscription.create({
      data: {
        userId: tradespeople[0].id,
        type: 'premium_membership',
        status: SubscriptionStatus.active,
        stripeSubscriptionId: 'sub_test_004',
        stripePriceId: 'price_premium_annual',
        currentPeriodStart: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 265 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.subscription.create({
      data: {
        userId: tradespeople[1].id,
        type: 'premium_membership',
        status: SubscriptionStatus.active,
        stripeSubscriptionId: 'sub_test_005',
        stripePriceId: 'price_premium_annual',
        currentPeriodStart: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      }
    }),
    
    // Unlimited 5-year membership
    prisma.subscription.create({
      data: {
        userId: tradespeople[2].id,
        type: 'unlimited_5_year',
        status: SubscriptionStatus.active,
        stripeSubscriptionId: 'sub_test_006',
        stripePriceId: 'price_unlimited_5year',
        currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
      }
    }),
    
    // Cancelled subscription
    prisma.subscription.create({
      data: {
        userId: homeowners[3].id,
        type: 'directory_access',
        status: SubscriptionStatus.cancelled,
        stripeSubscriptionId: 'sub_test_007',
        stripePriceId: 'price_directory_monthly',
        currentPeriodStart: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        cancelledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      }
    }),
    
    // Basic membership
    prisma.subscription.create({
      data: {
        userId: tradespeople[3].id,
        type: 'basic_membership',
        status: SubscriptionStatus.active,
        stripeSubscriptionId: 'sub_test_008',
        stripePriceId: 'price_basic_annual',
        currentPeriodStart: new Date(Date.now() - 185 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      }
    }),
  ]);
  console.log(`✅ Created ${subscriptions.length} subscriptions\n`);

  // ============= CREATE STRIPE CUSTOMERS =============
  console.log('🏦 Creating Stripe customer records...');

  const stripeCustomers = await Promise.all([
    prisma.stripeCustomer.create({
      data: {
        userId: homeowners[0].id,
        stripeCustomerId: 'cus_test_homeowner_001',
      }
    }),
    prisma.stripeCustomer.create({
      data: {
        userId: homeowners[2].id,
        stripeCustomerId: 'cus_test_homeowner_002',
      }
    }),
    prisma.stripeCustomer.create({
      data: {
        userId: tradespeople[0].id,
        stripeCustomerId: 'cus_test_tradesperson_001',
      }
    }),
    prisma.stripeCustomer.create({
      data: {
        userId: tradespeople[1].id,
        stripeCustomerId: 'cus_test_tradesperson_002',
      }
    }),
    prisma.stripeCustomer.create({
      data: {
        userId: tradespeople[2].id,
        stripeCustomerId: 'cus_test_tradesperson_003',
      }
    }),
  ]);
  console.log(`✅ Created ${stripeCustomers.length} Stripe customer records\n`);

  // ============= SUMMARY =============
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    🎉 SEED COMPLETED! 🎉                    ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📊 DATA SUMMARY:');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   👑 Admin:           1`);
  console.log(`   🏠 Homeowners:      ${homeowners.length}`);
  console.log(`   👷 Tradespeople:    ${tradespeople.length}`);
  console.log(`   📋 Job Leads:       ${jobLeads.length}`);
  console.log(`   💬 Quote Requests:  ${quoteRequests.length}`);
  console.log(`   ⭐ Reviews:         ${reviews.length}`);
  console.log(`   💭 Conversations:   3`);
  console.log(`   💳 Payments:        ${payments.length}`);
  console.log(`   📅 Subscriptions:   ${subscriptions.length}`);
  console.log(`   🏦 Stripe Customers: ${stripeCustomers.length}`);
  console.log('────────────────────────────────────────────────────────────\n');

  console.log('🔐 TEST CREDENTIALS:');
  console.log('────────────────────────────────────────────────────────────');
  console.log('   ADMIN:');
  console.log('     Email:    admin@superfly.com');
  console.log('     Password: Admin@123');
  console.log('');
  console.log('   HOMEOWNERS (Password for all: Test@123):');
  homeowners.forEach((h, i) => {
    console.log(`     ${i + 1}. ${h.email} - ${h.location}${h.hasDirectoryAccess ? ' [Directory Access]' : ''}`);
  });
  console.log('');
  console.log('   TRADESPEOPLE (Password for all: Test@123):');
  tradespeople.forEach((t, i) => {
    console.log(`     ${i + 1}. ${t.email} - ${t.trades.join(', ')}`);
  });
  console.log('────────────────────────────────────────────────────────────\n');

  console.log('🗺️  TEST LOCATIONS WITH COORDINATES:');
  console.log('────────────────────────────────────────────────────────────');
  console.log('   London:     51.5074, -0.1278');
  console.log('   Manchester: 53.4808, -2.2426');
  console.log('   Birmingham: 52.4862, -1.8904');
  console.log('   Leeds:      53.8008, -1.5491');
  console.log('   Bristol:    51.4545, -2.5879');
  console.log('   Liverpool:  53.4084, -2.9916');
  console.log('   Sheffield:  53.3811, -1.4701');
  console.log('   Newcastle:  54.9783, -1.6178');
  console.log('   Edinburgh:  55.9533, -3.1883');
  console.log('   Glasgow:    55.8642, -4.2518');
  console.log('────────────────────────────────────────────────────────────\n');

  console.log('✅ Database is now populated with comprehensive test data!');
  console.log('   Use the credentials above to test different user roles.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
