import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/ui/EmptyState';
import BottomNav from '@/components/BottomNav';
import {
  StoryViewer,
  FilterModal,
  LocationModal,
  DiscoverHeader,
  StoryItem,
  POPULAR_CITIES,
} from '@/components/discover';
import MomentSingleCard from '@/components/discover/cards/MomentSingleCard';
import { SkeletonList } from '../../../components/ui/SkeletonList';
import { COLORS } from '@/constants/colors';
import { useMoments } from '@/hooks/useMoments';
import { useAccessibility } from '@/hooks/useAccessibility';
import { logger } from '@/utils/logger';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import { useNetworkStatus } from '../../../context/NetworkContext';
import { OfflineState } from '../../../components/OfflineState';
import { NetworkGuard } from '../../../components/NetworkGuard';

// Import modular components
import type { UserStory, PriceRange } from '@/components/discover/types';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { Moment } from '@/hooks/useMoments';
import type { Moment as DomainMoment } from '@/types';
import type { NavigationProp } from '@react-navigation/native';

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isConnected, refresh: refreshNetwork } = useNetworkStatus();
  const { props: a11y, announce: _announce } = useAccessibility();

  // Use moments hook for data fetching
  const {
    moments: apiMoments,
    loading,
    error,
    refresh: refreshMoments,
    loadMore,
    hasMore,
    setFilters,
  } = useMoments();

  // UI States
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryUser, setSelectedStoryUser] = useState<UserStory | null>(
    null,
  );

  // Story viewer states
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('nearest');
  const [maxDistance, setMaxDistance] = useState(50);
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: 500,
  });
  const [selectedGender, setSelectedGender] = useState('all');

  // Location state
  const [selectedLocation, setSelectedLocation] = useState('San Francisco, CA');
  const [recentLocations, setRecentLocations] = useState([
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
  ]);

  // Refresh handler with haptic feedback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshMoments();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshMoments]);

  // Story navigation handlers
  const goToNextStory = useCallback(() => {
    if (!selectedStoryUser) return;

    const currentUserStories = selectedStoryUser.stories;

    if (currentStoryIndex < currentUserStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      const nextUserIndex = currentUserIndex + 1;
      if (nextUserIndex < recentStories.length) {
        setCurrentUserIndex(nextUserIndex);
        setSelectedStoryUser(recentStories[nextUserIndex]);
        setCurrentStoryIndex(0);
      } else {
        closeStoryViewer();
      }
    }
  }, [selectedStoryUser, currentStoryIndex, currentUserIndex, recentStories]);

  const goToPreviousStory = useCallback(() => {
    if (!selectedStoryUser) return;

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else {
      const prevUserIndex = currentUserIndex - 1;
      if (prevUserIndex >= 0) {
        const prevUser = recentStories[prevUserIndex];
        setCurrentUserIndex(prevUserIndex);
        setSelectedStoryUser(prevUser);
        setCurrentStoryIndex(prevUser.stories.length - 1);
      }
    }
  }, [selectedStoryUser, currentStoryIndex, currentUserIndex, recentStories]);

  const closeStoryViewer = useCallback(() => {
    setShowStoryViewer(false);
    setSelectedStoryUser(null);
    setCurrentStoryIndex(0);
    setCurrentUserIndex(0);
    setIsPaused(false);
  }, []);

  // Use API moments
  const baseMoments = useMemo(() => {
    return apiMoments;
  }, [apiMoments]);

  // Generate stories from moments created in the last 24 hours
  // Each unique host with recent moments becomes a story
  const recentStories = useMemo((): UserStory[] => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter moments from last 24 hours
    const recentMoments = baseMoments.filter((moment) => {
      const createdAt = new Date(moment.createdAt);
      return createdAt >= twentyFourHoursAgo;
    });

    // Group moments by host
    const hostMomentsMap = new Map<
      string,
      { host: (typeof recentMoments)[0]; moments: typeof recentMoments }
    >();

    recentMoments.forEach((moment) => {
      const hostId = moment.hostId;
      if (!hostMomentsMap.has(hostId)) {
        hostMomentsMap.set(hostId, { host: moment, moments: [] });
      }
      hostMomentsMap.get(hostId)!.moments.push(moment);
    });

    // Convert to UserStory format
    const stories: UserStory[] = [];
    hostMomentsMap.forEach(({ host, moments }) => {
      // Calculate time ago for the most recent moment
      const mostRecentMoment = moments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
      const timeDiff =
        now.getTime() - new Date(mostRecentMoment.createdAt).getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const minsAgo = Math.floor(timeDiff / (1000 * 60));
      const timeAgo = hoursAgo > 0 ? `${hoursAgo}h ago` : `${minsAgo}m ago`;

      stories.push({
        id: host.hostId,
        name: host.hostName || 'Unknown',
        avatar: host.hostAvatar || 'https://via.placeholder.com/60',
        hasStory: true,
        isNew: hoursAgo < 6, // Mark as new if less than 6 hours old
        stories: moments.map((m) => ({
          id: m.id,
          imageUrl:
            m.image || m.images?.[0] || 'https://via.placeholder.com/400',
          title: m.title,
          description: m.description || '',
          location:
            typeof m.location === 'string'
              ? m.location
              : m.location?.city || 'Unknown',
          distance: m.distance || '0 km',
          price: m.price || m.pricePerGuest || 0,
          time: timeAgo,
        })),
      });
    });

    // Sort by most recent first
    return stories.sort((a, b) => {
      const aTime = a.stories[0]?.time || '24h ago';
      const bTime = b.stories[0]?.time || '24h ago';
      const parseTime = (t: string) => {
        const match = t.match(/(\d+)(m|h)/);
        if (!match) return 999;
        const [, num, unit] = match;
        return unit === 'm' ? parseInt(num) : parseInt(num) * 60;
      };
      return parseTime(aTime) - parseTime(bTime);
    });
  }, [baseMoments]);

  // Filter and sort moments
  const filteredMoments = useMemo(() => {
    let moments = [...baseMoments];

    if (selectedCategory !== 'all') {
      moments = moments.filter((m) => {
        const categoryId =
          typeof m.category === 'string' ? m.category : m.category?.id;
        return categoryId?.toLowerCase() === selectedCategory;
      });
    }

    moments = moments.filter((m) => {
      const price = m.price || m.pricePerGuest || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    switch (sortBy) {
      case 'nearest':
        moments.sort(
          (a, b) =>
            parseFloat(a.distance || '999') - parseFloat(b.distance || '999'),
        );
        break;
      case 'newest':
        moments.sort(
          (a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
        );
        break;
      case 'price_low':
        moments.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        moments.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    return moments;
  }, [baseMoments, selectedCategory, sortBy, priceRange]);

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  // Ref to track if we're already loading more to prevent duplicate calls
  const isLoadingMoreRef = useRef(false);

  // Memoized scroll handler to prevent re-creation on every render
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 50;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true;
        handleLoadMore();
        // Reset after a short delay to prevent rapid firing
        setTimeout(() => {
          isLoadingMoreRef.current = false;
        }, 500);
      }
    },
    [handleLoadMore],
  );

  // Apply filters to hook when category changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setFilters({ category: selectedCategory });
    }
  }, [selectedCategory, setFilters]);

  const handleMomentPress = useCallback(
    (moment: Moment) => {
      // Cast to any to bridge hook Moment and domain Moment types
      navigation.navigate('MomentDetail', {
        moment: moment as unknown as import('@/types').Moment,
      });
    },
    [navigation],
  );

  const handleStoryPress = useCallback(
    (user: UserStory) => {
      const userIndex = recentStories.findIndex((u) => u.id === user.id);
      setCurrentUserIndex(userIndex >= 0 ? userIndex : 0);
      setSelectedStoryUser(user);
      setCurrentStoryIndex(0);
      setShowStoryViewer(true);
    },
    [recentStories],
  );

  const handleLocationSelect = useCallback(
    (location: string) => {
      if (
        selectedLocation !== location &&
        !recentLocations.includes(selectedLocation)
      ) {
        setRecentLocations((prev) => [selectedLocation, ...prev.slice(0, 2)]);
      }
      setSelectedLocation(location);
      setShowLocationModal(false);
    },
    [selectedLocation, recentLocations],
  );

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (sortBy !== 'nearest') count++;
    if (maxDistance !== 50) count++;
    if (priceRange.min !== 0 || priceRange.max !== 500) count++;
    return count;
  }, [selectedCategory, sortBy, maxDistance, priceRange, selectedGender]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSortBy('nearest');
    setMaxDistance(50);
    setPriceRange({ min: 0, max: 500 });
    setSelectedGender('all');
  }, []);

  // Memoized modal handlers to prevent unnecessary re-renders
  const openLocationModal = useCallback(() => setShowLocationModal(true), []);
  const closeLocationModal = useCallback(() => setShowLocationModal(false), []);
  const openFilterModal = useCallback(() => setShowFilterModal(true), []);
  const closeFilterModal = useCallback(() => setShowFilterModal(false), []);

  // Memoized render functions
  const renderStoryItem = useCallback(
    ({ item }: { item: UserStory }) => (
      <StoryItem item={item} onPress={handleStoryPress} />
    ),
    [handleStoryPress],
  );

  const renderMomentCard = useCallback(
    ({ item, index }: { item: Moment; index: number }) => {
      return <MomentSingleCard moment={item} onPress={handleMomentPress} />;
    },
    [handleMomentPress],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg.primary} />

      {/* Offline Banner at top */}
      {!isConnected && (
        <OfflineState
          compact
          onRetry={refreshNetwork}
          message="İnternet bağlantısı yok"
        />
      )}

      {/* Header */}
      <DiscoverHeader
        location={selectedLocation}
        activeFiltersCount={activeFilterCount}
        onLocationPress={openLocationModal}
        onFilterPress={openFilterModal}
      />

      <NetworkGuard
        offlineMessage={
          apiMoments.length > 0
            ? "Son yüklenen moment'ları gösteriyorsunuz"
            : "Moment'ları yüklemek için internet bağlantısı gerekli"
        }
        onRetry={onRefresh}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={onRefresh}
              tintColor={COLORS.mint}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {/* Stories - Recent moments from last 24 hours */}
          {recentStories.length > 0 && (
            <FlashList
              data={recentStories}
              renderItem={renderStoryItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesContainer}
              estimatedItemSize={80}
            />
          )}

          {/* Results Bar - simplified without view toggle */}
          <View style={styles.resultsBar}>
            <Text style={styles.resultsText}>
              {loading
                ? 'Loading...'
                : `${filteredMoments.length} moments nearby`}
            </Text>
          </View>

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color={COLORS.feedback.error}
                accessible={false}
              />
              <Text style={styles.errorText} {...a11y.alert(error)}>
                {error}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onRefresh}
                {...a11y.button('Try Again', 'Reload moments')}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading Skeleton */}
          {loading && filteredMoments.length === 0 && !error && (
            <SkeletonList
              type="moment"
              count={4}
              show={loading}
              minDisplayTime={400}
            />
          )}

          {/* Moments List */}
          {!error && filteredMoments.length > 0 && (
            <View style={styles.momentsListContainer}>
              <FlashList
                data={filteredMoments}
                renderItem={renderMomentCard}
                numColumns={1}
                contentContainerStyle={styles.singleListContainer}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                scrollEnabled={false}
                estimatedItemSize={350}
              />
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && filteredMoments.length === 0 && (
            <EmptyState
              icon="compass-off-outline"
              title="No moments found"
              description="Try adjusting your filters or location"
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          )}

          {/* Load More Indicator */}
          {loading && filteredMoments.length > 0 && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={COLORS.brand.primary} />
              <Text style={styles.loadMoreText}>Loading more...</Text>
            </View>
          )}

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </NetworkGuard>

      {/* Modals - Using extracted components */}
      <LocationModal
        visible={showLocationModal}
        onClose={closeLocationModal}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        recentLocations={recentLocations}
        popularCities={POPULAR_CITIES}
        currentLocationName="San Francisco, CA"
      />

      <FilterModal
        visible={showFilterModal}
        onClose={closeFilterModal}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        maxDistance={maxDistance}
        setMaxDistance={setMaxDistance}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
      />

      <StoryViewer
        visible={showStoryViewer}
        user={selectedStoryUser}
        currentStoryIndex={currentStoryIndex}
        onClose={closeStoryViewer}
        onNextStory={goToNextStory}
        onPreviousStory={goToPreviousStory}
        onViewMoment={(story) => {
          closeStoryViewer();
          // Convert story to moment format for navigation
          const domainMoment: DomainMoment = {
            id: story.id,
            title: story.title,
            imageUrl: story.imageUrl,
            image: story.imageUrl,
            price: story.price,
            story: story.description,
            location: { city: story.location, country: '' },
            category: { id: 'experience', label: 'Experience', emoji: '✨' },
            user: selectedStoryUser
              ? {
                  id: selectedStoryUser.id || '',
                  name: selectedStoryUser.name,
                  avatar: selectedStoryUser.avatar,
                  isVerified: false,
                  location: '',
                  type: 'traveler',
                  travelDays: 0,
                }
              : {
                  id: '',
                  name: 'Unknown',
                  avatar: '',
                  isVerified: false,
                  location: '',
                  type: 'traveler',
                  travelDays: 0,
                },
            availability: 'Available',
            giftCount: 0,
          };
          navigation.navigate('MomentDetail', {
            moment: domainMoment,
          });
        }}
        onUserPress={(userId) => {
          // Handle user profile navigation
          logger.debug('Navigate to user:', userId);
        }}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab="Discover" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  scrollView: {
    flex: 1,
  },

  // Results Bar
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface.base,
    borderRadius: 8,
    padding: 4,
  },
  viewToggleButton: {
    width: 32,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: COLORS.brand.primary,
  },

  // Single List Container
  singleListContainer: {
    paddingHorizontal: 16,
  },

  // Grid Container
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },

  // Error State
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.utility.white,
    fontWeight: '600',
  },

  // Load More
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
  },

  // Stories Container
  storiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },

  // Moments List Container - for FlashList
  momentsListContainer: {
    minHeight: 400,
  },

  // Bottom Padding
  bottomPadding: {
    height: 100,
  },
});

// Wrap with ErrorBoundary for critical home screen
export default withErrorBoundary(DiscoverScreen, {
  fallbackType: 'generic',
  displayName: 'DiscoverScreen',
});
