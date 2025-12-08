/**
 * Common Schemas
 * Reusable validation schemas
 */

import { z } from 'zod';

/**
 * UUID schema
 */
export const uuidSchema = z.string().uuid();

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
  filters: z.record(z.any()).optional(),
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
