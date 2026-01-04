/**
 * DiscoverScreen - TravelMatch: Master Architecture
 *
 * Awwwards standardında keşfet ekranı.
 * FlashList ile optimize edilmiş performans.
 *
 * Features:
 * - @shopify/flash-list for silky smooth scrolling
 * - Real-time price updates via Supabase subscription
 * - TMSkeleton loading states
 * - Subscriber Offer system (replaces Anti-Cheapskate)
 *
 * Note: FloatingDock navigation is handled by MainTabNavigator
 */

import React, {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  Text,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  ImmersiveMomentCard,
  AwwwardsDiscoverHeader,
  StoriesRow,
} from '@/features/discover/components';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { useStories, type UserStoryData } from '@/hooks/useStories';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/config/supabase';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { TMSkeleton } from '@/components/ui/TMSkeleton';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { logger } from '@/utils/logger';
import {
  getUserSubscriptionTier,
  canMakeSubscriberOffer,
  type SubscriptionTier,
} from '@/features/moments/services/momentsService';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

const { height } = Dimensions.get('window');

/**
 * Subscriber Offer Validation
 *
 * Master Logic: Replaces "Anti-Cheapskate" with subscription-based rules
 * - Category must match the moment's category
 * - Offer value must be >= moment's requested_amount
 *
 * ZOMBIE CLEANUP: SubscriberOffer and MomentRequirement interfaces
 * moved to gift feature validation layer
 */

// NOTE: MOCK_STORIES kaldırıldı - artık useStories() hook ile gerçek veriler kullanılıyor

// Skeleton Card Component for loading state
const MomentCardSkeleton = () => (
  <View style={styles.skeletonCard}>
    <TMSkeleton width="100%" height={height * 0.6} borderRadius={24} />
    <View style={styles.skeletonContent}>
      <TMSkeleton width="70%" height={24} borderRadius={8} />
      <View style={styles.skeletonRow}>
        <TMSkeleton width="40%" height={16} borderRadius={6} />
        <TMSkeleton width={80} height={36} borderRadius={18} />
      </View>
    </View>
  </View>
);

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const flashListRef = useRef<FlashList<Moment>>(null);
  const { moments, loading, error, refresh, loadMore, hasMore } = useMoments();
  const {
    stories,
    loading: storiesLoading,
    refresh: refreshStories,
  } = useStories();
  const { user } = useAuth();

  // User's subscription tier state
  const [userSubscription, setUserSubscription] =
    useState<SubscriptionTier>('free');

  // Guest user login prompt state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState<
    'gift' | 'save' | 'chat' | 'default'
  >('default');
  const [pendingMoment, setPendingMoment] = useState<Moment | null>(null);

  // Check if user is guest (not authenticated)
  const isGuest = !user;

  // Local state for real-time price updates
  const [realtimePrices, setRealtimePrices] = useState<
    Record<string, { price: number; currency: string }>
  >({});

  // Fetch user's subscription tier on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      if (user?.id) {
        const tier = await getUserSubscriptionTier(user.id);
        setUserSubscription(tier);
        logger.debug('User subscription tier', { tier });
      }
    };
    fetchSubscription();
  }, [user?.id]);

  // Subscribe to real-time moment price updates via Supabase
  useEffect(() => {
    const channel = supabase
      .channel('moments-price-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips', // DB table name
        },
        (payload) => {
          const { id, price, currency } = payload.new as {
            id: string;
            price: number;
            currency: string;
          };
          logger.debug('Real-time price update', { id, price, currency });
          setRealtimePrices((prev) => ({
            ...prev,
            [id]: { price, currency },
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Merge real-time prices with moments data
  const activeMoments = useMemo(() => {
    return moments
      .filter((m) => m.status === 'active')
      .map((moment) => {
        const realtimeData = realtimePrices[moment.id];
        if (realtimeData) {
          return {
            ...moment,
            price: realtimeData.price,
            pricePerGuest: realtimeData.price,
            currency: realtimeData.currency,
          };
        }
        return moment;
      });
  }, [moments, realtimePrices]);

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
    (story: UserStoryData, _index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('ProfileDetail' as any, { userId: story.userId });
    },
    [navigation],
  );

  const handleCreateStoryPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateMoment' as any);
  }, [navigation]);

  /**
   * Handle Subscriber Offer
   * Only Pro and VIP subscribers can make alternative offers
   * Free/Starter users go directly to payment
   */
  const handleSubscriberOffer = useCallback(
    (moment: Moment) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const canOffer = canMakeSubscriberOffer(userSubscription);

      if (!canOffer) {
        // Free/Starter users cannot make alternative offers
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Premium Özellik ✨',
          'Alternatif hediye teklifi sunmak için Pro veya Platinum aboneliğe yükseltin.',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Yükselt',
              onPress: () => navigation.navigate('Subscription' as any),
            },
          ],
        );
        return;
      }

      // Navigate to Subscriber Offer modal
      const momentCategory =
        typeof moment.category === 'string'
          ? moment.category
          : moment.category?.id || 'experience';
      const targetValue = moment.price || moment.pricePerGuest || 0;

      navigation.navigate('SubscriberOfferModal' as any, {
        momentId: moment.id,
        momentTitle: moment.title,
        momentCategory,
        targetValue,
        targetCurrency: moment.currency || 'TRY',
        hostId: moment.hostId,
        hostName: moment.hostName || 'Host',
      });
    },
    [navigation, userSubscription],
  );

  /**
   * Handle Gift Press - Subscription-based routing
   *
   * Pro/Platinum: Can choose between direct payment or alternative offer
   * Free/Starter: Direct payment only with creator-set price
   */
  const handleGiftPress = useCallback(
    (moment: Moment) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Guest user check - show login prompt
      if (isGuest) {
        setPendingMoment(moment);
        setLoginPromptAction('gift');
        setShowLoginPrompt(true);
        return;
      }

      const price = moment.price || moment.pricePerGuest || 0;
      const currency = (moment.currency || 'TRY') as
        | 'TRY'
        | 'EUR'
        | 'USD'
        | 'GBP'
        | 'JPY'
        | 'CAD';

      const canOffer = canMakeSubscriberOffer(userSubscription);

      if (canOffer) {
        // Pro/Platinum: Show options (direct pay or make offer)
        Alert.alert(
          '🎁 Hediye Seçenekleri',
          `${moment.hostName || 'Host'} için ${price} ${currency} isteniyor.`,
          [
            {
              text: 'Doğrudan Öde',
              onPress: () => {
                navigation.navigate('UnifiedGiftFlow', {
                  recipientId: moment.hostId,
                  recipientName: moment.hostName || 'Host',
                  momentId: moment.id,
                  momentTitle: moment.title,
                  momentImageUrl: moment.images?.[0] || moment.image || '',
                  requestedAmount: price,
                  requestedCurrency: currency,
                });
              },
            },
            {
              text: 'Teklif Sun',
              onPress: () => handleSubscriberOffer(moment),
            },
            { text: 'İptal', style: 'cancel' },
          ],
        );
      } else {
        // Free/Starter: Direct payment only
        navigation.navigate('UnifiedGiftFlow', {
          recipientId: moment.hostId,
          recipientName: moment.hostName || 'Host',
          momentId: moment.id,
          momentTitle: moment.title,
          momentImageUrl: moment.images?.[0] || moment.image || '',
          requestedAmount: price,
          requestedCurrency: currency,
        });
      }
    },
    [navigation, userSubscription, handleSubscriberOffer, isGuest],
  );

  const handleLikePress = useCallback(
    (moment: Moment) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Guest user check - show login prompt
      if (isGuest) {
        setPendingMoment(moment);
        setLoginPromptAction('save');
        setShowLoginPrompt(true);
        return;
      }

      // TODO: Implement actual like/save logic for authenticated users
    },
    [isGuest],
  );

  // Handle login prompt close
  const handleLoginPromptClose = useCallback(() => {
    setShowLoginPrompt(false);
    setPendingMoment(null);
    setLoginPromptAction('default');
  }, []);

  // Handle login press from prompt
  const handleLoginPress = useCallback(() => {
    setShowLoginPrompt(false);
    navigation.navigate('Login' as any);
    setPendingMoment(null);
    setLoginPromptAction('default');
  }, [navigation]);

  // Handle register press from prompt
  const handleRegisterPress = useCallback(() => {
    setShowLoginPrompt(false);
    navigation.navigate('Register' as any);
    setPendingMoment(null);
    setLoginPromptAction('default');
  }, [navigation]);

  const handleUserPress = useCallback(
    (moment: Moment) => {
      navigation.navigate('ProfileDetail', { userId: moment.hostId });
    },
    [navigation],
  );

  const handleSharePress = useCallback((_moment: Moment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Render each moment card with creator-set price
  const renderItem = useCallback(
    ({ item }: { item: Moment }) => {
      return (
        <ImmersiveMomentCard
          item={item}
          onGiftPress={() => handleGiftPress(item)}
          onCounterOfferPress={() => handleSubscriberOffer(item)}
          onLikePress={() => handleLikePress(item)}
          onUserPress={() => handleUserPress(item)}
          onSharePress={() => handleSharePress(item)}
        />
      );
    },
    [
      handleGiftPress,
      handleSubscriberOffer,
      handleLikePress,
      handleUserPress,
      handleSharePress,
    ],
  );

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([refresh(), refreshStories()]);
  }, [refresh, refreshStories]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const keyExtractor = useCallback((item: Moment) => item.id, []);

  // Render header - must be defined before early returns
  const renderHeader = useCallback(
    () => (
      <View style={styles.headerSection}>
        <StoriesRow
          stories={stories}
          onStoryPress={handleStoryPress}
          onCreatePress={handleCreateStoryPress}
          loading={storiesLoading}
        />
      </View>
    ),
    [handleStoryPress, handleCreateStoryPress, stories, storiesLoading],
  );

  // Loading state with skeleton
  if (loading && activeMoments.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.bg.primary}
        />
        <AwwwardsDiscoverHeader
          userName="Traveler"
          notificationCount={0}
          onSearchPress={handleSearchPress}
          onNotificationsPress={handleNotificationsPress}
          onAvatarPress={handleAvatarPress}
        />
        <View style={styles.skeletonContainer}>
          <MomentCardSkeleton />
          <MomentCardSkeleton />
        </View>
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg.primary}
        translucent={false}
      />

      <AwwwardsDiscoverHeader
        userName="Traveler"
        notificationCount={3}
        onSearchPress={handleSearchPress}
        onNotificationsPress={handleNotificationsPress}
        onAvatarPress={handleAvatarPress}
      />

      {/* FlashList for silky smooth scrolling */}
      <FlashList
        ref={flashListRef}
        data={activeMoments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        estimatedItemSize={height * 0.7}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={loading}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.feedContent}
      />

      {/* Login Prompt Modal for Guest Users */}
      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={handleLoginPromptClose}
        onLogin={handleLoginPress}
        onRegister={handleRegisterPress}
        action={loginPromptAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  headerSection: {
    marginVertical: 12,
  },
  feedContent: {
    paddingBottom: 100,
  },
  // Skeleton styles
  skeletonContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: COLORS.surface.base,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  skeletonContent: {
    padding: 16,
    gap: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Error state
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
  // Empty state
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
});

export default withErrorBoundary(DiscoverScreen, {
  fallbackType: 'generic',
  displayName: 'DiscoverScreen',
});
