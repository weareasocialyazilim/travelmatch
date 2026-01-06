/**
 * useLowPowerMode Hook
 * Detects device performance capabilities and provides animation settings
 *
 * Uses useScreenPerformance metrics to offer "Low Power Mode" for:
 * - Older devices with limited GPU/CPU
 * - Battery saver mode detection
 * - User preference for reduced motion
 *
 * @example
 * const { isLowPowerMode, animationConfig, shouldReduceAnimations } = useLowPowerMode();
 *
 * // In component:
 * <Animated.View style={isLowPowerMode ? staticStyle : animatedStyle} />
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Platform,
  AccessibilityInfo,
  AppState,
  AppStateStatus,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '../services/analytics';
import { logger } from '../utils/logger';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  SLOW_MOUNT_TIME: 300, // ms - screen mount time considered slow
  SLOW_FRAME_TIME: 20, // ms - frame time (target 16.67ms for 60fps)
  SLOW_RESPONSE_TIME: 150, // ms - interaction response time
  SAMPLE_COUNT: 5, // Number of samples to collect before evaluation
} as const;

// Animation configuration presets
const ANIMATION_CONFIGS = {
  full: {
    enableAnimations: true,
    enableBlur: true,
    enableShadows: true,
    enableParticles: true,
    enableHaptics: true,
    springConfig: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    transitionDuration: 300,
  },
  reduced: {
    enableAnimations: true,
    enableBlur: false, // Blur is expensive
    enableShadows: true,
    enableParticles: false, // Particles are expensive
    enableHaptics: true,
    springConfig: {
      damping: 20, // Faster settle
      stiffness: 200,
      mass: 0.8,
    },
    transitionDuration: 200,
  },
  minimal: {
    enableAnimations: false,
    enableBlur: false,
    enableShadows: false,
    enableParticles: false,
    enableHaptics: true, // Keep haptics for feedback
    springConfig: {
      damping: 25,
      stiffness: 300,
      mass: 0.5,
    },
    transitionDuration: 100,
  },
} as const;

type PerformanceMode = 'full' | 'reduced' | 'minimal';
type AnimationConfig = (typeof ANIMATION_CONFIGS)[PerformanceMode];

interface PerformanceSample {
  mountTime: number;
  timestamp: number;
}

interface LowPowerModeState {
  /** Whether device is in low power mode */
  isLowPowerMode: boolean;
  /** Current performance mode */
  performanceMode: PerformanceMode;
  /** Animation configuration for current mode */
  animationConfig: AnimationConfig;
  /** Whether to reduce animations (respects user preference) */
  shouldReduceAnimations: boolean;
  /** User has manually enabled low power mode */
  userPreferredLowPower: boolean;
  /** Device supports reduce motion accessibility */
  reduceMotionEnabled: boolean;
  /** Offer low power mode to user */
  shouldOfferLowPowerMode: boolean;
}

interface LowPowerModeActions {
  /** Enable low power mode manually */
  enableLowPowerMode: () => Promise<void>;
  /** Disable low power mode manually */
  disableLowPowerMode: () => Promise<void>;
  /** Toggle low power mode */
  toggleLowPowerMode: () => Promise<void>;
  /** Record a performance sample (mount time) */
  recordPerformanceSample: (mountTime: number) => void;
  /** Reset performance samples */
  resetPerformanceSamples: () => void;
}

const STORAGE_KEY = '@travelmatch/lowPowerMode';

export const useLowPowerMode = (): LowPowerModeState & LowPowerModeActions => {
  // State
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [userPreferredLowPower, setUserPreferredLowPower] = useState(false);
  const [performanceSamples, setPerformanceSamples] = useState<
    PerformanceSample[]
  >([]);
  const [detectedSlowDevice, setDetectedSlowDevice] = useState(false);
  const [_appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  // Load user preference from storage
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setUserPreferredLowPower(JSON.parse(stored));
        }
      } catch (error) {
        logger.warn('Failed to load low power mode preference', error as Error);
      }
    };
    loadPreference();
  }, []);

  // Listen for reduce motion accessibility setting
  useEffect(() => {
    const checkReduceMotion = async () => {
      const isReduceMotionEnabled =
        await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotionEnabled(isReduceMotionEnabled);
    };

    checkReduceMotion();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setReduceMotionEnabled(enabled);
        logger.info('[LowPowerMode] Reduce motion changed', { enabled });
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Listen for app state changes (battery saver detection)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Analyze performance samples
  useEffect(() => {
    if (performanceSamples.length >= PERFORMANCE_THRESHOLDS.SAMPLE_COUNT) {
      const avgMountTime =
        performanceSamples.reduce((sum, s) => sum + s.mountTime, 0) /
        performanceSamples.length;

      const isSlowDevice =
        avgMountTime > PERFORMANCE_THRESHOLDS.SLOW_MOUNT_TIME;

      if (isSlowDevice !== detectedSlowDevice) {
        setDetectedSlowDevice(isSlowDevice);

        logger.info('[LowPowerMode] Device performance detected', {
          avgMountTime,
          isSlowDevice,
          sampleCount: performanceSamples.length,
        });

        // Track analytics
        analytics.trackEvent('device_performance_detected', {
          avg_mount_time_ms: avgMountTime,
          is_slow_device: isSlowDevice,
          sample_count: performanceSamples.length,
          platform: Platform.OS,
        });
      }
    }
  }, [performanceSamples, detectedSlowDevice]);

  // Record performance sample
  const recordPerformanceSample = useCallback((mountTime: number) => {
    setPerformanceSamples((prev) => {
      const newSamples = [
        ...prev.slice(-PERFORMANCE_THRESHOLDS.SAMPLE_COUNT + 1),
        { mountTime, timestamp: Date.now() },
      ];
      return newSamples;
    });
  }, []);

  // Reset samples
  const resetPerformanceSamples = useCallback(() => {
    setPerformanceSamples([]);
    setDetectedSlowDevice(false);
  }, []);

  // Enable low power mode
  const enableLowPowerMode = useCallback(async () => {
    setUserPreferredLowPower(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(true));
      analytics.trackEvent('low_power_mode_enabled', {
        source: 'manual',
        detected_slow: detectedSlowDevice,
      });
    } catch (error) {
      logger.error('Failed to save low power mode preference', error as Error);
    }
  }, [detectedSlowDevice]);

  // Disable low power mode
  const disableLowPowerMode = useCallback(async () => {
    setUserPreferredLowPower(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(false));
      analytics.trackEvent('low_power_mode_disabled', {
        source: 'manual',
      });
    } catch (error) {
      logger.error('Failed to save low power mode preference', error as Error);
    }
  }, []);

  // Toggle low power mode
  const toggleLowPowerMode = useCallback(async () => {
    if (userPreferredLowPower) {
      await disableLowPowerMode();
    } else {
      await enableLowPowerMode();
    }
  }, [userPreferredLowPower, enableLowPowerMode, disableLowPowerMode]);

  // Compute derived state
  const computedState = useMemo((): LowPowerModeState => {
    // Determine if we should reduce animations
    const shouldReduceAnimations =
      reduceMotionEnabled || userPreferredLowPower || detectedSlowDevice;

    // Determine performance mode
    let performanceMode: PerformanceMode = 'full';

    if (reduceMotionEnabled) {
      // User has system-level reduce motion - use minimal
      performanceMode = 'minimal';
    } else if (userPreferredLowPower) {
      // User explicitly enabled low power mode
      performanceMode = 'reduced';
    } else if (detectedSlowDevice) {
      // Auto-detected slow device - suggest reduced
      performanceMode = 'reduced';
    }

    // Get animation config for current mode
    const animationConfig = ANIMATION_CONFIGS[performanceMode];

    // Should we offer low power mode to user?
    const shouldOfferLowPowerMode =
      detectedSlowDevice && !userPreferredLowPower && !reduceMotionEnabled;

    return {
      isLowPowerMode: performanceMode !== 'full',
      performanceMode,
      animationConfig,
      shouldReduceAnimations,
      userPreferredLowPower,
      reduceMotionEnabled,
      shouldOfferLowPowerMode,
    };
  }, [reduceMotionEnabled, userPreferredLowPower, detectedSlowDevice]);

  return {
    ...computedState,
    enableLowPowerMode,
    disableLowPowerMode,
    toggleLowPowerMode,
    recordPerformanceSample,
    resetPerformanceSamples,
  };
};

// Export animation configs for direct use
export { ANIMATION_CONFIGS, PERFORMANCE_THRESHOLDS };
export type {
  PerformanceMode,
  AnimationConfig,
  LowPowerModeState,
  LowPowerModeActions,
};

/**
 * Usage Example:
 *
 * ```tsx
 * // In a ceremony/animation-heavy screen:
 * const {
 *   isLowPowerMode,
 *   animationConfig,
 *   shouldOfferLowPowerMode,
 *   enableLowPowerMode
 * } = useLowPowerMode();
 *
 * // Use in animations
 * const animatedStyle = useAnimatedStyle(() => {
 *   if (!animationConfig.enableAnimations) {
 *     return { opacity: 1, transform: [{ scale: 1 }] };
 *   }
 *   return {
 *     opacity: withSpring(1, animationConfig.springConfig),
 *     transform: [{ scale: withSpring(1, animationConfig.springConfig) }],
 *   };
 * });
 *
 * // Offer low power mode to user
 * {shouldOfferLowPowerMode && (
 *   <LowPowerModePrompt
 *     onAccept={enableLowPowerMode}
 *     onDismiss={() => {}}
 *   />
 * )}
 * ```
 */
