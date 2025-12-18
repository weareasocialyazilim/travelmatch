/**
 * Common Schemas
 * Reusable validation schemas
 */

import { z } from 'zod';

// =============================================================================
// PRIMITIVE SCHEMAS
// =============================================================================

/**
 * UUID schema
 */
export const uuidSchema = z.string().uuid();

/**
 * Email schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * Password schema with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Phone schema (E.164 format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

/**
 * URL schema
 */
export const urlSchema = z.string().url('Invalid URL');

/**
 * Username schema
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

/**
 * Currency schema
 */
export const currencySchema = z.enum(['TRY', 'USD', 'EUR']);

/**
 * Amount schema (positive, 2 decimal places)
 */
export const amountSchema = z.number().positive().multipleOf(0.01);

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Cursor pagination schema
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
});

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Start date must be before end date' }
);

export type DateRangeInput = z.infer<typeof dateRangeSchema>;

/**
 * Search schema
 */
export const searchSchema = z.object({
  query: z.string().min(1),
  filters: z.record(z.string(), z.any()).optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;

/**
 * Sort schema
 */
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type SortInput = z.infer<typeof sortSchema>;

/**
 * Location coordinates schema
 */
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type CoordinatesInput = z.infer<typeof coordinatesSchema>;

/**
 * Location search schema
 */
export const locationSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusKm: z.number().positive().max(500).default(50),
});

export type LocationSearchInput = z.infer<typeof locationSearchSchema>;
