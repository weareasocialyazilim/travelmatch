/**
 * Profile/Users Database Queries
 * CRUD operations for user profiles, follows, and search
 */

import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { logger } from '../../utils/logger';
import type {
  Tables,
  DbResult,
  ListResult,
  FollowerRecord,
  FollowingRecord,
} from './types';
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

  async follow(
    followerId: string,
    followingId: string,
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Follow user error:', error);
      return { error: error as Error };
    }
  },

  async unfollow(
    followerId: string,
    followingId: string,
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Unfollow user error:', error);
      return { error: error as Error };
    }
  },

  async getFollowers(userId: string): Promise<ListResult<FollowerRecord>> {
    try {
      const { data, count, error } = await supabase
        .from('follows')
        .select('follower_id', { count: 'exact' })
        .eq('following_id', userId);

      if (error) throw error;
      return {
        data: (data as FollowerRecord[]) || [],
        count: count || 0,
        error: null,
      };
    } catch (error) {
      logger.error('[DB] Get followers error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getFollowing(userId: string): Promise<ListResult<FollowingRecord>> {
    try {
      const { data, count, error } = await supabase
        .from('follows')
        .select('following_id', { count: 'exact' })
        .eq('follower_id', userId);

      if (error) throw error;
      return {
        data: (data as FollowingRecord[]) || [],
        count: count || 0,
        error: null,
      };
    } catch (error) {
      logger.error('[DB] Get following error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async checkFollowStatus(
    followerId: string,
    followingId: string,
  ): Promise<{ isFollowing: boolean; error: Error | null }> {
    try {
      const { data, count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact' })
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;

      const isFollowing = !!(
        (Array.isArray(data) && data.length > 0) ||
        (typeof count === 'number' && count > 0)
      );

      return { isFollowing, error: null };
    } catch (error) {
      logger.error('[DB] Check follow status error:', error);
      return { isFollowing: false, error: error as Error };
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
