/**
 * GlassCard Component
 *
 * iOS 26 Liquid Glass style card with blur effect.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../constants/colors';

interface GlassCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Custom style for the container */
  style?: ViewStyle;
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
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 80,
  tint = 'light',
  padding = 16,
  borderRadius = 20,
  showBorder = true,
}) => {
  // On Android, BlurView might not work well, so we fallback to semi-transparent background
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.container,
          {
            borderRadius,
            backgroundColor: COLORS.glassBackground,
          },
          showBorder && styles.border,
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
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.blur, { borderRadius }]}
      />
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
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  intensity = 60,
  tint = 'light',
}) => {
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          { backgroundColor: COLORS.glassBackground },
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
      {children}
    </View>
  );
};

/**
 * GlassButton - A button with glass effect background
 */
interface GlassButtonProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  style,
  intensity = 60,
  tint = 'light',
  borderRadius = 12,
}) => {
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.glassButton,
          { borderRadius, backgroundColor: COLORS.glassBackground },
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
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  border: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
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
