/**
 * CachedImage Network Scenario Tests
 *
 * Tests for network conditions:
 * 1. Slow network (high latency)
 * 2. Network timeout
 * 3. Offline mode
 * 4. Retry logic with different scenarios
 */

import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { CachedImage } from '../CachedImage';
import imageCacheManager from '../../services/imageCacheManager';

// Mock dependencies
jest.mock('../../services/imageCacheManager', () => ({
  __esModule: true,
  default: {
    getImage: jest.fn(),
  },
}));

const mockImageCacheManager = imageCacheManager;

describe('CachedImage - Network Scenarios', () => {
  const mockImageUri = 'https://example.com/image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Slow Network', () => {
    it('should show loading state for slow network', async () => {
      // Simulate slow network (3 seconds)
      mockImageCacheManager.getImage.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('file:///cache/image.jpg'), 3000);
          }),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          style={{ width: 200, height: 200 }}
        />,
      );

      // Should show loading state
      expect(getByText('Yükleniyor...')).toBeTruthy();

      // Fast-forward time
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockImageCacheManager.getImage).toHaveBeenCalledWith(
          mockImageUri,
          expect.any(Object),
        );
      });
    });

    it('should eventually load image on slow network', async () => {
      const cachedUri = 'file:///cache/image.jpg';
      mockImageCacheManager.getImage.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(cachedUri), 2000);
          }),
      );

      const onLoadEnd = jest.fn() as jest.Mock;

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onLoadEnd={onLoadEnd}
          style={{ width: 200, height: 200 }}
        />,
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onLoadEnd).toHaveBeenCalled();
      });
    });
  });

  describe('Network Timeout', () => {
    it('should timeout after specified duration (default 10s)', async () => {
      // Simulate network hang
      mockImageCacheManager.getImage.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const onError = jest.fn() as jest.Mock;

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onError={onError}
          style={{ width: 200, height: 200 }}
        />,
      );

      // Fast-forward past default timeout (10s)
      jest.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(getByText(/Görsel yüklenemedi/)).toBeTruthy();
      });
    });

    it('should respect custom timeout value', async () => {
      mockImageCacheManager.getImage.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const onError = jest.fn() as jest.Mock;

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          networkTimeout={5000}
          onError={onError}
          style={{ width: 200, height: 200 }}
        />,
      );

      // Fast-forward past custom timeout (5s)
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Network timeout',
          }),
        );
      });
    });

    it('should show retry button on timeout', async () => {
      mockImageCacheManager.getImage.mockImplementation(
        () => new Promise(() => {}),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry
          style={{ width: 200, height: 200 }}
        />,
      );

      jest.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(getByText(/Tekrar Dene/)).toBeTruthy();
      });
    });
  });

  describe('Offline Mode', () => {
    it('should handle offline error gracefully', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Network request failed'),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="moment"
          style={{ width: 200, height: 200 }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Moment görseli yüklenemedi')).toBeTruthy();
      });
    });

    it('should use fallback source when offline', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Network request failed'),
      );

      const fallbackUri = 'file:///cache/fallback.jpg';

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          fallbackSource={{ uri: fallbackUri }}
          style={{ width: 200, height: 200 }}
        />,
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getImage).toHaveBeenCalled();
      });
    });

    it('should show offline-appropriate error message', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Network request failed'),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="avatar"
          style={{ width: 100, height: 100 }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Profil fotoğrafı yüklenemedi')).toBeTruthy();
      });
    });
  });

  describe('Retry Logic', () => {
    it('should allow retry on error', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Network error'),
      );

      const onRetry = jest.fn() as jest.Mock;

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry
          onRetry={onRetry}
          style={{ width: 200, height: 200 }}
        />,
      );

      await waitFor(() => {
        expect(getByText(/Tekrar Dene/)).toBeTruthy();
      });

      const retryButton = getByText(/Tekrar Dene/);
      fireEvent.press(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });

    it('should track retry count', async () => {
      let callCount = 0;
      mockImageCacheManager.getImage.mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error('Network error'));
      });

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry
          maxRetries={3}
          retryDelay={100}
          style={{ width: 200, height: 200 }}
        />,
      );

      // First load fails
      await waitFor(() => {
        expect(getByText(/Tekrar Dene/)).toBeTruthy();
      });

      // Retry 1
      fireEvent.press(getByText(/Tekrar Dene/));
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(getByText(/Tekrar Dene \(1\/3\)/)).toBeTruthy();
      });

      // Retry 2
      fireEvent.press(getByText(/Tekrar Dene \(1\/3\)/));
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(getByText(/Tekrar Dene \(2\/3\)/)).toBeTruthy();
      });
    });

    it('should stop retrying after max retries', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Network error'),
      );

      const { getByText, queryByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry
          maxRetries={2}
          retryDelay={100}
          style={{ width: 200, height: 200 }}
        />,
      );

      // Initial load fails
      await waitFor(() => {
        expect(getByText(/Tekrar Dene/)).toBeTruthy();
      });

      // Retry 1
      fireEvent.press(getByText(/Tekrar Dene/));
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(getByText(/Tekrar Dene \(1\/2\)/)).toBeTruthy();
      });

      // Retry 2 (max reached)
      fireEvent.press(getByText(/Tekrar Dene \(1\/2\)/));
      jest.advanceTimersByTime(100);

      // Should show max retries message (button disappears after max retries)
      await waitFor(() => {
        expect(getByText('Maksimum deneme sayısına ulaşıldı')).toBeTruthy();
        expect(queryByText(/Tekrar Dene/)).toBeNull();
      });
    });

    // Test reset retry count on successful load
    it('should reset retry count on successful load', async () => {
      // First call fails, subsequent calls succeed
      mockImageCacheManager.getImage
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValue('file:///cache/image.jpg');

      const { getByText, queryByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry
          retryDelay={100}
          style={{ width: 200, height: 200 }}
        />,
      );

      // First attempt fails - wait for retry button
      await waitFor(() => {
        expect(getByText(/Tekrar Dene/)).toBeTruthy();
      });

      // Press retry button and advance timer
      fireEvent.press(getByText(/Tekrar Dene/));
      await act(async () => {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      });

      // After successful retry, retry button should be gone
      await waitFor(() => {
        expect(queryByText(/Tekrar Dene/)).toBeNull();
      });
    });

    it('should respect retry delay', async () => {
      // First call fails, then succeeds on retry
      mockImageCacheManager.getImage
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('cached-path');

      const { getByText, queryByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry
          retryDelay={2000}
          style={{ width: 200, height: 200 }}
        />,
      );

      // Wait for error state with retry button
      await waitFor(() => {
        expect(getByText(/Tekrar Dene/)).toBeTruthy();
      });

      // Initial call count (should be 1 from first render)
      const initialCallCount = mockImageCacheManager.getImage.mock.calls.length;
      expect(initialCallCount).toBe(1);

      // Press retry button - this triggers the retry logic
      fireEvent.press(getByText(/Tekrar Dene/));

      // Advance timers to complete the retry delay
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        // Should have at least one more call after retry
        expect(
          mockImageCacheManager.getImage.mock.calls.length,
        ).toBeGreaterThan(initialCallCount);
      });

      // Should now show success (no retry button)
      await waitFor(() => {
        expect(queryByText(/Tekrar Dene/)).toBeNull();
      });
    });
  });

  describe('Type-Specific Fallbacks', () => {
    it('should show avatar-specific fallback', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Load failed'),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="avatar"
          style={{ width: 100, height: 100 }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Profil fotoğrafı yüklenemedi')).toBeTruthy();
      });
    });

    it('should show moment-specific fallback', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Load failed'),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="moment"
          style={{ width: 300, height: 300 }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Moment görseli yüklenemedi')).toBeTruthy();
      });
    });

    it('should show trip-specific fallback', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Load failed'),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="trip"
          style={{ width: 300, height: 200 }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Seyahat görseli yüklenemedi')).toBeTruthy();
      });
    });

    it('should show gift-specific fallback', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Load failed'),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="gift"
          style={{ width: 150, height: 150 }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Hediye görseli yüklenemedi')).toBeTruthy();
      });
    });

    it('should show default fallback for unknown type', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Load failed'),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="default"
          style={{ width: 200, height: 200 }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Görsel yüklenemedi')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very slow network (20s)', async () => {
      mockImageCacheManager.getImage.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('file:///cache/image.jpg'), 20000);
          }),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          networkTimeout={25000}
          style={{ width: 200, height: 200 }}
        />,
      );

      // Should show loading
      expect(getByText('Yükleniyor...')).toBeTruthy();

      // Fast-forward
      jest.advanceTimersByTime(20000);

      await waitFor(() => {
        expect(mockImageCacheManager.getImage).toHaveBeenCalled();
      });
    });

    it('should handle intermittent network (fails then succeeds)', async () => {
      let attempt = 0;
      mockImageCacheManager.getImage.mockImplementation(() => {
        attempt++;
        if (attempt === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve('file:///cache/image.jpg');
      });

      const { getByText, queryByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry
          retryDelay={500}
          style={{ width: 200, height: 200 }}
        />,
      );

      // First attempt fails
      await waitFor(() => {
        expect(getByText(/Tekrar Dene/)).toBeTruthy();
      });

      // Retry succeeds
      fireEvent.press(getByText(/Tekrar Dene/));
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(queryByText(/Tekrar Dene/)).toBeNull();
      });
    });

    it('should handle empty URI gracefully', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Invalid URI'),
      );

      const { getByText } = render(
        <CachedImage
          source={{ uri: '' }}
          style={{ width: 200, height: 200 }}
        />,
      );

      await waitFor(() => {
        expect(getByText(/Görsel yüklenemedi/)).toBeTruthy();
      });
    });
  });

  describe('Loading State Transitions', () => {
    it('should transition from idle → loading → success', async () => {
      mockImageCacheManager.getImage.mockResolvedValue(
        'file:///cache/image.jpg',
      );

      const onLoadStart = jest.fn() as jest.Mock;
      const onLoadEnd = jest.fn() as jest.Mock;

      const { getByText, queryByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          style={{ width: 200, height: 200 }}
        />,
      );

      // Should show loading
      expect(getByText('Yükleniyor...')).toBeTruthy();
      expect(onLoadStart).toHaveBeenCalled();

      await waitFor(() => {
        expect(onLoadEnd).toHaveBeenCalled();
        expect(queryByText('Yükleniyor...')).toBeNull();
      });
    });

    it('should transition from idle → loading → error', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(
        new Error('Load failed'),
      );

      const onLoadStart = jest.fn() as jest.Mock;
      const onError = jest.fn() as jest.Mock;

      const { getByText, queryByText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onLoadStart={onLoadStart}
          onError={onError}
          style={{ width: 200, height: 200 }}
        />,
      );

      // Should show loading
      expect(getByText('Yükleniyor...')).toBeTruthy();
      expect(onLoadStart).toHaveBeenCalled();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(queryByText('Yükleniyor...')).toBeNull();
        expect(getByText(/Görsel yüklenemedi/)).toBeTruthy();
      });
    });
  });
});
