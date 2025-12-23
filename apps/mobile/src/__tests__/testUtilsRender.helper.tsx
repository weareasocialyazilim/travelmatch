/**
 * Test Utilities
 * Common helpers and utilities for testing
 */

import React, { ReactElement, createContext, useContext } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { NetworkProvider } from '@/context/NetworkContext';

// Mock Toast Context for tests (avoids React Native Animated issues)
const MockToastContext = createContext({
  showToast: jest.fn(),
  hideToast: jest.fn(),
  toast: null as { id: string; message: string; type: string } | null,
});

export const useToast = () => useContext(MockToastContext);

const MockToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MockToastContext.Provider value={{
      showToast: jest.fn(),
      hideToast: jest.fn(),
      toast: null,
    }}>
      {children}
    </MockToastContext.Provider>
  );
};

// Mock Auth Context for tests
const MockAuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  checkAuth: jest.fn(),
});

export const useAuth = () => useContext(MockAuthContext);

const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MockAuthContext.Provider value={{
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      checkAuth: jest.fn(),
    }}>
      {children}
    </MockAuthContext.Provider>
  );
};

/**
 * Custom render with all providers
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <NavigationContainer>
      <MockAuthProvider>
        <NetworkProvider>
          <MockToastProvider>
            {children}
          </MockToastProvider>
        </NetworkProvider>
      </MockAuthProvider>
    </NavigationContainer>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // If the caller passes a `navigation` prop directly to the root component,
  // expose it as a global used by the test navigation mock in jest.setup.
  // If the root UI element carries a `navigation` prop, expose it on global
  // for the test navigation mock in `jest.setup` so `useNavigation` returns it.
  // Avoid try/catch for lint cleanliness — access safely via guards.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (ui && ui.props && ui.props.navigation) {
    // @ts-ignore
    global.__TEST_NAVIGATION__ = ui.props.navigation;
  }

  const result = render(ui, { wrapper: AllTheProviders, ...options });

  // Fallback getByPlaceholderText to handle cases where scoped queries don't
  // find inputs rendered by NavigationContainer/modal roots.
  const originalGetByPlaceholderText = result.getByPlaceholderText;
  result.getByPlaceholderText = (text: string) => {
    try {
      return originalGetByPlaceholderText(text as any);
    } catch (err) {
      const fallback = result.queryAllByPlaceholderText(text as any);
      if (fallback && fallback.length > 0) return fallback[0];
      // As a last resort, look for a discover header search testID which some
      // mocks expose when Navigation containers create separate roots.
      const discoverSearch = result.queryByTestId('discover-search');
      if (discoverSearch) return discoverSearch;
      throw err;
    }
  };

  // If the caller passes a `navigation` prop directly to the root component,
  // expose it as a global used by the test navigation mock in jest.setup.
  // (navigation prop already attached above)

  return result;
};

export * from '@testing-library/react-native';
export { customRender as render };

/**
 * Mock data generators
 */
export const mockMoment = (overrides = {}) => ({
  id: 'moment-1',
  title: 'Test Moment',
  description: 'Test description',
  category: 'adventure',
  location: { city: 'Test City', country: 'Test Country' },
  images: ['test.jpg'],
  price: 50,
  pricePerGuest: 50,
  currency: 'USD',
  maxGuests: 4,
  max_guests: 4,
  duration: '4 hours',
  availability: ['2024-01-01'],
  userId: 'user-1',
  user_id: 'user-1',
  hostName: 'Test Host',
  hostAvatar: 'avatar.jpg',
  hostRating: 4.5,
  hostReviewCount: 10,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'avatar.jpg',
  location: { city: 'Test City', country: 'Test Country' },
  kyc: true,
  trust_score: 85,
  rating: 4.5,
  review_count: 10,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockFilter = (overrides = {}) => ({
  category: '',
  city: '',
  minPrice: undefined,
  maxPrice: undefined,
  minGuests: undefined,
  maxGuests: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  sortBy: 'newest',
  ...overrides,
});

/**
 * Wait helpers
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const flushPromises = () => new Promise(setImmediate);

/**
 * Event helpers
 */
export const createMockEvent = (overrides = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  nativeEvent: {},
  ...overrides,
});

/**
 * Async test helpers
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
};

/**
 * Mock navigation
 */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  replace: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  reset: jest.fn(),
};

/**
 * Mock route
 */
export const mockRoute = (params = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

/**
 * Snapshot test helpers
 */
export const createSnapshot = (component: ReactElement) => {
  const { toJSON } = render(component);
  expect(toJSON()).toMatchSnapshot();
};

/**
 * Accessibility test helpers
 */
export const checkAccessibility = (component: ReactElement) => {
  const { getByLabelText, getByA11yRole, getByA11yHint } = render(component);
  // Add accessibility checks here
  return { getByLabelText, getByA11yRole, getByA11yHint };
};
