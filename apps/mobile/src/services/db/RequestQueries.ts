/**
 * Request Database Queries
 * CRUD operations for moment requests
 */

import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { logger } from '../../utils/logger';
import type { Tables, DbResult, ListResult } from './types';
import { okSingle, okList } from './types';

/**
 * Requests Service
 */
export const requestsService = {
  async list(options?: {
    momentId?: string;
    userId?: string;
    status?: string;
  }): Promise<ListResult<any>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      // ✅ OPTIMIZED: Single query with specific field selection to avoid N+1
      let query = supabase.from('requests').select(
        `
          id,
          message,
          status,
          created_at,
          requester:users!requests_user_id_fkey(
            id,
            full_name,
            avatar_url,
            rating,
            verified,
            location
          ),
          moment:moments!requests_moment_id_fkey(
            id,
            title,
            price,
            category,
            user:users!moments_user_id_fkey(
              id,
              full_name,
              avatar_url
            )
          )
        `,
        { count: 'exact' },
      );

      if (options?.momentId) {
        query = query.eq('moment_id', options.momentId);
      }
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      const { data, count, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      return okList<any>(data || [], count);
    } catch (error) {
      logger.error('[DB] List requests error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async create(
    request: Tables['requests']['Insert'],
  ): Promise<DbResult<Tables['requests']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Request created:', data?.id);
      return okSingle<Tables['requests']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Create request error:', error);
      return { data: null, error: error as Error };
    }
  },

  async updateStatus(
    id: string,
    status: 'accepted' | 'rejected' | 'cancelled' | 'completed',
  ): Promise<DbResult<Tables['requests']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Request status updated:', id, status);
      return okSingle<Tables['requests']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Update request error:', error);
      return { data: null, error: error as Error };
    }
  },
};
