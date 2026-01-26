/**
 * Notification Service
 * Push notifications, in-app notifications, and preferences
 *
 * Master Updates:
 * - Replaced 'request_received' with 'gift_proposal_received'
 * - Added 'high_value_offer' type for premium subscriber offers
 * - Added 'subscriber_offer_received' for PayTR-backed offers
 * - Added priority system for ML-driven notification importance
 * - Added ML integration hooks for dynamic title generation
 * - Removed legacy airplane icons
 * - Added 'milestone_reached' for Trust Garden progression
 *
 * CHAT LOCK SYSTEM (MASTER Revizyonu):
 * - Added 'chat_unlocked' for when host approves (Like)
 * - Added 'bulk_thank_you' for Tier 1 donors
 * - Added 'premium_offer_received' for $100+ offers
 * - Added 'proof_approved_payment_released' (replaces trip_confirmed)
 *
 * PATCH-002: Merged notificationNavigator.ts into this file
 * - Added navigation route mapping for all notification types
 * - Added haptic feedback patterns
 * - Added pending navigation queue for app launch scenarios
 *
 * TERMINOLOGY PURGE:
 * - "Seyahat" → REMOVED (use "Anı" / "Moment")
 * - "Trip" → REMOVED (use "Gift" / "Hediye")
 * - "Request" → DEPRECATED (use "Gift Offer" / "Hediye Teklifi")
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { notificationsService as dbNotificationsService } from './supabaseDbService';
import { toRecord } from '../utils/jsonHelper';
import { navigate, navigationRef } from './navigationService';
import { HapticManager } from './HapticManager';
import type { RootStackParamList } from '@/navigation/routeParams';

// Types - Updated for Moment platform with PayTR integration
export type NotificationType =
  | 'message'
  // Payment & Offer notifications
  | 'gesture_received'
  | 'payment_confirmed'
  | 'payment_completed'
  | 'high_value_offer' // Pro/Platinum subscriber special offers
  | 'subscriber_offer_received' // PayTR-backed subscriber offer
  | 'paytr_authorized' // PayTR has held funds
  | 'proof_submitted' // Host uploaded proof
  | 'payment_captured' // PayTR released funds
  // NEW: Chat Lock System notifications
  | 'chat_unlocked' // Host approved (Like) - chat now available
  | 'bulk_thank_you' // Mass thank you for Tier 1 donors
  | 'premium_offer_received' // $100+ highlighted offer
  | 'proof_approved_payment_released' // Replaces trip_confirmed
  | 'chat_request_pending' // Donor waiting for host approval
  // Gamification & Trust (NEW)
  | 'milestone_reached' // Trust Garden progression milestone
  | 'achievement_unlocked' // Badge earned
  | 'trust_level_up' // Trust score increased
  // Legacy types for backward compatibility (DEPRECATED - DO NOT USE)
  | 'request_received' // @deprecated - use gift_proposal_received
  | 'request_accepted' // @deprecated - use gift_accepted
  | 'request_declined' // @deprecated - use gift_declined
  | 'request_cancelled' // @deprecated
  | 'request_completed' // @deprecated - use gift_completed
  // Social & Moment notifications
  | 'review_received'
  | 'moment_liked'
  | 'moment_saved'
  | 'moment_comment'
  // Payment notifications
  | 'payment_received'
  | 'payment_sent'
  // KYC notifications
  | 'kyc_approved'
  | 'kyc_rejected'
  // System notifications
  | 'system'
  | 'promo';

// Priority levels for ML-driven importance
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  // Priority for high-value offers
  priority?: NotificationPriority;

  // Related entities
  userId?: string;
  userName?: string;
  userAvatar?: string;
  momentId?: string;
  momentImage?: string;
  requestId?: string;
  // Payment-specific fields
  gestureId?: string;
  escrowId?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  // PayTR integration fields
  paytrTransactionId?: string;
  paytrStatus?: 'pending' | 'authorized' | 'captured' | 'voided';
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  pageSize?: number;
}

export interface NotificationPreferences {
  // Push notifications
  pushEnabled: boolean;
  messages: boolean;
  requests: boolean;
  reviews: boolean;
  momentActivity: boolean;
  payments: boolean;
  marketing: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
}

// Notification Service
export const notificationService = {
  /**
   * Get notifications
   */
  getNotifications: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, count, error } = await dbNotificationsService.list(
        user.id,
        {
          limit: params?.pageSize,
        },
      );

      if (error) throw error;

      // Get unread count separately or assume we can get it from list if we didn't filter
      // For now, let's do a quick count query
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      const notifications: Notification[] = data.map((row: any) => ({
        id: row.id,
        type: (row.type as NotificationType) || 'system',
        title: row.title,
        body: row.body || '',
        data: row.data,
        read: row.read || false,
        createdAt: row.created_at,
        // Related entities from joins
        userId: row.sender_id,
        userName: row.userName,
        userAvatar: row.userAvatar,
        momentId: row.moment_id,
        momentImage: row.momentImage,
        requestId: row.request_id,
      }));

      return { notifications, total: count, unreadCount: unreadCount || 0 };
    } catch (error) {
      logger.error('Get notifications error:', error);
      return { notifications: [], total: 0, unreadCount: 0 };
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    try {
      const { error } = await dbNotificationsService.markAsRead([
        notificationId,
      ]);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Mark notification read error:', error);
      return { success: false };
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await dbNotificationsService.markAllAsRead(user.id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Mark all notifications read error:', error);
      return { success: false };
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (
    notificationId: string,
  ): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Delete notification error:', error);
      return { success: false };
    }
  },

  /**
   * Clear all notifications
   */
  clearAll: async (): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Clear all notifications error:', error);
      return { success: false };
    }
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<{
    preferences: NotificationPreferences;
  }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const prefsRecord = toRecord(data.notification_preferences) ?? {};

      return {
        preferences: {
          pushEnabled: true,
          messages: prefsRecord.messages ?? true,
          requests: prefsRecord.requests ?? true,
          reviews: prefsRecord.reviews ?? true,
          momentActivity: prefsRecord.momentActivity ?? true,
          payments: prefsRecord.payments ?? true,
          marketing: prefsRecord.marketing ?? false,
          quietHoursEnabled: prefsRecord.quietHoursEnabled ?? false,
          quietHoursStart: prefsRecord.quietHoursStart,
          quietHoursEnd: prefsRecord.quietHoursEnd,
        },
      };
    } catch (error) {
      logger.error('Get notification preferences error:', error);
      // Return defaults
      return {
        preferences: {
          pushEnabled: true,
          messages: true,
          requests: true,
          reviews: true,
          momentActivity: true,
          payments: true,
          marketing: false,
          quietHoursEnabled: false,
        },
      };
    }
  },

  /**
   * Register device token for push notifications
   * Critical: Links FCM/APNS token to user profile for push delivery
   */
  registerDeviceToken: async (token: string): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Cannot register device token: User not authenticated');
        return { success: false };
      }

      // Save token to user profile with timestamp
      const { error } = await supabase
        .from('users')
        .update({
          push_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        logger.error('Failed to register device token:', error);
        return { success: false };
      }

      logger.info('Device token registered successfully', {
        userId: user.id,
        tokenPrefix: token.substring(0, 20),
      });
      return { success: true };
    } catch (error) {
      logger.error('Register device token error:', error);
      return { success: false };
    }
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>,
  ): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch current prefs first to merge
      const { data: currentData } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      const currentPrefs =
        toRecord(currentData?.notification_preferences) ?? {};
      const newPrefs = { ...currentPrefs, ...preferences } as Record<
        string,
        any
      >;

      const { error } = await supabase
        .from('users')
        .update({ notification_preferences: newPrefs })
        .eq('id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Update notification preferences error:', error);
      return { success: false };
    }
  },
};

export default notificationService;

// Helper functions - Updated for Payment platform
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'message':
      return 'chatbox-outline';
    // Payment & Offer icons
    case 'gesture_received':
    case 'request_received': // Legacy support
      return 'hand-left-outline';
    case 'high_value_offer':
    case 'premium_offer_received':
      return 'diamond-outline'; // Premium icon for high-value
    case 'subscriber_offer_received':
      return 'sparkles'; // Sparkle icon for subscriber offers
    case 'payment_confirmed':
    case 'request_accepted':
      return 'checkmark-circle-outline';
    case 'request_declined':
      return 'close-circle-outline';
    case 'payment_completed':
    case 'request_completed':
    case 'proof_approved_payment_released':
      return 'ribbon-outline';
    // Chat Lock System icons
    case 'chat_unlocked':
      return 'chatbubbles-outline'; // Chat now available
    case 'bulk_thank_you':
      return 'heart-outline'; // Thank you message
    case 'chat_request_pending':
      return 'hourglass-outline'; // Waiting for approval
    // Gamification & Trust icons (NEW)
    case 'milestone_reached':
      return 'flag-outline'; // Trust Garden milestone
    case 'achievement_unlocked':
      return 'trophy-outline'; // Badge earned
    case 'trust_level_up':
      return 'shield-checkmark-outline'; // Trust level up
    // Social icons
    case 'review_received':
      return 'star-outline';
    case 'moment_liked':
      return 'heart-outline';
    case 'moment_saved':
      return 'bookmark-outline';
    case 'moment_comment':
      return 'chatbubble-outline';
    // Payment icons
    case 'payment_received':
      return 'cash-outline';
    case 'payment_sent':
      return 'wallet-outline';
    // PayTR icons
    case 'paytr_authorized':
      return 'lock-closed-outline';
    case 'payment_captured':
      return 'checkmark-done-outline';
    case 'proof_submitted':
      return 'camera-outline';
    // KYC icons
    case 'kyc_approved':
      return 'shield-checkmark-outline';
    case 'kyc_rejected':
      return 'shield-outline';
    default:
      return 'notifications-outline';
  }
};

export const getNotificationColor = (
  type: NotificationType,
  priority?: NotificationPriority,
): string => {
  // Priority-based color override for urgent notifications
  if (priority === 'urgent') return '#FF3B30'; // Red for urgent
  if (priority === 'high') return '#FFB800'; // Gold for high priority

  switch (type) {
    // Success states
    case 'payment_confirmed':
    case 'request_accepted':
    case 'payment_received':
    case 'payment_completed':
    case 'request_completed':
    case 'kyc_approved':
    case 'payment_captured':
    case 'proof_submitted':
      return '#4CAF50'; // Green
    // Error/decline states
    case 'request_declined':
    case 'kyc_rejected':
      return '#F44336'; // Red
    // High-value special treatment
    case 'high_value_offer':
    case 'subscriber_offer_received':
      return '#FFB800'; // Gold
    // Gamification colors
    case 'milestone_reached':
    case 'achievement_unlocked':
      return '#7B61FF'; // Purple for achievements
    case 'trust_level_up':
      return '#00BFA5'; // Teal for trust
    // Communication
    case 'message':
      return '#2196F3'; // Blue
    // Social engagement
    case 'moment_liked':
      return '#E91E63'; // Pink
    case 'moment_saved':
      return '#7B61FF'; // Purple
    // New proposals
    case 'gesture_received':
    case 'request_received':
      return '#FFC107'; // Amber
    // PayTR states
    case 'paytr_authorized':
      return '#00BFA5'; // Teal
    default:
      return '#757575'; // Grey
  }
};

export const getNotificationRoute = (notification: Notification): any => {
  switch (notification.type) {
    case 'message':
      return {
        name: 'Chat',
        params: { conversationId: notification.data?.conversationId },
      };
    // Payment-related routes
    case 'gesture_received':
    case 'high_value_offer':
      return {
        name: 'GestureReceived',
        params: {
          senderId: notification.userId,
          gestureId: notification.gestureId,
        },
      };
    // PayTR status notifications
    case 'paytr_authorized':
    case 'payment_captured':
      return {
        name: 'EscrowStatus',
        params: {
          escrowId: notification.escrowId,
          paytrStatus: notification.paytrStatus,
        },
      };
    case 'proof_submitted':
      return {
        name: 'ProofReview',
        params: {
          gestureId: notification.gestureId,
        },
      };
    case 'payment_confirmed':
    case 'payment_completed':
    case 'request_received':
    case 'request_accepted':
      return {
        name: 'Inbox',
        params: { gestureId: notification.gestureId || notification.requestId },
      };
    // Profile routes
    case 'review_received':
      return {
        name: 'Profile',
        params: { userId: notification.userId },
      };
    // Moment routes
    case 'moment_liked':
    case 'moment_comment':
    case 'moment_saved':
      return {
        name: 'MomentDetail',
        params: { momentId: notification.momentId },
      };
    // Payment routes
    case 'payment_received':
    case 'payment_sent':
      return {
        name: 'TransactionDetail',
        params: { transactionId: notification.data?.transactionId },
      };
    default:
      return null;
  }
};

/**
 * Determine notification priority based on offer value and subscriber tier
 * Used by ML service to auto-set priority
 */
export const calculateOfferPriority = (
  amount: number,
  momentRequestedAmount: number,
  senderTier: 'free' | 'premium' | 'platinum',
): NotificationPriority => {
  const ratio = amount / momentRequestedAmount;

  // Platinum sender with 2x+ offer = urgent
  if (senderTier === 'platinum' && ratio >= 2) return 'urgent';

  // Premium/Platinum with 1.5x+ = high
  if (['premium', 'platinum'].includes(senderTier) && ratio >= 1.5)
    return 'high';

  // Any offer 1.25x+ = normal elevated
  if (ratio >= 1.25) return 'normal';

  return 'low';
};

/**
 * Create a subscriber offer notification with PayTR context
 */
export const createSubscriberOfferNotification = async (
  receiverId: string,
  senderId: string,
  senderName: string,
  giftId: string,
  amount: number,
  currency: string,
  paytrTransactionId: string,
  senderTier: 'free' | 'premium' | 'platinum' = 'free',
  momentRequestedAmount: number = 0,
): Promise<void> => {
  try {
    const priority = calculateOfferPriority(
      amount,
      momentRequestedAmount || amount,
      senderTier,
    );

    // Generate Title
    const title = `🎁 ${senderName} bir teklif gönderdi`;

    // Insert notification
    await supabase.from('notifications').insert({
      user_id: receiverId,
      type: 'subscriber_offer_received',
      title,
      body: `${senderName} ${amount} ${currency} değerinde bir teklif gönderdi. PayTR güvencesiyle.`,
      data: {
        senderId,
        senderName,
        giftId,
        amount,
        currency,
        paytrTransactionId,
        senderTier,
      },
      priority,
      read: false,
    });

    logger.info('[Notification] Subscriber offer notification created', {
      receiverId,
      giftId,
      priority,
    });
  } catch (error) {
    logger.error(
      '[Notification] Failed to create subscriber offer notification',
      error,
    );
  }
};

// ============================================
// PATCH-002: Notification Navigation (merged from notificationNavigator.ts)
// ============================================

// Extended notification types for navigation (includes all types from notificationNavigator)
export type NavigableNotificationType =
  | NotificationType
  | 'payment_received'
  | 'payment_rejected'
  | 'new_message'
  | 'chat_request'
  | 'moment_commented'
  | 'moment_expired'
  | 'profile_viewed'
  | 'transaction_completed'
  | 'payout_processed'
  | 'refund_processed'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'report_submitted'
  | 'badge_earned'
  | 'system_update'
  | 'verification_complete'
  | 'account_warning'
  | 'promotional'
  | 'general'
  // Proof system types
  | 'proof_required'
  | 'proof_approved'
  | 'proof_rejected';

export interface NotificationNavigationPayload {
  /** Notification unique ID */
  id: string;
  /** Notification type for routing */
  type: NavigableNotificationType;
  /** Related moment ID (for payment/proof notifications) */
  momentId?: string;
  /** Related user ID (for profile/chat notifications) */
  userId?: string;
  /** Related conversation ID (for chat notifications) */
  conversationId?: string;
  /** Related payment/gesture ID */
  gestureId?: string;
  /** Related escrow ID (for escrow/proof notifications) */
  escrowId?: string;
  /** Transaction ID (for payment notifications) */
  transactionId?: string;
  /** Proof ID (for proof review notifications) */
  proofId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface NavigationRoute {
  /** Screen name to navigate to */
  screen: string;
  /** Screen parameters */
  params?: Record<string, unknown>;
  /** Whether navigation succeeded */
  success: boolean;
  /** Error message if navigation failed */
  error?: string;
}

// Haptic feedback patterns by notification type
const HAPTIC_BY_TYPE: Partial<Record<NavigableNotificationType, () => void>> = {
  payment_received: () => HapticManager.paymentComplete(),
  high_value_offer: () => HapticManager.destructiveAction(),
  proof_approved: () => HapticManager.proofVerified(),
  proof_rejected: () => HapticManager.warning(),
  new_message: () => HapticManager.messageReceived(),
  milestone_reached: () => HapticManager.success(),
  dispute_opened: () => HapticManager.warning(),
};

/**
 * Navigate to appropriate screen based on notification type
 */
export function navigateFromNotification(
  payload: NotificationNavigationPayload,
): NavigationRoute {
  try {
    // Check if navigation is ready
    if (!navigationRef.isReady()) {
      logger.warn('[NotificationService] Navigation not ready, queueing...');
      return {
        screen: '',
        success: false,
        error: 'Navigation not ready',
      };
    }

    // Generate route from payload
    const route = getNotificationNavigationRoute(payload);

    // Trigger haptic feedback if defined
    const hapticFn = HAPTIC_BY_TYPE[payload.type];
    if (hapticFn) {
      hapticFn();
    } else {
      HapticManager.notificationReceived();
    }

    // Navigate to screen
    logger.info(
      `[NotificationService] Navigating to ${route.screen}`,
      payload,
    );
    navigate(route.screen as keyof RootStackParamList, route.params);

    return route;
  } catch (error) {
    logger.error('[NotificationService] Navigation failed:', error);
    return {
      screen: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get navigation route for a notification payload
 */
export function getNotificationNavigationRoute(
  payload: NotificationNavigationPayload,
): NavigationRoute {
  const { type, metadata, ...rest } = payload;

  switch (type) {
    // ==================== PAYMENT FLOW ====================
    case 'gesture_received':
    case 'high_value_offer':
    case 'subscriber_offer_received':
    case 'premium_offer_received':
      if (!payload.momentId) {
        return {
          screen: 'Inbox',
          params: { initialTab: 'requests' },
          success: true,
        };
      }
      return {
        screen: 'GestureReceived',
        params: {
          gestureId: payload.gestureId,
          senderId: payload.userId || '',
          momentTitle: (metadata as any)?.momentTitle || 'Destek Teklifi',
          amount: (metadata as any)?.amount || 0,
          isAnonymous: (metadata as any)?.isAnonymous || false,
        },
        success: true,
      };

    case 'payment_received':
    case 'payment_sent':
      return { screen: 'Wallet', params: undefined, success: true };

    case 'payment_confirmed':
    case 'paytr_authorized':
      if (!payload.escrowId) {
        return { screen: 'Wallet', success: true };
      }
      return {
        screen: 'EscrowStatus',
        params: {
          escrowId: payload.escrowId,
          momentTitle: (metadata as any)?.momentTitle || '',
          amount: (metadata as any)?.amount || 0,
          receiverName: (metadata as any)?.receiverName || '',
          status: 'in_escrow',
        },
        success: true,
      };

    case 'payment_rejected':
      return {
        screen: 'Inbox',
        params: { initialTab: 'active' },
        success: true,
      };

    case 'payment_completed':
    case 'proof_approved_payment_released':
      return {
        screen: 'Success',
        params: {
          type: 'payment_completed' as const,
          title: 'Ödeme Tamamlandı!',
          subtitle: 'Tutar hesabınıza aktarıldı.',
        },
        success: true,
      };

    // ==================== PROOF SYSTEM ====================
    case 'proof_required':
      if (!payload.escrowId || !payload.gestureId) {
        return { screen: 'Wallet', success: true };
      }
      return {
        screen: 'ProofFlow',
        params: {
          escrowId: payload.escrowId,
          gestureId: payload.gestureId,
          momentId: payload.momentId,
          momentTitle: (metadata as any)?.momentTitle || '',
          senderId: payload.userId,
        },
        success: true,
      };

    case 'proof_submitted':
      if (!payload.proofId) {
        return {
          screen: 'ProofHistory',
          params: { momentId: payload.momentId || '' },
          success: true,
        };
      }
      return {
        screen: 'ProofDetail',
        params: { proofId: payload.proofId },
        success: true,
      };

    case 'proof_approved':
      return {
        screen: 'Success',
        params: {
          type: 'proof_verified' as const,
          title: 'Kanıt Onaylandı!',
          subtitle: 'Ödeme hesabınıza aktarıldı.',
        },
        success: true,
      };

    case 'proof_rejected':
      if (!payload.escrowId || !payload.gestureId) {
        return { screen: 'Wallet', success: true };
      }
      return {
        screen: 'ProofFlow',
        params: {
          escrowId: payload.escrowId,
          gestureId: payload.gestureId,
          momentId: payload.momentId,
          momentTitle: (metadata as any)?.momentTitle || '',
          senderId: payload.userId,
        },
        success: true,
      };

    // ==================== MESSAGING ====================
    case 'message':
    case 'new_message':
      if (!payload.conversationId || !payload.userId) {
        return { screen: 'Messages', success: true };
      }
      return {
        screen: 'Chat',
        params: {
          conversationId: payload.conversationId,
          otherUser: {
            id: payload.userId,
            full_name: (metadata as any)?.senderName || 'Kullanıcı',
            avatar_url: (metadata as any)?.senderAvatar || null,
          },
        },
        success: true,
      };

    case 'chat_unlocked':
      return {
        screen: 'Chat',
        params: {
          conversationId: payload.conversationId,
          otherUser: { id: payload.userId },
        },
        success: true,
      };

    case 'chat_request':
    case 'chat_request_pending':
      return {
        screen: 'Inbox',
        params: { initialTab: 'requests' },
        success: true,
      };

    // ==================== MOMENT & PROFILE ====================
    case 'moment_liked':
      if (!payload.momentId) {
        return { screen: 'MyMoments', success: true, error: 'Missing momentId' };
      }
      return {
        screen: 'MomentDetail',
        params: { moment: { id: payload.momentId }, isOwner: true },
        success: true,
      };

    case 'moment_comment':
    case 'moment_commented':
      if (!payload.momentId) {
        return { screen: 'MyMoments', success: true };
      }
      return {
        screen: 'MomentComments',
        params: {
          momentId: payload.momentId,
          commentCount: (metadata as any)?.commentCount || 0,
        },
        success: true,
      };

    case 'moment_saved':
      return {
        screen: 'SavedMoments',
        params: undefined,
        success: true,
      };

    case 'moment_expired':
      return {
        screen: 'CreateMoment',
        params: undefined,
        success: true,
      };

    case 'profile_viewed':
      if (!payload.userId) {
        return { screen: 'Profile', success: true };
      }
      return {
        screen: 'ProfileDetail',
        params: { userId: payload.userId },
        success: true,
      };

    case 'review_received':
      return {
        screen: 'Profile',
        params: { userId: payload.userId },
        success: true,
      };

    // ==================== TRANSACTIONS ====================
    case 'transaction_completed':
      if (!payload.transactionId) {
        return { screen: 'Wallet', success: true };
      }
      return {
        screen: 'TransactionDetail',
        params: { transactionId: payload.transactionId },
        success: true,
      };

    case 'payout_processed':
      return {
        screen: 'Success',
        params: {
          type: 'payout' as const,
          title: 'Para Çekme Başarılı!',
          subtitle: 'Tutarınız banka hesabınıza aktarıldı.',
        },
        success: true,
      };

    case 'refund_processed':
      return { screen: 'Wallet', params: undefined, success: true };

    // ==================== DISPUTES & REPORTS ====================
    case 'dispute_opened':
      return {
        screen: 'DisputeFlow',
        params: {
          type: (metadata as any)?.disputeType || 'transaction',
          id: payload.transactionId || payload.gestureId || '',
        },
        success: true,
      };

    case 'dispute_resolved':
      return {
        screen: 'TransactionDetail',
        params: { transactionId: payload.transactionId || '' },
        success: true,
      };

    case 'report_submitted':
      return { screen: 'Profile', params: undefined, success: true };

    // ==================== GAMIFICATION ====================
    case 'milestone_reached':
    case 'trust_level_up':
      return { screen: 'TrustNotes', params: undefined, success: true };

    case 'achievement_unlocked':
    case 'badge_earned':
      return { screen: 'Achievements', params: undefined, success: true };

    // ==================== SYSTEM ====================
    case 'system':
    case 'system_update':
      return { screen: 'Settings', params: undefined, success: true };

    case 'verification_complete':
    case 'kyc_approved':
      return { screen: 'Profile', params: undefined, success: true };

    case 'kyc_rejected':
      return {
        screen: 'IdentityVerification',
        params: undefined,
        success: true,
      };

    case 'account_warning':
      return { screen: 'Settings', params: undefined, success: true };

    // ==================== PROMOTIONAL ====================
    case 'promotional':
    case 'promo':
      return { screen: 'MainTabs', params: undefined, success: true };

    // ==================== DEFAULT ====================
    default:
      return { screen: 'Notifications', params: undefined, success: true };
  }
}

// Pending navigation queue for app launch scenarios
let pendingNavigation: NotificationNavigationPayload | null = null;

export function queueNotificationNavigation(
  payload: NotificationNavigationPayload,
): void {
  pendingNavigation = payload;
  logger.info('[NotificationService] Queued navigation for:', payload.type);
}

export function processPendingNavigation(): void {
  if (pendingNavigation) {
    logger.info('[NotificationService] Processing pending navigation');
    navigateFromNotification(pendingNavigation);
    pendingNavigation = null;
  }
}

export function hasPendingNavigation(): boolean {
  return pendingNavigation !== null;
}
