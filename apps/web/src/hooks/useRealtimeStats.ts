'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useRealtimeStats - Real-time platform statistics hook
 *
 * Features:
 * - Polls /api/live-stats endpoint
 * - Smooth number animations
 * - Auto-refresh every 30 seconds
 * - Supabase Realtime fallback when available
 */

export interface PlatformStats {
  escrowSecured: number;
  activeMoments: number;
  verifiedUsers: number;
  giftsToday: number;
  trustIndex: number;
  lastUpdated: string;
}

interface UseRealtimeStatsOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

const DEFAULT_STATS: PlatformStats = {
  escrowSecured: 0,
  activeMoments: 0,
  verifiedUsers: 0,
  giftsToday: 0,
  trustIndex: 0,
  lastUpdated: new Date().toISOString(),
};

export function useRealtimeStats(options: UseRealtimeStatsOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options;

  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/live-stats');

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data: PlatformStats = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchStats();

    // Set up polling interval
    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [enabled, refreshInterval, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}

/**
 * useAnimatedNumber - Smoothly animate number changes
 */
export function useAnimatedNumber(
  target: number,
  duration: number = 1000,
): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const startValue = value;
    const startTime = performance.now();
    const diff = target - startValue;

    if (diff === 0) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + diff * easeProgress;

      setValue(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

/**
 * Format currency with Turkish Lira
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatCompact(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default useRealtimeStats;
