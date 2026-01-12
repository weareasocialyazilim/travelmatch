import { createClient } from '@supabase/supabase-js';

// Test with anon key (simulating client-side)
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Test with service role (bypasses RLS)
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function check() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || 'kemal@weareasocial.com';

  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD not set');
    console.error('Run: infisical run -- npx tsx scripts/check-admin.ts');
    process.exit(1);
  }

  console.log('=== Testing with ANON KEY (client-side simulation) ===');

  // First sign in
  const { data: authData, error: authError } =
    await anonClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

  console.log('Auth result:', authError ? authError.message : 'SUCCESS');
  console.log('User ID:', authData?.user?.id);

  if (authData?.user) {
    // Now query admin_users
    const { data, error } = await anonClient
      .from('admin_users')
      .select('*')
      .eq('email', 'kemal@weareasocial.com')
      .eq('is_active', true)
      .single();

    console.log('\nAdmin users query (anon):');
    console.log('Data:', data ? JSON.stringify(data, null, 2) : 'NULL');
    console.log('Error:', error ? error.message : 'none');
  }

  console.log('\n=== Testing with SERVICE ROLE (bypasses RLS) ===');
  const { data: serviceData, error: serviceError } = await serviceClient
    .from('admin_users')
    .select('*')
    .eq('email', 'kemal@weareasocial.com')
    .single();

  console.log(
    'Data:',
    serviceData ? JSON.stringify(serviceData, null, 2) : 'NULL',
  );
  console.log('Error:', serviceError ? serviceError.message : 'none');
}

check();
