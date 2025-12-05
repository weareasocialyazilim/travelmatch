import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface GiftSender {
  id: string;
  name: string;
  age: number;
  avatar: string;
  rating: number;
  isVerified: boolean;
  tripCount: number;
  city: string;
}

interface Gift {
  id: string;
  momentTitle: string;
  momentEmoji: string;
  amount: number;
  message: string;
  paymentType: 'direct' | 'half_escrow' | 'full_escrow';
  status: 'received' | 'pending_proof' | 'verifying' | 'verified' | 'failed';
  createdAt: string;
}

interface GiftInboxItem {
  id: string;
  sender: GiftSender;
  gifts: Gift[];
  totalAmount: number;
  latestMessage: string;
  latestGiftAt: string;
  canStartChat: boolean;
  score: number; // For Top Picks sorting
}

type SortOption = 'newest' | 'highest_amount' | 'highest_rating' | 'best_match';
type FilterOption = 'all' | 'thirty_plus' | 'verified_only' | 'ready_to_chat';

const GiftInboxScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('best_match');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Mock data - gerçek uygulamada API&apos;den gelecek
  const [inboxItems] = useState<GiftInboxItem[]>([
    {
      id: '1',
      sender: {
        id: 'alex-1',
        name: 'Alex',
        age: 28,
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        rating: 4.8,
        isVerified: true,
        tripCount: 12,
        city: 'Istanbul',
      },
      gifts: [
        {
          id: 'g1',
          momentTitle: 'Coffee at Soho Café',
          momentEmoji: '☕',
          amount: 8,
          message: 'Love your travel stories!',
          paymentType: 'direct',
          status: 'received',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 'g2',
          momentTitle: 'Lunch at Kadıköy',
          momentEmoji: '🍕',
          amount: 25,
          message: 'Let&apos;s meet for lunch!',
          paymentType: 'direct',
          status: 'received',
          createdAt: '2024-01-15T14:00:00Z',
        },
      ],
      totalAmount: 33,
      latestMessage: 'Let&apos;s meet for lunch!',
      latestGiftAt: '30m ago',
      canStartChat: true,
      score: 9,
    },
    {
      id: '2',
      sender: {
        id: 'sarah-1',
        name: 'Sarah',
        age: 25,
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        rating: 4.9,
        isVerified: true,
        tripCount: 8,
        city: 'London',
      },
      gifts: [
        {
          id: 'g3',
          momentTitle: 'Museum Tour',
          momentEmoji: '🎭',
          amount: 50,
          message: 'Would love to explore together!',
          paymentType: 'half_escrow',
          status: 'pending_proof',
          createdAt: '2024-01-15T09:00:00Z',
        },
      ],
      totalAmount: 50,
      latestMessage: 'Would love to explore together!',
      latestGiftAt: '2h ago',
      canStartChat: false,
      score: 10,
    },
    {
      id: '3',
      sender: {
        id: 'mehmet-1',
        name: 'Mehmet',
        age: 32,
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        rating: 4.7,
        isVerified: true,
        tripCount: 15,
        city: 'Istanbul',
      },
      gifts: [
        {
          id: 'g4',
          momentTitle: 'Dinner Experience',
          momentEmoji: '🍽️',
          amount: 120,
          message: 'Dinner on me! Best local food guaranteed.',
          paymentType: 'full_escrow',
          status: 'verified',
          createdAt: '2024-01-14T20:00:00Z',
        },
      ],
      totalAmount: 120,
      latestMessage: 'Dinner on me! Best local food guaranteed.',
      latestGiftAt: '1d ago',
      canStartChat: true,
      score: 11,
    },
    {
      id: '4',
      sender: {
        id: 'emma-1',
        name: 'Emma',
        age: 26,
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        rating: 4.3,
        isVerified: false,
        tripCount: 3,
        city: 'Paris',
      },
      gifts: [
        {
          id: 'g5',
          momentTitle: 'Coffee',
          momentEmoji: '☕',
          amount: 10,
          message: 'Hey!',
          paymentType: 'direct',
          status: 'received',
          createdAt: '2024-01-15T08:00:00Z',
        },
      ],
      totalAmount: 10,
      latestMessage: 'Hey!',
      latestGiftAt: '3h ago',
      canStartChat: true,
      score: 4,
    },
    {
      id: '5',
      sender: {
        id: 'john-1',
        name: 'John',
        age: 30,
        avatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        rating: 4.6,
        isVerified: true,
        tripCount: 7,
        city: 'Berlin',
      },
      gifts: [
        {
          id: 'g6',
          momentTitle: 'Street Food Tour',
          momentEmoji: '🥙',
          amount: 15,
          message: 'Your food photos look amazing!',
          paymentType: 'direct',
          status: 'received',
          createdAt: '2024-01-15T11:00:00Z',
        },
      ],
      totalAmount: 15,
      latestMessage: 'Your food photos look amazing!',
      latestGiftAt: '1h ago',
      canStartChat: true,
      score: 6,
    },
  ]);

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
    // Clear previous timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleItemPress = (item: GiftInboxItem) => {
    navigation.navigate('GiftInboxDetail', {
      senderId: item.sender.id,
      senderName: item.sender.name,
      senderAvatar: item.sender.avatar,
      senderAge: item.sender.age,
      senderRating: item.sender.rating,
      senderVerified: item.sender.isVerified,
      senderTripCount: item.sender.tripCount,
      senderCity: item.sender.city,
      gifts: item.gifts,
      totalAmount: item.totalAmount,
      canStartChat: item.canStartChat,
    });
  };

  const getStatusIcon = (
    item: GiftInboxItem,
  ): { icon: IconName; color: string; text: string } => {
    if (item.canStartChat) {
      return {
        icon: 'check-circle',
        color: COLORS.mint,
        text: 'Ready to chat',
      };
    }
    const pendingGift = item.gifts.find((g) => g.status === 'pending_proof');
    if (pendingGift) {
      return {
        icon: 'camera-outline',
        color: COLORS.coral,
        text: 'Upload proof',
      };
    }
    const verifyingGift = item.gifts.find((g) => g.status === 'verifying');
    if (verifyingGift) {
      return {
        icon: 'timer-sand',
        color: COLORS.softOrange,
        text: 'Verifying...',
      };
    }
    return { icon: 'gift-outline', color: COLORS.primary, text: 'Pending' };
  };

  const renderTopPickItem = (item: GiftInboxItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.topPickCard}
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={{ uri: item.sender.avatar }}
        style={styles.topPickAvatar}
      />
      {item.sender.isVerified && (
        <View style={styles.verifiedBadge}>
          <MaterialCommunityIcons
            name="check-decagram"
            size={14}
            color={COLORS.primary}
          />
        </View>
      )}
      <Text style={styles.topPickName} numberOfLines={1}>
        {item.sender.name}
      </Text>
      <Text style={styles.topPickAmount}>${item.totalAmount}</Text>
      <View style={styles.topPickRating}>
        <MaterialCommunityIcons
          name="star"
          size={12}
          color={COLORS.softOrange}
        />
        <Text style={styles.topPickRatingText}>{item.sender.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderInboxItem = (item: GiftInboxItem) => {
    const status = getStatusIcon(item);
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.inboxItem}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.inboxItemLeft}>
          <Image
            source={{ uri: item.sender.avatar }}
            style={styles.inboxAvatar}
          />
          {item.sender.isVerified && (
            <View style={styles.inboxVerifiedBadge}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={12}
                color={COLORS.primary}
              />
            </View>
          )}
        </View>

        <View style={styles.inboxItemContent}>
          <View style={styles.inboxItemHeader}>
            <Text style={styles.inboxName}>
              {item.sender.name}, {item.sender.age}
            </Text>
            <View style={styles.inboxRating}>
              <MaterialCommunityIcons
                name="star"
                size={12}
                color={COLORS.softOrange}
              />
              <Text style={styles.inboxRatingText}>{item.sender.rating}</Text>
            </View>
          </View>

          <Text style={styles.inboxGiftCount}>
            {item.gifts.length} gift{item.gifts.length > 1 ? 's' : ''} · $
            {item.totalAmount} total
          </Text>

          <Text style={styles.inboxMessage} numberOfLines={1}>
            &quot;{item.latestMessage}&quot;
          </Text>

          <View style={styles.inboxStatus}>
            <MaterialCommunityIcons
              name={status.icon}
              size={14}
              color={status.color}
            />
            <Text style={[styles.inboxStatusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>

        <View style={styles.inboxItemRight}>
          <Text style={styles.inboxTime}>{item.latestGiftAt}</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎁 Gift Inbox</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Picks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>⭐ Top Picks</Text>
              <Text style={styles.sectionSubtitle}>
                High rated & meaningful gifts
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topPicksContainer}
          >
            {topPicks.map(renderTopPickItem)}
          </ScrollView>
        </View>

        {/* New Today Section */}
        {newToday.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                🆕 New Today ({newToday.length})
              </Text>
            </View>

            <View style={styles.inboxList}>
              {newToday.slice(0, 3).map(renderInboxItem)}
              {newToday.length > 3 && (
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>
                    See All ({newToday.length})
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={16}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* All Gifts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              📥 All Gifts ({sortedItems.length})
            </Text>
          </View>

          {/* Filter & Sort Bar */}
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.filterButtonText}>
                {getFilterLabel(filterBy)}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={16}
                color={COLORS.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowSortModal(true)}
            >
              <MaterialCommunityIcons
                name="sort"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.filterButtonText}>
                {getSortLabel(sortBy)}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={16}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inboxList}>
            {sortedItems.map(renderInboxItem)}
          </View>
        </View>
      </ScrollView>

      {/* Sort Modal */}
      {showSortModal && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {(
              [
                'newest',
                'highest_amount',
                'highest_rating',
                'best_match',
              ] as SortOption[]
            ).map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    sortBy === option && styles.modalOptionSelected,
                  ]}
                >
                  {getSortLabel(option)}
                </Text>
                {sortBy === option && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter</Text>
            {(
              [
                'all',
                'thirty_plus',
                'verified_only',
                'ready_to_chat',
              ] as FilterOption[]
            ).map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setFilterBy(option);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    filterBy === option && styles.modalOptionSelected,
                  ]}
                >
                  {getFilterLabel(option)}
                </Text>
                {filterBy === option && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  topPicksContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  topPickCard: {
    width: 100,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topPickAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 54,
    right: 22,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
  },
  topPickName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  topPickAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  topPickRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  topPickRatingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  inboxList: {
    paddingHorizontal: 20,
  },
  inboxItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inboxItemLeft: {
    marginRight: 12,
  },
  inboxAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  inboxVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
  },
  inboxItemContent: {
    flex: 1,
  },
  inboxItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  inboxName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  inboxRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inboxRatingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  inboxGiftCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  inboxMessage: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  inboxStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inboxStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inboxItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  inboxTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay50,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalOptionSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default GiftInboxScreen;
