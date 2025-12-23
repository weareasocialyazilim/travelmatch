/**
 * Mock for @react-navigation/native
 */
const React = require('react');

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

const NavigationContainer = ({ children }) => {
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
};

const useNavigation = () => {
  return {
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
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocused,
  useLinkTo,
  useNavigationState,
  createNavigationContainerRef,
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
};
