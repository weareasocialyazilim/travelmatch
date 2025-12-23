/**
 * TravelMatch Seed Script with Supabase Auth
 *
 * Bu script:
 * 1. Supabase Auth'ta test kullanıcıları oluşturur
 * 2. public.users'a profil verileri ekler
 * 3. Diğer tabloları (moments, requests, vb.) seed eder
 *
 * Kullanım:
 *   npx tsx supabase/scripts/seed-with-auth.ts
 *
 * Ortam değişkenleri (.env veya export):
 *   SUPABASE_URL=https://your-project.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error(
    '   SUPABASE_SERVICE_ROLE_KEY:',
    SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗',
  );
  console.error('\nSet them with:');
  console.error('  export SUPABASE_URL="https://your-project.supabase.co"');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================
// TEST CREDENTIALS (for local development only)
// These are intentionally hardcoded for seeding test data.
// NEVER use these in production environments.
// ============================================
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_PASSWORD = process.env.SEED_TEST_PASSWORD || 'TestPass123!';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123!';

// ============================================
// TEST USERS TO CREATE
// ============================================
const TEST_USERS = [
  {
    email: 'alice@travelmatch.test',
    password: TEST_PASSWORD,
    metadata: {
      full_name: 'Alice Johnson',
      bio: 'Coffee lover ☕ | Istanbul explorer',
      location: 'Istanbul, Turkey',
    },
  },
  {
    email: 'wei@travelmatch.test',
    password: TEST_PASSWORD,
    metadata: {
      full_name: '王伟 (Wang Wei)',
      bio: '我喜欢旅行 🌏',
      location: 'Beijing, China',
    },
  },
  {
    email: 'maria@travelmatch.test',
    password: TEST_PASSWORD,
    metadata: {
      full_name: 'María José García Hernández de la Cruz López',
      bio: 'Hola! Passionate about sharing local Spanish culture with travelers.',
      location: 'Barcelona, Spain',
    },
  },
  {
    email: 'yuki@travelmatch.test',
    password: TEST_PASSWORD,
    metadata: {
      full_name: 'ゆき Yuki',
      bio: '🗾 Tokyo Native | 🍱 Foodie | 🎌 Cultural Guide | 🌸 Sakura Season Expert',
      location: 'Tokyo, Japan',
    },
  },
  {
    email: 'newuser@travelmatch.test',
    password: TEST_PASSWORD,
    metadata: {
      full_name: 'New User',
      bio: null,
      location: 'New York, USA',
    },
  },
  {
    email: 'admin@travelmatch.test',
    password: ADMIN_PASSWORD,
    metadata: {
      full_name: 'Admin User',
      bio: 'TravelMatch Administrator',
      location: 'Remote',
    },
  },
];

// Store created user IDs
const userIds: Record<string, string> = {};

async function createAuthUsers() {
  console.log('\n📧 Creating Auth Users...\n');

  for (const user of TEST_USERS) {
    // First check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === user.email);

    if (existing) {
      console.log(`  ⏭️  ${user.email} already exists (ID: ${existing.id})`);
      userIds[user.email] = existing.id;
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: user.metadata,
    });

    if (error) {
      console.error(`  ❌ Failed to create ${user.email}:`, error.message);
      continue;
    }

    console.log(`  ✅ Created ${user.email} (ID: ${data.user?.id})`);
    userIds[user.email] = data.user!.id;
  }

  console.log('\n📝 User IDs:', userIds);
}

async function syncPublicUsers() {
  console.log('\n👤 Syncing public.users from auth.users...\n');

  // For each auth user, ensure public.users has a matching row
  for (const [email, authId] of Object.entries(userIds)) {
    const userData = TEST_USERS.find((u) => u.email === email);
    if (!userData) continue;

    const languagesMap: Record<string, string[]> = {
      'alice@travelmatch.test': ['en', 'tr'],
      'wei@travelmatch.test': ['zh', 'en'],
      'maria@travelmatch.test': ['es', 'en', 'ca'],
      'yuki@travelmatch.test': ['ja', 'en'],
      'newuser@travelmatch.test': ['en'],
      'admin@travelmatch.test': ['en'],
    };

    const interestsMap: Record<string, string[]> = {
      'alice@travelmatch.test': ['food', 'culture'],
      'wei@travelmatch.test': ['adventure', 'nature'],
      'maria@travelmatch.test': ['food', 'art', 'music'],
      'yuki@travelmatch.test': ['food', 'culture', 'nature'],
      'newuser@travelmatch.test': [],
      'admin@travelmatch.test': [],
    };

    const balanceMap: Record<string, number> = {
      'alice@travelmatch.test': 100.0,
      'wei@travelmatch.test': 250.5,
      'maria@travelmatch.test': 0.0,
      'yuki@travelmatch.test': 0.0,
      'newuser@travelmatch.test': 0.0,
      'admin@travelmatch.test': 0.0,
    };

    const currencyMap: Record<string, string> = {
      'alice@travelmatch.test': 'TRY',
      'wei@travelmatch.test': 'CNY',
      'maria@travelmatch.test': 'EUR',
      'yuki@travelmatch.test': 'JPY',
      'newuser@travelmatch.test': 'USD',
      'admin@travelmatch.test': 'USD',
    };

    const verifiedMap: Record<string, boolean> = {
      'alice@travelmatch.test': true,
      'wei@travelmatch.test': true,
      'maria@travelmatch.test': true,
      'yuki@travelmatch.test': false,
      'newuser@travelmatch.test': false,
      'admin@travelmatch.test': true,
    };

    const { error } = await supabase.from('users').upsert(
      {
        id: authId,
        email: email,
        full_name: userData.metadata.full_name,
        bio: userData.metadata.bio,
        location: userData.metadata.location,
        languages: languagesMap[email] || ['en'],
        interests: interestsMap[email] || [],
        verified: verifiedMap[email] ?? false,
        balance: balanceMap[email] ?? 0,
        currency: currencyMap[email] || 'USD',
      },
      { onConflict: 'id' },
    );

    if (error) {
      console.error(
        `  ❌ Failed to upsert public.users for ${email}:`,
        error.message,
      );
    } else {
      console.log(`  ✅ Synced public.users for ${email}`);
    }
  }
}

async function seedMoments() {
  console.log('\n🌟 Seeding moments...\n');

  const alice = userIds['alice@travelmatch.test'];
  const wei = userIds['wei@travelmatch.test'];
  const maria = userIds['maria@travelmatch.test'];
  const yuki = userIds['yuki@travelmatch.test'];

  if (!alice || !wei || !maria || !yuki) {
    console.error('  ❌ Missing user IDs for moments');
    return;
  }

  const moments = [
    {
      user_id: alice,
      title: 'Secret Rooftop Breakfast in Sultanahmet',
      description:
        'Join me for authentic Turkish breakfast with a stunning view of Hagia Sophia!',
      category: 'food',
      location: 'Sultanahmet, Istanbul',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      price: 45.0,
      currency: 'TRY',
      status: 'active',
      images: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      ],
      tags: ['breakfast', 'rooftop', 'turkish'],
    },
    {
      user_id: wei,
      title: '长城徒步 Great Wall Hiking Adventure',
      description:
        '一起探索未修复的长城段落 Explore unrestored sections of the Great Wall',
      category: 'adventure',
      location: 'Mutianyu, Beijing',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      price: 80.0,
      currency: 'CNY',
      status: 'active',
      images: [
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
      ],
      tags: ['hiking', 'history', 'adventure'],
    },
    {
      user_id: maria,
      title: 'Tapas Tour in Gothic Quarter',
      description:
        "5-stop tapas crawl through Barcelona's oldest neighborhood.",
      category: 'food',
      location: 'Gothic Quarter, Barcelona',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      price: 35.0,
      currency: 'EUR',
      status: 'completed',
      images: [
        'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800',
      ],
      tags: ['food', 'wine', 'culture'],
    },
    {
      user_id: yuki,
      title: 'Free Origami Workshop 🎨',
      description:
        'Teaching traditional Japanese paper folding for free! Bring your curiosity.',
      category: 'culture',
      location: 'Shibuya, Tokyo',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      price: 0.0,
      currency: 'JPY',
      status: 'active',
      images: [
        'https://images.unsplash.com/photo-1582657233895-0f37a3f150c0?w=800',
      ],
      tags: ['art', 'culture', 'free'],
    },
    {
      user_id: alice,
      title: 'Private Bosphorus Yacht Dinner',
      description:
        'Luxury experience: Private yacht, 5-course dinner, live music.',
      category: 'nightlife',
      location: 'Bosphorus, Istanbul',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      price: 500.0,
      currency: 'TRY',
      status: 'active',
      images: [
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
      ],
      tags: ['luxury', 'dinner', 'yacht'],
    },
    {
      user_id: wei,
      title: 'Cancelled Temple Visit',
      description: 'This moment was cancelled due to weather.',
      category: 'culture',
      location: 'Beijing, China',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      price: 20.0,
      currency: 'CNY',
      status: 'cancelled',
      images: [
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      ],
      tags: ['temple', 'culture'],
    },
  ];

  // Delete existing moments for these users first
  await supabase
    .from('moments')
    .delete()
    .in('user_id', [alice, wei, maria, yuki]);

  const { data, error } = await supabase
    .from('moments')
    .insert(moments)
    .select();

  if (error) {
    console.error('  ❌ Failed to seed moments:', error.message);
    return null;
  }

  console.log(`  ✅ Created ${data.length} moments`);
  return data;
}

async function seedRequests(moments: any[]) {
  console.log('\n📬 Seeding requests...\n');

  const alice = userIds['alice@travelmatch.test'];
  const newUser = userIds['newuser@travelmatch.test'];
  const yuki = userIds['yuki@travelmatch.test'];

  if (!alice || !newUser || !moments?.length) {
    console.error('  ❌ Missing data for requests');
    return;
  }

  const breakfastMoment = moments.find((m) =>
    m.title.includes('Rooftop Breakfast'),
  );
  const greatWallMoment = moments.find((m) => m.title.includes('Great Wall'));

  if (!breakfastMoment || !greatWallMoment) {
    console.error('  ❌ Could not find required moments');
    return;
  }

  const requests = [
    {
      moment_id: breakfastMoment.id,
      user_id: newUser,
      message: "Hi! I'm visiting Istanbul next week. Would love to join!",
      status: 'pending',
    },
    {
      moment_id: greatWallMoment.id,
      user_id: alice,
      message: "I've always wanted to visit the Great Wall!",
      status: 'accepted',
    },
    {
      moment_id: breakfastMoment.id,
      user_id: yuki,
      message: 'Sorry, I have to cancel.',
      status: 'cancelled',
    },
  ];

  // Delete existing requests for these users first
  await supabase
    .from('requests')
    .delete()
    .in('user_id', [alice, newUser, yuki]);

  const { data, error } = await supabase
    .from('requests')
    .insert(requests)
    .select();

  if (error) {
    console.error('  ❌ Failed to seed requests:', error.message);
    return;
  }

  console.log(`  ✅ Created ${data.length} requests`);
}

async function seedConversationsAndMessages(moments: any[]) {
  console.log('\n💬 Seeding conversations and messages...\n');

  const alice = userIds['alice@travelmatch.test'];
  const newUser = userIds['newuser@travelmatch.test'];
  const wei = userIds['wei@travelmatch.test'];

  if (!alice || !newUser || !wei || !moments?.length) {
    console.error('  ❌ Missing data for conversations');
    return;
  }

  const breakfastMoment = moments.find((m) =>
    m.title.includes('Rooftop Breakfast'),
  );
  const greatWallMoment = moments.find((m) => m.title.includes('Great Wall'));

  if (!breakfastMoment || !greatWallMoment) {
    console.error('  ❌ Could not find required moments');
    return;
  }

  // Delete existing conversations
  await supabase
    .from('messages')
    .delete()
    .in('sender_id', [alice, newUser, wei]);
  await supabase
    .from('conversations')
    .delete()
    .eq('moment_id', breakfastMoment.id);
  await supabase
    .from('conversations')
    .delete()
    .eq('moment_id', greatWallMoment.id);

  // Create conversations
  const { data: convData, error: convError } = await supabase
    .from('conversations')
    .insert([
      {
        participant_ids: [alice, newUser],
        moment_id: breakfastMoment.id,
      },
      {
        participant_ids: [wei, alice],
        moment_id: greatWallMoment.id,
      },
    ])
    .select();

  if (convError) {
    console.error('  ❌ Failed to seed conversations:', convError.message);
    return;
  }

  console.log(`  ✅ Created ${convData.length} conversations`);

  // Create messages
  const conv1 = convData[0];
  const conv2 = convData[1];

  const { data: msgData, error: msgError } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conv1.id,
        sender_id: newUser,
        content: 'Hi! Is this breakfast still available?',
        type: 'text',
      },
      {
        conversation_id: conv1.id,
        sender_id: alice,
        content: "Yes! I'd be happy to host you.",
        type: 'text',
      },
      {
        conversation_id: conv2.id,
        sender_id: alice,
        content: 'Looking forward to the Great Wall hike!',
        type: 'text',
      },
    ])
    .select();

  if (msgError) {
    console.error('  ❌ Failed to seed messages:', msgError.message);
    return;
  }

  console.log(`  ✅ Created ${msgData.length} messages`);
}

async function seedNotifications() {
  console.log('\n🔔 Seeding notifications...\n');

  const alice = userIds['alice@travelmatch.test'];
  const newUser = userIds['newuser@travelmatch.test'];

  if (!alice || !newUser) {
    console.error('  ❌ Missing user IDs for notifications');
    return;
  }

  // Delete existing notifications
  await supabase.from('notifications').delete().in('user_id', [alice, newUser]);

  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: alice,
        type: 'new_request',
        title: 'New Request!',
        body: 'New User requested to join your breakfast moment.',
        data: { momentTitle: 'Secret Rooftop Breakfast' },
        read: false,
      },
      {
        user_id: newUser,
        type: 'request_accepted',
        title: 'Request Accepted!',
        body: 'Alice accepted your request.',
        data: { momentTitle: 'Secret Rooftop Breakfast' },
        read: true,
      },
    ])
    .select();

  if (error) {
    console.error('  ❌ Failed to seed notifications:', error.message);
    return;
  }

  console.log(`  ✅ Created ${data.length} notifications`);
}

async function seedFavorites(moments: any[]) {
  console.log('\n⭐ Seeding favorites...\n');

  const alice = userIds['alice@travelmatch.test'];
  const newUser = userIds['newuser@travelmatch.test'];

  if (!alice || !newUser || !moments?.length) {
    console.error('  ❌ Missing data for favorites');
    return;
  }

  const yachtMoment = moments.find((m) => m.title.includes('Yacht'));
  const greatWallMoment = moments.find((m) => m.title.includes('Great Wall'));

  if (!yachtMoment || !greatWallMoment) {
    console.error('  ❌ Could not find required moments for favorites');
    return;
  }

  // Delete existing favorites
  await supabase.from('favorites').delete().in('user_id', [alice, newUser]);

  const { data, error } = await supabase
    .from('favorites')
    .insert([
      { user_id: newUser, moment_id: yachtMoment.id },
      { user_id: alice, moment_id: greatWallMoment.id },
    ])
    .select();

  if (error) {
    console.error('  ❌ Failed to seed favorites:', error.message);
    return;
  }

  console.log(`  ✅ Created ${data.length} favorites`);
}

async function main() {
  console.log('🚀 TravelMatch Seed Script with Auth');
  console.log('=====================================');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);

  try {
    // Step 1: Create auth users
    await createAuthUsers();

    // Step 2: Sync public.users
    await syncPublicUsers();

    // Step 3: Seed moments and get their IDs
    const moments = await seedMoments();

    if (moments) {
      // Step 4: Seed related data
      await seedRequests(moments);
      await seedConversationsAndMessages(moments);
      await seedNotifications();
      await seedFavorites(moments);
    }

    console.log('\n✅ Seed completed successfully!\n');

    // Print login credentials
    console.log('🔐 Test Login Credentials:');
    console.log('──────────────────────────');
    TEST_USERS.forEach((u) => {
      console.log(`  ${u.email} / ${u.password}`);
    });
    console.log('');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
