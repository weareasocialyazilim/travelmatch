/**
 * Services Index
 * Export all service modules for easy imports
 */

export { messageService } from './messageService';
export type {
  Conversation,
  Message,
  SendMessageRequest,
} from './messageService';

export { uploadService } from './uploadService';
export type {
  UploadProgress,
  UploadResult,
  UploadConfig,
} from './uploadService';

export { moderationService, REPORT_REASONS } from './moderationService';
export type {
  Report,
  BlockedUser,
  ReportRequest,
  ReportReason,
  ReportTarget,
} from './moderationService';

export {
  requestService,
  getStatusColor,
  getStatusLabel,
  canCancel,
  canRespond,
  canComplete,
} from './requestService';
export type {
  GiftRequest,
  CreateRequestData,
  RequestResponse,
  RequestFilters,
  RequestStatus,
  RequestType,
} from './requestService';

export {
  notificationService,
  getNotificationIcon,
  getNotificationColor,
  getNotificationRoute,
} from './notificationService';
export type {
  Notification,
  NotificationPreferences,
  NotificationFilters,
  NotificationType,
} from './notificationService';

export {
  paymentService,
  formatCurrency,
  getTransactionTypeLabel,
  getTransactionIcon,
  isPositiveTransaction,
} from './paymentService';
export type {
  PaymentCard,
  BankAccount,
  Transaction,
  WalletBalance,
  PaymentIntent,
  PaymentStatus,
  PaymentMethod,
  TransactionType,
} from './paymentService';

export {
  reviewService,
  getRatingLabel,
  getRatingColor,
  formatRating,
  calculatePercentage,
} from './reviewService';
export type {
  Review,
  ReviewStats,
  CreateReviewData,
  ReviewFilters,
} from './reviewService';

export {
  userService,
  getInitials,
  formatMemberSince,
  getVerificationBadge,
} from './userService';
export type {
  UserProfile,
  UserPreferences,
  UpdateProfileData,
  FollowUser,
} from './userService';

export { analyticsService, EVENTS } from './analyticsService';
export type {
  AnalyticsEvent,
  UserProperties,
  ScreenViewEvent,
  EventCategory,
} from './analyticsService';

export { cacheService, cache, CACHE_KEYS } from './cacheService';
export { offlineSyncQueue } from './offlineSyncQueue';
export type { OfflineAction, OfflineActionType } from './offlineSyncQueue';
