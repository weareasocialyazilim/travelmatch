/**
 * Supabase Configuration
 * Initialize and export Supabase client for database, auth, and storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { secureStorage } from '../utils/secureStorage';

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
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
 * Database types for TypeScript
 * 
 * Auto-generated types are in @/types/database.types.ts
 * Generate with: pnpm db:generate-types
 * 
 * This file contains legacy inline types for backward compatibility.
 * New code should import from @/types/database.types.ts
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          public_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      moments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          location: string;
          latitude: number | null;
          longitude: number | null;
          date: string;
          max_participants: number;
          price: number;
          currency: string;
          images: string[];
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['moments']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['moments']['Insert']>;
      };
      requests: {
        Row: {
          id: string;
          moment_id: string;
          user_id: string;
          message: string | null;
          status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['requests']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          type: 'text' | 'image' | 'system';
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['messages']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          participant_ids: string[];
          last_message_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['conversations']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<
          Database['public']['Tables']['conversations']['Insert']
        >;
      };
      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewed_id: string;
          moment_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['reviews']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data: Record<string, unknown> | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['notifications']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<
          Database['public']['Tables']['notifications']['Insert']
        >;
      };
    };
  };
};

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
