/**
 * DiscoverScreen - TravelMatch: The Rebirth
 *
 * Awwwards standardında keşfet ekranı.
 * "Soft Minimalist & Premium" tasarım diliyle güncellendi.
 *
 * Features:
 * - AwwwardsDiscoverHeader with greeting & brand
 * - StoriesRow for user moments
 * - Immersive moment cards feed
 * - Anti-Cheapskate counter-offer logic
 *
 * Note: FloatingDock navigation is handled by MainTabNavigator
 */

import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  StatusBar,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  ImmersiveMomentCard,
  AwwwardsDiscoverHeader,
  StoriesRow,
  type UserStory,
} from '../components';
// Note: FloatingDock is now rendered by MainTabNavigator
import { useMoments, type Moment } from '@/hooks/useMoments';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

const { height } = Dimensions.get('window');

// Tier system for counter-offer validation
interface PlaceTier {
  category: string;
  tier: number; // 1 = budget, 2 = mid, 3 = premium, 4 = luxury
  price: number;
}

// Anti-Cheapskate Logic: Validate counter-offer tier
const validateCounterOffer = (
  proposedPlace: PlaceTier,
  originalMoment: PlaceTier,
): { valid: boolean; message?: string } => {
  // Same category check
  if (proposedPlace.category !== originalMoment.category) {
    return {
      valid: false,
      message: 'Please suggest a place in the same category.',
    };
  }

  // Tier check - proposed place must be at least the same tier
  if (proposedPlace.tier < originalMoment.tier) {
    return {
      valid: false,
      message:
        "This suggestion doesn't match the moment's standards. TravelMatch maintains quality - please suggest something in a similar or higher tier!",
    };
  }

  return { valid: true };
};

// Get tier from price (simplified logic)
const getTierFromPrice = (price: number, category: string): number => {
  // Food category tiers
  if (category === 'food' || category === 'restaurant') {
    if (price < 20) return 1; // Budget
    if (price < 50) return 2; // Mid
    if (price < 150) return 3; // Premium
    return 4; // Luxury
  }

  // Default tiers for other categories
  if (price < 50) return 1;
  if (price < 150) return 2;
  if (price < 500) return 3;
  return 4;
};

// Mock stories data - In production, this comes from a hook
const MOCK_STORIES: UserStory[] = [
  {
    id: '1',
    name: 'Ayşe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    hasStory: true,
    isNew: true,
    stories: [],
  },
  {
    id: '2',
    name: 'Mehmet',
    avatar: 'https://i.pravatar.cc/150?img=2',
    hasStory: true,
    isNew: true,
    stories: [],
  },
  {
    id: '3',
    name: 'Zeynep',
    avatar: 'https://i.pravatar.cc/150?img=3',
    hasStory: true,
    isNew: false,
    stories: [],
  },
  {
    id: '4',
    name: 'Can',
    avatar: 'https://i.pravatar.cc/150?img=4',
    hasStory: true,
    isNew: false,
    stories: [],
  },
];

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);
  const { moments, loading, error, refresh, loadMore, hasMore } = useMoments();

  // Filter only active moments
  const activeMoments = useMemo(
    () => moments.filter((m) => m.status === 'active'),
    [moments],
  );

  // Header actions
  const handleSearchPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SearchMap' as any);
  }, [navigation]);

  const handleNotificationsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Notifications' as any);
  }, [navigation]);

  const handleAvatarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Profile' as any);
  }, [navigation]);

  // Stories actions
  const handleStoryPress = useCallback(
    (story: UserStory, _index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Navigate to story viewer
      navigation.navigate('ProfileDetail' as any, { userId: story.id });
    },
    [navigation],
  );

  const handleCreateStoryPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateMoment' as any);
  }, [navigation]);

  // Handle Counter-Offer with Anti-Cheapskate Logic
  const handleCounterOffer = useCallback((moment: Moment) => {
    // In a real implementation, this would open a BottomSheet
    // where the user selects an alternative place.
    // For now, we simulate the validation logic.

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get the original moment's tier info
    const originalCategory =
      typeof moment.category === 'string'
        ? moment.category
        : moment.category?.id || 'experience';
    const originalPrice = moment.price || moment.pricePerGuest || 0;
    const originalTier = getTierFromPrice(originalPrice, originalCategory);

    // Simulated proposed place (in real app, this comes from user selection)
    // Simulating a "cheapskate" attempt for demo
    const proposedPlace: PlaceTier = {
      category: originalCategory,
      tier: originalTier - 1, // Trying to downgrade
      price: originalPrice * 0.3, // 70% cheaper
    };

    const validation = validateCounterOffer(proposedPlace, {
      category: originalCategory,
      tier: originalTier,
      price: originalPrice,
    });

    if (!validation.valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Whoops! 📉",
        validation.message ||
          "This doesn't match the moment's standards. Suggest something similar or better!",
        [{ text: 'Got it, I\'ll upgrade', style: 'default' }],
      );
      return;
    }

    // If valid, proceed with counter-offer flow
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Offer Sent! 🚀',
      'Great alternative suggestion! The host will review it.',
      [{ text: 'Awesome', style: 'default' }],
    );
  }, []);

  // Handle Gift Press
  const handleGiftPress = useCallback(
    (moment: Moment) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Navigate to gift flow
      navigation.navigate('UnifiedGiftFlow', {
        recipientId: moment.hostId,
        recipientName: moment.hostName || 'Host',
        momentId: moment.id,
      });
    },
    [navigation],
  );

  // Handle Like Press
  const handleLikePress = useCallback(
    (_moment: Moment) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Implement save/unsave logic using _moment.id
    },
    [],
  );

  // Handle User Press
  const handleUserPress = useCallback(
    (moment: Moment) => {
      navigation.navigate('ProfileDetail', {
        userId: moment.hostId,
      });
    },
    [navigation],
  );

  // Handle Share Press
  const handleSharePress = useCallback((_moment: Moment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement share logic using _moment.id
  }, []);

  // Render each moment card
  const renderItem = useCallback(
    ({ item }: { item: Moment }) => (
      <ImmersiveMomentCard
        item={item}
        onGiftPress={() => handleGiftPress(item)}
        onCounterOfferPress={() => handleCounterOffer(item)}
        onLikePress={() => handleLikePress(item)}
        onUserPress={() => handleUserPress(item)}
        onSharePress={() => handleSharePress(item)}
      />
    ),
    [
      handleGiftPress,
      handleCounterOffer,
      handleLikePress,
      handleUserPress,
      handleSharePress,
    ],
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
  }, [refresh]);

  // Handle load more
  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  // Key extractor
  const keyExtractor = useCallback((item: Moment) => item.id, []);

  // Get item layout for performance optimization
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [],
  );

  // Loading state
  if (loading && activeMoments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <ActivityIndicator size="large" color={COLORS.brand.primary} />
        <Text style={styles.loadingText}>Discovering moments...</Text>
      </View>
    );
  }

  // Error state
  if (error && activeMoments.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={handleRefresh}>
          Tap to retry
        </Text>
      </View>
    );
  }

  // Empty state
  if (!loading && activeMoments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <Text style={styles.emptyTitle}>No moments yet</Text>
        <Text style={styles.emptySubtitle}>
          Be the first to create a moment!
        </Text>
      </View>
    );
  }

  // Render header component for FlatList
  const renderHeader = useCallback(
    () => (
      <View style={styles.headerSection}>
        {/* Stories Section */}
        <StoriesRow
          stories={MOCK_STORIES}
          onStoryPress={handleStoryPress}
          onCreatePress={handleCreateStoryPress}
        />
      </View>
    ),
    [handleStoryPress, handleCreateStoryPress],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg.primary}
        translucent={false}
      />

      {/* Awwwards-style Header */}
      <AwwwardsDiscoverHeader
        userName="Traveler"
        notificationCount={3}
        onSearchPress={handleSearchPress}
        onNotificationsPress={handleNotificationsPress}
        onAvatarPress={handleAvatarPress}
      />

      {/* Immersive Vertical Feed with Stories Header */}
      <FlatList
        ref={flatListRef}
        data={activeMoments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={loading}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        contentContainerStyle={styles.feedContent}
      />

      {/* Loading more indicator */}
      {loading && activeMoments.length > 0 && (
        <View style={styles.loadMoreIndicator}>
          <ActivityIndicator size="small" color={COLORS.brand.primary} />
        </View>
      )}

      {/* FloatingDock is rendered by MainTabNavigator */}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container - "Soft Minimalist" background
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },

  // Header Section with Stories
  headerSection: {
    marginVertical: 12,
  },

  // Feed Content - Premium spacing
  feedContent: {
    paddingBottom: 100, // Space for FloatingDock
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    marginTop: 16,
  },

  // Error State
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.feedback.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    color: COLORS.brand.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },

  // Load More
  loadMoreIndicator: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
});

// Wrap with ErrorBoundary
export default withErrorBoundary(DiscoverScreen, {
  fallbackType: 'generic',
  displayName: 'DiscoverScreen',
});
