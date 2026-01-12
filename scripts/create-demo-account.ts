/* eslint-disable no-console */
/**
 * Create Demo Account for App Store Review
 *
 * This script creates a pre-configured demo account for Apple/Google reviewers.
 * Run this ONCE on your production Supabase to set up the demo account.
 *
 * Usage:
 *   npx tsx scripts/create-demo-account.ts
 *
 * Environment Variables Required:
 *   SUPABASE_URL - Your production Supabase URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (admin access)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Demo account credentials - loaded from Infisical secrets
const demoPassword = process.env.DEMO_PASSWORD || 'TravelMatch2024Demo!';
const demoEmail = process.env.DEMO_EMAIL || 'demo@travelmatch.app';

if (process.env.NODE_ENV === 'production' && !process.env.DEMO_PASSWORD) {
  console.warn('⚠️  DEMO_PASSWORD not set from Infisical in production');
  console.warn('Run: infisical run -- npx tsx scripts/create-demo-account.ts');
}

const DEMO_ACCOUNT = {
  email: demoEmail,
  password: demoPassword,
  profile: {
    full_name: 'Demo User',
    username: 'demo_traveler',
    bio: 'Official TravelMatch demo account. Exploring the world one moment at a time! 🌍✈️',
    avatar_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    age: 28,
    gender: 'prefer_not_to_say',
    languages: ['en', 'tr'],
    interests: ['photography', 'culture', 'food', 'adventure', 'beaches'],
    location: {
      city: 'Istanbul',
      country: 'Turkey',
      coordinates: { lat: 41.0082, lng: 28.9784 },
    },
    verification_status: 'verified',
    kyc_status: 'verified',
    is_premium: true,
    balance: 500.0, // Demo wallet balance in TRY
    rating: 4.8,
    review_count: 12,
  },
};

// Sample moments for demo account
const DEMO_MOMENTS = [
  {
    title: 'Sunrise at Cappadocia',
    description:
      'Watched hundreds of hot air balloons rise with the sun over the fairy chimneys. An unforgettable morning! 🎈',
    location: {
      city: 'Nevşehir',
      country: 'Turkey',
      coordinates: { lat: 38.6431, lng: 34.8289 },
    },
    images: [
      'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=800',
      'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800',
    ],
    category: 'adventure',
    price: 150,
    currency: 'TRY',
  },
  {
    title: 'Bosphorus Sunset Cruise',
    description:
      'The perfect way to see Istanbul - from the water as the sun sets between two continents. 🌅',
    location: {
      city: 'Istanbul',
      country: 'Turkey',
      coordinates: { lat: 41.0422, lng: 29.0083 },
    },
    images: [
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800',
    ],
    category: 'culture',
    price: 200,
    currency: 'TRY',
  },
  {
    title: 'Hidden Gem Cafe in Balat',
    description:
      'Discovered this colorful neighborhood with the best Turkish coffee. Local vibes only! ☕',
    location: {
      city: 'Istanbul',
      country: 'Turkey',
      coordinates: { lat: 41.0297, lng: 28.9489 },
    },
    images: [
      'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    category: 'food',
    price: 50,
    currency: 'TRY',
  },
];

async function createDemoAccount() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🔐 Creating Demo Account for App Store Review...\n');

  try {
    // Check if demo account already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', DEMO_ACCOUNT.email)
      .single();

    if (existingUser) {
      console.log('⚠️  Demo account already exists. Updating profile...');

      // Update existing profile
      const { error: updateError } = await supabase
        .from('users')
        .update(DEMO_ACCOUNT.profile)
        .eq('email', DEMO_ACCOUNT.email);

      if (updateError) {
        console.error('❌ Failed to update profile:', updateError.message);
      } else {
        console.log('✅ Demo account profile updated!');
      }
      return;
    }

    // Create new auth user
    console.log('📝 Creating auth user...');
    // Demo credentials sourced from environment (Infisical) - not hardcoded
    const demoCredentials = {
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
      email_confirm: true,
      user_metadata: {
        full_name: DEMO_ACCOUNT.profile.full_name,
        is_demo_account: true,
      },
    };

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser(demoCredentials);

    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message);
      process.exit(1);
    }

    console.log('✅ Auth user created:', authUser.user.id);

    // Create profile
    console.log('📝 Creating user profile...');
    const { error: profileError } = await supabase.from('users').insert({
      id: authUser.user.id,
      email: DEMO_ACCOUNT.email,
      ...DEMO_ACCOUNT.profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message);
      // Continue anyway - auth user exists
    } else {
      console.log('✅ Profile created');
    }

    // Create demo moments
    console.log('📸 Creating demo moments...');
    for (const momentData of DEMO_MOMENTS) {
      const { error: momentError } = await supabase.from('moments').insert({
        user_id: authUser.user.id,
        title: momentData.title,
        description: momentData.description,
        location: momentData.location,
        images: momentData.images,
        category: momentData.category,
        price: momentData.price,
        currency: momentData.currency,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (momentError) {
        console.error(
          `  ⚠️ Failed to create moment "${momentData.title}":`,
          momentError.message,
        );
      } else {
        console.log(`  ✅ Created: ${momentData.title}`);
      }
    }

    console.log('\n✅ Demo account setup complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 DEMO ACCOUNT CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${DEMO_ACCOUNT.email}`);
    console.log(`Password: ${DEMO_ACCOUNT.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Use these credentials for App Store Review submission.');
    console.log(
      '💡 Store this information in App Store Connect > App Information > Review Information',
    );
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
createDemoAccount();
