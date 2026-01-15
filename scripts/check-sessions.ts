import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Checking admin_sessions table...');

  const { data: sessions, error } = await supabase
    .from('admin_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Recent sessions:');
    sessions?.forEach((s) => {
      console.log(`- Admin ID: ${s.admin_id}`);
      console.log(`  Token Hash: ${s.token_hash?.substring(0, 20)}...`);
      console.log(`  Expires: ${s.expires_at}`);
      console.log(`  Created: ${s.created_at}`);
      console.log('');
    });
  }

  // Check if the admin exists
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('email', 'kemal@weareasocial.com')
    .single();

  console.log('Admin user:', admin);
}

main();
