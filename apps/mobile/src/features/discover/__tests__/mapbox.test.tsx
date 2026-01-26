/**
 * Mapbox Integration Tests
 */
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { useRecentPlaces } from '@/hooks/useRecentPlaces';
import { useLocationPermission } from '@/hooks/useLocationPermission';

// Mock expo-location before any imports
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 41, longitude: 29, accuracy: 10 },
  }),
  openSettings: jest.fn(),
  Accuracy: { Balanced: 4 },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Mapbox Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
  });

  describe('usePlaceSearch', () => {
    it('should search places successfully', async () => {
      const mockResponse = {
        features: [
          {
            id: 'place.1',
            text: 'Istanbul',
            place_name: 'Istanbul, Turkey',
            center: [28.9784, 41.0082],
            place_type: ['place'],
          },
          {
            id: 'poi.1',
            text: 'Taksim Square',
            place_name: 'Taksim Square, Istanbul',
            center: [28.9784, 41.0082],
            place_type: ['poi'],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => usePlaceSearch());

      await act(async () => {
        await result.current.searchPlaces('Istanbul');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.results).toHaveLength(2);
        expect(result.current.results[0].name).toBe('Istanbul');
      });
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => usePlaceSearch());

      await act(async () => {
        await result.current.searchPlaces('Test');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Mapbox API error: 500');
        expect(result.current.results).toHaveLength(0);
      });
    });

    it('should clear results', async () => {
      const { result } = renderHook(() => usePlaceSearch());

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.results).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useLocationPermission', () => {
    it('should return undetermined initially', async () => {
      // Mock expo-location is set up at the top of the file
      (require('expo-location').getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('undetermined');
      });
    });
  });
});
