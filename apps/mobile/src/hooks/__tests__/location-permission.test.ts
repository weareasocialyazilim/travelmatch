/**
 * useLocationPermission Hook Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useLocationPermission } from '../useLocationPermission';

// Mock expo-location
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  openSettings: jest.fn(),
  Accuracy: { Balanced: 4 },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('useLocationPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undetermined initially', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'undetermined',
    });

    const { result } = renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(result.current.permissionStatus).toBe('undetermined');
    });
  });

  it('should request permission when requested', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'undetermined',
    });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    const { result } = renderHook(() => useLocationPermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.hasPermission).toBe(true);
  });

  it('should handle permission denial', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'undetermined',
    });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });

    const { result } = renderHook(() => useLocationPermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.hasPermission).toBe(false);
    expect(result.current.permissionStatus).toBe('denied');
  });

  it('should get current location when granted', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 41.0082,
        longitude: 28.9784,
        accuracy: 10,
      },
    });

    const { result } = renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(result.current.currentLocation).toEqual({
        latitude: 41.0082,
        longitude: 28.9784,
        accuracy: 10,
      });
    });
  });

  it('should fallback to last known location on error after retries', async () => {
    // P2 FIX: Updated test - with retry mechanism, we get null fallback after retries
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
      new Error('Location unavailable'),
    );

    const { result } = renderHook(() => useLocationPermission());

    // After retries are exhausted, location should be null (no last known)
    await waitFor(() => {
      expect(result.current.currentLocation).toBe(null);
    }, { timeout: 10000 });
  });
});
