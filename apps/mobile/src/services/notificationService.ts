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
 * TERMINOLOGY PURGE:
 * - "Seyahat" → REMOVED (use "Anı" / "Moment")
 * - "Trip" → REMOVED (use "Gift" / "Hediye")
 * - "Request" → DEPRECATED (use "Gift Offer" / "Hediye Teklifi")
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { notificationsService as dbNotificationsService } from './supabaseDbService';
import { toRecord } from '../utils/jsonHelper';

// Types - Updated for Moment platform with PayTR integration
export type NotificationType =
  | 'message'
  // Gift & Offer notifications (replacing request_*)
  | 'gift_proposal_received'
  | 'gift_accepted'
  | 'gift_declined'
  | 'gift_completed'
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

// ML Title Generation Mode
export type MLTitleMode = 'personalized' | 'time_sensitive' | 'value_based';

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
  // ML-generated fields
  mlGeneratedTitle?: string;
  mlConfidenceScore?: number;

  // Related entities
  userId?: string;
  userName?: string;
  userAvatar?: string;
  momentId?: string;
  momentImage?: string;
  requestId?: string;
  // Gift-specific fields
  giftId?: string;
  giftAmount?: number;
  giftCurrency?: string;
  isSubscriberOffer?: boolean;
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
  followers: boolean;
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
        // We might need to fetch related entities if they are not in the row
        // For now, we'll leave them undefined or extract from data if available
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
          followers: prefsRecord.followers ?? true,
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
          followers: true,
          momentActivity: true,
          payments: true,
          marketing: false,
          quietHoursEnabled: false,
        },
      };
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

// Helper functions - Updated for Moment platform (removed airplane icons)
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'message':
      return 'chatbox-outline';
    // Gift & Offer icons
    case 'gift_proposal_received':
    case 'request_received': // Legacy support
      return 'gift-outline';
    case 'high_value_offer':
    case 'premium_offer_received':
      return 'diamond-outline'; // Premium icon for high-value
    case 'subscriber_offer_received':
      return 'sparkles'; // Sparkle icon for subscriber offers
    case 'gift_accepted':
    case 'request_accepted':
      return 'checkmark-circle-outline';
    case 'gift_declined':
    case 'request_declined':
      return 'close-circle-outline';
    case 'gift_completed':
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
    case 'gift_accepted':
    case 'request_accepted':
    case 'payment_received':
    case 'gift_completed':
    case 'request_completed':
    case 'kyc_approved':
    case 'payment_captured':
    case 'proof_submitted':
      return '#4CAF50'; // Green
    // Error/decline states
    case 'gift_declined':
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
    case 'gift_proposal_received':
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
    // Gift-related routes
    case 'gift_proposal_received':
    case 'high_value_offer':
    case 'subscriber_offer_received':
      return {
        name: 'GiftInboxDetail',
        params: {
          senderId: notification.userId,
          giftId: notification.giftId,
        },
      };
    // PayTR status notifications
    case 'paytr_authorized':
    case 'payment_captured':
      return {
        name: 'GiftInboxDetail',
        params: {
          giftId: notification.giftId,
          paytrStatus: notification.paytrStatus,
        },
      };
    case 'proof_submitted':
      return {
        name: 'ProofReview',
        params: {
          giftId: notification.giftId,
        },
      };
    case 'gift_accepted':
    case 'gift_completed':
    case 'request_received':
    case 'request_accepted':
      return {
        name: 'GiftInbox',
        params: { giftId: notification.giftId || notification.requestId },
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
 * ML Integration Hook: Generate personalized notification title
 * This will be replaced by actual ML service call in production
 *
 * @param type - Notification type
 * @param context - Context for title generation
 * @param mode - ML generation mode
 * @returns Generated title with confidence score
 */
export const generateMLTitle = async (
  type: NotificationType,
  context: {
    senderName: string;
    amount?: number;
    currency?: string;
    momentCategory?: string;
    senderTier?: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  },
  mode: MLTitleMode = 'personalized',
): Promise<{ title: string; confidence: number }> => {
  // Default titles by type (fallback if ML unavailable)
  const defaultTitles: Partial<Record<NotificationType, string>> = {
    subscriber_offer_received: `🎁 ${context.senderName} bir teklif gönderdi`,
    paytr_authorized: `✅ ${context.amount} ${context.currency} ödeme onaylandı`,
    proof_submitted: '📸 Kanıt yüklendi, ödemeniz yolda',
    payment_captured: `💰 ${context.amount} ${context.currency} hesabınıza aktarıldı`,
    high_value_offer: `⭐ ${context.senderName} yüksek değerli bir teklif sunuyor!`,
  };

  // Time-sensitive mode variations
  if (mode === 'time_sensitive' && context.timeOfDay) {
    const timeGreetings = {
      morning: 'Günaydın',
      afternoon: 'İyi günler',
      evening: 'İyi akşamlar',
      night: 'Gece teklifleri',
    };
    const greeting = timeGreetings[context.timeOfDay];

    if (type === 'subscriber_offer_received') {
      return {
        title: `${greeting}! ${context.senderName} bir teklif gönderdi`,
        confidence: 0.85,
      };
    }
  }

  // Value-based mode for high amounts
  if (mode === 'value_based' && context.amount) {
    if (context.amount >= 1000) {
      return {
        title: `🔥 Dikkat! ${context.amount} ${context.currency} değerinde teklif`,
        confidence: 0.9,
      };
    }
  }

  // Tier-specific personalization
  if (context.senderTier === 'platinum') {
    if (type === 'subscriber_offer_received') {
      return {
        title: `👑 Platinum Üye ${context.senderName} özel bir teklif sunuyor`,
        confidence: 0.88,
      };
    }
  }

  // Return default with medium confidence
  return {
    title: defaultTitles[type] || `${context.senderName} bir bildirim gönderdi`,
    confidence: 0.7,
  };
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

    // Generate ML title
    const { title, confidence } = await generateMLTitle(
      'subscriber_offer_received',
      {
        senderName,
        amount,
        currency,
        senderTier,
      },
      priority === 'urgent' || priority === 'high'
        ? 'value_based'
        : 'personalized',
    );

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
        mlConfidence: confidence,
      },
      priority,
      read: false,
    });

    logger.info('[Notification] Subscriber offer notification created', {
      receiverId,
      giftId,
      priority,
      mlConfidence: confidence,
    });
  } catch (error) {
    logger.error(
      '[Notification] Failed to create subscriber offer notification',
      error,
    );
  }
};
