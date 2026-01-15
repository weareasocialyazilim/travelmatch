import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Cleaning up admin_users table...');

  // Delete all admin users except kemal@weareasocial.com
  const { data, error } = await supabase
    .from('admin_users')
    .delete()
    .neq('email', 'kemal@weareasocial.com')
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Deleted ${data?.length || 0} admin users`);
  }

  // List remaining admin users
  const { data: remaining } = await supabase
    .from('admin_users')
    .select('email, role, is_active');

  console.log('Remaining admin users:', remaining);
}

main();
