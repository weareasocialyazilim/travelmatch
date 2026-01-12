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
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-violet-100 text-violet-700',
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
        error: 'bg-red-50 text-red-700',
        info: 'bg-blue-50 text-blue-700',
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
              variant === 'default' && 'bg-gray-500',
              variant === 'primary' && 'bg-violet-500',
              variant === 'success' && 'bg-emerald-500',
              variant === 'warning' && 'bg-amber-500',
              variant === 'error' && 'bg-red-500',
              variant === 'info' && 'bg-blue-500'
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
