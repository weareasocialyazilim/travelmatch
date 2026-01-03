import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securePaymentService } from '@/services/securePaymentService';
import { walletService } from '@/services/walletService';
import { transactionService } from '@/services/transactionService';

/** DTO for creating a payment intent */
interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  momentId?: string;
}

/**
 * useWallet Hook
 *
 * Wallet bilgilerini getir
 */
export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const balance = await walletService.getBalance();
      return {
        balance: balance.available,
        currency: balance.currency,
        pendingBalance: balance.pending,
      };
    },
  });
}

/**
 * useTransactions Hook
 *
 * Transaction geçmişi
 */
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getTransactions({ limit: 20 }),
  });
}

/**
 * useTransaction Hook
 *
 * Tek bir transaction detayı
 */
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const transactions = await transactionService.getTransactions();
      return transactions.find(t => t.id === transactionId) || null;
    },
    enabled: !!transactionId,
  });
}

/**
 * usePaymentMethods Hook
 *
 * Kullanıcının kayıtlı ödeme yöntemleri
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { cards } = await securePaymentService.getPaymentMethods();
      return cards.map((card) => ({
        id: card.id,
        type: 'card' as const,
        last4: card.last4,
        brand: card.brand,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        isDefault: card.isDefault,
      }));
    },
  });
}

/**
 * useCreatePaymentIntent Hook
 *
 * Payment intent oluşturma
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentDto) =>
      securePaymentService.createPaymentIntent(data.momentId || '', data.amount),
  });
}

/**
 * useWithdraw Hook
 *
 * Para çekme işlemi
 */
export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, paymentMethodId }: { amount: number; paymentMethodId: string }) => {
      const result = await walletService.requestWithdrawal({ amount, bankAccountId: paymentMethodId });
      return { success: true, transactionId: result.transactionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * useKYCStatus Hook
 *
 * KYC doğrulama durumu
 */
export function useKYCStatus() {
  return useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => securePaymentService.getKYCStatus(),
  });
}

/**
 * useSubmitKYC Hook
 *
 * KYC belgelerini gönderme
 */
export function useSubmitKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documents: Record<string, string>) => securePaymentService.submitKYC(documents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
    },
  });
}

/**
 * useSubscription Hook
 *
 * Aktif abonelik bilgisi
 */
export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => securePaymentService.getSubscription(),
  });
}

/**
 * useCreateSubscription Hook
 *
 * Yeni abonelik oluşturma
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, paymentMethodId }: { planId: string; paymentMethodId: string }) =>
      securePaymentService.createSubscription(planId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

/**
 * useCancelSubscription Hook
 *
 * Abonelik iptali
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => securePaymentService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
