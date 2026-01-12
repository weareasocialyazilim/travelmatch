'use client';

/**
 * Canva Badge Component
 *
 * Design Principle: "Badges should be small but mighty"
 *
 * Features:
 * - 6 variants (default, primary, success, warning, error, info)
 * - 3 sizes (sm, md, lg)
 * - Optional dot indicator
 * - Icon support
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const canvaBadgeVariants = cva(
  [
    'inline-flex items-center gap-1',
    'font-medium leading-tight rounded-full whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
        success: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        error: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        info: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CanvaBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof canvaBadgeVariants> {
  dot?: boolean;
  icon?: React.ReactNode;
}

export const CanvaBadge = React.forwardRef<HTMLSpanElement, CanvaBadgeProps>(
  ({ className, variant, size, dot, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(canvaBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'default' && 'bg-muted-foreground',
              variant === 'primary' && 'bg-violet-500 dark:bg-violet-400',
              variant === 'success' && 'bg-emerald-500 dark:bg-emerald-400',
              variant === 'warning' && 'bg-amber-500 dark:bg-amber-400',
              variant === 'error' && 'bg-red-500 dark:bg-red-400',
              variant === 'info' && 'bg-blue-500 dark:bg-blue-400'
            )}
          />
        )}
        {icon}
        {children}
      </span>
    );
  }
);

CanvaBadge.displayName = 'CanvaBadge';

// Status Badge - Preset configurations
export interface CanvaStatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
  label?: string;
  className?: string;
}

const statusConfig = {
  active: { variant: 'success' as const, label: 'Active', dot: true },
  inactive: { variant: 'default' as const, label: 'Inactive', dot: true },
  pending: { variant: 'warning' as const, label: 'Pending', dot: true },
  error: { variant: 'error' as const, label: 'Error', dot: true },
  success: { variant: 'success' as const, label: 'Success', dot: true },
};

export const CanvaStatusBadge: React.FC<CanvaStatusBadgeProps> = ({
  status,
  label,
  className,
}) => {
  const config = statusConfig[status];
  return (
    <CanvaBadge
      variant={config.variant}
      dot={config.dot}
      className={className}
    >
      {label || config.label}
    </CanvaBadge>
  );
};
