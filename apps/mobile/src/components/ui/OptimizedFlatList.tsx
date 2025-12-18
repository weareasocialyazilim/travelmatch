/**
 * Optimized FlashList Component
 * Pre-configured FlashList with performance optimizations
 * Using Shopify's FlashList for better scroll performance
 */
import React, { memo, useCallback, useMemo, useRef } from 'react';
import {
  type ViewToken,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FlashList, type FlashListProps } from '@shopify/flash-list';
import { COLORS } from '../../constants/colors';

// Default keyExtractor
const defaultKeyExtractor = <T extends { id?: string | number }>(
  item: T,
  index: number,
): string => {
  return item.id?.toString() ?? index.toString();
};

interface OptimizedFlatListProps<T>
  extends Omit<FlashListProps<T>, 'estimatedItemSize'> {
  /** Estimated item size (height for vertical, width for horizontal) - REQUIRED for FlashList */
  estimatedItemSize?: number;
  /** Loading more indicator */
  isLoadingMore?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state title */
  emptyTitle?: string;
  /** Track viewability for analytics */
  onViewableItemsChanged?: (info: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => void;
}

function OptimizedFlatListInner<T extends { id?: string | number }>(
  {
    data,
    renderItem,
    estimatedItemSize = 80,
    keyExtractor = defaultKeyExtractor,
    onRefresh,
    refreshing = false,
    isLoadingMore = false,
    emptyMessage = 'No items found',
    emptyTitle = 'Nothing here yet',
    onViewableItemsChanged,
    ...props
  }: OptimizedFlatListProps<T>,
  ref: React.Ref<FlashList<T>>,
) {
  // Viewability config
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  // Memoized empty component
  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    ),
    [emptyTitle, emptyMessage],
  );

  // Memoized footer component for loading more
  const ListFooterComponent = useCallback(
    () =>
      isLoadingMore ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : null,
    [isLoadingMore],
  );

  return (
    <FlashList
      ref={ref}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={estimatedItemSize}
      // Pull to refresh
      onRefresh={onRefresh}
      refreshing={refreshing}
      // Viewability tracking
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      // Components
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      {...props}
    />
  );
}

// Forward ref with generic type support
export const OptimizedFlatList = memo(
  React.forwardRef(OptimizedFlatListInner),
) as <T extends { id?: string | number }>(
  props: OptimizedFlatListProps<T> & { ref?: React.Ref<FlashList<T>> },
) => React.ReactElement;

/**
 * Hook for optimized list item rendering
 * Returns memoized renderItem function
 */
export function useOptimizedRenderItem<T>(
  Component: React.ComponentType<{ item: T; index: number }>,
  deps: React.DependencyList = [],
) {
  return useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <Component item={item} index={index} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );
}

/**
 * Hook for infinite scroll with pagination
 */
export function useInfiniteScroll<T>({
  data,
  hasMore,
  loadMore,
  threshold = 0.5,
}: {
  data: T[];
  hasMore: boolean;
  loadMore: () => void;
  threshold?: number;
}) {
  const loadingMore = useRef(false);

  const onEndReached = useCallback(() => {
    if (!loadingMore.current && hasMore && data.length > 0) {
      loadingMore.current = true;
      loadMore();
      // Reset after a delay to prevent multiple calls
      setTimeout(() => {
        loadingMore.current = false;
      }, 1000);
    }
  }, [hasMore, loadMore, data.length]);

  return {
    onEndReached,
    onEndReachedThreshold: threshold,
  };
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});

export default OptimizedFlatList;
