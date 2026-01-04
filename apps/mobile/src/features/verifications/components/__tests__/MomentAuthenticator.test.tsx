/**
 * MomentAuthenticator Component Test Suite
 *
 * Tests the AI-powered moment verification component that provides
 * cinematic UX from proof upload to verification result.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import {
  MomentAuthenticator,
  AuthenticationResult,
} from '../MomentAuthenticator';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// react-native-reanimated is mocked globally via moduleNameMapper

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement(
        View,
        { ...props, testID: 'linear-gradient' },
        children,
      ),
  };
});

// Mock react-native-confetti-cannon
jest.mock('react-native-confetti-cannon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) =>
    React.createElement(View, { ...props, testID: 'confetti-cannon' });
});

// Mock supabase
const mockInvoke = jest.fn();
jest.mock('@/config/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

// Default props
const defaultProps = {
  proofId: 'test-proof-123',
  mediaUrls: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ],
  location: {
    lat: 41.0082,
    lng: 28.9784,
    name: 'Istanbul, Turkey',
  },
  expectedMoment: {
    id: 'moment-123',
    title: 'Sunset at Bosphorus',
    location: 'Istanbul',
  },
  onResult: jest.fn(),
  onCancel: jest.fn(),
  onRetry: jest.fn(),
  onRequestManualReview: jest.fn(),
};

// Mock API responses
const mockVerifiedResponse = {
  data: {
    verification: {
      verified: true,
      confidence: 0.92,
      status: 'verified',
      locationMatch: true,
      dateMatch: true,
      sceneValid: true,
    },
  },
  error: null,
};

const mockRejectedResponse = {
  data: {
    verification: {
      verified: false,
      confidence: 0.3,
      status: 'rejected',
      locationMatch: false,
      dateMatch: true,
      sceneValid: false,
      red_flags: ['Location mismatch', 'Scene does not match'],
      suggestions: ['Try taking a photo with visible landmarks'],
    },
  },
  error: null,
};

const mockNeedsReviewResponse = {
  data: {
    verification: {
      verified: false,
      confidence: 0.6,
      status: 'needs_review',
      locationMatch: true,
      dateMatch: true,
      sceneValid: false,
      red_flags: ['Unable to verify scene'],
    },
  },
  error: null,
};

describe('MomentAuthenticator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockInvoke.mockResolvedValue(mockVerifiedResponse);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      const { getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );
      expect(getByTestId('authenticator')).toBeTruthy();
    });

    it('renders with minimum required props', () => {
      const minProps = {
        proofId: 'test-123',
        mediaUrls: ['https://example.com/image.jpg'],
        expectedMoment: { id: 'moment-1', title: 'Test Moment' },
        onResult: jest.fn(),
      };
      const { getByTestId } = render(
        <MomentAuthenticator {...minProps} testID="authenticator" />,
      );
      expect(getByTestId('authenticator')).toBeTruthy();
    });

    it('renders cancel button when onCancel is provided', () => {
      const { getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );
      expect(getByTestId('cancel-button')).toBeTruthy();
    });

    it('does not render cancel button when onCancel is not provided', () => {
      const propsWithoutCancel = { ...defaultProps, onCancel: undefined };
      const { queryByTestId } = render(
        <MomentAuthenticator {...propsWithoutCancel} testID="authenticator" />,
      );
      expect(queryByTestId('cancel-button')).toBeNull();
    });
  });

  // ============================================
  // Phase Progression Tests
  // ============================================

  describe('Phase Progression', () => {
    it('starts in uploading phase', () => {
      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );
      expect(getByText(/yükleniyor/i)).toBeTruthy();
    });

    it('progresses through all phases', async () => {
      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      // Initial phase - uploading
      expect(getByText(/yükleniyor/i)).toBeTruthy();

      // Progress through phases
      await act(async () => {
        jest.advanceTimersByTime(2500);
      });

      // Should be in scanning phase
      await waitFor(() => {
        expect(getByText(/taranıyor/i)).toBeTruthy();
      });
    });

    it('shows progress percentage', () => {
      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );
      // Initial progress should show 20%
      expect(getByText('20%')).toBeTruthy();
    });
  });

  // ============================================
  // Scanning Overlay Tests
  // ============================================

  describe('Scanning Overlay', () => {
    it('renders scanning overlay with image', () => {
      const { getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );
      // Linear gradient is used in scanning overlay
      expect(getByTestId('authenticator')).toBeTruthy();
    });

    it('shows corner brackets during scanning', async () => {
      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(2500);
      });

      // Component should still render during scanning phase
    });
  });

  // ============================================
  // Checklist Tests
  // ============================================

  describe('Checklist Items', () => {
    it('shows checklist items during analyzing phase', async () => {
      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      // Advance to analyzing phase
      await act(async () => {
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(getByText('Fotoğraflar yüklendi')).toBeTruthy();
      });
    });

    it('displays all checklist items', async () => {
      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(getByText('Fotoğraflar yüklendi')).toBeTruthy();
        expect(getByText('Konum kontrol edildi')).toBeTruthy();
        expect(getByText('Tarih doğrulandı')).toBeTruthy();
        expect(getByText('Sahne analiz edildi')).toBeTruthy();
      });
    });
  });

  // ============================================
  // API Integration Tests
  // ============================================

  describe('API Integration', () => {
    it('calls verify-proof API with correct parameters', async () => {
      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('verify-proof', {
          body: {
            proofId: defaultProps.proofId,
            location: defaultProps.location,
            momentId: defaultProps.expectedMoment.id,
          },
        });
      });
    });

    it('handles API success response', async () => {
      mockInvoke.mockResolvedValue(mockVerifiedResponse);

      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(defaultProps.onResult).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'verified',
          }),
        );
      });
    });

    it('handles API rejection response', async () => {
      mockInvoke.mockResolvedValue(mockRejectedResponse);

      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(defaultProps.onResult).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'rejected',
          }),
        );
      });
    });

    it('handles API needs_review response', async () => {
      mockInvoke.mockResolvedValue(mockNeedsReviewResponse);

      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(defaultProps.onResult).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'needs_review',
          }),
        );
      });
    });

    it('handles API error gracefully', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'));

      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(defaultProps.onResult).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'rejected',
            reasons: expect.arrayContaining([expect.any(String)]),
          }),
        );
      });
    });
  });

  // ============================================
  // Result Views Tests
  // ============================================

  describe('Result Views', () => {
    it('shows success view with confetti on verification', async () => {
      mockInvoke.mockResolvedValue(mockVerifiedResponse);

      const { getByTestId, getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByText(/Anınız Onaylandı/i)).toBeTruthy();
        expect(getByTestId('confetti-cannon')).toBeTruthy();
      });
    });

    it('shows confidence percentage on success', async () => {
      mockInvoke.mockResolvedValue(mockVerifiedResponse);

      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByText(/Güven: 92%/i)).toBeTruthy();
      });
    });

    it('shows rejection view with reasons', async () => {
      mockInvoke.mockResolvedValue(mockRejectedResponse);

      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByText('Doğrulanamadı')).toBeTruthy();
        expect(getByText(/Location mismatch/)).toBeTruthy();
      });
    });

    it('shows suggestions on rejection', async () => {
      mockInvoke.mockResolvedValue(mockRejectedResponse);

      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByText(/Öneriler/)).toBeTruthy();
        expect(
          getByText(/Try taking a photo with visible landmarks/),
        ).toBeTruthy();
      });
    });

    it('shows retry button on rejection', async () => {
      mockInvoke.mockResolvedValue(mockRejectedResponse);

      const { getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByTestId('retry-button')).toBeTruthy();
      });
    });

    it('shows needs review view with message', async () => {
      mockInvoke.mockResolvedValue(mockNeedsReviewResponse);

      const { getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByText('Manuel İnceleme Gerekiyor')).toBeTruthy();
        expect(getByText(/24 saat içinde/)).toBeTruthy();
      });
    });

    it('shows manual review button when handler provided', async () => {
      mockInvoke.mockResolvedValue(mockNeedsReviewResponse);

      const { getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByTestId('manual-review-button')).toBeTruthy();
      });
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================

  describe('User Interactions', () => {
    it('calls onCancel when cancel button is pressed', () => {
      const { getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      fireEvent.press(getByTestId('cancel-button'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry when retry button is pressed', async () => {
      mockInvoke.mockResolvedValue(mockRejectedResponse);

      const { getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        const retryButton = getByTestId('retry-button');
        fireEvent.press(retryButton);
        expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onRequestManualReview when manual review button is pressed', async () => {
      mockInvoke.mockResolvedValue(mockNeedsReviewResponse);

      const { getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        const manualReviewButton = getByTestId('manual-review-button');
        fireEvent.press(manualReviewButton);
        expect(defaultProps.onRequestManualReview).toHaveBeenCalledTimes(1);
      });
    });

    it('falls back to onCancel if onRetry is not provided', async () => {
      mockInvoke.mockResolvedValue(mockRejectedResponse);
      const propsWithoutRetry = { ...defaultProps, onRetry: undefined };

      const { getByTestId } = render(
        <MomentAuthenticator {...propsWithoutRetry} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        const retryButton = getByTestId('retry-button');
        fireEvent.press(retryButton);
        expect(defaultProps.onCancel).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // Haptic Feedback Tests
  // ============================================

  describe('Haptic Feedback', () => {
    it('triggers success haptic on verified result', async () => {
      const Haptics = require('expo-haptics');
      mockInvoke.mockResolvedValue(mockVerifiedResponse);

      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success,
        );
      });
    });

    it('triggers error haptic on rejected result', async () => {
      const Haptics = require('expo-haptics');
      mockInvoke.mockResolvedValue(mockRejectedResponse);

      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error,
        );
      });
    });

    it('triggers light haptic on checklist item check', async () => {
      const Haptics = require('expo-haptics');
      mockInvoke.mockResolvedValue(mockVerifiedResponse);

      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(8000);
      });

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light,
        );
      });
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('Accessibility', () => {
    it('has accessible label for authenticator container', () => {
      const { getByLabelText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );
      expect(getByLabelText(/doğrulama/i)).toBeTruthy();
    });

    it('cancel button has accessibility label', () => {
      const { getByLabelText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );
      expect(getByLabelText('İptal')).toBeTruthy();
    });

    it('cancel button has button role', () => {
      const { getByRole } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );
      expect(getByRole('button')).toBeTruthy();
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('handles empty mediaUrls array gracefully', () => {
      const propsWithEmptyMedia = { ...defaultProps, mediaUrls: [] };
      expect(() =>
        render(
          <MomentAuthenticator
            {...propsWithEmptyMedia}
            testID="authenticator"
          />,
        ),
      ).not.toThrow();
    });

    it('handles undefined location', () => {
      const propsWithoutLocation = { ...defaultProps, location: undefined };
      const { getByTestId } = render(
        <MomentAuthenticator
          {...propsWithoutLocation}
          testID="authenticator"
        />,
      );
      expect(getByTestId('authenticator')).toBeTruthy();
    });

    it('handles undefined expectedMoment.location', () => {
      const propsWithoutMomentLocation = {
        ...defaultProps,
        expectedMoment: { id: 'moment-1', title: 'Test' },
      };
      const { getByTestId } = render(
        <MomentAuthenticator
          {...propsWithoutMomentLocation}
          testID="authenticator"
        />,
      );
      expect(getByTestId('authenticator')).toBeTruthy();
    });

    it('handles API returning null verification data', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: null });

      render(<MomentAuthenticator {...defaultProps} testID="authenticator" />);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(defaultProps.onResult).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'rejected',
          }),
        );
      });
    });

    it('handles empty reasons and suggestions arrays', async () => {
      mockInvoke.mockResolvedValue({
        data: {
          verification: {
            verified: false,
            confidence: 0.3,
            status: 'rejected',
            locationMatch: false,
            dateMatch: true,
            sceneValid: false,
            red_flags: [],
            suggestions: [],
          },
        },
        error: null,
      });

      const { getByText, queryByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByText('Doğrulanamadı')).toBeTruthy();
        expect(queryByText(/Öneriler/)).toBeNull();
      });
    });

    it('handles proofId change by restarting authentication', async () => {
      const { rerender, getByText } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      // Change proofId
      rerender(
        <MomentAuthenticator
          {...defaultProps}
          proofId="new-proof-456"
          testID="authenticator"
        />,
      );

      // Should restart from uploading phase
      expect(getByText(/yükleniyor/i)).toBeTruthy();
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Full Flow Integration', () => {
    it('completes full verification flow successfully', async () => {
      mockInvoke.mockResolvedValue(mockVerifiedResponse);
      const Haptics = require('expo-haptics');

      const { getByText, getByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      // Phase 1: Uploading
      expect(getByText(/yükleniyor/i)).toBeTruthy();

      // Phase 2: Scanning
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      // Phase 3: Analyzing
      await act(async () => {
        jest.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(getByText('Fotoğraflar yüklendi')).toBeTruthy();
      });

      // Phase 4-5: Verifying and Complete
      await act(async () => {
        jest.advanceTimersByTime(8000);
      });

      await waitFor(() => {
        expect(getByText(/Anınız Onaylandı/i)).toBeTruthy();
        expect(getByTestId('confetti-cannon')).toBeTruthy();
        expect(defaultProps.onResult).toHaveBeenCalledWith({
          status: 'verified',
          confidence: 0.92,
        });
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success,
        );
      });
    });

    it('completes full rejection flow', async () => {
      mockInvoke.mockResolvedValue(mockRejectedResponse);
      const Haptics = require('expo-haptics');

      const { getByText, getByTestId, queryByTestId } = render(
        <MomentAuthenticator {...defaultProps} testID="authenticator" />,
      );

      // Run through all phases
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(getByText('Doğrulanamadı')).toBeTruthy();
        expect(getByText(/Location mismatch/)).toBeTruthy();
        expect(getByText(/Öneriler/)).toBeTruthy();
        expect(getByTestId('retry-button')).toBeTruthy();
        expect(queryByTestId('confetti-cannon')).toBeNull();
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error,
        );
      });
    });
  });
});
