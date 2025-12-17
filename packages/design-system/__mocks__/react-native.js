// Mock React Native for design-system package tests
const React = require('react');

const createComponent = (name) => {
  const Component = (props) => {
    return React.createElement(name, props, props.children);
  };
  Component.displayName = name;
  return Component;
};

module.exports = {
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    hairlineWidth: 1,
  },
  View: createComponent('View'),
  Text: createComponent('Text'),
  Image: createComponent('Image'),
  TouchableOpacity: createComponent('TouchableOpacity'),
  TouchableWithoutFeedback: createComponent('TouchableWithoutFeedback'),
  Pressable: createComponent('Pressable'),
  ScrollView: createComponent('ScrollView'),
  FlatList: createComponent('FlatList'),
  SafeAreaView: createComponent('SafeAreaView'),
  TextInput: createComponent('TextInput'),
  ActivityIndicator: createComponent('ActivityIndicator'),
  Modal: createComponent('Modal'),
  Switch: createComponent('Switch'),
  KeyboardAvoidingView: createComponent('KeyboardAvoidingView'),
  StatusBar: createComponent('StatusBar'),
  Animated: {
    View: createComponent('Animated.View'),
    Text: createComponent('Animated.Text'),
    Image: createComponent('Animated.Image'),
    ScrollView: createComponent('Animated.ScrollView'),
    FlatList: createComponent('Animated.FlatList'),
    createAnimatedComponent: (comp) => comp,
    timing: (value, config) => ({
      start: (callback) => callback && callback({ finished: true }),
    }),
    spring: (value, config) => ({
      start: (callback) => callback && callback({ finished: true }),
    }),
    decay: (value, config) => ({
      start: (callback) => callback && callback({ finished: true }),
    }),
    sequence: (animations) => ({
      start: (callback) => callback && callback({ finished: true }),
    }),
    parallel: (animations) => ({
      start: (callback) => callback && callback({ finished: true }),
    }),
    loop: (animation) => animation,
    delay: (time) => ({
      start: (callback) => callback && callback({ finished: true }),
    }),
    Value: jest.fn((init) => ({
      _value: init,
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      addListener: jest.fn(() => ''),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn((cb) => cb && cb(init)),
      interpolate: jest.fn(() => ({
        _value: init,
      })),
    })),
    ValueXY: jest.fn(() => ({
      x: { _value: 0 },
      y: { _value: 0 },
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      getLayout: jest.fn(() => ({ left: 0, top: 0 })),
      getTranslateTransform: jest.fn(() => [{ translateX: 0 }, { translateY: 0 }]),
    })),
    event: jest.fn(() => jest.fn()),
    diffClamp: jest.fn(() => ({ _value: 0 })),
  },
  Platform: {
    OS: 'ios',
    Version: 14,
    select: (obj) => obj.ios || obj.default,
    isPad: false,
    isTV: false,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812, scale: 3, fontScale: 1 }),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    set: jest.fn(),
  },
  useColorScheme: () => 'light',
  useWindowDimensions: () => ({ width: 375, height: 812, scale: 3, fontScale: 1 }),
  PixelRatio: {
    get: () => 3,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size) => size * 3,
    roundToNearestPixel: (size) => size,
  },
  NativeModules: {},
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeListeners: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    dismiss: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  Alert: {
    alert: jest.fn(),
  },
  Appearance: {
    getColorScheme: () => 'light',
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  I18nManager: {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
  },
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
  },
};
