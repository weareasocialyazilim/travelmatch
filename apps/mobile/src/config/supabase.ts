/**
 * Supabase Configuration
 * Initialize and export Supabase client for database, auth, and storage
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { secureStorage } from '../utils/secureStorage';
import type { Database } from '@/types/database.types';

// Supabase credentials from environment variables
const SUPABASE_URL: string =
  (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ?? '';
const SUPABASE_ANON_KEY: string =
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ?? '';

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (__DEV__) {
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
 * Supabase client instance
 * Configured with SecureStore for session persistence in React Native
 * Uses auto-generated Database types from @/types/database.types.ts
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
});

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
