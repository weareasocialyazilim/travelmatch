/**
 * Type Adapters - Entry Point
 *
 * Re-exports shared types for API normalization.
 * Individual adapter modules have been removed as they were unused.
 *
 * @packageDocumentation
 */

import type {
  Role,
  KYCStatus,
  ProofType,
  ProofStatus,
  TransactionType,
  TransactionStatus,
} from '@travelmatch/shared';

// Re-export base types from shared for external use
export type {
  Role,
  KYCStatus,
  ProofType,
  ProofStatus,
  TransactionType,
  TransactionStatus,
};
