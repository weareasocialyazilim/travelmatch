import React from 'react';
import { StyleSheet, View, ViewProps, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../constants/colors';
import { RADII } from '../../constants/radii';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  hasBorder?: boolean;
}

/**
 * Awwwards kalitesinde "Liquid Glass" efekti.
 * Arka planı yumuşakça bulanıklaştırır ve derinlik katar.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 40,
  tint = 'dark',
  hasBorder = true,
  ...props
}) => {
  // On Android, BlurView might not work well, so we fallback to semi-transparent background
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.container,
          styles.androidFallback,
          hasBorder && styles.border,
          style,
        ]}
        {...props}
      >
        <View style={styles.innerContent}>{children}</View>
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.container, hasBorder && styles.border, style]}
      {...props}
    >
      <View style={styles.innerContent}>{children}</View>
    </BlurView>
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
        style={[{ backgroundColor: COLORS.surface.glassBackground }, style]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[glassViewStyles.container, style]}>
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
  borderRadius = RADII.lg,
}) => {
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          glassButtonStyles.container,
          { borderRadius, backgroundColor: COLORS.surface.glassBackground },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[glassButtonStyles.container, { borderRadius }, style]}>
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
    borderRadius: 24, // Apple-style xl radii
    overflow: 'hidden',
    backgroundColor: COLORS.background.glass,
  },
  androidFallback: {
    backgroundColor: COLORS.surface.glassBackground,
  },
  border: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  innerContent: {
    padding: 16,
  },
});

const glassViewStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

const glassButtonStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassCard;
