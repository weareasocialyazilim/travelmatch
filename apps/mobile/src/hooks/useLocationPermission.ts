/**
 * useLocationPermission - Location Permission Management
 *
 * Handles:
 * - Permission request on first use
 * - Permission status detection
 * - Settings prompt on permanent denial
 * - Fallback to last known location
 * - Retry with exponential backoff on GPS timeout
 */
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { logger } from '@/utils/logger';

type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'limited';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// P2 FIX: Location retry configuration
const LOCATION_MAX_RETRIES = 3;
const LOCATION_INITIAL_DELAY_MS = 1000;
const LOCATION_MAX_DELAY_MS = 5000;

export interface UseLocationPermissionReturn {
  permissionStatus: PermissionStatus;
  hasPermission: boolean;
  currentLocation: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  lastKnownLocation: LocationCoords | null;
  checkPermission: () => Promise<PermissionStatus>;
  requestPermission: () => Promise<PermissionStatus>;
  getCurrentLocation: () => Promise<LocationCoords | null>;
  openSettings: () => Promise<void>;
}

export const useLocationPermission = (): UseLocationPermissionReturn => {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKnownLocation, setLastKnownLocation] =
    useState<LocationCoords | null>(null);

  // Check current permission status
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      let mappedStatus: PermissionStatus = 'undetermined';
      if (status === 'granted') {
        mappedStatus = 'granted';
      } else if (status === 'denied') {
        mappedStatus = 'denied';
      }

      setPermissionStatus(mappedStatus);
      return mappedStatus;
    } catch (err) {
      logger.error('[useLocationPermission] Failed to check permission:', err);
      return 'undetermined';
    }
  }, []);

  // Request permission on first use
  const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      const mappedStatus: PermissionStatus =
        status === 'granted' ? 'granted' : 'denied';
      setPermissionStatus(mappedStatus);

      logger.info('[useLocationPermission] Permission request result:', {
        status,
        mappedStatus,
      });

      return mappedStatus;
    } catch (err) {
      const errorMessage = 'Failed to request location permission';
      setError(errorMessage);
      logger.error('[useLocationPermission] Request failed:', err);
      return 'denied';
    } finally {
      setIsLoading(false);
    }
  }, []);

  // P2 FIX: Get current location with retry and exponential backoff
  const getCurrentLocationWithRetry = useCallback(
    async (
      attempt: number = 1,
      delayMs: number = LOCATION_INITIAL_DELAY_MS,
    ): Promise<LocationCoords | null> => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        } as any);

        const coords: LocationCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
        };

        setCurrentLocation(coords);
        setLastKnownLocation(coords);

        logger.info('[useLocationPermission] Location obtained:', {
          latitude: coords.latitude,
          longitude: coords.longitude,
          attempt,
        });

        return coords;
      } catch (err) {
        logger.warn('[useLocationPermission] Location attempt failed:', {
          attempt,
          error: err,
        });

        // Retry with exponential backoff
        if (attempt < LOCATION_MAX_RETRIES) {
          const nextDelay = Math.min(delayMs * 2, LOCATION_MAX_DELAY_MS);
          logger.info(
            '[useLocationPermission] Retrying location in',
            nextDelay,
            'ms',
          );
          await new Promise((resolve) => setTimeout(resolve, nextDelay));
          return getCurrentLocationWithRetry(attempt + 1, nextDelay);
        }

        // All retries exhausted, return last known location
        logger.warn(
          '[useLocationPermission] All location attempts failed, using last known',
        );
        return null;
      }
    },
    [],
  );

  // Get current location (public API with retry)
  const getCurrentLocation = useCallback(
    async (options?: {
      accuracy?: number;
      maximumAge?: number;
    }): Promise<LocationCoords | null> => {
      if (permissionStatus !== 'granted') {
        // Return last known location if permission denied
        return lastKnownLocation;
      }

      setIsLoading(true);
      setError(null);

      try {
        // P2 FIX: Use retry mechanism for reliable location fetching
        const location = await getCurrentLocationWithRetry();

        if (location) {
          return location;
        }

        // Fallback to last known if retry exhausted
        return lastKnownLocation;
      } catch (err) {
        const errorMessage = 'Failed to get current location';
        setError(errorMessage);
        logger.error('[useLocationPermission] Get location failed:', err);

        // Return last known location as fallback
        return lastKnownLocation;
      } finally {
        setIsLoading(false);
      }
    },
    [permissionStatus, lastKnownLocation, getCurrentLocationWithRetry],
  );

  // Open app settings (for permanent denial)
  const openSettings = useCallback(async () => {
    if ('openSettings' in Location) {
      await (Location as any).openSettings();
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Get location on mount if granted
  useEffect(() => {
    if (permissionStatus === 'granted') {
      getCurrentLocation();
    }
  }, [permissionStatus]);

  return {
    permissionStatus,
    hasPermission: permissionStatus === 'granted',
    currentLocation: currentLocation || lastKnownLocation,
    isLoading,
    error,
    lastKnownLocation,
    checkPermission,
    requestPermission,
    openSettings,
    getCurrentLocation,
  };
};

// Hook for getting location with automatic permission request
export const useLocation = (options?: {
  autoRequest?: boolean;
}): UseLocationPermissionReturn => {
  const location = useLocationPermission();

  useEffect(() => {
    if (options?.autoRequest && location.permissionStatus === 'undetermined') {
      location.requestPermission();
    }
  }, [location.permissionStatus, options?.autoRequest]);

  return location;
};

export default useLocationPermission;
