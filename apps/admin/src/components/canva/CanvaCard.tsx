'use client';

/**
 * Canva Card Component
 *
 * Design Principle: "Cards are containers for content hierarchy"
 *
 * Features:
 * - 4 variants (default, elevated, flat, outline)
 * - Composable parts (Header, Body, Footer)
 * - Hover effects
 * - Interactive option
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const canvaCardVariants = cva(
  [
    'rounded-2xl overflow-hidden',
    'transition-all duration-200 ease-out',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white border border-gray-200',
          'hover:border-gray-300 hover:shadow-md',
        ],
        elevated: [
          'bg-white border-0 shadow-lg',
          'hover:shadow-xl',
        ],
        flat: [
          'bg-gray-50 border-0',
          'hover:bg-gray-100',
        ],
        outline: [
          'bg-transparent border border-gray-200',
          'hover:border-gray-300',
        ],
      },
      interactive: {
        true: 'cursor-pointer',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        interactive: true,
        className: 'hover:border-violet-300 hover:shadow-lg',
      },
    ],
    defaultVariants: {
      variant: 'default',
      padding: 'none',
    },
  }
);

export interface CanvaCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof canvaCardVariants> {}

export const CanvaCard = React.forwardRef<HTMLDivElement, CanvaCardProps>(
  ({ className, variant, interactive, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(canvaCardVariants({ variant, interactive, padding }), className)}
      {...props}
    />
  )
);
CanvaCard.displayName = 'CanvaCard';

// Card Header
export const CanvaCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-6 py-5 border-b border-gray-100',
      className
    )}
    {...props}
  />
));
CanvaCardHeader.displayName = 'CanvaCardHeader';

// Card Title
export const CanvaCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold text-gray-900 leading-tight',
      className
    )}
    {...props}
  />
));
CanvaCardTitle.displayName = 'CanvaCardTitle';

// Card Subtitle
export const CanvaCardSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 mt-1', className)}
    {...props}
  />
));
CanvaCardSubtitle.displayName = 'CanvaCardSubtitle';

// Card Body
export const CanvaCardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
));
CanvaCardBody.displayName = 'CanvaCardBody';

// Card Footer
export const CanvaCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-6 py-4 bg-gray-50 border-t border-gray-100',
      className
    )}
    {...props}
  />
));
CanvaCardFooter.displayName = 'CanvaCardFooter';

// Stat Card - Special variant for statistics
export interface CanvaStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
}

export const CanvaStatCard = React.forwardRef<HTMLDivElement, CanvaStatCardProps>(
  ({ className, label, value, change, icon, ...props }, ref) => {
    const isPositive = change && change.value >= 0;

    return (
      <CanvaCard ref={ref} className={className} {...props}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {label}
            </span>
            {icon && (
              <span className="text-gray-400">{icon}</span>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change && (
            <div className="mt-2 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                {isPositive ? '↑' : '↓'}
                {Math.abs(change.value)}%
              </span>
              {change.label && (
                <span className="text-xs text-gray-500">{change.label}</span>
              )}
            </div>
          )}
        </div>
      </CanvaCard>
    );
  }
);
CanvaStatCard.displayName = 'CanvaStatCard';
