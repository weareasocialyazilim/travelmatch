/**
 * @deprecated Import from '@travelmatch/shared' instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { PaymentMetadataSchema, TransactionTypeSchema } from '@/schemas/payment.schema';
 * ```
 *
 * AFTER:
 * ```tsx
 * import { PaymentMetadataSchema, TransactionTypeSchema } from '@travelmatch/shared';
 * ```
 *
 * This file re-exports for backward compatibility.
 */

export {
  // Entity Schemas
  paymentMetadataSchema,
  transactionTypeSchema,
  transactionStatusSchema,
  paymentMethodSchema,
  walletSchema,
  // Request Schemas
  createPaymentSchema,
  createTransactionSchema,
  confirmPaymentSchema,
  transferFundsSchema,
  // Legacy PascalCase aliases
  PaymentMetadataSchema,
  TransactionTypeSchema,
  TransactionStatusSchema,
  PaymentMethodSchema,
  WalletSchema,
  CreateTransactionSchema,
  // Types
  type PaymentMetadata,
  type TransactionType,
  type TransactionStatus,
  type PaymentMethod,
  type Wallet,
  type CreatePaymentInput,
  type CreateTransactionInput,
  type ConfirmPaymentInput,
  type TransferFundsInput,
} from '@travelmatch/shared';
