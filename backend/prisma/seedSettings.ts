
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Settings...');

  const settings = [
    {
      key: 'default_lead_price',
      value: 9.99
    },
    {
      key: 'max_lead_purchases',
      value: 6
    },
    {
      key: 'directory_price',
      value: 0.99
    },
    {
      key: 'social_media_links',
      value: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      }
    },
    {
      key: 'boost_plan_prices',
      value: {
        '1_week_boost': { name: '1 Week Boost', price: 19.99, duration: 7 },
        '1_month_boost': { name: '1 Month Boost', price: 49.99, duration: 30 },
        '3_month_boost': { name: '3 Month Boost', price: 99.99, duration: 90 },
        '5_year_unlimited': { name: '5 Year Unlimited Leads', price: 995.00, duration: 1825 }
      }
    }
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value
      }
    });
  }

  console.log('✅ Settings seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
