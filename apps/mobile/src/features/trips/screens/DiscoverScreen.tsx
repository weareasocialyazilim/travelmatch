/**
 * DiscoverScreen - TravelMatch: The Rebirth
 *
 * TikTok-style immersive vertical feed with:
 * - Full-screen moment cards
 * - Snap-to-page scrolling
 * - Anti-Cheapskate counter-offer logic
 * - FloatingDock navigation
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ImmersiveMomentCard } from '@/components/discover/ImmersiveMomentCard';
import { FloatingDock } from '@/components/layout/FloatingDock';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

const { height, width } = Dimensions.get('window');

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

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);
  const { moments, loading, error, refresh, loadMore, hasMore } = useMoments();

  // Filter only active moments
  const activeMoments = useMemo(
    () => moments.filter((m) => m.status === 'active'),
    [moments],
  );

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
        moment: {
          id: moment.id,
          title: moment.title,
          description: moment.description || '',
          image: moment.image || moment.images?.[0] || '',
          price: moment.price || moment.pricePerGuest || 0,
          hostId: moment.hostId,
          hostName: moment.hostName || '',
          hostAvatar: moment.hostAvatar || '',
          category: typeof moment.category === 'string' ? moment.category : moment.category?.id || '',
          location: typeof moment.location === 'string' ? moment.location : `${moment.location?.city || ''}, ${moment.location?.country || ''}`,
        },
      });
    },
    [navigation],
  );

  // Handle Like Press
  const handleLikePress = useCallback(
    (moment: Moment) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Implement save/unsave logic
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
  const handleSharePress = useCallback((moment: Moment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement share logic
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
        <FloatingDock />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Immersive Vertical Feed */}
      <FlatList
        ref={flatListRef}
        data={activeMoments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={height}
        snapToAlignment="start"
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={loading}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
      />

      {/* Loading more indicator */}
      {loading && activeMoments.length > 0 && (
        <View style={styles.loadMoreIndicator}>
          <ActivityIndicator size="small" color={COLORS.brand.primary} />
        </View>
      )}

      {/* Floating Navigation Dock */}
      <FloatingDock />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
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
    backgroundColor: COLORS.background.primary,
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
    backgroundColor: COLORS.background.primary,
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
