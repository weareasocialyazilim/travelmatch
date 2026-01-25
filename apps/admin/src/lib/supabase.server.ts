/**
 * Server-only Supabase client with service role
 *
 * SECURITY: This file should ONLY be imported in server components,
 * API routes, and server actions. Never import in client components.
 *
 * The 'server-only' package ensures build-time errors if imported client-side.
 */

import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client with service role privileges
 * Use this for admin operations that bypass RLS
 *
 * IMPORTANT: Never expose this client to the browser
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase admin client with service role privileges
 * Alias for createServiceClient for clarity
 */
export const createAdminClient = createServiceClient;
