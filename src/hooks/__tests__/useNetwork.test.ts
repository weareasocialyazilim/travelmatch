/**
 * useNetwork Hook Tests
 * Testing network connectivity monitoring
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetwork } from '../useNetwork';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

describe('useNetwork', () => {
  const mockNetInfoFetch = NetInfo.fetch as jest.Mock;
  const mockAddEventListener = NetInfo.addEventListener as jest.Mock;
  let unsubscribeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeMock = jest.fn();
    mockAddEventListener.mockReturnValue(unsubscribeMock);
    mockNetInfoFetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });
  });

  describe('initial state', () => {
    it('should have default online state', () => {
      const { result } = renderHook(() => useNetwork());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('should fetch initial network state on mount', async () => {
      renderHook(() => useNetwork());

      await waitFor(() => {
        expect(mockNetInfoFetch).toHaveBeenCalled();
      });
    });

    it('should subscribe to network changes', () => {
      renderHook(() => useNetwork());

      expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useNetwork());

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('network status', () => {
    it('should return correct wifi status', async () => {
      mockNetInfoFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      const { result } = renderHook(() => useNetwork());

      await waitFor(() => {
        expect(result.current.networkStatus.isWifi).toBe(true);
        expect(result.current.networkStatus.isCellular).toBe(false);
      });
    });

    it('should return correct cellular status', async () => {
      mockNetInfoFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
      });

      const { result } = renderHook(() => useNetwork());

      await waitFor(() => {
        expect(result.current.networkStatus.isCellular).toBe(true);
        expect(result.current.networkStatus.isWifi).toBe(false);
      });
    });

    it('should detect offline state', async () => {
      mockNetInfoFetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      const { result } = renderHook(() => useNetwork());

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
        expect(result.current.isOffline).toBe(true);
      });
    });

    it('should handle null isInternetReachable', async () => {
      mockNetInfoFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: null,
        type: 'wifi',
      });

      const { result } = renderHook(() => useNetwork());

      await waitFor(() => {
        // When isInternetReachable is null, should still be considered online if connected
        expect(result.current.isOnline).toBe(true);
      });
    });

    it('should handle isInternetReachable false with connection', async () => {
      mockNetInfoFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: false,
        type: 'wifi',
      });

      const { result } = renderHook(() => useNetwork());

      await waitFor(() => {
        // Connected but no internet reachability
        expect(result.current.isOnline).toBe(false);
        expect(result.current.isOffline).toBe(true);
      });
    });
  });

  describe('checkConnection', () => {
    it('should manually check connection', async () => {
      const { result } = renderHook(() => useNetwork());

      mockNetInfoFetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      let isConnected: boolean | undefined;
      await act(async () => {
        isConnected = await result.current.checkConnection();
      });

      expect(isConnected).toBe(true);
      expect(mockNetInfoFetch).toHaveBeenCalled();
    });

    it('should return false when offline', async () => {
      const { result } = renderHook(() => useNetwork());

      mockNetInfoFetch.mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      let isConnected: boolean | undefined;
      await act(async () => {
        isConnected = await result.current.checkConnection();
      });

      expect(isConnected).toBe(false);
    });

    it('should handle null isConnected', async () => {
      const { result } = renderHook(() => useNetwork());

      mockNetInfoFetch.mockResolvedValueOnce({
        isConnected: null,
        isInternetReachable: null,
        type: 'unknown',
      });

      let isConnected: boolean | undefined;
      await act(async () => {
        isConnected = await result.current.checkConnection();
      });

      expect(isConnected).toBe(false);
    });
  });

  describe('network change events', () => {
    it('should update status on network change', async () => {
      let eventCallback: ((state: unknown) => void) | undefined;
      mockAddEventListener.mockImplementation((callback) => {
        eventCallback = callback;
        return unsubscribeMock;
      });

      const { result } = renderHook(() => useNetwork());

      // Initially wifi
      await waitFor(() => {
        expect(result.current.networkStatus.isWifi).toBe(true);
      });

      // Simulate network change to cellular
      act(() => {
        if (eventCallback) {
          eventCallback({
            isConnected: true,
            isInternetReachable: true,
            type: 'cellular',
          });
        }
      });

      await waitFor(() => {
        expect(result.current.networkStatus.isCellular).toBe(true);
        expect(result.current.networkStatus.isWifi).toBe(false);
      });
    });

    it('should handle going offline', async () => {
      let eventCallback: ((state: unknown) => void) | undefined;
      mockAddEventListener.mockImplementation((callback) => {
        eventCallback = callback;
        return unsubscribeMock;
      });

      const { result } = renderHook(() => useNetwork());

      // Initially online
      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      // Simulate going offline
      act(() => {
        if (eventCallback) {
          eventCallback({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
          });
        }
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
        expect(result.current.isOffline).toBe(true);
      });
    });
  });

  describe('return value', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useNetwork());

      expect(result.current).toHaveProperty('isOnline');
      expect(result.current).toHaveProperty('isOffline');
      expect(result.current).toHaveProperty('networkStatus');
      expect(result.current).toHaveProperty('checkConnection');
    });

    it('should return networkStatus with all properties', () => {
      const { result } = renderHook(() => useNetwork());

      expect(result.current.networkStatus).toHaveProperty('isConnected');
      expect(result.current.networkStatus).toHaveProperty(
        'isInternetReachable',
      );
      expect(result.current.networkStatus).toHaveProperty('type');
      expect(result.current.networkStatus).toHaveProperty('isWifi');
      expect(result.current.networkStatus).toHaveProperty('isCellular');
    });
  });
});
