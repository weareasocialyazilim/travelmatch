/**
 * Supabase Configuration
 * Initialize and export Supabase client for database, auth, and storage
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { secureStorage } from '../utils/secureStorage';
import type { Database } from '@/types/database.types';

// Re-export Database type for use in services
export type { Database } from '@/types/database.types';

// Safe check for __DEV__ (undefined during Jest module evaluation)
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

// Check if we're in test environment
const isTestEnvironment =
  process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// Supabase credentials from environment variables
// In test environment, provide mock values to prevent "supabaseUrl is required" error
const SUPABASE_URL: string =
  (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ??
  (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ??
  (isTestEnvironment ? 'https://mock-test.supabase.co' : '');
const SUPABASE_ANON_KEY: string =
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as
    | string
    | undefined) ??
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ??
  (isTestEnvironment ? 'mock-anon-key-for-testing' : '');

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (isDev) {
    logger.warn(
      '[Supabase] Missing configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file',
    );
  }
}

/**
 * Custom storage adapter for Supabase to use SecureStore
 */
const SupabaseStorage = {
  getItem: (key: string) => {
    return secureStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return secureStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return secureStorage.deleteItem(key);
  },
};

/**
 * Export Supabase URL for Edge Functions
 */
export const SUPABASE_EDGE_URL = SUPABASE_URL;

/**
 * Realtime configuration for optimal performance
 */
const REALTIME_CONFIG = {
  params: {
    eventsPerSecond: 10, // Rate limit to prevent flooding
  },
  // Heartbeat interval to detect disconnections early
  heartbeatIntervalMs: 15000, // 15 seconds
  // Reconnect configuration with exponential backoff
  reconnectAfterMs: (tries: number) => {
    // Exponential backoff with jitter: base * 2^tries + random jitter
    const baseDelay = 1000;
    const maxDelay = 30000;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, tries), maxDelay);
    // Add jitter (0-25% of delay) to prevent thundering herd
    const jitter = exponentialDelay * Math.random() * 0.25;
    return Math.floor(exponentialDelay + jitter);
  },
  // Connection timeout
  timeout: 10000, // 10 seconds
};

/**
 * Supabase client instance
 * Configured with SecureStore for session persistence in React Native
 * Uses auto-generated Database types from @/types/database.types.ts
 * Optimized realtime configuration for better performance and reliability
 */
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: SupabaseStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Disable for React Native
    },
    global: {
      headers: {
        'x-app-name': 'TravelMatch',
        'x-app-version': '1.0.0',
      },
    },
    realtime: REALTIME_CONFIG,
  },
);

/**
 * Typed Supabase client
 */
export const db = supabase;

/**
 * Auth helpers
 */
export const auth = supabase.auth;

/**
 * Storage helpers
 */
export const storage = supabase.storage;

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

/**
 * Initialize Supabase and check connection
 */
export const initSupabase = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    logger.warn('[Supabase] Not configured - using mock data');
    return false;
  }

  try {
    // Test connection by getting session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('[Supabase] Connection error:', error);
      return false;
    }

    logger.info('[Supabase] Connected successfully', {
      hasSession: !!data.session,
    });
    return true;
  } catch (error) {
    logger.error('[Supabase] Init failed:', error);
    return false;
  }
};

export default supabase;
