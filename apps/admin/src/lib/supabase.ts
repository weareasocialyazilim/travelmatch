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

// Re-export server client for backwards compatibility
// IMPORTANT: Only import createServiceClient in server components/API routes
export { createServiceClient } from './supabase.server';

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
