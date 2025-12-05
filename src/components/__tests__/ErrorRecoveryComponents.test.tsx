/**
 * ErrorRecoveryComponents Tests
 * Tests for error handling, network status, and recovery UI components
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Animated } from 'react-native';
import {
  ErrorView,
  NetworkErrorView,
  OfflineBanner,
  NetworkStatus,
  LoadingWithRetry,
} from '../ErrorRecoveryComponents';

// Mock expo-vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock Button component
jest.mock('../Button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return function MockButton({ title, onPress, testID }: { title: string; onPress: () => void; testID?: string }) {
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  };
});

describe('ErrorRecoveryComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ErrorView', () => {
    it('renders with default title and message', () => {
      const { getByText } = render(<ErrorView />);
      
      expect(getByText('Oops!')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('renders with custom title and message', () => {
      const { getByText } = render(
        <ErrorView
          title="Custom Error"
          message="A custom error occurred"
        />
      );
      
      expect(getByText('Custom Error')).toBeTruthy();
      expect(getByText('A custom error occurred')).toBeTruthy();
    });

    it('renders with Error object', () => {
      const error = new Error('Test error message');
      const { getByText } = render(<ErrorView error={error} />);
      
      expect(getByText('Test error message')).toBeTruthy();
    });

    it('renders with string error', () => {
      const { getByText } = render(<ErrorView error="String error" />);
      
      expect(getByText('String error')).toBeTruthy();
    });

    it('shows retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      const { getByText } = render(<ErrorView onRetry={onRetry} />);
      
      expect(getByText('Try Again')).toBeTruthy();
    });

    it('calls onRetry when retry button is pressed', () => {
      const onRetry = jest.fn();
      const { getByText } = render(<ErrorView onRetry={onRetry} />);
      
      fireEvent.press(getByText('Try Again'));
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('shows cached data option when showCachedOption is true', () => {
      const onUseCachedData = jest.fn();
      const { getByText } = render(
        <ErrorView
          showCachedOption={true}
          onUseCachedData={onUseCachedData}
        />
      );
      
      expect(getByText('Use Cached Data')).toBeTruthy();
    });

    it('calls onUseCachedData when cached data button is pressed', () => {
      const onUseCachedData = jest.fn();
      const { getByText } = render(
        <ErrorView
          showCachedOption={true}
          onUseCachedData={onUseCachedData}
        />
      );
      
      fireEvent.press(getByText('Use Cached Data'));
      
      expect(onUseCachedData).toHaveBeenCalledTimes(1);
    });

    it('does not show cached data option when showCachedOption is false', () => {
      const onUseCachedData = jest.fn();
      const { queryByText } = render(
        <ErrorView
          showCachedOption={false}
          onUseCachedData={onUseCachedData}
        />
      );
      
      expect(queryByText('Use Cached Data')).toBeNull();
    });

    it('does not show cached data option when onUseCachedData is not provided', () => {
      const { queryByText } = render(
        <ErrorView showCachedOption={true} />
      );
      
      expect(queryByText('Use Cached Data')).toBeNull();
    });

    it('prioritizes message over error', () => {
      const { getByText, queryByText } = render(
        <ErrorView
          error="Error message"
          message="Custom message"
        />
      );
      
      expect(getByText('Custom message')).toBeTruthy();
      expect(queryByText('Error message')).toBeNull();
    });

    it('does not show retry button when onRetry is not provided', () => {
      const { queryByText } = render(<ErrorView />);
      
      expect(queryByText('Try Again')).toBeNull();
    });
  });

  describe('NetworkErrorView', () => {
    it('renders with correct title and message', () => {
      const { getByText } = render(<NetworkErrorView />);
      
      expect(getByText('No Internet Connection')).toBeTruthy();
      expect(getByText('Please check your connection and try again')).toBeTruthy();
    });

    it('shows retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      const { getByText } = render(<NetworkErrorView onRetry={onRetry} />);
      
      expect(getByText('Retry')).toBeTruthy();
    });

    it('calls onRetry when retry button is pressed', () => {
      const onRetry = jest.fn();
      const { getByText } = render(<NetworkErrorView onRetry={onRetry} />);
      
      fireEvent.press(getByText('Retry'));
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('shows go offline button when onGoOffline is provided', () => {
      const onGoOffline = jest.fn();
      const { getByText } = render(<NetworkErrorView onGoOffline={onGoOffline} />);
      
      expect(getByText('Continue Offline')).toBeTruthy();
    });

    it('calls onGoOffline when continue offline button is pressed', () => {
      const onGoOffline = jest.fn();
      const { getByText } = render(<NetworkErrorView onGoOffline={onGoOffline} />);
      
      fireEvent.press(getByText('Continue Offline'));
      
      expect(onGoOffline).toHaveBeenCalledTimes(1);
    });

    it('does not show buttons when callbacks are not provided', () => {
      const { queryByText } = render(<NetworkErrorView />);
      
      expect(queryByText('Retry')).toBeNull();
      expect(queryByText('Continue Offline')).toBeNull();
    });

    it('shows both buttons when both callbacks are provided', () => {
      const onRetry = jest.fn();
      const onGoOffline = jest.fn();
      const { getByText } = render(
        <NetworkErrorView onRetry={onRetry} onGoOffline={onGoOffline} />
      );
      
      expect(getByText('Retry')).toBeTruthy();
      expect(getByText('Continue Offline')).toBeTruthy();
    });
  });

  describe('OfflineBanner', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(<OfflineBanner visible={true} />);
      
      expect(getByText('No Internet Connection')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(<OfflineBanner visible={false} />);
      
      expect(queryByText('No Internet Connection')).toBeNull();
    });

    it('shows retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      const { getByText } = render(
        <OfflineBanner visible={true} onRetry={onRetry} />
      );
      
      expect(getByText('Retry')).toBeTruthy();
    });

    it('calls onRetry when retry button is pressed', () => {
      const onRetry = jest.fn();
      const { getByText } = render(
        <OfflineBanner visible={true} onRetry={onRetry} />
      );
      
      fireEvent.press(getByText('Retry'));
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button when onRetry is not provided', () => {
      const { queryByText } = render(<OfflineBanner visible={true} />);
      
      expect(queryByText('Retry')).toBeNull();
    });

    it('animates on visibility change', () => {
      const animateSpy = jest.spyOn(Animated, 'timing');
      
      const { rerender } = render(<OfflineBanner visible={false} />);
      
      rerender(<OfflineBanner visible={true} />);
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(animateSpy).toHaveBeenCalled();
      animateSpy.mockRestore();
    });
  });

  describe('NetworkStatus', () => {
    it('renders nothing when online', () => {
      const { toJSON } = render(<NetworkStatus isOnline={true} />);
      
      expect(toJSON()).toBeNull();
    });

    it('renders offline indicator when offline', () => {
      const { getByText, toJSON } = render(<NetworkStatus isOnline={false} />);
      
      expect(getByText('Offline')).toBeTruthy();
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('LoadingWithRetry', () => {
    it('renders with default message', () => {
      const { getByText } = render(<LoadingWithRetry />);
      
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('renders with custom message', () => {
      const { getByText } = render(
        <LoadingWithRetry message="Fetching data..." />
      );
      
      expect(getByText('Fetching data...')).toBeTruthy();
    });

    it('shows retry count when retryCount > 0', () => {
      const { getByText } = render(
        <LoadingWithRetry retryCount={2} maxRetries={3} />
      );
      
      expect(getByText('Retry attempt 2 of 3')).toBeTruthy();
    });

    it('does not show retry count when retryCount is 0', () => {
      const { queryByText } = render(
        <LoadingWithRetry retryCount={0} maxRetries={3} />
      );
      
      expect(queryByText(/Retry attempt/)).toBeNull();
    });

    it('uses default maxRetries of 3', () => {
      const { getByText } = render(
        <LoadingWithRetry retryCount={1} />
      );
      
      expect(getByText('Retry attempt 1 of 3')).toBeTruthy();
    });

    it('shows cancel button when onCancel is provided', () => {
      const onCancel = jest.fn();
      const { getByText } = render(
        <LoadingWithRetry onCancel={onCancel} />
      );
      
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('calls onCancel when cancel button is pressed', () => {
      const onCancel = jest.fn();
      const { getByText } = render(
        <LoadingWithRetry onCancel={onCancel} />
      );
      
      fireEvent.press(getByText('Cancel'));
      
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not show cancel button when onCancel is not provided', () => {
      const { queryByText } = render(<LoadingWithRetry />);
      
      expect(queryByText('Cancel')).toBeNull();
    });

    it('renders with all props', () => {
      const onCancel = jest.fn();
      const { getByText } = render(
        <LoadingWithRetry
          message="Custom loading..."
          onCancel={onCancel}
          retryCount={2}
          maxRetries={5}
        />
      );
      
      expect(getByText('Custom loading...')).toBeTruthy();
      expect(getByText('Retry attempt 2 of 5')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('Integration tests', () => {
    it('ErrorView and NetworkErrorView have consistent structure', () => {
      const { toJSON: errorViewJson } = render(
        <ErrorView title="Test" message="Test message" />
      );
      const { toJSON: networkErrorJson } = render(<NetworkErrorView />);
      
      expect(errorViewJson()).toBeTruthy();
      expect(networkErrorJson()).toBeTruthy();
    });

    it('handles rapid visibility changes in OfflineBanner', () => {
      const { rerender, queryByText, getByText } = render(
        <OfflineBanner visible={false} />
      );
      
      // Rapid toggle
      rerender(<OfflineBanner visible={true} />);
      act(() => { jest.advanceTimersByTime(100); });
      
      rerender(<OfflineBanner visible={false} />);
      act(() => { jest.advanceTimersByTime(100); });
      
      rerender(<OfflineBanner visible={true} />);
      act(() => { jest.runAllTimers(); });
      
      expect(getByText('No Internet Connection')).toBeTruthy();
    });
  });
});
