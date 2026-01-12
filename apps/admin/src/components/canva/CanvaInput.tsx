'use client';

/**
 * Canva Input Component
 *
 * Design Principle: "Forms should be effortless to complete"
 *
 * Features:
 * - 3 sizes (sm, md, lg)
 * - Error and success states
 * - Label and helper text
 * - Icons (left/right)
 * - Full accessibility
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const canvaInputVariants = cva(
  [
    'w-full font-sans text-foreground bg-background',
    'border rounded-lg',
    'transition-all duration-150 ease-out',
    'placeholder:text-muted-foreground',
    'focus:outline-none',
    'disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-70',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
      state: {
        default: [
          'border-border',
          'hover:border-border/80',
          'focus:border-violet-500 focus:ring-[3px] focus:ring-violet-500/20',
          'dark:focus:ring-violet-500/30',
        ],
        error: [
          'border-red-500',
          'focus:border-red-500 focus:ring-[3px] focus:ring-red-500/20',
          'dark:focus:ring-red-500/30',
        ],
        success: [
          'border-emerald-500',
          'focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/20',
          'dark:focus:ring-emerald-500/30',
        ],
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export interface CanvaInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof canvaInputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const CanvaInput = React.forwardRef<HTMLInputElement, CanvaInputProps>(
  (
    {
      className,
      size,
      state,
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const effectiveState = errorText ? 'error' : state;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium text-foreground',
              required && "after:content-['_*'] after:text-red-500"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              canvaInputVariants({ size, state: effectiveState }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {(helperText || errorText) && (
          <p
            className={cn(
              'text-xs',
              errorText ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'
            )}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  }
);

CanvaInput.displayName = 'CanvaInput';

// Textarea variant
export interface CanvaTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const CanvaTextarea = React.forwardRef<
  HTMLTextAreaElement,
  CanvaTextareaProps
>(({ className, label, helperText, errorText, required, id, ...props }, ref) => {
  const inputId = id || React.useId();
  const hasError = !!errorText;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium text-foreground',
            required && "after:content-['_*'] after:text-red-500"
          )}
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'w-full min-h-[100px] px-3 py-2.5 text-sm',
          'text-foreground bg-background border rounded-lg resize-y',
          'placeholder:text-muted-foreground',
          'transition-all duration-150 ease-out',
          'focus:outline-none',
          'disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-70',
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-[3px] focus:ring-red-500/20 dark:focus:ring-red-500/30'
            : 'border-border hover:border-border/80 focus:border-violet-500 focus:ring-[3px] focus:ring-violet-500/20 dark:focus:ring-violet-500/30',
          className
        )}
        {...props}
      />

      {(helperText || errorText) && (
        <p
          className={cn(
            'text-xs',
            errorText ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'
          )}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
});

CanvaTextarea.displayName = 'CanvaTextarea';
