/**
 * User Schemas
 * Validation schemas for user profile operations
 * 
 * Note: Auth schemas (login, register, password reset) are in auth.ts
 */

import { z } from 'zod';
import { phoneSchema, coordinatesSchema } from './common';

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar_url: z.string().url().optional(),
  phone: phoneSchema.optional(),
  date_of_birth: z.string().datetime().optional(),
  languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).max(10, 'Maximum 10 interests allowed').optional(),
  location: coordinatesSchema.extend({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
