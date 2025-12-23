/**
 * TravelMatch Types - Central Export Hub
 *
 * TYPE HIERARCHY:
 * 1. @travelmatch/shared - Canonical types (SINGLE SOURCE OF TRUTH for domain types)
 * 2. db.ts - Database types (SINGLE SOURCE OF TRUTH for database schemas)
 * 3. adapters.ts - API response normalizers (snake_case → camelCase)
 * 4. domain.ts - Mobile-specific domain types + re-exports from shared
 * 5. core.ts - Re-exports core types from shared
 * 6. api.ts - API response wrappers
 *
 * PREFER:
 * - Types from @travelmatch/shared for domain models (User, Moment, etc.)
 * - Types from db.ts for database operations
 * - Adapters from adapters.ts for API response normalization
 */

// Database types - SINGLE SOURCE OF TRUTH for database schemas
// Use Db* prefix for database row types
export {
  // Database Row types
  DbUser,
  DbMoment,
  DbMessage,
  DbConversation,
  DbTransaction,
  DbRequest,
  DbReview,
  DbNotification,
  DbFavorite,
  DbBlock,
  DbReport,
  DbAuditLog,
  DbConversationParticipant,
  DbKycVerification,
  DbSubscriptionPlan,
  DbUserSubscription,

  // Insert types
  DbUserInsert,
  DbMomentInsert,
  DbMessageInsert,
  DbConversationInsert,
  DbTransactionInsert,
  DbRequestInsert,
  DbReviewInsert,
  DbNotificationInsert,
  DbFavoriteInsert,

  // Update types
  DbUserUpdate,
  DbMomentUpdate,
  DbMessageUpdate,
  DbConversationUpdate,
  DbTransactionUpdate,
  DbRequestUpdate,

  // Extended types (with frontend fields)
  type User as ExtendedUser,
  type Moment as ExtendedMoment,
  type Message as ExtendedMessage,
  type Conversation as ExtendedConversation,
  type Transaction as ExtendedTransaction,
  type Request as ExtendedRequest,
  type Notification as ExtendedNotification,

  // Utility types
  type TableName,
  type TableRow,
  type TableInsert,
  type TableUpdate,
  type Json,

  // Type guards
  isDbUser,
  isDbMoment,
  isDbMessage,
} from './db';

// Domain and core types (now re-exported from @travelmatch/shared)
export * from './domain';
export * from './core';

// API normalizers
export * from './adapters';
