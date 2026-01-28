/**
 * Discovery Service
 *
 * Handles user discovery, matching, and recommendation logic.
 * Integrates with PostGIS for location-based queries.
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import type { User } from '@/types/core';

// ============================================
// TYPES
// ============================================

export interface DiscoveryFilters {
  location?: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
  };
  ageRange?: {
    min: number;
    max: number;
  };
  interests?: string[];
  verified?: boolean;
  gender?: string;
}

export interface DiscoveryResult {
  users: User[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface DiscoveryMoment {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  distance?: number; // km
  requestedAmount?: number;
  currency?: string;
  status: string;
  createdAt: string;
  hostTrustScore?: number;
  hostSubscriptionTier?: string;
}

export interface DiscoverMomentsParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  cursor?: string;
  limit?: number;
  userId?: string; // For block filtering
  filters?: {
    minAge?: number;
    maxAge?: number;
    gender?: string;
  };
}

export interface DiscoverMomentsResult {
  moments: DiscoveryMoment[];
  hasMore: boolean;
  nextCursor?: string;
}

// ============================================
// MOMENT DISCOVERY (PostGIS)
// ============================================

/**
 * Discover nearby moments using PostGIS RPC function
 * Privacy-safe: Returns coarse coordinates only
 */
export async function discoverNearbyMoments(
  params: DiscoverMomentsParams,
): Promise<DiscoverMomentsResult> {
  const {
    latitude,
    longitude,
    radiusKm = 50,
    cursor,
    limit = 20,
    userId,
    filters,
  } = params;

  try {
    const { data, error } = await (
      supabase.rpc as (
        fn: string,
        params: Record<string, unknown>,
      ) => ReturnType<typeof supabase.rpc>
    )('discover_nearby_moments', {
      p_lat: latitude,
      p_lng: longitude,
      p_radius_km: radiusKm,
      p_limit: limit + 1,
      p_cursor: cursor || null,
      p_min_age: filters?.minAge || null,
      p_max_age: filters?.maxAge || null,
      p_gender: filters?.gender || null,
      p_viewer_id: userId || null, // For block filtering
    });

    if (error) {
      logger.warn('DiscoveryService', 'PostGIS RPC failed, using fallback', {
        error,
      });
      return discoverMomentsFallback(params);
    }

    // Transform coarse coordinates to location object
    const moments: DiscoveryMoment[] = ((data || []) as any[])
      .slice(0, limit)
      .map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.images?.[0] || null,
        userId: row.user_id,
        userName: row.user_name,
        userAvatar: row.user_avatar,
        location: {
          // Use coarse coordinates (privacy-safe)
          latitude: row.coarse_lat,
          longitude: row.coarse_lng,
        },
        distance: row.distance_km,
        requestedAmount: 0,
        currency: 'TRY',
        status: row.status || 'active',
        createdAt: row.created_at,
        hostTrustScore: row.host_trust_score,
        hostSubscriptionTier: row.host_subscription_tier,
      }));

    const hasMore = ((data as any[] | null)?.length || 0) > limit;
    const nextCursor =
      hasMore && moments.length > 0
        ? moments[moments.length - 1].id
        : undefined;

    return { moments, hasMore, nextCursor };
  } catch (error) {
    logger.error('DiscoveryService', 'discoverNearbyMoments error', { error });
    return discoverMomentsFallback(params);
  }
}

/**
 * Fallback discovery without PostGIS (basic SQL)
 */
export async function discoverMomentsFallback(
  params: DiscoverMomentsParams,
): Promise<DiscoverMomentsResult> {
  const { cursor, limit = 20 } = params;

  try {
    let query = supabase
      .from('moments')
      .select(
        `
        id,
        title,
        description,
        images,
        user_id,
        status,
        price,
        currency,
        created_at,
        users!inner (
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('id', cursor);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('DiscoveryService', 'Fallback query failed', { error });
      return { moments: [], hasMore: false };
    }

    const moments: DiscoveryMoment[] = (data || [])
      .slice(0, limit)
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.images?.[0] || null,
        userId: row.user_id,
        userName: row.users?.full_name,
        userAvatar: row.users?.avatar_url,
        requestedAmount: row.price,
        currency: row.currency,
        status: row.status,
        createdAt: row.created_at,
      }));

    const hasMore = (data?.length || 0) > limit;
    const nextCursor =
      hasMore && moments.length > 0
        ? moments[moments.length - 1].id
        : undefined;

    return { moments, hasMore, nextCursor };
  } catch (error) {
    logger.error('DiscoveryService', 'discoverMomentsFallback error', {
      error,
    });
    return { moments: [], hasMore: false };
  }
}

class DiscoveryService {
  private cache = new Map<
    string,
    { data: DiscoveryResult; timestamp: number }
  >();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Discover nearby users based on filters
   */
  async discoverUsers(
    filters: DiscoveryFilters,
    cursor?: string,
    limit = 20,
  ): Promise<DiscoveryResult> {
    try {
      // Check cache
      const cacheKey = JSON.stringify({ filters, cursor, limit });
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      let query = supabase
        .from('users')
        .select('*')
        .limit(limit + 1);

      // Apply filters
      if (filters.verified) {
        query = query.eq('verified', true);
      }

      if (filters.ageRange) {
        // Age filtering would need birth_date column
      }

      // Apply cursor for pagination
      if (cursor) {
        query = query.gt('id', cursor);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('DiscoveryService', 'discoverUsers error', { error });
        throw error;
      }

      const users = (data || []).slice(0, limit) as unknown as User[];
      const hasMore = (data?.length || 0) > limit;
      const nextCursor = hasMore ? users[users.length - 1]?.id : undefined;

      const result: DiscoveryResult = { users, hasMore, nextCursor };

      // Cache result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      logger.error('DiscoveryService', 'discoverUsers failed', { error });
      return { users: [], hasMore: false };
    }
  }

  /**
   * Get recommended users based on algorithm
   */
  async getRecommendations(userId: string, limit = 10): Promise<User[]> {
    try {
      // Simple recommendation - get verified users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('verified', true)
        .neq('id', userId)
        .limit(limit);

      if (error) throw error;

      return (data || []) as unknown as User[];
    } catch (error) {
      logger.error('DiscoveryService', 'getRecommendations failed', { error });
      return [];
    }
  }

  /**
   * Clear discovery cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const discoveryService = new DiscoveryService();
export default discoveryService;
