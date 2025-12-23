/**
 * Mock for expo-linear-gradient
 */
const React = require('react');

const LinearGradient = React.forwardRef((props, ref) => {
  const { children, style, colors, start, end, locations, ...rest } = props;
  return React.createElement(
    'View',
    {
      ref,
      style,
      testID: props.testID || 'linear-gradient',
      'data-colors': JSON.stringify(colors),
      'data-start': JSON.stringify(start),
      'data-end': JSON.stringify(end),
      'data-locations': JSON.stringify(locations),
      ...rest,
    },
    children,
  );
});

LinearGradient.displayName = 'LinearGradient';

module.exports = {
  LinearGradient,
};
