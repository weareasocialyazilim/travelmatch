import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/services/paymentsApi';

/** DTO for creating a payment intent */
interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
}

/**
 * useWallet Hook
 * 
 * Wallet bilgilerini getir
 */
export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => paymentsApi.getWallet(),
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
    queryFn: () => paymentsApi.getTransactions(),
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
    queryFn: () => paymentsApi.getTransactionById(transactionId),
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
    queryFn: () => paymentsApi.getPaymentMethods(),
  });
}

/**
 * useCreatePaymentIntent Hook
 * 
 * Payment intent oluşturma
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentDto) => paymentsApi.createPaymentIntent(data.amount, data.currency),
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
    mutationFn: ({ amount, paymentMethodId }: { amount: number; paymentMethodId: string }) => paymentsApi.withdraw(amount, paymentMethodId),
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
    queryFn: () => paymentsApi.getKYCStatus(),
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
    mutationFn: (documents: Record<string, string>) => paymentsApi.submitKYC(documents),
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
    queryFn: () => paymentsApi.getSubscription(),
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
    mutationFn: ({ planId, paymentMethodId }: { planId: string; paymentMethodId: string }) => paymentsApi.createSubscription(planId, paymentMethodId),
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
    mutationFn: () => paymentsApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
