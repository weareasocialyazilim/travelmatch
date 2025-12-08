/**
 * Cached Image Component
 * 
 * Drop-in replacement for React Native Image with automatic caching
 * Integrates Cloudflare CDN + local disk cache + memory cache
 * 
 * Features:
 * - Multi-tier caching (Memory → Disk → Cloudflare → Network)
 * - Automatic WebP conversion via Cloudflare
 * - Responsive image variants
 * - Loading and error states
 * - Offline support
 * - Prefetching
 * 
 * @example
 * <CachedImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   cloudflareId="abc123"
 *   variant="medium"
 *   style={{ width: 200, height: 200 }}
 * />
 */

import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  ImageProps,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import imageCacheManager, { type ImageVariant } from '../services/imageCacheManager';

// ============================================================================
// TYPES
// ============================================================================

export interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  cloudflareId?: string;
  variant?: ImageVariant;
  prefetch?: boolean;
  showLoading?: boolean;
  showError?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  fallbackSource?: { uri: string };
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
  containerStyle?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  cloudflareId,
  variant = 'medium',
  prefetch = true,
  showLoading = true,
  showError = true,
  loadingComponent,
  errorComponent,
  fallbackSource,
  onLoadStart,
  onLoadEnd,
  onError,
  containerStyle,
  style,
  ...imageProps
}) => {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadImage();
  }, [source.uri, cloudflareId, variant]);

  const loadImage = async () => {
    setLoading(true);
    setError(null);
    onLoadStart?.();

    try {
      const uri = await imageCacheManager.getImage(source.uri, {
        cloudflareId,
        variant,
        prefetch,
      });

      setCachedUri(uri);
      setLoading(false);
      onLoadEnd?.();
    } catch (err) {
      const error = err as Error;
      setError(error);
      setLoading(false);
      onError?.(error);

      // Try fallback
      if (fallbackSource) {
        setCachedUri(fallbackSource.uri);
      }
    }
  };

  // Loading state
  if (loading && showLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <View style={[styles.loadingContainer, containerStyle, style as ViewStyle]}>
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  // Error state
  if (error && !cachedUri && showError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <View style={[styles.errorContainer, containerStyle, style as ViewStyle]}>
        <MaterialCommunityIcons name="image-broken" size={32} color="#9ca3af" />
      </View>
    );
  }

  // Image
  if (!cachedUri) return null;

  return (
    <Image
      {...imageProps}
      source={{ uri: cachedUri }}
      style={style}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={(e) => {
        const error = new Error(e.nativeEvent.error || 'Image load failed');
        setError(error);
        onError?.(error);
      }}
    />
  );
};

// ============================================================================
// RESPONSIVE CACHED IMAGE
// ============================================================================

export interface ResponsiveCachedImageProps extends CachedImageProps {
  width: number;
  height: number;
  responsive?: boolean;
}

export const ResponsiveCachedImage: React.FC<ResponsiveCachedImageProps> = ({
  width,
  height,
  responsive = true,
  variant: customVariant,
  style,
  ...props
}) => {
  // Auto-select variant based on size
  const getVariant = (): ImageVariant => {
    if (customVariant) return customVariant;
    if (!responsive) return 'medium';

    const maxDimension = Math.max(width, height);

    if (maxDimension <= 150) return 'thumbnail';
    if (maxDimension <= 320) return 'small';
    if (maxDimension <= 640) return 'medium';
    if (maxDimension <= 1280) return 'large';
    return 'original';
  };

  const variant = getVariant();

  return (
    <CachedImage
      {...props}
      variant={variant}
      style={[{ width, height }, style]}
    />
  );
};

// ============================================================================
// PREFETCH HELPER
// ============================================================================

export const prefetchImages = async (
  images: Array<{
    uri: string;
    cloudflareId?: string;
    variants?: ImageVariant[];
  }>,
): Promise<void> => {
  await Promise.all(
    images.map((img) =>
      imageCacheManager.prefetch(
        img.uri,
        img.cloudflareId,
        img.variants || ['small', 'medium'],
      ),
    ),
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default CachedImage;
