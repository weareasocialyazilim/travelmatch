/**
 * App Tracking Transparency Hook
 * iOS 14.5+ requires explicit user consent for tracking
 * CRITICAL: App Store will reject apps without this implementation
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// ATT Status types matching iOS ATTrackingManager
export type TrackingStatus =
  | 'not-determined'
  | 'restricted'
  | 'denied'
  | 'authorized'
  | 'unavailable';

export interface ATTResult {
  status: TrackingStatus;
  isTrackingEnabled: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<TrackingStatus>;
  canRequestTracking: boolean;
}

const ATT_PERMISSION_KEY = '@travelmatch/att_permission_requested';

/**
 * Check if ATT is available on this device
 * Only available on iOS 14.5+
 */
const isATTAvailable = (): boolean => {
  if (Platform.OS !== 'ios') return false;

  const iosVersion = parseInt(Platform.Version as string, 10);
  return iosVersion >= 14;
};

/**
 * Dynamic import of expo-tracking-transparency
 * Falls back gracefully if not installed
 */
const getTrackingModule = async () => {
  try {
    // Dynamic import to avoid crashes if module not installed
    const module = await import('expo-tracking-transparency');
    return module;
  } catch (error) {
    logger.warn('ATT', 'expo-tracking-transparency not available', error);
    return null;
  }
};

/**
 * Hook for managing App Tracking Transparency
 *
 * Usage:
 * ```tsx
 * const { status, isTrackingEnabled, requestPermission } = useAppTrackingTransparency();
 *
 * useEffect(() => {
 *   if (status === 'not-determined') {
 *     requestPermission();
 *   }
 * }, [status]);
 * ```
 */
export const useAppTrackingTransparency = (options?: {
  autoRequest?: boolean;
  onStatusChange?: (status: TrackingStatus) => void;
}): ATTResult => {
  const { autoRequest = false, onStatusChange } = options ?? {};

  const [status, setStatus] = useState<TrackingStatus>('not-determined');
  const [isLoading, setIsLoading] = useState(true);
  const [canRequestTracking, setCanRequestTracking] = useState(false);

  // Check current permission status
  const checkStatus = useCallback(async () => {
    if (!isATTAvailable()) {
      setStatus('unavailable');
      setIsLoading(false);
      return 'unavailable' as TrackingStatus;
    }

    try {
      const trackingModule = await getTrackingModule();
      if (!trackingModule) {
        setStatus('unavailable');
        setIsLoading(false);
        return 'unavailable' as TrackingStatus;
      }

      const { getTrackingPermissionsAsync } = trackingModule;
      const { status: currentStatus } = await getTrackingPermissionsAsync();

      const mappedStatus = mapStatus(currentStatus);
      setStatus(mappedStatus);
      setCanRequestTracking(mappedStatus === 'not-determined');

      return mappedStatus;
    } catch (error) {
      logger.error('ATT', 'Failed to check tracking status', error);
      setStatus('unavailable');
      return 'unavailable' as TrackingStatus;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<TrackingStatus> => {
    if (!isATTAvailable()) {
      return 'unavailable';
    }

    // Check if already requested (to avoid showing dialog multiple times)
    const alreadyRequested = await AsyncStorage.getItem(ATT_PERMISSION_KEY);
    if (alreadyRequested === 'true' && status !== 'not-determined') {
      return status;
    }

    try {
      setIsLoading(true);

      const trackingModule = await getTrackingModule();
      if (!trackingModule) {
        return 'unavailable';
      }

      const { requestTrackingPermissionsAsync } = trackingModule;
      const { status: newStatus } = await requestTrackingPermissionsAsync();

      const mappedStatus = mapStatus(newStatus);
      setStatus(mappedStatus);
      setCanRequestTracking(false);

      // Mark as requested
      await AsyncStorage.setItem(ATT_PERMISSION_KEY, 'true');

      // Notify callback
      onStatusChange?.(mappedStatus);

      logger.info('ATT', `Tracking permission result: ${mappedStatus}`);

      return mappedStatus;
    } catch (error) {
      logger.error('ATT', 'Failed to request tracking permission', error);
      return status;
    } finally {
      setIsLoading(false);
    }
  }, [status, onStatusChange]);

  // Ref for auto-request timeout cleanup
  const autoRequestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial check on mount
  useEffect(() => {
    const initialize = async () => {
      const currentStatus = await checkStatus();

      // Auto-request if enabled and status is not-determined
      if (autoRequest && currentStatus === 'not-determined') {
        // Small delay to avoid showing dialog immediately on app launch
        autoRequestTimeoutRef.current = setTimeout(() => {
          void requestPermission();
          autoRequestTimeoutRef.current = null;
        }, 1000);
      }
    };

    void initialize();

    // Cleanup timeout on unmount
    return () => {
      if (autoRequestTimeoutRef.current) {
        clearTimeout(autoRequestTimeoutRef.current);
        autoRequestTimeoutRef.current = null;
      }
    };
  }, [checkStatus, autoRequest, requestPermission]);

  return {
    status,
    isTrackingEnabled: status === 'authorized',
    isLoading,
    requestPermission,
    canRequestTracking,
  };
};

/**
 * Map expo-tracking-transparency status to our TrackingStatus type
 */
function mapStatus(status: string): TrackingStatus {
  switch (status) {
    case 'granted':
      return 'authorized';
    case 'denied':
      return 'denied';
    case 'restricted':
      return 'restricted';
    case 'undetermined':
    default:
      return 'not-determined';
  }
}

/**
 * Show pre-permission dialog explaining why tracking is needed
 * Best practice: Show this before the system dialog
 */
export const showTrackingExplanation = (): Promise<boolean> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Help Us Improve TravelMatch',
      'We use tracking to personalize your experience and show relevant travel suggestions. ' +
        'Your data is never sold to third parties.\n\n' +
        'You can change this anytime in Settings.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Continue',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: false },
    );
  });
};

export default useAppTrackingTransparency;
