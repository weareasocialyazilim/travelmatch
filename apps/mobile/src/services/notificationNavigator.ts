/**
 * Notification Navigator - Deep Linking Handler
 *
 * Experience & Payment Platform için bildirim türlerine göre
 * akıllı navigasyon yönetimi. Her bildirim türü ilgili ekrana yönlendirilir.
 *
 * @module notificationNavigator
 * @version 2.0.0 - Master 2026
 */

import { navigate, navigationRef } from './navigationService';
import { logger } from '@/utils/logger';
import { HapticManager } from '@/services/HapticManager';

// ============================================
// TYPES
// ============================================

/** Supported notification types for navigation */
export type NotificationType =
  | 'gesture_received'
  | 'payment_received'
  | 'payment_confirmed'
  | 'payment_rejected'
  | 'high_value_offer'
  | 'proof_required'
  | 'proof_submitted'
  | 'proof_approved'
  | 'proof_rejected'
  | 'new_message'
  | 'chat_request'
  | 'moment_liked'
  | 'moment_commented'
  | 'moment_expired'
  | 'profile_viewed'
  | 'transaction_completed'
  | 'payout_processed'
  | 'refund_processed'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'report_submitted'
  | 'milestone_reached'
  | 'badge_earned'
  | 'trust_level_up'
  | 'system_update'
  | 'verification_complete'
  | 'account_warning'
  | 'promotional'
  | 'general';

export interface NotificationPayload {
  /** Notification unique ID */
  id: string;
  /** Notification type for routing */
  type: NotificationType;
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

// ============================================
// ROUTE MAPPING
// ============================================

/**
 * Notification type to screen mapping
 * Her bildirim türü için hedef ekran ve gerekli parametreler
 */
const NOTIFICATION_ROUTES: Record<
  NotificationType,
  (payload: NotificationPayload) => NavigationRoute
> = {
  // ====================
  // 💰 PAYMENT FLOW
  // ====================
  gesture_received: (payload) => {
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
        momentTitle: payload.metadata?.momentTitle || 'Destek Teklifi',
        amount: payload.metadata?.amount || 0,
        isAnonymous: payload.metadata?.isAnonymous || false,
      },
      success: true,
    };
  },

  payment_received: () => ({
    screen: 'Wallet',
    params: undefined,
    success: true,
  }),

  payment_confirmed: (payload) => {
    if (!payload.escrowId) {
      return { screen: 'Wallet', success: true };
    }
    return {
      screen: 'EscrowStatus',
      params: {
        escrowId: payload.escrowId,
        momentTitle: payload.metadata?.momentTitle || '',
        amount: payload.metadata?.amount || 0,
        receiverName: payload.metadata?.receiverName || '',
        status: 'in_escrow',
      },
      success: true,
    };
  },

  payment_rejected: () => ({
    screen: 'Inbox',
    params: { initialTab: 'active' },
    success: true,
  }),

  high_value_offer: (payload) => {
    // $100+ offers - VIP treatment
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
        momentTitle: payload.metadata?.momentTitle || 'VIP Teklif',
        amount: payload.metadata?.amount || 0,
        isAnonymous: payload.metadata?.isAnonymous || false,
      },
      success: true,
    };
  },

  // ====================
  // 📸 PROOF SYSTEM
  // ====================
  proof_required: (payload) => {
    if (!payload.escrowId || !payload.gestureId) {
      return { screen: 'Wallet', success: true };
    }
    return {
      screen: 'ProofFlow',
      params: {
        escrowId: payload.escrowId,
        gestureId: payload.gestureId,
        momentId: payload.momentId,
        momentTitle: payload.metadata?.momentTitle || '',
        senderId: payload.userId,
      },
      success: true,
    };
  },

  proof_submitted: (payload) => {
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
  },

  proof_approved: () => ({
    screen: 'Success',
    params: {
      type: 'proof_approved' as const,
      title: 'Kanıt Onaylandı',
      subtitle: 'Ödeme hesabına geçti.',
    },
    success: true,
  }),

  proof_rejected: (payload) => {
    // Kullanıcının yeniden kanıt yüklemesi gerekiyor
    if (!payload.escrowId || !payload.gestureId) {
      return { screen: 'Wallet', success: true };
    }
    return {
      screen: 'ProofFlow',
      params: {
        escrowId: payload.escrowId,
        gestureId: payload.gestureId,
        momentId: payload.momentId,
        momentTitle: payload.metadata?.momentTitle || '',
        senderId: payload.userId,
      },
      success: true,
    };
  },

  // ====================
  // 💬 MESSAGING
  // ====================
  new_message: (payload) => {
    if (!payload.conversationId || !payload.userId) {
      return { screen: 'Messages', success: true };
    }
    return {
      screen: 'Chat',
      params: {
        conversationId: payload.conversationId,
        otherUser: {
          id: payload.userId,
          full_name: payload.metadata?.senderName || 'Kullanıcı',
          avatar_url: payload.metadata?.senderAvatar || null,
        },
      },
      success: true,
    };
  },

  chat_request: () => ({
    screen: 'Inbox',
    params: { initialTab: 'requests' },
    success: true,
  }),

  // ====================
  // 🔔 MOMENT & PROFILE
  // ====================
  moment_liked: (payload) => {
    if (!payload.momentId) {
      return { screen: 'MyMoments', success: true, error: 'Missing momentId' };
    }
    return {
      screen: 'MomentDetail',
      params: {
        moment: { id: payload.momentId },
        isOwner: true,
      },
      success: true,
    };
  },

  moment_commented: (payload) => {
    if (!payload.momentId) {
      return { screen: 'MyMoments', success: true };
    }
    return {
      screen: 'MomentComments',
      params: {
        momentId: payload.momentId,
        commentCount: payload.metadata?.commentCount || 0,
      },
      success: true,
    };
  },

  moment_expired: () => ({
    screen: 'CreateMoment',
    params: undefined,
    success: true,
  }),

  profile_viewed: (payload) => {
    if (!payload.userId) {
      return { screen: 'Profile', success: true };
    }
    return {
      screen: 'ProfileDetail',
      params: { userId: payload.userId },
      success: true,
    };
  },

  // ====================
  // 💰 TRANSACTIONS
  // ====================
  transaction_completed: (payload) => {
    if (!payload.transactionId) {
      return { screen: 'Wallet', success: true };
    }
    return {
      screen: 'TransactionDetail',
      params: { transactionId: payload.transactionId },
      success: true,
    };
  },

  payout_processed: () => ({
    screen: 'Success',
    params: {
      type: 'payout' as const,
      title: 'Para Çekme Başarılı!',
      subtitle: 'Tutarınız banka hesabınıza aktarıldı.',
    },
    success: true,
  }),

  refund_processed: () => ({
    screen: 'Wallet',
    params: undefined,
    success: true,
  }),

  // ====================
  // ⚠️ DISPUTES & REPORTS
  // ====================
  dispute_opened: (payload) => ({
    screen: 'DisputeFlow',
    params: {
      type: payload.metadata?.disputeType || 'transaction',
      id: payload.transactionId || payload.gestureId || '',
    },
    success: true,
  }),

  dispute_resolved: (payload) => ({
    screen: 'TransactionDetail',
    params: { transactionId: payload.transactionId || '' },
    success: true,
  }),

  report_submitted: () => ({
    screen: 'Profile',
    params: undefined,
    success: true,
  }),

  // ====================
  // 🏆 GAMIFICATION
  // ====================
  milestone_reached: () => ({
    screen: 'TrustNotes',
    params: undefined,
    success: true,
  }),

  badge_earned: () => ({
    screen: 'Profile',
    params: undefined,
    success: true,
  }),

  trust_level_up: () => ({
    screen: 'TrustNotes',
    params: undefined,
    success: true,
  }),

  // ====================
  // 🔧 SYSTEM
  // ====================
  system_update: () => ({
    screen: 'Settings',
    params: undefined,
    success: true,
  }),

  verification_complete: () => ({
    screen: 'Profile',
    params: undefined,
    success: true,
  }),

  account_warning: () => ({
    screen: 'Settings',
    params: undefined,
    success: true,
  }),

  // ====================
  // 📱 PROMOTIONAL
  // ====================
  promotional: () => ({
    screen: 'MainTabs',
    params: undefined,
    success: true,
  }),

  general: () => ({
    screen: 'MainTabs',
    params: undefined,
    success: true,
  }),
};

// ============================================
// HAPTIC PATTERNS
// ============================================
const HAPTIC_BY_TYPE: Partial<Record<NotificationType, () => void>> = {
  payment_received: () => HapticManager.paymentComplete(),
  high_value_offer: () => HapticManager.destructiveAction(),
  proof_approved: () => HapticManager.proofVerified(),
  proof_rejected: () => HapticManager.warning(),
  new_message: () => HapticManager.messageReceived(),
  milestone_reached: () => HapticManager.success(),
  dispute_opened: () => HapticManager.warning(),
};

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Navigate to appropriate screen based on notification type
 *
 * @param payload - Notification payload with type and related IDs
 * @returns NavigationRoute with success status
 *
 * @example
 * ```typescript
 * // Payment notification tap
 * navigateFromNotification({
 *   id: 'notif-123',
 *   type: 'gesture_received',
 *   momentId: 'moment-456',
 *   userId: 'user-789',
 *   gestureId: 'gesture-101',
 * });
 * ```
 */
export function navigateFromNotification(
  payload: NotificationPayload,
): NavigationRoute {
  try {
    // Check if navigation is ready
    if (!navigationRef.isReady()) {
      logger.warn('[NotificationNavigator] Navigation not ready, queueing...');
      return {
        screen: '',
        success: false,
        error: 'Navigation not ready',
      };
    }

    // Get route handler for notification type
    const routeHandler = NOTIFICATION_ROUTES[payload.type];

    if (!routeHandler) {
      logger.warn(
        `[NotificationNavigator] Unknown notification type: ${payload.type}`,
      );
      return {
        screen: 'MainTabs',
        success: false,
        error: `Unknown notification type: ${payload.type}`,
      };
    }

    // Generate route from payload
    const route = routeHandler(payload);

    // Trigger haptic feedback if defined
    const hapticFn = HAPTIC_BY_TYPE[payload.type];
    if (hapticFn) {
      hapticFn();
    } else {
      // Default haptic
      HapticManager.notificationReceived();
    }

    // Navigate to screen
    logger.info(`[NotificationNavigator] Navigating to ${route.screen}`, {
      payload,
    });
    navigate(
      route.screen as keyof import('@/navigation/routeParams').RootStackParamList,
      route.params,
    );

    return route;
  } catch (error) {
    logger.error('[NotificationNavigator] Navigation failed:', error);
    return {
      screen: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Queue notification navigation for when app becomes ready
 * Used for handling notifications when app is launched from background
 */
let pendingNavigation: NotificationPayload | null = null;

export function queueNotificationNavigation(
  payload: NotificationPayload,
): void {
  pendingNavigation = payload;
  logger.info('[NotificationNavigator] Queued navigation for:', payload.type);
}

export function processPendingNavigation(): void {
  if (pendingNavigation) {
    logger.info('[NotificationNavigator] Processing pending navigation');
    navigateFromNotification(pendingNavigation);
    pendingNavigation = null;
  }
}

/**
 * Check if there's a pending navigation
 */
export function hasPendingNavigation(): boolean {
  return pendingNavigation !== null;
}

export default {
  navigateFromNotification,
  queueNotificationNavigation,
  processPendingNavigation,
  hasPendingNavigation,
};
