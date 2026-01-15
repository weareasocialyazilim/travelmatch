'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Primary - Gradient hero button with amber glow
        default:
          'bg-gradient-hero text-white shadow-button hover:shadow-lg hover:scale-[1.02]',
        primary:
          'bg-gradient-hero text-white shadow-button hover:shadow-lg hover:scale-[1.02]',

        // Secondary - Magenta tint
        secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/20',

        // Accent - Seafoam tint
        accent: 'bg-accent/10 text-accent hover:bg-accent/20',

        // Trust - Emerald for trust actions
        trust: 'bg-trust/10 text-trust hover:bg-trust/20',

        // Destructive
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',

        // Outline - Primary amber border
        outline:
          'border-2 border-primary text-primary bg-transparent hover:bg-primary/10',

        // Outline secondary
        'outline-secondary':
          'border-2 border-secondary text-secondary bg-transparent hover:bg-secondary/10',

        // Ghost
        ghost: 'hover:bg-stone-100 dark:hover:bg-stone-800',

        // Link
        link: 'text-primary underline-offset-4 hover:underline',

        // Success (trust color)
        success: 'bg-trust text-white hover:bg-trust/90',

        // Warning (primary amber)
        warning: 'bg-primary text-white hover:bg-primary/90',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-lg',
        default: 'h-11 px-6 text-base rounded-xl',
        lg: 'h-14 px-8 text-lg rounded-xl',
        xl: 'h-16 px-10 text-xl rounded-2xl',
        icon: 'h-11 w-11 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-lg',
        'icon-lg': 'h-14 w-14 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
