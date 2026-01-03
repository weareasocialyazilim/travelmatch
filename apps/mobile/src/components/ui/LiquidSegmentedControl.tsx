// components/ui/LiquidSegmentedControl.tsx
// TravelMatch Ultimate Design System 2026
// Awwwards standardında animasyonlu cam sekme sistemi
// Haptik geri bildirim ve ipeksi geçişler içerir

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/typography';
import { HAPTIC, SPRING } from '@/hooks/useMotion';

interface LiquidSegmentedControlProps {
  /** Array of option labels */
  options: string[];
  /** Currently selected index */
  selectedIndex: number;
  /** Callback when selection changes */
  onChange: (index: number) => void;
  /** Optional container style */
  style?: ViewStyle;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Awwwards standardında animasyonlu cam sekme sistemi.
 * Haptik geri bildirim ve ipeksi geçişler içerir.
 *
 * @example
 * ```tsx
 * <LiquidSegmentedControl
 *   options={['Günlük', 'Haftalık', 'Aylık']}
 *   selectedIndex={0}
 *   onChange={(index) => setSelected(index)}
 * />
 * ```
 */
export const LiquidSegmentedControl: React.FC<LiquidSegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
  style,
  size = 'md',
}) => {
  const handlePress = useCallback(
    (index: number) => {
      if (index !== selectedIndex) {
        HAPTIC.medium();
        onChange(index);
      }
    },
    [selectedIndex, onChange],
  );

  const sizeConfig = {
    sm: { height: 36, fontSize: 12, padding: 3, radius: 12, indicatorSize: 3 },
    md: { height: 44, fontSize: 13, padding: 4, radius: 14, indicatorSize: 4 },
    lg: { height: 52, fontSize: 14, padding: 5, radius: 16, indicatorSize: 5 },
  };

  const config = sizeConfig[size];

  return (
    <GlassCard
      intensity={20}
      showBorder={true}
      style={[styles.container, { padding: config.padding, borderRadius: config.radius + config.padding }, style]}
      padding={0}
    >
      <View style={[styles.inner, { height: config.height }]}>
        {options.map((option, index) => {
          const isActive = index === selectedIndex;
          return (
            <TouchableOpacity
              key={`${option}-${index}`}
              onPress={() => handlePress(index)}
              style={[
                styles.tab,
                { borderRadius: config.radius },
                isActive && styles.activeTab,
              ]}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={option}
            >
              <Text
                style={[
                  styles.label,
                  { fontSize: config.fontSize },
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {option}
              </Text>
              {isActive && (
                <View
                  style={[
                    styles.neonIndicator,
                    {
                      width: config.indicatorSize,
                      height: config.indicatorSize,
                      borderRadius: config.indicatorSize / 2,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </GlassCard>
  );
};

/**
 * Animated variant with smooth sliding indicator
 */
export const LiquidSegmentedControlAnimated: React.FC<LiquidSegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
  style,
  size = 'md',
}) => {
  const position = useSharedValue(selectedIndex);

  const handlePress = useCallback(
    (index: number) => {
      if (index !== selectedIndex) {
        HAPTIC.medium();
        position.value = withSpring(index, SPRING.snappy);
        onChange(index);
      }
    },
    [selectedIndex, onChange],
  );

  // Update position when selectedIndex changes externally
  React.useEffect(() => {
    position.value = withSpring(selectedIndex, SPRING.snappy);
  }, [selectedIndex]);

  const sizeConfig = {
    sm: { height: 36, fontSize: 12, padding: 3, radius: 12 },
    md: { height: 44, fontSize: 13, padding: 4, radius: 14 },
    lg: { height: 52, fontSize: 14, padding: 5, radius: 16 },
  };

  const config = sizeConfig[size];

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = 100 / options.length;
    return {
      left: `${interpolate(position.value, [0, options.length - 1], [0, 100 - tabWidth])}%`,
      width: `${tabWidth}%`,
    };
  });

  return (
    <GlassCard
      intensity={20}
      showBorder={true}
      style={[styles.container, { padding: config.padding, borderRadius: config.radius + config.padding }, style]}
      padding={0}
    >
      <View style={[styles.inner, { height: config.height }]}>
        {/* Sliding Background Indicator */}
        <Animated.View
          style={[
            styles.slidingIndicator,
            { borderRadius: config.radius },
            animatedIndicatorStyle,
          ]}
        />

        {/* Tab Options */}
        {options.map((option, index) => {
          const isActive = index === selectedIndex;
          return (
            <TouchableOpacity
              key={`${option}-${index}`}
              onPress={() => handlePress(index)}
              style={[styles.tab, { borderRadius: config.radius }]}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={option}
            >
              <Text
                style={[
                  styles.label,
                  { fontSize: config.fontSize },
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    position: 'relative',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    fontFamily: FONTS.body.bold,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  activeLabel: {
    color: COLORS.text.primary,
  },
  inactiveLabel: {
    color: COLORS.text.muted,
  },
  neonIndicator: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: COLORS.brand.primary,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 4,
  },
  slidingIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 0,
  },
});

export default LiquidSegmentedControl;
