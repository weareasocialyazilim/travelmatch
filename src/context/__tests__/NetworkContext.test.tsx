/**
 * NetworkContext Tests
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NetworkProvider, useNetwork } from '../NetworkContext';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  refresh: jest.fn(),
}));

const TestComponent: React.FC = () => {
  const { isConnected, isInternetReachable, networkType, refresh } =
    useNetwork();

  return (
    <>
      <Text testID="isConnected">{isConnected.toString()}</Text>
      <Text testID="isInternetReachable">
        {isInternetReachable?.toString() ?? 'null'}
      </Text>
      <Text testID="networkType">{networkType ?? 'null'}</Text>
      <Text testID="refresh" onPress={refresh}>
        Refresh
      </Text>
    </>
  );
};

describe('NetworkContext', () => {
  let mockNetInfoListener: jest.Mock;
  let unsubscribeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeMock = jest.fn();
    mockNetInfoListener = jest.fn(() => unsubscribeMock);
    (NetInfo.addEventListener as jest.Mock).mockImplementation(
      mockNetInfoListener,
    );
    (NetInfo.refresh as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });
  });

  describe('NetworkProvider', () => {
    it('should render children', () => {
      const { getByTestId } = render(
        <NetworkProvider>
          <Text testID="child">Child</Text>
        </NetworkProvider>,
      );

      expect(getByTestId('child')).toBeTruthy();
    });

    it('should subscribe to network changes on mount', () => {
      render(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>,
      );

      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should unsubscribe from network changes on unmount', () => {
      const { unmount } = render(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>,
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('useNetwork', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useNetwork must be used within NetworkProvider');

      consoleSpy.mockRestore();
    });

    it('should provide default connected state', () => {
      const { getByTestId } = render(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>,
      );

      expect(getByTestId('isConnected').props.children).toBe('true');
    });
  });

  describe('network state updates', () => {
    it('should update when network changes to offline', async () => {
      const { getByTestId } = render(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>,
      );

      // Simulate network going offline
      const listener = mockNetInfoListener.mock.calls[0][0];
      act(() => {
        listener({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
        });
      });

      await waitFor(() => {
        expect(getByTestId('isConnected').props.children).toBe('false');
      });
    });

    it('should update when network comes back online', async () => {
      const { getByTestId } = render(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>,
      );

      const listener = mockNetInfoListener.mock.calls[0][0];

      // Go offline first
      act(() => {
        listener({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
        });
      });

      // Come back online
      act(() => {
        listener({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        });
      });

      await waitFor(() => {
        expect(getByTestId('isConnected').props.children).toBe('true');
      });
    });
  });

  describe('refresh', () => {
    it('should refresh network state', async () => {
      const { getByTestId } = render(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>,
      );

      await act(async () => {
        await getByTestId('refresh').props.onPress();
      });

      expect(NetInfo.refresh).toHaveBeenCalled();
    });
  });

  describe('network type', () => {
    it('should report wifi connection type', async () => {
      const { getByTestId } = render(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>,
      );

      const listener = mockNetInfoListener.mock.calls[0][0];
      act(() => {
        listener({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        });
      });

      await waitFor(() => {
        expect(getByTestId('networkType').props.children).toBe('wifi');
      });
    });

    it('should report cellular connection type', async () => {
      const { getByTestId } = render(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>,
      );

      const listener = mockNetInfoListener.mock.calls[0][0];
      act(() => {
        listener({
          isConnected: true,
          isInternetReachable: true,
          type: 'cellular',
        });
      });

      await waitFor(() => {
        expect(getByTestId('networkType').props.children).toBe('cellular');
      });
    });
  });
});
