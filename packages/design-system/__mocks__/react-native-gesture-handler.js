// Mock react-native-gesture-handler for design-system tests
const GestureHandler = {
  Swipeable: 'Swipeable',
  DrawerLayout: 'DrawerLayout',
  State: {
    UNDETERMINED: 0,
    FAILED: 1,
    BEGAN: 2,
    CANCELLED: 3,
    ACTIVE: 4,
    END: 5,
  },
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  FlingGestureHandler: 'FlingGestureHandler',
  LongPressGestureHandler: 'LongPressGestureHandler',
  PinchGestureHandler: 'PinchGestureHandler',
  RotationGestureHandler: 'RotationGestureHandler',
  NativeViewGestureHandler: 'NativeViewGestureHandler',
  GestureHandlerRootView: ({ children }) => children,
  Directions: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
  gestureHandlerRootHOC: (component) => component,
  Gesture: {
    Pan: jest.fn(() => ({
      onStart: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
      enabled: jest.fn().mockReturnThis(),
    })),
    Tap: jest.fn(() => ({
      onStart: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
      enabled: jest.fn().mockReturnThis(),
    })),
    Pinch: jest.fn(() => ({
      onStart: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
    })),
    Rotation: jest.fn(() => ({
      onStart: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
    })),
    Simultaneous: jest.fn((...gestures) => gestures),
    Exclusive: jest.fn((...gestures) => gestures),
    Race: jest.fn((...gestures) => gestures),
  },
  GestureDetector: ({ children }) => children,
};

module.exports = GestureHandler;
module.exports.default = GestureHandler;
