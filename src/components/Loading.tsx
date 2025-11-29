import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  mode?: 'overlay' | 'fullscreen';
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  mode = 'fullscreen',
}) => {
  const containerStyle =
    mode === 'overlay' ? styles.overlayContainer : styles.fullscreenContainer;

  return (
    <View style={containerStyle}>
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    zIndex: 999,
  },
  indicatorContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...SHADOWS.md,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: COLORS.blackTransparent,
    justifyContent: 'center',
    zIndex: 999,
  },
  text: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    marginTop: spacing.md,
  },
});

export default Loading;
