/**
 * FormStepIndicator Component - Edition
 *
 * Premium progress indicators for multi-step forms.
 * Includes both classic labeled steps and minimalist liquid variants.
 *
 * Features:
 * - Animated progress with spring physics
 * - Neon glow effects (Twilight Zinc theme)
 * - Accessible with screen reader support
 * - Multiple style variants
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolateColor,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../../constants/colors';

// Twilight Zinc + Neon Energy theme
const INDICATOR_COLORS = {
  background: {
    primary: '#121214',
    secondary: '#1E1E20',
    muted: '#3F3F46',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
  },
  neon: {
    lime: '#DFFF00',
    violet: '#A855F7',
    cyan: '#06B6D4',
    rose: '#F43F5E',
  },
  glass: {
    border: 'rgba(255, 255, 255, 0.08)',
  },
};

const SPRINGS = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  gentle: { damping: 20, stiffness: 120, mass: 0.5 },
  bouncy: { damping: 15, stiffness: 150, mass: 0.5 },
};

export interface FormStep {
  /** Unique key for the step */
  key: string;
  /** Short label for the step */
  label: string;
  /** Optional icon name */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface FormStepIndicatorProps {
  /** Array of step definitions */
  steps: FormStep[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Callback when user taps on a completed step */
  onStepPress?: (stepIndex: number) => void;
  /** Allow navigation to previous steps only */
  allowBackNavigation?: boolean;
  /** Show step labels below indicators */
  showLabels?: boolean;
  /** Compact mode for smaller screens */
  compact?: boolean;
  /** Use dark theme with neon accents */
  darkMode?: boolean;
  /** Accent color for dark mode */
  accentColor?: string;
}

const AnimatedView = Animated.View;

export const FormStepIndicator: React.FC<FormStepIndicatorProps> = memo(
  ({
    steps,
    currentStep,
    onStepPress,
    allowBackNavigation = true,
    showLabels = true,
    compact = false,
    darkMode = false,
    accentColor = INDICATOR_COLORS.neon.lime,
  }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
      progress.value = withSpring(currentStep, SPRINGS.gentle);
    }, [currentStep, progress]);

    const progressBarStyle = useAnimatedStyle(() => {
      const totalSteps = steps.length;
      const progressPercent =
        totalSteps > 1 ? (progress.value / (totalSteps - 1)) * 100 : 0;

      return {
        width: `${Math.min(progressPercent, 100)}%`,
      };
    });

    const handleStepPress = (index: number) => {
      if (!onStepPress) return;
      if (allowBackNavigation && index < currentStep) {
        onStepPress(index);
      }
    };

    const getStepState = (
      index: number,
    ): 'completed' | 'active' | 'upcoming' => {
      if (index < currentStep) return 'completed';
      if (index === currentStep) return 'active';
      return 'upcoming';
    };

    const containerStyle = darkMode ? styles.containerDark : styles.container;
    const trackStyle = darkMode
      ? [styles.progressTrack, styles.progressTrackDark]
      : styles.progressTrack;

    return (
      <View
        style={containerStyle}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: steps.length,
          now: currentStep + 1,
          text: `Adım ${currentStep + 1} / ${steps.length}: ${steps[currentStep]?.label}`,
        }}
      >
        {/* Progress bar background */}
        <View style={trackStyle}>
          <AnimatedView
            style={[
              styles.progressFill,
              darkMode && { backgroundColor: accentColor },
              progressBarStyle,
            ]}
          />
          {darkMode && (
            <AnimatedView
              style={[
                styles.progressGlow,
                { backgroundColor: accentColor },
                progressBarStyle,
              ]}
            />
          )}
        </View>

        {/* Step indicators */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => {
            const state = getStepState(index);
            const isClickable =
              allowBackNavigation && index < currentStep && onStepPress;

            return (
              <Pressable
                key={step.key}
                style={styles.stepWrapper}
                onPress={() => handleStepPress(index)}
                disabled={!isClickable}
                accessibilityRole="button"
                accessibilityLabel={`${step.label}, ${
                  state === 'completed'
                    ? 'tamamlandı'
                    : state === 'active'
                      ? 'aktif'
                      : 'bekliyor'
                }`}
                accessibilityState={{ selected: state === 'active' }}
              >
                <StepCircle
                  state={state}
                  index={index}
                  icon={step.icon}
                  compact={compact}
                  darkMode={darkMode}
                  accentColor={accentColor}
                />
                {showLabels && (
                  <Text
                    style={[
                      darkMode ? styles.stepLabelDark : styles.stepLabel,
                      compact && styles.stepLabelCompact,
                      state === 'active' &&
                        (darkMode
                          ? [styles.stepLabelActiveDark, { color: accentColor }]
                          : styles.stepLabelActive),
                      state === 'completed' &&
                        (darkMode
                          ? styles.stepLabelCompletedDark
                          : styles.stepLabelCompleted),
                    ]}
                    numberOfLines={1}
                  >
                    {step.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  },
);

FormStepIndicator.displayName = 'FormStepIndicator';

// Step Circle Component
interface StepCircleProps {
  state: 'completed' | 'active' | 'upcoming';
  index: number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  compact?: boolean;
  darkMode?: boolean;
  accentColor?: string;
}

const StepCircle: React.FC<StepCircleProps> = memo(
  ({
    state,
    index,
    icon,
    compact,
    darkMode,
    accentColor = INDICATOR_COLORS.neon.lime,
  }) => {
    const scale = useSharedValue(1);
    const colorProgress = useSharedValue(0);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
      if (state === 'active') {
        scale.value = withSpring(1.1, SPRINGS.snappy);
        colorProgress.value = withTiming(1, { duration: 300 });

        if (darkMode) {
          glowOpacity.value = withRepeat(
            withSequence(
              withTiming(0.8, {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
              }),
              withTiming(0.3, {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
              }),
            ),
            -1,
            false,
          );
        }
      } else if (state === 'completed') {
        scale.value = withSpring(1, SPRINGS.gentle);
        colorProgress.value = withTiming(2, { duration: 300 });
        glowOpacity.value = withTiming(0, { duration: 300 });
      } else {
        scale.value = withSpring(1, SPRINGS.gentle);
        colorProgress.value = withTiming(0, { duration: 300 });
        glowOpacity.value = withTiming(0, { duration: 300 });
      }
    }, [state, scale, colorProgress, glowOpacity, darkMode]);

    const animatedStyle = useAnimatedStyle(() => {
      if (darkMode) {
        return {
          transform: [{ scale: scale.value }],
          backgroundColor: interpolateColor(
            colorProgress.value,
            [0, 1, 2],
            [
              INDICATOR_COLORS.background.muted,
              accentColor,
              INDICATOR_COLORS.neon.cyan,
            ],
          ),
          borderColor: interpolateColor(
            colorProgress.value,
            [0, 1, 2],
            [
              INDICATOR_COLORS.glass.border,
              accentColor,
              INDICATOR_COLORS.neon.cyan,
            ],
          ),
        };
      }

      return {
        transform: [{ scale: scale.value }],
        backgroundColor: interpolateColor(
          colorProgress.value,
          [0, 1, 2],
          [primitives.stone[100], COLORS.primary, COLORS.success],
        ),
        borderColor: interpolateColor(
          colorProgress.value,
          [0, 1, 2],
          [primitives.stone[300], COLORS.primary, COLORS.success],
        ),
      };
    });

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
      transform: [
        { scale: interpolate(glowOpacity.value, [0.3, 0.8], [1, 1.4]) },
      ],
    }));

    const size = compact ? 28 : 36;
    const iconSize = compact ? 14 : 18;

    return (
      <View style={styles.stepCircleContainer}>
        {/* Glow effect for dark mode */}
        {darkMode && (
          <AnimatedView
            style={[
              styles.stepGlow,
              {
                width: size + 16,
                height: size + 16,
                borderRadius: (size + 16) / 2,
              },
              { backgroundColor: accentColor },
              glowStyle,
            ]}
          />
        )}
        <AnimatedView
          style={[
            styles.stepCircle,
            { width: size, height: size, borderRadius: size / 2 },
            animatedStyle,
          ]}
        >
          {state === 'completed' ? (
            <MaterialCommunityIcons
              name="check"
              size={iconSize}
              color={
                darkMode ? INDICATOR_COLORS.background.primary : COLORS.white
              }
            />
          ) : icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={iconSize}
              color={
                state === 'active'
                  ? darkMode
                    ? INDICATOR_COLORS.background.primary
                    : COLORS.white
                  : darkMode
                    ? INDICATOR_COLORS.text.secondary
                    : primitives.stone[400]
              }
            />
          ) : (
            <Text
              style={[
                darkMode ? styles.stepNumberDark : styles.stepNumber,
                compact && styles.stepNumberCompact,
                state === 'active' &&
                  (darkMode
                    ? styles.stepNumberActiveDark
                    : styles.stepNumberActive),
              ]}
            >
              {index + 1}
            </Text>
          )}
        </AnimatedView>
      </View>
    );
  },
);

StepCircle.displayName = 'StepCircle';

// ═══════════════════════════════════════════════════════════════════
// LIQUID FORM STEP INDICATOR - Minimalist Variant
// ═══════════════════════════════════════════════════════════════════

interface LiquidStepIndicatorProps {
  /** Current active step (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Accent color override */
  accentColor?: string;
}

interface LiquidDotProps {
  isActive: boolean;
  isCurrent: boolean;
  accentColor: string;
  delay: number;
}

const LiquidDot: React.FC<LiquidDotProps> = memo(
  ({ isActive, isCurrent, accentColor, delay: _delay }) => {
    const scale = useSharedValue(1);
    const width = useSharedValue(8);
    const glowOpacity = useSharedValue(0);
    const colorProgress = useSharedValue(0);

    useEffect(() => {
      colorProgress.value = withSpring(isActive ? 1 : 0, SPRINGS.gentle);

      if (isCurrent) {
        width.value = withSpring(28, SPRINGS.snappy);

        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.8, {
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(0.3, {
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          false,
        );

        scale.value = withRepeat(
          withSequence(
            withTiming(1.08, {
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(1, {
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          false,
        );
      } else {
        width.value = withSpring(8, SPRINGS.gentle);
        glowOpacity.value = withTiming(0, { duration: 300 });
        scale.value = withSpring(1, SPRINGS.gentle);
      }
    }, [isActive, isCurrent, width, glowOpacity, scale, colorProgress]);

    const dotStyle = useAnimatedStyle(() => ({
      width: width.value,
      transform: [{ scale: scale.value }],
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [INDICATOR_COLORS.background.muted, accentColor],
      ),
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
      transform: [
        { scale: interpolate(glowOpacity.value, [0.3, 0.8], [1, 1.6]) },
      ],
    }));

    return (
      <View style={styles.liquidDotContainer}>
        <AnimatedView
          style={[
            styles.liquidGlow,
            { backgroundColor: accentColor },
            glowStyle,
          ]}
        />
        <AnimatedView style={[styles.liquidDot, dotStyle]} />
      </View>
    );
  },
);

LiquidDot.displayName = 'LiquidDot';

interface LiquidLineProps {
  isActive: boolean;
  accentColor: string;
}

const LiquidLine: React.FC<LiquidLineProps> = memo(
  ({ isActive, accentColor }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
      progress.value = withSpring(isActive ? 1 : 0, SPRINGS.gentle);
    }, [isActive, progress]);

    const lineStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [INDICATOR_COLORS.background.muted, accentColor],
      ),
    }));

    return (
      <View style={styles.liquidLineContainer}>
        <AnimatedView style={[styles.liquidLine, lineStyle]} />
      </View>
    );
  },
);

LiquidLine.displayName = 'LiquidLine';

/**
 * High-quality minimalist form progress indicator.
 * Uses neon glow effect on the active step with Liquid Form aesthetic.
 */
export const LiquidStepIndicator: React.FC<LiquidStepIndicatorProps> = memo(
  ({ currentStep, totalSteps, accentColor = INDICATOR_COLORS.neon.lime }) => {
    return (
      <View
        style={styles.liquidContainer}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 1,
          max: totalSteps,
          now: currentStep,
          text: `Adım ${currentStep} / ${totalSteps}`,
        }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View key={index} style={styles.liquidStepWrapper}>
              <LiquidDot
                isActive={isActive}
                isCurrent={isCurrent}
                accentColor={accentColor}
                delay={index * 100}
              />
              {index < totalSteps - 1 && (
                <LiquidLine
                  isActive={stepNumber < currentStep}
                  accentColor={accentColor}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  },
);

LiquidStepIndicator.displayName = 'LiquidStepIndicator';

// ═══════════════════════════════════════════════════════════════════
// LIQUID PROGRESS BAR - Alternative Bar Style
// ═══════════════════════════════════════════════════════════════════

interface LiquidProgressBarProps {
  currentStep: number;
  totalSteps: number;
  accentColor?: string;
}

export const LiquidProgressBar: React.FC<LiquidProgressBarProps> = memo(
  ({ currentStep, totalSteps, accentColor = INDICATOR_COLORS.neon.lime }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
      const targetProgress =
        totalSteps > 1 ? (currentStep - 1) / (totalSteps - 1) : 0;
      progress.value = withSpring(targetProgress, SPRINGS.gentle);
    }, [currentStep, totalSteps, progress]);

    const fillStyle = useAnimatedStyle(() => ({
      width: `${progress.value * 100}%`,
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: interpolate(progress.value, [0, 0.5, 1], [0.3, 0.6, 0.8]),
    }));

    return (
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <AnimatedView
            style={[
              styles.barFill,
              { backgroundColor: accentColor },
              fillStyle,
            ]}
          />
          <AnimatedView
            style={[
              styles.barGlow,
              { backgroundColor: accentColor },
              fillStyle,
              glowStyle,
            ]}
          />
        </View>
        <View style={styles.barMarkers}>
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index + 1 <= currentStep;
            return (
              <View
                key={index}
                style={[
                  styles.barMarker,
                  isActive && { backgroundColor: accentColor },
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  },
);

LiquidProgressBar.displayName = 'LiquidProgressBar';

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Classic FormStepIndicator
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  containerDark: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: INDICATOR_COLORS.background.primary,
  },
  progressTrack: {
    height: 3,
    backgroundColor: primitives.stone[200],
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressTrackDark: {
    backgroundColor: INDICATOR_COLORS.background.muted,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressGlow: {
    position: 'absolute',
    height: 8,
    top: -2.5,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {},
    }),
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepGlow: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {},
    }),
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: primitives.stone[400],
  },
  stepNumberDark: {
    fontSize: 14,
    fontWeight: '600',
    color: INDICATOR_COLORS.text.secondary,
  },
  stepNumberCompact: {
    fontSize: 12,
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepNumberActiveDark: {
    color: INDICATOR_COLORS.background.primary,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: primitives.stone[400],
    textAlign: 'center',
  },
  stepLabelDark: {
    marginTop: 8,
    fontSize: 12,
    color: INDICATOR_COLORS.text.secondary,
    textAlign: 'center',
  },
  stepLabelCompact: {
    fontSize: 10,
    marginTop: 4,
  },
  stepLabelActive: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  stepLabelActiveDark: {
    fontWeight: '700',
  },
  stepLabelCompleted: {
    color: COLORS.success,
    fontWeight: '500',
  },
  stepLabelCompletedDark: {
    color: INDICATOR_COLORS.neon.cyan,
    fontWeight: '500',
  },

  // Liquid Step Indicator
  liquidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  liquidStepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liquidDotContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liquidDot: {
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  liquidGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {},
    }),
  },
  liquidLineContainer: {
    width: 20,
    height: 2,
    marginHorizontal: 4,
    borderRadius: 1,
    overflow: 'hidden',
  },
  liquidLine: {
    flex: 1,
    borderRadius: 1,
  },

  // Liquid Progress Bar
  barContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  barTrack: {
    height: 4,
    backgroundColor: INDICATOR_COLORS.background.muted,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
    zIndex: 1,
  },
  barGlow: {
    position: 'absolute',
    left: 0,
    top: -4,
    bottom: -4,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {},
    }),
  },
  barMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  barMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: INDICATOR_COLORS.background.muted,
  },
});

export default FormStepIndicator;
