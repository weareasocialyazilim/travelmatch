'use client';

/**
 * Enterprise Stat Card
 * Inspired by: Tesla Dashboard, Stripe Analytics, Linear
 *
 * Features:
 * - Clean number presentation
 * - Trend indicators
 * - Optional sparkline
 * - Skeleton loading state
 */

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnterpriseStatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  sparkline?: number[];
  loading?: boolean;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function EnterpriseStatCard({
  label,
  value,
  change,
  icon,
  trend,
  sparkline,
  loading = false,
  className,
  valuePrefix = '',
  valueSuffix = '',
}: EnterpriseStatCardProps) {
  // Auto-detect trend from change value
  const effectiveTrend = trend || (change ? (change.value > 0 ? 'up' : change.value < 0 ? 'down' : 'neutral') : undefined);

  if (loading) {
    return (
      <div className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5',
        className
      )}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800',
        'p-5 transition-all duration-200',
        'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm',
        className
      )}
    >
      {/* Label Row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-gray-400 dark:text-gray-500">
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-2">
        {valuePrefix && (
          <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
            {valuePrefix}
          </span>
        )}
        <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
        </span>
        {valueSuffix && (
          <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
            {valueSuffix}
          </span>
        )}
      </div>

      {/* Change Indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
              effectiveTrend === 'up' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
              effectiveTrend === 'down' && 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
              effectiveTrend === 'neutral' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            {effectiveTrend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {effectiveTrend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            {effectiveTrend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            {change.value > 0 ? '+' : ''}{change.value}%
          </span>
          {change.label && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {change.label}
            </span>
          )}
        </div>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-4 h-10">
          <Sparkline data={sparkline} trend={effectiveTrend} />
        </div>
      )}
    </div>
  );
}

// Simple SVG Sparkline
function Sparkline({ data, trend }: { data: number[]; trend?: 'up' | 'down' | 'neutral' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 100;
  const height = 40;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((value - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  const strokeColor =
    trend === 'up' ? '#10b981' :
    trend === 'down' ? '#ef4444' :
    '#6b7280';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      />
    </svg>
  );
}

// Grid wrapper for stat cards
interface EnterpriseStatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function EnterpriseStatGrid({
  children,
  columns = 4,
  className
}: EnterpriseStatGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}
