/**
 * User Schemas
 * Validation schemas for user-related operations
 */

import { z } from 'zod';

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Register schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
  languages: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
