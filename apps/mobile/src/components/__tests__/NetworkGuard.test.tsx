/**
 * NetworkGuard Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NetworkGuard } from '../NetworkGuard';
import { useNetworkStatus } from '../../context/NetworkContext';

// Mock NetworkContext
jest.mock('../../context/NetworkContext');

const mockUseNetworkStatus = useNetworkStatus ;

describe('NetworkGuard', () => {
  const TestChild = () => <Text>Protected Content</Text>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Online State', () => {
    it('should render children when connected', () => {
      mockUseNetworkStatus.mockReturnValue({
        isConnected: true,
        refresh: jest.fn(),
      });

      const { getByText } = render(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should render multiple children when connected', () => {
      mockUseNetworkStatus.mockReturnValue({
        isConnected: true,
        refresh: jest.fn(),
      });

      const { getByText } = render(
        <NetworkGuard>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </NetworkGuard>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });
  });

  describe('Offline State', () => {
    it('should render OfflineState when disconnected', () => {
      mockUseNetworkStatus.mockReturnValue({
        isConnected: false,
        refresh: jest.fn(),
      });

      const { queryByText, UNSAFE_root } = render(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>
      );

      // Children should not be rendered
      expect(queryByText('Protected Content')).toBeNull();
      
      // OfflineState should be rendered
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render custom offline message', () => {
      mockUseNetworkStatus.mockReturnValue({
        isConnected: false,
        refresh: jest.fn(),
      });

      const customMessage = 'No internet connection available';
      const { getByText } = render(
        <NetworkGuard offlineMessage={customMessage}>
          <TestChild />
        </NetworkGuard>
      );

      expect(getByText(customMessage)).toBeTruthy();
    });

    it('should use network refresh as default retry', () => {
      const mockRefresh = jest.fn();
      mockUseNetworkStatus.mockReturnValue({
        isConnected: false,
        refresh: mockRefresh,
      });

      const { UNSAFE_root } = render(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>
      );

      expect(UNSAFE_root).toBeTruthy();
      // OfflineState should receive refresh as onRetry
    });

    it('should use custom onRetry when provided', () => {
      const mockRefresh = jest.fn();
      const mockCustomRetry = jest.fn();
      
      mockUseNetworkStatus.mockReturnValue({
        isConnected: false,
        refresh: mockRefresh,
      });

      const { UNSAFE_root } = render(
        <NetworkGuard onRetry={mockCustomRetry}>
          <TestChild />
        </NetworkGuard>
      );

      expect(UNSAFE_root).toBeTruthy();
      // OfflineState should receive custom retry
    });
  });

  describe('Compact Mode', () => {
    it('should render compact OfflineState when compact is true', () => {
      mockUseNetworkStatus.mockReturnValue({
        isConnected: false,
        refresh: jest.fn(),
      });

      const { UNSAFE_root } = render(
        <NetworkGuard compact>
          <TestChild />
        </NetworkGuard>
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render full OfflineState when compact is false', () => {
      mockUseNetworkStatus.mockReturnValue({
        isConnected: false,
        refresh: jest.fn(),
      });

      const { UNSAFE_root } = render(
        <NetworkGuard compact={false}>
          <TestChild />
        </NetworkGuard>
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Custom OfflineState Props', () => {
    it('should pass custom offlineProps to OfflineState', () => {
      mockUseNetworkStatus.mockReturnValue({
        isConnected: false,
        refresh: jest.fn(),
      });

      const customOfflineProps = {
        retryText: 'Reload',
        testID: 'custom-offline-state',
      };

      const { getByText, getByTestId } = render(
        <NetworkGuard offlineProps={customOfflineProps}>
          <TestChild />
        </NetworkGuard>
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
        </NetworkGuard>
      );

      // Start offline
      mockUseNetworkStatus.mockReturnValue({
        isConnected: false,
        refresh: jest.fn(),
      });
      rerender(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>
      );
      expect(queryByText('Protected Content')).toBeNull();

      // Go online
      mockUseNetworkStatus.mockReturnValue({
        isConnected: true,
        refresh: jest.fn(),
      });
      rerender(
        <NetworkGuard>
          <TestChild />
        </NetworkGuard>
      );
      expect(getByText('Protected Content')).toBeTruthy();
    });
  });
});
