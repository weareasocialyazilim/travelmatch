/**
 * Payment Schemas
 * Comprehensive validation schemas for payment-related operations
 *
 * LEGAL COMPLIANCE (PayTR Integration):
 * - paytr_transaction_id is required for all gift payments
 * - paytr_token required for pre-authorization flow
 * - All funds held in PayTR pool until proof + capture
 */

import { z } from 'zod';
import { currencySchema } from './common';

// =============================================================================
// PAYTR INTEGRATION SCHEMAS
// =============================================================================

/**
 * PayTR Transaction Status
 * Tracks the lifecycle of a PayTR pre-authorization
 */
export const paytrStatusSchema = z.enum([
  'pending', // Initial state, PayTR session not yet created
  'pending_paytr_approval', // Waiting for PayTR iframe completion
  'authorized', // Funds held in PayTR pool
  'captured', // Funds released to seller (after proof)
  'voided', // Pre-auth cancelled, funds released back
  'refunded', // Completed transaction refunded
  'failed', // PayTR authorization failed
]);

export type PayTRStatus = z.infer<typeof paytrStatusSchema>;

/**
 * PayTR Metadata Schema
 * Required fields for PayTR Marketplace API integration
 */
export const paytrMetadataSchema = z.object({
  paytr_transaction_id: z.string().min(1, 'PayTR transaction ID is required'),
  paytr_token: z.string().optional(), // Pre-auth token
  paytr_merchant_oid: z.string().optional(), // Our order ID sent to PayTR
  paytr_status: paytrStatusSchema.optional(),
  paytr_authorized_at: z.string().datetime().optional(),
  paytr_captured_at: z.string().datetime().optional(),
  paytr_voided_at: z.string().datetime().optional(),
});

export type PayTRMetadata = z.infer<typeof paytrMetadataSchema>;

// =============================================================================
// ENTITY SCHEMAS
// =============================================================================

/**
 * Payment Metadata Schema
 * Validates metadata structure for payment transactions
 *
 * UPDATED: PayTR fields integrated for Turkish legal compliance
 */
export const paymentMetadataSchema = z
  .object({
    moment_id: z.string().uuid().optional(),
    request_id: z.string().uuid().optional(),
    gift_recipient_id: z.string().uuid().optional(),
    platform_fee: z.number().positive().optional(),
    // Legacy Stripe fields (keep for migration)
    stripe_payment_intent_id: z.string().optional(),
    stripe_charge_id: z.string().optional(),
    // PayTR integration fields (required for new transactions)
    paytr_transaction_id: z.string().optional(), // Required in gift context
    paytr_token: z.string().optional(),
    paytr_merchant_oid: z.string().optional(),
    paytr_status: paytrStatusSchema.optional(),
    // Common fields
    refund_id: z.string().optional(),
    notes: z.string().max(500).optional(),
  })
  .passthrough(); // Allow extra properties for backward compatibility

export type PaymentMetadata = z.infer<typeof paymentMetadataSchema>;

/**
 * Gift Payment Metadata Schema (STRICT)
 * For gift/offer payments, paytr_transaction_id is REQUIRED
 */
export const giftPaymentMetadataSchema = paymentMetadataSchema.extend({
  paytr_transaction_id: z
    .string()
    .min(1, 'PayTR transaction ID is required for gifts'),
  gift_recipient_id: z.string().uuid('Invalid recipient ID'),
});

export type GiftPaymentMetadata = z.infer<typeof giftPaymentMetadataSchema>;

/**
 * Transaction Type Schema
 * Note: TransactionType type is defined in types/enums.ts as the single source of truth
 */
export const transactionTypeSchema = z.enum([
  'payment',
  'refund',
  'payout',
  'platform_fee',
  'gift',
]);

/**
 * Transaction Status Schema
 * Note: TransactionStatus type is defined in types/enums.ts as the single source of truth
 */
export const transactionStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
]);

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

/**
 * PayTR Gift Payment Schema
 * Complete validation for subscriber gift offers with PayTR integration
 */
export const createGiftPaymentSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  momentId: z.string().uuid('Invalid moment ID').optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  message: z.string().max(500).optional(),
  // PayTR fields auto-generated by edge function
  paytr_transaction_id: z.string().optional(),
  paytr_token: z.string().optional(),
  // Subscriber offer context
  is_subscriber_offer: z.boolean().default(false),
  offer_category: z.string().optional(),
});

export type CreateGiftPaymentInput = z.infer<typeof createGiftPaymentSchema>;

/**
 * PayTR Webhook Payload Schema
 * Validates incoming PayTR webhook notifications
 */
export const paytrWebhookSchema = z.object({
  merchant_oid: z.string(),
  status: z.enum(['success', 'failed']),
  total_amount: z.string(), // PayTR sends as string
  hash: z.string(), // Verification hash
  failed_reason_code: z.string().optional(),
  failed_reason_msg: z.string().optional(),
  test_mode: z.string().optional(),
  payment_type: z.string().optional(),
});

export type PayTRWebhookPayload = z.infer<typeof paytrWebhookSchema>;

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

// PayTR Schema Exports (NEW)
export const PayTRStatusSchema = paytrStatusSchema;
export const PayTRMetadataSchema = paytrMetadataSchema;
export const GiftPaymentMetadataSchema = giftPaymentMetadataSchema;
export const CreateGiftPaymentSchema = createGiftPaymentSchema;
export const PayTRWebhookSchema = paytrWebhookSchema;
