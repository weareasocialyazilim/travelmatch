/**
 * LazyImage Component
 * Optimized image loading with lazy loading, caching, and error handling
 */

import React, { memo, useState } from 'react';
import type { ImageProps, ViewStyle } from 'react-native';
import { Image, ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useLazyImage, imageCacheManager } from '../../utils/imageOptimization';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  /** Image source */
  source: ImageProps['source'];
  /** Loading placeholder component */
  loadingComponent?: React.ReactNode;
  /** Error placeholder component */
  errorComponent?: React.ReactNode;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Show loading indicator */
  showLoading?: boolean;
  /** Fade in duration (ms) */
  fadeInDuration?: number;
}

/**
 * LazyImage - Optimized image component with lazy loading
 *
 * Features:
 * - Lazy loading with loading state
 * - Image caching
 * - Error handling
 * - Fade-in animation
 * - Memory efficient
 *
 * @example
 * ```tsx
 * <LazyImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   style={{ width: 200, height: 200 }}
 *   showLoading
 * />
 * ```
 */
export const LazyImage = memo<LazyImageProps>(function LazyImage({
  source,
  loadingComponent,
  errorComponent,
  containerStyle,
  showLoading = true,
  fadeInDuration = 300,
  style,
  ...imageProps
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isLoading, hasError } = useLazyImage(source ?? { uri: '' });

  // Check if already cached
  const isCached =
    typeof source === 'object' &&
    'uri' in source &&
    source.uri &&
    imageCacheManager.isCached(source.uri);

  const handleLoadEnd = () => {
    setImageLoaded(true);
    // Mark as cached
    if (typeof source === 'object' && 'uri' in source && source.uri) {
      imageCacheManager.markCached(source.uri);
    }
  };

  const handleError = () => {
    setImageLoaded(false);
  };

  // Show error state
  if (hasError) {
    if (errorComponent) {
      return (
        <View style={[styles.container, containerStyle]}>{errorComponent}</View>
      );
    }
    return (
      <View style={[styles.container, styles.errorContainer, containerStyle]}>
        <View style={styles.errorPlaceholder} />
      </View>
    );
  }

  // Show loading state
  if (isLoading && !isCached) {
    if (loadingComponent) {
      return (
        <View style={[styles.container, containerStyle]}>
          {loadingComponent}
        </View>
      );
    }
    if (showLoading) {
      return (
        <View
          style={[styles.container, styles.loadingContainer, containerStyle]}
        >
          <ActivityIndicator size="small" color={COLORS.buttonPrimary} />
        </View>
      );
    }
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        {...imageProps}
        source={source}
        style={[style, !imageLoaded && styles.hidden]}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        fadeDuration={isCached ? 0 : fadeInDuration}
      />
      {!imageLoaded && showLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.buttonPrimary} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  errorPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[200],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  hidden: {
    opacity: 0,
  },
});
