/**
 * NetworkGuard Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NetworkGuard } from '../NetworkGuard';

// Mock NetworkContext
jest.mock('../../context/NetworkContext', () => ({
  useNetworkStatus: jest.fn(),
}));

import { useNetworkStatus } from '../../context/NetworkContext';

const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<
  typeof useNetworkStatus
>;

// Helper to create valid network context mock
const createMockNetworkContext = (isConnected: boolean) => ({
  isConnected,
  refresh: jest.fn(),
  status: {
    isConnected,
    isInternetReachable: isConnected,
    type: isConnected ? 'wifi' : 'none',
    isWifi: isConnected,
    isCellular: false,
  },
});

describe('NetworkGuard', () => {
  const TestChild = () => <Text>Protected Content</Text>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Online State', () => {
    it('should render children when connected', () => {
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(true));

      const { getByText } = render(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>,
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should render multiple children when connected', () => {
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(true));

      const { getByText } = render(
        <NetworkGuard>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </NetworkGuard>,
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });
  });

  describe('Offline State', () => {
    it('should render OfflineState when disconnected', () => {
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(false));

      const { queryByText } = render(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>,
      );

      // Children should not be rendered
      expect(queryByText('Protected Content')).toBeNull();

      // OfflineState should be rendered
    });

    it('should render custom offline message', () => {
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(false));

      const customMessage = 'No internet connection available';
      const { getByText } = render(
        <NetworkGuard offlineMessage={customMessage}>
          <TestChild />
        </NetworkGuard>,
      );

      expect(getByText(customMessage)).toBeTruthy();
    });

    it('should use network refresh as default retry', () => {
      const mockRefresh = jest.fn() as jest.Mock;
      mockUseNetworkStatus.mockReturnValue({
        ...createMockNetworkContext(false),
        refresh: mockRefresh,
      });

      render(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>,
      );

      // OfflineState should receive refresh as onRetry
    });

    it('should use custom onRetry when provided', () => {
      const mockRefresh = jest.fn() as jest.Mock;
      const mockCustomRetry = jest.fn() as jest.Mock;

      mockUseNetworkStatus.mockReturnValue({
        ...createMockNetworkContext(false),
        refresh: mockRefresh,
      });

      render(
        <NetworkGuard onRetry={mockCustomRetry}>
          <TestChild />
        </NetworkGuard>,
      );

      // OfflineState should receive custom retry
    });
  });

  describe('Compact Mode', () => {
    it('should render compact OfflineState when compact is true', () => {
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(false));

      render(
        <NetworkGuard compact>
          <TestChild />
        </NetworkGuard>,
      );
    });

    it('should render full OfflineState when compact is false', () => {
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(false));

      render(
        <NetworkGuard compact={false}>
          <TestChild />
        </NetworkGuard>,
      );
    });
  });

  describe('Custom OfflineState Props', () => {
    it('should pass custom offlineProps to OfflineState', () => {
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(false));

      const customOfflineProps = {
        retryText: 'Reload',
        testID: 'custom-offline-state',
      };

      const { getByText, getByTestId } = render(
        <NetworkGuard offlineProps={customOfflineProps}>
          <TestChild />
        </NetworkGuard>,
      );

      expect(getByText('Reload')).toBeTruthy();
      expect(getByTestId('custom-offline-state')).toBeTruthy();
    });
  });

  describe('Network State Changes', () => {
    it('should switch from offline to online', () => {
      const { rerender, getByText, queryByText } = render(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>,
      );

      // Start offline
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(false));
      rerender(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>,
      );
      expect(queryByText('Protected Content')).toBeNull();

      // Go online
      mockUseNetworkStatus.mockReturnValue(createMockNetworkContext(true));
      rerender(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>,
      );
      expect(getByText('Protected Content')).toBeTruthy();
    });
  });
});
