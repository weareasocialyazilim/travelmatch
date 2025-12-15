/**
 * TravelMatch Types - Central Export Hub
 * 
 * TYPE HIERARCHY:
 * 1. db.ts - Database types (SINGLE SOURCE OF TRUTH)
 * 2. domain.ts - Business domain types
 * 3. core.ts - Core application types
 * 4. api.ts - API response wrappers
 * 
 * PREFER using types from db.ts for any database-related work.
 * The types in domain.ts and core.ts are maintained for backward
 * compatibility but should eventually be consolidated.
 */

// Database types - SINGLE SOURCE OF TRUTH
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

// Domain and core types (legacy exports for backward compatibility)
export * from './domain';
export * from './core';
