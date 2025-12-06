# Supabase Setup Guide - TravelMatch

This guide will help you set up Supabase as the backend for TravelMatch.

## Table of Contents

- [1. Create a Supabase Project](#1-create-a-supabase-project)
- [2. Get Your API Keys](#2-get-your-api-keys)
- [3. Set Up the Database (Migration System)](#3-set-up-the-database-migration-system)
- [4. Set Up Storage Buckets](#4-set-up-storage-buckets)
- [5. Configure Storage Policies](#5-configure-storage-policies)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Name**: TravelMatch (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Frankfurt for Turkey)
5. Wait for the project to be provisioned (~2 minutes)

## 2. Get Your API Keys

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **anon/public key** (safe to use in client)
3. Add them to your `.env` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Set Up the Database (Migration System)

### Option A: Using Supabase CLI (Recommended)

The project now uses a migration-based database management system.

#### Prerequisites

```bash
# Install Supabase CLI (via npm - already in devDependencies)
npm install

# Or install globally
npm install -g supabase
```

#### Link to Your Project

```bash
# Login to Supabase
npx supabase login

# Link to your remote project
npx supabase link --project-ref your-project-ref
```

#### Run Migrations

```bash
# Push migrations to remote database
npm run db:migrate

# Or using CLI directly
npx supabase db push
```

#### Available NPM Scripts

| Command                     | Description                                   |
| --------------------------- | --------------------------------------------- |
| `npm run db:start`          | Start local Supabase instance                 |
| `npm run db:stop`           | Stop local Supabase instance                  |
| `npm run db:reset`          | Reset local database (runs migrations + seed) |
| `npm run db:migrate`        | Push migrations to linked project             |
| `npm run db:migrate:new`    | Create a new migration file                   |
| `npm run db:generate-types` | Generate TypeScript types from schema         |
| `npm run db:diff`           | Show diff between local and remote            |
| `npm run db:status`         | Show Supabase services status                 |

#### Migration Files

Migrations are located in `supabase/migrations/`:

| Migration                             | Description                                  |
| ------------------------------------- | -------------------------------------------- |
| `20241205000000_initial_schema.sql`   | Core tables (users, moments, requests, etc.) |
| `20241205000001_add_indexes.sql`      | Performance indexes                          |
| `20241205000002_enable_rls.sql`       | Row Level Security policies                  |
| `20241205000003_create_functions.sql` | Database functions and triggers              |

### Option B: Manual Setup via Dashboard

1. Go to **SQL Editor** in your Supabase Dashboard
2. Run each migration file in order from `supabase/migrations/`
3. Or run the complete schema from `src/config/supabase.schema.sql`

## Local Development

### Start Local Supabase

```bash
# Start local Supabase (requires Docker)
npm run db:start

# This starts:
# - PostgreSQL on port 54322
# - Supabase Studio on port 54323
# - API on port 54321
```

### Local Environment Variables

Create `.env.local` for local development:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-local-anon-key>
```

### Generate TypeScript Types

```bash
# Generate types from local database
npm run db:generate-types

# This creates src/types/database.types.ts
```

## 4. Set Up Storage Buckets

1. Go to **Storage** in your Supabase Dashboard
2. Create the following buckets:

### avatars (Public)

- Click "New Bucket"
- Name: `avatars`
- Public bucket: ✅ Yes
- Click "Create bucket"

### moments (Public)

- Click "New Bucket"
- Name: `moments`
- Public bucket: ✅ Yes
- Click "Create bucket"

### proofs (Private)

- Click "New Bucket"
- Name: `proofs`
- Public bucket: ❌ No
- Click "Create bucket"

### messages (Private)

- Click "New Bucket"
- Name: `messages`
- Public bucket: ❌ No
- Click "Create bucket"

## 5. Configure Storage Policies

For each bucket, add appropriate policies:

### avatars bucket policy

```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Public avatar read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### moments bucket policy

```sql
-- Allow authenticated users to upload moment images
CREATE POLICY "Authenticated users can upload moment images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'moments' AND auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public moment images read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'moments');
```

## 6. Enable Authentication Providers

### Email Authentication

1. Go to **Authentication** > **Providers**
2. Email should be enabled by default
3. Configure settings:
   - Enable email confirmations (recommended for production)
   - Set site URL to your app deep link

### Social Authentication (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
4. In Supabase, go to **Authentication** > **Providers** > **Google**
5. Enable and add Client ID & Secret

#### Apple Sign-In

1. Configure in Apple Developer Portal
2. In Supabase, go to **Authentication** > **Providers** > **Apple**
3. Enable and configure

## 7. Configure Email Templates (Optional)

1. Go to **Authentication** > **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Magic Link
   - Reset password
   - Change email

## 8. Environment Variables

Make sure your `.env` file has all required variables:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API (if using additional backend)
EXPO_PUBLIC_API_URL=https://api.yourdomain.com

# Sentry (Error Tracking)
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Other configs
EXPO_PUBLIC_ENV=development
```

## 9. Testing the Connection

Run this code to test your Supabase connection:

```typescript
import { supabase, isSupabaseConfigured } from './src/config/supabase';

// Check if configured
console.log('Supabase configured:', isSupabaseConfigured());

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from('users').select('count').limit(1);

  if (error) {
    console.error('Connection error:', error);
  } else {
    console.log('Connection successful!');
  }
};

testConnection();
```

## 10. Production Checklist

Before going to production:

- [ ] Enable email confirmations
- [ ] Review and tighten RLS policies
- [ ] Set up proper CORS origins
- [ ] Enable and configure rate limiting
- [ ] Set up database backups
- [ ] Configure proper logging
- [ ] Review storage bucket policies
- [ ] Test all authentication flows
- [ ] Set up monitoring (optional: connect to Sentry)

## Troubleshooting

### "Supabase not configured" error

- Check that `.env` file has correct values
- Make sure to restart Metro bundler after changing `.env`
- Verify environment variables are prefixed with `EXPO_PUBLIC_`

### Authentication errors

- Check that email provider is enabled
- Verify redirect URLs are configured correctly
- Check for typos in API keys

### Storage upload errors

- Verify bucket exists and has correct policies
- Check file size limits (default: 50MB)
- Ensure proper MIME types are used

### RLS policy errors

- Make sure user is authenticated
- Check that policy conditions match your use case
- Use Supabase Dashboard to test queries

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
