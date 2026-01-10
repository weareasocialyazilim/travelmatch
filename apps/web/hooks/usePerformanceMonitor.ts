'use client';

import { useState, useEffect, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  isLowPerformance: boolean;
  shouldReduceQuality: boolean;
  memoryUsage?: number;
  gpuTier: 'low' | 'medium' | 'high';
}

interface UsePerformanceMonitorOptions {
  targetFps?: number;
  lowFpsThreshold?: number;
  sampleSize?: number;
  checkInterval?: number;
  onLowPerformance?: () => void;
}

export const usePerformanceMonitor = (
  options: UsePerformanceMonitorOptions = {},
): PerformanceMetrics => {
  const {
    targetFps = 60,
    lowFpsThreshold = 30,
    sampleSize = 60,
    checkInterval = 1000,
    onLowPerformance,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    avgFps: 60,
    isLowPerformance: false,
    shouldReduceQuality: false,
    gpuTier: 'medium',
  });

  const fpsHistoryRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lowPerformanceTriggeredRef = useRef<boolean>(false);

  // Detect GPU tier on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectGPU = () => {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) return 'low';

      const debugInfo = (gl as WebGLRenderingContext).getExtension(
        'WEBGL_debug_renderer_info',
      );
      if (!debugInfo) return 'medium';

      const renderer = (gl as WebGLRenderingContext).getParameter(
        debugInfo.UNMASKED_RENDERER_WEBGL,
      );

      // Check for mobile or low-end GPUs
      if (/Mali|Adreno [3-5]|PowerVR|Intel HD|Intel UHD/i.test(renderer)) {
        return 'low';
      }

      // Check for high-end GPUs
      if (/NVIDIA RTX|AMD Radeon RX [67]|Apple M[1-3]/i.test(renderer)) {
        return 'high';
      }

      return 'medium';
    };

    const gpuTier = detectGPU() as 'low' | 'medium' | 'high';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- GPU detection only runs once on mount
    setMetrics((prev) => ({ ...prev, gpuTier }));
  }, []);

  // FPS monitoring loop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animationFrameId: number;

    const measureFps = (currentTime: number) => {
      frameCountRef.current++;

      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= checkInterval) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);

        // Update history
        fpsHistoryRef.current.push(fps);
        if (fpsHistoryRef.current.length > sampleSize) {
          fpsHistoryRef.current.shift();
        }

        // Calculate average
        const avgFps = Math.round(
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) /
            fpsHistoryRef.current.length,
        );

        // Check performance
        const isLowPerformance = avgFps < lowFpsThreshold;
        const shouldReduceQuality = avgFps < targetFps * 0.7;

        // Get memory usage if available
        let memoryUsage: number | undefined;
        if ('memory' in performance) {
          const memory = (
            performance as unknown as {
              memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
            }
          ).memory;
          memoryUsage = Math.round(
            (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          );
        }

        setMetrics({
          fps,
          avgFps,
          isLowPerformance,
          shouldReduceQuality,
          memoryUsage,
          gpuTier: metrics.gpuTier,
        });

        // Trigger callback on first low performance detection
        if (isLowPerformance && !lowPerformanceTriggeredRef.current) {
          lowPerformanceTriggeredRef.current = true;
          onLowPerformance?.();
        }

        // Reset for next interval
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFps);
    };

    animationFrameId = requestAnimationFrame(measureFps);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    checkInterval,
    lowFpsThreshold,
    targetFps,
    sampleSize,
    onLowPerformance,
    metrics.gpuTier,
  ]);

  return metrics;
};

// Hook for adaptive quality settings
export const useAdaptiveQuality = () => {
  const performance = usePerformanceMonitor();
  const [qualityLevel, setQualityLevel] = useState<'high' | 'medium' | 'low'>(
    'high',
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Quality level update based on performance metrics
    setQualityLevel(() => {
      if (performance.isLowPerformance || performance.gpuTier === 'low') {
        return 'low';
      } else if (
        performance.shouldReduceQuality ||
        performance.gpuTier === 'medium'
      ) {
        return 'medium';
      } else {
        return 'high';
      }
    });
  }, [performance]);

  // Return quality-based settings
  const settings = {
    high: {
      particleCount: 10000,
      shaderComplexity: 1.0,
      antialias: true,
      shadows: true,
      postProcessing: true,
      pixelRatio: Math.min(window?.devicePixelRatio || 1, 2),
    },
    medium: {
      particleCount: 5000,
      shaderComplexity: 0.7,
      antialias: true,
      shadows: false,
      postProcessing: true,
      pixelRatio: Math.min(window?.devicePixelRatio || 1, 1.5),
    },
    low: {
      particleCount: 1000,
      shaderComplexity: 0.3,
      antialias: false,
      shadows: false,
      postProcessing: false,
      pixelRatio: 1,
    },
  };

  return {
    qualityLevel,
    settings: settings[qualityLevel],
    performance,
  };
};

// Hook for reduced motion preference
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
};

export default usePerformanceMonitor;
