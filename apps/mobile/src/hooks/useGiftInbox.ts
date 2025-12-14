/**
 * useGiftInbox Hook
 * Manages gift inbox data and filtering
 */

import { useState, useCallback, useMemo } from 'react';
import { logger } from '@/utils/logger';

export interface GiftSender {
  id: string;
  username: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  age?: number;
  rating?: number;
  tripCount?: number;
  city?: string;
}

export interface Gift {
  id: string;
  amount: number;
  currency: string;
  message?: string;
  createdAt: string;
  status?: 'pending' | 'pending_proof' | 'verifying' | 'accepted' | 'rejected';
  momentTitle?: string;
  momentEmoji?: string;
  paymentType?: string;
}

export interface GiftInboxItem {
  id: string;
  sender: GiftSender;
  gifts: Gift[];
  totalAmount: number;
  currency: string;
  latestMessage?: string;
  latestGiftAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  canStartChat?: boolean;
  // Legacy compat
  senderName?: string;
  senderAvatar?: string;
  amount?: number;
  message?: string;
  momentTitle?: string;
}

export type SortOption = 'newest' | 'highest_amount' | 'highest_rating' | 'best_match' | 'date' | 'amount' | 'status' | 'sender';
export type FilterOption = 'all' | 'pending' | 'accepted' | 'rejected' | 'expired' | 'thirty_plus' | 'verified_only' | 'ready_to_chat';
export type SortField = 'date' | 'amount' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface GiftInboxFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export function useGiftInbox() {
  const [gifts, setGifts] = useState<GiftInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<GiftInboxFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const fetchGifts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement API call
      setGifts([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gifts'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGifts();
    setRefreshing(false);
  }, [fetchGifts]);

  const updateFilters = useCallback((newFilters: Partial<GiftInboxFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const acceptGift = useCallback(async (giftId: string) => {
    // TODO: Implement accept gift API call
    logger.debug('Accept gift action', { giftId });
  }, []);

  const rejectGift = useCallback(async (giftId: string) => {
    // TODO: Implement reject gift API call
    logger.debug('Reject gift action', { giftId });
  }, []);

  const sortedItems = useMemo(() => {
    const filtered = filterBy === 'all' 
      ? gifts 
      : gifts.filter(g => g.status === filterBy);
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'sender':
          return a.sender.username.localeCompare(b.sender.username);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.latestGiftAt).getTime() - new Date(a.latestGiftAt).getTime();
      }
    });
  }, [gifts, sortBy, filterBy]);

  const topPicks = useMemo(() => {
    return [...gifts]
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 3);
  }, [gifts]);

  const newToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return gifts.filter(g => new Date(g.createdAt) >= today);
  }, [gifts]);

  const getSortLabel = useCallback((sort: SortOption): string => {
    switch (sort) {
      case 'date': return 'Date';
      case 'amount': return 'Amount';
      case 'status': return 'Status';
      case 'sender': return 'Sender';
      case 'newest': return 'Newest';
      case 'highest_amount': return 'Highest Amount';
      case 'highest_rating': return 'Highest Rating';
      case 'best_match': return 'Best Match';
      default: return 'Date';
    }
  }, []);

  const getFilterLabel = useCallback((filter: FilterOption): string => {
    switch (filter) {
      case 'all': return 'All';
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'expired': return 'Expired';
      case 'thirty_plus': return '30+';
      case 'verified_only': return 'Verified Only';
      case 'ready_to_chat': return 'Ready to Chat';
      default: return 'All';
    }
  }, []);

  return {
    gifts,
    isLoading,
    loading: isLoading, // Alias for compat
    error,
    filters,
    fetchGifts,
    updateFilters,
    acceptGift,
    rejectGift,
    refreshing,
    refresh,
    onRefresh: refresh, // Alias for compat
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    showSortModal,
    setShowSortModal,
    showFilterModal,
    setShowFilterModal,
    topPicks,
    newToday,
    sortedItems,
    getSortLabel,
    getFilterLabel,
  };
}

export default useGiftInbox;
