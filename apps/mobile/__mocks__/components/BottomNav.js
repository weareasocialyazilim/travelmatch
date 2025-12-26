/**
 * Mock for BottomNav component
 * Used in Jest tests to avoid rendering the actual navigation component
 */
const React = require('react');
const { View } = require('react-native');

const MockBottomNav = () => {
  return React.createElement(View, { testID: 'bottom-nav' });
};

module.exports = MockBottomNav;
module.exports.default = MockBottomNav;
