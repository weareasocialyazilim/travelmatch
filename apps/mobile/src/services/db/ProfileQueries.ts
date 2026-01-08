/**
 * Profile/Users Database Queries
 * CRUD operations for user profiles and search
 */

import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { logger } from '../../utils/logger';
import type { Tables, DbResult, ListResult } from './types';
import { okSingle, okList } from './types';

/**
 * Users Service - Profile queries
 */
export const usersService = {
  async getById(id: string): Promise<DbResult<Tables['users']['Row']>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      // SECURITY: Explicit column selection for user data
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          id,
          email,
          full_name,
          avatar_url,
          location,
          public_key,
          kyc_status,
          verified,
          rating,
          review_count,
          created_at,
          updated_at
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return okSingle<Tables['users']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Get user error:', error);
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

  async search(
    query: string,
    limit = 10,
  ): Promise<ListResult<Tables['users']['Row']>> {
    try {
      const { data, count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return okList<Tables['users']['Row']>(data || [], count);
    } catch (error) {
      logger.error('[DB] Search users error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getSuggested(
    userId: string,
    limit = 5,
  ): Promise<ListResult<Tables['users']['Row']>> {
    try {
      const { data, count, error } = await supabase
        .from('users')
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
