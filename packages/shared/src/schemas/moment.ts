/**
 * Moment Schemas
 * Validation schemas for moment-related operations
 */

import { z } from 'zod';

/**
 * Create moment schema
 */
export const createMomentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  category: z.string(),
  total_amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'TRY']),
  location: z.object({
    name: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed'),
});

export type CreateMomentInput = z.infer<typeof createMomentSchema>;

/**
 * Update moment schema
 */
export const updateMomentSchema = createMomentSchema.partial();

export type UpdateMomentInput = z.infer<typeof updateMomentSchema>;
