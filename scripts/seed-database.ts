/**
 * Database Seed Script for Lovendo
 * 
 * Generates realistic test data for local development:
 * - 20 test users with profiles
 * - 50 travel moments with media
 * - 100 reviews and ratings
 * - 30 conversations with messages
 * - Sample transactions and requests
 * 
 * Usage:
 *   pnpm seed:local     # Seed local database
 *   pnpm seed:staging   # Seed staging environment
 * 
 * WARNING: Never run on production!
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Safety check
if (SUPABASE_URL.includes('production') || SUPABASE_URL.includes('prod')) {
  console.error('🚨 DANGER: This script cannot run on production!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test data configuration
const CONFIG = {
  USERS: 20,
  MOMENTS_PER_USER: 2-3,
  REVIEWS_PER_USER: 3-5,
  CONVERSATIONS: 30,
  MESSAGES_PER_CONVERSATION: 5-15,
  TRANSACTIONS: 50,
  REQUESTS: 40,
};

// Sample cities for realistic travel moments
const CITIES = [
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Bali', country: 'Indonesia', lat: -8.3405, lng: 115.092 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
];

const INTERESTS = [
  'photography', 'hiking', 'food', 'culture', 'adventure', 
  'beaches', 'nightlife', 'architecture', 'history', 'art',
  'music', 'sports', 'wellness', 'luxury', 'budget-travel',
];

const LANGUAGES = ['en', 'es', 'fr', 'de', 'tr', 'ja', 'zh', 'ar'];

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Seeding functions
async function seedUsers() {
  console.log('\n📝 Seeding users...');
  const users = [];

  // Get test password from environment or generate a secure random one
  const testPassword = process.env.SEED_TEST_PASSWORD;
  if (!testPassword) {
    console.error('❌ SEED_TEST_PASSWORD environment variable is required');
    console.error('   Set it in .env or pass via CLI: SEED_TEST_PASSWORD=YourSecurePassword123!');
    process.exit(1);
  }

  for (let i = 0; i < CONFIG.USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: testPassword, // From environment variable
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
      },
    });

    if (authError) {
      console.error(`  ❌ Failed to create user ${email}:`, authError.message);
      continue;
    }

    // Create profile
    const profile = {
      id: authUser.user.id,
      full_name: `${firstName} ${lastName}`,
      username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
      bio: faker.lorem.sentence(),
      avatar_url: faker.image.avatar(),
      age: randomInt(18, 65),
      gender: randomElement(['male', 'female', 'other', 'prefer_not_to_say']),
      languages: randomElements(LANGUAGES, randomInt(1, 3)),
      interests: randomElements(INTERESTS, randomInt(3, 7)),
      location: {
        city: faker.location.city(),
        country: faker.location.country(),
      },
      verification_status: randomElement(['unverified', 'pending', 'verified']),
      is_premium: Math.random() > 0.7, // 30% premium users
      created_at: randomDate(new Date('2024-01-01'), new Date()).toISOString(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profile);

    if (profileError) {
      console.error(`  ❌ Failed to create profile for ${email}:`, profileError.message);
      continue;
    }

    users.push({ ...authUser.user, profile });
    console.log(`  ✅ Created user: ${email}`);
  }

  console.log(`✅ Seeded ${users.length} users`);
  return users;
}

async function seedMoments(users: any[]) {
  console.log('\n📸 Seeding moments...');
  const moments = [];

  for (const user of users) {
    const momentCount = randomInt(2, 5);
    
    for (let i = 0; i < momentCount; i++) {
      const city = randomElement(CITIES);
      const startDate = randomDate(new Date('2023-01-01'), new Date());
      const endDate = new Date(startDate.getTime() + randomInt(1, 14) * 24 * 60 * 60 * 1000);

      const moment = {
        user_id: user.id,
        title: `${faker.lorem.words(3)} in ${city.name}`,
        description: faker.lorem.paragraph(),
        location: {
          city: city.name,
          country: city.country,
          coordinates: {
            lat: city.lat,
            lng: city.lng,
          },
        },
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        media: [
          {
            type: 'image',
            url: faker.image.urlLoremFlickr({ category: 'travel' }),
            thumbnail_url: faker.image.urlLoremFlickr({ category: 'travel', width: 200, height: 200 }),
          },
          {
            type: 'image',
            url: faker.image.urlLoremFlickr({ category: 'city' }),
            thumbnail_url: faker.image.urlLoremFlickr({ category: 'city', width: 200, height: 200 }),
          },
        ],
        tags: randomElements(INTERESTS, randomInt(2, 5)),
        is_public: Math.random() > 0.2, // 80% public
        view_count: randomInt(0, 1000),
        like_count: randomInt(0, 200),
        comment_count: randomInt(0, 50),
        created_at: startDate.toISOString(),
      };

      const { data, error } = await supabase
        .from('moments')
        .insert(moment)
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Failed to create moment:`, error.message);
        continue;
      }

      moments.push(data);
    }
  }

  console.log(`✅ Seeded ${moments.length} moments`);
  return moments;
}

async function seedReviews(users: any[], moments: any[]) {
  console.log('\n⭐ Seeding reviews...');
  const reviews = [];

  for (const user of users) {
    const reviewCount = randomInt(3, 7);
    
    for (let i = 0; i < reviewCount; i++) {
      const targetUser = randomElement(users.filter(u => u.id !== user.id));
      
      const review = {
        reviewer_id: user.id,
        reviewee_id: targetUser.id,
        rating: randomInt(3, 5), // Mostly positive reviews
        comment: faker.lorem.paragraph(),
        travel_compatibility: randomInt(3, 5),
        communication: randomInt(3, 5),
        reliability: randomInt(3, 5),
        created_at: randomDate(new Date('2024-01-01'), new Date()).toISOString(),
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Failed to create review:`, error.message);
        continue;
      }

      reviews.push(data);
    }
  }

  console.log(`✅ Seeded ${reviews.length} reviews`);
  return reviews;
}

async function seedConversations(users: any[]) {
  console.log('\n💬 Seeding conversations...');
  const conversations = [];

  for (let i = 0; i < CONFIG.CONVERSATIONS; i++) {
    const [user1, user2] = randomElements(users, 2);
    
    const conversation = {
      participant_1_id: user1.id,
      participant_2_id: user2.id,
      last_message_at: randomDate(new Date('2024-01-01'), new Date()).toISOString(),
      created_at: randomDate(new Date('2023-06-01'), new Date()).toISOString(),
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Failed to create conversation:`, error.message);
      continue;
    }

    // Add messages
    const messageCount = randomInt(5, 20);
    const participants = [user1.id, user2.id];
    
    for (let j = 0; j < messageCount; j++) {
      const senderId = randomElement(participants);
      const message = {
        conversation_id: data.id,
        sender_id: senderId,
        content: faker.lorem.sentence(),
        created_at: randomDate(new Date(conversation.created_at), new Date()).toISOString(),
      };

      await supabase.from('messages').insert(message);
    }

    conversations.push(data);
  }

  console.log(`✅ Seeded ${conversations.length} conversations`);
  return conversations;
}

async function seedTransactions(users: any[]) {
  console.log('\n💰 Seeding transactions...');
  const transactions = [];

  for (let i = 0; i < CONFIG.TRANSACTIONS; i++) {
    const user = randomElement(users);
    const amount = randomInt(10, 500);
    
    const transaction = {
      user_id: user.id,
      type: randomElement(['payment', 'refund', 'payout', 'fee']),
      amount,
      currency: 'USD',
      status: randomElement(['pending', 'completed', 'failed', 'cancelled']),
      description: faker.finance.transactionDescription(),
      payment_method: randomElement(['credit_card', 'paypal', 'bank_transfer']),
      created_at: randomDate(new Date('2024-01-01'), new Date()).toISOString(),
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Failed to create transaction:`, error.message);
      continue;
    }

    transactions.push(data);
  }

  console.log(`✅ Seeded ${transactions.length} transactions`);
  return transactions;
}

async function seedTravelRequests(users: any[], moments: any[]) {
  console.log('\n✈️ Seeding travel requests...');
  const requests = [];

  for (let i = 0; i < CONFIG.REQUESTS; i++) {
    const requester = randomElement(users);
    const moment = randomElement(moments.filter(m => m.user_id !== requester.id));
    
    const request = {
      requester_id: requester.id,
      moment_id: moment.id,
      recipient_id: moment.user_id,
      message: faker.lorem.paragraph(),
      status: randomElement(['pending', 'accepted', 'rejected', 'cancelled']),
      created_at: randomDate(new Date('2024-01-01'), new Date()).toISOString(),
    };

    const { data, error } = await supabase
      .from('travel_requests')
      .insert(request)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Failed to create travel request:`, error.message);
      continue;
    }

    requests.push(data);
  }

  console.log(`✅ Seeded ${requests.length} travel requests`);
  return requests;
}

// Main seeding function
async function seed() {
  console.log('🌱 Starting database seeding...\n');
  console.log(`📍 Target: ${SUPABASE_URL}`);
  console.log('⚠️  This will create test data in the database.\n');

  try {
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Failed to connect to database:', error.message);
      process.exit(1);
    }
    console.log('✅ Database connection successful\n');

    // Seed data in order (respecting foreign key constraints)
    const users = await seedUsers();
    const moments = await seedMoments(users);
    const reviews = await seedReviews(users, moments);
    const conversations = await seedConversations(users);
    const transactions = await seedTransactions(users);
    const requests = await seedTravelRequests(users, moments);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Moments: ${moments.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log(`   Conversations: ${conversations.length}`);
    console.log(`   Transactions: ${transactions.length}`);
    console.log(`   Travel Requests: ${requests.length}`);
    console.log('\n🔑 Test Account Credentials:');
    console.log('   All test users have the same password: Test1234!');
    console.log(`   Example: ${users[0]?.email} / Test1234!`);
    console.log('\n💡 Tip: Use any of the seeded user emails to login');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log(`
Lovendo Database Seed Script

Usage:
  pnpm seed:local     # Seed local Supabase database
  pnpm seed:staging   # Seed staging environment
  node seed-database.ts --help  # Show this help

Environment Variables:
  SUPABASE_URL              # Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY # Service role key (admin access)

Safety:
  - Script will refuse to run if URL contains 'production' or 'prod'
  - Always test on local/staging first
  - Never run on production database!
  `);
  process.exit(0);
}

// Run the seeding
seed();
