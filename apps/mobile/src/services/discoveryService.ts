/**
 * Discovery Service
 * Dating & Gifting Platform - Advanced Moment Discovery
 *
 * Features:
 * - PostGIS distance-based filtering (st_distancesphere)
 * - Dating filters (age, gender, distance)
 * - Gift value range filtering
 * - Real-time user location tracking
 *
 * Supabase RPC Function Required:
 * ```sql
 * CREATE OR REPLACE FUNCTION nearby_moments(
 *   user_lat double precision,
 *   user_lng double precision,
 *   max_distance_km integer DEFAULT 500,
 *   min_age integer DEFAULT 18,
 *   max_age integer DEFAULT 99,
 *   gender_filter text[] DEFAULT ARRAY['male', 'female', 'non-binary'],
 *   min_price numeric DEFAULT 0,
 *   max_price numeric DEFAULT 999999,
 *   category_filter text DEFAULT NULL,
 *   page_limit integer DEFAULT 20,
 *   page_cursor text DEFAULT NULL
 * )
 * RETURNS TABLE (
 *   id uuid,
 *   title text,
 *   description text,
 *   images text[],
 *   price numeric,
 *   currency text,
 *   category text,
 *   latitude double precision,
 *   longitude double precision,
 *   location text,
 *   distance_km double precision,
 *   user_id uuid,
 *   user_name text,
 *   user_avatar text,
 *   user_age integer,
 *   user_gender text,
 *   user_rating numeric,
 *   created_at timestamptz
 * )
 * LANGUAGE plpgsql
 * AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT
 *     m.id,
 *     m.title,
 *     m.description,
 *     m.images,
 *     m.price,
 *     m.currency,
 *     m.category,
 *     m.latitude,
 *     m.longitude,
 *     m.location,
 *     ROUND((ST_DistanceSphere(
 *       ST_MakePoint(m.longitude, m.latitude),
 *       ST_MakePoint(user_lng, user_lat)
 *     ) / 1000)::numeric, 2) as distance_km,
 *     u.id as user_id,
 *     u.full_name as user_name,
 *     u.avatar_url as user_avatar,
 *     EXTRACT(YEAR FROM age(u.birth_date))::integer as user_age,
 *     u.gender as user_gender,
 *     u.rating as user_rating,
 *     m.created_at
 *   FROM moments m
 *   JOIN users u ON m.user_id = u.id
 *   WHERE m.status = 'active'
 *     AND m.deleted_at IS NULL
 *     AND m.latitude IS NOT NULL
 *     AND m.longitude IS NOT NULL
 *     AND ST_DistanceSphere(
 *       ST_MakePoint(m.longitude, m.latitude),
 *       ST_MakePoint(user_lng, user_lat)
 *     ) <= max_distance_km * 1000
 *     AND EXTRACT(YEAR FROM age(u.birth_date)) BETWEEN min_age AND max_age
 *     AND (u.gender = ANY(gender_filter) OR 'all' = ANY(gender_filter))
 *     AND m.price BETWEEN min_price AND max_price
 *     AND (category_filter IS NULL OR m.category = category_filter)
 *   ORDER BY distance_km ASC, m.created_at DESC
 *   LIMIT page_limit;
 * END;
 * $$;
 * ```
 */

import { supabase } from '@/config/supabase';
import { callRpc } from './supabaseRpc';
import { logger } from '@/utils/logger';
import type { SearchFilters, GenderOption } from '@/stores/searchStore';

export interface DiscoveryMoment {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  category: string;
  latitude: number;
  longitude: number;
  location: string;
  distanceKm: number;
  host: {
    id: string;
    name: string;
    avatar: string;
    age: number;
    gender: string;
    rating: number;
  };
  createdAt: string;
}

export interface DiscoveryOptions {
  /** User's current location */
  userLocation: {
    latitude: number;
    longitude: number;
  };
  /** Filters from searchStore */
  filters: SearchFilters;
  /** Pagination limit */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
}

/**
 * Fetch nearby moments with dating filters using PostGIS
 */
export const discoverNearbyMoments = async (
  options: DiscoveryOptions,
): Promise<{
  data: DiscoveryMoment[];
  hasMore: boolean;
  nextCursor: string | null;
  error: Error | null;
}> => {
  const { userLocation, filters, limit = 20, cursor } = options;

  try {
    // Map gender filter to PostgreSQL array format
    const genderFilter: string[] = filters.gender?.includes('all')
      ? ['male', 'female', 'non-binary']
      : filters.gender || ['male', 'female', 'non-binary'];

    const { data, error } = await callRpc<Record<string, unknown>[]>(
      'nearby_moments',
      {
        user_lat: userLocation.latitude,
        user_lng: userLocation.longitude,
        max_distance_km: filters.maxDistance || 500,
        min_age: filters.ageRange?.[0] || 18,
        max_age: filters.ageRange?.[1] || 99,
        gender_filter: genderFilter,
        min_price: filters.giftValueRange?.[0] || 0,
        max_price: filters.giftValueRange?.[1] || 999999,
        category_filter: filters.momentCategory || null,
        page_limit: limit + 1,
        page_cursor: cursor || null,
      },
    );

    if (error) throw error;

    const hasMore = (data?.length || 0) > limit;
    const items = hasMore ? data!.slice(0, limit) : data || [];

    // Map to DiscoveryMoment type
    const moments: DiscoveryMoment[] = items.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      images: (row.images as string[]) || [],
      price: row.price as number,
      currency: row.currency as string,
      category: row.category as string,
      latitude: row.latitude as number,
      longitude: row.longitude as number,
      location: row.location as string,
      distanceKm: row.distance_km as number,
      host: {
        id: row.user_id as string,
        name: row.user_name as string,
        avatar: row.user_avatar as string,
        age: row.user_age as number,
        gender: row.user_gender as string,
        rating: row.user_rating as number,
      },
      createdAt: row.created_at as string,
    }));

    // Generate cursor from last item
    let nextCursor: string | null = null;
    if (hasMore && moments.length > 0) {
      const lastMoment = moments[moments.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          created_at: lastMoment.createdAt,
          id: lastMoment.id,
        }),
      ).toString('base64');
    }

    logger.debug('discoveryService', 'Nearby moments fetched', {
      count: moments.length,
      hasMore,
      filters: {
        maxDistance: filters.maxDistance,
        ageRange: filters.ageRange,
        gender: filters.gender,
      },
    });

    return { data: moments, hasMore, nextCursor, error: null };
  } catch (err) {
    logger.error('discoveryService', 'Failed to fetch nearby moments', err);
    return {
      data: [],
      hasMore: false,
      nextCursor: null,
      error: err as Error,
    };
  }
};

/**
 * Fallback: Fetch moments without PostGIS (client-side distance calculation)
 * Used when RPC function is not available
 */
export const discoverMomentsFallback = async (
  options: DiscoveryOptions,
): Promise<{
  data: DiscoveryMoment[];
  hasMore: boolean;
  error: Error | null;
}> => {
  const { userLocation, filters, limit = 20 } = options;

  try {
    let query = supabase
      .from('moments')
      .select(
        `
        *,
        users:user_id (
          id,
          full_name,
          avatar_url,
          birth_date,
          gender,
          rating
        )
      `,
      )
      .eq('status', 'active')
      .is('deleted_at', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Apply price filter
    if (filters.giftValueRange) {
      query = query
        .gte('price', filters.giftValueRange[0])
        .lte('price', filters.giftValueRange[1]);
    }

    // Apply category filter
    if (filters.momentCategory) {
      query = query.eq('category', filters.momentCategory);
    }

    query = query.order('created_at', { ascending: false }).limit(limit + 1);

    const { data, error } = await query;

    if (error) throw error;

    // Client-side distance calculation using Haversine formula
    const calculateDistance = (
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number,
    ): number => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Calculate age from birth_date
    const calculateAge = (birthDate: string | null): number => {
      if (!birthDate) return 0;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    // Filter and map results
    const filteredMoments = (data || [])
      .map((row: any) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          row.latitude,
          row.longitude,
        );
        const age = calculateAge(row.users?.birth_date);
        return {
          ...row,
          distanceKm: Math.round(distance * 100) / 100,
          hostAge: age,
        };
      })
      .filter((row: any) => {
        // Distance filter
        if (filters.maxDistance && row.distanceKm > filters.maxDistance) {
          return false;
        }
        // Age filter
        if (filters.ageRange) {
          if (
            row.hostAge < filters.ageRange[0] ||
            row.hostAge > filters.ageRange[1]
          ) {
            return false;
          }
        }
        // Gender filter
        if (filters.gender && !filters.gender.includes('all')) {
          if (!filters.gender.includes(row.users?.gender as GenderOption)) {
            return false;
          }
        }
        return true;
      })
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

    const hasMore = filteredMoments.length > limit;
    const items = hasMore ? filteredMoments.slice(0, limit) : filteredMoments;

    const moments: DiscoveryMoment[] = items.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      images: row.images || [],
      price: row.price,
      currency: row.currency,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      location: row.location,
      distanceKm: row.distanceKm,
      host: {
        id: row.users?.id || row.user_id,
        name: row.users?.full_name || 'Unknown',
        avatar: row.users?.avatar_url || '',
        age: row.hostAge,
        gender: row.users?.gender || 'unknown',
        rating: row.users?.rating || 0,
      },
      createdAt: row.created_at,
    }));

    return { data: moments, hasMore, error: null };
  } catch (err) {
    logger.error('discoveryService', 'Fallback fetch failed', err);
    return { data: [], hasMore: false, error: err as Error };
  }
};

export default {
  discoverNearbyMoments,
  discoverMomentsFallback,
};
