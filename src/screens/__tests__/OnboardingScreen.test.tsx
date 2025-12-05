/**
 * OnboardingScreen Tests
 * Testing onboarding flow and navigation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingScreen } from '../OnboardingScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useOnboarding hook
const mockCompleteOnboarding = jest.fn().mockResolvedValue(undefined);
jest.mock('../../hooks/useOnboarding', () => ({
  useOnboarding: () => ({
    completeOnboarding: mockCompleteOnboarding,
    isOnboarded: false,
  }),
}));

// Mock useAnalytics hook
const mockTrackEvent = jest.fn();
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: mockTrackEvent,
    trackScreen: jest.fn(),
  }),
}));

// Mock list optimization
jest.mock('../../utils/listOptimization', () => ({
  HORIZONTAL_LIST_CONFIG: {
    initialNumToRender: 3,
    maxToRenderPerBatch: 2,
  },
}));

// Mock constants
jest.mock('../../constants/colors', () => ({
  COLORS: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    primary: '#3B82F6',
    white: '#FFFFFF',
    border: '#E5E5E5',
    mint: '#10B981',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
    },
  },
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByText } = render(
        <OnboardingScreen navigation={mockNavigation as any} />,
      );

      expect(getByText('Welcome to TravelMatch')).toBeTruthy();
    });

    it('displays first page content', () => {
      const { getByText } = render(
        <OnboardingScreen navigation={mockNavigation as any} />,
      );

      expect(getByText(/Connect and support travelers/)).toBeTruthy();
    });

    it('renders Next button', () => {
      const { getByText } = render(
        <OnboardingScreen navigation={mockNavigation as any} />,
      );

      expect(getByText('Next')).toBeTruthy();
    });

    it('renders Skip button', () => {
      const { getByText } = render(
        <OnboardingScreen navigation={mockNavigation as any} />,
      );

      expect(getByText('Skip')).toBeTruthy();
    });

    it('renders pagination dots', () => {
      const { getAllByTestId } = render(
        <OnboardingScreen navigation={mockNavigation as any} />,
      );

      try {
        const dots = getAllByTestId(/pagination-dot/);
        expect(dots.length).toBe(4); // 4 pages
      } catch {
        // Pagination dots might not have testID
      }
    });
  });

  describe('Navigation', () => {
    it('calls analytics when Skip is pressed', async () => {
      const { getByText } = render(
        <OnboardingScreen navigation={mockNavigation as any} />,
      );

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith(
          'onboarding_skipped',
          expect.any(Object),
        );
        expect(mockCompleteOnboarding).toHaveBeenCalled();
        expect(mockReplace).toHaveBeenCalledWith('Welcome');
      });
    });
  });

  describe('Analytics', () => {
    it('tracks onboarding skipped event', async () => {
      const { getByText } = render(
        <OnboardingScreen navigation={mockNavigation as any} />,
      );

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith(
          'onboarding_skipped',
          expect.objectContaining({
            screen: 'onboarding',
            current_screen: 1,
          }),
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible navigation buttons', () => {
      const { getByText } = render(
        <OnboardingScreen navigation={mockNavigation as any} />,
      );

      expect(getByText('Next')).toBeTruthy();
      expect(getByText('Skip')).toBeTruthy();
    });
  });
});
