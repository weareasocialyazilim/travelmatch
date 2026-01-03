/**
 * GlassCard Component - Awwwards Edition
 *
 * Premium Liquid Glass style card with blur effect.
 * Optimized for Twilight Zinc dark theme.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/theme/colors';

interface GlassCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Custom style for the container */
  style?: ViewStyle | ViewStyle[];
  /** Blur intensity (0-100) */
  intensity?: number;
  /** Blur tint */
  tint?: 'light' | 'dark' | 'default';
  /** Padding inside the card */
  padding?: number;
  /** Border radius */
  borderRadius?: number;
  /** Whether to show border */
  showBorder?: boolean;
  /** Glow color for neon effect */
  glowColor?: string;
  /** Whether to show neon glow */
  showGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 40,
  tint = 'dark',
  padding = 16,
  borderRadius = 20,
  showBorder = true,
  glowColor,
  showGlow = false,
}) => {
  const glowStyle = showGlow && glowColor ? {
    ...Platform.select({
      ios: {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {},
    }),
  } : {};

  // On Android, BlurView might not work well, so we fallback to semi-transparent background
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.container,
          {
            borderRadius,
            backgroundColor: COLORS.surface.glass,
          },
          showBorder && styles.border,
          glowStyle,
          style,
        ]}
      >
        <View style={[styles.content, { padding }]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        showBorder && styles.border,
        glowStyle,
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.blur, { borderRadius }]}
      />
      <View style={[styles.innerContainer, { borderRadius }]} />
      <View style={[styles.content, { padding }]}>
        {children}
      </View>
    </View>
  );
};

/**
 * GlassView - A simpler glass effect container without card styling
 */
interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  intensity = 40,
  tint = 'dark',
}) => {
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          { backgroundColor: COLORS.surface.glass },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.glassViewContainer, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.innerContainerFill} />
      {children}
    </View>
  );
};

/**
 * GlassButton - A button with glass effect background
 */
interface GlassButtonProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  style,
  intensity = 40,
  tint = 'dark',
  borderRadius = 12,
}) => {
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.glassButton,
          { borderRadius, backgroundColor: COLORS.surface.glass },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.glassButton, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />
      <View style={[styles.innerContainerFill, { borderRadius }]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  border: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  innerContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 32, 0.7)',
  },
  innerContainerFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 32, 0.7)',
  },
  content: {
    position: 'relative',
  },
  glassViewContainer: {
    overflow: 'hidden',
  },
  glassButton: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassCard;
