/**
 * Database Query Helpers
 * 
 * Centralized, optimized queries to prevent N+1 problems
 * All queries use Supabase JOINs to fetch related data efficiently
 */

import { supabase } from '../../config/supabase';
import type { Database } from '../../types/database.types';

// Type aliases for convenience
type Tables = Database['public']['Tables'];
type Moment = Tables['moments']['Row'];
type User = Tables['users']['Row'];
type Request = Tables['requests']['Row'];

/**
 * ============================================
 * MOMENT QUERIES
 * ============================================
 */

export const momentQueries = {
  /**
   * Get moments with user data (prevents N+1)
   * ✅ OPTIMIZED: 1 query instead of N+1
   */
  getWithUser: async (filters?: Partial<Moment>) => {
    let query = supabase
      .from('moments')
      .select(`
        id,
        title,
        description,
        category,
        location,
        images,
        price,
        currency,
        max_guests,
        duration,
        availability,
        status,
        created_at,
        updated_at,
        user:users!user_id(
          id,
          name,
          avatar,
          rating,
          review_count,
          verified
        )
      `);

    if (filters) {
      query = query.match(filters);
    }

    return query;
  },

  /**
   * Get moment with full details (user + request count)
   */
  getWithDetails: async (momentId: string) => {
    return supabase
      .from('moments')
      .select(`
        *,
        user:users!user_id(*),
        requests(count)
      `)
      .eq('id', momentId)
      .single();
  },

  /**
   * Get moments with request count
   */
  getWithRequestCount: async (userId: string) => {
    return supabase
      .from('moments')
      .select(`
        *,
        user:users!user_id(*),
        requests(count)
      `)
      .eq('user_id', userId);
  },
};

/**
 * ============================================
 * REQUEST QUERIES
 * ============================================
 */

export const requestQueries = {
  /**
   * Get requests with full details (moment + user + requester)
   * ✅ OPTIMIZED: Single query with nested JOINs
   */
  getWithDetails: async (filters?: { user_id?: string; status?: string }) => {
    let query = supabase
      .from('requests')
      .select(`
        id,
        status,
        message,
        guests,
        total_price,
        created_at,
        updated_at,
        moment:moments!moment_id(
          id,
          title,
          price,
          currency,
          location,
          images,
          user:users!user_id(
            id,
            name,
            avatar,
            verified
          )
        ),
        requester:users!user_id(
          id,
          name,
          avatar,
          rating,
          verified
        )
      `);

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    return query;
  },

  /**
   * Get incoming requests for host's moments
   */
  getIncomingRequests: async (hostId: string) => {
    return supabase
      .from('requests')
      .select(`
        *,
        moment:moments!moment_id(
          id,
          title,
          price
        ),
        requester:users!user_id(
          id,
          name,
          avatar,
          rating
        )
      `)
      .eq('moments.user_id', hostId);
  },
};

/**
 * ============================================
 * TRANSACTION QUERIES
 * ============================================
 */

export const transactionQueries = {
  /**
   * Get transactions with related user and request data
   * ✅ OPTIMIZED: Prevents N+1 when fetching transaction history
   */
  getWithDetails: async (userId: string) => {
    return supabase
      .from('transactions')
      .select(`
        id,
        type,
        amount,
        currency,
        status,
        description,
        created_at,
        user:users!user_id(
          id,
          name,
          avatar
        ),
        request:requests!request_id(
          id,
          status,
          moment:moments!moment_id(
            id,
            title
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  /**
   * Get pending transactions for admin review
   */
  getPending: async () => {
    return supabase
      .from('transactions')
      .select(`
        *,
        user:users!user_id(*),
        request:requests!request_id(
          *,
          moment:moments!moment_id(*)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
  },
};

/**
 * ============================================
 * USER QUERIES
 * ============================================
 */

export const userQueries = {
  /**
   * Get user with stats (moments count, requests count, reviews)
   */
  getWithStats: async (userId: string) => {
    return supabase
      .from('users')
      .select(`
        *,
        moments(count),
        requests(count),
        reviews(count)
      `)
      .eq('id', userId)
      .single();
  },

  /**
   * Get users with their latest moment
   */
  getWithLatestMoment: async (userIds: string[]) => {
    return supabase
      .from('users')
      .select(`
        id,
        name,
        avatar,
        verified,
        moments!inner(
          id,
          title,
          images,
          created_at
        )
      `)
      .in('id', userIds)
      .order('moments.created_at', { ascending: false })
      .limit(1, { foreignTable: 'moments' });
  },
};

/**
 * ============================================
 * MESSAGE QUERIES
 * ============================================
 */

export const messageQueries = {
  /**
   * Get conversations with last message and participant info
   * ✅ OPTIMIZED: Single query for conversation list
   */
  getConversations: async (userId: string) => {
    return supabase
      .from('conversations')
      .select(`
        id,
        updated_at,
        participant:users!other_user_id(
          id,
          name,
          avatar,
          verified
        ),
        last_message:messages!conversation_id(
          id,
          content,
          created_at
        )
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('updated_at', { ascending: false })
      .limit(1, { foreignTable: 'messages' });
  },

  /**
   * Get messages with sender info for a conversation
   */
  getWithSender: async (conversationId: string) => {
    return supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        read,
        sender:users!sender_id(
          id,
          name,
          avatar
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
  },
};

/**
 * ============================================
 * VIDEO QUERIES
 * ============================================
 */

export const videoQueries = {
  /**
   * Get videos with user and moment data
   */
  getWithDetails: async (filters?: { user_id?: string; moment_id?: string }) => {
    let query = supabase
      .from('videos')
      .select(`
        id,
        url,
        thumbnail_url,
        duration,
        status,
        created_at,
        user:users!user_id(
          id,
          name,
          avatar
        ),
        moment:moments!moment_id(
          id,
          title
        )
      `);

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.moment_id) {
      query = query.eq('moment_id', filters.moment_id);
    }

    return query;
  },
};

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Batch fetch users by IDs (prevents N+1)
 */
export const batchFetchUsers = async (userIds: string[]): Promise<{ data: Array<{id: string; name: string; avatar: string; verified: boolean; rating: number}> | null; error: Error | null }> => {
  if (userIds.length === 0) return { data: [], error: null };

  return supabase
    .from('users')
    .select('id, name, avatar, verified, rating')
    .in('id', userIds);
};

/**
 * Batch fetch moments by IDs (prevents N+1)
 */
export const batchFetchMoments = async (momentIds: string[]): Promise<{ data: unknown[] | null; error: Error | null }> => {
  if (momentIds.length === 0) return { data: [], error: null };

  return supabase
    .from('moments')
    .select(`
      id,
      title,
      price,
      currency,
      images,
      user:users!user_id(
        id,
        name,
        avatar
      )
    `)
    .in('id', momentIds);
};

/**
 * Check if relationship exists (optimized single query)
 */
export const checkRelationship = async (
  table: string,
  conditions: Record<string, unknown>,
) => {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .match(conditions)
    .limit(1)
    .maybeSingle();

  return { exists: !!data, error };
};

/**
 * Get count efficiently (no data transfer)
 */
export const getCount = async (
  table: string,
  filters?: Record<string, unknown>,
) => {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (filters) {
    query = query.match(filters);
  }

  const { count, error } = await query;
  return { count: count ?? 0, error };
};
