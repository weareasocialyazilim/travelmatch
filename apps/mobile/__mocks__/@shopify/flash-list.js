/**
 * Mock for @shopify/flash-list
 */
const React = require('react');
const { FlatList } = require('react-native');

// FlashList mock that delegates to FlatList
const FlashList = React.forwardRef((props, ref) => {
  const { estimatedItemSize, ...flatListProps } = props;
  return React.createElement(FlatList, { ...flatListProps, ref });
});

FlashList.displayName = 'FlashList';

// Export MasonryFlashList as well
const MasonryFlashList = React.forwardRef((props, ref) => {
  const { estimatedItemSize, numColumns, ...flatListProps } = props;
  return React.createElement(FlatList, {
    ...flatListProps,
    ref,
    numColumns: numColumns || 2,
  });
});

MasonryFlashList.displayName = 'MasonryFlashList';

module.exports = {
  FlashList,
  MasonryFlashList,
};
