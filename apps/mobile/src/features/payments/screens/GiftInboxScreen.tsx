import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { useGiftInbox, type GiftInboxItem, type SortOption, type FilterOption } from '@/hooks/useGiftInbox';
import { GiftInboxCard } from '../components/GiftInboxCard';
import { FilterSortBar, SortFilterModal } from '../components/FilterSortBar';
import { TopPicksSection } from '../components/TopPicksSection';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import { useNetworkStatus } from '../../../context/NetworkContext';
import { OfflineState } from '../../../components/OfflineState';
import { NetworkGuard } from '../../../components/NetworkGuard';
import { SkeletonList } from '../../../components/ui/SkeletonList';
import { EmptyState } from '../../../components/ui/EmptyState';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const GiftInboxScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isConnected, refresh: refreshNetwork } = useNetworkStatus();

  const {
    refreshing,
    sortBy,
    filterBy,
    showSortModal,
    showFilterModal,
    topPicks,
    newToday,
    sortedItems,
    loading,
    setSortBy,
    setFilterBy,
    setShowSortModal,
    setShowFilterModal,
    onRefresh,
    getSortLabel,
    getFilterLabel,
  } = useGiftInbox();

  const handleItemPress = (item: GiftInboxItem) => {
    navigation.navigate('GiftInboxDetail', {
      senderId: item.sender.id,
      senderName: item.sender.name,
      senderAvatar: item.sender.avatar,
      senderAge: item.sender.age ?? 0,
      senderRating: item.sender.rating ?? 0,
      senderVerified: item.sender.isVerified,
      senderTripCount: item.sender.tripCount ?? 0,
      senderCity: item.sender.city ?? '',
      gifts: item.gifts.map(g => ({
        id: g.id,
        momentTitle: g.momentTitle ?? '',
        momentEmoji: g.momentEmoji ?? '🎁',
        amount: g.amount,
        message: g.message ?? '',
        paymentType: (g.paymentType ?? 'direct') as 'direct' | 'half_escrow' | 'full_escrow',
        status: (g.status ?? 'received') as 'received' | 'pending_proof' | 'verifying' | 'verified' | 'failed',
        createdAt: g.createdAt,
      })),
      totalAmount: item.totalAmount,
      canStartChat: item.canStartChat ?? false,
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Offline Banner */}
      {!isConnected && (
        <OfflineState 
          compact 
          onRetry={refreshNetwork}
          message="İnternet bağlantısı yok"
        />
      )}
      
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

      <NetworkGuard
        offlineMessage={
          sortedItems.length > 0
            ? "Son yüklenen hediye mesajlarını gösteriyorsunuz"
            : "Hediye kutusunu görmek için internet bağlantısı gerekli"
        }
        onRetry={onRefresh}
      >
        {loading && sortedItems.length === 0 ? (
          <SkeletonList type="gift" count={5} show={loading} minDisplayTime={500} />
        ) : sortedItems.length === 0 && topPicks.length === 0 && newToday.length === 0 ? (
          <EmptyState
            icon="gift-outline"
            title="No Gifts Yet"
            description="When travelers send you gifts for your moments, they'll appear here. Keep creating amazing moments!"
            actionLabel="Discover Moments"
            onAction={() => navigation.navigate('Discover')}
          />
        ) : (
        <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Picks Section */}
        <TopPicksSection topPicks={topPicks} onItemPress={handleItemPress} />

        {/* New Today Section */}
        {newToday.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                🆕 New Today ({newToday.length})
              </Text>
            </View>

            <View style={styles.inboxList}>
              {newToday.slice(0, 3).map((item) => (
                <GiftInboxCard
                  key={item.id}
                  item={item}
                  onPress={() => handleItemPress(item)}
                  getStatusIcon={getStatusIcon}
                />
              ))}
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

          <FilterSortBar
            sortBy={sortBy}
            filterBy={filterBy}
            onSortPress={() => setShowSortModal(true)}
            onFilterPress={() => setShowFilterModal(true)}
            getSortLabel={getSortLabel}
            getFilterLabel={getFilterLabel}
          />

          <View style={styles.inboxList}>
            {sortedItems.map((item) => (
              <GiftInboxCard
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item)}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </View>
        </View>
      </ScrollView>
        )}
      </NetworkGuard>

      {/* Sort Modal */}
      <SortFilterModal
        visible={showSortModal}
        title="Sort By"
        options={['newest', 'highest_amount', 'highest_rating', 'best_match']}
        selectedValue={sortBy}
        onClose={() => setShowSortModal(false)}
        onSelect={(value) => setSortBy(value as SortOption)}
        getLabel={getSortLabel}
      />

      {/* Filter Modal */}
      <SortFilterModal
        visible={showFilterModal}
        title="Filter"
        options={['all', 'thirty_plus', 'verified_only', 'ready_to_chat']}
        selectedValue={filterBy}
        onClose={() => setShowFilterModal(false)}
        onSelect={(value) => setFilterBy(value as FilterOption)}
        getLabel={getFilterLabel}
      />
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
    ...TYPOGRAPHY.h2,
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
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  inboxList: {
    paddingHorizontal: 20,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  seeAllText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

// Wrap with ErrorBoundary for gift inbox screen
export default withErrorBoundary(GiftInboxScreen, { 
  fallbackType: 'generic',
  displayName: 'GiftInboxScreen' 
});
