import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Browser-safe Supabase client using anon key
 * Safe to use in client components
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// NOTE: For server-side Supabase client with service role,
// import createServiceClient directly from '@/lib/supabase.server'
// Do NOT re-export it here to avoid 'server-only' import in client bundles

// Export singleton for client-side usage
let clientInstance: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (typeof window === 'undefined') {
    // Server-side: create new instance
    return createClient();
  }
  // Client-side: reuse instance
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}
