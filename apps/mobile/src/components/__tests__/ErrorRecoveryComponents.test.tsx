import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  ErrorView,
  NetworkErrorView,
  OfflineBanner,
  NetworkStatus,
  LoadingWithRetry,
} from '../ErrorRecoveryComponents';

// Mock Button component
jest.mock('../ui/Button', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ title, onPress, variant, style }: { title: string; onPress: () => void; variant?: string; style?: unknown }) => (
      <TouchableOpacity onPress={onPress} style={style} testID={`button-${variant}`}>
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
  };
});

describe('ErrorRecoveryComponents', () => {
  describe('ErrorView', () => {
    const mockOnRetry = jest.fn() as jest.Mock;
    const mockOnUseCachedData = jest.fn() as jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Rendering', () => {
      it('renders with default props', () => {
        const { getByText } = render(<ErrorView />);

        expect(getByText('Oops!')).toBeTruthy();
        expect(getByText('Something went wrong')).toBeTruthy();
      });

      it('renders with custom title and message', () => {
        const { getByText } = render(
          <ErrorView title="Custom Error" message="Custom message" />
        );

        expect(getByText('Custom Error')).toBeTruthy();
        expect(getByText('Custom message')).toBeTruthy();
      });

      it('renders with Error object', () => {
        const error = new Error('Network failed');
        const { getByText } = render(<ErrorView error={error} />);

        expect(getByText('Network failed')).toBeTruthy();
      });

      it('renders with string error', () => {
        const { getByText } = render(<ErrorView error="String error" />);

        expect(getByText('String error')).toBeTruthy();
      });

      it('renders error icon', () => {
        const { UNSAFE_getAllByType } = render(<ErrorView />);

        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icons = UNSAFE_getAllByType(MaterialCommunityIcons);

        const errorIcon = icons.find((icon: { props: { name: string } }) => icon.props.name === 'alert-circle-outline');
        expect(errorIcon).toBeTruthy();
        expect(errorIcon?.props.size).toBe(64);
      });

      it('renders retry button when onRetry provided', () => {
        const { getByText } = render(<ErrorView onRetry={mockOnRetry} />);

        expect(getByText('Try Again')).toBeTruthy();
      });

      it('does not render retry button when onRetry not provided', () => {
        const { queryByText } = render(<ErrorView />);

        expect(queryByText('Try Again')).toBeNull();
      });

      it('renders cached data button when showCachedOption is true', () => {
        const { getByText } = render(
          <ErrorView
            onUseCachedData={mockOnUseCachedData}
            showCachedOption={true}
          />
        );

        expect(getByText('Use Cached Data')).toBeTruthy();
      });

      it('does not render cached data button when showCachedOption is false', () => {
        const { queryByText } = render(
          <ErrorView
            onUseCachedData={mockOnUseCachedData}
            showCachedOption={false}
          />
        );

        expect(queryByText('Use Cached Data')).toBeNull();
      });

      it('does not render cached data button when onUseCachedData not provided', () => {
        const { queryByText } = render(
          <ErrorView showCachedOption={true} />
        );

        expect(queryByText('Use Cached Data')).toBeNull();
      });
    });

    describe('User Interactions', () => {
      it('calls onRetry when Try Again button is pressed', () => {
        const { getByText } = render(<ErrorView onRetry={mockOnRetry} />);

        fireEvent.press(getByText('Try Again'));

        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });

      it('calls onUseCachedData when Use Cached Data button is pressed', () => {
        const { getByText } = render(
          <ErrorView
            onUseCachedData={mockOnUseCachedData}
            showCachedOption={true}
          />
        );

        fireEvent.press(getByText('Use Cached Data'));

        expect(mockOnUseCachedData).toHaveBeenCalledTimes(1);
      });

      it('allows multiple retry attempts', () => {
        const { getByText } = render(<ErrorView onRetry={mockOnRetry} />);

        fireEvent.press(getByText('Try Again'));
        fireEvent.press(getByText('Try Again'));
        fireEvent.press(getByText('Try Again'));

        expect(mockOnRetry).toHaveBeenCalledTimes(3);
      });
    });

    describe('Edge Cases', () => {
      it('handles undefined error gracefully', () => {
        const { getByText } = render(<ErrorView error={undefined} />);

        expect(getByText('Something went wrong')).toBeTruthy();
      });

      it('handles empty string message', () => {
        const { getByText } = render(<ErrorView message="" />);

        expect(getByText('Something went wrong')).toBeTruthy();
      });

      it('prioritizes message over error', () => {
        const { getByText, queryByText } = render(
          <ErrorView error="Error message" message="Custom message" />
        );

        expect(getByText('Custom message')).toBeTruthy();
        expect(queryByText('Error message')).toBeNull();
      });
    });
  });

  describe('NetworkErrorView', () => {
    const mockOnRetry = jest.fn() as jest.Mock;
    const mockOnGoOffline = jest.fn() as jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Rendering', () => {
      it('renders with default content', () => {
        const { getByText } = render(<NetworkErrorView />);

        expect(getByText('No Internet Connection')).toBeTruthy();
        expect(getByText('Please check your connection and try again')).toBeTruthy();
      });

      it('renders wifi-off icon', () => {
        const { UNSAFE_getAllByType } = render(<NetworkErrorView />);

        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icons = UNSAFE_getAllByType(MaterialCommunityIcons);

        const wifiIcon = icons.find((icon: { props: { name: string } }) => icon.props.name === 'wifi-off');
        expect(wifiIcon).toBeTruthy();
        expect(wifiIcon?.props.size).toBe(64);
      });

      it('renders Retry button when onRetry provided', () => {
        const { getByText } = render(<NetworkErrorView onRetry={mockOnRetry} />);

        expect(getByText('Retry')).toBeTruthy();
      });

      it('renders Continue Offline button when onGoOffline provided', () => {
        const { getByText } = render(
          <NetworkErrorView onGoOffline={mockOnGoOffline} />
        );

        expect(getByText('Continue Offline')).toBeTruthy();
      });

      it('does not render buttons when callbacks not provided', () => {
        const { queryByText } = render(<NetworkErrorView />);

        expect(queryByText('Retry')).toBeNull();
        expect(queryByText('Continue Offline')).toBeNull();
      });
    });

    describe('User Interactions', () => {
      it('calls onRetry when Retry button is pressed', () => {
        const { getByText } = render(<NetworkErrorView onRetry={mockOnRetry} />);

        fireEvent.press(getByText('Retry'));

        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });

      it('calls onGoOffline when Continue Offline button is pressed', () => {
        const { getByText } = render(
          <NetworkErrorView onGoOffline={mockOnGoOffline} />
        );

        fireEvent.press(getByText('Continue Offline'));

        expect(mockOnGoOffline).toHaveBeenCalledTimes(1);
      });

      it('allows both buttons to work independently', () => {
        const { getByText } = render(
          <NetworkErrorView onRetry={mockOnRetry} onGoOffline={mockOnGoOffline} />
        );

        fireEvent.press(getByText('Retry'));
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
        expect(mockOnGoOffline).not.toHaveBeenCalled();

        fireEvent.press(getByText('Continue Offline'));
        expect(mockOnGoOffline).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('OfflineBanner', () => {
    const mockOnRetry = jest.fn() as jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Rendering', () => {
      it('renders when visible is true', () => {
        const { getByText } = render(<OfflineBanner visible={true} />);

        expect(getByText('No Internet Connection')).toBeTruthy();
      });

      it('does not render when visible is false', () => {
        const { queryByText } = render(<OfflineBanner visible={false} />);

        expect(queryByText('No Internet Connection')).toBeNull();
      });

      it('renders wifi-off icon when visible', () => {
        const { UNSAFE_getAllByType } = render(<OfflineBanner visible={true} />);

        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icons = UNSAFE_getAllByType(MaterialCommunityIcons);

        const wifiIcon = icons.find((icon: { props: { name: string } }) => icon.props.name === 'wifi-off');
        expect(wifiIcon).toBeTruthy();
        expect(wifiIcon?.props.size).toBe(20);
      });

      it('renders Retry button when onRetry provided', () => {
        const { getByText } = render(
          <OfflineBanner visible={true} onRetry={mockOnRetry} />
        );

        expect(getByText('Retry')).toBeTruthy();
      });

      it('does not render Retry button when onRetry not provided', () => {
        const { queryByText } = render(<OfflineBanner visible={true} />);

        expect(queryByText('Retry')).toBeNull();
      });
    });

    describe('User Interactions', () => {
      it('calls onRetry when Retry button is pressed', () => {
        const { getByText } = render(
          <OfflineBanner visible={true} onRetry={mockOnRetry} />
        );

        fireEvent.press(getByText('Retry'));

        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    describe('Visibility Toggle', () => {
      it('transitions from invisible to visible', () => {
        const { rerender, getByText } = render(<OfflineBanner visible={false} />);

        rerender(<OfflineBanner visible={true} />);

        expect(getByText('No Internet Connection')).toBeTruthy();
      });

      it('transitions from visible to invisible', () => {
        const { rerender, queryByText } = render(<OfflineBanner visible={true} />);

        rerender(<OfflineBanner visible={false} />);

        expect(queryByText('No Internet Connection')).toBeNull();
      });
    });
  });

  describe('NetworkStatus', () => {
    describe('Rendering', () => {
      it('does not render when online', () => {
        const { queryByText } = render(<NetworkStatus isOnline={true} />);

        expect(queryByText('Offline')).toBeNull();
      });

      it('renders when offline', () => {
        const { getByText } = render(<NetworkStatus isOnline={false} />);

        expect(getByText('Offline')).toBeTruthy();
      });

      it('renders offline dot when offline', () => {
        const { UNSAFE_getAllByType } = render(<NetworkStatus isOnline={false} />);

        const { View } = require('react-native');
        const views = UNSAFE_getAllByType(View);

        // Should have multiple views including the offline dot
        expect(views.length).toBeGreaterThan(1);
      });
    });

    describe('Status Toggle', () => {
      it('transitions from online to offline', () => {
        const { rerender, getByText } = render(<NetworkStatus isOnline={true} />);

        rerender(<NetworkStatus isOnline={false} />);

        expect(getByText('Offline')).toBeTruthy();
      });

      it('transitions from offline to online', () => {
        const { rerender, queryByText } = render(<NetworkStatus isOnline={false} />);

        rerender(<NetworkStatus isOnline={true} />);

        expect(queryByText('Offline')).toBeNull();
      });
    });
  });

  describe('LoadingWithRetry', () => {
    const mockOnCancel = jest.fn() as jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Rendering', () => {
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

      it('does not show retry count when retryCount is 0', () => {
        const { queryByText } = render(<LoadingWithRetry retryCount={0} />);

        expect(queryByText(/Retry attempt/)).toBeNull();
      });

      it('shows retry count when retryCount > 0', () => {
        const { getByText } = render(
          <LoadingWithRetry retryCount={2} maxRetries={3} />
        );

        expect(getByText('Retry attempt 2 of 3')).toBeTruthy();
      });

      it('renders Cancel button when onCancel provided', () => {
        const { getByText } = render(
          <LoadingWithRetry onCancel={mockOnCancel} />
        );

        expect(getByText('Cancel')).toBeTruthy();
      });

      it('does not render Cancel button when onCancel not provided', () => {
        const { queryByText } = render(<LoadingWithRetry />);

        expect(queryByText('Cancel')).toBeNull();
      });
    });

    describe('User Interactions', () => {
      it('calls onCancel when Cancel button is pressed', () => {
        const { getByText } = render(
          <LoadingWithRetry onCancel={mockOnCancel} />
        );

        fireEvent.press(getByText('Cancel'));

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      });
    });

    describe('Retry Display', () => {
      it('shows correct retry count at different attempts', () => {
        const { getByText } = render(
          <LoadingWithRetry retryCount={1} maxRetries={5} />
        );

        expect(getByText('Retry attempt 1 of 5')).toBeTruthy();
      });

      it('shows maximum retry count', () => {
        const { getByText } = render(
          <LoadingWithRetry retryCount={3} maxRetries={3} />
        );

        expect(getByText('Retry attempt 3 of 3')).toBeTruthy();
      });
    });

    describe('Edge Cases', () => {
      it('handles empty message', () => {
        const { getByText } = render(<LoadingWithRetry message="" />);

        expect(getByText('')).toBeTruthy();
      });

      it('handles very long message', () => {
        const longMessage = 'Loading very long data that takes a lot of time to process and fetch from the server...';
        const { getByText } = render(<LoadingWithRetry message={longMessage} />);

        expect(getByText(longMessage)).toBeTruthy();
      });

      it('handles large retry counts', () => {
        const { getByText } = render(
          <LoadingWithRetry retryCount={99} maxRetries={100} />
        );

        expect(getByText('Retry attempt 99 of 100')).toBeTruthy();
      });
    });
  });
});
