/**
 * Mock for @shopify/flash-list
 */
const React = require('react');
const { View, ScrollView } = require('react-native');

// FlashList mock that renders items directly for testing
const FlashList = React.forwardRef((props, ref) => {
  const {
    estimatedItemSize,
    testID,
    data = [],
    renderItem,
    keyExtractor,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    onEndReached,
    onEndReachedThreshold,
    refreshControl,
    contentContainerStyle,
    numColumns,
    ...restProps
  } = props;

  const renderItems = () => {
    if (!data || data.length === 0) {
      if (ListEmptyComponent) {
        return typeof ListEmptyComponent === 'function'
          ? React.createElement(ListEmptyComponent)
          : ListEmptyComponent;
      }
      return null;
    }

    return data.map((item, index) => {
      const key = keyExtractor
        ? keyExtractor(item, index)
        : item.id || item.key || String(index);
      return React.createElement(View, { key }, renderItem({ item, index }));
    });
  };

  return React.createElement(
    ScrollView,
    {
      testID,
      ref,
      contentContainerStyle,
    },
    ListHeaderComponent &&
      (typeof ListHeaderComponent === 'function'
        ? React.createElement(ListHeaderComponent)
        : ListHeaderComponent),
    refreshControl,
    renderItems(),
    ListFooterComponent &&
      (typeof ListFooterComponent === 'function'
        ? React.createElement(ListFooterComponent)
        : ListFooterComponent),
  );
});

FlashList.displayName = 'FlashList';

// Export MasonryFlashList as well
const MasonryFlashList = React.forwardRef((props, ref) => {
  const {
    estimatedItemSize,
    numColumns,
    testID,
    data = [],
    renderItem,
    keyExtractor,
    ...restProps
  } = props;

  return React.createElement(
    View,
    { testID },
    data.map((item, index) => {
      const key = keyExtractor
        ? keyExtractor(item, index)
        : item.id || item.key || String(index);
      return React.createElement(View, { key }, renderItem({ item, index }));
    }),
  );
});

MasonryFlashList.displayName = 'MasonryFlashList';

module.exports = {
  FlashList,
  MasonryFlashList,
};
