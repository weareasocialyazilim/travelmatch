/**
 * Optimized FlatList Component
 * Pre-configured FlatList with performance optimizations
 */
import React, { memo, useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  type FlatListProps,
  type ViewToken,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';

// Default keyExtractor
const defaultKeyExtractor = <T extends { id?: string | number }>(
  item: T,
  index: number,
): string => {
  return item.id?.toString() ?? index.toString();
};

// Optimized item layout calculator for fixed height items
export const getItemLayout = (itemHeight: number, separatorHeight = 0) => {
  return (_data: unknown, index: number) => ({
    length: itemHeight + separatorHeight,
    offset: (itemHeight + separatorHeight) * index,
    index,
  });
};

interface OptimizedFlatListProps<T> extends Omit<
  FlatListProps<T>,
  'keyExtractor'
> {
  /** Fixed item height for getItemLayout optimization */
  itemHeight?: number;
  /** Separator height if using ItemSeparatorComponent */
  separatorHeight?: number;
  /** Custom key extractor, defaults to using item.id or index */
  keyExtractor?: (item: T, index: number) => string;
  /** Enable pull to refresh */
  onRefresh?: () => void;
  /** Is refreshing */
  refreshing?: boolean;
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
    itemHeight,
    separatorHeight = 0,
    keyExtractor = defaultKeyExtractor,
    onRefresh,
    refreshing = false,
    isLoadingMore = false,
    emptyMessage = 'No items found',
    emptyTitle = 'Nothing here yet',
    onViewableItemsChanged,
    ...props
  }: OptimizedFlatListProps<T>,
  ref: React.Ref<FlatList<T>>,
) {
  // Memoized getItemLayout for fixed height items
  const memoizedGetItemLayout = useMemo(() => {
    if (itemHeight) {
      return getItemLayout(itemHeight, separatorHeight);
    }
    return undefined;
  }, [itemHeight, separatorHeight]);

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
    <FlatList
      ref={ref}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={memoizedGetItemLayout}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      // Pull to refresh
      onRefresh={onRefresh}
      refreshing={refreshing}
      // Viewability tracking
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      // Components
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      // Accessibility
      accessible={true}
      accessibilityRole="list"
      {...props}
    />
  );
}

// Forward ref with generic type support
export const OptimizedFlatList = memo(
  React.forwardRef(OptimizedFlatListInner),
) as <T extends { id?: string | number }>(
  props: OptimizedFlatListProps<T> & { ref?: React.Ref<FlatList<T>> },
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
