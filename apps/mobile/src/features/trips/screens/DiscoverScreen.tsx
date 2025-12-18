import React, { useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import BottomNav from '@/components/BottomNav';
import {
  StoryViewer,
  FilterModal,
  LocationModal,
  DiscoverHeader,
  StoryItem,
  POPULAR_CITIES,
  USER_STORIES,
} from '@/components/discover';
import MomentSingleCard from '@/components/discover/cards/MomentSingleCard';
import MomentGridCard from '@/components/discover/cards/MomentGridCard';
import { SkeletonList } from '../../../components/ui/SkeletonList';
import { COLORS } from '@/constants/colors';
import { useMoments } from '@/hooks/useMoments';
import { useAccessibility } from '@/hooks/useAccessibility';
import { logger } from '@/utils/logger';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import { useNetworkStatus } from '../../../context/NetworkContext';
import { OfflineState } from '../../../components/OfflineState';
import { NetworkGuard } from '../../../components/NetworkGuard';
import { useDiscoverStore } from '@/stores/discoverStore';

// Import modular components
import type {
  ViewMode,
  UserStory,
  PriceRange,
} from '@/components/discover/types';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { Moment } from '@/hooks/useMoments';
import type { Moment as DomainMoment } from '@/types';
import type { NavigationProp } from '@react-navigation/native';

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isConnected, refresh: refreshNetwork } = useNetworkStatus();
  const { props: a11y, announce } = useAccessibility();

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

  // Zustand Store - All UI and Filter State
  const {
    // UI State
    viewMode,
    refreshing,
    showFilterModal,
    showLocationModal,
    showStoryViewer,
    selectedStoryUser,

    // Story Viewer State
    currentStoryIndex,
    currentUserIndex,
    isPaused,

    // Filter State
    selectedCategory,
    sortBy,
    maxDistance,
    priceRange,

    // Location State
    selectedLocation,
    recentLocations,

    // Actions
    setViewMode,
    setRefreshing,
    openFilterModal,
    closeFilterModal,
    openLocationModal,
    closeLocationModal,
    openStoryViewer,
    closeStoryViewer,
    setCurrentStoryIndex,
    setCurrentUserIndex,
    setSelectedStoryUser,
    setIsPaused,
    setSelectedCategory,
    setSortBy,
    setMaxDistance,
    setPriceRange,
    resetFilters,
    addRecentLocation,
    getActiveFilterCount,
  } = useDiscoverStore();

  // Refresh handler with haptic feedback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshMoments();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
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
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      const nextUserIndex = currentUserIndex + 1;
      if (nextUserIndex < USER_STORIES.length) {
        setCurrentUserIndex(nextUserIndex);
        setSelectedStoryUser(USER_STORIES[nextUserIndex]);
        setCurrentStoryIndex(0);
      } else {
        closeStoryViewer();
      }
    }
  }, [selectedStoryUser, currentStoryIndex, currentUserIndex, setCurrentStoryIndex, setCurrentUserIndex, setSelectedStoryUser, closeStoryViewer]);

  const goToPreviousStory = useCallback(() => {
    if (!selectedStoryUser) return;

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      const prevUserIndex = currentUserIndex - 1;
      if (prevUserIndex >= 0) {
        const prevUser = USER_STORIES[prevUserIndex];
        setCurrentUserIndex(prevUserIndex);
        setSelectedStoryUser(prevUser);
        setCurrentStoryIndex(prevUser.stories.length - 1);
      }
    }
  }, [selectedStoryUser, currentStoryIndex, currentUserIndex, setCurrentStoryIndex, setCurrentUserIndex, setSelectedStoryUser]);

  // Use API moments
  const baseMoments = useMemo(() => {
    return apiMoments;
  }, [apiMoments]);

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

  const handleStoryPress = useCallback((user: UserStory) => {
    const userIndex = USER_STORIES.findIndex((u) => u.id === user.id);
    openStoryViewer(user, userIndex);
  }, [openStoryViewer]);

  const handleLocationSelect = useCallback(
    (location: string) => {
      addRecentLocation(location);
      closeLocationModal();
    },
    [addRecentLocation, closeLocationModal],
  );

  // Active filter count - computed from store (memoized)
  const activeFilterCount = useMemo(() => getActiveFilterCount(), [
    selectedCategory,
    sortBy,
    maxDistance,
    priceRange,
    getActiveFilterCount,
  ]);

  // Memoized render functions
  const renderStoryItem = useCallback(
    ({ item }: { item: UserStory }) => (
      <StoryItem item={item} onPress={handleStoryPress} />
    ),
    [handleStoryPress],
  );

  const renderMomentCard = useCallback(
    ({ item, index }: { item: Moment; index: number }) => {
      if (viewMode === 'single') {
        return <MomentSingleCard moment={item} onPress={handleMomentPress} />;
      }
      return (
        <MomentGridCard
          moment={item}
          index={index}
          onPress={handleMomentPress}
        />
      );
    },
    [viewMode, handleMomentPress],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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
        viewMode={viewMode}
        activeFiltersCount={activeFilterCount}
        onLocationPress={openLocationModal}
        onFilterPress={openFilterModal}
        onViewModeToggle={() =>
          setViewMode(viewMode === 'single' ? 'grid' : 'single')
        }
      />

      <NetworkGuard
        offlineMessage={
          apiMoments.length > 0
            ? "Son yüklenen moment'ları gösteriyorsunuz"
            : "Moment'ları yüklemek için internet bağlantısı gerekli"
        }
        onRetry={onRefresh}
      >
        {/* Main FlashList - avoids VirtualizedList nesting warning */}
        <FlashList
          data={filteredMoments}
          renderItem={renderMomentCard}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          estimatedItemSize={viewMode === 'grid' ? 200 : 350}
          contentContainerStyle={
            viewMode === 'single'
              ? styles.singleListContainer
              : styles.gridContainer
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={onRefresh}
              tintColor={COLORS.mint}
            />
          }
          ListHeaderComponent={
            <>
              {/* Stories - Horizontal FlatList (not FlashList to avoid nesting) */}
              <FlatList
                data={USER_STORIES}
                renderItem={renderStoryItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storiesContainer}
              />

              {/* Results Bar */}
              <View style={styles.resultsBar}>
                <Text style={styles.resultsText}>
                  {loading
                    ? 'Loading...'
                    : `${filteredMoments.length} moments nearby`}
                </Text>
                <View style={styles.viewToggle}>
                  <TouchableOpacity
                    style={[
                      styles.viewToggleButton,
                      viewMode === 'single' && styles.viewToggleButtonActive,
                    ]}
                    onPress={() => setViewMode('single')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    {...a11y.button(
                      'Single column view',
                      'Display moments in a single column',
                      false,
                    )}
                    accessibilityState={{ selected: viewMode === 'single' }}
                  >
                    <MaterialCommunityIcons
                      name="square-outline"
                      size={18}
                      color={
                        viewMode === 'single' ? COLORS.white : COLORS.textSecondary
                      }
                      accessible={false}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.viewToggleButton,
                      viewMode === 'grid' && styles.viewToggleButtonActive,
                    ]}
                    onPress={() => setViewMode('grid')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    {...a11y.button(
                      'Grid view',
                      'Display moments in a grid layout',
                      false,
                    )}
                    accessibilityState={{ selected: viewMode === 'grid' }}
                  >
                    <MaterialCommunityIcons
                      name="view-grid-outline"
                      size={18}
                      color={
                        viewMode === 'grid' ? COLORS.white : COLORS.textSecondary
                      }
                      accessible={false}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error State */}
              {error && !loading && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={48}
                    color={COLORS.error}
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
            </>
          }
          ListEmptyComponent={
            !loading && !error ? (
              <EmptyState
                icon="compass-off-outline"
                title="No moments found"
                description="Try adjusting your filters or location"
                actionLabel="Clear Filters"
                onAction={resetFilters}
              />
            ) : null
          }
          ListFooterComponent={
            <>
              {/* Load More Indicator */}
              {loading && filteredMoments.length > 0 && (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadMoreText}>Loading more...</Text>
                </View>
              )}
              {/* Bottom Padding */}
              <View style={styles.bottomPadding} />
            </>
          }
        />
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
    backgroundColor: COLORS.background,
  },
  bottomPadding: {
    height: 100,
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
    color: COLORS.textSecondary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.primary,
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
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
    color: COLORS.textSecondary,
  },

  // Stories Container
  storiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
});

// Wrap with ErrorBoundary for critical home screen
export default withErrorBoundary(DiscoverScreen, {
  fallbackType: 'generic',
  displayName: 'DiscoverScreen',
});
