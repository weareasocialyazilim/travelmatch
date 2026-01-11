'use client';

/**
 * Canva Button Component
 *
 * Design Principle: "Buttons should invite action, not demand it"
 *
 * Features:
 * - 6 variants (primary, secondary, outline, ghost, success, danger)
 * - 5 sizes (xs, sm, md, lg, xl)
 * - Loading state with spinner
 * - Icon support (left/right)
 * - Full accessibility
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const canvaButtonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'font-semibold whitespace-nowrap',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-violet-500 text-white',
          'hover:bg-violet-600 hover:shadow-[0_4px_14px_rgb(139_92_246/0.4)]',
          'focus-visible:ring-violet-500',
        ],
        secondary: [
          'bg-gray-100 text-gray-700',
          'hover:bg-gray-200',
          'focus-visible:ring-gray-400',
        ],
        outline: [
          'border border-gray-300 bg-transparent text-gray-700',
          'hover:bg-gray-50 hover:border-gray-400',
          'focus-visible:ring-gray-400',
        ],
        ghost: [
          'bg-transparent text-gray-600',
          'hover:bg-gray-100 hover:text-gray-900',
          'focus-visible:ring-gray-400',
        ],
        success: [
          'bg-emerald-500 text-white',
          'hover:bg-emerald-600 hover:shadow-[0_4px_14px_rgb(16_185_129/0.4)]',
          'focus-visible:ring-emerald-500',
        ],
        danger: [
          'bg-red-500 text-white',
          'hover:bg-red-600 hover:shadow-[0_4px_14px_rgb(239_68_68/0.4)]',
          'focus-visible:ring-red-500',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded',
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-12 px-6 text-base rounded-xl',
        xl: 'h-14 px-8 text-lg rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
      iconOnly: {
        true: 'px-0',
      },
    },
    compoundVariants: [
      { size: 'xs', iconOnly: true, className: 'w-7' },
      { size: 'sm', iconOnly: true, className: 'w-8' },
      { size: 'md', iconOnly: true, className: 'w-10' },
      { size: 'lg', iconOnly: true, className: 'w-12' },
      { size: 'xl', iconOnly: true, className: 'w-14' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface CanvaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof canvaButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const CanvaButton = React.forwardRef<HTMLButtonElement, CanvaButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      iconOnly,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(
          canvaButtonVariants({ variant, size, fullWidth, iconOnly }),
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {!iconOnly && children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);

CanvaButton.displayName = 'CanvaButton';
