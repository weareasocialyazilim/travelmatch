/**
 * Moments Database Queries
 * CRUD operations for moments, favorites, and cursor-based pagination
 */

import {
  supabase,
  isSupabaseConfigured,
  type Database,
} from '../../config/supabase';
import { callRpc } from '../supabaseRpc';
import { logger } from '../../utils/logger';
import type { Tables, DbResult, ListResult } from './types';
import { okSingle, okList } from './types';

/**
 * Moments Service
 */
export const momentsService = {
  async list(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    userId?: string;
    status?: string;
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
    search?: string;
  }): Promise<ListResult<Tables['moments']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      let query = supabase.from('moments').select(
        `
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            location,
            kyc_status,
            rating,
            created_at
          )
        `,
        { count: 'exact' },
      );

      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.city) {
        query = query.ilike('location', `%${options.city}%`);
      }
      if (options?.country) {
        query = query.ilike('location', `%${options.country}%`);
      }
      if (options?.minPrice) {
        query = query.gte('price', options.minPrice);
      }
      if (options?.maxPrice) {
        query = query.lte('price', options.maxPrice);
      }
      if (options?.search) {
        query = query.or(
          `title.ilike.%${options.search}%,description.ilike.%${options.search}%`,
        );
      }

      // Sorting
      if (options?.sortBy) {
        switch (options.sortBy) {
          case 'price_low':
            query = query.order('price', { ascending: true });
            break;
          case 'price_high':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.range(
        options?.offset || 0,
        (options?.offset || 0) + (options?.limit || 20) - 1,
      );

      const { data, count, error } = await query;

      if (error) throw error;
      return okList<any>(data || [], count);
    } catch (error) {
      logger.error('[DB] List moments error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getById(id: string): Promise<DbResult<Tables['moments']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('moments')
        .select(
          `
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            location,
            kyc_status,
            rating,
            review_count,
            created_at
          ),
          moment_requests:requests!moment_id (
            id,
            status,
            created_at
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return okSingle<Tables['moments']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Get moment error:', error);
      return { data: null, error: error as Error };
    }
  },

  async create(
    moment: Tables['moments']['Insert'],
  ): Promise<DbResult<Tables['moments']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('moments')
        .insert(moment)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Moment created:', data?.id);
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Create moment error:', error);
      return { data: null, error: error as Error };
    }
  },

  async getSaved(
    userId: string,
  ): Promise<ListResult<Tables['moments']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      const { data, count, error } = await supabase
        .from('favorites')
        .select(
          `
          moments:moment_id (
            *,
            users:user_id (
              id,
              full_name,
              avatar_url,
              location,
              kyc_status,
              rating
            )
          )
        `,
          { count: 'exact' },
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const moments =
        data
          ?.map((item: { moments: Tables['moments']['Row'] }) => item.moments)
          .filter(Boolean) || [];

      return { data: moments, count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] Get saved moments error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async save(
    userId: string,
    momentId: string,
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, moment_id: momentId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Save moment error:', error);
      return { error: error as Error };
    }
  },

  async unsave(
    userId: string,
    momentId: string,
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('moment_id', momentId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Unsave moment error:', error);
      return { error: error as Error };
    }
  },

  async update(
    id: string,
    updates: Tables['moments']['Update'],
  ): Promise<DbResult<Tables['moments']['Row']>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Unauthorized: User not authenticated');
      }

      const { data: existingMoment } = await supabase
        .from('moments')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existingMoment) {
        throw new Error('Moment not found');
      }

      if (existingMoment.user_id !== user.id) {
        logger.warn('[SECURITY] IDOR attempt detected on moment update', {
          userId: user.id,
          momentId: id,
          ownerId: existingMoment.user_id,
        });
        throw new Error(
          'Forbidden: You do not have permission to update this moment',
        );
      }

      const { data, error } = await supabase
        .from('moments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return okSingle<any>(data);
    } catch (error) {
      logger.error('[DB] Update moment error:', error);
      return { data: null, error: error as Error };
    }
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: _data, error } = await callRpc('soft_delete', {
        table_name: 'moments',
        record_id: id,
        user_id: user.id,
      });

      if (error) throw error;
      logger.info('[DB] Moment soft deleted:', id, 'by user:', user.id);
      return { error: null };
    } catch (error) {
      logger.error('[DB] Soft delete moment error:', error);
      return { error: error as Error };
    }
  },

  async restore(id: string): Promise<{ error: Error | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: _data, error } = await callRpc('restore_deleted', {
        table_name: 'moments',
        record_id: id,
        user_id: user.id,
      });

      if (error) throw error;
      logger.info('[DB] Moment restored:', id);
      return { error: null };
    } catch (error) {
      logger.error('[DB] Restore moment error:', error);
      return { error: error as Error };
    }
  },

  async getDeleted(
    userId: string,
  ): Promise<{ data: Tables['moments']['Row'][] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('moments')
        .select(
          `
          id,
          title,
          description,
          location,
          latitude,
          longitude,
          start_date,
          end_date,
          status,
          visibility,
          category,
          images,
          video_url,
          created_at,
          updated_at,
          deleted_at,
          user_id
        `,
        )
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      logger.info('[DB] Fetched deleted moments for user:', userId);
      return {
        data:
          (data as unknown as Database['public']['Tables']['moments']['Row'][]) ||
          null,
        error: null,
      };
    } catch (error) {
      logger.error('[DB] Get deleted moments error:', error);
      return { data: null, error: error as Error };
    }
  },

  async pause(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('moments')
        .update({ status: 'paused' })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Pause moment error:', error);
      return { error: error as Error };
    }
  },

  async activate(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('moments')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Activate moment error:', error);
      return { error: error as Error };
    }
  },

  async search(
    query: string,
    options?: { limit?: number },
  ): Promise<ListResult<Tables['moments']['Row']>> {
    try {
      const { data, count, error } = await supabase
        .from('moments')
        .select('*', { count: 'exact' })
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`,
        )
        .eq('status', 'active')
        .limit(options?.limit || 20);

      if (error) throw error;
      return okList<any>(data || [], count);
    } catch (error) {
      logger.error('[DB] Search moments error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  /**
   * Cursor-based pagination for moments (recommended for large datasets)
   */
  async listWithCursor(options?: {
    cursor?: string | null;
    limit?: number;
    category?: string;
    userId?: string;
    status?: string;
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
    search?: string;
  }): Promise<{
    data: Tables['moments']['Row'][];
    meta: {
      next_cursor: string | null;
      has_more: boolean;
      count: number;
    };
    error: Error | null;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        meta: { next_cursor: null, has_more: false, count: 0 },
        error: new Error('Supabase not configured'),
      };
    }

    try {
      const limit = options?.limit || 20;

      let query = supabase.from('moments').select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            location,
            kyc_status,
            rating,
            created_at
          )
        `);

      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.city) {
        query = query.ilike('location', `%${options.city}%`);
      }
      if (options?.country) {
        query = query.ilike('location', `%${options.country}%`);
      }
      if (options?.minPrice) {
        query = query.gte('price', options.minPrice);
      }
      if (options?.maxPrice) {
        query = query.lte('price', options.maxPrice);
      }
      if (options?.search) {
        query = query.or(
          `title.ilike.%${options.search}%,description.ilike.%${options.search}%`,
        );
      }

      query = query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1);

      if (options?.cursor) {
        try {
          const cursorPayload = JSON.parse(
            Buffer.from(options.cursor, 'base64').toString('utf-8'),
          );
          const { created_at, id } = cursorPayload;

          query = query.or(
            `created_at.lt.${created_at},and(created_at.eq.${created_at},id.lt.${id})`,
          );
        } catch (err) {
          logger.error('[DB] Invalid cursor format:', err);
          throw new Error('Invalid cursor format');
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const hasMore = (data?.length || 0) > limit;
      const items = hasMore ? data!.slice(0, limit) : data || [];

      let nextCursor: string | null = null;
      if (hasMore && items.length > 0) {
        const lastItem = items[items.length - 1];
        const cursorPayload = JSON.stringify({
          created_at: lastItem.created_at,
          id: lastItem.id,
        });
        nextCursor = Buffer.from(cursorPayload).toString('base64');
      }

      return {
        data: items,
        meta: {
          next_cursor: nextCursor,
          has_more: hasMore,
          count: items.length,
        },
        error: null,
      };
    } catch (error) {
      logger.error('[DB] List moments with cursor error:', error);
      return {
        data: [],
        meta: { next_cursor: null, has_more: false, count: 0 },
        error: error as Error,
      };
    }
  },
};
