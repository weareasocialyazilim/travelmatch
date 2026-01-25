/**
 * Moments Service - Single Source of Truth
 *
 * ELEVATED: This service handles ALL moment-related API operations.
 * Moments are the core experience of Lovendo - sharing and gifting
 * unforgettable experiences with others.
 *
 * Terminology Note:
 * - location_name: Where the moment takes place
 * - requested_amount: Gift expectation set by moment creator
 * - currency: Currency for the gift amount
 */

import { supabase } from '@/config/supabase';

// ===================================
// SUBSCRIPTION TYPES
// ===================================

/**
 * Subscription Tier Types
 * Lovendo 3-Tier System:
 * - free (Momentum): Basic users
 * - premium: Subscribers with enhanced features
 * - platinum: Top-tier with all privileges
 */
export type SubscriptionTier = 'free' | 'premium' | 'platinum';

/**
 * Profile with subscription data
 * Uses subscription_tier for feature gating
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
 * Categories help users discover relevant experiences
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
 * Moment filters for discovery
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
 * Create Moment DTO
 *
 * "Alıcı Fiyat Belirler" modeli:
 * - requested_amount: Anı oluşturan kişinin istediği hediye miktarı
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
 * Update Moment DTO
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
 * Returns the current subscription plan for feature gating
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
 * Handles creating, reading, updating, and deleting moments.
 */
export const momentsApi = {
  /**
   * Get all moments (with filtering)
   * Returns published moments with host profile
   */
  getAll: async (filters?: MomentFilters) => {
    // SECURITY: Explicit column selection - never use select('*')
    let query = supabase
      .from('moments')
      .select(
        `
        id,
        user_id,
        title,
        description,
        location,
        status,
        price,
        currency,
        category,
        images,
        tags,
        created_at,
        updated_at,
        users:user_id (
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq('status', 'active');

    // Location name search
    if (filters?.location_name) {
      query = query.ilike('location', `%${filters.location_name}%`);
    }

    // Experience category filter
    if (filters?.experience_category) {
      query = query.eq('category', filters.experience_category);
    }

    // Gift range filters
    if (filters?.giftRangeMin) {
      query = query.gte('price', filters.giftRangeMin);
    }

    if (filters?.giftRangeMax) {
      query = query.lte('price', filters.giftRangeMax);
    }

    // Currency filter
    if (filters?.currency) {
      query = query.eq('currency', filters.currency);
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
      .from('moments')
      .select(
        `
        id,
        user_id,
        title,
        description,
        location,
        status,
        price,
        currency,
        category,
        images,
        tags,
        created_at,
        updated_at,
        users:user_id (
          id,
          full_name,
          avatar_url,
          bio
        )
      `,
      )
      .eq('id', id)
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
      .from('moments')
      .insert({
        user_id: user.id,
        title: moment.title,
        description: moment.description,
        category: moment.experience_category,
        location: moment.location_name,
        images: moment.images || [],
        tags: moment.tags || [],
        price: moment.requested_amount,
        currency: moment.currency,
        date: new Date().toISOString(),
        status: 'active',
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
      updateData.location = updates.location_name;
    }
    if (updates.images) updateData.images = updates.images;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.requested_amount) {
      updateData.price = updates.requested_amount;
    }
    if (updates.currency) {
      updateData.currency = updates.currency;
    }

    const { data, error } = await supabase
      .from('moments')
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
      .from('moments')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get user's moments
   */
  getMyMoments: async (userId: string) => {
    // SECURITY: Explicit column selection
    const { data, error } = await supabase
      .from('moments')
      .select(
        `
        id,
        user_id,
        title,
        description,
        location,
        status,
        price,
        currency,
        category,
        images,
        created_at,
        updated_at
      `,
      )
      .eq('user_id', userId)
      .neq('status', 'cancelled')
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
        moments (
          id,
          title,
          description,
          images,
          price,
          currency,
          location,
          category,
          users:user_id (
            id,
            full_name,
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
