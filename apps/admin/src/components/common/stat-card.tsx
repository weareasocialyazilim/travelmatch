'use client';

/**
 * TravelMatch Admin - Stat Card Component
 * "Cinematic Travel + Trust Jewelry" Design
 */

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-foreground',
    iconDark: 'dark:bg-stone-800 dark:text-stone-200',
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    iconDark: 'dark:bg-primary/20 dark:text-primary',
  },
  success: {
    icon: 'bg-trust/10 text-trust',
    iconDark: 'dark:bg-trust/20 dark:text-trust',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    iconDark: 'dark:bg-warning/20 dark:text-warning',
  },
  danger: {
    icon: 'bg-destructive/10 text-destructive',
    iconDark: 'dark:bg-destructive/20 dark:text-destructive',
  },
};

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'son 30 gun',
  icon,
  variant = 'default',
  trend,
  className,
}: StatCardProps) {
  // Auto-detect trend from change value if not provided
  const effectiveTrend = trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined);

  const styles = variantStyles[variant];

  return (
    <div className={cn('stat-card group', className)}>
      {/* Gradient accent line on hover */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, #F59E0B 0%, #EC4899 100%)',
        }}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="stat-card-label">{title}</p>
          <p className="stat-card-value">{value}</p>

          {change !== undefined && (
            <div className="stat-card-trend">
              {effectiveTrend === 'up' && (
                <>
                  <TrendingUp className="h-4 w-4 text-trust" />
                  <span className="text-trust">+{Math.abs(change)}%</span>
                </>
              )}
              {effectiveTrend === 'down' && (
                <>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">-{Math.abs(change)}%</span>
                </>
              )}
              {effectiveTrend === 'neutral' && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">0%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            </div>
          )}
        </div>

        <div className={cn('stat-card-icon', styles.icon, styles.iconDark)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Quick stat component for smaller displays
export function QuickStat({
  label,
  value,
  trend,
  trendValue,
}: {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold tabular-nums">{value}</span>
        {trend && trendValue && (
          <span className={cn(
            'text-xs font-medium',
            trend === 'up' ? 'text-trust' : 'text-destructive'
          )}>
            {trend === 'up' ? '+' : '-'}{trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
