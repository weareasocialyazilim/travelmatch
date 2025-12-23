/**
 * FlatList Performance Helpers
 * Optimized configurations for different list types
 */

/**
 * Standard item heights for getItemLayout
 */
export const ITEM_HEIGHTS = {
  SMALL: 60, // Small list items (notifications, simple rows)
  MEDIUM: 120, // Medium cards (user cards, simple moments)
  LARGE: 420, // Large cards (moment cards, detailed items)
  CHAT_MESSAGE: 80, // Chat messages (average height)
  STORY_GRID: 240, // Story grid items
} as const;

// Performance settings without generic FlatListProps to avoid type conflicts
interface ListPerformanceConfig {
  removeClippedSubviews: boolean;
  initialNumToRender: number;
  maxToRenderPerBatch: number;
  windowSize: number;
  updateCellsBatchingPeriod: number;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  horizontal?: boolean;
  inverted?: boolean;
}

/**
 * Performance configuration for vertical lists
 */
export const VERTICAL_LIST_CONFIG: ListPerformanceConfig = {
  removeClippedSubviews: true,
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  windowSize: 5,
  updateCellsBatchingPeriod: 50,
  showsVerticalScrollIndicator: false,
};

/**
 * Performance configuration for horizontal lists
 */
export const HORIZONTAL_LIST_CONFIG: ListPerformanceConfig = {
  removeClippedSubviews: true,
  initialNumToRender: 5,
  maxToRenderPerBatch: 5,
  windowSize: 3,
  updateCellsBatchingPeriod: 50,
  showsHorizontalScrollIndicator: false,
  horizontal: true,
};

/**
 * Performance configuration for grid lists
 */
export const GRID_LIST_CONFIG: ListPerformanceConfig = {
  removeClippedSubviews: true,
  initialNumToRender: 6,
  maxToRenderPerBatch: 6,
  windowSize: 5,
  updateCellsBatchingPeriod: 50,
  showsVerticalScrollIndicator: false,
};

/**
 * Performance configuration for chat/message lists
 */
export const CHAT_LIST_CONFIG: ListPerformanceConfig = {
  removeClippedSubviews: true,
  initialNumToRender: 20,
  maxToRenderPerBatch: 10,
  windowSize: 7,
  updateCellsBatchingPeriod: 100,
  showsVerticalScrollIndicator: false,
  inverted: true,
};

/**
 * Create getItemLayout function for fixed height items
 */
export const createGetItemLayout = (itemHeight: number) => {
  return (_data: unknown, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });
};

/**
 * Default key extractor for items with 'id' property
 */
export const defaultKeyExtractor = <T extends { id: string | number }>(
  item: T,
  index: number,
): string => {
  return item.id?.toString() || index.toString();
};
