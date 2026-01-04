/**
 * Moment Schemas
 * Validation schemas for moment-related operations
 *
 * "Alıcı Fiyat Belirler" (Buyer Sets Price) Model:
 * - The moment creator (Buyer) sets the requested gift amount
 * - Minimum: 1 (required field)
 */

import { z } from 'zod';

/**
 * Experience categories for moments
 */
export const experienceCategorySchema = z.enum([
  'dining',
  'nightlife',
  'culture',
  'adventure',
  'wellness',
  'entertainment',
  'shopping',
  'other',
]);

export type ExperienceCategory = z.infer<typeof experienceCategorySchema>;

/**
 * Location schema
 */
export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Create moment schema
 *
 * UPDATED: "Alıcı Fiyat Belirler" - requested_amount is REQUIRED with min: 1
 */
export const createMomentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  experience_category: experienceCategorySchema,
  /**
   * REQUIRED: Requested gift amount
   * The moment creator (Alıcı) sets how much gift they expect
   */
  requested_amount: z
    .number()
    .min(1, 'Gift amount must be at least 1')
    .positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'TRY', 'GBP', 'JPY', 'CAD']),
  location: locationSchema,
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed'),
});

export type CreateMomentInput = z.infer<typeof createMomentSchema>;

/**
 * Update moment schema
 */
export const updateMomentSchema = createMomentSchema.partial();

export type UpdateMomentInput = z.infer<typeof updateMomentSchema>;
