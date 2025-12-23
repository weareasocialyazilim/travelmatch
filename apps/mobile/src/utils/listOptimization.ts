/**
 * FlashList Performance Helpers
 * Optimized configurations for different list types
 * Using Shopify's FlashList for better scroll performance
 */

/**
 * Standard estimated item sizes for FlashList
 * These values represent the average height/width of list items
 */
export const ESTIMATED_ITEM_SIZES = {
  SMALL: 60, // Small list items (notifications, simple rows)
  MEDIUM: 120, // Medium cards (user cards, simple moments)
  LARGE: 420, // Large cards (moment cards, detailed items)
  CHAT_MESSAGE: 80, // Chat messages (average height)
  STORY_GRID: 240, // Story grid items
} as const;

/**
 * @deprecated Use ESTIMATED_ITEM_SIZES instead
 * Legacy name kept for backward compatibility
 */
export const ITEM_HEIGHTS = ESTIMATED_ITEM_SIZES;

/**
 * FlashList performance configuration
 * FlashList handles most optimizations automatically
 */
interface FlashListConfig {
  estimatedItemSize: number;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  horizontal?: boolean;
  inverted?: boolean;
}

/**
 * Performance configuration for vertical lists with FlashList
 */
export const VERTICAL_FLASH_LIST_CONFIG: FlashListConfig = {
  estimatedItemSize: ESTIMATED_ITEM_SIZES.MEDIUM,
  showsVerticalScrollIndicator: false,
};

/**
 * Performance configuration for horizontal lists with FlashList
 */
export const HORIZONTAL_FLASH_LIST_CONFIG: FlashListConfig = {
  estimatedItemSize: ESTIMATED_ITEM_SIZES.MEDIUM,
  showsHorizontalScrollIndicator: false,
  horizontal: true,
};

/**
 * Performance configuration for grid lists with FlashList
 */
export const GRID_FLASH_LIST_CONFIG: FlashListConfig = {
  estimatedItemSize: ESTIMATED_ITEM_SIZES.STORY_GRID,
  showsVerticalScrollIndicator: false,
};

/**
 * Performance configuration for chat/message lists with FlashList
 */
export const CHAT_FLASH_LIST_CONFIG: FlashListConfig = {
  estimatedItemSize: ESTIMATED_ITEM_SIZES.CHAT_MESSAGE,
  showsVerticalScrollIndicator: false,
  inverted: true,
};

/**
 * @deprecated Use FlashList configs instead (VERTICAL_FLASH_LIST_CONFIG, etc.)
 * Legacy FlatList configuration - kept for backward compatibility
 */
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
 * @deprecated Use VERTICAL_FLASH_LIST_CONFIG instead
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
 * @deprecated Use HORIZONTAL_FLASH_LIST_CONFIG instead
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
 * @deprecated Use GRID_FLASH_LIST_CONFIG instead
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
 * @deprecated Use CHAT_FLASH_LIST_CONFIG instead
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
 * @deprecated FlashList doesn't use getItemLayout. Use estimatedItemSize prop instead.
 * Create getItemLayout function for fixed height items (FlatList only)
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
 * Works with both FlatList and FlashList
 */
export const defaultKeyExtractor = <T extends { id: string | number }>(
  item: T,
  index: number,
): string => {
  return item.id?.toString() || index.toString();
};
