/**
 * Mock for @react-navigation/native
 */
const React = require('react');

// Mock ServerContainer for SSR/testing
const ServerContainer = ({ children }) => children;

const NavigationContext = React.createContext({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getState: jest.fn(() => ({
    routes: [],
    index: 0,
  })),
  getParent: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
});

const NavigationContainer = React.forwardRef(
  ({ children, onReady, onStateChange }, ref) => {
    // Simulate ready state
    React.useEffect(() => {
      if (onReady) {
        onReady();
      }
    }, [onReady]);

    // Expose ref methods
    React.useImperativeHandle(ref, () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      dispatch: jest.fn(),
      getRootState: jest.fn(() => ({ routes: [], index: 0 })),
      isReady: jest.fn(() => true),
      getCurrentRoute: jest.fn(() => ({ name: 'TestScreen', params: {} })),
      getCurrentOptions: jest.fn(() => ({})),
    }));

    return React.createElement(
      NavigationContext.Provider,
      {
        value: {
          navigate: jest.fn(),
          goBack: jest.fn(),
          reset: jest.fn(),
          setParams: jest.fn(),
          dispatch: jest.fn(),
          isFocused: jest.fn(() => true),
          canGoBack: jest.fn(() => true),
          getState: jest.fn(() => ({ routes: [], index: 0 })),
          getParent: jest.fn(),
          addListener: jest.fn(() => jest.fn()),
          removeListener: jest.fn(),
        },
      },
      children,
    );
  },
);

NavigationContainer.displayName = 'NavigationContainer';

const useNavigation = () => {
  // Support per-test navigation object via global
  if (global.__TEST_NAVIGATION__) {
    return global.__TEST_NAVIGATION__;
  }
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    replace: jest.fn(),
    setParams: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getState: jest.fn(() => ({ routes: [], index: 0 })),
    getParent: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
  };
};

const useRoute = () => ({
  key: 'test-route',
  name: 'TestScreen',
  params: {},
});

const useFocusEffect = (callback) => {
  const React = require('react');
  React.useEffect(() => {
    const cleanup = callback();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);
};

const useIsFocused = () => true;

const useLinkTo = () => jest.fn();

const useNavigationState = (selector) => selector({ routes: [], index: 0 });

const createNavigationContainerRef = () => ({
  current: null,
  isReady: jest.fn(() => true),
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  getRootState: jest.fn(() => ({ routes: [], index: 0 })),
});

module.exports = {
  NavigationContainer,
  NavigationContext,
  ServerContainer,
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocused,
  useLinkTo,
  useNavigationState,
  createNavigationContainerRef,
  // Theme support
  useTheme: () => ({
    dark: false,
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#000000',
      border: '#E5E5E5',
      notification: '#FF3B30',
    },
  }),
  ThemeProvider: ({ children }) => children,
  DefaultTheme: {
    dark: false,
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#000000',
      border: '#E5E5E5',
      notification: '#FF3B30',
    },
  },
  DarkTheme: {
    dark: true,
    colors: {
      primary: '#0A84FF',
      background: '#000000',
      card: '#1C1C1E',
      text: '#FFFFFF',
      border: '#38383A',
      notification: '#FF453A',
    },
  },
  // Link handling
  Link: ({ children, to, ...props }) =>
    React.createElement('a', { href: to, ...props }, children),
  useLinkProps: ({ to }) => ({
    href: to,
    onPress: jest.fn(),
    accessibilityRole: 'link',
  }),
  useLinkBuilder: () => ({
    buildHref: jest.fn((name) => `/${name}`),
    buildAction: jest.fn(),
  }),
  CommonActions: {
    navigate: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
    setParams: jest.fn(),
  },
  StackActions: {
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    replace: jest.fn(),
  },
  TabActions: {
    jumpTo: jest.fn(),
  },
  DrawerActions: {
    openDrawer: jest.fn(),
    closeDrawer: jest.fn(),
    toggleDrawer: jest.fn(),
  },
  createStaticNavigation: jest.fn(),
  // Native stack utils
  usePreventRemove: jest.fn(),
  usePreventRemoveContext: () => ({ preventRemove: jest.fn() }),
};
