import React from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MomentGalleryProps {
  imageUrl: string;
  headerHeight: Animated.AnimatedInterpolation<number>;
  imageOpacity: Animated.AnimatedInterpolation<number>;
}

export const MomentGallery: React.FC<MomentGalleryProps> = React.memo(
  ({ imageUrl, headerHeight, imageOpacity }) => {
    return (
      <Animated.View
        style={[styles.heroImageContainer, { height: headerHeight }]}
      >
        <Animated.Image
          source={{ uri: imageUrl }}
          style={[styles.heroImage, { opacity: imageOpacity }]}
          resizeMode="cover"
          accessibilityLabel="Moment image"
        />
      </Animated.View>
    );
  },
);

MomentGallery.displayName = 'MomentGallery';

const styles = StyleSheet.create({
  heroImageContainer: {
    backgroundColor: COLORS.bg.primary,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroImage: {
    height: '100%',
    width: SCREEN_WIDTH,
  },
});
