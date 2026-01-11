/**
 * Script to create an admin user in Supabase
 * Usage: npx tsx scripts/create-admin-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Run: infisical run -- npx tsx scripts/create-admin-user.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser(
  email: string,
  password: string,
  fullName: string,
) {
  console.log(`\n🔄 Creating admin user: ${email}`);

  // Step 1: Create user in Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('ℹ️  User already exists in Auth, checking admin_users...');

      // Get user ID
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find((u) => u.email === email);

      if (existingUser) {
        // Check if in admin_users
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .single();

        if (adminUser) {
          console.log('✅ User already exists in admin_users');
          console.log(`   Role: ${adminUser.role}`);
          console.log(`   Active: ${adminUser.is_active}`);
          return;
        }

        // Add to admin_users
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            id: existingUser.id,
            email,
            full_name: fullName,
            role: 'super_admin',
            is_active: true,
            permissions: ['*'],
          });

        if (insertError) {
          console.error(
            '❌ Failed to add to admin_users:',
            insertError.message,
          );
          return;
        }

        console.log('✅ Added existing user to admin_users as super_admin');
        return;
      }
    } else {
      console.error('❌ Auth error:', authError.message);
      return;
    }
  }

  const userId = authData?.user?.id;

  if (!userId) {
    console.error('❌ No user ID returned');
    return;
  }

  console.log(`✅ User created in Auth: ${userId}`);

  // Step 2: Add to admin_users table
  const { error: adminError } = await supabase.from('admin_users').insert({
    id: userId,
    email,
    full_name: fullName,
    role: 'super_admin',
    is_active: true,
    permissions: ['*'],
  });

  if (adminError) {
    console.error('❌ Failed to add to admin_users:', adminError.message);
    // Cleanup: delete auth user
    await supabase.auth.admin.deleteUser(userId);
    return;
  }

  console.log('✅ Added to admin_users as super_admin');
  console.log('\n🎉 Admin user created successfully!');
  console.log(`   Email: ${email}`);
  console.log(`   Role: super_admin`);
}

// Main
const email = process.argv[2] || 'kemal@weareasocial.com';
const password = process.argv[3] || 'Kem19875KemSupabase';
const fullName = process.argv[4] || 'Kemal Teksal';

createAdminUser(email, password, fullName)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
