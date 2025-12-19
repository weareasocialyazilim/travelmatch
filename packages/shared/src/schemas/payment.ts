/**
 * Payment Schemas
 * Validation schemas for payment-related operations
 */

import { z } from 'zod';

/**
 * Payment Metadata Schema
 * Validates metadata structure for payment transactions
 */
export const PaymentMetadataSchema = z
  .object({
    moment_id: z.string().uuid().optional(),
    request_id: z.string().uuid().optional(),
    gift_recipient_id: z.string().uuid().optional(),
    platform_fee: z.number().positive().optional(),
    stripe_payment_intent_id: z.string().optional(),
    stripe_charge_id: z.string().optional(),
    refund_id: z.string().optional(),
    notes: z.string().max(500).optional(),
  })
  .passthrough(); // Allow extra properties for backward compatibility

export type PaymentMetadata = z.infer<typeof PaymentMetadataSchema>;

/**
 * Transaction Type Schema
 */
export const TransactionTypeSchema = z.enum([
  'payment',
  'refund',
  'payout',
  'platform_fee',
  'gift',
]);

export type TransactionType = z.infer<typeof TransactionTypeSchema>;

/**
 * Transaction Status Schema
 */
export const TransactionStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
]);

export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

/**
 * Payment Method Schema
 */
export const PaymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'bank_account']),
  last4: z.string().length(4),
  brand: z.string().optional(),
  exp_month: z.number().min(1).max(12).optional(),
  exp_year: z.number().min(2024).optional(),
  is_default: z.boolean(),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/**
 * Create Transaction Schema
 */
export const CreateTransactionSchema = z.object({
  amount: z.number().positive(),
  type: TransactionTypeSchema,
  description: z.string().min(1).max(255),
  metadata: PaymentMetadataSchema.optional(),
  payment_method_id: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

/**
 * Wallet Schema
 */
export const WalletSchema = z.object({
  user_id: z.string().uuid(),
  balance: z.number().nonnegative(),
  pending_balance: z.number().nonnegative(),
  total_earned: z.number().nonnegative(),
  total_spent: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  updated_at: z.string().datetime(),
});

export type Wallet = z.infer<typeof WalletSchema>;

/**
 * Create payment schema
 */
export const createPaymentSchema = z.object({
  momentId: z.string().uuid('Invalid moment ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'TRY']),
  paymentMethod: z.enum(['card', 'bank_transfer', 'wallet']).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
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
