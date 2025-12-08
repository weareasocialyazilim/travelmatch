import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '../utils/logger';
import { requestService } from '../services/requestService';

export interface GiftSender {
  id: string;
  name: string;
  age: number;
  avatar: string;
  rating: number;
  isVerified: boolean;
  tripCount: number;
  city: string;
}

export interface Gift {
  id: string;
  momentTitle: string;
  momentEmoji: string;
  amount: number;
  message: string;
  paymentType: 'direct' | 'half_escrow' | 'full_escrow';
  status: 'received' | 'pending_proof' | 'verifying' | 'verified' | 'failed';
  createdAt: string;
}

export interface GiftInboxItem {
  id: string;
  sender: GiftSender;
  gifts: Gift[];
  totalAmount: number;
  latestMessage: string;
  latestGiftAt: string;
  canStartChat: boolean;
  score: number;
}

export type SortOption = 'newest' | 'highest_amount' | 'highest_rating' | 'best_match';
export type FilterOption = 'all' | 'thirty_plus' | 'verified_only' | 'ready_to_chat';

export const useGiftInbox = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('best_match');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [inboxItems, setInboxItems] = useState<GiftInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { requests } = await requestService.getReceivedRequests();

      // Group by requester
      const grouped = requests.reduce((acc, req) => {
        const senderId = req.requesterId;
        if (!acc[senderId]) {
          acc[senderId] = {
            id: senderId,
            sender: {
              id: senderId,
              name: req.requesterName,
              age: 0,
              avatar: req.requesterAvatar,
              rating: req.requesterRating || 0,
              isVerified: req.requesterVerified || false,
              tripCount: 0,
              city:
                typeof req.requesterLocation === 'string'
                  ? req.requesterLocation
                  : '',
            },
            gifts: [],
            totalAmount: 0,
            latestMessage: '',
            latestGiftAt: '',
            canStartChat: false,
            score: 0,
          };
        }

        acc[senderId].gifts.push({
          id: req.id,
          momentTitle: req.momentTitle,
          momentEmoji: '🎁',
          amount: req.totalPrice,
          message: req.message || '',
          paymentType: 'direct',
          status: req.status === 'completed' ? 'received' : 'pending_proof',
          createdAt: req.createdAt,
        });

        acc[senderId].totalAmount += req.totalPrice;
        acc[senderId].score = acc[senderId].totalAmount; // Simple score based on amount

        if (
          !acc[senderId].latestGiftAt ||
          new Date(req.createdAt) > new Date(acc[senderId].latestGiftAt)
        ) {
          acc[senderId].latestGiftAt = req.createdAt;
          acc[senderId].latestMessage = req.message || '';
        }

        return acc;
      }, {} as Record<string, GiftInboxItem>);

      setInboxItems(Object.values(grouped));
    } catch (error) {
      logger.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Top Picks - highest score
  const topPicks = [...inboxItems]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // New Today
  const newToday = inboxItems.filter(
    (item) =>
      item.latestGiftAt.includes('m ago') ||
      item.latestGiftAt.includes('h ago'),
  );

  // Apply filters
  const filteredItems = inboxItems.filter((item) => {
    switch (filterBy) {
      case 'thirty_plus':
        return item.totalAmount >= 30;
      case 'verified_only':
        return item.sender.isVerified;
      case 'ready_to_chat':
        return item.canStartChat;
      default:
        return true;
    }
  });

  // Apply sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return 0; // Already sorted by time in mock data
      case 'highest_amount':
        return b.totalAmount - a.totalAmount;
      case 'highest_rating':
        return b.sender.rating - a.sender.rating;
      case 'best_match':
        return b.score - a.score;
      default:
        return 0;
    }
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'newest':
        return 'Newest';
      case 'highest_amount':
        return 'Highest Amount';
      case 'highest_rating':
        return 'Highest Rating';
      case 'best_match':
        return 'Best Match';
    }
  };

  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case 'all':
        return 'All';
      case 'thirty_plus':
        return '$30+';
      case 'verified_only':
        return 'Verified';
      case 'ready_to_chat':
        return 'Ready to Chat';
    }
  };

  return {
    // State
    refreshing,
    sortBy,
    filterBy,
    showSortModal,
    showFilterModal,
    inboxItems,
    loading,
    topPicks,
    newToday,
    sortedItems,

    // Actions
    setSortBy,
    setFilterBy,
    setShowSortModal,
    setShowFilterModal,
    onRefresh,
    
    // Helpers
    getSortLabel,
    getFilterLabel,
  };
};
