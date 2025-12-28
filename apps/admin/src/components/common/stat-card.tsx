'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: number;
  changeLabel?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: {
    card: 'bg-card',
    icon: 'bg-muted text-muted-foreground',
  },
  primary: {
    card: 'bg-card',
    icon: 'bg-primary/10 text-primary',
  },
  success: {
    card: 'bg-card',
    icon: 'bg-trust/10 text-trust',
  },
  warning: {
    card: 'bg-card',
    icon: 'bg-warning/10 text-warning',
  },
  danger: {
    card: 'bg-card',
    icon: 'bg-destructive/10 text-destructive',
  },
};

export function StatCard({
  title,
  value,
  icon,
  change,
  changeLabel = 'son 30 gün',
  variant = 'default',
  className,
}: StatCardProps) {
  const isPositiveChange = change !== undefined && change >= 0;
  const styles = variantStyles[variant];

  return (
    <div className={cn('admin-stat-card', styles.card, className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 text-sm">
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4 text-trust" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                'font-medium',
                isPositiveChange ? 'text-trust' : 'text-destructive'
              )}>
                {isPositiveChange ? '+' : ''}{change}%
              </span>
              <span className="text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            styles.icon
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
