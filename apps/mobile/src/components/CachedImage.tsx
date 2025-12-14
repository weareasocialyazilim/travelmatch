// @ts-nocheck - TODO: Fix type errors
/**
 * Cached Image Component
 * 
 * Production-ready image component with comprehensive error handling
 * 
 * Features:
 * - State machine: idle → loading → success | error
 * - Multi-tier caching (Memory → Disk → Cloudflare → Network)
 * - Retry functionality with visual feedback
 * - Type-specific fallbacks (avatar, moment, trip, gift)
 * - Network scenario handling (slow, timeout, offline)
 * - Automatic WebP conversion via Cloudflare
 * - Responsive image variants
 * - No crashes, no empty spaces
 * 
 * @example
 * <CachedImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   type="moment"
 *   cloudflareId="abc123"
 *   variant="medium"
 *   style={{ width: 200, height: 200 }}
 * />
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  ImageProps,
  ImageStyle,
  ViewStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import imageCacheManager, { type ImageVariant } from '../services/imageCacheManager';
import { COLORS } from '../constants/colors';

// ============================================================================
// TYPES
// ============================================================================

type ImageState = 'idle' | 'loading' | 'success' | 'error';

type ImageType = 'default' | 'avatar' | 'moment' | 'trip' | 'gift' | 'profile';

export interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  type?: ImageType;
  cloudflareId?: string;
  variant?: ImageVariant;
  prefetch?: boolean;
  showLoading?: boolean;
  showError?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  fallbackSource?: { uri: string };
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
  onRetry?: () => void;
  containerStyle?: ViewStyle;
  networkTimeout?: number;
}

// ============================================================================
// FALLBACK CONFIGURATIONS
// ============================================================================

const FALLBACK_CONFIG: Record<ImageType, { icon: string; color: string; bg: string; label: string }> = {
  default: {
    icon: 'image-off-outline',
    color: COLORS.gray[400],
    bg: COLORS.gray[100],
    label: 'Görsel yüklenemedi',
  },
  avatar: {
    icon: 'account-circle-outline',
    color: COLORS.gray[500],
    bg: COLORS.primaryMuted,
    label: 'Profil fotoğrafı yüklenemedi',
  },
  moment: {
    icon: 'camera-off-outline',
    color: COLORS.gray[500],
    bg: COLORS.gray[50],
    label: 'Moment görseli yüklenemedi',
  },
  trip: {
    icon: 'map-marker-off-outline',
    color: COLORS.gray[500],
    bg: COLORS.gray[50],
    label: 'Seyahat görseli yüklenemedi',
  },
  gift: {
    icon: 'gift-off-outline',
    color: COLORS.gray[500],
    bg: COLORS.softOrangeTransparent,
    label: 'Hediye görseli yüklenemedi',
  },
  profile: {
    icon: 'account-outline',
    color: COLORS.gray[500],
    bg: COLORS.primaryMuted,
    label: 'Profil görseli yüklenemedi',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  type = 'default',
  cloudflareId,
  variant = 'medium',
  prefetch = true,
  showLoading = true,
  showError = true,
  enableRetry = true,
  maxRetries = 3,
  retryDelay = 1000,
  loadingComponent,
  errorComponent,
  fallbackSource,
  onLoadStart,
  onLoadEnd,
  onError,
  onRetry,
  containerStyle,
  networkTimeout = 10000,
  style,
  ...imageProps
}) => {
  const [state, setState] = useState<ImageState>('idle');
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadImage();
  }, [source.uri, cloudflareId, variant]);

  const loadImage = async () => {
    setState('loading');
    setError(null);
    onLoadStart?.();

    try {
      // Network timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), networkTimeout);
      });

      // Image loading promise
      const imagePromise = imageCacheManager.getImage(source.uri, {
        cloudflareId,
        variant,
        prefetch,
      });

      // Race between timeout and image load
      const uri = await Promise.race([imagePromise, timeoutPromise]);

      setCachedUri(uri);
      setState('success');
      setRetryCount(0); // Reset retry count on success
      onLoadEnd?.();
    } catch (err) {
      const error = err as Error;
      setError(error);
      setState('error');
      onError?.(error);

      // Try fallback source if available
      if (fallbackSource && retryCount === 0) {
        setCachedUri(fallbackSource.uri);
      }
    }
  };

  const handleRetry = useCallback(() => {
    if (retryCount >= maxRetries) {
      return;
    }

    onRetry?.();
    setRetryCount((prev) => prev + 1);

    // Delay retry slightly to prevent rapid retries
    setTimeout(() => {
      loadImage();
    }, retryDelay);
  }, [retryCount, maxRetries, retryDelay]);

  const handleImageError = useCallback(() => {
    const error = new Error('Image render failed');
    setError(error);
    setState('error');
    onError?.(error);
  }, [onError]);

  // Get fallback config for current type
  const fallbackConfig = FALLBACK_CONFIG[type];

  // ========== LOADING STATE ==========
  if (state === 'loading' && showLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <View style={[styles.container, styles.loadingContainer, containerStyle, style as ViewStyle]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  // ========== ERROR STATE ==========
  if (state === 'error' && !cachedUri && showError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: fallbackConfig.bg }, containerStyle, style as ViewStyle]}>
        <MaterialCommunityIcons 
          name={fallbackConfig.icon as any} 
          size={48} 
          color={fallbackConfig.color} 
        />
        <Text style={styles.errorText}>{fallbackConfig.label}</Text>
        
        {enableRetry && retryCount < maxRetries && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="refresh" size={16} color={COLORS.primary} />
            <Text style={styles.retryText}>
              Tekrar Dene {retryCount > 0 && `(${retryCount}/${maxRetries})`}
            </Text>
          </TouchableOpacity>
        )}

        {retryCount >= maxRetries && (
          <Text style={styles.maxRetriesText}>Maksimum deneme sayısına ulaşıldı</Text>
        )}
      </View>
    );
  }

  // ========== SUCCESS STATE ==========
  if (!cachedUri) return null;

  return (
    <Image
      {...imageProps}
      source={{ uri: cachedUri }}
      style={style}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={handleImageError}
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
  container: {
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 8,
  },
  retryText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  maxRetriesText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default CachedImage;
