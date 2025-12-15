/**
 * Test Utilities
 * Common helpers and utilities for testing
 */

import React, { ReactElement, createContext, useContext } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ToastProvider } from '../context/ToastContext';

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
    <MockAuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </MockAuthProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

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
