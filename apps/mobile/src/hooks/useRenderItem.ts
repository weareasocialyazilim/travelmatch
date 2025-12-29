/**
 * useRenderItem Hook
 *
 * A performance optimization hook for FlashList/FlatList renderItem functions.
 * Ensures renderItem is properly memoized to prevent unnecessary re-renders.
 *
 * @example
 * ```tsx
 * const renderItem = useRenderItem(
 *   (item: Message) => <MessageBubble item={item} />,
 *   [] // dependencies
 * );
 *
 * return <FlashList data={messages} renderItem={renderItem} />;
 * ```
 */
import { useCallback, type DependencyList } from 'react';

type RenderItemInfo<T> = {
  item: T;
  index: number;
};

type RenderItemFunction<T> = (
  info: RenderItemInfo<T>,
) => React.ReactElement | null;

/**
 * Memoizes a renderItem function for use with FlashList/FlatList.
 *
 * @param renderFn - The render function that takes an item and returns a React element
 * @param deps - Dependencies that should trigger re-memoization when changed
 * @returns A memoized renderItem function
 */
export function useRenderItem<T>(
  renderFn: (item: T, index: number) => React.ReactElement | null,
  deps: DependencyList,
): RenderItemFunction<T> {
  return useCallback(
    ({ item, index }: RenderItemInfo<T>) => renderFn(item, index),
    deps,
  );
}

/**
 * Simplified version that only passes the item (not index)
 */
export function useRenderItemSimple<T>(
  renderFn: (item: T) => React.ReactElement | null,
  deps: DependencyList,
): RenderItemFunction<T> {
  return useCallback(({ item }: RenderItemInfo<T>) => renderFn(item), deps);
}

export default useRenderItem;
