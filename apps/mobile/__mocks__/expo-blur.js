// Mock expo-blur for Jest tests
const React = require('react');
const { View } = require('react-native');

const BlurView = React.forwardRef((props, ref) => {
  const { children, intensity, tint, style, ...rest } = props;
  return React.createElement(
    View,
    {
      ref,
      style: [{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }, style],
      testID: props.testID || 'blur-view',
      'data-intensity': intensity,
      'data-tint': tint,
      ...rest,
    },
    children,
  );
});

BlurView.displayName = 'BlurView';

module.exports = {
  __esModule: true,
  BlurView,
  default: BlurView,
};
