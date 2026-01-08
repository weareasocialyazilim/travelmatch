/**
 * Database Services - Barrel Export
 *
 * This module consolidates all database query services.
 * Each service is now in its own file for better maintainability.
 *
 * Migration from monolithic supabaseDbService.ts:
 * - ProfileQueries.ts: usersService (200 lines)
 * - MomentQueries.ts: momentsService (600 lines)
 * - RequestQueries.ts: requestsService (110 lines)
 * - ChatQueries.ts: messagesService, conversationsService (210 lines)
 * - AuxiliaryQueries.ts: reviewsService, notificationsService,
 *                        moderationService, transactionsService,
 *                        subscriptionsService (400 lines)
 */

// Types
export type {
  Tables,
  DbResult,
  ListResult,
  ReportRecord,
  BlockRecord,
  TransactionInput,
} from './types';

export { okSingle, okList } from './types';

// Profile/Users
export { usersService } from './ProfileQueries';

// Moments
export { momentsService } from './MomentQueries';

// Requests
export { requestsService } from './RequestQueries';

// Chat (Messages & Conversations)
export { messagesService, conversationsService } from './ChatQueries';

// Auxiliary (Reviews, Notifications, Moderation, Transactions, Subscriptions)
export {
  reviewsService,
  notificationsService,
  moderationService,
  transactionsService,
  subscriptionsService,
} from './AuxiliaryQueries';

// Default export for backward compatibility
import { usersService } from './ProfileQueries';
import { momentsService } from './MomentQueries';
import { requestsService } from './RequestQueries';
import { messagesService, conversationsService } from './ChatQueries';
import {
  reviewsService,
  notificationsService,
  moderationService,
  transactionsService,
  subscriptionsService,
} from './AuxiliaryQueries';

export default {
  users: usersService,
  moments: momentsService,
  requests: requestsService,
  messages: messagesService,
  conversations: conversationsService,
  reviews: reviewsService,
  notifications: notificationsService,
  transactions: transactionsService,
  moderation: moderationService,
  subscriptions: subscriptionsService,
};
