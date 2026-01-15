#!/usr/bin/env node
/**
 * Production Database Setup Script
 * Runs migrations against Supabase production database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Production Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bjikxgtbptrvawkguypv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.log('\nRun with: SUPABASE_SERVICE_KEY=your-key node scripts/setup-production-db.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const MIGRATIONS_DIR = join(__dirname, '../supabase/migrations');

async function runMigration(filename, sql) {
  console.log(`\n📦 Running: ${filename}`);
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (!statement) continue;
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists') || 
            error.message?.includes('does not exist, skipping')) {
          console.log(`  ⚠️  Skipped (already exists)`);
          continue;
        }
        throw error;
      }
    }
    
    console.log(`  ✅ Completed`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Lovendo Production Database Setup\n');
  console.log(`📍 Target: ${SUPABASE_URL}\n`);
  
  // Test connection
  const { data, error } = await supabase.from('_migration_check_').select('*').limit(1);
  
  if (error && !error.message.includes('does not exist')) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Connected to Supabase\n');
  
  // Get migration files
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.includes('.disabled'))
    .sort();
  
  console.log(`📁 Found ${files.length} migration files\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
    const result = await runMigration(file, sql);
    if (result) success++;
    else failed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successful: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
