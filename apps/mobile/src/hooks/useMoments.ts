/**
 * useMoments Hook
 * Moment CRUD operations and feed management
 *
 * PERFORMANCE OPTIMIZED:
 * - Uses cursor-based pagination (O(1) vs O(n) for offset)
 * - Efficient for large datasets (1000+ moments)
 * - Consistent results even with real-time inserts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import { momentsService } from '../services/supabaseDbService';
import { uploadMomentImages } from '../services/supabaseStorageService';
import { logger } from '../utils/logger';
import { ErrorHandler } from '../utils/errorHandler';
import { usePagination, type PaginatedResponse } from './usePagination';
import type { Database } from '../types/database.types';

// MomentRow type from the database - includes joined data from momentsService
interface MomentRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  location_point?: { lat: number; lng: number } | null;
  images: string[] | null;
  price: number | null;
  currency: string | null;
  max_guests: number | null;
  duration: number | null;
  availability: string[] | null;
  host_id: string;
  saves_count: number | null;
  is_saved?: boolean;
  rating?: number | null;
  distance?: number | null;
  created_at: string | null;
  updated_at?: string | null;
  status?: string | null;
  // Joined host data
  host?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  users?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

// Types
export interface Moment {
  id: string;
  title: string;
  description: string;
  category: string | { id: string; label: string; emoji: string };
  location:
    | {
        city: string;
        country: string;
        coordinates?: {
          lat: number;
          lng: number;
        };
      }
    | string; // Can be string for legacy/display purposes
  images: string[];
  image?: string; // Single image shorthand
  pricePerGuest: number;
  price?: number; // Alias for pricePerGuest
  currency: string;
  maxGuests: number;
  duration: string;
  availability: string[];
  distance?: string; // Distance from user's location

  // Host info
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostRating: number;
  hostReviewCount: number;

  // Stats
  saves: number;
  requestCount?: number; // Number of active requests

  // User interaction state
  isSaved: boolean;

  // Status & completion
  status: 'active' | 'paused' | 'draft' | 'deleted' | 'completed';
  rating?: number; // Rating for completed moments
  completedDate?: string; // Completion date
  date?: string; // Display date
  createdAt: string;
  updatedAt: string;
}

export interface MomentFilters {
  category?: string;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
  search?: string;
}

export interface CreateMomentData {
  title: string;
  description: string;
  category: string;
  location: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  pricePerGuest: number;
  currency: string;
  maxGuests: number;
  duration: string;
  availability: string[];
}

interface UseMomentsReturn {
  // Feed (cursor-based pagination)
  moments: Moment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;

  // Filters
  filters: MomentFilters;
  setFilters: (filters: MomentFilters) => void;
  clearFilters: () => void;

  // Single moment
  getMoment: (id: string) => Promise<Moment | null>;

  // CRUD
  createMoment: (data: CreateMomentData) => Promise<Moment | null>;
  updateMoment: (
    id: string,
    data: Partial<CreateMomentData>,
  ) => Promise<Moment | null>;
  deleteMoment: (id: string) => Promise<boolean>;
  pauseMoment: (id: string) => Promise<boolean>;
  activateMoment: (id: string) => Promise<boolean>;

  // Interactions
  saveMoment: (id: string) => Promise<boolean>;
  unsaveMoment: (id: string) => Promise<boolean>;

  // My moments
  myMoments: Moment[];
  loadMyMoments: () => Promise<void>;
  myMomentsLoading: boolean;

  // Saved moments
  savedMoments: Moment[];
  loadSavedMoments: () => Promise<void>;
  savedMomentsLoading: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

const mapToMoment = (row: MomentRow): Moment => {
  // Extract user data from the optimized join
  const userData = row.users || row.user || {};

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    images: row.images || [],
    pricePerGuest: row.price,
    currency: row.currency,
    maxGuests: row.max_guests,
    duration: row.duration,
    availability: row.availability || [],
    hostId: row.user_id,
    hostName: userData.name || 'Unknown',
    hostAvatar: userData.avatar || '',
    hostRating: userData.rating || userData.trust_score || 0,
    hostReviewCount: userData.review_count || 0,
    saves: row.favorites_count || 0,
    isSaved: false,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const useMoments = (): UseMomentsReturn => {
  // Mount tracking ref to prevent memory leaks
  const mountedRef = useRef(true);

  // Filters state
  const [filters, setFiltersState] = useState<MomentFilters>({});

  // My moments
  const [myMoments, setMyMoments] = useState<Moment[]>([]);
  const [myMomentsLoading, setMyMomentsLoading] = useState(false);

  // Saved moments
  const [savedMoments, setSavedMoments] = useState<Moment[]>([]);
  const [savedMomentsLoading, setSavedMomentsLoading] = useState(false);

  // Track mounted state for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Fetcher for cursor-based pagination
   */
  const momentsFetcher = useCallback(
    async (cursor?: string | null): Promise<PaginatedResponse<Moment>> => {
      const { data, meta, error } = await momentsService.listWithCursor({
        cursor,
        limit: DEFAULT_PAGE_SIZE,
        category: filters.category,
        city: filters.city,
        country: filters.country,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        search: filters.search,
      });

      if (error) throw error;

      // Map Supabase rows to Moment type
      const mappedMoments: Moment[] = data.map(mapToMoment);

      return {
        data: mappedMoments,
        meta: {
          next_cursor: meta.next_cursor,
          has_more: meta.has_more,
          count: meta.count,
        },
      };
    },
    [filters],
  );

  // Use cursor-based pagination hook
  const {
    items: moments,
    loadMore,
    refresh,
    hasMore,
    loading,
    error,
  } = usePagination(momentsFetcher, {
    limit: DEFAULT_PAGE_SIZE,
    autoLoad: true,
  });

  /**
   * Set filters and refresh
   */
  const setFilters = useCallback((newFilters: MomentFilters) => {
    setFiltersState(newFilters);
    // Refresh will be triggered by useEffect when filters change
  }, []);

  /**
   * Clear filters and refresh
   */
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // Refresh when filters change
  useEffect(() => {
    void refresh();
  }, [filters, refresh]);

  /**
   * Get single moment
   */
  const getMoment = useCallback(async (id: string): Promise<Moment | null> => {
    try {
      const { data, error } = await momentsService.getById(id);
      if (error) throw error;
      return data ? mapToMoment(data) : null;
    } catch (err) {
      const standardizedError = ErrorHandler.handle(err, 'getMoment');
      logger.error('Failed to get moment:', standardizedError);
      return null;
    }
  }, []);

  /**
   * Create moment
   */
  const createMoment = useCallback(
    async (data: CreateMomentData): Promise<Moment | null> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Generate a unique moment ID for organizing uploaded images
        const momentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Upload images to Supabase Storage first
        let uploadedImageUrls: string[] = [];
        if (data.images && data.images.length > 0) {
          logger.info('[createMoment] Uploading images...', {
            count: data.images.length,
          });

          const uploadResults = await uploadMomentImages(
            data.images,
            user.id,
            momentId,
          );

          // Filter successful uploads and get URLs
          uploadedImageUrls = uploadResults
            .filter((result) => result.url !== null)
            .map((result) => result.url as string);

          // Check if any uploads failed
          const failedUploads = uploadResults.filter(
            (result) => result.error !== null,
          );
          if (failedUploads.length > 0) {
            logger.warn('[createMoment] Some images failed to upload:', {
              failed: failedUploads.length,
              total: data.images.length,
            });
          }

          if (uploadedImageUrls.length === 0) {
            throw new Error('Failed to upload images');
          }

          logger.info('[createMoment] Images uploaded successfully', {
            count: uploadedImageUrls.length,
          });
        }

        const momentData = {
          user_id: user.id,
          title: data.title,
          description: data.description,
          category: data.category,
          location:
            typeof data.location === 'string'
              ? data.location
              : data.location?.city || '',
          latitude: data.location?.coordinates?.lat ?? null,
          longitude: data.location?.coordinates?.lng ?? null,
          date: new Date().toISOString(),
          max_participants: data.maxGuests || 1,
          images: uploadedImageUrls, // Use uploaded URLs instead of local URIs
          price: data.pricePerGuest,
          currency: data.currency,
          max_guests: data.maxGuests,
          duration: data.duration,
          availability: data.availability,
          status: 'active',
        };

        const insertPayload =
          momentData as unknown as Database['public']['Tables']['moments']['Insert'];
        const { data: moment, error } =
          await momentsService.create(insertPayload);
        if (error) throw error;

        const newMoment = moment ? mapToMoment(moment) : null;
        if (newMoment && mountedRef.current) {
          setMyMoments((prev) => [newMoment, ...prev]);
          // Note: Main feed uses cursor pagination, refresh to see new moment
          void refresh();
        }
        return newMoment;
      } catch (err) {
        const standardizedError = ErrorHandler.handle(err, 'createMoment');
        logger.error('Failed to create moment:', standardizedError);
        return null;
      }
    },

    [],
  );

  /**
   * Update moment
   */
  const updateMoment = useCallback(
    async (
      id: string,
      data: Partial<CreateMomentData>,
    ): Promise<Moment | null> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const updates: Partial<{
          title: string;
          description: string;
          category: string;
          location: string;
          price: number;
          currency: string;
          max_guests: number;
          duration: number;
          availability: string[];
          images: string[];
        }> = {};
        if (data.title) updates.title = data.title;
        if (data.description) updates.description = data.description;
        if (data.category) updates.category = data.category;
        if (data.location) updates.location = data.location;
        if (data.pricePerGuest) updates.price = data.pricePerGuest;
        if (data.currency) updates.currency = data.currency;
        if (data.maxGuests) updates.max_guests = data.maxGuests;
        if (data.duration) updates.duration = data.duration;
        if (data.availability) updates.availability = data.availability;

        // Handle images - upload new local files, keep existing URLs
        if (data.images && data.images.length > 0) {
          const existingUrls: string[] = [];
          const localUris: string[] = [];

          // Separate existing URLs from new local URIs
          for (const image of data.images) {
            if (image.startsWith('file://') || image.startsWith('content://')) {
              localUris.push(image);
            } else {
              existingUrls.push(image);
            }
          }

          // Upload new local images if any
          if (localUris.length > 0) {
            logger.info('[updateMoment] Uploading new images...', {
              count: localUris.length,
            });

            const uploadResults = await uploadMomentImages(
              localUris,
              user.id,
              id,
            );
            const uploadedUrls = uploadResults
              .filter((result) => result.url !== null)
              .map((result) => result.url as string);

            logger.info('[updateMoment] New images uploaded', {
              count: uploadedUrls.length,
            });

            updates.images = [...existingUrls, ...uploadedUrls];
          } else {
            updates.images = existingUrls;
          }
        }

        const { data: moment, error } = await momentsService.update(
          id,
          updates,
        );
        if (error) throw error;

        const updatedMoment = moment ? mapToMoment(moment) : null;
        if (updatedMoment && mountedRef.current) {
          // Update in lists where it appears
          const updateFn = (list: Moment[]) =>
            list.map((m) => (m.id === id ? updatedMoment : m));

          setMyMoments(updateFn);
          // Note: Main feed uses cursor pagination, refresh to see update
          void refresh();
        }
        return updatedMoment;
      } catch (err) {
        logger.error('Failed to update moment:', err);
        return null;
      }
    },

    [],
  );

  /**
   * Delete moment
   */
  const deleteMoment = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await momentsService.delete(id);
        if (error) throw error;

        if (mountedRef.current) {
          setMyMoments((prev) => prev.filter((m) => m.id !== id));
          // Note: Main feed uses cursor pagination, refresh to see deletion
          void refresh();
        }
        return true;
      } catch (err) {
        logger.error('Failed to delete moment:', err);
        return false;
      }
    },
    [refresh],
  );

  /**
   * Pause moment
   */
  const pauseMoment = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await momentsService.pause(id);
        if (error) throw error;

        if (mountedRef.current) {
          const updateStatus = (list: Moment[]) =>
            list.map((m) =>
              m.id === id ? { ...m, status: 'paused' as const } : m,
            );

          setMyMoments(updateStatus);
          // Note: Main feed uses cursor pagination, refresh to see status change
          void refresh();
        }
        return true;
      } catch (err) {
        logger.error('Failed to pause moment:', err);
        return false;
      }
    },
    [refresh],
  );

  /**
   * Activate moment
   */
  const activateMoment = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await momentsService.activate(id);
        if (error) throw error;

        if (mountedRef.current) {
          const updateStatus = (list: Moment[]) =>
            list.map((m) =>
              m.id === id ? { ...m, status: 'active' as const } : m,
            );

          setMyMoments(updateStatus);
          // Note: Main feed uses cursor pagination, refresh to see status change
          void refresh();
        }
        return true;
      } catch (err) {
        logger.error('Failed to activate moment:', err);
        return false;
      }
    },
    [refresh],
  );

  /**
   * Save moment
   */
  const saveMoment = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await momentsService.save(user.id, id);
        if (error) throw error;

        if (!mountedRef.current) return true;

        // Add to saved list (optimistic update)
        const moment = moments.find((m) => m.id === id);
        if (moment) {
          setSavedMoments((prev) => [
            { ...moment, isSaved: true, saves: moment.saves + 1 },
            ...prev,
          ]);
        }

        // Refresh main feed to update save count
        void refresh();

        return true;
      } catch (err) {
        logger.error('Failed to save moment:', err);
        return false;
      }
    },
    [moments, refresh],
  );

  /**
   * Unsave moment
   */
  const unsaveMoment = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await momentsService.unsave(user.id, id);
        if (error) throw error;

        if (!mountedRef.current) return true;

        // Remove from saved list
        setSavedMoments((prev) => prev.filter((m) => m.id !== id));

        // Refresh main feed to update save count
        void refresh();

        return true;
      } catch (err) {
        logger.error('Failed to unsave moment:', err);
        return false;
      }
    },
    [refresh],
  );

  /**
   * Load my moments
   */
  const loadMyMoments = useCallback(async () => {
    try {
      setMyMomentsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await momentsService.list({ userId: user.id });
      if (error) throw error;

      const mappedMoments: Moment[] = data.map(mapToMoment);

      setMyMoments(mappedMoments);
    } catch (err) {
      logger.error('Failed to load my moments:', err);
    } finally {
      if (mountedRef.current) {
        setMyMomentsLoading(false);
      }
    }
  }, []);

  /**
   * Load saved moments
   */
  const loadSavedMoments = useCallback(async () => {
    try {
      setSavedMomentsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await momentsService.getSaved(user.id);
      if (error) throw error;

      if (!mountedRef.current) return;

      const mappedMoments: Moment[] = data.map((row: MomentRow) => ({
        ...mapToMoment(row),
        isSaved: true,
      }));

      setSavedMoments(mappedMoments);
    } catch (err) {
      logger.error('Failed to load saved moments:', err);
    } finally {
      if (mountedRef.current) {
        setSavedMomentsLoading(false);
      }
    }
  }, []);

  return {
    // Feed (cursor-based pagination)
    moments,
    loading,
    error: error || null,
    refresh,
    loadMore,
    hasMore,

    // Filters
    filters,
    setFilters,
    clearFilters,

    // Single moment
    getMoment,

    // CRUD
    createMoment,
    updateMoment,
    deleteMoment,
    pauseMoment,
    activateMoment,

    // Interactions
    saveMoment,
    unsaveMoment,

    // My moments
    myMoments,
    loadMyMoments,
    myMomentsLoading,

    // Saved moments
    savedMoments,
    loadSavedMoments,
    savedMomentsLoading,
  };
};

export default useMoments;
