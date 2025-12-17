/**
 * Validation Utilities for Edge Functions
 * 
 * Input validation, schema validation, and sanitization.
 */

import { z } from 'https://esm.sh/zod@3.22.4';

// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================

export const UUIDSchema = z.string().uuid();

export const EmailSchema = z.string().email().toLowerCase();

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const PhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const DateTimeSchema = z.string().datetime();

export const PositiveIntSchema = z.number().int().positive();

export const NonNegativeIntSchema = z.number().int().nonnegative();

export const AmountSchema = z.number().positive().multipleOf(0.01);

export const CurrencySchema = z.enum(['TRY', 'USD', 'EUR']);

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const CursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  direction: z.enum(['forward', 'backward']).default('forward'),
});

// =============================================================================
// LOCATION SCHEMAS
// =============================================================================

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const LocationSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusKm: z.number().positive().max(500).default(50),
});

// =============================================================================
// MOMENT SCHEMAS
// =============================================================================

export const MomentTypeSchema = z.enum([
  'coffee',
  'lunch',
  'dinner',
  'drinks',
  'activity',
  'tour',
  'cultural',
  'adventure',
  'nightlife',
  'networking',
  'other',
]);

export const CreateMomentSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  momentType: MomentTypeSchema,
  location: CoordinatesSchema,
  address: z.string().min(5).max(255),
  scheduledAt: DateTimeSchema,
  maxParticipants: z.number().int().min(1).max(20).default(2),
  price: AmountSchema.optional(),
  currency: CurrencySchema.optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const UpdateMomentSchema = CreateMomentSchema.partial();

// =============================================================================
// REQUEST SCHEMAS
// =============================================================================

export const SendRequestSchema = z.object({
  momentId: UUIDSchema,
  message: z.string().max(500).optional(),
});

export const RespondToRequestSchema = z.object({
  requestId: UUIDSchema,
  status: z.enum(['accepted', 'rejected']),
  message: z.string().max(500).optional(),
});

// =============================================================================
// USER PROFILE SCHEMAS
// =============================================================================

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  age: z.number().int().min(18).max(120).optional(),
  location: z.string().max(100).optional(),
  interests: z.array(z.string()).max(20).optional(),
  languages: z.array(z.string()).max(10).optional(),
  verificationLevel: z.enum(['none', 'email', 'phone', 'id', 'full']).optional(),
});

// =============================================================================
// PAYMENT SCHEMAS
// =============================================================================

export const CreatePaymentSchema = z.object({
  amount: AmountSchema,
  currency: CurrencySchema,
  momentId: UUIDSchema.optional(),
  description: z.string().max(255).optional(),
});

export const CreateEscrowSchema = z.object({
  momentId: UUIDSchema,
  amount: AmountSchema,
  currency: CurrencySchema,
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: z.ZodError['errors'] };

/**
 * Validate data against a schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error.errors };
}

/**
 * Validate and throw on error
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(
  errors: z.ZodError['errors']
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  for (const error of errors) {
    const path = error.path.join('.') || '_root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  }
  
  return formatted;
}

// =============================================================================
// SANITIZATION HELPERS
// =============================================================================

/**
 * Sanitize string for database storage
 */
export function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, 10000);
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape string for SQL LIKE queries
 */
export function escapeSqlLike(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

// Re-export zod for convenience
export { z };
