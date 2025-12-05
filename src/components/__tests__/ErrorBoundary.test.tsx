/**
 * ErrorBoundary Component Tests
 * Testing error catching, recovery, and different error levels
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  ErrorBoundary,
  AppErrorBoundary,
  NavigationErrorBoundary,
  ScreenErrorBoundary,
  ComponentErrorBoundary,
} from '../ErrorBoundary';

// Mock Sentry
jest.mock('../../config/sentry', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock constants
jest.mock('../../constants/colors', () => ({
  COLORS: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    error: '#EF4444',
    errorBackground: '#FEE2E2',
    softRed: '#DC2626',
    primary: '#3B82F6',
  },
}));

jest.mock('../../constants/layout', () => ({
  LAYOUT: {
    size: {
      errorButtonMin: 120,
      errorMessageMax: 300,
    },
  },
}));

jest.mock('../../constants/radii', () => ({
  radii: {
    md: 8,
    lg: 12,
  },
}));

jest.mock('../../constants/spacing', () => ({
  spacing: {
    md: 12,
    lg: 16,
    xl: 24,
  },
}));

jest.mock('../../constants/typography', () => ({
  TYPOGRAPHY: {
    h2: { fontSize: 24, fontWeight: '700' },
    body: { fontSize: 16 },
  },
}));

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal Rendering', () => {
    it('renders children when no error', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Child content</Text>
        </ErrorBoundary>,
      );

      expect(getByText('Child content')).toBeTruthy();
    });

    it('renders multiple children correctly', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>First child</Text>
          <Text>Second child</Text>
        </ErrorBoundary>,
      );

      expect(getByText('First child')).toBeTruthy();
      expect(getByText('Second child')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('catches errors and displays fallback UI', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(getByText('Error occurred')).toBeTruthy();
    });

    it('displays app-level error message for app level', () => {
      const { getByText } = render(
        <ErrorBoundary level="app">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
      expect(
        getByText("We're sorry for the inconvenience. Please restart the app."),
      ).toBeTruthy();
    });

    it('displays component-level error message for component level', () => {
      const { getByText } = render(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(getByText('Error occurred')).toBeTruthy();
      expect(getByText('Please try again or go back.')).toBeTruthy();
    });

    it('shows Try Again button', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(getByText('Try Again')).toBeTruthy();
    });
  });

  describe('Error Recovery', () => {
    it('resets error state when Try Again is pressed', () => {
      let shouldThrow = true;

      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <Text>Recovered</Text>;
      };

      const { getByText, rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Error should be caught
      expect(getByText('Try Again')).toBeTruthy();

      // Fix the error condition before clicking retry
      shouldThrow = false;

      // Press Try Again
      fireEvent.press(getByText('Try Again'));

      // Re-render to apply state change
      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Should recover
      expect(getByText('Recovered')).toBeTruthy();
    });
  });

  describe('Custom Fallback', () => {
    it('uses custom fallback when provided', () => {
      const customFallback = (error: Error, resetError: () => void) => (
        <View>
          <Text>Custom Error: {error.message}</Text>
          <Text onPress={resetError}>Reset</Text>
        </View>
      );

      const { getByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(getByText('Custom Error: Test error')).toBeTruthy();
      expect(getByText('Reset')).toBeTruthy();
    });
  });

  describe('Error Callback', () => {
    it('calls onError callback when error occurs', () => {
      const mockOnError = jest.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(mockOnError).toHaveBeenCalled();
      expect(mockOnError.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe('Sentry Integration', () => {
    it('reports error to Sentry', () => {
      /* eslint-disable @typescript-eslint/no-var-requires */
      const {
        captureException,
        addBreadcrumb,
      } = require('../../config/sentry');
      /* eslint-enable @typescript-eslint/no-var-requires */

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(addBreadcrumb).toHaveBeenCalled();
      expect(captureException).toHaveBeenCalled();
    });
  });
});

describe('Convenience Wrappers', () => {
  describe('AppErrorBoundary', () => {
    it('renders with app level', () => {
      const { getByText } = render(
        <AppErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AppErrorBoundary>,
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });
  });

  describe('NavigationErrorBoundary', () => {
    it('renders with navigation level', () => {
      const { getByText } = render(
        <NavigationErrorBoundary>
          <ThrowError shouldThrow={true} />
        </NavigationErrorBoundary>,
      );

      expect(getByText('Error occurred')).toBeTruthy();
    });
  });

  describe('ScreenErrorBoundary', () => {
    it('renders with screen level', () => {
      const { getByText } = render(
        <ScreenErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>,
      );

      expect(getByText('Error occurred')).toBeTruthy();
    });
  });

  describe('ComponentErrorBoundary', () => {
    it('renders children when no error', () => {
      const { getByText } = render(
        <ComponentErrorBoundary>
          <Text>Component content</Text>
        </ComponentErrorBoundary>,
      );

      expect(getByText('Component content')).toBeTruthy();
    });

    it('catches errors at component level', () => {
      const { getByText } = render(
        <ComponentErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ComponentErrorBoundary>,
      );

      expect(getByText('Error occurred')).toBeTruthy();
    });
  });
});
