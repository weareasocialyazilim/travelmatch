/**
 * Payment Zod Schemas
 * Re-exports from @travelmatch/shared for backwards compatibility
 *
 * @deprecated Import directly from '@travelmatch/shared/schemas' instead
 */

export {
  PaymentMetadataSchema,
  type PaymentMetadata,
  TransactionTypeSchema,
  TransactionStatusSchema,
  PaymentMethodSchema,
  type PaymentMethod,
  CreateTransactionSchema,
  type CreateTransactionInput,
  WalletSchema,
  type Wallet,
} from '@travelmatch/shared/schemas';

// Re-export types from shared types
export type { TransactionType, TransactionStatus } from '@travelmatch/shared';
