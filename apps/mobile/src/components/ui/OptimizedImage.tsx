/**
 * OptimizedImage Component
 * High-performance image loading using Expo Image with smooth transitions
 *
 * Features:
 * - Native image caching (Expo Image)
 * - Smooth fade transitions (200ms default)
 * - BlurHash placeholder support (ready for backend integration)
 * - Error handling with fallback
 * - WebP/AVIF format support
 * - Memory efficient
 * - Accessibility support
 */

import React, { memo, useState, useRef } from 'react';
import type { ViewStyle, ImageStyle } from 'react-native';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import { COLORS } from '../../constants/colors';
import { analytics } from '../../services/analytics';

interface OptimizedImageProps {
  /** Image source URI */
  source: string | { uri: string } | number;
  /** Image content fit mode */
  contentFit?: ImageContentFit;
  /** BlurHash placeholder (optional - for future backend integration) */
  placeholder?: string;
  /** Transition duration in ms */
  transition?: number;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Image style */
  style?: ImageStyle;
  /** Show loading indicator */
  showLoading?: boolean;
  /** Error fallback component */
  errorComponent?: React.ReactNode;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Priority for loading (high, normal, low) */
  priority?: 'high' | 'normal' | 'low';
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback on error */
  onError?: (error: any) => void;
}

/**
 * OptimizedImage - High-performance image component using Expo Image
 *
 * Uses Expo Image for:
 * - Superior caching (disk + memory)
 * - BlurHash placeholder support
 * - WebP/AVIF automatic format selection
 * - Smooth transitions without janking
 * - Lower memory footprint
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   source={{ uri: 'https://cdn.example.com/image.jpg' }}
 *   contentFit="cover"
 *   placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4" // BlurHash
 *   style={{ width: 300, height: 400 }}
 *   accessibilityLabel="Moment photo"
 * />
 * ```
 */
export const OptimizedImage = memo<OptimizedImageProps>(
  function OptimizedImage({
    source,
    contentFit = 'cover',
    placeholder,
    transition = 200,
    containerStyle,
    style,
    showLoading = false,
    errorComponent,
    accessibilityLabel,
    priority = 'normal',
    onLoad,
    onError,
  }) {
    const [isLoading, setIsLoading] = useState(showLoading);
    const [hasError, setHasError] = useState(false);
    const loadStartTime = useRef<number>(0);

    // Normalize source to ImageSourcePropType ({ uri } or number)
    const imageSource = typeof source === 'string' ? { uri: source } : source;

    const handleLoadStart = () => {
      loadStartTime.current = Date.now();
      setIsLoading(true);
      setHasError(false);
    };

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);

      // Track image load performance
      if (loadStartTime.current > 0) {
        const loadTime = Date.now() - loadStartTime.current;
        analytics.trackTiming('image_load', loadTime, {
          priority,
          contentFit,
          hasPlaceholder: !!placeholder,
        });
      }

      onLoad?.();
    };

    const handleError = (error: any) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(error);
      console.error('OptimizedImage load error:', error);
    };

    // Show error state
    if (hasError) {
      if (errorComponent) {
        return (
          <View style={[styles.container, containerStyle]}>
            {errorComponent}
          </View>
        );
      }
      return (
        <View
          style={[
            styles.container,
            styles.errorContainer,
            containerStyle,
            style,
          ]}
        >
          <View style={styles.errorPlaceholder} />
        </View>
      );
    }

    return (
      <View style={[styles.container, containerStyle]}>
        <Image
          source={imageSource}
          contentFit={contentFit}
          placeholder={placeholder}
          transition={transition}
          style={[styles.image, style]}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          accessibilityLabel={accessibilityLabel}
          priority={priority}
          cachePolicy="memory-disk"
        />
        {isLoading && showLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.brand.primary} />
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray?.[100] || '#F3F4F6',
  },
  errorPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray?.[200] || '#E5E7EB',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.mintBackground || '#F0FDF4',
  },
});

export default OptimizedImage;
