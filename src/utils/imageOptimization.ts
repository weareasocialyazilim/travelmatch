/**
 * Image Optimization Utilities
 * Lazy loading, responsive images, and performance optimization
 */

import { useState, useEffect } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';

/**
 * Preload an image to cache it
 */
export const preloadImage = async (
  source: ImageSourcePropType,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof source === 'number') {
      // Local image (require)
      Image.resolveAssetSource(source);
      resolve();
    } else if (typeof source === 'object' && 'uri' in source && source.uri) {
      // Remote image
      Image.prefetch(source.uri)
        .then(() => resolve())
        .catch(reject);
    } else {
      resolve();
    }
  });
};

/**
 * Batch preload multiple images
 */
export const preloadImages = async (
  sources: ImageSourcePropType[],
): Promise<void> => {
  await Promise.all(sources.map(preloadImage));
};

/**
 * Hook for lazy loading images with loading state
 */
export function useLazyImage(source: ImageSourcePropType) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    preloadImage(source)
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setHasError(true);
      });
  }, [source]);

  return { isLoading, hasError };
}

/**
 * Get optimized image URI based on screen density
 * Supports responsive images by density (@1x, @2x, @3x)
 */
export const getOptimizedImageUri = (
  baseUri: string,
  density: 1 | 2 | 3 = 2,
): string => {
  if (!baseUri.startsWith('http')) {
    return baseUri; // Local images handled by require()
  }

  // For remote images, append density parameter if supported
  const separator = baseUri.includes('?') ? '&' : '?';
  return `${baseUri}${separator}density=${density}`;
};

/**
 * Get responsive image source based on width
 * Useful for different screen sizes
 */
export const getResponsiveImageSource = (
  baseUri: string,
  width: number,
): ImageSourcePropType => {
  if (!baseUri.startsWith('http')) {
    return { uri: baseUri };
  }

  // Round to common breakpoints for better caching
  const optimizedWidth = Math.ceil(width / 100) * 100;
  const separator = baseUri.includes('?') ? '&' : '?';

  return {
    uri: `${baseUri}${separator}w=${optimizedWidth}`,
  };
};

/**
 * Image cache manager
 */
class ImageCacheManager {
  private cache = new Map<string, boolean>();

  isCached(uri: string): boolean {
    return this.cache.has(uri);
  }

  markCached(uri: string): void {
    this.cache.set(uri, true);
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

export const imageCacheManager = new ImageCacheManager();

/**
 * Lazy Image Component Props
 */
export interface LazyImageConfig {
  /** Preload images when component mounts */
  eager?: boolean;
  /** Threshold for triggering load (0-1) */
  threshold?: number;
  /** Placeholder while loading */
  placeholder?: ImageSourcePropType;
  /** Retry on error */
  retryOnError?: boolean;
  /** Max retry attempts */
  maxRetries?: number;
}

/**
 * Hook for lazy loading images with intersection observer pattern
 */
export function useIntersectionLazyImage(
  source: ImageSourcePropType,
  config: LazyImageConfig = {},
) {
  const {
    eager = false,
    threshold: _threshold = 0.1,
    retryOnError = true,
    maxRetries = 3,
  } = config;

  const [isLoading, setIsLoading] = useState(!eager);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [shouldLoad, setShouldLoad] = useState(eager);

  useEffect(() => {
    if (!shouldLoad) return;

    setIsLoading(true);
    setHasError(false);

    preloadImage(source)
      .then(() => {
        setIsLoading(false);
        // Mark as cached
        if (typeof source === 'object' && 'uri' in source && source.uri) {
          imageCacheManager.markCached(source.uri);
        }
      })
      .catch(() => {
        if (retryOnError && retryCount < maxRetries) {
          // Retry after delay
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
        } else {
          setIsLoading(false);
          setHasError(true);
        }
      });
  }, [source, shouldLoad, retryCount, retryOnError, maxRetries]);

  const triggerLoad = () => setShouldLoad(true);

  return {
    isLoading,
    hasError,
    shouldLoad,
    triggerLoad,
    retryCount,
  };
}

/**
 * Optimize image dimensions for memory efficiency
 */
export const getOptimizedDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth = 1024,
  maxHeight = 1024,
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};

/**
 * Image format recommendations
 */
export const IMAGE_FORMAT_RECOMMENDATIONS = {
  photos: 'webp', // Best compression for photos
  illustrations: 'webp', // Good for illustrations
  transparency: 'png', // When transparency needed
  animation: 'gif', // Animated images (consider video for large animations)
  icons: 'svg', // Vector icons (scalable)
} as const;

/**
 * Image quality recommendations by use case
 */
export const IMAGE_QUALITY_RECOMMENDATIONS = {
  thumbnail: 60, // Low quality for thumbnails
  preview: 75, // Medium quality for previews
  full: 85, // High quality for full images
  print: 95, // Very high quality for print
} as const;

/**
 * Estimate image memory usage (in bytes)
 */
export const estimateImageMemory = (
  width: number,
  height: number,
  bytesPerPixel = 4, // RGBA
): number => {
  return width * height * bytesPerPixel;
};

/**
 * Check if image should be optimized based on size
 */
export const shouldOptimizeImage = (
  width: number,
  height: number,
  threshold: number = 1024 * 1024 * 2, // 2MB in memory
): boolean => {
  const estimatedMemory = estimateImageMemory(width, height);
  return estimatedMemory > threshold;
};
