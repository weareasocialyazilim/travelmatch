/**
 * Supabase Client Factory
 * 
 * Creates properly configured Supabase clients for Edge Functions.
 * Handles both user-context and service-role access patterns.
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =============================================================================
// TYPES
// =============================================================================

export interface SupabaseClients {
  /** Client with user's JWT - respects RLS */
  userClient: SupabaseClient;
  /** Client with service role - bypasses RLS */
  adminClient: SupabaseClient;
}

export interface CreateClientOptions {
  /** User's authorization header */
  authHeader?: string | null;
  /** Request for extracting auth */
  request?: Request;
}

// =============================================================================
// CLIENT FACTORY
// =============================================================================

/**
 * Creates Supabase clients for Edge Function use
 * 
 * @example
 * ```typescript
 * const { userClient, adminClient } = createSupabaseClients({
 *   authHeader: req.headers.get('Authorization')
 * });
 * 
 * // User operations (RLS applied)
 * const { data: userMoments } = await userClient
 *   .from('moments')
 *   .select('*');
 * 
 * // Admin operations (RLS bypassed)
 * const { data: allUsers } = await adminClient
 *   .from('users')
 *   .select('*');
 * ```
 */
export function createSupabaseClients(options: CreateClientOptions = {}): SupabaseClients {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Extract auth header
  let authHeader = options.authHeader;
  if (!authHeader && options.request) {
    authHeader = options.request.headers.get('Authorization');
  }

  // User client - respects RLS
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // Admin client - bypasses RLS
  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return { userClient, adminClient };
}

/**
 * Creates a user-context Supabase client
 * Convenience wrapper for when you only need user client
 */
export function createUserClient(authHeader: string | null): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Creates a service-role Supabase client
 * Use sparingly - bypasses all RLS
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

// =============================================================================
// AUTH HELPERS
// =============================================================================

/**
 * Extracts and validates user from JWT
 * 
 * @returns User object or null if not authenticated
 */
export async function getAuthUser(client: SupabaseClient) {
  const { data: { user }, error } = await client.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Requires authentication - throws if not authenticated
 * 
 * @throws Error if user is not authenticated
 */
export async function requireAuth(client: SupabaseClient) {
  const user = await getAuthUser(client);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Checks if request is from service role
 */
export function isServiceRole(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return authHeader === `Bearer ${serviceKey}`;
}

// =============================================================================
// DATABASE HELPERS
// =============================================================================

/**
 * Execute a database function (RPC)
 */
export async function callRpc<T = unknown>(
  client: SupabaseClient,
  functionName: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const { data, error } = await client.rpc(functionName, params);
  
  if (error) {
    throw new Error(`RPC ${functionName} failed: ${error.message}`);
  }
  
  return data as T;
}

/**
 * Get single record by ID
 */
export async function getById<T = unknown>(
  client: SupabaseClient,
  table: string,
  id: string,
  select = '*'
): Promise<T | null> {
  const { data, error } = await client
    .from(table)
    .select(select)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data as T;
}
