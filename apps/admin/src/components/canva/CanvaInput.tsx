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
    'w-full font-sans text-gray-900 bg-white',
    'border rounded-lg',
    'transition-all duration-150 ease-out',
    'placeholder:text-gray-400',
    'focus:outline-none',
    'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70',
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
          'border-gray-300',
          'hover:border-gray-400',
          'focus:border-violet-500 focus:ring-[3px] focus:ring-violet-100',
        ],
        error: [
          'border-red-500',
          'focus:border-red-500 focus:ring-[3px] focus:ring-red-100',
        ],
        success: [
          'border-emerald-500',
          'focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-100',
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
              'text-sm font-medium text-gray-700',
              required && "after:content-['_*'] after:text-red-500"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {(helperText || errorText) && (
          <p
            className={cn(
              'text-xs',
              errorText ? 'text-red-500' : 'text-gray-500'
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
            'text-sm font-medium text-gray-700',
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
          'text-gray-900 bg-white border rounded-lg resize-y',
          'placeholder:text-gray-400',
          'transition-all duration-150 ease-out',
          'focus:outline-none',
          'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70',
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-[3px] focus:ring-red-100'
            : 'border-gray-300 hover:border-gray-400 focus:border-violet-500 focus:ring-[3px] focus:ring-violet-100',
          className
        )}
        {...props}
      />

      {(helperText || errorText) && (
        <p
          className={cn(
            'text-xs',
            errorText ? 'text-red-500' : 'text-gray-500'
          )}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
});

CanvaTextarea.displayName = 'CanvaTextarea';
