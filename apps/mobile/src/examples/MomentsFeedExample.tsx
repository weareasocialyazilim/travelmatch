/**
 * Example: Moments Feed with Skeleton + Preload + Offline Cache
 * Using FlashList for optimal scroll performance
 */

import React from 'react';
import { RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FeedSkeleton, MomentCardSkeleton } from '../components/skeletons';
import { useImagePreload } from '../services/imagePreloader';
import { cacheKeys, CACHE_CONFIG } from '../services/offlineCache';

export function MomentsFeedScreen() {
  const { prefetchNextPage, prefetchMomentsImages } = useImagePreload();

  // Infinite query with offline support
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: cacheKeys.moments.feed(),
      queryFn: ({ pageParam = 0 }) => momentService.getFeed(pageParam),
      getNextPageParam: (lastPage) => lastPage.nextCursor,

      // Cache configuration
      staleTime: CACHE_CONFIG.moments.staleTime,
      cacheTime: CACHE_CONFIG.moments.cacheTime,

      // Prefetch images when data loads
      onSuccess: (data) => {
        const allMoments = data.pages.flatMap((page) => page.moments);
        prefetchMomentsImages(allMoments);
      },
    });

  // Flatten pages into single array
  const moments = data?.pages.flatMap((page) => page.moments) ?? [];

  // Handle scroll to bottom
  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  // Prefetch next page when approaching end
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;

    // Prefetch when 500px from bottom
    if (distanceFromBottom < 500 && hasNextPage && !isFetching) {
      const currentPage = data?.pages.length ?? 0;
      prefetchNextPage(currentPage, (page) => momentService.getFeed(page));
    }
  };

  // Show skeleton on initial load
  if (isLoading) {
    return <FeedSkeleton count={3} />;
  }

  return (
    <FlashList
      data={moments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MomentCard moment={item} />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      onScroll={handleScroll}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
      ListFooterComponent={
        isFetching && moments.length > 0 ? <MomentCardSkeleton /> : null
      }
    />
  );
}
