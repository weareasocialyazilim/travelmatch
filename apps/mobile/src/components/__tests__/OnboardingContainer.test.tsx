import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock OnboardingScreen BEFORE importing component
jest.mock('../../features/auth/screens/OnboardingScreen', () => ({
  OnboardingScreen: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="onboarding-screen">
        <Text>Onboarding Screen</Text>
      </View>
    );
  },
}));

// Mock UIStore
const mockIsOnboardingCompleted = jest.fn();
jest.mock('../../stores/uiStore', () => ({
  useUIStore: (selector: any) => {
    const state = {
      isOnboardingCompleted: mockIsOnboardingCompleted(),
    };
    return selector(state);
  },
}));

import { OnboardingContainer } from '../OnboardingContainer';

describe('OnboardingContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Loading State', () => {
    it('shows loading indicator initially', () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { UNSAFE_getByType } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('hides loading after timeout', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { queryByTestId, getByText } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(getByText('App Content')).toBeTruthy();
      });
    });

    it('loading indicator has correct color', () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { UNSAFE_getByType } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );
      const { ActivityIndicator } = require('react-native');
      const { COLORS } = require('../../constants/colors');
      const indicator = UNSAFE_getByType(ActivityIndicator);
      expect(indicator.props.color).toBe(COLORS.brand.primary);
    });

    it('loading indicator is large size', () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { UNSAFE_getByType } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );
      const { ActivityIndicator } = require('react-native');
      const indicator = UNSAFE_getByType(ActivityIndicator);
      expect(indicator.props.size).toBe('large');
    });
  });

  describe('Onboarding Not Completed', () => {
    it('shows onboarding screen when not completed', async () => {
      mockIsOnboardingCompleted.mockReturnValue(false);
      const { getByTestId } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(getByTestId('onboarding-screen')).toBeTruthy();
      });
    });

    it('does not show children when onboarding not completed', async () => {
      mockIsOnboardingCompleted.mockReturnValue(false);
      const { queryByText } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(queryByText('App Content')).toBeNull();
      });
    });

    it('shows onboarding text', async () => {
      mockIsOnboardingCompleted.mockReturnValue(false);
      const { getByText } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(getByText('Onboarding Screen')).toBeTruthy();
      });
    });
  });

  describe('Onboarding Completed', () => {
    it('shows children when onboarding completed', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { getByText } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(getByText('App Content')).toBeTruthy();
      });
    });

    it('does not show onboarding screen when completed', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { queryByTestId } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(queryByTestId('onboarding-screen')).toBeNull();
      });
    });

    it('renders multiple children', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { getByText } = render(
        <OnboardingContainer>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(getByText('First Child')).toBeTruthy();
        expect(getByText('Second Child')).toBeTruthy();
      });
    });

    it('renders complex children components', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const ComplexChild = () => {
        const { View, Text } = require('react-native');
        return (
          <View>
            <Text>Complex Component</Text>
          </View>
        );
      };

      const { getByText } = render(
        <OnboardingContainer>
          <ComplexChild />
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(getByText('Complex Component')).toBeTruthy();
      });
    });
  });

  describe('State Transitions', () => {
    it('transitions from loading to onboarding', async () => {
      mockIsOnboardingCompleted.mockReturnValue(false);
      const { UNSAFE_queryByType, getByTestId } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(getByTestId('onboarding-screen')).toBeTruthy();
      });
    });

    it('transitions from loading to children', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { UNSAFE_queryByType, getByText } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(getByText('App Content')).toBeTruthy();
      });
    });

    it('handles re-render with different onboarding state', async () => {
      mockIsOnboardingCompleted.mockReturnValue(false);
      const { rerender, getByTestId, queryByText } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(getByTestId('onboarding-screen')).toBeTruthy();
      });

      mockIsOnboardingCompleted.mockReturnValue(true);
      rerender(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      await act(async () => { jest.advanceTimersByTime(100); });

      await waitFor(() => {
        expect(queryByText('App Content')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);

      // Should not throw
      expect(() => {
        render(<OnboardingContainer>{null}</OnboardingContainer>);
      }).not.toThrow();
    });

    it('handles children as function', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);

      // This test verifies that passing a function as children doesn't crash
      // React will warn about this but shouldn't crash
      expect(() => {
        render(
          <OnboardingContainer>
            {() => <Text>Function Child</Text>}
          </OnboardingContainer>
        );
      }).not.toThrow();
    });

    it('cleans up timer on unmount', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { unmount } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      unmount();

      // Advance timers to ensure no errors after unmount
      await act(async () => { jest.advanceTimersByTime(200); });
    });

    it('handles rapid re-renders during loading', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { rerender } = render(
        <OnboardingContainer>
          <Text>Content 1</Text>
        </OnboardingContainer>
      );

      rerender(
        <OnboardingContainer>
          <Text>Content 2</Text>
        </OnboardingContainer>
      );

      rerender(
        <OnboardingContainer>
          <Text>Content 3</Text>
        </OnboardingContainer>
      );

      // Should not crash
      await act(async () => { jest.advanceTimersByTime(100); });
    });

    it('timer completes exactly at 100ms', async () => {
      mockIsOnboardingCompleted.mockReturnValue(true);
      const { UNSAFE_queryByType, getByText } = render(
        <OnboardingContainer>
          <Text>App Content</Text>
        </OnboardingContainer>
      );

      // Before 100ms
      await act(async () => { jest.advanceTimersByTime(99); });
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();

      // At 100ms
      await act(async () => { jest.advanceTimersByTime(1); });

      await waitFor(() => {
        expect(getByText('App Content')).toBeTruthy();
      });
    });
  });
});
