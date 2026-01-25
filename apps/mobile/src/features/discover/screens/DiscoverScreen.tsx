/**
 * DiscoverScreen - Lovendo: The Rebirth
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

import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { logger } from '@/utils/logger';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HapticManager } from '@/services/HapticManager';
import { LinearGradient } from 'expo-linear-gradient';
import { measureScreenLoad } from '@/config/sentry'; // ADDED: Performance monitoring
import { ReportBlockBottomSheet } from '@/features/moderation/components/ReportBlockBottomSheet';
import {
  ImmersiveMomentCard,
  AwwwardsDiscoverHeader,
  StoriesRow,
  StoryViewer,
  type UserStory,
  type Story,
} from '../components';
// Note: FloatingDock is now rendered by MainTabNavigator
// Using useDiscoverMoments for PostGIS-based location discovery
import { useDiscoverMoments } from '@/hooks/useDiscoverMoments';
import { type Moment } from '@/hooks/useMoments';
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { useTranslation } from 'react-i18next';
import { LiquidScreenWrapper } from '@/components/layout';
import {
  BlurFilterModal,
  type FilterValues,
  SubscriptionUpgradeCTA,
  ContentReactiveGlow,
  LocationPermissionPrompt,
} from '@/components/ui';
import { useSubscription } from '@/features/payments';
import { showLoginPrompt } from '@/stores/modalStore';
import { useSearchStore } from '@/stores/searchStore';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useContentReactiveGlow } from '@/hooks/useContentReactiveGlow';

const { height } = Dimensions.get('window');

const DiscoverScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const flashListRef = useRef<FlashList<Moment>>(null);

  // Search store for filters - connects to useDiscoverMoments
  const { setFilters } = useSearchStore();

  // Content-reactive glow system
  const { glowColors, glowOpacity, updateGlowFromImage } =
    useContentReactiveGlow();

  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);

  // StoryViewer state
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);

  // ADDED: Performance monitoring
  useEffect(() => {
    const endMeasurement = measureScreenLoad('DiscoverScreen');
    return endMeasurement;
  }, []);
  const [selectedStoryUser, setSelectedStoryUser] = useState<UserStory | null>(
    null,
  );
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);

  // Use PostGIS-based discovery for location-aware moments
  const {
    moments: discoveryMoments,
    loading,
    error,
    refresh,
    loadMore,
    hasMore,
    userLocation: _userLocation,
    locationPermission,
  } = useDiscoverMoments();

  // Cast discovery moments to Moment type for compatibility
  const moments = discoveryMoments as unknown as Moment[];

  const { user, isGuest } = useAuth();

  // Subscription state for upgrade CTA
  const { subscription } = useSubscription();
  const currentTier =
    (subscription?.tier as 'free' | 'premium' | 'platinum') || 'free';
  const isPremium = currentTier !== 'free';

  // Pending moment for post-login action
  const [_pendingMoment, setPendingMoment] = useState<Moment | null>(null);

  // Moderate/Report State
  const [reportMoment, setReportMoment] = useState<Moment | null>(null);

  const handleReportPress = useCallback((moment: Moment) => {
    setReportMoment(moment);
  }, []);

  const handleReportSubmit = useCallback(
    (action: string, _reason?: string, _details?: string) => {
      // Logic would go here to call backend
      logger.info(`[Discover] ${action} on moment ${reportMoment?.id}`);
      setReportMoment(null);
      setTimeout(() => {
        Alert.alert(
          action === 'block' ? 'User Blocked' : 'Report Sent',
          action === 'block'
            ? 'You will no longer see content from this user.'
            : 'Thank you for keeping Lovendo safe. We will review this shortly.',
        );
      }, 300);
    },
    [reportMoment],
  );

  // Use real stories data from hook instead of mock data
  const {
    stories: userStories,
    loading: _storiesLoading,
    refresh: _refreshStories,
  } = useStories();

  // Filter only active moments
  const activeMoments = useMemo(
    () => moments.filter((m) => m.status === 'active'),
    [moments],
  );

  // Convert stories to UserStory format
  const stories: UserStory[] = useMemo(() => {
    if (!userStories || userStories.length === 0) {
      // Return empty array - no mock data in production
      return [];
    }
    return userStories.map((story) => ({
      id: story.userId,
      name: story.userName,
      avatar: story.userAvatar,
      hasStory: true,
      isNew: story.isNew ?? false,
      stories: story.items || [],
    }));
  }, [userStories]);

  // Header actions
  const handleNotificationsPress = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleFilterPress = useCallback(() => {
    HapticManager.filterApplied();
    setShowFilterModal(true);
  }, []);

  const handleFilterApply = useCallback(
    (filters: FilterValues) => {
      setActiveFilters(filters);

      // CRITICAL FIX: Apply filters to searchStore which feeds useDiscoverMoments
      setFilters({
        maxDistance: filters.distance || 50,
        ageRange:
          filters.age || filters.ageRange
            ? [
                filters.age?.[0] || filters.ageRange?.[0] || 18,
                filters.age?.[1] || filters.ageRange?.[1] || 99,
              ]
            : [18, 99],
        gender:
          filters.gender && filters.gender !== 'all'
            ? [
                filters.gender === 'other'
                  ? 'non-binary'
                  : (filters.gender as 'male' | 'female'),
              ]
            : [],
        momentCategory: filters.category as
          | 'gastronomy'
          | 'nightlife'
          | 'culture'
          | 'adventure'
          | 'wellness'
          | 'photography'
          | 'local_secrets'
          | 'vip_access'
          | undefined,
      });

      logger.debug('Filters applied to searchStore:', filters);
    },
    [setFilters],
  );

  const handleAvatarPress = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('Profile');
  }, [navigation]);

  // Location permission handlers
  const handleRequestLocationPermission = useCallback(async () => {
    // Re-trigger permission request by refreshing
    await refresh();
  }, [refresh]);

  const handleCitySelect = useCallback(
    (coords: { latitude: number; longitude: number }) => {
      // Manually set location and refresh
      // Note: This would require extending useDiscoverMoments to accept manual coords
      logger.info('City selected:', coords);
      // For now, just refresh with the hook's logic
      refresh();
    },
    [refresh],
  );

  // Handle subscription upgrade
  const handleSubscriptionUpgrade = useCallback(() => {
    HapticManager.primaryAction();
    navigation.navigate('Subscription');
  }, [navigation]);

  // Stories actions - Instagram-style fullscreen viewer
  const handleStoryPress = useCallback((story: UserStory, _index: number) => {
    HapticManager.buttonPress();
    // Open StoryViewer modal (Instagram-style)
    setSelectedStoryUser(story);
    setCurrentStoryIndex(0);
    setIsStoryPaused(false);
    setStoryViewerVisible(true);
  }, []);

  // StoryViewer handlers
  const handleStoryClose = useCallback(() => {
    setStoryViewerVisible(false);
    setSelectedStoryUser(null);
    setCurrentStoryIndex(0);
  }, []);

  const handleNextStory = useCallback(() => {
    if (!selectedStoryUser) return;
    if (currentStoryIndex < selectedStoryUser.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      // Last story - close viewer
      handleStoryClose();
    }
  }, [selectedStoryUser, currentStoryIndex, handleStoryClose]);

  const handlePreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  }, [currentStoryIndex]);

  const handleViewMoment = useCallback(
    async (story: Story) => {
      handleStoryClose();
      if (story.momentId) {
        // We need to get the moment data to navigate
        // For now, navigate to profile instead which has moment access
        navigation.navigate('ProfileDetail', {
          userId: selectedStoryUser?.id || '',
        });
      }
    },
    [navigation, handleStoryClose, selectedStoryUser],
  );

  const handleStoryUserPress = useCallback(
    (userId: string) => {
      handleStoryClose();
      navigation.navigate('ProfileDetail', { userId });
    },
    [navigation, handleStoryClose],
  );

  const handleStoryGift = useCallback(
    (story: Story) => {
      handleStoryClose();
      if (story.momentId && selectedStoryUser) {
        navigation.navigate('UnifiedGiftFlow', {
          recipientId: selectedStoryUser.id,
          recipientName: selectedStoryUser.name,
          momentId: story.momentId,
          momentTitle: story.title || 'Moment',
          requestedAmount: story.price || 0,
          requestedCurrency: 'TRY',
        });
      }
    },
    [navigation, handleStoryClose, selectedStoryUser],
  );

  const handleStoryShare = useCallback(
    async (story: Story) => {
      HapticManager.buttonPress();
      try {
        const shareMessage = `🌟 ${story.title || 'Bir hikaye'}\n\n${selectedStoryUser?.name || 'Bir kullanıcı'} Lovendo'da muhteşem bir an paylaştı!\n\n👉 Lovendo'da gör: https://www.lovendo.xyz/stories/${story.id}`;

        const result = await Share.share({
          message: shareMessage,
          title: story.title || 'Lovendo Hikayesi',
        });

        if (result.action === Share.sharedAction) {
          HapticManager.success();
          logger.info('Story shared successfully:', story.id);
        }
      } catch (error) {
        logger.error('Story share failed:', error);
        HapticManager.error();
      }
    },
    [selectedStoryUser],
  );

  const handleCreateStoryPress = useCallback(() => {
    HapticManager.primaryAction();
    navigation.navigate('CreateMoment');
  }, [navigation]);

  // Handle Counter-Offer / Subscriber Offer
  const handleCounterOffer = useCallback(
    (moment: Moment) => {
      HapticManager.primaryAction();

      // Guest kullanıcı kontrolü
      if (isGuest || !user) {
        setPendingMoment(moment);
        showLoginPrompt({ action: 'counter_offer' });
        return;
      }

      // Navigate to subscriber offer modal (correct route name)
      navigation.navigate('SubscriberOfferModal', {
        momentId: moment.id,
        momentTitle: moment.title || 'Moment',
        momentCategory:
          typeof moment.category === 'string'
            ? moment.category
            : moment.category?.id || 'experience',
        targetValue: moment.price || moment.pricePerGuest || 0,
        targetCurrency: moment.currency || 'TRY',
        hostId: moment.hostId,
        hostName: moment.hostName || 'Host',
      });
    },
    [navigation, isGuest, user],
  );

  // Handle Gift Press
  const handleGiftPress = useCallback(
    (moment: Moment) => {
      HapticManager.giftSent();

      // Guest kullanıcı kontrolü - showLoginPrompt via modalStore
      if (isGuest || !user) {
        setPendingMoment(moment);
        showLoginPrompt({ action: 'default' });
        return;
      }

      // Navigate to gift flow with all required params
      navigation.navigate('UnifiedGiftFlow', {
        recipientId: moment.hostId,
        recipientName: moment.hostName || 'Host',
        momentId: moment.id,
        momentTitle: moment.title || 'Moment',
        momentImageUrl: moment.images?.[0] || moment.image,
        requestedAmount: moment.price || moment.pricePerGuest || 0,
        requestedCurrency: (moment.currency || 'TRY') as
          | 'TRY'
          | 'EUR'
          | 'USD'
          | 'GBP'
          | 'JPY'
          | 'CAD',
      });
    },
    [navigation, isGuest, user],
  );

  // Login Modal Handlers - Now using centralized modalStore
  const _handleLoginModalClose = useCallback(() => {
    setPendingMoment(null);
  }, []);

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
  const handleSharePress = useCallback(async (moment: Moment) => {
    HapticManager.buttonPress();
    try {
      // Get location display - handle both string and object types
      const locationDisplay =
        typeof moment.location === 'string'
          ? moment.location
          : moment.location?.city || 'Bir yer';
      const shareMessage = `🌟 ${moment.title || 'Bir an'}\n\n${moment.description || "Lovendo'da bu muhteşem anı keşfet!"}\n\n📍 ${locationDisplay}\n💰 ${moment.price || 0} ${moment.currency || 'TRY'}\n\n👉 Lovendo'da gör: https://www.lovendo.xyz/moments/${moment.id}`;

      const result = await Share.share({
        message: shareMessage,
        title: moment.title || 'Lovendo Anı',
      });

      if (result.action === Share.sharedAction) {
        HapticManager.success();
        logger.info('Moment shared successfully:', moment.id);
      }
    } catch (error) {
      logger.error('Share failed:', error);
      HapticManager.error();
    }
  }, []);

  // Viewability config for content-reactive glow
  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80, // Card must be 80% visible
      minimumViewTime: 300, // Must be visible for 300ms
    }),
    [],
  );

  // Handle viewable items change
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: Moment }> }) => {
      if (viewableItems.length > 0) {
        const visibleMoment = viewableItems[0].item;
        // Update glow based on moment's first image
        if (visibleMoment.images && visibleMoment.images.length > 0) {
          updateGlowFromImage(visibleMoment.images[0]);
        }
      }
    },
    [updateGlowFromImage],
  );

  // Render each moment card
  const renderItem = useCallback(
    ({ item, index }: { item: Moment; index: number }) => {
      // Show inline subscription card every 5 moments
      const shouldShowSubscription = (index + 1) % 5 === 0 && !isPremium;

      return (
        <>
          <ImmersiveMomentCard
            item={item}
            onGiftPress={() => handleGiftPress(item)}
            onCounterOfferPress={() => handleCounterOffer(item)}
            onUserPress={() => handleUserPress(item)}
            onSharePress={() => handleSharePress(item)}
            onReportPress={() => handleReportPress(item)}
          />
          {shouldShowSubscription && (
            <View style={styles.inlineSubscription}>
              <SubscriptionUpgradeCTA
                currentTier={currentTier}
                onUpgrade={handleSubscriptionUpgrade}
                compact
              />
            </View>
          )}
        </>
      );
    },
    [
      handleGiftPress,
      handleCounterOffer,
      handleUserPress,
      handleSharePress,
      handleReportPress,
      isPremium,
      navigation,
    ],
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    HapticManager.refreshTriggered();
    await refresh();
    // Success haptic after refresh completes
    HapticManager.success();
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
  const _getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [],
  );

  // Render header component for FlatList - MOVED BEFORE EARLY RETURNS (Rules of Hooks)
  const renderHeader = useCallback(
    () => (
      <View style={styles.headerSection}>
        {/* Stories Section */}
        <StoriesRow
          stories={stories}
          onStoryPress={handleStoryPress}
          onCreatePress={handleCreateStoryPress}
        />

        {/* Subscription Upgrade CTA - Tinder/Bumble Style */}
        <SubscriptionUpgradeCTA
          currentTier={currentTier}
          onUpgrade={handleSubscriptionUpgrade}
          compact
        />
      </View>
    ),
    [
      stories,
      handleStoryPress,
      handleCreateStoryPress,
      currentTier,
      handleSubscriptionUpgrade,
    ],
  );

  // Location permission denied - Show city selector
  if (locationPermission === 'denied') {
    return (
      <LiquidScreenWrapper variant="twilight" safeAreaTop>
        <LocationPermissionPrompt
          onCitySelect={handleCitySelect}
          onRequestPermission={handleRequestLocationPermission}
        />
      </LiquidScreenWrapper>
    );
  }

  // Loading state
  if (loading && activeMoments.length === 0) {
    return (
      <LiquidScreenWrapper variant="twilight" safeAreaTop>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.loadingText}>
            {t('emptyState.discoveringMoments')}
          </Text>
        </View>
      </LiquidScreenWrapper>
    );
  }

  // Error state
  if (error && activeMoments.length === 0) {
    return (
      <LiquidScreenWrapper variant="twilight" safeAreaTop>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{String(error)}</Text>
          <Text style={styles.retryText} onPress={handleRefresh}>
            {t('emptyState.tapToRetry')}
          </Text>
        </View>
      </LiquidScreenWrapper>
    );
  }

  // Empty state - Premium UX
  if (!loading && activeMoments.length === 0) {
    return (
      <LiquidScreenWrapper variant="twilight" safeAreaTop>
        <View testID="empty-moments" style={styles.emptyContainer}>
          <Ionicons
            name="compass-outline"
            size={64}
            color={COLORS.text.muted}
            style={styles.emptyIcon}
          />
          <Text testID="text-empty-title" style={styles.emptyTitle}>
            {t('emptyState.noMomentsNearby')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t('emptyState.tryIncreasingDistance')}
          </Text>
          <TouchableOpacity
            style={styles.emptyCTAButton}
            onPress={() => navigation.navigate('CreateMoment')}
            testID="btn-create-moment-empty"
          >
            <LinearGradient
              colors={[COLORS.primary, '#22C55E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyCTAGradient}
            >
              <Text style={styles.emptyCTAText}>
                {t('emptyState.createMoment')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LiquidScreenWrapper>
    );
  }

  return (
    <LiquidScreenWrapper variant="twilight" safeAreaTop animated={false}>
      {/* Content-reactive ambient glow */}
      <ContentReactiveGlow colors={glowColors} opacity={glowOpacity} />

      {/* Awwwards-style Header */}
      <AwwwardsDiscoverHeader
        userName={user?.name || 'Explorer'}
        notificationCount={3}
        activeFiltersCount={
          activeFilters ? Object.keys(activeFilters).length : 0
        }
        onNotificationsPress={handleNotificationsPress}
        onFilterPress={handleFilterPress}
        onAvatarPress={handleAvatarPress}
      />

      {/* Immersive Vertical Feed with Stories Header - FlashList for 30-40% better perf */}
      <FlashList
        ref={flashListRef}
        data={activeMoments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={loading}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        estimatedItemSize={height}
        contentContainerStyle={styles.feedContent}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      {/* Loading more indicator */}
      {loading && activeMoments.length > 0 && (
        <View style={styles.loadMoreIndicator}>
          <ActivityIndicator size="small" color={COLORS.brand.primary} />
        </View>
      )}

      {/* Filter Modal */}
      <BlurFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        initialPriceRange={(activeFilters?.priceRange as number) || 2}
        initialCategory={(activeFilters?.category as string) || 'All'}
        initialDistance={(activeFilters?.distance as number) || 25}
        initialAgeRange={
          (activeFilters?.ageRange as [number, number]) || [18, 99]
        }
        initialGender={(activeFilters?.gender as string) || 'all'}
      />

      {/* Instagram-style Story Viewer Modal */}
      <StoryViewer
        visible={storyViewerVisible}
        user={selectedStoryUser}
        currentStoryIndex={currentStoryIndex}
        onClose={handleStoryClose}
        onNextStory={handleNextStory}
        onPreviousStory={handlePreviousStory}
        onViewMoment={handleViewMoment}
        onUserPress={handleStoryUserPress}
        onGift={handleStoryGift}
        onShare={handleStoryShare}
        isPaused={isStoryPaused}
        setIsPaused={setIsStoryPaused}
      />

      {/* Guest Login Prompt Modal - Now rendered by ModalProvider */}
      {/* FloatingDock is rendered by MainTabNavigator */}

      {/* Report/Block Modal */}
      <ReportBlockBottomSheet
        visible={!!reportMoment}
        onClose={() => setReportMoment(null)}
        onSubmit={handleReportSubmit}
        targetType="moment"
      />
    </LiquidScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
  emptyIcon: {
    marginBottom: 16,
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
    lineHeight: 24,
    marginBottom: 24,
  },
  inlineSubscription: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyCTAButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyCTAGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  emptyCTAText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
