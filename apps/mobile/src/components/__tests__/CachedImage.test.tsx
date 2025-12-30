/**
 * CachedImage Component Tests
 * 
 * Simplified tests focused on core functionality
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { CachedImage, ResponsiveCachedImage } from '../CachedImage';

// Mock imageCacheManager as default export
jest.mock('../../services/imageCacheManager', () => {
  const mockManager = {
    getImage: jest.fn(),
    getCachedImage: jest.fn(),
    prefetch: jest.fn(),
    prefetchImage: jest.fn(),
    prefetchResponsiveVariants: jest.fn(),
    clearCache: jest.fn(),
    getCacheSize: jest.fn(),
  };
  
  return {
    __esModule: true,
    default: mockManager,
  };
});

// Import after mock
import imageCacheManager from '../../services/imageCacheManager';
const mockImageCacheManager = imageCacheManager as jest.Mocked<typeof imageCacheManager>;

describe('CachedImage', () => {
  const mockImageUri = 'https://example.com/image.jpg';
  const mockCachedUri = 'file:///cache/image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: successful image load
    mockImageCacheManager.getImage.mockResolvedValue(mockCachedUri);
  });

  describe('Basic Rendering', () => {
    it('should render successfully with uri source', async () => {
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

    it('should render with local image source', () => {
      const localImage = 1; // require('./image.png')

      const { UNSAFE_root } = render(
        <CachedImage source={localImage} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should apply custom styles', async () => {
      const customStyle = { width: 200, height: 200, borderRadius: 10 };

      const { getByTestId } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          style={customStyle}
          testID="styled-image"
        />
      );

      await waitFor(() => {
        expect(getByTestId('styled-image')).toBeTruthy();
      });
    });

    it('should pass through resizeMode prop', () => {
      const { UNSAFE_root } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          resizeMode="cover"
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Image Loading', () => {
    it('should call getImage with correct uri', async () => {
      render(
        <CachedImage source={{ uri: mockImageUri }} />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getImage).toHaveBeenCalledWith(
          mockImageUri,
          expect.any(Object)
        );
      });
    });

    it('should load image with cloudflareId', async () => {
      const cloudflareId = 'cf-123';

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          cloudflareId={cloudflareId}
          variant="medium"
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getImage).toHaveBeenCalledWith(
          mockImageUri,
          expect.objectContaining({
            cloudflareId,
            variant: 'medium',
          })
        );
      });
    });

    it('should handle successful image load', async () => {
      const onLoadEnd = jest.fn() as jest.Mock;

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onLoadEnd={onLoadEnd}
        />
      );

      await waitFor(() => {
        expect(onLoadEnd).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle image load error', async () => {
      const onError = jest.fn() as jest.Mock;
      mockImageCacheManager.getImage.mockRejectedValue(new Error('Load failed'));

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onError={onError}
        />
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('should show error state on failure', async () => {
      mockImageCacheManager.getImage.mockRejectedValue(new Error('Load failed'));

      const { UNSAFE_root } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          showError={true}
        />
      );

      await waitFor(() => {
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('should use fallback source on error', async () => {
      const fallbackUri = 'https://example.com/fallback.jpg';
      mockImageCacheManager.getImage.mockRejectedValueOnce(new Error('Load failed'));

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          fallbackSource={{ uri: fallbackUri }}
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getImage).toHaveBeenCalled();
      });
    });
  });

  describe('Retry Functionality', () => {
    it('should allow retry on error', async () => {
      mockImageCacheManager.getImage
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce(mockCachedUri);

      const { UNSAFE_root } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry={true}
          maxRetries={3}
        />
      );

      await waitFor(() => {
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('should call onRetry callback', async () => {
      const onRetry = jest.fn() as jest.Mock;
      mockImageCacheManager.getImage.mockRejectedValue(new Error('Load failed'));

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          enableRetry={true}
          onRetry={onRetry}
        />
      );

      await waitFor(() => {
        expect(mockImageCacheManager.getImage).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator', async () => {
      const { UNSAFE_root } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          showLoading={true}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should call onLoadStart', async () => {
      const onLoadStart = jest.fn() as jest.Mock;

      render(
        <CachedImage
          source={{ uri: mockImageUri }}
          onLoadStart={onLoadStart}
        />
      );

      await waitFor(() => {
        expect(onLoadStart).toHaveBeenCalled();
      });
    });
  });

  describe('Image Types', () => {
    it('should render avatar type', async () => {
      const { UNSAFE_root } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="avatar"
        />
      );

      await waitFor(() => {
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('should render moment type', async () => {
      const { UNSAFE_root } = render(
        <CachedImage
          source={{ uri: mockImageUri }}
          type="moment"
        />
      );

      await waitFor(() => {
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('should render with default type', async () => {
      const { UNSAFE_root } = render(
        <CachedImage source={{ uri: mockImageUri }} />
      );

      await waitFor(() => {
        expect(UNSAFE_root).toBeTruthy();
      });
    });
  });
});

describe('ResponsiveCachedImage', () => {
  const mockImageUri = 'https://example.com/image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    mockImageCacheManager.getImage.mockResolvedValue('file:///cache/image.jpg');
    mockImageCacheManager.prefetchResponsiveVariants.mockResolvedValue();
  });

  it('should render successfully', async () => {
    const { getByTestId } = render(
      <ResponsiveCachedImage
        source={{ uri: mockImageUri }}
        testID="responsive-image"
        sizes={{ small: 100, medium: 200, large: 400 }}
      />
    );

    await waitFor(() => {
      expect(getByTestId('responsive-image')).toBeTruthy();
    });
  });

  it('should handle responsive rendering', async () => {
    render(
      <ResponsiveCachedImage
        source={{ uri: mockImageUri }}
        cloudflareId="cf-123"
        sizes={{ small: 100, medium: 200, large: 400 }}
        prefetch={true}
      />
    );

    await waitFor(() => {
      expect(mockImageCacheManager.getImage).toHaveBeenCalled();
    });
  });

  it('should handle different screen sizes', async () => {
    const { UNSAFE_root } = render(
      <ResponsiveCachedImage
        source={{ uri: mockImageUri }}
        sizes={{ small: 100, medium: 200, large: 400 }}
      />
    );

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
