/**
 * Payment Schemas
 * Comprehensive validation schemas for payment-related operations
 */

import { z } from 'zod';
import { currencySchema } from './common';

// =============================================================================
// ENTITY SCHEMAS
// =============================================================================

/**
 * Payment Metadata Schema
 * Validates metadata structure for payment transactions
 */
export const paymentMetadataSchema = z.object({
  moment_id: z.string().uuid().optional(),
  request_id: z.string().uuid().optional(),
  gift_recipient_id: z.string().uuid().optional(),
  platform_fee: z.number().positive().optional(),
  stripe_payment_intent_id: z.string().optional(),
  stripe_charge_id: z.string().optional(),
  refund_id: z.string().optional(),
  notes: z.string().max(500).optional(),
}).passthrough(); // Allow extra properties for backward compatibility

export type PaymentMetadata = z.infer<typeof paymentMetadataSchema>;

/**
 * Transaction Type Schema
 */
export const transactionTypeSchema = z.enum([
  'payment',
  'refund',
  'payout',
  'platform_fee',
  'gift',
]);

export type TransactionType = z.infer<typeof transactionTypeSchema>;

/**
 * Transaction Status Schema
 */
export const transactionStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
]);

export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

/**
 * Payment Method Schema
 */
export const paymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'bank_account', 'wallet']),
  last4: z.string().length(4),
  brand: z.string().optional(),
  exp_month: z.number().min(1).max(12).optional(),
  exp_year: z.number().min(2024).optional(),
  is_default: z.boolean(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

/**
 * Wallet Schema
 */
export const walletSchema = z.object({
  user_id: z.string().uuid(),
  balance: z.number().nonnegative(),
  pending_balance: z.number().nonnegative(),
  total_earned: z.number().nonnegative(),
  total_spent: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  updated_at: z.string().datetime(),
});

export type Wallet = z.infer<typeof walletSchema>;

// =============================================================================
// REQUEST SCHEMAS
// =============================================================================

/**
 * Create payment schema
 */
export const createPaymentSchema = z.object({
  momentId: z.string().uuid('Invalid moment ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: currencySchema,
  paymentMethod: z.enum(['card', 'bank_transfer', 'wallet']).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

/**
 * Create Transaction Schema
 */
export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: transactionTypeSchema,
  description: z.string().min(1).max(255),
  metadata: paymentMetadataSchema.optional(),
  payment_method_id: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

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
  currency: currencySchema,
  description: z.string().optional(),
});

export type TransferFundsInput = z.infer<typeof transferFundsSchema>;

// =============================================================================
// LEGACY EXPORTS (for backward compatibility with mobile)
// =============================================================================

/** @deprecated Use paymentMetadataSchema */
export const PaymentMetadataSchema = paymentMetadataSchema;
/** @deprecated Use transactionTypeSchema */
export const TransactionTypeSchema = transactionTypeSchema;
/** @deprecated Use transactionStatusSchema */
export const TransactionStatusSchema = transactionStatusSchema;
/** @deprecated Use paymentMethodSchema */
export const PaymentMethodSchema = paymentMethodSchema;
/** @deprecated Use walletSchema */
export const WalletSchema = walletSchema;
/** @deprecated Use createTransactionSchema */
export const CreateTransactionSchema = createTransactionSchema;
