/**
 * Shared React Native mock for Jest tests
 * This comprehensive mock is used by all packages in the monorepo
 */
const React = require('react');

const createMockComponent = (name) => {
  const Component = React.forwardRef((props, ref) => {
    return React.createElement(name, { ...props, ref }, props.children);
  });
  Component.displayName = name;
  return Component;
};

const mockViewComponent = () => {
  const Component = React.forwardRef((props, ref) => {
    return React.createElement('View', { ...props, ref }, props.children);
  });
  Component.displayName = 'View';
  return Component;
};

const mockTextComponent = () => createMockComponent('Text');

const mockTouchableComponent = (name) => {
  const Component = React.forwardRef((props, ref) => {
    const handlePress = () => {
      if (props.onPress) props.onPress();
    };
    return React.createElement(
      name,
      { ...props, ref, onClick: handlePress },
      props.children,
    );
  });
  Component.displayName = name;
  return Component;
};

// Animated mock
const mockAnimatedValue = jest.fn((value) => ({
  setValue: jest.fn(),
  setOffset: jest.fn(),
  flattenOffset: jest.fn(),
  extractOffset: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
  interpolate: jest.fn(() => value),
  animate: jest.fn(),
  _value: value,
}));

const createMockAnimation = () => ({
  start: jest.fn((callback) => callback && callback({ finished: true })),
  stop: jest.fn(),
  reset: jest.fn(),
});

const Animated = {
  View: createMockComponent('Animated.View'),
  Text: createMockComponent('Animated.Text'),
  Image: createMockComponent('Animated.Image'),
  ScrollView: createMockComponent('Animated.ScrollView'),
  Value: mockAnimatedValue,
  ValueXY: jest.fn(() => ({
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    x: { _value: 0 },
    y: { _value: 0 },
  })),
  timing: jest.fn(() => createMockAnimation()),
  spring: jest.fn(() => createMockAnimation()),
  decay: jest.fn(() => createMockAnimation()),
  sequence: jest.fn(() => createMockAnimation()),
  parallel: jest.fn(() => createMockAnimation()),
  stagger: jest.fn(() => createMockAnimation()),
  loop: jest.fn(() => createMockAnimation()),
  event: jest.fn(),
  createAnimatedComponent: (Component) => Component,
  add: jest.fn(),
  subtract: jest.fn(),
  divide: jest.fn(),
  multiply: jest.fn(),
  modulo: jest.fn(),
  diffClamp: jest.fn(),
};

module.exports = {
  // Core View Components
  View: mockViewComponent(),
  Text: mockTextComponent(),
  Image: createMockComponent('Image'),
  ScrollView: createMockComponent('ScrollView'),
  FlatList: createMockComponent('FlatList'),
  SectionList: createMockComponent('SectionList'),
  SafeAreaView: createMockComponent('SafeAreaView'),

  // Input Components
  TextInput: createMockComponent('TextInput'),
  Switch: createMockComponent('Switch'),

  // Touchable Components
  TouchableOpacity: mockTouchableComponent('TouchableOpacity'),
  TouchableHighlight: mockTouchableComponent('TouchableHighlight'),
  TouchableWithoutFeedback: mockTouchableComponent('TouchableWithoutFeedback'),
  Pressable: mockTouchableComponent('Pressable'),

  // Other Components
  ActivityIndicator: createMockComponent('ActivityIndicator'),
  Modal: createMockComponent('Modal'),
  RefreshControl: createMockComponent('RefreshControl'),
  StatusBar: createMockComponent('StatusBar'),
  KeyboardAvoidingView: createMockComponent('KeyboardAvoidingView'),

  // Animated
  Animated,

  // StyleSheet
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) =>
      Array.isArray(style) ? Object.assign({}, ...style) : style,
    compose: (...styles) => Object.assign({}, ...styles),
    hairlineWidth: 1,
    absoluteFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },

  // Dimensions
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667, scale: 2, fontScale: 1 })),
    set: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },

  // PixelRatio
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => Math.round(size)),
  },

  // Platform
  Platform: {
    OS: 'ios',
    Version: '14.0',
    select: jest.fn((obj) => obj.ios || obj.default),
    isPad: false,
    isTV: false,
    isTesting: true,
  },

  // I18nManager
  I18nManager: {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
    swapLeftAndRightInRTL: jest.fn(),
    doLeftAndRightSwapInRTL: false,
  },

  // Easing
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    quad: (t) => t * t,
    cubic: (t) => t * t * t,
    poly: () => (t) => t,
    sin: (t) => 1 - Math.cos((t * Math.PI) / 2),
    circle: (t) => 1 - Math.sqrt(1 - t * t),
    exp: (t) => Math.pow(2, 10 * (t - 1)),
    elastic: () => (t) => t,
    back: () => (t) => t,
    bounce: (t) => t,
    bezier: () => (t) => t,
    in: (easing) => easing,
    out: (easing) => (t) => 1 - easing(1 - t),
    inOut: (easing) => (t) =>
      t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2,
  },

  // Keyboard
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    dismiss: jest.fn(),
    scheduleLayoutAnimation: jest.fn(),
  },

  // AppState
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },

  // Linking
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },

  // Alert
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },

  // Share
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
  },

  // Vibration
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },

  // BackHandler
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  },

  // PermissionsAndroid
  PermissionsAndroid: {
    check: jest.fn(() => Promise.resolve(true)),
    request: jest.fn(() => Promise.resolve('granted')),
    requestMultiple: jest.fn(() => Promise.resolve({})),
    PERMISSIONS: {},
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
  },

  // UIManager
  UIManager: {
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    setLayoutAnimationEnabledExperimental: jest.fn(),
    getViewManagerConfig: jest.fn(() => ({})),
  },

  // NativeModules
  NativeModules: {},

  // PanResponder
  PanResponder: {
    create: jest.fn(() => ({ panHandlers: {} })),
  },

  // NativeEventEmitter
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  })),

  // AccessibilityInfo
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
  },

  // InteractionManager
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => {
      callback && callback();
      return { cancel: jest.fn() };
    }),
    createInteractionHandle: jest.fn(() => 1),
    clearInteractionHandle: jest.fn(),
  },

  // LayoutAnimation
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
    Types: {},
    Properties: {},
    Presets: {
      easeInEaseOut: {},
      linear: {},
      spring: {},
    },
  },

  // Appearance
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
    removeChangeListener: jest.fn(),
  },

  // Clipboard
  Clipboard: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(),
  },

  // useColorScheme and useWindowDimensions
  useColorScheme: jest.fn(() => 'light'),
  useWindowDimensions: jest.fn(() => ({
    width: 375,
    height: 667,
    scale: 2,
    fontScale: 1,
  })),

  // findNodeHandle
  findNodeHandle: jest.fn(() => 1),

  // processColor
  processColor: jest.fn((color) => color),

  // requireNativeComponent
  requireNativeComponent: jest.fn((name) => createMockComponent(name)),
};
