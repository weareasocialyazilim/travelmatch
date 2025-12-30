/**
 * FormStepIndicator Component
 *
 * A premium progress indicator for multi-step forms
 * Following UX best practice: "Break long forms down"
 *
 * Features:
 * - Animated progress bar
 * - Step labels with completion states
 * - Accessible with screen reader support
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../../constants/colors';

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
  }) => {
    // Animated progress value (0 to steps.length - 1)
    const progress = useSharedValue(0);

    useEffect(() => {
      progress.value = withSpring(currentStep, {
        damping: 20,
        stiffness: 200,
      });
    }, [currentStep, progress]);

    // Calculate progress bar width
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

    return (
      <View
        style={styles.container}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: steps.length,
          now: currentStep + 1,
          text: `Adım ${currentStep + 1} / ${steps.length}: ${steps[currentStep]?.label}`,
        }}
      >
        {/* Progress bar background */}
        <View style={styles.progressTrack}>
          <AnimatedView style={[styles.progressFill, progressBarStyle]} />
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
                />
                {showLabels && (
                  <Text
                    style={[
                      styles.stepLabel,
                      compact && styles.stepLabelCompact,
                      state === 'active' && styles.stepLabelActive,
                      state === 'completed' && styles.stepLabelCompleted,
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
}

const StepCircle: React.FC<StepCircleProps> = memo(
  ({ state, index, icon, compact }) => {
    const scale = useSharedValue(1);
    const colorProgress = useSharedValue(0);

    useEffect(() => {
      if (state === 'active') {
        scale.value = withSpring(1.1, { damping: 15, stiffness: 300 });
        colorProgress.value = withTiming(1, { duration: 300 });
      } else if (state === 'completed') {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        colorProgress.value = withTiming(2, { duration: 300 });
      } else {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        colorProgress.value = withTiming(0, { duration: 300 });
      }
    }, [state, scale, colorProgress]);

    const animatedStyle = useAnimatedStyle(() => ({
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
    }));

    const size = compact ? 28 : 36;
    const iconSize = compact ? 14 : 18;

    return (
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
            color={COLORS.white}
          />
        ) : icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={iconSize}
            color={state === 'active' ? COLORS.white : primitives.stone[400]}
          />
        ) : (
          <Text
            style={[
              styles.stepNumber,
              compact && styles.stepNumberCompact,
              state === 'active' && styles.stepNumberActive,
            ]}
          >
            {index + 1}
          </Text>
        )}
      </AnimatedView>
    );
  },
);

StepCircle.displayName = 'StepCircle';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressTrack: {
    height: 3,
    backgroundColor: primitives.stone[200],
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: primitives.stone[400],
  },
  stepNumberCompact: {
    fontSize: 12,
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: primitives.stone[400],
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
  stepLabelCompleted: {
    color: COLORS.success,
    fontWeight: '500',
  },
});

export default FormStepIndicator;
