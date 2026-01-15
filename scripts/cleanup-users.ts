import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from apps/admin/.env.local
dotenv.config({ path: path.resolve(__dirname, '../apps/admin/.env.local') });

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Cannot run cleanup.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const KEEP_EMAILS = ['kemal@weareasocial.com'];

async function reliableCleanup() {
  console.log('Starting reliable cleanup...');
  let processing = true;
  let totalDeleted = 0;

  while (processing) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) {
      console.error('List error:', error);
      break;
    }

    const usersToDelete = data.users.filter(
      (u) => u.email && !KEEP_EMAILS.includes(u.email),
    );

    if (usersToDelete.length === 0) {
      console.log('No more users to delete.');
      processing = false;
      break;
    }

    console.log(
      `Found ${usersToDelete.length} users to delete in this batch...`,
    );

    // Parallelize for speed, but limit concurrency to avoid rate limits
    for (const user of usersToDelete) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) {
        console.error(`Failed to delete ${user.email}: ${delError.message}`);
      } else {
        console.log(`Deleted ${user.email}`);
        totalDeleted++;
      }
    }
  }
  console.log(`Cleanup complete. Deleted total: ${totalDeleted} users.`);
}

reliableCleanup().catch((e) => console.error(e));
