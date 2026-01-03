// components/layout/LiquidScreenWrapper.tsx
// TravelMatch Ultimate Design System 2026
// Premium screen wrapper with Twilight Zinc background and safe area

import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, primitives } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

type BackgroundVariant = 'light' | 'dark' | 'twilight' | 'cream';

interface LiquidScreenWrapperProps {
  /** Screen content */
  children: React.ReactNode;
  /** Background variant */
  variant?: BackgroundVariant;
  /** Apply safe area insets at top */
  safeAreaTop?: boolean;
  /** Apply safe area insets at bottom */
  safeAreaBottom?: boolean;
  /** Custom padding */
  padding?: number;
  /** Show entrance animation */
  animated?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Content container style */
  contentStyle?: ViewStyle;
  /** Status bar style (auto-detected from variant if not provided) */
  statusBarStyle?: 'light' | 'dark';
  /** Show gradient background */
  showGradient?: boolean;
}

// Background configurations
const backgroundConfig: Record<
  BackgroundVariant,
  {
    colors: readonly [string, string, string];
    statusBar: 'light' | 'dark';
  }
> = {
  light: {
    colors: ['#FFFCF8', '#FFF9F2', '#FFFCF8'],
    statusBar: 'dark',
  },
  dark: {
    colors: ['#0C0A09', '#1C1917', '#0C0A09'],
    statusBar: 'light',
  },
  twilight: {
    colors: ['#0C0A09', '#1C1917', '#292524'],
    statusBar: 'light',
  },
  cream: {
    colors: ['#FFFCF8', '#FFF5E8', '#FFFCF8'],
    statusBar: 'dark',
  },
};

/**
 * LiquidScreenWrapper Component
 * Premium screen container with consistent background and safe areas
 *
 * Features:
 * - Gradient backgrounds with multiple variants
 * - Safe area handling
 * - Optional entrance animation
 * - Status bar auto-configuration
 */
export const LiquidScreenWrapper: React.FC<LiquidScreenWrapperProps> = ({
  children,
  variant = 'light',
  safeAreaTop = true,
  safeAreaBottom = false,
  padding,
  animated = true,
  style,
  contentStyle,
  statusBarStyle,
  showGradient = true,
}) => {
  const insets = useSafeAreaInsets();
  const config = backgroundConfig[variant];

  const containerPadding = {
    paddingTop: safeAreaTop ? insets.top : 0,
    paddingBottom: safeAreaBottom ? insets.bottom : 0,
    ...(padding !== undefined && {
      paddingHorizontal: padding,
    }),
  };

  const content = (
    <View style={[styles.content, containerPadding, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <StatusBar
        barStyle={
          statusBarStyle
            ? `${statusBarStyle}-content`
            : `${config.statusBar}-content`
        }
        backgroundColor="transparent"
        translucent
      />

      {/* Background */}
      {showGradient ? (
        <LinearGradient
          colors={config.colors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: config.colors[0] },
          ]}
        />
      )}

      {/* Content with optional animation */}
      {animated ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.flex}>
          {content}
        </Animated.View>
      ) : (
        content
      )}
    </View>
  );
};

/**
 * LiquidScreenHeader Component
 * Consistent header styling for screens
 */
interface LiquidScreenHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const LiquidScreenHeader: React.FC<LiquidScreenHeaderProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

/**
 * LiquidScreenBody Component
 * Scrollable content area
 */
interface LiquidScreenBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const LiquidScreenBody: React.FC<LiquidScreenBodyProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.body, style]}>{children}</View>;
};

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.lg,
  },
  body: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
});

export default LiquidScreenWrapper;
