#!/usr/bin/env node

/**
 * Interactive .env Setup CLI
 * 
 * Automatically creates and populates .env files across the monorepo
 * Guides developers through required configuration
 * 
 * Usage:
 *   npm run setup:env
 *   pnpm setup:env
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Environment templates
const ENV_TEMPLATES = {
  mobile: {
    path: 'apps/mobile/.env',
    description: 'Mobile App (React Native + Expo)',
    required: [
      { key: 'EXPO_PUBLIC_SUPABASE_URL', desc: 'Supabase Project URL', example: 'https://xxxxx.supabase.co' },
      { key: 'EXPO_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase Anonymous Key (safe to expose)', example: 'eyJhbGci...' },
    ],
    optional: [
      { key: 'EXPO_PUBLIC_APP_ENV', desc: 'App Environment', example: 'development', default: 'development' },
      { key: 'EXPO_PUBLIC_SENTRY_DSN', desc: 'Sentry Error Tracking DSN', example: 'https://xxxxx@xxxxx.ingest.sentry.io/xxxxx' },
      { key: 'EXPO_PUBLIC_GOOGLE_ANALYTICS_ID', desc: 'Google Analytics ID', example: 'G-XXXXXXXXXX' },
      { key: 'EXPO_PUBLIC_STRIPE_KEY', desc: 'Stripe Publishable Key', example: 'pk_test_xxxxx' },
    ],
  },
  admin: {
    path: 'admin/.env',
    description: 'Admin Panel (React + Vite)',
    required: [
      { key: 'VITE_SUPABASE_URL', desc: 'Supabase Project URL', example: 'https://xxxxx.supabase.co' },
      { key: 'VITE_SUPABASE_ANON_KEY', desc: 'Supabase Anonymous Key', example: 'eyJhbGci...' },
    ],
    optional: [],
  },
  root: {
    path: '.env',
    description: 'Root Environment (Supabase CLI & Services)',
    required: [],
    optional: [
      { key: 'SUPABASE_ACCESS_TOKEN', desc: 'Supabase CLI Access Token', example: 'sbp_xxxxx' },
      { key: 'SUPABASE_SERVICE_KEY', desc: 'Supabase Service Role Key (SERVER ONLY)', example: 'eyJhbGci...' },
      { key: 'OPENAI_API_KEY', desc: 'OpenAI API Key (for AI features)', example: 'sk-xxxxx' },
      { key: 'STRIPE_SECRET_KEY', desc: 'Stripe Secret Key (SERVER ONLY)', example: 'sk_test_xxxxx' },
      { key: 'STRIPE_WEBHOOK_SECRET', desc: 'Stripe Webhook Secret', example: 'whsec_xxxxx' },
    ],
  },
  docker: {
    path: '.env.local',
    description: 'Docker Compose (Local Development Stack)',
    required: [
      { key: 'JWT_SECRET', desc: 'JWT Secret (min 32 chars)', example: 'super-secret-jwt-token-with-at-least-32-characters-long', default: 'super-secret-jwt-token-with-at-least-32-characters-long' },
    ],
    optional: [
      { key: 'REDIS_PASSWORD', desc: 'Redis Password', example: 'travelmatch-redis-dev-password', default: 'travelmatch-redis-dev-password' },
      { key: 'GRAFANA_ADMIN_USER', desc: 'Grafana Admin Username', example: 'admin', default: 'admin' },
      { key: 'GRAFANA_ADMIN_PASSWORD', desc: 'Grafana Admin Password', example: 'admin', default: 'admin' },
      { key: 'MINIO_ROOT_USER', desc: 'MinIO Root User', example: 'minioadmin', default: 'minioadmin' },
      { key: 'MINIO_ROOT_PASSWORD', desc: 'MinIO Root Password', example: 'minioadmin', default: 'minioadmin' },
    ],
  },
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createEnvFile(filePath, content) {
  ensureDirectoryExists(filePath);
  fs.writeFileSync(filePath, content, 'utf-8');
}

function readExistingEnv(filePath) {
  if (!fileExists(filePath)) return {};
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  
  return env;
}

async function setupEnvironment(name, config) {
  const fullPath = path.join(process.cwd(), config.path);
  
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`📦 ${config.description}`, 'bright');
  log(`📁 ${config.path}`, 'dim');
  log('='.repeat(60), 'bright');
  
  // Check if file exists
  const exists = fileExists(fullPath);
  if (exists) {
    log(`\n⚠️  File already exists: ${config.path}`, 'yellow');
    const overwrite = await question('Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('⏭️  Skipping...', 'yellow');
      return;
    }
  }
  
  // Read existing values (if any)
  const existingEnv = exists ? readExistingEnv(fullPath) : {};
  const envContent = [];
  
  // Add header
  envContent.push('# Auto-generated by setup-env.js');
  envContent.push(`# Created: ${new Date().toISOString()}`);
  envContent.push('# DO NOT commit this file to version control');
  envContent.push('');
  
  // Required variables
  if (config.required.length > 0) {
    envContent.push('# ============================================');
    envContent.push('# Required Configuration');
    envContent.push('# ============================================');
    envContent.push('');
    
    for (const variable of config.required) {
      log(`\n${colors.bright}${variable.key}${colors.reset}`, 'green');
      log(`  ${variable.desc}`, 'dim');
      log(`  Example: ${variable.example}`, 'dim');
      
      const existing = existingEnv[variable.key];
      const defaultValue = existing || '';
      const prompt = existing 
        ? `  Current: ${existing.substring(0, 30)}... (press Enter to keep): `
        : '  Value: ';
      
      const value = await question(prompt);
      const finalValue = value || defaultValue;
      
      if (!finalValue) {
        log(`  ⚠️  Warning: ${variable.key} is required but not set`, 'yellow');
      }
      
      envContent.push(`# ${variable.desc}`);
      envContent.push(`${variable.key}=${finalValue}`);
      envContent.push('');
    }
  }
  
  // Optional variables
  if (config.optional.length > 0) {
    envContent.push('# ============================================');
    envContent.push('# Optional Configuration');
    envContent.push('# ============================================');
    envContent.push('');
    
    const configureOptional = await question('\nConfigure optional variables? (y/N): ');
    
    if (configureOptional.toLowerCase() === 'y') {
      for (const variable of config.optional) {
        log(`\n${colors.bright}${variable.key}${colors.reset}`, 'cyan');
        log(`  ${variable.desc}`, 'dim');
        if (variable.example) {
          log(`  Example: ${variable.example}`, 'dim');
        }
        
        const existing = existingEnv[variable.key];
        const defaultValue = existing || variable.default || '';
        const prompt = existing
          ? `  Current: ${existing} (press Enter to keep): `
          : variable.default
          ? `  Value (default: ${variable.default}): `
          : '  Value (optional): ';
        
        const value = await question(prompt);
        const finalValue = value || defaultValue;
        
        envContent.push(`# ${variable.desc}`);
        envContent.push(`${variable.key}=${finalValue}`);
        envContent.push('');
      }
    } else {
      // Add commented placeholders
      for (const variable of config.optional) {
        envContent.push(`# ${variable.desc}`);
        envContent.push(`# ${variable.key}=${variable.example || ''}`);
        envContent.push('');
      }
    }
  }
  
  // Security notice
  envContent.push('# ============================================');
  envContent.push('# Security Notice');
  envContent.push('# ============================================');
  envContent.push('# - Never commit this file to git');
  envContent.push('# - Never use EXPO_PUBLIC_* for secrets');
  envContent.push('# - See docs/EXPO_PUBLIC_SECURITY_AUDIT.md');
  envContent.push('');
  
  // Write file
  createEnvFile(fullPath, envContent.join('\n'));
  log(`\n✅ Created: ${config.path}`, 'green');
}

async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 TravelMatch Environment Setup', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  log('This wizard will help you set up environment files for:', 'cyan');
  log('  • Mobile App (React Native)', 'dim');
  log('  • Admin Panel (React)', 'dim');
  log('  • Root (Supabase CLI)', 'dim');
  log('  • Docker Compose (Local Stack)', 'dim');
  log('');
  
  // Ask setup mode
  log('Select setup mode:', 'cyan');
  log('  1. Quick setup (with defaults for local development)', 'dim');
  log('  2. Interactive setup (customize all values)', 'dim');
  log('  3. Docker-only setup (for local development with Docker)', 'dim');
  const mode = await question('\nMode (1/2/3): ');
  
  let selectedTemplates = ENV_TEMPLATES;
  
  if (mode === '3') {
    // Docker-only mode
    selectedTemplates = { docker: ENV_TEMPLATES.docker };
    log('\n🐳 Docker-only mode selected', 'cyan');
    log('This will create .env.local for Docker Compose', 'dim');
  } else if (mode === '1') {
    // Quick setup mode
    log('\n⚡ Quick setup mode selected', 'cyan');
    log('Using sensible defaults for local development...', 'dim');
  }
  
  // Setup each environment
  for (const [name, config] of Object.entries(selectedTemplates)) {
    if (mode === '1') {
      await quickSetupEnvironment(name, config);
    } else {
      await setupEnvironment(name, config);
    }
  }
  
  // Docker Compose instructions
  if (mode === '3' || selectedTemplates.docker) {
    log('\n' + '='.repeat(60), 'bright');
    log('🐳 Docker Compose Setup', 'green');
    log('='.repeat(60), 'bright');
    log('\nNext steps:', 'cyan');
    log('  1. Start the stack: docker-compose up -d', 'dim');
    log('  2. View logs: docker-compose logs -f', 'dim');
    log('  3. Access services:', 'dim');
    log('     • Supabase Studio: http://localhost:3000', 'dim');
    log('     • PostgreSQL: localhost:5432', 'dim');
    log('     • Redis: localhost:6379', 'dim');
    log('     • Redis Insight: http://localhost:8001', 'dim');
    log('     • LocalStack: http://localhost:4566', 'dim');
    log('     • MinIO Console: http://localhost:9001', 'dim');
    log('     • Mailhog: http://localhost:8025', 'dim');
    log('     • Grafana: http://localhost:3001', 'dim');
    log('\n  4. Stop the stack: docker-compose down', 'dim');
    log('  5. Reset data: docker-compose down -v', 'dim');
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'bright');
  log('✅ Environment Setup Complete!', 'green');
  log('='.repeat(60), 'bright');
  
  log('\n📚 Next Steps:', 'cyan');
  log('  1. Review the generated .env files', 'dim');
  log('  2. Add any missing values (check your Supabase dashboard)', 'dim');
  log('  3. Never commit .env files to git', 'dim');
  log('  4. Read: docs/ENVIRONMENT_VARIABLES.md', 'dim');
  log('  5. Read: docs/QUICK_START.md', 'dim');
  
  log('\n🔒 Security Reminders:', 'yellow');
  log('  ⚠️  EXPO_PUBLIC_* variables are embedded in client bundle', 'dim');
  log('  ⚠️  Never use EXPO_PUBLIC_* for secrets (API keys, tokens)', 'dim');
  log('  ⚠️  Use server-side proxies for sensitive operations', 'dim');
  
  log('\n💡 Tips:', 'blue');
  log('  • Re-run this script anytime: npm run setup:env', 'dim');
  log('  • Check .env.example files for reference', 'dim');
  log('  • Use Developer CLI: npm run tm:dev', 'dim');
  log('  • Use Docker: docker-compose up -d', 'dim');
  
  log('');
  rl.close();
}

async function quickSetupEnvironment(name, config) {
  const fullPath = path.join(process.cwd(), config.path);
  
  log(`\n📦 Setting up: ${config.description}`, 'cyan');
  
  const envContent = [];
  envContent.push('# Auto-generated by setup-env.js (Quick Setup)');
  envContent.push(`# Created: ${new Date().toISOString()}`);
  envContent.push('# DO NOT commit this file to version control');
  envContent.push('');
  
  // Add all variables with defaults
  for (const variable of [...config.required, ...config.optional]) {
    const defaultValue = variable.default || variable.example || '';
    envContent.push(`# ${variable.desc}`);
    envContent.push(`${variable.key}=${defaultValue}`);
    envContent.push('');
  }
  
  createEnvFile(fullPath, envContent.join('\n'));
  log(`✅ Created: ${config.path}`, 'green');
}

// Run the wizard
main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  rl.close();
  process.exit(1);
});
