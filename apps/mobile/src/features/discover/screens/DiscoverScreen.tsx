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

import React, { useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { LiquidScreenWrapper } from '@/components/layout';
import {
  BlurFilterModal,
  type FilterValues,
  SubscriptionUpgradeCTA,
} from '@/components/ui';
import { useSubscription } from '@/features/payments';
import { showLoginPrompt } from '@/stores/modalStore';
import { logger } from '@/utils/logger';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

const { height } = Dimensions.get('window');

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);

  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);

  // StoryViewer state
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
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
    locationPermission: _locationPermission,
  } = useDiscoverMoments();

  // Cast discovery moments to Moment type for compatibility
  const moments = discoveryMoments as unknown as Moment[];

  const { user, isGuest } = useAuth();

  // Subscription state for upgrade CTA
  const { subscription } = useSubscription();
  const currentTier =
    (subscription?.tier as 'free' | 'premium' | 'platinum') || 'free';

  // Pending moment for post-login action
  const [_pendingMoment, setPendingMoment] = useState<Moment | null>(null);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleFilterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilterModal(true);
  }, []);

  const handleFilterApply = useCallback((filters: FilterValues) => {
    setActiveFilters(filters);
    // TODO: Apply filters to useDiscoverMoments when backend supports it
    logger.debug('Filters applied:', filters);
  }, []);

  const handleAvatarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Profile');
  }, [navigation]);

  // Handle subscription upgrade
  const handleSubscriptionUpgrade = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Subscription');
  }, [navigation]);

  // Stories actions - Instagram-style fullscreen viewer
  const handleStoryPress = useCallback((story: UserStory, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const handleStoryShare = useCallback((_story: Story) => {
    // TODO: Implement share functionality
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleCreateStoryPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateMoment');
  }, [navigation]);

  // Handle Counter-Offer / Subscriber Offer
  const handleCounterOffer = useCallback(
    (moment: Moment) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
        onUserPress={() => handleUserPress(item)}
        onSharePress={() => handleSharePress(item)}
      />
    ),
    [handleGiftPress, handleCounterOffer, handleUserPress, handleSharePress],
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

  // Loading state
  if (loading && activeMoments.length === 0) {
    return (
      <LiquidScreenWrapper variant="twilight" safeAreaTop>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.loadingText}>Discovering moments...</Text>
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
            Tap to retry
          </Text>
        </View>
      </LiquidScreenWrapper>
    );
  }

  // Empty state - Premium Turkish UX
  if (!loading && activeMoments.length === 0) {
    return (
      <LiquidScreenWrapper variant="twilight" safeAreaTop>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="compass-outline"
            size={64}
            color={COLORS.text.muted}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Bu civarda henüz an yok 🗺️</Text>
          <Text style={styles.emptySubtitle}>
            Mesafe filtreni artırmayı dene veya{'\n'}yeni bir an başlatan ilk
            sen ol!
          </Text>
          <TouchableOpacity
            style={styles.emptyCTAButton}
            onPress={() => navigation.navigate('CreateMoment')}
          >
            <LinearGradient
              colors={[COLORS.primary, '#22C55E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyCTAGradient}
            >
              <Text style={styles.emptyCTAText}>An Oluştur</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LiquidScreenWrapper>
    );
  }

  return (
    <LiquidScreenWrapper variant="twilight" safeAreaTop animated={false}>
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
