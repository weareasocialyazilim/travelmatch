import React, { useState, useCallback } from 'react';
import type { ImageProps, ViewStyle, ImageStyle } from 'react-native';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface SmartImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallbackUri?: string;
  fallbackIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  fallbackIconSize?: number;
  showLoader?: boolean;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  loaderColor?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}

/**
 * Smart Image component with:
 * - Loading state
 * - Error fallback
 * - Placeholder support
 * - Lazy loading ready
 */
const SmartImage: React.FC<SmartImageProps> = ({
  uri,
  fallbackUri,
  fallbackIcon = 'image-off-outline',
  fallbackIconSize = 40,
  showLoader = true,
  containerStyle,
  imageStyle,
  loaderColor = COLORS.primary,
  onLoadStart,
  onLoadEnd,
  onError,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentUri, setCurrentUri] = useState(uri);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback(() => {
    setLoading(false);

    // Try fallback URI if available
    if (fallbackUri && currentUri !== fallbackUri) {
      setCurrentUri(fallbackUri);
      setLoading(true);
      return;
    }

    setError(true);
    onError?.();
  }, [fallbackUri, currentUri, onError]);

  // Get combined styles
  const combinedContainerStyle = StyleSheet.flatten([
    styles.container,
    containerStyle,
    style,
  ]) as ViewStyle;

  const containerWidth = (combinedContainerStyle as ViewStyle).width || '100%';
  const containerHeight =
    (combinedContainerStyle as ViewStyle).height || '100%';

  const combinedImageStyle = StyleSheet.flatten([
    styles.image,
    imageStyle,
    {
      width: containerWidth,
      height: containerHeight,
    },
  ]);

  // Show error state
  if (error || !uri) {
    return (
      <View style={[combinedContainerStyle, styles.fallbackContainer]}>
        <MaterialCommunityIcons
          name={fallbackIcon}
          size={fallbackIconSize}
          color={COLORS.gray[400]}
        />
      </View>
    );
  }

  return (
    <View style={combinedContainerStyle}>
      <Image
        source={{ uri: currentUri }}
        style={combinedImageStyle as ImageStyle}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />

      {/* Loading Overlay */}
      {loading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={loaderColor} />
        </View>
      )}
    </View>
  );
};

/**
 * Avatar component with initials fallback
 */
interface AvatarImageProps extends Omit<SmartImageProps, 'fallbackIcon'> {
  name?: string;
  size?: number;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  name = '',
  size = 48,
  uri,
  style,
  ...props
}) => {
  const [showFallback, setShowFallback] = useState(!uri);

  const handleError = useCallback(() => {
    setShowFallback(true);
  }, []);

  const containerStyle = StyleSheet.flatten([
    {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    style,
  ]);

  if (showFallback || !uri) {
    // Generate consistent color from name
    const colors = [
      COLORS.primary,
      COLORS.mint,
      COLORS.softOrange,
      COLORS.info,
      COLORS.success,
    ];
    const colorIndex = name.length % colors.length;
    const bgColor = colors[colorIndex];

    return (
      <View
        style={[
          containerStyle,
          styles.avatarFallback,
          { backgroundColor: bgColor },
        ]}
      >
        <MaterialCommunityIcons
          name="account"
          size={size * 0.5}
          color={COLORS.white}
        />
      </View>
    );
  }

  return (
    <SmartImage
      uri={uri}
      containerStyle={containerStyle}
      imageStyle={{ borderRadius: size / 2 }}
      fallbackIcon="account"
      fallbackIconSize={size * 0.5}
      onError={handleError}
      {...props}
    />
  );
};

/**
 * Thumbnail with aspect ratio support
 */
interface ThumbnailProps extends SmartImageProps {
  aspectRatio?: number; // width / height
  maxWidth?: number;
  maxHeight?: number;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({
  aspectRatio = 16 / 9,
  maxWidth,
  maxHeight,
  style,
  ...props
}) => {
  const flatStyle = StyleSheet.flatten(style);

  let width = flatStyle?.width || maxWidth || '100%';
  let height: number | string;

  if (typeof width === 'number') {
    height = width / aspectRatio;
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    height = 'auto';
  }

  return (
    <SmartImage
      style={[
        style,
        { width, height: typeof height === 'number' ? height : undefined },
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.gray[100],
  },
  image: {
    resizeMode: 'cover',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whiteOverlay80,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[100],
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SmartImage;
