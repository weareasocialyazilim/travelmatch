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

// Payment Services (Consolidated)
export { securePaymentService } from './securePaymentService';
export { walletService } from './walletService';
export { transactionService } from './transactionService';
export {
  escrowService,
  determineEscrowMode,
  getEscrowExplanation,
} from './escrowService';
export type {
  PaymentCard,
  BankAccount,
  PaymentIntent,
  PaymentStatus,
  PaymentMethod,
  TransactionType,
  WalletBalance,
  WithdrawalLimits,
  KYCStatus,
  Subscription,
} from './securePaymentService';
export type { Transaction, TransactionFilters } from './transactionService';
export type {
  EscrowMode,
  EscrowDecision,
  EscrowTransaction,
} from './escrowService';

// Backward compatibility alias
export { securePaymentService as paymentService } from './securePaymentService';

// Base Service with error recovery
export { BaseService } from './BaseService';
export type { RetryConfig, ServiceConfig } from './BaseService';

// Re-export currency helpers from utils for backward compatibility
export { formatCurrency } from '../utils/helpers';

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

export { cacheService, cache, CACHE_KEYS } from './cacheService';
export { offlineSyncQueue } from './offlineSyncQueue';
export type { OfflineAction, OfflineActionType } from './offlineSyncQueue';

export { sessionManager } from './sessionManager';
export type {
  SessionTokens,
  SessionData,
  SessionState,
  SessionEvent,
  SessionEventListener,
} from './sessionManager';

export {
  navigationRef,
  navigate,
  resetNavigation,
  goBack,
} from './navigationService';
export { apiClient, apiV1Service } from './apiV1Service';
export type { ApiResponse } from './apiV1Service';

export { HapticManager } from './HapticManager';
export type {
  HapticIntensity,
  HapticNotification,
  HapticPattern,
} from './HapticManager';

// Discovery Service - Dating & Gifting platform discovery
export {
  discoverNearbyMoments,
  discoverMomentsFallback,
} from './discoveryService';
export type { DiscoveryMoment, DiscoveryOptions } from './discoveryService';
