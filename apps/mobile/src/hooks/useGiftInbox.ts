/**
 * useGiftInbox Hook
 * Manages gift inbox data and filtering
 *
 * Uses requestService to fetch received requests (gifts) from Supabase
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';
import { requestService } from '@/services/requestService';

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
  score?: number;
  // Legacy compat
  senderName?: string;
  senderAvatar?: string;
  amount?: number;
  message?: string;
  momentTitle?: string;
}

export type SortOption =
  | 'newest'
  | 'highest_amount'
  | 'highest_rating'
  | 'best_match'
  | 'date'
  | 'amount'
  | 'status'
  | 'sender';
export type FilterOption =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'thirty_plus'
  | 'verified_only'
  | 'ready_to_chat';
export type SortField = 'date' | 'amount' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface GiftInboxFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export function useGiftInbox() {
  const [gifts, setGifts] = useState<GiftInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<GiftInboxFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('best_match');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeoutRef = refreshTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  const fetchGifts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { requests } = await requestService.getReceivedRequests();

      // Group requests by requester (sender)
      const grouped = requests.reduce(
        (acc, req) => {
          const senderId = req.requesterId;
          if (!acc[senderId]) {
            acc[senderId] = {
              id: senderId,
              sender: {
                id: senderId,
                username:
                  req.requesterName?.replace(/\s/g, '').toLowerCase() ||
                  senderId,
                name: req.requesterName || 'Unknown',
                avatar: req.requesterAvatar || '',
                isVerified: req.requesterVerified || false,
                rating: req.requesterRating || 0,
                tripCount: 0,
                city:
                  typeof req.requesterLocation === 'string'
                    ? req.requesterLocation
                    : '',
              },
              gifts: [],
              totalAmount: 0,
              currency: req.currency || 'USD',
              latestMessage: '',
              latestGiftAt: req.createdAt || new Date().toISOString(),
              status: 'pending' as const,
              createdAt: req.createdAt || new Date().toISOString(),
              canStartChat:
                req.status === 'accepted' || req.status === 'completed',
              score: 0,
            };
          }

          // Map request status to gift status
          let giftStatus: Gift['status'] = 'pending';
          if (req.status === 'completed') giftStatus = 'accepted';
          else if (req.status === 'accepted') giftStatus = 'pending_proof';
          else if (req.status === 'declined') giftStatus = 'rejected';

          acc[senderId].gifts.push({
            id: req.id,
            amount: req.totalPrice ?? req.pricePerGuest ?? 0,
            currency: req.currency || 'USD',
            message: req.message,
            createdAt: req.createdAt || new Date().toISOString(),
            status: giftStatus,
            momentTitle: req.momentTitle,
            momentEmoji: '🎁',
            paymentType: 'direct',
          });

          acc[senderId].totalAmount += req.totalPrice ?? req.pricePerGuest ?? 0;
          acc[senderId].score = acc[senderId].totalAmount;

          // Update latest gift timestamp
          if (
            !acc[senderId].latestGiftAt ||
            (req.createdAt &&
              new Date(req.createdAt) > new Date(acc[senderId].latestGiftAt))
          ) {
            acc[senderId].latestGiftAt =
              req.createdAt || acc[senderId].latestGiftAt;
            acc[senderId].latestMessage = req.message || '';
          }

          // Update overall status based on gifts
          const hasAccepted = acc[senderId].gifts.some(
            (g) => g.status === 'accepted',
          );
          const allRejected = acc[senderId].gifts.every(
            (g) => g.status === 'rejected',
          );
          if (hasAccepted) {
            acc[senderId].status = 'accepted';
            acc[senderId].canStartChat = true;
          } else if (allRejected) {
            acc[senderId].status = 'rejected';
          }

          return acc;
        },
        {} as Record<string, GiftInboxItem>,
      );

      setGifts(Object.values(grouped));
    } catch (err) {
      logger.error('Failed to fetch gifts', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch gifts'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGifts();
  }, [fetchGifts]);

  const updateFilters = useCallback((newFilters: Partial<GiftInboxFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const acceptGift = useCallback(
    async (giftId: string) => {
      try {
        await requestService.acceptRequest(giftId, {});
        logger.info('Gift accepted', { giftId });
        // Refresh the list after accepting
        await fetchGifts();
      } catch (err) {
        logger.error('Failed to accept gift', { giftId, error: err });
        throw err;
      }
    },
    [fetchGifts],
  );

  const rejectGift = useCallback(
    async (giftId: string, reason?: string) => {
      try {
        await requestService.declineRequest(giftId, reason);
        logger.info('Gift rejected', { giftId });
        // Refresh the list after rejecting
        await fetchGifts();
      } catch (err) {
        logger.error('Failed to reject gift', { giftId, error: err });
        throw err;
      }
    },
    [fetchGifts],
  );

  // Apply filters
  const filteredItems = useMemo(() => {
    return gifts.filter((item) => {
      switch (filterBy) {
        case 'pending':
          return item.status === 'pending';
        case 'accepted':
          return item.status === 'accepted';
        case 'rejected':
          return item.status === 'rejected';
        case 'expired':
          return item.status === 'expired';
        case 'thirty_plus':
          return item.totalAmount >= 30;
        case 'verified_only':
          return item.sender.isVerified;
        case 'ready_to_chat':
          return item.canStartChat === true;
        default:
          return true;
      }
    });
  }, [gifts, filterBy]);

  // Apply sorting
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
        case 'date':
          return (
            new Date(b.latestGiftAt).getTime() -
            new Date(a.latestGiftAt).getTime()
          );
        case 'highest_amount':
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'highest_rating':
          return (b.sender.rating || 0) - (a.sender.rating || 0);
        case 'best_match':
          return (b.score || 0) - (a.score || 0);
        case 'sender':
          return a.sender.name.localeCompare(b.sender.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [filteredItems, sortBy]);

  // Top Picks - highest score/amount
  const topPicks = useMemo(() => {
    return [...gifts]
      .sort((a, b) => (b.score || b.totalAmount) - (a.score || a.totalAmount))
      .slice(0, 5);
  }, [gifts]);

  // New Today - gifts received today
  const newToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return gifts.filter((g) => {
      try {
        return new Date(g.latestGiftAt) >= today;
      } catch (_dateError) {
        return false;
      }
    });
  }, [gifts]);

  const getSortLabel = useCallback((sort: SortOption): string => {
    switch (sort) {
      case 'date':
        return 'Date';
      case 'amount':
        return 'Amount';
      case 'status':
        return 'Status';
      case 'sender':
        return 'Sender';
      case 'newest':
        return 'Newest';
      case 'highest_amount':
        return 'Highest Amount';
      case 'highest_rating':
        return 'Highest Rating';
      case 'best_match':
        return 'Best Match';
      default:
        return 'Date';
    }
  }, []);

  const getFilterLabel = useCallback((filter: FilterOption): string => {
    switch (filter) {
      case 'all':
        return 'All';
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      case 'thirty_plus':
        return '30+';
      case 'verified_only':
        return 'Verified Only';
      case 'ready_to_chat':
        return 'Ready to Chat';
      default:
        return 'All';
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
