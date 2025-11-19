"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Starting database seeding...');
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        yield prisma.review.deleteMany();
        yield prisma.message.deleteMany();
        yield prisma.conversation.deleteMany();
        yield prisma.quoteRequest.deleteMany();
        yield prisma.jobLead.deleteMany();
        yield prisma.user.deleteMany();
        // Hash password for all users
        const passwordHash = yield bcrypt_1.default.hash('password123', 10);
        // Create Homeowners
        console.log('👤 Creating homeowners...');
        const homeowner1 = yield prisma.user.create({
            data: {
                name: 'John Smith',
                email: 'john.smith@example.com',
                passwordHash,
                type: 'homeowner',
                location: 'London, UK',
                accountStatus: 'active',
                verificationStatus: 'verified',
            },
        });
        const homeowner2 = yield prisma.user.create({
            data: {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@example.com',
                passwordHash,
                type: 'homeowner',
                location: 'Manchester, UK',
                accountStatus: 'active',
                verificationStatus: 'verified',
            },
        });
        const homeowner3 = yield prisma.user.create({
            data: {
                name: 'Michael Brown',
                email: 'michael.brown@example.com',
                passwordHash,
                type: 'homeowner',
                location: 'Birmingham, UK',
                accountStatus: 'active',
                verificationStatus: 'verified',
            },
        });
        // Create Tradespeople
        console.log('🔧 Creating tradespeople...');
        const tradesperson1 = yield prisma.user.create({
            data: {
                name: 'David Wilson',
                email: 'david.wilson@example.com',
                passwordHash,
                type: 'tradesperson',
                location: 'London, UK',
                trades: ['Plumbing', 'Heating'],
                rating: 4.8,
                reviews: 45,
                verified: true,
                credits: 100,
                membershipType: 'premium',
                membershipExpiry: new Date('2025-12-31'),
                accountStatus: 'active',
                verificationStatus: 'verified',
                workingArea: {
                    centerLocation: 'London',
                    radius: 50,
                    coordinates: { lat: 51.5074, lng: -0.1278 },
                },
            },
        });
        const tradesperson2 = yield prisma.user.create({
            data: {
                name: 'Emma Thompson',
                email: 'emma.thompson@example.com',
                passwordHash,
                type: 'tradesperson',
                location: 'Manchester, UK',
                trades: ['Electrical', 'Lighting'],
                rating: 4.9,
                reviews: 67,
                verified: true,
                credits: 150,
                membershipType: 'unlimited_5_year',
                membershipExpiry: new Date('2029-11-19'),
                accountStatus: 'active',
                verificationStatus: 'verified',
                workingArea: {
                    centerLocation: 'Manchester',
                    radius: 40,
                    coordinates: { lat: 53.4808, lng: -2.2426 },
                },
            },
        });
        const tradesperson3 = yield prisma.user.create({
            data: {
                name: 'James Anderson',
                email: 'james.anderson@example.com',
                passwordHash,
                type: 'tradesperson',
                location: 'Birmingham, UK',
                trades: ['Carpentry', 'Joinery'],
                rating: 4.7,
                reviews: 38,
                verified: true,
                credits: 75,
                membershipType: 'basic',
                membershipExpiry: new Date('2025-06-30'),
                accountStatus: 'active',
                verificationStatus: 'verified',
                workingArea: {
                    centerLocation: 'Birmingham',
                    radius: 35,
                    coordinates: { lat: 52.4862, lng: -1.8904 },
                },
            },
        });
        const tradesperson4 = yield prisma.user.create({
            data: {
                name: 'Sophie Martinez',
                email: 'sophie.martinez@example.com',
                passwordHash,
                type: 'tradesperson',
                location: 'Leeds, UK',
                trades: ['Painting', 'Decorating'],
                rating: 4.6,
                reviews: 29,
                verified: false,
                credits: 50,
                membershipType: 'none',
                accountStatus: 'active',
                verificationStatus: 'pending',
                workingArea: {
                    centerLocation: 'Leeds',
                    radius: 30,
                    coordinates: { lat: 53.8008, lng: -1.5491 },
                },
            },
        });
        const tradesperson5 = yield prisma.user.create({
            data: {
                name: 'Oliver Davis',
                email: 'oliver.davis@example.com',
                passwordHash,
                type: 'tradesperson',
                location: 'London, UK',
                trades: ['Roofing', 'Guttering'],
                rating: 4.5,
                reviews: 22,
                verified: true,
                credits: 120,
                membershipType: 'premium',
                membershipExpiry: new Date('2025-09-15'),
                accountStatus: 'active',
                verificationStatus: 'verified',
                workingArea: {
                    centerLocation: 'London',
                    radius: 45,
                    coordinates: { lat: 51.5074, lng: -0.1278 },
                },
            },
        });
        // Create Job Leads
        console.log('💼 Creating job leads...');
        const jobLead1 = yield prisma.jobLead.create({
            data: {
                title: 'Kitchen Renovation - Plumbing Work',
                description: 'Need a qualified plumber to install new kitchen sink, dishwasher connections, and update all pipework. Modern kitchen with high-end appliances.',
                category: 'Plumbing',
                location: 'London, UK',
                budget: '£2000-£3000',
                urgency: 'Medium',
                postedBy: homeowner1.id,
                contactDetails: {
                    name: 'John Smith',
                    email: 'john.smith@example.com',
                    phone: '+44 7700 900123',
                },
                maxPurchases: 6,
                price: 9.99,
                isActive: true,
                interests: [
                    {
                        id: crypto.randomUUID(),
                        tradespersonId: tradesperson1.id,
                        tradespersonName: tradesperson1.name,
                        message: 'I have 10 years of experience in kitchen plumbing installations. I can start next week.',
                        price: 2500,
                        date: new Date().toISOString(),
                        status: 'pending',
                    },
                ],
            },
        });
        const jobLead2 = yield prisma.jobLead.create({
            data: {
                title: 'Complete House Rewiring',
                description: 'Full electrical rewiring needed for a 3-bedroom house. Must be certified and experienced with modern electrical standards.',
                category: 'Electrical',
                location: 'Manchester, UK',
                budget: '£4000-£6000',
                urgency: 'High',
                postedBy: homeowner2.id,
                contactDetails: {
                    name: 'Sarah Johnson',
                    email: 'sarah.johnson@example.com',
                    phone: '+44 7700 900456',
                },
                maxPurchases: 5,
                price: 12.99,
                isActive: true,
                purchasedBy: [tradesperson2.id],
                interests: [
                    {
                        id: crypto.randomUUID(),
                        tradespersonId: tradesperson2.id,
                        tradespersonName: tradesperson2.name,
                        message: 'Certified electrician with 15 years experience. Can provide references and start immediately.',
                        price: 5200,
                        date: new Date().toISOString(),
                        status: 'accepted',
                    },
                ],
                hiredTradesperson: tradesperson2.id,
            },
        });
        const jobLead3 = yield prisma.jobLead.create({
            data: {
                title: 'Custom Built-in Wardrobes',
                description: 'Looking for an experienced carpenter to design and build custom wardrobes for master bedroom. Measurements and design consultation required.',
                category: 'Carpentry',
                location: 'Birmingham, UK',
                budget: '£1500-£2500',
                urgency: 'Low',
                postedBy: homeowner3.id,
                contactDetails: {
                    name: 'Michael Brown',
                    email: 'michael.brown@example.com',
                    phone: '+44 7700 900789',
                },
                maxPurchases: 6,
                price: 9.99,
                isActive: true,
                interests: [
                    {
                        id: crypto.randomUUID(),
                        tradespersonId: tradesperson3.id,
                        tradespersonName: tradesperson3.name,
                        message: 'I specialize in custom furniture and built-ins. Would love to discuss your project.',
                        price: 2000,
                        date: new Date().toISOString(),
                        status: 'pending',
                    },
                ],
            },
        });
        const jobLead4 = yield prisma.jobLead.create({
            data: {
                title: 'Bathroom Painting and Tiling',
                description: 'Need professional painter to paint bathroom walls and ceiling. Some minor tiling work also required around the shower area.',
                category: 'Painting',
                location: 'London, UK',
                budget: '£800-£1200',
                urgency: 'Medium',
                postedBy: homeowner1.id,
                contactDetails: {
                    name: 'John Smith',
                    email: 'john.smith@example.com',
                    phone: '+44 7700 900123',
                },
                maxPurchases: 6,
                price: 7.99,
                isActive: true,
            },
        });
        const jobLead5 = yield prisma.jobLead.create({
            data: {
                title: 'Roof Repair - Urgent',
                description: 'Leaking roof needs immediate attention. Several tiles damaged after recent storm. Need experienced roofer ASAP.',
                category: 'Roofing',
                location: 'London, UK',
                budget: '£1000-£1500',
                urgency: 'High',
                postedBy: homeowner1.id,
                contactDetails: {
                    name: 'John Smith',
                    email: 'john.smith@example.com',
                    phone: '+44 7700 900123',
                },
                maxPurchases: 4,
                price: 14.99,
                isActive: true,
                purchasedBy: [tradesperson5.id],
            },
        });
        // Create Quote Requests
        console.log('💬 Creating quote requests...');
        const quoteRequest1 = yield prisma.quoteRequest.create({
            data: {
                homeownerId: homeowner2.id,
                homeownerName: homeowner2.name,
                projectTitle: 'Garden Decking Installation',
                projectDescription: 'Looking for quotes to install a wooden deck in back garden. Approximately 20 square meters. Need quality materials and professional finish.',
                category: 'Carpentry',
                location: 'Manchester, UK',
                budget: '£3000-£5000',
                urgency: 'Low',
                contactDetails: {
                    name: 'Sarah Johnson',
                    email: 'sarah.johnson@example.com',
                    phone: '+44 7700 900456',
                },
                maxResponses: 5,
                responses: [
                    {
                        id: crypto.randomUUID(),
                        tradespersonId: tradesperson3.id,
                        tradespersonName: tradesperson3.name,
                        quotedPrice: 4200,
                        description: 'Premium composite decking with 25-year warranty. Includes all materials and labor.',
                        timeline: '2 weeks',
                        paidAmount: 10,
                        membershipDiscount: 2,
                        createdAt: new Date().toISOString(),
                        status: 'pending',
                    },
                ],
            },
        });
        const quoteRequest2 = yield prisma.quoteRequest.create({
            data: {
                homeownerId: homeowner3.id,
                homeownerName: homeowner3.name,
                projectTitle: 'Central Heating System Upgrade',
                projectDescription: 'Need to replace old boiler and upgrade radiators throughout the house. 4-bedroom property. Looking for energy-efficient solution.',
                category: 'Heating',
                location: 'Birmingham, UK',
                budget: '£5000-£8000',
                urgency: 'Medium',
                contactDetails: {
                    name: 'Michael Brown',
                    email: 'michael.brown@example.com',
                    phone: '+44 7700 900789',
                },
                maxResponses: 5,
                responses: [
                    {
                        id: crypto.randomUUID(),
                        tradespersonId: tradesperson1.id,
                        tradespersonName: tradesperson1.name,
                        quotedPrice: 6800,
                        description: 'Worcester Bosch combi boiler with 10-year warranty. All new radiators and thermostatic valves.',
                        timeline: '1 week',
                        paidAmount: 12,
                        membershipDiscount: 3,
                        createdAt: new Date().toISOString(),
                        status: 'accepted',
                    },
                ],
            },
        });
        const quoteRequest3 = yield prisma.quoteRequest.create({
            data: {
                homeownerId: homeowner1.id,
                homeownerName: homeowner1.name,
                projectTitle: 'Living Room Interior Painting',
                projectDescription: 'Professional painting service needed for large living room. High ceilings, feature wall, and woodwork. Quality finish essential.',
                category: 'Painting',
                location: 'London, UK',
                budget: '£1000-£1500',
                urgency: 'Low',
                contactDetails: {
                    name: 'John Smith',
                    email: 'john.smith@example.com',
                    phone: '+44 7700 900123',
                },
                maxResponses: 5,
            },
        });
        // Create Reviews
        console.log('⭐ Creating reviews...');
        yield prisma.review.create({
            data: {
                jobId: jobLead2.id,
                tradespersonId: tradesperson2.id,
                homeownerId: homeowner2.id,
                rating: 5,
                comment: 'Excellent work! Emma was professional, punctual, and the rewiring was completed to a very high standard. Highly recommend!',
            },
        });
        yield prisma.review.create({
            data: {
                jobId: jobLead1.id,
                tradespersonId: tradesperson1.id,
                homeownerId: homeowner1.id,
                rating: 5,
                comment: 'David did an amazing job with our kitchen plumbing. Very knowledgeable and tidy. Would definitely use again.',
            },
        });
        yield prisma.review.create({
            data: {
                jobId: jobLead3.id,
                tradespersonId: tradesperson3.id,
                homeownerId: homeowner3.id,
                rating: 4,
                comment: 'Good quality work on the wardrobes. Took a bit longer than expected but the final result is great.',
            },
        });
        yield prisma.review.create({
            data: {
                jobId: crypto.randomUUID(),
                tradespersonId: tradesperson1.id,
                homeownerId: homeowner3.id,
                rating: 5,
                comment: 'Fixed our bathroom leak quickly and efficiently. Great service!',
            },
        });
        yield prisma.review.create({
            data: {
                jobId: crypto.randomUUID(),
                tradespersonId: tradesperson2.id,
                homeownerId: homeowner1.id,
                rating: 5,
                comment: 'Emma installed new lighting throughout our house. Professional and reasonably priced.',
            },
        });
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Homeowners: 3`);
        console.log(`   - Tradespeople: 5`);
        console.log(`   - Job Leads: 5`);
        console.log(`   - Quote Requests: 3`);
        console.log(`   - Reviews: 5`);
        console.log('\n🔑 Test Credentials (all users):');
        console.log(`   Email: [user email from above]`);
        console.log(`   Password: password123`);
        console.log('\n📧 Sample Users:');
        console.log(`   Homeowner: john.smith@example.com`);
        console.log(`   Tradesperson: david.wilson@example.com`);
    });
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
