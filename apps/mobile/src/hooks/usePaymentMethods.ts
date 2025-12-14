/**
 * usePaymentMethods Hook
 * Manages payment methods state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { paymentsApi, type PaymentMethod } from '@/services/paymentsApi';
import { logger } from '@/utils/logger';

export interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
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
      const error = err instanceof Error ? err : new Error('Failed to load payment methods');
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
      const error = err instanceof Error ? err : new Error('Failed to add payment method');
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
      const error = err instanceof Error ? err : new Error('Failed to remove payment method');
      setError(error);
      logger.error('Failed to remove payment method', { error: err });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await paymentsApi.setDefaultPaymentMethod(paymentMethodId);
      setPaymentMethods((prev) =>
        prev.map((m) => ({
          ...m,
          isDefault: m.id === paymentMethodId,
        }))
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set default payment method');
      setError(error);
      logger.error('Failed to set default payment method', { error: err });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    paymentMethods,
    isLoading,
    error,
    refresh,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
}

export default usePaymentMethods;
