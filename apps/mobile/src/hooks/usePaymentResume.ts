/**
 * Payment Resume Hook
 *
 * Handles payment session recovery when the app is backgrounded during 3D Secure
 * or other payment flows. Persists pending payment state and checks transaction
 * status when the app resumes.
 *
 * Features:
 * - Persists pending payment to AsyncStorage
 * - Monitors AppState changes (background -> active)
 * - Queries backend for transaction status on resume
 * - Auto-navigates to success/failure screens
 * - Clears pending state after resolution
 *
 * Usage:
 * function PaymentFlow() {
 *   const { savePendingPayment, clearPendingPayment } = usePaymentResume();
 *
 *   // Before navigating to PayTR WebView
 *   await savePendingPayment({
 *     merchantOid: 'order_123',
 *     amount: 99.99,
 *     currency: 'TRY',
 *     momentId: 'moment_456',
 *   });
 * }
 */

import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import { showAlert } from '@/stores/modalStore';
import {
  getItemWithLegacyFallback,
  setItemAndCleanupLegacy,
} from '@/utils/storageKeyMigration';

const PENDING_PAYMENT_KEY = '@lovendo/pending_payment';
const LEGACY_PENDING_PAYMENT_KEYS = ['@lovendo/pending_payment'];
const PAYMENT_CHECK_DELAY = 1500; // Wait for backend to process webhook

export interface PendingPayment {
  merchantOid: string;
  amount: number;
  currency: string;
  momentId?: string;
  giftId?: string;
  createdAt: string;
  iframeToken?: string;
}

export type PaymentResumeStatus =
  | 'idle'
  | 'checking'
  | 'success'
  | 'failed'
  | 'pending'
  | 'expired';

interface PaymentResumeResult {
  status: PaymentResumeStatus;
  pendingPayment: PendingPayment | null;
  savePendingPayment: (
    payment: Omit<PendingPayment, 'createdAt'>,
  ) => Promise<void>;
  clearPendingPayment: () => Promise<void>;
  checkPaymentStatus: (merchantOid: string) => Promise<PaymentResumeStatus>;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Hook to handle payment session recovery
 */
export function usePaymentResume(options?: {
  autoCheck?: boolean;
  onStatusResolved?: (status: PaymentResumeStatus) => void;
}): PaymentResumeResult {
  const { autoCheck = true, onStatusResolved } = options || {};
  const navigation = useNavigation<NavigationProp>();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isCheckingRef = useRef(false);
  const pendingPaymentRef = useRef<PendingPayment | null>(null);

  /**
   * Save a pending payment to AsyncStorage
   */
  const savePendingPayment = useCallback(
    async (payment: Omit<PendingPayment, 'createdAt'>) => {
      try {
        const pendingPayment: PendingPayment = {
          ...payment,
          createdAt: new Date().toISOString(),
        };
        await setItemAndCleanupLegacy(
          PENDING_PAYMENT_KEY,
          JSON.stringify(pendingPayment),
          LEGACY_PENDING_PAYMENT_KEYS,
        );
        pendingPaymentRef.current = pendingPayment;
        logger.info('PaymentResume', 'Saved pending payment', {
          merchantOid: payment.merchantOid,
        });
      } catch (error) {
        logger.error('PaymentResume', 'Failed to save pending payment', error);
      }
    },
    [],
  );

  /**
   * Clear pending payment from AsyncStorage
   */
  const clearPendingPayment = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(PENDING_PAYMENT_KEY),
        ...LEGACY_PENDING_PAYMENT_KEYS.map((k) => AsyncStorage.removeItem(k)),
      ]);
      pendingPaymentRef.current = null;
      logger.info('PaymentResume', 'Cleared pending payment');
    } catch (error) {
      logger.error('PaymentResume', 'Failed to clear pending payment', error);
    }
  }, []);

  /**
   * Check payment status from backend
   */
  const checkPaymentStatus = useCallback(
    async (merchantOid: string): Promise<PaymentResumeStatus> => {
      try {
        logger.info('PaymentResume', 'Checking payment status', {
          merchantOid,
        });

        // Query transactions table for this merchant order ID
        const { data: transaction, error } = await supabase
          .from('transactions')
          .select('id, status, amount, currency, metadata')
          .eq('reference_id', merchantOid)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          // Transaction not found yet - might still be processing
          if (error.code === 'PGRST116') {
            logger.info('PaymentResume', 'Transaction not found', {
              merchantOid,
            });
            return 'pending';
          }
          throw error;
        }

        const status = transaction?.status;

        if (status === 'completed' || status === 'success') {
          return 'success';
        } else if (
          status === 'failed' ||
          status === 'cancelled' ||
          status === 'refunded'
        ) {
          return 'failed';
        } else if (status === 'pending' || status === 'processing') {
          return 'pending';
        }

        return 'pending';
      } catch (error) {
        logger.error('PaymentResume', 'Error checking payment status', error);
        return 'pending';
      }
    },
    [],
  );

  /**
   * Handle app resume from background
   */
  const handleAppResume = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      // Get pending payment from storage
      const storedPayment = await getItemWithLegacyFallback(
        PENDING_PAYMENT_KEY,
        LEGACY_PENDING_PAYMENT_KEYS,
      );
      if (!storedPayment) {
        isCheckingRef.current = false;
        return;
      }

      const pendingPayment: PendingPayment = JSON.parse(storedPayment);
      pendingPaymentRef.current = pendingPayment;

      // Check if payment is too old (expired after 30 minutes)
      const createdAt = new Date(pendingPayment.createdAt).getTime();
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;

      if (now - createdAt > thirtyMinutes) {
        logger.info('PaymentResume', 'Pending payment expired', {
          merchantOid: pendingPayment.merchantOid,
        });
        await clearPendingPayment();
        onStatusResolved?.('expired');
        isCheckingRef.current = false;
        return;
      }

      // Show checking dialog
      showAlert({
        title: 'Ödeme Kontrol Ediliyor',
        message: 'Önceki ödeme işleminizin durumu kontrol ediliyor...',
        buttons: [],
      });

      // Wait a bit for webhook to process
      await new Promise((resolve) => setTimeout(resolve, PAYMENT_CHECK_DELAY));

      // Check status from backend
      const status = await checkPaymentStatus(pendingPayment.merchantOid);

      logger.info('PaymentResume', 'Payment status resolved', {
        merchantOid: pendingPayment.merchantOid,
        status,
      });

      // Handle based on status
      if (status === 'success') {
        await clearPendingPayment();
        onStatusResolved?.('success');

        navigation.navigate('Success', {
          type: 'gift_sent',
          title: 'Ödeme Başarılı!',
          subtitle: 'Hediyeniz başarıyla gönderildi.',
          details: {
            amount: pendingPayment.amount,
            referenceId: pendingPayment.merchantOid,
          },
        });
      } else if (status === 'failed') {
        await clearPendingPayment();
        onStatusResolved?.('failed');

        navigation.navigate('PaymentFailed', {
          transactionId: pendingPayment.merchantOid,
          error: 'Ödeme işlemi başarısız oldu',
        });
      } else {
        // Still pending - show user the option to wait or cancel
        onStatusResolved?.('pending');

        showAlert({
          title: 'Ödeme Beklemede',
          message:
            'Ödemeniz hala işleniyor. İşlem tamamlandığında bilgilendirileceksiniz.',
          buttons: [
            {
              text: 'Bekle',
              style: 'cancel',
            },
            {
              text: 'İptal Et',
              style: 'destructive',
              onPress: async () => {
                await clearPendingPayment();
                navigation.navigate('PaymentFailed', {
                  transactionId: pendingPayment.merchantOid,
                  error: 'Ödeme iptal edildi',
                });
              },
            },
          ],
        });
      }
    } catch (error) {
      logger.error('PaymentResume', 'Error handling app resume', error);
      onStatusResolved?.('failed');
    } finally {
      isCheckingRef.current = false;
    }
  }, [checkPaymentStatus, clearPendingPayment, navigation, onStatusResolved]);

  /**
   * Monitor AppState changes
   */
  useEffect(() => {
    if (!autoCheck) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Check if app came back from background
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        logger.info('PaymentResume', 'App resumed from background');
        handleAppResume();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Also check on mount in case app was killed and restarted
    handleAppResume();

    return () => {
      subscription.remove();
    };
  }, [autoCheck, handleAppResume]);

  return {
    status: 'idle',
    pendingPayment: pendingPaymentRef.current,
    savePendingPayment,
    clearPendingPayment,
    checkPaymentStatus,
  };
}

/**
 * Utility to check if there's a pending payment
 * Can be called without the hook
 */
export async function hasPendingPayment(): Promise<boolean> {
  try {
    const stored = await getItemWithLegacyFallback(
      PENDING_PAYMENT_KEY,
      LEGACY_PENDING_PAYMENT_KEYS,
    );
    return stored !== null;
  } catch {
    return false;
  }
}

/**
 * Utility to get pending payment details
 * Can be called without the hook
 */
export async function getPendingPayment(): Promise<PendingPayment | null> {
  try {
    const stored = await getItemWithLegacyFallback(
      PENDING_PAYMENT_KEY,
      LEGACY_PENDING_PAYMENT_KEYS,
    );
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default usePaymentResume;
