/**
 * useMoments Hook
 * Moment CRUD operations and feed management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import { logger } from '../utils/logger';

// Types
export interface Moment {
  id: string;
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

  // Host info
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostRating: number;
  hostReviewCount: number;

  // Stats
  saves: number;

  // User interaction state
  isSaved: boolean;

  // Status
  status: 'active' | 'paused' | 'draft' | 'deleted';
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
  page?: number;
  pageSize?: number;
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
  // Feed
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

const DEFAULT_PAGE_SIZE = 10;

export const useMoments = (): UseMomentsReturn => {
  // Mount tracking ref to prevent memory leaks
  const mountedRef = useRef(true);

  // Feed state
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFiltersState] = useState<MomentFilters>({});

  // My moments
  const [myMoments, setMyMoments] = useState<Moment[]>([]);
  const [myMomentsLoading, setMyMomentsLoading] = useState(false);

  // Saved moments
  const [savedMoments, setSavedMoments] = useState<Moment[]>([]);
  const [savedMomentsLoading, setSavedMomentsLoading] = useState(false);

  // Ref to track if initial load happened
  const initialLoadDone = useRef(false);

  // Track mounted state for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Fetch moments with filters
   */
  const fetchMoments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (!append) setLoading(true);
        setError(null);

        const response = await api.get<{ moments: Moment[]; total: number }>(
          '/moments',
          {
            params: { ...filters, page: pageNum, pageSize: DEFAULT_PAGE_SIZE },
          },
        );

        if (!mountedRef.current) return;

        if (append) {
          setMoments((prev) => [...prev, ...response.moments]);
        } else {
          setMoments(response.moments);
        }

        setHasMore(response.moments.length === DEFAULT_PAGE_SIZE);
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load moments');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [filters],
  );

  /**
   * Refresh moments
   */
  const refresh = useCallback(async () => {
    setPage(1);
    await fetchMoments(1, false);
  }, [fetchMoments]);

  /**
   * Load more moments
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMoments(nextPage, true);
  }, [page, hasMore, loading, fetchMoments]);

  /**
   * Set filters
   */
  const setFilters = useCallback((newFilters: MomentFilters) => {
    setFiltersState(newFilters);
    setPage(1);
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPage(1);
  }, []);

  /**
   * Get single moment
   */
  const getMoment = useCallback(async (id: string): Promise<Moment | null> => {
    try {
      const response = await api.get<{ moment: Moment }>(`/moments/${id}`);
      return response.moment;
    } catch (err) {
      logger.error('Failed to get moment:', err);
      return null;
    }
  }, []);

  /**
   * Create moment
   */
  const createMoment = useCallback(
    async (data: CreateMomentData): Promise<Moment | null> => {
      try {
        const response = await api.post<{ moment: Moment }>('/moments', data);
        if (mountedRef.current) {
          setMyMoments((prev) => [response.moment, ...prev]);
        }
        return response.moment;
      } catch (err) {
        logger.error('Failed to create moment:', err);
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
        const response = await api.put<{ moment: Moment }>(
          `/moments/${id}`,
          data,
        );

        if (!mountedRef.current) return response.moment;

        // Update in all lists
        const updateInList = (list: Moment[]) =>
          list.map((m) => (m.id === id ? response.moment : m));

        setMoments(updateInList);
        setMyMoments(updateInList);

        return response.moment;
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
  const deleteMoment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/moments/${id}`);

      if (mountedRef.current) {
        setMoments((prev) => prev.filter((m) => m.id !== id));
        setMyMoments((prev) => prev.filter((m) => m.id !== id));
      }

      return true;
    } catch (err) {
      logger.error('Failed to delete moment:', err);
      return false;
    }
  }, []);

  /**
   * Pause moment
   */
  const pauseMoment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.post(`/moments/${id}/pause`);

      if (!mountedRef.current) return true;

      const updateStatus = (list: Moment[]) =>
        list.map((m) =>
          m.id === id ? { ...m, status: 'paused' as const } : m,
        );

      setMoments(updateStatus);
      setMyMoments(updateStatus);

      return true;
    } catch (err) {
      logger.error('Failed to pause moment:', err);
      return false;
    }
  }, []);

  /**
   * Activate moment
   */
  const activateMoment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.post(`/moments/${id}/activate`);

      if (!mountedRef.current) return true;

      const updateStatus = (list: Moment[]) =>
        list.map((m) =>
          m.id === id ? { ...m, status: 'active' as const } : m,
        );

      setMoments(updateStatus);
      setMyMoments(updateStatus);

      return true;
    } catch (err) {
      logger.error('Failed to activate moment:', err);
      return false;
    }
  }, []);

  /**
   * Save moment
   */
  const saveMoment = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await api.post(`/moments/${id}/save`);

        if (!mountedRef.current) return true;

        const updateSave = (list: Moment[]) =>
          list.map((m) =>
            m.id === id ? { ...m, isSaved: true, saves: m.saves + 1 } : m,
          );

        setMoments(updateSave);
        setMyMoments(updateSave);

        // Add to saved list
        const momentToSave = moments.find((m) => m.id === id);
        if (momentToSave) {
          setSavedMoments((prev) => [
            { ...momentToSave, isSaved: true },
            ...prev,
          ]);
        }

        return true;
      } catch (err) {
        logger.error('Failed to save moment:', err);
        return false;
      }
    },
    [moments],
  );

  /**
   * Unsave moment
   */
  const unsaveMoment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/moments/${id}/save`);

      if (!mountedRef.current) return true;

      const updateSave = (list: Moment[]) =>
        list.map((m) =>
          m.id === id
            ? { ...m, isSaved: false, saves: Math.max(0, m.saves - 1) }
            : m,
        );

      setMoments(updateSave);
      setMyMoments(updateSave);
      setSavedMoments((prev) => prev.filter((m) => m.id !== id));

      return true;
    } catch (err) {
      logger.error('Failed to unsave moment:', err);
      return false;
    }
  }, []);

  /**
   * Load my moments
   */
  const loadMyMoments = useCallback(async () => {
    try {
      setMyMomentsLoading(true);
      const response = await api.get<{ moments: Moment[] }>('/moments/my');
      if (mountedRef.current) {
        setMyMoments(response.moments);
      }
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
      const response = await api.get<{ moments: Moment[] }>('/moments/saved');
      if (mountedRef.current) {
        setSavedMoments(response.moments);
      }
    } catch (err) {
      logger.error('Failed to load saved moments:', err);
    } finally {
      if (mountedRef.current) {
        setSavedMomentsLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchMoments(1, false);
    }
  }, [fetchMoments]);

  // Refetch when filters change
  useEffect(() => {
    if (initialLoadDone.current) {
      fetchMoments(1, false);
    }
  }, [filters, fetchMoments]);

  return {
    // Feed
    moments,
    loading,
    error,
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
