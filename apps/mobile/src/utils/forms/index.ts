/**
 * Centralized Form System
 *
 * Export all form schemas, helpers, and utilities
 * Single source of truth for form validation
 */

export * from './schemas';
export * from './helpers';

// Re-export commonly used types
export type {
  UseFormReturn,
  FieldValues,
  Path,
  FieldError,
  Control,
  UseFormProps,
} from 'react-hook-form';

export { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
export { zodResolver } from '@hookform/resolvers/zod';
export { z } from 'zod';
