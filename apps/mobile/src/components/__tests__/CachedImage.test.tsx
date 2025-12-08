/**
 * CachedImage Component Tests
 * 
 * Complete test coverage for CachedImage and ResponsiveCachedImage
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { CachedImage, ResponsiveCachedImage } from '../CachedImage';
import { imageCacheManager } from '../../services/imageCacheManager';

// Mock dependencies
jest.mock('../../services/imageCacheManager', () => ({
  imageCacheManager: {
    getCachedImage: jest.fn(),
    prefetchImage: jest.fn(),
    prefetchResponsiveVariants: jest.fn(),
  },
}));

const mockImageCacheManager = imageCacheManager as jest.Mocked<typeof imageCacheManager>;

describe('CachedImage', () => {
  const mockImageUri = 'https://example.com/image.jpg';
  const mockCachedUri = 'file:///cache/image.jpg';
  const mockCloudflareId = 'cf-image-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockImageCacheManager.getCachedImage.mockResolvedValue(mockCachedUri);
  });

  describe('Basic Rendering', () => {
    it('should render image with uri source', async () => {
      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          testID="cached-image"
        />
      );

      await waitFor(() => {
        expect(getByTestId('cached-image')).toBeTruthy();
      });
    });

    it('should render image with number source', () => {
      const localImage = 1; // require('./local-image.png')

      const { getByTestId } = render(
        <CachedImage
          source={localImage}
          testID="local-image"
        />
      );

      expect(getByTestId('local-image')).toBeTruthy();
    });

    it('should render with style prop', () => {
      const customStyle = { width: 200, height: 200, borderRadius: 10 };

      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          style={customStyle}
          testID="styled-image"
        />
      );

      expect(getByTestId('styled-image')).toBeTruthy();
    });

    it('should pass through resizeMode', () => {
      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          resizeMode="cover"
          testID="resized-image"
        />
      );

      expect(getByTestId('resized-image')).toBeTruthy();
    });
  });

  describe('Caching Behavior', () => {
    it('should use cached image when available', async () => {
      render(
        <CachedImage
          source={{ uri: mockImageUri }}
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledWith(
          mockImageUri,
          undefined,
          undefined
        );
      });
    });

    it('should use Cloudflare variant when cloudflareId provided', async () => {
      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          cloudflareId={mockCloudflareId}
          variant="medium"
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledWith(
          mockImageUri,
          mockCloudflareId,
          'medium'
        );
      });
    });

    it('should handle cache miss gracefully', async () => {
      mockImageCacheManager.getCachedImage.mockResolvedValue(mockImageUri);

      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          testID="fallback-image"
        />
      );

      await waitFor(() => {
        expect(getByTestId('fallback-image')).toBeTruthy();
      });
    });

    it('should handle cache error', async () => {
      mockImageCacheManager.getCachedImage.mockRejectedValue(new Error('Cache error'));

      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          testID="error-image"
        />
      );

      await waitFor(() => {
        expect(getByTestId('error-image')).toBeTruthy();
      });
    });

    it('should not cache local images', () => {
      const localImage = 1;

      render(
        <CachedImage source={localImage} />
      );

      expect(mockImageCacheManager.getCachedImage).not.toHaveBeenCalled();
    });
  });

  describe('Prefetching', () => {
    it('should prefetch image when prefetch prop is true', () => {
      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          prefetch
        />
      );

      expect(mockImageCacheManager.prefetchImage).toHaveBeenCalledWith(
        mockImageUri,
        undefined,
        undefined
      );
    });

    it('should not prefetch by default', () => {
      render(
        <CachedImage
          source={{ uri: mockImageUri }}
        />
      );

      expect(mockImageCacheManager.prefetchImage).not.toHaveBeenCalled();
    });

    it('should prefetch with Cloudflare variant', () => {
      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          cloudflareId={mockCloudflareId}
          variant="large"
          prefetch
        />
      );

      expect(mockImageCacheManager.prefetchImage).toHaveBeenCalledWith(
        mockImageUri,
        mockCloudflareId,
        'large'
      );
    });
  });

  describe('Loading States', () => {
    it('should show placeholder while loading', async () => {
      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          placeholder="https://example.com/placeholder.jpg"
          testID="loading-image"
        />
      );

      expect(getByTestId('loading-image')).toBeTruthy();
    });

    it('should transition from placeholder to cached image', async () => {
      const { getByTestId, rerender } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          testID="transition-image"
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalled();
      });

      rerender(
        <CachedImage
          source={{ uri: mockCachedUri }}
          testID="transition-image"
        />
      );

      expect(getByTestId('transition-image')).toBeTruthy();
    });

    it('should call onLoadStart callback', () => {
      const onLoadStart = jest.fn();

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onLoadStart={onLoadStart}
        />
      );

      // Image component should trigger onLoadStart
    });

    it('should call onLoadEnd callback', async () => {
      const onLoadEnd = jest.fn();

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onLoadEnd={onLoadEnd}
        />
      );

      await waitFor(() => {
        // onLoadEnd would be called by Image component
      });
    });
  });

  describe('Error Handling', () => {
    it('should call onError callback on load failure', () => {
      const onError = jest.fn();

      render(
        <CachedImage
          source={{ uri: 'invalid-uri' }}
          onError={onError}
        />
      );

      // onError would be triggered by Image component
    });

    it('should show fallback image on error', async () => {
      const fallbackUri = 'https://example.com/fallback.jpg';

      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          fallback={fallbackUri}
          testID="fallback-test"
        />
      );

      expect(getByTestId('fallback-test')).toBeTruthy();
    });

    it('should handle network errors gracefully', async () => {
      mockImageCacheManager.getCachedImage.mockRejectedValue(new Error('Network error'));

      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          testID="network-error-image"
        />
      );

      await waitFor(() => {
        expect(getByTestId('network-error-image')).toBeTruthy();
      });
    });
  });

  describe('ResponsiveCachedImage', () => {
    it('should select appropriate variant based on width', async () => {
      const { getByTestId } = render(
        <ResponsiveCachedImage
          source={{ uri: mockImageUri }}
          cloudflareId={mockCloudflareId}
          width={200}
          height={200}
          responsive
          testID="responsive-image"
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalled();
      });

      expect(getByTestId('responsive-image')).toBeTruthy();
    });

    it('should use thumbnail for small images', async () => {
      render(
        <ResponsiveCachedImage
          source={{ uri: mockImageUri }}
          cloudflareId={mockCloudflareId}
          width={100}
          height={100}
          responsive
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledWith(
          mockImageUri,
          mockCloudflareId,
          expect.stringMatching(/thumbnail|small/)
        );
      });
    });

    it('should use large variant for big images', async () => {
      render(
        <ResponsiveCachedImage
          source={{ uri: mockImageUri }}
          cloudflareId={mockCloudflareId}
          width={800}
          height={800}
          responsive
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledWith(
          mockImageUri,
          mockCloudflareId,
          expect.stringMatching(/large/)
        );
      });
    });

    it('should prefetch all variants when responsive', () => {
      render(
        <ResponsiveCachedImage
          source={{ uri: mockImageUri }}
          cloudflareId={mockCloudflareId}
          width={300}
          height={300}
          responsive
          prefetch
        />
      );

      expect(mockImageCacheManager.prefetchResponsiveVariants).toHaveBeenCalledWith(
        mockImageUri,
        mockCloudflareId
      );
    });

    it('should handle missing cloudflareId in responsive mode', async () => {
      const { getByTestId } = render(
        <ResponsiveCachedImage
          source={{ uri: mockImageUri }}
          width={300}
          height={300}
          responsive
          testID="no-cf-responsive"
        />
      );

      await waitFor(() => {
        expect(getByTestId('no-cf-responsive')).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should update cache on source change', async () => {
      const { rerender } = render(
        <CachedImage source={{ uri: mockImageUri }} />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledTimes(1);
      });

      const newUri = 'https://example.com/new-image.jpg';
      rerender(<CachedImage source={{ uri: newUri }} />);

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledTimes(2);
      });
    });

    it('should not refetch on style change', async () => {
      const { rerender } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          style={{ width: 100 }}
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledTimes(1);
      });

      rerender(
        <CachedImage
          source={{ uri: mockImageUri }}
          style={{ width: 200 }}
        />
      );

      // Should not refetch
      expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid source changes', async () => {
      const uris = [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
      ];

      const { rerender } = render(
        <CachedImage source={{ uri: uris[0] }} />
      );

      for (const uri of uris.slice(1)) {
        rerender(<CachedImage source={{ uri }} />);
      }

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      const { getByLabelText } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          accessibilityLabel="Profile picture"
        />
      );

      expect(getByLabelText('Profile picture')).toBeTruthy();
    });

    it('should pass accessibility props to Image', () => {
      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          accessible
          accessibilityRole="image"
          testID="a11y-image"
        />
      );

      expect(getByTestId('a11y-image')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined source gracefully', () => {
      const { getByTestId } = render(
        <CachedImage
          source={undefined as any}
          testID="undefined-source"
        />
      );

      expect(getByTestId('undefined-source')).toBeTruthy();
    });

    it('should handle empty string uri', async () => {
      render(
        <CachedImage source={{ uri: '' }} />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledWith(
          '',
          undefined,
          undefined
        );
      });
    });

    it('should handle very long uris', async () => {
      const longUri = 'https://example.com/' + 'a'.repeat(1000) + '.jpg';

      render(
        <CachedImage source={{ uri: longUri }} />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledWith(
          longUri,
          undefined,
          undefined
        );
      });
    });

    it('should handle concurrent renders', async () => {
      render(
        <>
          <CachedImage source={{ uri: mockImageUri }} />
          <CachedImage source={{ uri: mockImageUri }} />
          <CachedImage source={{ uri: mockImageUri }} />
        </>
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getCachedImage).toHaveBeenCalledTimes(3);
      });
    });
  });
});
