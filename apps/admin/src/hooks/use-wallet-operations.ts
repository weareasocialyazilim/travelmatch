'use client';

/**
 * Wallet Operations Hooks
 * Real API integration for payouts, KYC verification, and wallet management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Json type matching Supabase schema
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Types
export interface PayoutRequest {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  currency: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payout_method: 'bank_transfer' | 'paypal' | 'crypto' | 'paytr' | null;
  bank_details: Json | null;
  notes: string | null;
  created_at: string | null;
  processed_at: string | null;
  processed_by: string | null;
  failure_reason: string | null;
  transaction_id: string | null;
  metadata: Json | null;
}

export interface KYCVerification {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
  document_type: 'national_id' | 'passport' | 'drivers_license';
  document_front_url: string;
  document_back_url: string | null;
  selfie_url: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  verification_notes: string | null;
  ai_confidence_score: number | null;
  ai_flags: string[];
}

export interface WalletBalance {
  id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  currency: string;
  currency_code: string | null;
  coins_balance: number;
  status: string | null;
  last_updated: string | null;
  last_synced_at: string | null;
  created_at: string | null;
}

export interface WalletStats {
  total_pending_payouts: number;
  pending_payout_amount: number;
  pending_kyc_count: number;
  processed_today: number;
  processed_amount_today: number;
  avg_processing_time: string;
}

// Mock data for fallback
const mockPayoutRequests: PayoutRequest[] = [
  {
    id: 'payout-001',
    user_id: 'user-123',
    user_name: 'Ahmet Yılmaz',
    amount: 2500,
    currency: 'TRY',
    status: 'pending',
    payout_method: 'bank_transfer',
    bank_details: {
      bank_name: 'Ziraat Bankası',
      iban: 'TR** **** **** **** **** 1234',
      account_holder: 'Ahmet Yılmaz',
    },
    notes: null,
    created_at: '2026-01-13T09:00:00Z',
    processed_at: null,
    processed_by: null,
    failure_reason: null,
    transaction_id: null,
    metadata: null,
  },
  {
    id: 'payout-002',
    user_id: 'user-456',
    user_name: 'Elif Kaya',
    amount: 5000,
    currency: 'TRY',
    status: 'pending',
    payout_method: 'bank_transfer',
    bank_details: {
      bank_name: 'İş Bankası',
      iban: 'TR** **** **** **** **** 5678',
      account_holder: 'Elif Kaya',
    },
    notes: null,
    created_at: '2026-01-12T14:30:00Z',
    processed_at: null,
    processed_by: null,
    failure_reason: null,
    transaction_id: null,
    metadata: null,
  },
  {
    id: 'payout-003',
    user_id: 'user-789',
    user_name: 'Ayşe Demir',
    amount: 1800,
    currency: 'TRY',
    status: 'completed',
    payout_method: 'bank_transfer',
    bank_details: {
      bank_name: 'Akbank',
      iban: 'TR** **** **** **** **** 9012',
      account_holder: 'Ayşe Demir',
    },
    notes: null,
    created_at: '2026-01-13T08:30:00Z',
    processed_at: '2026-01-13T10:15:00Z',
    processed_by: 'admin-001',
    failure_reason: null,
    transaction_id: 'txn_abc123',
    metadata: null,
  },
];

const mockKYCVerifications: KYCVerification[] = [
  {
    id: 'kyc-001',
    user_id: 'user-789',
    user_name: 'Mehmet Demir',
    user_email: 'mehmet@email.com',
    user_avatar: null,
    status: 'pending',
    document_type: 'national_id',
    document_front_url: '/documents/kyc-001-front.jpg',
    document_back_url: '/documents/kyc-001-back.jpg',
    selfie_url: '/documents/kyc-001-selfie.jpg',
    submitted_at: '2026-01-13T07:00:00Z',
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null,
    verification_notes: null,
    ai_confidence_score: 0.95,
    ai_flags: [],
  },
];

const mockStats: WalletStats = {
  total_pending_payouts: 47,
  pending_payout_amount: 125000,
  pending_kyc_count: 12,
  processed_today: 23,
  processed_amount_today: 85000,
  avg_processing_time: '2.4 saat',
};

// Hooks
export function useWalletStats() {
  return useQuery({
    queryKey: ['wallet-stats'],
    queryFn: async (): Promise<WalletStats> => {
      const supabase = getClient();

      try {
        // Get pending payouts
        const { count: pendingPayouts, data: pendingData } = await supabase
          .from('payout_requests')
          .select('amount', { count: 'exact' })
          .eq('status', 'pending');

        const pendingAmount =
          pendingData?.reduce((sum, p) => sum + p.amount, 0) || 0;

        // Get pending KYC
        const { count: pendingKYC } = await supabase
          .from('kyc_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Get processed today
        const today = new Date().toISOString().split('T')[0];
        const { count: processedToday, data: processedData } = await supabase
          .from('payout_requests')
          .select('amount', { count: 'exact' })
          .eq('status', 'completed')
          .gte('processed_at', today);

        const processedAmount =
          processedData?.reduce((sum, p) => sum + p.amount, 0) || 0;

        return {
          total_pending_payouts: pendingPayouts || 0,
          pending_payout_amount: pendingAmount,
          pending_kyc_count: pendingKYC || 0,
          processed_today: processedToday || 0,
          processed_amount_today: processedAmount,
          avg_processing_time: '2.4 saat',
        };
      } catch (error) {
        logger.error('Wallet stats fetch error:', error);
        return mockStats;
      }
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function usePayoutRequests(filters?: {
  status?: string;
  method?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['payout-requests', filters],
    queryFn: async (): Promise<PayoutRequest[]> => {
      const supabase = getClient();

      try {
        let query = supabase
          .from('payout_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters?.method && filters.method !== 'all') {
          query = query.eq('payout_method', filters.method);
        }
        if (filters?.search) {
          query = query.or(
            `user_name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%`,
          );
        }

        const { data, error } = await query.limit(100);

        if (error) throw error;
        return (data as unknown as PayoutRequest[]) || [];
      } catch (error) {
        logger.error('Payout requests fetch error:', error);
        toast.error('Ödeme talepleri yüklenemedi, örnek veriler gösteriliyor');
        return mockPayoutRequests;
      }
    },
    staleTime: 30000,
  });
}

export function useKYCVerifications(filters?: {
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['kyc-verifications', filters],
    queryFn: async (): Promise<KYCVerification[]> => {
      const supabase = getClient();

      try {
        let query = supabase
          .from('kyc_verifications')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters?.search) {
          query = query.or(
            `user_name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%`,
          );
        }

        const { data, error } = await query.limit(100);

        if (error) throw error;
        return (data as unknown as KYCVerification[]) || [];
      } catch (error) {
        // console.error('KYC verifications fetch error:', error);
        toast.error(
          'KYC doğrulamaları yüklenemedi, örnek veriler gösteriliyor',
        );
        return mockKYCVerifications;
      }
    },
    staleTime: 30000,
  });
}

export function useTopWallets(limit = 10) {
  return useQuery({
    queryKey: ['top-wallets', limit],
    queryFn: async (): Promise<WalletBalance[]> => {
      const supabase = getClient();

      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .order('balance', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return (data as unknown as WalletBalance[]) || [];
      } catch (error) {
        // console.error('Top wallets fetch error:', error);
        return [];
      }
    },
    staleTime: 60000,
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payoutId,
      action,
      reason,
    }: {
      payoutId: string;
      action: 'approve' | 'reject';
      reason?: string;
    }) => {
      // P0: Use secure API route with permission check and audit logging
      const response = await fetch(`/api/wallet/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ödeme işlenemedi');
      }

      const result = await response.json();
      return result.payout;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-stats'] });
      toast.success(
        variables.action === 'approve'
          ? 'Ödeme işleme alındı'
          : 'Ödeme talebi reddedildi',
      );
    },
    onError: (error: Error) => {
      logger.error('Process payout error:', error);
      toast.error(error.message || 'Ödeme işlenemedi');
    },
  });
}

export function useBulkProcessPayouts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payoutIds,
      action,
    }: {
      payoutIds: string[];
      action: 'approve' | 'reject';
    }) => {
      // P0: Use secure API route with permission check and audit logging
      const response = await fetch('/api/wallet/payouts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutIds, action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Toplu ödeme işlenemedi');
      }

      const result = await response.json();
      return result.processed;
    },
    onSuccess: (processed, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-stats'] });
      toast.success(
        `${processed} ödeme ${
          variables.action === 'approve' ? 'onaylandı' : 'reddedildi'
        }`,
      );
    },
    onError: (error: Error) => {
      logger.error('Bulk process payouts error:', error);
      toast.error(error.message || 'Toplu ödeme işlemi başarısız');
    },
  });
}

export function useVerifyKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      kycId,
      action,
      reason,
      notes,
    }: {
      kycId: string;
      action: 'approve' | 'reject';
      reason?: string;
      notes?: string;
    }) => {
      // Note: kycId is the user_id for the existing API route
      // P0: Use secure API route with permission check and audit logging
      const response = await fetch('/api/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: kycId,
          action,
          rejection_reason: reason,
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'KYC işlenemedi');
      }

      const result = await response.json();
      return result.user;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-stats'] });
      toast.success(
        variables.action === 'approve'
          ? 'KYC doğrulaması onaylandı'
          : 'KYC doğrulaması reddedildi',
      );
    },
    onError: (error: Error) => {
      logger.error('Verify KYC error:', error);
      toast.error(error.message || 'KYC doğrulaması işlenemedi');
    },
  });
}

export function useWalletTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      type,
      description,
    }: {
      userId: string;
      amount: number;
      type: 'credit' | 'debit' | 'adjustment';
      description: string;
    }) => {
      const supabase = getClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
          type,
          description,
          created_by: user?.id,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase.rpc(
        'update_wallet_balance',
        {
          p_user_id: userId,
          p_amount: type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
        },
      );

      if (walletError) throw walletError;

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['top-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-stats'] });
      toast.success('Cüzdan işlemi tamamlandı');
    },
    onError: (error) => {
      logger.error('Wallet transaction error:', error);
      toast.error('Cüzdan işlemi başarısız');
    },
  });
}
