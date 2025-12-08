/**
 * Payment Schemas
 * Validation schemas for payment-related operations
 */

import { z } from 'zod';

/**
 * Create payment schema
 */
export const createPaymentSchema = z.object({
  momentId: z.string().uuid('Invalid moment ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'TRY']),
  paymentMethod: z.enum(['card', 'bank_transfer', 'wallet']).optional(),
  metadata: z.record(z.string()).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

/**
 * Confirm payment schema
 */
export const confirmPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  paymentIntentId: z.string(),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;

/**
 * Transfer funds schema
 */
export const transferFundsSchema = z.object({
  recipientId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'TRY']),
  description: z.string().optional(),
});

export type TransferFundsInput = z.infer<typeof transferFundsSchema>;
