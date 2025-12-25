/**
 * usePaymentMethods Hook
 * Manages payment methods state and operations
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { paymentsApi, type PaymentMethod } from '@/services/paymentsApi';
import { logger } from '@/utils/logger';
import type {
  SavedCard,
  Wallet,
  WalletSettings,
} from '@/features/payments/types/payment-methods.types';

export interface UsePaymentMethodsReturn {
  // Core API
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
  // Extended API for PaymentMethodsScreen
  savedCards: SavedCard[];
  wallets: Wallet[];
  walletSettings: WalletSettings;
  isWalletConnected: boolean;
  addCard: (cardNumber: string, expiry: string, cvv: string) => Promise<void>;
  setCardAsDefault: (cardId: string) => void;
  removeCard: (cardId: string) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: (walletName: string) => void;
  trackInteraction: (action: string, data?: Record<string, unknown>) => void;
}

export function usePaymentMethods(): UsePaymentMethodsReturn {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const methods = await paymentsApi.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Failed to load payment methods');
      setError(error);
      logger.error('Failed to load payment methods', { error: err });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (paymentMethodId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMethod = await paymentsApi.addPaymentMethod(paymentMethodId);
      setPaymentMethods((prev) => [...prev, newMethod]);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to add payment method');
      setError(error);
      logger.error('Failed to add payment method', { error: err });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await paymentsApi.removePaymentMethod(paymentMethodId);
      setPaymentMethods((prev) => prev.filter((m) => m.id !== paymentMethodId));
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Failed to remove payment method');
      setError(error);
      logger.error('Failed to remove payment method', { error: err });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await paymentsApi.setDefaultPaymentMethod(paymentMethodId);
        setPaymentMethods((prev) =>
          prev.map((m) => ({
            ...m,
            isDefault: m.id === paymentMethodId,
          })),
        );
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to set default payment method');
        setError(error);
        logger.error('Failed to set default payment method', { error: err });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Extended API: Derive savedCards from paymentMethods
  const savedCards = useMemo<SavedCard[]>(() => {
    return paymentMethods
      .filter((m) => m.type === 'card')
      .map((m) => ({
        id: m.id,
        brand: m.brand || 'unknown',
        lastFour: m.last4 || '****',
        isDefault: m.isDefault,
      }));
  }, [paymentMethods]);

  // Extended API: Derive wallets from paymentMethods
  const wallets = useMemo<Wallet[]>(() => {
    return paymentMethods
      .filter((m) => m.type === 'wallet')
      .map((m) => ({
        id: m.id,
        name:
          m.walletType === 'apple_pay'
            ? 'Apple Pay'
            : m.walletType === 'google_pay'
              ? 'Google Pay'
              : 'Wallet',
        status: 'connected',
      }));
  }, [paymentMethods]);

  // Extended API: Wallet settings (default values for now)
  const [walletSettings, _setWalletSettings] = useState<WalletSettings>({
    isDefaultPayment: false,
    requireAuth: true,
    enableNotifications: true,
  });

  // Extended API: Check if any wallet is connected
  const isWalletConnected = wallets.length > 0;

  // Extended API: Add a card by card details
  const addCard = useCallback(
    async (cardNumber: string, expiry: string, _cvv: string) => {
      // In a real implementation, this would tokenize the card details
      // For now, we generate a mock payment method ID
      const paymentMethodId = `pm_${Date.now()}`;
      logger.info('Adding card', { lastFour: cardNumber.slice(-4), expiry });
      await addPaymentMethod(paymentMethodId);
    },
    [addPaymentMethod],
  );

  // Extended API: Set card as default (sync wrapper)
  const setCardAsDefault = useCallback(
    (cardId: string) => {
      setDefaultPaymentMethod(cardId).catch((err) => {
        logger.error('Failed to set card as default', { error: err });
      });
    },
    [setDefaultPaymentMethod],
  );

  // Extended API: Remove card (sync wrapper)
  const removeCard = useCallback(
    (cardId: string) => {
      removePaymentMethod(cardId).catch((err) => {
        logger.error('Failed to remove card', { error: err });
      });
    },
    [removePaymentMethod],
  );

  // Extended API: Connect wallet
  const connectWallet = useCallback(async () => {
    // In a real implementation, this would initiate wallet connection flow
    logger.info('Connecting wallet...');
    // Mock: add a wallet payment method
    const walletMethod: PaymentMethod = {
      id: `wallet_${Date.now()}`,
      type: 'wallet',
      walletType: 'apple_pay',
      isDefault: false,
    };
    setPaymentMethods((prev) => [...prev, walletMethod]);
  }, []);

  // Extended API: Disconnect wallet
  const disconnectWallet = useCallback((walletName: string) => {
    logger.info('Disconnecting wallet', { walletName });
    setPaymentMethods((prev) =>
      prev.filter((m) => {
        if (m.type !== 'wallet') return true;
        const name =
          m.walletType === 'apple_pay'
            ? 'Apple Pay'
            : m.walletType === 'google_pay'
              ? 'Google Pay'
              : 'Wallet';
        return name !== walletName;
      }),
    );
  }, []);

  // Extended API: Track user interactions for analytics
  const trackInteraction = useCallback(
    (action: string, data?: Record<string, unknown>) => {
      logger.info('Payment interaction', { action, ...data });
    },
    [],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    // Core API
    paymentMethods,
    isLoading,
    error,
    refresh,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    // Extended API
    savedCards,
    wallets,
    walletSettings,
    isWalletConnected,
    addCard,
    setCardAsDefault,
    removeCard,
    connectWallet,
    disconnectWallet,
    trackInteraction,
  };
}

export default usePaymentMethods;
