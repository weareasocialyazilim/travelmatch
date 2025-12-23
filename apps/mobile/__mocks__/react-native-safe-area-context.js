/**
 * Mock for react-native-safe-area-context
 */
const React = require('react');
const { View } = require('react-native');

const SafeAreaProvider = ({ children }) => {
  return React.createElement(View, { testID: 'safe-area-provider' }, children);
};

const SafeAreaView = React.forwardRef(
  ({ children, style, edges, ...props }, ref) => {
    return React.createElement(
      View,
      { ref, style, testID: 'safe-area-view', ...props },
      children,
    );
  },
);
SafeAreaView.displayName = 'SafeAreaView';

const SafeAreaInsetsContext = React.createContext({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

const useSafeAreaInsets = () => ({
  top: 44,
  right: 0,
  bottom: 34,
  left: 0,
});

const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: 390,
  height: 844,
});

const initialWindowMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

const SafeAreaFrameContext = React.createContext({
  x: 0,
  y: 0,
  width: 390,
  height: 844,
});

module.exports = {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
  withSafeAreaInsets: (Component) => Component,
};
