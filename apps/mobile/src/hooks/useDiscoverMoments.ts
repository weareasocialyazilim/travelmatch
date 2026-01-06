/**
 * useDiscoverMoments Hook
 *
 * Dating & Gifting Platform - Discovery with PostGIS
 *
 * Features:
 * - Location-based moment discovery via PostGIS
 * - Integration with searchStore filters (age, gender, distance)
 * - Automatic fallback when RPC is unavailable
 * - Cursor-based pagination for infinite scroll
 *
 * Usage:
 * ```tsx
 * const { moments, loading, error, refresh, loadMore, hasMore } = useDiscoverMoments();
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useSearchStore } from '@/stores/searchStore';
import {
  discoverNearbyMoments,
  type DiscoveryMoment,
} from '@/services/discoveryService';
import { logger } from '@/utils/logger';

interface UseDiscoverMomentsReturn {
  /** List of discovered moments */
  moments: DiscoveryMoment[];
  /** Loading state */
  loading: boolean;
  /** Error if any */
  error: Error | null;
  /** Refresh the list */
  refresh: () => Promise<void>;
  /** Load more moments (pagination) */
  loadMore: () => Promise<void>;
  /** Whether there are more moments to load */
  hasMore: boolean;
  /** User's current location */
  userLocation: { latitude: number; longitude: number } | null;
  /** Location permission status */
  locationPermission: 'granted' | 'denied' | 'undetermined';
}

const DEFAULT_LOCATION = {
  // Istanbul, Turkey as default
  latitude: 41.0082,
  longitude: 28.9784,
};

export const useDiscoverMoments = (): UseDiscoverMomentsReturn => {
  const mountedRef = useRef(true);
  const { filters } = useSearchStore();

  // State
  const [moments, setMoments] = useState<DiscoveryMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    'granted' | 'denied' | 'undetermined'
  >('undetermined');

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Get user location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (!mountedRef.current) return;

        if (status === 'granted') {
          setLocationPermission('granted');
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (!mountedRef.current) return;

          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          logger.debug('[useDiscoverMoments] Location acquired', {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        } else {
          setLocationPermission('denied');
          // Use default location
          setUserLocation(DEFAULT_LOCATION);
          logger.warn(
            '[useDiscoverMoments] Location permission denied, using default',
          );
        }
      } catch (err) {
        logger.error('[useDiscoverMoments] Failed to get location', err);
        if (mountedRef.current) {
          setLocationPermission('denied');
          setUserLocation(DEFAULT_LOCATION);
        }
      }
    };

    void getLocation();
  }, []);

  /**
   * Fetch moments with PostGIS-based discovery
   */
  const fetchMoments = useCallback(
    async (reset = false) => {
      if (!userLocation) return;

      try {
        setLoading(true);
        setError(null);

        const currentCursor = reset ? null : cursor;

        // Transform searchStore filters to DiscoverMomentsParams format
        const discoveryFilters = {
          minAge: filters.ageRange?.[0],
          maxAge: filters.ageRange?.[1],
          gender: filters.gender?.includes('all')
            ? undefined
            : filters.gender?.[0],
        };

        // Discover moments (automatically falls back if RPC fails)
        const result = await discoverNearbyMoments({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusKm: filters.maxDistance,
          filters: discoveryFilters,
          limit: 20,
          cursor: currentCursor || undefined,
        });

        if (!mountedRef.current) return;

        if (reset) {
          setMoments(result.moments);
        } else {
          setMoments((prev) => [...prev, ...result.moments]);
        }

        setHasMore(result.hasMore);
        setCursor(result.nextCursor ?? null);

        logger.debug('[useDiscoverMoments] Moments fetched', {
          count: result.moments.length,
          hasMore: result.hasMore,
          filters: {
            maxDistance: filters.maxDistance,
            ageRange: filters.ageRange,
            gender: filters.gender,
          },
        });
      } catch (err) {
        logger.error('[useDiscoverMoments] Fetch failed', err);
        if (mountedRef.current) {
          setError(err as Error);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [userLocation, filters, cursor],
  );

  /**
   * Refresh moments (reset pagination)
   */
  const refresh = useCallback(async () => {
    setCursor(null);
    await fetchMoments(true);
  }, [fetchMoments]);

  /**
   * Load more moments (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchMoments(false);
  }, [fetchMoments, hasMore, loading]);

  // Initial fetch when location is available
  useEffect(() => {
    if (userLocation) {
      void fetchMoments(true);
    }
  }, [userLocation]); // Only run when location changes

  // Refresh when filters change
  useEffect(() => {
    if (userLocation) {
      void refresh();
    }
  }, [filters]); // Only run when filters change

  return {
    moments,
    loading,
    error,
    refresh,
    loadMore,
    hasMore,
    userLocation,
    locationPermission,
  };
};

export default useDiscoverMoments;
