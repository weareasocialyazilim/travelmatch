/**
 * Payment Schema - Local wrapper for shared schemas
 * Re-exports from @lovendo/shared package
 *
 * ARCHITECTURE NOTE:
 * - Production: Use '@lovendo/shared' package import
 * - Local Dev: This file provides local definitions for schema resolution
 */

import { z } from 'zod';

// =============================================================================
// PAYTR INTEGRATION SCHEMAS
// =============================================================================

/**
 * PayTR Transaction Status
 * Tracks the lifecycle of a PayTR pre-authorization
 */
export const PayTRStatusSchema = z.enum([
  'pending', // Initial state, PayTR session not yet created
  'pending_paytr_approval', // Waiting for PayTR iframe completion
  'authorized', // Funds held in PayTR pool
  'captured', // Funds released to seller (after proof)
  'voided', // Pre-auth cancelled, funds released back
  'refunded', // Completed transaction refunded
  'failed', // PayTR authorization failed
]);

export type PayTRStatus = z.infer<typeof PayTRStatusSchema>;

// =============================================================================
// PAYMENT METADATA SCHEMA
// =============================================================================

/**
 * Payment Metadata Schema
 * Validates metadata structure for payment transactions
 *
 * UPDATED: PayTR fields integrated for Turkish legal compliance
 */
export const PaymentMetadataSchema = z
  .object({
    moment_id: z.string().uuid().optional(),
    request_id: z.string().uuid().optional(),
    gift_recipient_id: z.string().uuid().optional(),
    platform_fee: z.number().positive().optional(),
    // PayTR integration fields (required for new transactions)
    paytr_transaction_id: z.string().optional(),
    paytr_token: z.string().optional(),
    paytr_merchant_oid: z.string().optional(),
    paytr_status: PayTRStatusSchema.optional(),
    // Common fields
    refund_id: z.string().optional(),
    notes: z.string().max(500).optional(),
  })
  .passthrough(); // Allow extra properties for backward compatibility

export type PaymentMetadata = z.infer<typeof PaymentMetadataSchema>;

/**
 * Gift Payment Metadata Schema (STRICT)
 * For gift/offer payments, paytr_transaction_id is REQUIRED
 */
export const GiftPaymentMetadataSchema = PaymentMetadataSchema.extend({
  paytr_transaction_id: z
    .string()
    .min(1, 'PayTR transaction ID is required for gifts'),
  gift_recipient_id: z.string().uuid('Invalid recipient ID'),
});

export type GiftPaymentMetadata = z.infer<typeof GiftPaymentMetadataSchema>;

// =============================================================================
// TRANSACTION TYPE SCHEMA
// =============================================================================

export const TransactionTypeSchema = z.enum([
  'payment',
  'refund',
  'withdrawal',
  'deposit',
  'escrow_hold',
  'escrow_release',
  'platform_fee',
  'gift',
]);

export type TransactionType = z.infer<typeof TransactionTypeSchema>;

// =============================================================================
// PAYMENT METHOD SCHEMAS
// =============================================================================

export const PaymentMethodTypeSchema = z.enum([
  'card',
  'bank_transfer',
  'paytr_wallet',
]);

export type PaymentMethodType = z.infer<typeof PaymentMethodTypeSchema>;

export const CardBrandSchema = z.enum([
  'visa',
  'mastercard',
  'amex',
  'troy', // Turkish card network
  'unknown',
]);

export type CardBrand = z.infer<typeof CardBrandSchema>;

export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  type: PaymentMethodTypeSchema,
  brand: CardBrandSchema.optional(),
  last4: z.string().length(4).optional(),
  exp_month: z.number().min(1).max(12).optional(),
  exp_year: z.number().min(2024).optional(),
  is_default: z.boolean().default(false),
  created_at: z.string().datetime(),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// =============================================================================
// PAYMENT INTENT SCHEMA (PayTR equivalent)
// =============================================================================

export const PaymentIntentSchema = z.object({
  id: z.string(),
  amount: z
    .number()
    .positive('Amount must be positive')
    .min(0.01, 'Minimum amount is $0.01')
    .max(999999, 'Maximum amount is $999,999'),
  currency: z.string().default('TRY'),
  status: PayTRStatusSchema,
  metadata: PaymentMetadataSchema.optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;
