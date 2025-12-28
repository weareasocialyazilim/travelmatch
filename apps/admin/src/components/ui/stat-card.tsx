'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  iconColor?: 'primary' | 'secondary' | 'accent' | 'trust';
  loading?: boolean;
}

const iconColorClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent',
  trust: 'bg-trust/10 text-trust',
};

const trendClasses = {
  up: 'text-trust',
  down: 'text-destructive',
  neutral: 'text-stone-500',
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4" />;
    case 'down':
      return <TrendingDown className="w-4 h-4" />;
    default:
      return <Minus className="w-4 h-4" />;
  }
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      change,
      changeLabel = 'vs last period',
      trend = 'neutral',
      icon,
      iconColor = 'primary',
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant="default"
        padding="default"
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
              {title}
            </p>
            {loading ? (
              <div className="h-9 w-24 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold tabular-nums">{value}</p>
            )}
            {change !== undefined && (
              <p
                className={cn(
                  'text-sm font-medium flex items-center gap-1',
                  trendClasses[trend]
                )}
              >
                <TrendIcon trend={trend} />
                <span>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
                <span className="text-stone-400 dark:text-stone-500 font-normal">
                  {changeLabel}
                </span>
              </p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                iconColorClasses[iconColor]
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);
StatCard.displayName = 'StatCard';

export { StatCard };
