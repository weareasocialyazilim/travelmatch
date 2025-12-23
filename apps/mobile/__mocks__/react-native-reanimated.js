/**
 * Mock for react-native-reanimated
 */
const React = require('react');
const { View, Text } = require('react-native');

const Animated = {
  View: (props) => React.createElement(View, props),
  Text: (props) => React.createElement(Text, props),
  Image: (props) => React.createElement(View, props),
  ScrollView: (props) => React.createElement(View, props),
  FlatList: (props) => React.createElement(View, props),
  createAnimatedComponent: (Component) => Component,
};

// Worklet values
const useSharedValue = (initialValue) => ({
  value: initialValue,
});

const useAnimatedStyle = (styleCallback) => {
  try {
    return styleCallback();
  } catch {
    return {};
  }
};

const useAnimatedProps = (propsCallback) => {
  try {
    return propsCallback();
  } catch {
    return {};
  }
};

const useDerivedValue = (derivation) => ({
  value: typeof derivation === 'function' ? derivation() : derivation,
});

const useAnimatedReaction = () => {};
const useAnimatedScrollHandler = () => () => {};
const useAnimatedGestureHandler = () => () => {};

// Timing functions
const withTiming = (toValue) => toValue;
const withSpring = (toValue) => toValue;
const withDecay = (config) => config?.velocity || 0;
const withDelay = (delay, animation) => animation;
const withSequence = (...animations) => animations[animations.length - 1];
const withRepeat = (animation) => animation;
const cancelAnimation = () => {};
const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;

// Interpolation
const interpolate = (value, inputRange, outputRange) => {
  if (typeof value !== 'number') return outputRange[0];
  const clampedValue = Math.max(
    inputRange[0],
    Math.min(inputRange[inputRange.length - 1], value),
  );
  const inputIndex = inputRange.findIndex((v, i) => {
    return clampedValue >= v && clampedValue <= (inputRange[i + 1] ?? v);
  });
  return (
    outputRange[Math.min(inputIndex, outputRange.length - 1)] || outputRange[0]
  );
};

const interpolateColor = (value, inputRange, outputRange) => outputRange[0];

const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
  poly: () => (t) => t,
  sin: (t) => t,
  circle: (t) => t,
  exp: (t) => t,
  elastic: () => (t) => t,
  back: () => (t) => t,
  bounce: (t) => t,
  bezier: () => (t) => t,
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
};

// Layout animations
const Layout = {
  duration: () => Layout,
  springify: () => Layout,
  damping: () => Layout,
  stiffness: () => Layout,
  easing: () => Layout,
};

const FadeIn = Layout;
const FadeOut = Layout;
const FadeInUp = Layout;
const FadeInDown = Layout;
const FadeOutUp = Layout;
const FadeOutDown = Layout;
const SlideInLeft = Layout;
const SlideInRight = Layout;
const SlideOutLeft = Layout;
const SlideOutRight = Layout;
const ZoomIn = Layout;
const ZoomOut = Layout;
const BounceIn = Layout;
const BounceOut = Layout;
const FlipInXUp = Layout;
const FlipOutXUp = Layout;

// Gesture callbacks
const measure = () => null;
const scrollTo = () => {};

// Export everything
module.exports = {
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  withTiming,
  withSpring,
  withDecay,
  withDelay,
  withSequence,
  withRepeat,
  cancelAnimation,
  runOnJS,
  runOnUI,
  interpolate,
  interpolateColor,
  Extrapolation,
  Easing,
  Layout,
  FadeIn,
  FadeOut,
  FadeInUp,
  FadeInDown,
  FadeOutUp,
  FadeOutDown,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  FlipInXUp,
  FlipOutXUp,
  measure,
  scrollTo,
};
