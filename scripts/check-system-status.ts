// Script to check system status and data presence
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
// When running from root or elsewhere, process.cwd() might be different.
// Since we are running this usually from root or apps/admin, let's try to locate the file.
const envPath = path.resolve(process.cwd(), '.env.local');
// If running from apps/admin, cwd is apps/admin, so .env.local is right there.
dotenv.config({ path: envPath });

async function checkSystem() {
  console.log('🔍 Checking System Status...\n');

  // Check Env Vars
  console.log('1. Environment Variables:');
  const vars = {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SENTRY_DSN: !!process.env.SENTRY_DSN,
    POSTHOG_API_KEY:
      !!process.env.EXPO_PUBLIC_POSTHOG_API_KEY ||
      !!process.env.POSTHOG_API_KEY,
  };

  Object.entries(vars).forEach(([key, exists]) => {
    console.log(`   ${exists ? '✅' : '❌'} ${key}`);
  });

  if (!vars.SUPABASE_URL || !vars.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ Critical: Missing Supabase keys. Cannot check DB.');
    return;
  }

  // Check DB Connection & Counts
  console.log('\n2. Database Counts (Real Data):');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const tables = [
    'users',
    'moments',
    'escrow_transactions',
    'disputes',
    'profiles',
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (error) {
        // Some tables might not exist or have different names, check politely
        if (error.code === '42P01') {
          console.log(`   🔸 ${table}: (Table not found)`);
        } else {
          console.log(`   ❌ ${table}: Error ${error.message}`);
        }
      } else {
        console.log(`   📊 ${table}: ${count} rows`);
      }
    } catch (e) {
      console.log(`   ❌ ${table}: Failed to query`);
    }
  }

  console.log('\n✅ System check complete.');
}

checkSystem().catch(console.error);
