/**
 * ProgressBar - Reusable progress/limit visualization
 *
 * Implements UX patterns from dashboard designs:
 * - Linear progress bar with customizable colors
 * - Segmented progress for multi-step flows
 * - Animated fills with spring physics
 * - Label support above and below bar
 * - Turkish localization
 */

import React, { memo, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, primitives } from '@/constants/colors';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number; // Default 100
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
  labelPosition?: 'above' | 'below' | 'inline';
  labelFormat?: 'percentage' | 'value' | 'fraction' | 'custom';
  customLabel?: string;
  variant?: 'default' | 'rounded' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  colorThreshold?: {
    warning: number; // Percentage to turn warning color
    danger: number; // Percentage to turn danger color
  };
  style?: ViewStyle;
  testID?: string;
}

export const ProgressBar = memo<ProgressBarProps>(function ProgressBar({
  value,
  max = 100,
  color,
  backgroundColor,
  height,
  animated = true,
  showLabel = false,
  labelPosition = 'inline',
  labelFormat = 'percentage',
  customLabel,
  variant = 'default',
  size = 'md',
  colorThreshold,
  style,
  testID,
}) {
  // Calculate percentage
  const percentage = useMemo(() => {
    return Math.min(Math.max((value / max) * 100, 0), 100);
  }, [value, max]);

  // Animated width
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedWidth.value = withSpring(percentage, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      animatedWidth.value = percentage;
    }
  }, [percentage, animated]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  // Determine color based on threshold
  const fillColor = useMemo(() => {
    if (color) return color;
    if (colorThreshold) {
      if (percentage >= colorThreshold.danger) return primitives.red[500];
      if (percentage >= colorThreshold.warning) return primitives.amber[500];
    }
    return primitives.emerald[500];
  }, [color, percentage, colorThreshold]);

  // Size configurations
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return { height: 4, borderRadius: 2, fontSize: 10 };
      case 'lg':
        return { height: 10, borderRadius: 5, fontSize: 14 };
      default:
        return { height: 6, borderRadius: 3, fontSize: 12 };
    }
  }, [size]);

  // Border radius based on variant
  const borderRadius = useMemo(() => {
    switch (variant) {
      case 'rounded':
        return sizeConfig.height;
      case 'pill':
        return sizeConfig.height * 2;
      default:
        return sizeConfig.borderRadius;
    }
  }, [variant, sizeConfig]);

  // Format label
  const label = useMemo(() => {
    if (customLabel) return customLabel;
    switch (labelFormat) {
      case 'value':
        return `${value}`;
      case 'fraction':
        return `${value} / ${max}`;
      case 'custom':
        return customLabel || '';
      default:
        return `${Math.round(percentage)}%`;
    }
  }, [labelFormat, value, max, percentage, customLabel]);

  const renderLabel = () => (
    <Text style={[styles.label, { fontSize: sizeConfig.fontSize }]}>
      {label}
    </Text>
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      {showLabel && labelPosition === 'above' && (
        <View style={styles.labelAbove}>{renderLabel()}</View>
      )}

      <View style={styles.barRow}>
        <View
          style={[
            styles.track,
            {
              height: height || sizeConfig.height,
              borderRadius,
              backgroundColor: backgroundColor || primitives.stone[100],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.fill,
              animatedFillStyle,
              {
                backgroundColor: fillColor,
                borderRadius,
              },
            ]}
          />
        </View>

        {showLabel && labelPosition === 'inline' && (
          <View style={styles.labelInline}>{renderLabel()}</View>
        )}
      </View>

      {showLabel && labelPosition === 'below' && (
        <View style={styles.labelBelow}>{renderLabel()}</View>
      )}
    </View>
  );
});

/**
 * SegmentedProgress - Multi-step progress indicator
 */
interface SegmentedProgressProps {
  steps: number;
  currentStep: number;
  activeColor?: string;
  inactiveColor?: string;
  gap?: number;
  height?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export const SegmentedProgress = memo<SegmentedProgressProps>(
  function SegmentedProgress({
    steps,
    currentStep,
    activeColor = primitives.emerald[500],
    inactiveColor = primitives.stone[200],
    gap = 4,
    height = 4,
    animated = true,
    style,
  }) {
    return (
      <View style={[styles.segmentedContainer, { gap }, style]}>
        {Array.from({ length: steps }).map((_, index) => {
          const isActive = index < currentStep;
          const isCurrent = index === currentStep - 1;

          return (
            <SegmentItem
              key={index}
              isActive={isActive}
              isCurrent={isCurrent}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              height={height}
              animated={animated}
            />
          );
        })}
      </View>
    );
  },
);

interface SegmentItemProps {
  isActive: boolean;
  isCurrent: boolean;
  activeColor: string;
  inactiveColor: string;
  height: number;
  animated: boolean;
}

const SegmentItem = memo<SegmentItemProps>(function SegmentItem({
  isActive,
  activeColor,
  inactiveColor,
  height,
  animated,
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (animated && isActive) {
      scale.value = withTiming(1.05, { duration: 200 }, () => {
        scale.value = withTiming(1, { duration: 200 });
      });
    }
  }, [isActive, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.segment,
        animatedStyle,
        {
          height,
          backgroundColor: isActive ? activeColor : inactiveColor,
        },
      ]}
    />
  );
});

/**
 * CircularProgress - Circular progress indicator
 */
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelFormat?: 'percentage' | 'value';
  animated?: boolean;
  style?: ViewStyle;
}

export const CircularProgress = memo<CircularProgressProps>(
  function CircularProgress({
    value,
    max = 100,
    size = 60,
    strokeWidth = 6,
    color: _color = primitives.emerald[500], // Color prop available for future SVG customization
    backgroundColor = primitives.stone[100],
    showLabel = true,
    labelFormat = 'percentage',
    animated = true,
    style,
  }) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const animatedOffset = useSharedValue(circumference);

    useEffect(() => {
      const targetOffset = circumference - (percentage / 100) * circumference;
      if (animated) {
        animatedOffset.value = withSpring(targetOffset, {
          damping: 15,
          stiffness: 80,
        });
      } else {
        animatedOffset.value = targetOffset;
      }
    }, [percentage, circumference, animated]);

    const label =
      labelFormat === 'percentage' ? `${Math.round(percentage)}%` : `${value}`;

    return (
      <View
        style={[styles.circularContainer, { width: size, height: size }, style]}
      >
        <View style={styles.circularSvgContainer}>
          {/* Background circle */}
          <View
            style={[
              styles.circularBackground,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: backgroundColor,
              },
            ]}
          />
          {/* For actual SVG rendering, you'd use react-native-svg */}
        </View>
        {showLabel && (
          <View style={styles.circularLabelContainer}>
            <Text style={[styles.circularLabel, { fontSize: size * 0.25 }]}>
              {label}
            </Text>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {},
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  label: {
    color: COLORS.text.secondary,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  labelAbove: {
    marginBottom: 6,
  },
  labelBelow: {
    marginTop: 6,
  },
  labelInline: {
    marginLeft: 10,
  },
  // Segmented
  segmentedContainer: {
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    borderRadius: 2,
  },
  // Circular
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularSvgContainer: {
    position: 'absolute',
  },
  circularBackground: {
    backgroundColor: 'transparent',
  },
  circularLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularLabel: {
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});

export default ProgressBar;
