/**
 * useScreenPerformance Hook
 * Track screen mount time, render performance, and user interactions
 * Integrates with performance monitoring service
 */

import { useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  mountTime: number;
  renderTime: number;
  interactions: Record<string, number>;
}

/**
 * Track screen performance metrics
 * @param screenName - Name of the screen to track
 * @returns Object with trackMount and trackInteraction methods
 */
export const useScreenPerformance = (screenName: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const metricsRef = useRef<PerformanceMetrics>({
    mountTime: 0,
    renderTime: 0,
    interactions: {},
  });

  /**
   * Track screen mount and initial render
   */
  const trackMount = useCallback(() => {
    const mountDuration = Date.now() - mountTimeRef.current;
    metricsRef.current.mountTime = mountDuration;

    logger.debug(`[Performance] ${screenName} mounted in ${mountDuration}ms`);

    // TODO: Send to analytics/monitoring service
    if (typeof global.performance !== 'undefined') {
      // eslint-disable-next-line no-console
      logger.debug(`📊 [Performance] ${screenName}:`, {
        mountTime: mountDuration,
        timestamp: new Date().toISOString(),
      });
    }
  }, [screenName]);

  /**
   * Track user interaction performance
   * @param interactionName - Name of the interaction (e.g., 'button_click', 'form_submit')
   * @param metadata - Optional metadata about the interaction
   */
  const trackInteraction = useCallback(
    (interactionName: string, metadata?: Record<string, unknown>) => {
      const interactionTime = Date.now();
      metricsRef.current.interactions[interactionName] = interactionTime;

      logger.debug(
        `[Performance] ${screenName} - ${interactionName}`,
        metadata,
      );

      // TODO: Send to analytics service
      // eslint-disable-next-line no-console
      logger.debug(`🎯 [Interaction] ${screenName} - ${interactionName}:`, {
        metadata,
        timestamp: new Date().toISOString(),
      });
    },
    [screenName],
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    const mountTime = mountTimeRef.current;
    return () => {
      const totalTime = Date.now() - mountTime;
      logger.debug(
        `[Performance] ${screenName} unmounted after ${totalTime}ms`,
      );
    };
  }, [screenName]);

  return {
    trackMount,
    trackInteraction,
  };
};
