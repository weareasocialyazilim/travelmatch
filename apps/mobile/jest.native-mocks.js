/**
 * Comprehensive React Native Native Module Mocks
 *
 * Purpose: Mock React Native's native infrastructure (UIManager, ViewManager, etc.)
 * to enable component testing in Jest environment.
 *
 * Background: React Native components require native modules (ViewManager, UIManager)
 * for rendering. Jest doesn't provide these by default, causing:
 * "Cannot set properties of null (setting 'getViewManagerConfig')"
 *
 * This file provides complete native infrastructure mocking.
 */

// Define __DEV__ immediately before any imports that might use it
if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = true;
}

const React = require('react');

// ============================================================================
// UIManager - React Native's native view management system
// ============================================================================

const mockUIManager = {
  measure: jest.fn((node, callback) => {
    callback(0, 0, 100, 100, 0, 0); // x, y, width, height, pageX, pageY
  }),
  measureInWindow: jest.fn((node, callback) => {
    callback(0, 0, 100, 100);
  }),
  measureLayout: jest.fn((node, relativeToNativeNode, onFail, onSuccess) => {
    onSuccess(0, 0, 100, 100);
  }),
  measureLayoutRelativeToParent: jest.fn((node, onFail, onSuccess) => {
    onSuccess(0, 0, 100, 100);
  }),
  setLayoutAnimationEnabledExperimental: jest.fn(),

  // ViewManager config - Returns empty config for any view component
  getViewManagerConfig: jest.fn((viewManagerName) => {
    return {
      Commands: {},
      Constants: {},
      bubblingEventTypes: {},
      directEventTypes: {},
    };
  }),

  // Additional UIManager methods
  blur: jest.fn(),
  focus: jest.fn(),
  createView: jest.fn(),
  updateView: jest.fn(),
  manageChildren: jest.fn(),
  setChildren: jest.fn(),
  removeSubviewsFromContainerWithID: jest.fn(),
  replaceExistingNonRootView: jest.fn(),
  dispatchViewManagerCommand: jest.fn(),

  // Layout animation
  configureNextLayoutAnimation: jest.fn((config, onComplete) => {
    onComplete && onComplete();
  }),

  // View hierarchy
  __takeSnapshot: jest.fn(),
  findSubviewIn: jest.fn(),
  viewIsDescendantOf: jest.fn(() => false),

  // Custom direct event types (for event handling)
  customDirectEventTypes: {},
  customBubblingEventTypes: {},

  // Constants
  getConstants: jest.fn(() => ({
    customDirectEventTypes: {},
    customBubblingEventTypes: {},
  })),
};

jest.mock('react-native/Libraries/ReactNative/UIManager', () => mockUIManager);

// ============================================================================
// NativeModules - Core React Native modules
// ============================================================================

const mockNativeModules = {
  // UI Manager reference
  UIManager: mockUIManager,

  // Platform constants
  PlatformConstants: {
    isTesting: true,
    reactNativeVersion: { major: 0, minor: 76, patch: 5 },
    forceTouchAvailable: false,
    osVersion: '14.0',
    systemName: 'iOS',
    interfaceIdiom: 'phone',
  },

  // Networking
  Networking: {
    sendRequest: jest.fn(),
    abortRequest: jest.fn(),
    clearCookies: jest.fn(),
  },

  // Status bar
  StatusBarManager: {
    getHeight: jest.fn((callback) => callback({ height: 20 })),
    setColor: jest.fn(),
    setStyle: jest.fn(),
    setHidden: jest.fn(),
    setNetworkActivityIndicatorVisible: jest.fn(),
  },

  // Keyboard
  KeyboardObserver: {
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },

  // Appearance
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },

  // DeviceInfo (already mocked in TurboModuleRegistry, but backup here)
  DeviceInfo: {
    getConstants: jest.fn(() => ({
      Dimensions: {
        window: { width: 375, height: 667, scale: 2, fontScale: 1 },
        screen: { width: 375, height: 667, scale: 2, fontScale: 1 },
      },
    })),
  },

  // Image loader
  ImageLoader: {
    getSize: jest.fn((uri, success) => success(100, 100)),
    prefetchImage: jest.fn(() => Promise.resolve(true)),
    queryCache: jest.fn(() => Promise.resolve({})),
  },

  // Clipboard
  Clipboard: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(),
  },

  // Vibration
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },

  // Share
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
  },

  // Alert
  AlertManager: {
    alertWithArgs: jest.fn(),
  },

  // Animated
  NativeAnimatedModule: {
    createAnimatedNode: jest.fn(),
    startAnimatingNode: jest.fn(),
    stopAnimation: jest.fn(),
    setAnimatedNodeValue: jest.fn(),
    connectAnimatedNodes: jest.fn(),
    disconnectAnimatedNodes: jest.fn(),
    addAnimatedEventToView: jest.fn(),
    removeAnimatedEventFromView: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },

  // SettingsManager
  SettingsManager: {
    settings: {},
    setValues: jest.fn(),
    deleteValues: jest.fn(),
  },
};

// Mock NativeModules globally
jest.mock(
  'react-native/Libraries/BatchedBridge/NativeModules',
  () => mockNativeModules,
);

// ============================================================================
// TurboModuleRegistry - Mock for new architecture modules
// ============================================================================

const mockTurboModuleRegistry = {
  get: jest.fn((name) => {
    // Return mock modules based on name
    const modules = {
      DeviceInfo: {
        getConstants: jest.fn(() => ({
          Dimensions: {
            window: { width: 375, height: 667, scale: 2, fontScale: 1 },
            screen: { width: 375, height: 667, scale: 2, fontScale: 1 },
          },
        })),
      },
      PlatformConstants: {
        getConstants: jest.fn(() => ({
          isTesting: true,
          reactNativeVersion: { major: 0, minor: 83, patch: 0 },
        })),
      },
      SourceCode: {
        getConstants: jest.fn(() => ({
          scriptURL: 'http://localhost:8081/index.bundle',
        })),
      },
      NativeReactNativeFeatureFlagsCxx: {
        getConstants: jest.fn(() => ({})),
      },
      BackHandler: {
        getConstants: jest.fn(() => ({})),
        addEventListener: jest.fn(() => ({ remove: jest.fn() })),
        removeEventListener: jest.fn(),
        exitApp: jest.fn(),
      },
    };
    return (
      modules[name] || {
        getConstants: jest.fn(() => ({})),
      }
    );
  }),
  getEnforcing: jest.fn((name) => {
    return mockTurboModuleRegistry.get(name);
  }),
};

jest.mock(
  'react-native/Libraries/TurboModule/TurboModuleRegistry',
  () => mockTurboModuleRegistry,
);

// ============================================================================
// React Native Core Components - Mock native component implementations
// ============================================================================

/**
 * Create a mock React Native component that behaves like a native component
 * but renders in the Jest DOM environment
 */
const createMockComponent = (componentName, additionalProps = {}) => {
  const MockComponent = React.forwardRef((props, ref) => {
    // Separate children from other props
    const { children, ...otherProps } = props;

    // Create a basic element with the component name as the type
    // This allows React Testing Library to find and interact with it
    return React.createElement(
      componentName,
      {
        ...otherProps,
        ...additionalProps,
        ref,
        // Add testID if not present for easier testing
        testID: props.testID || componentName,
      },
      children,
    );
  });

  MockComponent.displayName = `Mock(${componentName})`;
  return MockComponent;
};

/**
 * Mock native View component with style support
 */
const mockViewComponent = () => {
  const ViewComponent = React.forwardRef((props, ref) => {
    const { children, style, ...otherProps } = props;

    // Flatten style arrays (React Native supports style arrays)
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;

    return React.createElement(
      'RCTView',
      {
        ...otherProps,
        style: flatStyle,
        ref,
      },
      children,
    );
  });

  ViewComponent.displayName = 'View';
  return ViewComponent;
};

/**
 * Mock ScrollView with scroll methods
 */
const mockScrollViewComponent = () => {
  const ScrollViewComponent = React.forwardRef((props, ref) => {
    const { children, style, contentContainerStyle, ...otherProps } = props;

    // ScrollView has both style and contentContainerStyle
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;

    // Expose scroll methods via ref
    React.useImperativeHandle(ref, () => ({
      scrollTo: jest.fn(),
      scrollToEnd: jest.fn(),
      flashScrollIndicators: jest.fn(),
    }));

    return React.createElement(
      'RCTScrollView',
      {
        ...otherProps,
        style: flatStyle,
      },
      React.createElement(
        'RCTScrollContentView',
        { style: contentContainerStyle },
        children,
      ),
    );
  });

  ScrollViewComponent.displayName = 'ScrollView';
  return ScrollViewComponent;
};

/**
 * Mock TextInput with focus/blur methods
 */
const mockTextInputComponent = () => {
  const TextInputComponent = React.forwardRef((props, ref) => {
    const { value, onChangeText, style, ...otherProps } = props;

    // Expose TextInput methods via ref
    React.useImperativeHandle(ref, () => ({
      focus: jest.fn(),
      blur: jest.fn(),
      clear: jest.fn(),
      isFocused: jest.fn(() => false),
    }));

    return React.createElement('RCTTextInput', {
      ...otherProps,
      value,
      onChange: (e) => {
        if (onChangeText) {
          onChangeText(e.nativeEvent.text);
        }
      },
      style,
      ref,
    });
  });

  TextInputComponent.displayName = 'TextInput';
  return TextInputComponent;
};

/**
 * Mock Image with load events
 */
const mockImageComponent = () => {
  const ImageComponent = React.forwardRef((props, ref) => {
    const { source, onLoad, onError, style, ...otherProps } = props;

    // Trigger onLoad in next tick to simulate async loading
    React.useEffect(() => {
      if (onLoad) {
        setTimeout(() => {
          onLoad({
            nativeEvent: {
              source: {
                width: 100,
                height: 100,
                url: typeof source === 'object' ? source.uri : source,
              },
            },
          });
        }, 0);
      }
    }, [source, onLoad]);

    return React.createElement('RCTImage', {
      ...otherProps,
      source: typeof source === 'object' ? source.uri : source,
      style,
      ref,
    });
  });

  ImageComponent.displayName = 'Image';

  // Add static methods
  ImageComponent.getSize = jest.fn((uri, success) => success(100, 100));
  ImageComponent.prefetch = jest.fn(() => Promise.resolve(true));
  ImageComponent.queryCache = jest.fn(() => Promise.resolve({}));

  return ImageComponent;
};

/**
 * Mock Touchable components with press handlers
 * Must work with @testing-library/react-native's fireEvent.press
 */
const mockTouchableComponent = (componentName) => {
  const TouchableComponent = React.forwardRef((props, ref) => {
    const {
      children,
      onPress,
      onPressIn,
      onPressOut,
      disabled,
      style,
      accessibilityLabel,
      accessibilityHint,
      accessibilityState,
      accessibilityRole,
      accessible = true,
      testID,
      ...otherProps
    } = props;

    // Create a wrapper that respects disabled state for fireEvent.press
    const handlePress = disabled ? undefined : onPress;

    // Build accessibility props
    const a11yProps = {
      accessible,
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole,
      accessibilityState: {
        disabled: disabled || false,
        ...accessibilityState,
      },
      testID,
    };

    return React.createElement(
      componentName,
      {
        ...otherProps,
        ...a11yProps,
        // Use onPress directly so fireEvent.press works
        onPress: handlePress,
        onPressIn,
        onPressOut,
        disabled,
        style,
        ref,
        'aria-label': accessibilityLabel,
        'aria-disabled': disabled,
        role: accessibilityRole,
      },
      children,
    );
  });

  TouchableComponent.displayName = componentName;
  return TouchableComponent;
};

// ============================================================================
// Mock react-native module with all components
// ============================================================================

// Mock Platform constants module FIRST
jest.mock(
  'react-native/Libraries/Utilities/NativePlatformConstantsIOS',
  () => ({
    __esModule: true,
    default: {
      getConstants: jest.fn(() => ({
        isTesting: true,
        reactNativeVersion: { major: 0, minor: 76, patch: 5 },
        forceTouchAvailable: false,
        osVersion: '14.0',
        systemName: 'iOS',
        interfaceIdiom: 'phone',
      })),
    },
  }),
);

jest.mock('react-native', () => {
  // Don't spread RN.Animated - create it from scratch
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

  const mockAnimatedValueXY = jest.fn(() => ({
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    stopAnimation: jest.fn(),
    resetAnimation: jest.fn(),
    getLayout: jest.fn(() => ({ left: 0, top: 0 })),
    getTranslateTransform: jest.fn(() => []),
    x: { _value: 0 },
    y: { _value: 0 },
  }));

  // Create a mock animation object that properly supports chaining
  const createMockAnimation = () => {
    const animation = {
      start: jest.fn((callback) => {
        if (callback) callback({ finished: true });
        return animation; // Return self for chaining
      }),
      stop: jest.fn(),
      reset: jest.fn(),
    };
    return animation;
  };

  const mockAnimated = {
    View: createMockComponent('RCTAnimatedView'),
    Text: createMockComponent('RCTAnimatedText'),
    Image: createMockComponent('RCTAnimatedImage'),
    ScrollView: createMockComponent('RCTAnimatedScrollView'),
    Value: mockAnimatedValue,
    ValueXY: mockAnimatedValueXY,
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

  return {
    // Core View Components
    View: mockViewComponent(),
    Text: createMockComponent('RCTText'),
    Image: mockImageComponent(),
    ScrollView: mockScrollViewComponent(),
    FlatList: createMockComponent('RCTFlatList'),
    SectionList: createMockComponent('RCTSectionList'),

    // Input Components
    TextInput: mockTextInputComponent(),
    Switch: createMockComponent('RCTSwitch'),

    // Touchable Components
    TouchableOpacity: mockTouchableComponent('RCTTouchableOpacity'),
    TouchableHighlight: mockTouchableComponent('RCTTouchableHighlight'),
    TouchableWithoutFeedback: mockTouchableComponent(
      'RCTTouchableWithoutFeedback',
    ),
    Pressable: mockTouchableComponent('RCTPressable'),
    // PanResponder is used by bottom sheets and draggable components; provide minimal mock
    PanResponder: {
      create: jest.fn(() => ({ panHandlers: {} })),
    },

    // Other Components
    ActivityIndicator: createMockComponent('RCTActivityIndicator'),
    Modal: createMockComponent('RCTModal'),
    RefreshControl: createMockComponent('RCTRefreshControl'),
    SafeAreaView: createMockComponent('RCTSafeAreaView'),
    StatusBar: createMockComponent('RCTStatusBar'),
    KeyboardAvoidingView: createMockComponent('RCTKeyboardAvoidingView'),

    // Platform
    Platform: {
      OS: 'ios',
      Version: 14,
      select: (obj) => obj.ios || obj.default,
      isTV: false,
      isTesting: true,
      constants: {
        isTesting: true,
        reactNativeVersion: { major: 0, minor: 76, patch: 5 },
        forceTouchAvailable: false,
        osVersion: '14.0',
        systemName: 'iOS',
        interfaceIdiom: 'phone',
      },
    },

    // Dimensions
    Dimensions: {
      get: jest.fn(
        (dim) =>
          ({
            window: { width: 375, height: 667, scale: 2, fontScale: 1 },
            screen: { width: 375, height: 667, scale: 2, fontScale: 1 },
          }[dim]),
      ),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },

    // PixelRatio
    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
      roundToNearestPixel: jest.fn((size) => Math.round(size * 2) / 2),
    },

    // StyleSheet
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => {
        if (!style) return {};
        if (!Array.isArray(style)) return style;
        return Object.assign({}, ...style.filter(Boolean));
      },
      compose: (style1, style2) => [style1, style2].filter(Boolean),
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
      hairlineWidth: 1,
    },

    // Animated - Use our mock instead of spreading RN.Animated
    Animated: mockAnimated,

    // Easing
    Easing: {
      linear: (t) => t,
      ease: (t) => t,
      quad: (t) => t * t,
      cubic: (t) => t * t * t,
      poly: (n) => (t) => Math.pow(t, n),
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

    // NativeModules
    NativeModules: mockNativeModules,

    // NativeEventEmitter
    NativeEventEmitter: jest.fn(() => ({
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      emit: jest.fn(),
    })),
  };
});

// ============================================================================
// ViewNativeComponent - Direct mock for native component infrastructure
// ============================================================================

jest.mock('react-native/Libraries/Components/View/ViewNativeComponent', () => {
  return {
    __esModule: true,
    default: mockViewComponent(),
  };
});

// ============================================================================
// Export mocks for testing use
// ============================================================================

module.exports = {
  mockUIManager,
  mockNativeModules,
  createMockComponent,
  mockViewComponent,
  mockScrollViewComponent,
  mockTextInputComponent,
  mockImageComponent,
  mockTouchableComponent,
};
