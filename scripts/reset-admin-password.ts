/**
 * Reset admin user password
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function resetPassword(email: string, newPassword: string) {
  console.log(`Resetting password for: ${email}`);

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email === email);

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log(`Found user: ${user.id}`);

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Password updated successfully!');
  }
}

const email = process.argv[2] || 'kemal@weareasocial.com';
const password =
  process.argv[3] || process.env.ADMIN_PASSWORD || 'Kemal!Lovendo!Kemal!19875';

resetPassword(email, password);
