/**
 * Moments Service - Single Source of Truth
 *
 * ELEVATED: This service handles ALL moment-related API operations.
 * Moved from features/discover to features/moments as part of
 * architectural reorganization (Moments are the core of the app).
 *
 * Ghost Terminology Purge:
 * - max_travelers → removed (not relevant for moments)
 * - destination → location_name
 * - budget_range → requested_amount + currency (Buyer sets price)
 */

import { supabase } from '@/config/supabase';

// ===================================
// SUBSCRIPTION TYPES
// ===================================

/**
 * Subscription Tier Types
 * TravelMatch 3-Tier System:
 * - free (Momentum): Basic users
 * - premium: Subscribers with enhanced features
 * - platinum: Top-tier with all privileges
 */
export type SubscriptionTier = 'free' | 'premium' | 'platinum';

/**
 * Profile with subscription data
 * Ghost Logic Cleanup: Replaces is_vip boolean with subscription_tier
 */
export interface ProfileWithSubscription {
  id: string;
  username: string;
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  trust_score: number;
  full_name?: string;
}

// ===================================
// MOMENT TYPES - CLEANED
// ===================================

/**
 * Experience categories for moments
 * Replaces old travel-based categories
 */
export type ExperienceCategory =
  | 'dining'
  | 'nightlife'
  | 'culture'
  | 'adventure'
  | 'wellness'
  | 'entertainment'
  | 'shopping'
  | 'other';

/**
 * Moment filters - CLEANED from travel terminology
 */
export interface MomentFilters {
  /** Search by location name */
  location_name?: string;
  /** Filter by experience category */
  experience_category?: ExperienceCategory;
  /** Minimum gift amount filter */
  giftRangeMin?: number;
  /** Maximum gift amount filter */
  giftRangeMax?: number;
  /** Filter by tags */
  tags?: string[];
  /** Filter by currency */
  currency?: string;
}

/**
 * Create Moment DTO - CLEANED
 *
 * "Alıcı Fiyat Belirler" modeli:
 * - requested_amount: Anı oluşturan (Alıcı) kişinin istediği hediye miktarı
 * - currency: Para birimi
 */
export interface CreateMomentDto {
  /** Moment title (3-100 chars) */
  title: string;
  /** Optional description */
  description?: string;
  /** Experience category */
  experience_category: ExperienceCategory;
  /** Location name (e.g., "Eiffel Tower, Paris") */
  location_name: string;
  /** Location coordinates for map display */
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  /** Image URLs (max 5) */
  images?: string[];
  /** Primary image URL */
  image_url?: string;
  /** Tags for discovery */
  tags?: string[];
  /**
   * REQUIRED: Requested gift amount (Alıcı sets this)
   * Min: 1 (validated in schema)
   */
  requested_amount: number;
  /**
   * REQUIRED: Currency for the requested amount
   */
  currency: string;
}

/**
 * Update Moment DTO - CLEANED
 */
export interface UpdateMomentDto {
  title?: string;
  description?: string;
  experience_category?: ExperienceCategory;
  location_name?: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  images?: string[];
  image_url?: string;
  tags?: string[];
  is_published?: boolean;
  requested_amount?: number;
  currency?: string;
}

// ===================================
// SUBSCRIPTION HELPERS
// ===================================

/**
 * Get user's active subscription tier
 * Ghost Logic Cleanup: Replaces is_vip boolean checks
 */
export const getUserSubscriptionTier = async (
  userId: string,
): Promise<SubscriptionTier> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return 'free'; // Default to free tier
  }

  return (data.plan_id as SubscriptionTier) || 'free';
};

/**
 * Check if user can make subscriber offers
 * Premium and above can suggest alternative gift packages
 */
export const canMakeSubscriberOffer = (tier: SubscriptionTier): boolean => {
  return ['premium', 'platinum'].includes(tier);
};

// ===================================
// MOMENTS API - SINGLE TRUTH
// ===================================

/**
 * Moments API Service
 *
 * Single source of truth for all moment operations.
 * LEGACY CLEANUP: Removed trip_requests and bookings functions.
 *
 * NOTE: DB table is still 'trips' but we filter category != 'trip'
 */
export const momentsApi = {
  /**
   * Get all moments (with filtering)
   * Excludes travel plans - only moments
   * Includes host profile for display
   */
  getAll: async (filters?: MomentFilters) => {
    // SECURITY: Explicit column selection - never use select('*')
    let query = supabase
      .from('trips') // DB table name unchanged
      .select(
        `
        id,
        user_id,
        title,
        description,
        destination,
        status,
        price,
        currency,
        category,
        image_url,
        images,
        tags,
        requested_amount,
        requested_currency,
        location_name,
        location_lat,
        location_lng,
        created_at,
        updated_at,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          trust_score
        )
      `,
      )
      .eq('is_published', true)
      .neq('category', 'trip') // CRITICAL: Filter out travel plans, only moments
      .is('deleted_at', null);

    // Location name search (replaces destination)
    if (filters?.location_name) {
      query = query.or(
        `destination.ilike.%${filters.location_name}%,location_name.ilike.%${filters.location_name}%`,
      );
    }

    // Experience category filter
    if (filters?.experience_category) {
      query = query.eq('category', filters.experience_category);
    }

    // Gift range filters
    if (filters?.giftRangeMin) {
      query = query.gte('requested_amount', filters.giftRangeMin);
    }

    if (filters?.giftRangeMax) {
      query = query.lte('requested_amount', filters.giftRangeMax);
    }

    // Currency filter
    if (filters?.currency) {
      query = query.eq('requested_currency', filters.currency);
    }

    // Tags filter
    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get moment by ID
   */
  getById: async (id: string) => {
    // SECURITY: Explicit column selection
    const { data, error } = await supabase
      .from('trips')
      .select(
        `
        id,
        user_id,
        title,
        description,
        destination,
        status,
        price,
        currency,
        category,
        image_url,
        images,
        tags,
        requested_amount,
        requested_currency,
        location_name,
        location_lat,
        location_lng,
        created_at,
        updated_at,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          trust_score,
          bio
        )
      `,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new moment
   * "Alıcı Fiyat Belirler" - requested_amount is REQUIRED
   */
  create: async (moment: CreateMomentDto) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate required price field
    if (!moment.requested_amount || moment.requested_amount < 1) {
      throw new Error('Requested amount must be at least 1');
    }

    if (!moment.currency) {
      throw new Error('Currency is required');
    }

    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        title: moment.title,
        description: moment.description,
        category: moment.experience_category,
        // Map location_name to destination for DB compatibility
        destination: moment.location_name,
        location_name: moment.location_name,
        location_lat: moment.location?.latitude,
        location_lng: moment.location?.longitude,
        image_url: moment.image_url,
        images: moment.images,
        tags: moment.tags,
        // "Alıcı Fiyat Belirler" fields
        requested_amount: moment.requested_amount,
        requested_currency: moment.currency,
        // Legacy price field for compatibility
        price: moment.requested_amount,
        currency: moment.currency,
        is_published: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update moment
   */
  update: async (id: string, updates: UpdateMomentDto) => {
    const updateData: Record<string, unknown> = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.experience_category)
      updateData.category = updates.experience_category;
    if (updates.location_name) {
      updateData.location_name = updates.location_name;
      updateData.destination = updates.location_name; // DB compatibility
    }
    if (updates.location) {
      updateData.location_lat = updates.location.latitude;
      updateData.location_lng = updates.location.longitude;
    }
    if (updates.images) updateData.images = updates.images;
    if (updates.image_url) updateData.image_url = updates.image_url;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.is_published !== undefined)
      updateData.is_published = updates.is_published;
    if (updates.requested_amount) {
      updateData.requested_amount = updates.requested_amount;
      updateData.price = updates.requested_amount; // Legacy compatibility
    }
    if (updates.currency) {
      updateData.currency = updates.currency;
      updateData.requested_currency = updates.currency;
    }

    const { data, error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete moment (soft delete)
   */
  delete: async (id: string) => {
    const { error } = await supabase
      .from('trips')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get user's moments
   */
  getMyMoments: async (userId: string) => {
    // SECURITY: Explicit column selection
    const { data, error } = await supabase
      .from('trips')
      .select(
        `
        id,
        user_id,
        title,
        description,
        destination,
        location_name,
        status,
        price,
        currency,
        category,
        image_url,
        images,
        requested_amount,
        requested_currency,
        created_at,
        updated_at
      `,
      )
      .eq('user_id', userId)
      .neq('category', 'trip') // Only moments, not travel plans
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Save moment (bookmark)
   */
  saveMoment: async (momentId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('saved_moments')
      .insert({
        user_id: user.id,
        moment_id: momentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Unsave moment (remove bookmark)
   */
  unsaveMoment: async (momentId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('saved_moments')
      .delete()
      .eq('user_id', user.id)
      .eq('moment_id', momentId);

    if (error) throw error;
  },

  /**
   * Get saved moments
   */
  getSavedMoments: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('saved_moments')
      .select(
        `
        id,
        created_at,
        trips (
          id,
          title,
          description,
          image_url,
          requested_amount,
          requested_currency,
          location_name,
          category,
          profiles (
            id,
            username,
            avatar_url
          )
        )
      `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
