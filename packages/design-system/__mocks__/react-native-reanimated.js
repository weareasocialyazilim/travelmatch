// Mock react-native-reanimated for design-system tests
const Reanimated = {
  default: {
    call: () => {},
    createAnimatedComponent: (component) => component,
    Value: jest.fn(() => ({
      setValue: jest.fn(),
    })),
  },
  useSharedValue: jest.fn((init) => ({ value: init })),
  useAnimatedStyle: jest.fn((cb) => cb()),
  useDerivedValue: jest.fn((cb) => ({ value: cb() })),
  useAnimatedProps: jest.fn((cb) => cb()),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
  withDelay: jest.fn((_, value) => value),
  withSequence: jest.fn((...values) => values[values.length - 1]),
  withRepeat: jest.fn((value) => value),
  cancelAnimation: jest.fn(),
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    bezier: jest.fn(() => jest.fn()),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
  interpolate: jest.fn((value) => value),
  Extrapolate: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity',
  },
  FadeIn: { duration: jest.fn().mockReturnThis() },
  FadeOut: { duration: jest.fn().mockReturnThis() },
  SlideInRight: { duration: jest.fn().mockReturnThis() },
  SlideOutRight: { duration: jest.fn().mockReturnThis() },
  Layout: { duration: jest.fn().mockReturnThis() },
};

module.exports = Reanimated;
module.exports.default = Reanimated;
