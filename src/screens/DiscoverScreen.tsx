import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import BottomNav from '../components/BottomNav';
import { COLORS } from '../constants/colors';
import { logger } from '../utils/logger';
import { MOCK_MOMENTS } from '../mocks';
import type { Moment } from '../types';
import { useMoments } from '../hooks/useMoments';
import { MomentsFeedSkeleton } from '../components/SkeletonLoader';

// Import modular components
import {
  StoryViewer,
  FilterModal,
  LocationModal,
  POPULAR_CITIES,
  USER_STORIES,
} from './discover';
import type { ViewMode, UserStory, PriceRange } from './discover/types';

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
  const [viewMode, setViewMode] = useState<ViewMode>('single');
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

  // Location state
  const [selectedLocation, setSelectedLocation] = useState('San Francisco, CA');
  const [recentLocations, setRecentLocations] = useState([
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
  ]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshMoments();
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
      if (nextUserIndex < USER_STORIES.length) {
        setCurrentUserIndex(nextUserIndex);
        setSelectedStoryUser(USER_STORIES[nextUserIndex]);
        setCurrentStoryIndex(0);
      } else {
        closeStoryViewer();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoryUser, currentStoryIndex, currentUserIndex]);

  const goToPreviousStory = useCallback(() => {
    if (!selectedStoryUser) return;

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else {
      const prevUserIndex = currentUserIndex - 1;
      if (prevUserIndex >= 0) {
        const prevUser = USER_STORIES[prevUserIndex];
        setCurrentUserIndex(prevUserIndex);
        setSelectedStoryUser(prevUser);
        setCurrentStoryIndex(prevUser.stories.length - 1);
      }
    }
  }, [selectedStoryUser, currentStoryIndex, currentUserIndex]);

  const closeStoryViewer = useCallback(() => {
    setShowStoryViewer(false);
    setSelectedStoryUser(null);
    setCurrentStoryIndex(0);
    setCurrentUserIndex(0);
    setIsPaused(false);
  }, []);

  // Use API moments if available, fallback to mock data
  const baseMoments = useMemo(() => {
    return apiMoments.length > 0 ? apiMoments : MOCK_MOMENTS;
  }, [apiMoments]);

  // Filter and sort moments
  const filteredMoments = useMemo(() => {
    let moments = [...baseMoments] as Moment[];

    if (selectedCategory !== 'all') {
      moments = moments.filter(
        (m) => m.category?.id?.toLowerCase() === selectedCategory,
      );
    }

    moments = moments.filter((m) => {
      const price = m.price || 0;
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
      navigation.navigate('MomentDetail', { moment });
    },
    [navigation],
  );

  const handleStoryPress = useCallback((user: UserStory) => {
    const userIndex = USER_STORIES.findIndex((u) => u.id === user.id);
    setCurrentUserIndex(userIndex);
    setSelectedStoryUser(user);
    setCurrentStoryIndex(0);
    setShowStoryViewer(true);
  }, []);

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
  }, [selectedCategory, sortBy, maxDistance, priceRange]);

  // Render Story Item
  const renderStoryItem = ({ item }: { item: UserStory }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => handleStoryPress(item)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.storyCircle,
          item.isNew && styles.storyCircleNew,
          !item.isNew && styles.storyCircleSeen,
        ]}
      >
        <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
      </View>
      <Text style={styles.storyName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Single Column Card
  const renderSingleCard = (item: Moment) => (
    <TouchableOpacity
      key={item.id}
      style={styles.singleCard}
      onPress={() => handleMomentPress(item)}
      activeOpacity={0.95}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.singleImage} />
      <View style={styles.singleContent}>
        <View style={styles.creatorRow}>
          <Image
            source={{
              uri: item.user?.avatar || 'https://via.placeholder.com/40',
            }}
            style={styles.creatorAvatar}
          />
          <View style={styles.creatorInfo}>
            <View style={styles.creatorNameRow}>
              <Text style={styles.creatorName}>
                {item.user?.name || 'Anonymous'}
              </Text>
              {item.user?.isVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={14}
                  color={COLORS.mint}
                />
              )}
            </View>
          </View>
        </View>
        <Text style={styles.singleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.story && (
          <Text style={styles.storyDescription} numberOfLines={2}>
            {item.story}
          </Text>
        )}
        <View style={styles.locationDistanceRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={14}
            color={COLORS.textSecondary}
          />
          <Text style={styles.locationText}>
            {item.location?.city || 'Unknown'}
          </Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.distanceText}>
            {item.distance || '?'} km away
          </Text>
        </View>
        <Text style={styles.priceValue}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Grid Card
  const renderGridCard = (item: Moment, index: number) => (
    <View
      key={item.id}
      style={index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight}
    >
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => handleMomentPress(item)}
        activeOpacity={0.95}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
        <View style={styles.gridContent}>
          <View style={styles.gridCreatorRow}>
            <Image
              source={{
                uri: item.user?.avatar || 'https://via.placeholder.com/24',
              }}
              style={styles.gridAvatar}
            />
            <Text style={styles.gridCreatorName} numberOfLines={1}>
              {item.user?.name?.split(' ')[0] || 'Anon'}
            </Text>
            {item.user?.isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={10}
                color={COLORS.mint}
              />
            )}
          </View>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.story && (
            <Text style={styles.gridStory} numberOfLines={1}>
              {item.story}
            </Text>
          )}
          <View style={styles.gridFooter}>
            <View style={styles.gridLocationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={10}
                color={COLORS.textSecondary}
              />
              <Text style={styles.gridDistance}>{item.distance || '?'} km</Text>
            </View>
            <Text style={styles.gridPrice}>${item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.locationButton}
          activeOpacity={0.7}
          onPress={() => setShowLocationModal(true)}
        >
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={COLORS.mint}
          />
          <Text style={styles.headerLocationText}>{selectedLocation}</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() =>
              navigation.navigate('Requests', { initialTab: 'notifications' })
            }
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color={COLORS.text}
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={22}
              color={COLORS.text}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 50;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Stories */}
        <FlatList
          data={USER_STORIES}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}
          scrollEnabled={true}
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
            >
              <MaterialCommunityIcons
                name="square-outline"
                size={18}
                color={
                  viewMode === 'single' ? COLORS.white : COLORS.textSecondary
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'grid' && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode('grid')}
            >
              <MaterialCommunityIcons
                name="view-grid-outline"
                size={18}
                color={
                  viewMode === 'grid' ? COLORS.white : COLORS.textSecondary
                }
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
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Skeleton */}
        {loading && filteredMoments.length === 0 && !error && (
          <MomentsFeedSkeleton />
        )}

        {/* Moments List */}
        {!error &&
          filteredMoments.length > 0 &&
          (viewMode === 'single' ? (
            <View style={styles.singleListContainer}>
              {filteredMoments.map((moment) => renderSingleCard(moment))}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredMoments.map((moment, index) =>
                renderGridCard(moment, index),
              )}
            </View>
          ))}

        {/* Empty State */}
        {!loading && !error && filteredMoments.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="compass-off-outline"
              size={64}
              color={COLORS.gray[300]}
            />
            <Text style={styles.emptyTitle}>No moments found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters or location
            </Text>
          </View>
        )}

        {/* Load More Indicator */}
        {loading && filteredMoments.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadMoreText}>Loading more...</Text>
          </View>
        )}

        {/* Bottom Padding */}
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals - Using extracted components */}
      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        recentLocations={recentLocations}
        popularCities={POPULAR_CITIES}
        currentLocationName="San Francisco, CA"
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
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
          navigation.navigate('MomentDetail', {
            moment: {
              id: story.id,
              title: story.title,
              imageUrl: story.imageUrl,
              price: story.price,
              distance: story.distance,
              story: story.description,
              location: { city: story.location, country: '' },
              user: selectedStoryUser
                ? {
                    name: selectedStoryUser.name,
                    avatar: selectedStoryUser.avatar,
                  }
                : undefined,
              availability: [],
            } as unknown as Moment,
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
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 6,
    marginRight: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Stories
  storiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    backgroundColor: COLORS.surface,
  },
  storyCircleNew: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.transparent,
  },
  storyCircleSeen: {
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.transparent,
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  storyName: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 6,
    textAlign: 'center',
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

  // Single Card
  singleListContainer: {
    paddingHorizontal: 16,
  },
  singleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  singleImage: {
    width: '100%',
    height: 200,
  },
  singleContent: {
    padding: 16,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  singleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  storyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: COLORS.textSecondary,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.mint,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridItemLeft: {
    width: '50%',
    paddingRight: 6,
    marginBottom: 12,
  },
  gridItemRight: {
    width: '50%',
    paddingLeft: 6,
    marginBottom: 12,
  },
  gridCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridContent: {
    padding: 10,
  },
  gridCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  gridCreatorName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 17,
    marginBottom: 4,
  },
  gridStory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridDistance: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  gridPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.mint,
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
});

export default DiscoverScreen;
