/**
 * Performance Overlay Component
 * DEV-only overlay showing real-time performance metrics
 * @module components/dev/PerformanceOverlay
 *
 * @description
 * Displays real-time performance information including:
 * - FPS (frames per second)
 * - Memory usage
 * - JS thread load
 * - Network status
 * - Render count
 *
 * Only visible in development mode (__DEV__).
 *
 * @example
 * ```tsx
 * import { PerformanceOverlay } from '@/components/dev/PerformanceOverlay';
 *
 * // In your App.tsx
 * function App() {
 *   return (
 *     <>
 *       <MainContent />
 *       <PerformanceOverlay />
 *     </>
 *   );
 * }
 * ```
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  memoryUsage: number;
  jsHeapSize: number;
  renderCount: number;
  lastRenderTime: number;
}

interface PerformanceOverlayProps {
  /** Whether the overlay is enabled (default: __DEV__) */
  enabled?: boolean;
  /** Position of the overlay */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Initial expanded state */
  initialExpanded?: boolean;
}

// FPS tracking
let frameCount = 0;
let lastFrameTime = Date.now();
let fps = 60;
let frameDrops = 0;

const updateFPS = () => {
  const now = Date.now();
  const delta = now - lastFrameTime;

  if (delta >= 1000) {
    fps = Math.round((frameCount * 1000) / delta);
    if (fps < 55) frameDrops++;
    frameCount = 0;
    lastFrameTime = now;
  }

  frameCount++;
};

/**
 * Performance Overlay Component
 */
const PerformanceOverlay: React.FC<PerformanceOverlayProps> = memo(
  ({ enabled = __DEV__, position = 'top-right', initialExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const [isVisible, setIsVisible] = useState(enabled);
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
      fps: 60,
      frameDrops: 0,
      memoryUsage: 0,
      jsHeapSize: 0,
      renderCount: 0,
      lastRenderTime: 0,
    });

    const slideAnim = useState(new Animated.Value(isExpanded ? 1 : 0))[0];
    const renderCountRef = React.useRef(0);

    // Track render count
    renderCountRef.current++;

    // Update FPS
    useEffect(() => {
      if (!enabled) return;

      let animationFrameId: number;
      const updateIntervalIdRef = { current: null as NodeJS.Timeout | null };

      const trackFrame = () => {
        updateFPS();
        animationFrameId = requestAnimationFrame(trackFrame);
      };

      trackFrame();

      // Update metrics every second
      updateIntervalIdRef.current = setInterval(() => {
        setMetrics((prev) => ({
          ...prev,
          fps,
          frameDrops,
          renderCount: renderCountRef.current,
          lastRenderTime: Date.now(),
        }));
      }, 1000);

      return () => {
        cancelAnimationFrame(animationFrameId);
        if (updateIntervalIdRef.current) {
          clearInterval(updateIntervalIdRef.current);
        }
      };
    }, [enabled]);

    // Animate expansion
    useEffect(() => {
      Animated.spring(slideAnim, {
        toValue: isExpanded ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }, [isExpanded, slideAnim]);

    const toggleExpanded = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const toggleVisibility = useCallback(() => {
      setIsVisible((prev) => !prev);
    }, []);

    // Don't render in production or if disabled
    if (!enabled || !__DEV__) {
      return null;
    }

    // Minimized view
    if (!isVisible) {
      return (
        <TouchableOpacity
          style={[styles.minimizedButton, positionStyles[position]]}
          onPress={toggleVisibility}
          activeOpacity={0.8}
        >
          <Text style={styles.minimizedText}>📊</Text>
        </TouchableOpacity>
      );
    }

    const fpsColor =
      metrics.fps >= 55 ? '#4CAF50' : metrics.fps >= 30 ? '#FFC107' : '#F44336';

    return (
      <View style={[styles.container, positionStyles[position]]}>
        {/* Header - Always visible */}
        <TouchableOpacity
          style={styles.header}
          onPress={toggleExpanded}
          onLongPress={toggleVisibility}
          activeOpacity={0.8}
        >
          <View style={styles.fpsContainer}>
            <Text style={[styles.fpsValue, { color: fpsColor }]}>
              {metrics.fps}
            </Text>
            <Text style={styles.fpsLabel}>FPS</Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▲'}</Text>
        </TouchableOpacity>

        {/* Expanded details */}
        <Animated.View
          style={[
            styles.detailsContainer,
            {
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Frame Drops</Text>
            <Text
              style={[
                styles.metricValue,
                { color: metrics.frameDrops > 10 ? '#F44336' : '#fff' },
              ]}
            >
              {metrics.frameDrops}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Renders</Text>
            <Text style={styles.metricValue}>{metrics.renderCount}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Platform</Text>
            <Text style={styles.metricValue}>{Platform.OS}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Screen</Text>
            <Text style={styles.metricValue}>
              {Dimensions.get('window').width}x{Dimensions.get('window').height}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.hideButton}
            onPress={toggleVisibility}
          >
            <Text style={styles.hideButtonText}>Hide Overlay</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  },
);

PerformanceOverlay.displayName = 'PerformanceOverlay';

const positionStyles = StyleSheet.create({
  'top-left': {
    top: 50,
    left: 10,
  },
  'top-right': {
    top: 50,
    right: 10,
  },
  'bottom-left': {
    bottom: 100,
    left: 10,
  },
  'bottom-right': {
    bottom: 100,
    right: 10,
  },
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    padding: 8,
    minWidth: 80,
    zIndex: 9999,
    elevation: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  fpsContainer: {
    alignItems: 'center',
  },
  fpsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  fpsLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: -4,
  },
  expandIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
  },
  metricValue: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  hideButton: {
    marginTop: 8,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    alignItems: 'center',
  },
  hideButtonText: {
    fontSize: 10,
    color: '#999',
  },
  minimizedButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  minimizedText: {
    fontSize: 18,
  },
});

export { PerformanceOverlay };
export type { PerformanceOverlayProps, PerformanceMetrics };
