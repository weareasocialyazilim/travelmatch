/**
 * Profile/Users Database Queries
 * CRUD operations for user profiles and search
 *
 * SECURITY NOTE: For cross-user queries, we use public_profiles view
 * which contains only safe, non-PII columns. For own profile, we use
 * the get_own_profile() RPC or direct users table query (RLS protected).
 */

import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { logger } from '../../utils/logger';
import type { Tables, DbResult, ListResult } from './types';
import { okSingle, okList } from './types';

// Safe columns for public user profiles (NO PII!)
// These match the public_profiles view columns
const SAFE_PUBLIC_COLUMNS = `
  id,
  full_name,
  avatar_url,
  bio,
  location,
  languages,
  interests,
  verified,
  rating,
  review_count,
  created_at
`;

/**
 * Users Service - Profile queries
 */
export const usersService = {
  /**
   * Get user profile by ID (for viewing other users' profiles)
   * SECURITY: Uses public_profiles view - NO PII exposed
   */
  async getById(id: string): Promise<DbResult<Tables['users']['Row']>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      // SECURITY: Use public_profiles view for cross-user queries
      // This ensures we never expose PII (email, phone, balance, etc.)
      const { data, error } = await supabase
        .from('public_profiles')
        .select(SAFE_PUBLIC_COLUMNS)
        .eq('id', id)
        .single();

      if (error) throw error;
      return okSingle<Tables['users']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Get user error:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get own full profile (includes email, kyc_status, balance, etc.)
   * SECURITY: Uses get_own_profile() RPC which is protected by auth.uid()
   */
  async getOwnProfile(): Promise<DbResult<Tables['users']['Row']>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .rpc('get_own_profile' as any)
        .single();

      if (error) throw error;
      return okSingle<Tables['users']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Get own profile error:', error);
      return { data: null, error: error as Error };
    }
  },

  async update(
    id: string,
    updates: Tables['users']['Update'],
  ): Promise<DbResult<Tables['users']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return okSingle<Tables['users']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Update user error:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Search users by name
   * SECURITY: Uses public_profiles view, searches by name only (NOT email!)
   */
  async search(
    query: string,
    limit = 10,
  ): Promise<ListResult<Tables['users']['Row']>> {
    try {
      // SECURITY: Use public_profiles view, search by name only (not email!)
      const { data, count, error } = await supabase
        .from('public_profiles')
        .select('*', { count: 'exact' })
        .ilike('full_name', `%${query}%`)
        .limit(limit);

      if (error) throw error;
      return okList<Tables['users']['Row']>(data || [], count);
    } catch (error) {
      logger.error('[DB] Search users error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  /**
   * Get suggested users (exclude current user)
   * SECURITY: Uses public_profiles view
   */
  async getSuggested(
    userId: string,
    limit = 5,
  ): Promise<ListResult<Tables['users']['Row']>> {
    try {
      // SECURITY: Use public_profiles view
      const { data, count, error } = await supabase
        .from('public_profiles')
        .select('*', { count: 'exact' })
        .neq('id', userId)
        .limit(limit);

      if (error) throw error;
      return okList<Tables['users']['Row']>(data || [], count);
    } catch (error) {
      logger.error('[DB] Get suggested users error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },
};
