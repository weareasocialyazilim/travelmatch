/**
 * useScreenTracking Hook
 * Automatically tracks screen views for analytics
 */

import { useEffect, useRef } from 'react';
import { useRoute, useNavigationState } from '@react-navigation/native';
import { analytics } from '@/services/analytics';

interface ScreenTrackingOptions {
  /**
   * Custom screen name (defaults to route name)
   */
  screenName?: string;
  /**
   * Additional properties to track
   */
  properties?: Record<string, unknown>;
  /**
   * Disable automatic tracking
   */
  disabled?: boolean;
}

/**
 * Hook to track screen views
 *
 * @example
 * // Basic usage
 * useScreenTracking();
 *
 * // With custom name
 * useScreenTracking({ screenName: 'TripDetails' });
 *
 * // With properties
 * useScreenTracking({
 *   properties: { tripId: route.params.tripId }
 * });
 */
export const useScreenTracking = (options: ScreenTrackingOptions = {}) => {
  const route = useRoute();
  const routesLength = useNavigationState((state) => state.routes.length);
  const trackedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate tracking
    if (trackedRef.current || options.disabled) return;

    const screenName = options.screenName || route.name;
    const properties = {
      screen: screenName,
      route: route.name,
      params: JSON.stringify(route.params || {}),
      stackDepth: routesLength,
      timestamp: Date.now(),
      ...options.properties,
    };

    // Track screen view
    analytics.screen(screenName, properties);

    // Mark as tracked
    trackedRef.current = true;

    // Cleanup
    return () => {
      trackedRef.current = false;
    };
  }, [route.name, route.params, routesLength, options]);
};

/**
 * Hook to track user actions
 *
 * @example
 * const trackAction = useActionTracking();
 *
 * trackAction('button_clicked', {
 *   buttonName: 'Submit',
 *   formName: 'Login'
 * });
 */
export const useActionTracking = () => {
  const route = useRoute();

  return (action: string, properties?: Record<string, unknown>) => {
    analytics.trackEvent(action, {
      screen: route.name,
      timestamp: Date.now(),
      ...properties,
    });
  };
};

/**
 * Hook to track conversion funnels
 *
 * @example
 * const funnel = useFunnelTracking('checkout');
 *
 * // Start funnel
 * funnel.start({ productId: '123' });
 *
 * // Complete step
 * funnel.step('payment_info_entered');
 *
 * // Complete funnel
 * funnel.complete({ revenue: 99.99 });
 *
 * // Abandon funnel
 * funnel.abandon({ reason: 'payment_failed' });
 */
export const useFunnelTracking = (funnelName: string) => {
  const route = useRoute();
  const funnelStartTime = useRef<number | null>(null);
  const currentStep = useRef(0);

  const start = (properties?: Record<string, unknown>) => {
    funnelStartTime.current = Date.now();
    currentStep.current = 0;

    analytics.trackEvent(`${funnelName}_started`, {
      funnel: funnelName,
      screen: route.name,
      ...properties,
    });
  };

  const step = (stepName: string, properties?: Record<string, unknown>) => {
    currentStep.current += 1;

    analytics.trackEvent(`${funnelName}_step`, {
      funnel: funnelName,
      step: stepName,
      stepNumber: currentStep.current,
      screen: route.name,
      timeElapsed: funnelStartTime.current
        ? Date.now() - funnelStartTime.current
        : 0,
      ...properties,
    });
  };

  const complete = (properties?: Record<string, unknown>) => {
    const duration = funnelStartTime.current
      ? Date.now() - funnelStartTime.current
      : 0;

    analytics.trackEvent(`${funnelName}_completed`, {
      funnel: funnelName,
      duration,
      steps: currentStep.current,
      screen: route.name,
      ...properties,
    });

    // Reset
    funnelStartTime.current = null;
    currentStep.current = 0;
  };

  const abandon = (properties?: Record<string, unknown>) => {
    const duration = funnelStartTime.current
      ? Date.now() - funnelStartTime.current
      : 0;

    analytics.trackEvent(`${funnelName}_abandoned`, {
      funnel: funnelName,
      duration,
      lastStep: currentStep.current,
      screen: route.name,
      ...properties,
    });

    // Reset
    funnelStartTime.current = null;
    currentStep.current = 0;
  };

  return {
    start,
    step,
    complete,
    abandon,
  };
};

/**
 * Hook to track errors
 *
 * @example
 * const trackError = useErrorTracking();
 *
 * try {
 *   await fetchData();
 * } catch (error) {
 *   trackError(error, { context: 'fetchData' });
 * }
 */
export const useErrorTracking = () => {
  const route = useRoute();

  return (error: Error | unknown, properties?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    analytics.trackEvent('error_occurred', {
      error: errorMessage,
      stack: errorStack,
      screen: route.name,
      timestamp: Date.now(),
      ...properties,
    });
  };
};

/**
 * Unified Analytics Hook
 * Combines all analytics functionality
 * Safe to use outside of navigation context
 *
 * @example
 * const { trackEvent, trackError } = useAnalytics();
 *
 * trackEvent('button_clicked', { buttonName: 'Submit' });
 */
export const useAnalytics = () => {
  const trackEvent = (action: string, properties?: Record<string, unknown>) => {
    analytics.trackEvent(action, {
      screen: 'app',
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackError = (
    error: Error | unknown,
    properties?: Record<string, unknown>,
  ) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    analytics.trackEvent('error_occurred', {
      error: errorMessage,
      stack: errorStack,
      screen: 'app',
      timestamp: Date.now(),
      ...properties,
    });
  };

  return {
    trackEvent,
    trackError,
  };
};

export default {
  useScreenTracking,
  useActionTracking,
  useFunnelTracking,
  useErrorTracking,
  useAnalytics,
};
