'use client';

import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const statCardVariants = cva(
  'stat-card relative overflow-hidden',
  {
    variants: {
      variant: {
        default: '',
        success: 'stat-card-success',
        warning: 'stat-card-warning',
        critical: 'stat-card-critical',
      },
      size: {
        default: 'p-6',
        compact: 'p-4',
        large: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface StatCardV2Props extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  href?: string;
  description?: string;
  loading?: boolean;
  className?: string;
  sparkline?: number[];
}

export function StatCardV2({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  change,
  changeLabel,
  trend,
  href,
  description,
  loading = false,
  variant,
  size,
  className,
  sparkline,
}: StatCardV2Props) {
  // Determine trend from change if not explicitly provided
  const effectiveTrend = trend ?? (change !== undefined ? (change >= 0 ? 'up' : 'down') : 'neutral');

  // Variant-based icon colors
  const getVariantIconColors = () => {
    switch (variant) {
      case 'success':
        return {
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        };
      case 'warning':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-100 dark:bg-amber-900/30',
        };
      case 'critical':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/30',
        };
      default:
        return {
          color: iconColor || 'text-primary',
          bg: iconBgColor || 'bg-primary/10',
        };
    }
  };

  const variantColors = getVariantIconColors();

  const CardContent = () => (
    <>
      {/* Background decoration for variants */}
      {variant && variant !== 'default' && (
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8">
          <div className={cn(
            'h-full w-full rounded-full opacity-10',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'critical' && 'bg-red-500'
          )} />
        </div>
      )}

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          {loading ? (
            <div className="mt-1.5 h-8 w-24 animate-pulse rounded bg-muted" />
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>

              {change !== undefined && (
                <div
                  className={cn(
                    'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                    effectiveTrend === 'up' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                    effectiveTrend === 'down' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    effectiveTrend === 'neutral' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  {effectiveTrend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : effectiveTrend === 'down' ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  <span>
                    {change > 0 ? '+' : ''}
                    {change}%
                  </span>
                </div>
              )}
            </div>
          )}

          {(changeLabel || description) && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {changeLabel || description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
              variantColors.bg
            )}
          >
            <Icon className={cn('h-5 w-5', variantColors.color)} />
          </div>
        )}
      </div>

      {/* Mini sparkline visualization */}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-4 flex h-8 items-end gap-0.5">
          {sparkline.map((value, index) => {
            const max = Math.max(...sparkline);
            const height = (value / max) * 100;
            return (
              <div
                key={index}
                className={cn(
                  'flex-1 rounded-sm transition-all',
                  variant === 'success' && 'bg-emerald-400/60',
                  variant === 'warning' && 'bg-amber-400/60',
                  variant === 'critical' && 'bg-red-400/60',
                  !variant || variant === 'default' ? 'bg-primary/40' : ''
                )}
                style={{ height: `${Math.max(height, 8)}%` }}
              />
            );
          })}
        </div>
      )}

      {/* Link indicator */}
      {href && (
        <div className="mt-3 flex items-center text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          <span>Detayları görüntüle</span>
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="group block">
        <div className={cn(statCardVariants({ variant, size }), className)}>
          <CardContent />
        </div>
      </Link>
    );
  }

  return (
    <div className={cn(statCardVariants({ variant, size }), className)}>
      <CardContent />
    </div>
  );
}

// Compact stat for dashboard overview
export interface MiniStatProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'critical';
}

export function MiniStat({ label, value, change, icon: Icon, variant = 'default' }: MiniStatProps) {
  const effectiveTrend = change !== undefined ? (change >= 0 ? 'up' : 'down') : 'neutral';

  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          variant === 'success' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
          variant === 'warning' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          variant === 'critical' && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
          variant === 'default' && 'bg-primary/10 text-primary'
        )}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-lg font-semibold">{value}</p>
          {change !== undefined && (
            <span className={cn(
              'text-xs font-medium',
              effectiveTrend === 'up' && 'text-emerald-600 dark:text-emerald-400',
              effectiveTrend === 'down' && 'text-red-600 dark:text-red-400'
            )}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
