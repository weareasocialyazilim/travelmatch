/**
 * Supabase Database Service
 * CRUD operations for TravelMatch entities
 *
 * ⚠️ REFACTORED: This file now re-exports from modular db/ directory.
 * Import directly from '@/services/db' for new code.
 *
 * Migration completed: God Object split into:
 * - db/ProfileQueries.ts (usersService)
 * - db/MomentQueries.ts (momentsService)
 * - db/RequestQueries.ts (requestsService)
 * - db/ChatQueries.ts (messagesService, conversationsService)
 * - db/AuxiliaryQueries.ts (reviews, notifications, moderation, transactions, subscriptions)
 */

// Re-export everything from the new modular structure
export {
  // Types
  type Tables,
  type DbResult,
  type ListResult,
  type ReportRecord,
  type BlockRecord,
  type TransactionInput,
  okSingle,
  okList,

  // Services
  usersService,
  momentsService,
  requestsService,
  messagesService,
  conversationsService,
  reviewsService,
  notificationsService,
  moderationService,
  transactionsService,
  subscriptionsService,
} from './db';

// Default export for backward compatibility
export { default } from './db';
