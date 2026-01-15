import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function check() {
  console.log('=== Database Schema Check ===\n');

  // Check users table schema
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (usersError) {
    console.log('Users error:', usersError.message);
  } else {
    console.log(
      'Users columns:',
      users?.[0] ? Object.keys(users[0]).join(', ') : 'empty table',
    );
  }

  // Check if is_active column exists in users
  const { error: activeError } = await supabase
    .from('users')
    .select('id')
    .eq('is_active', true)
    .limit(1);

  console.log('users.is_active check:', activeError?.message || 'OK');

  // Check kyc_verifications table
  const { data: kyc, error: kycError } = await supabase
    .from('kyc_verifications')
    .select('*')
    .limit(1);

  console.log('\nKYC table:', kycError?.message || 'OK');
  if (kyc?.[0]) console.log('KYC columns:', Object.keys(kyc[0]).join(', '));

  // Check disputes table
  const { data: disputes, error: disputesError } = await supabase
    .from('disputes')
    .select('*')
    .limit(1);

  console.log('\nDisputes table:', disputesError?.message || 'OK');
  if (disputes?.[0])
    console.log('Disputes columns:', Object.keys(disputes[0]).join(', '));

  // Check vip_subscriptions table
  const { data: vip, error: vipError } = await supabase
    .from('vip_subscriptions')
    .select('*')
    .limit(1);

  console.log('\nVIP subscriptions:', vipError?.message || 'OK');
  if (vip?.[0]) console.log('VIP columns:', Object.keys(vip[0]).join(', '));

  // List all tables
  const { data: tables, error: tablesError } =
    await supabase.rpc('get_table_names');

  if (!tablesError && tables) {
    console.log('\n=== All Tables ===');
    console.log(tables);
  }
}

check();
