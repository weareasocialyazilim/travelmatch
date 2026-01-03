/**
 * KYCProgressBar - Awwwards Edition
 *
 * Ceremony-style progress indicator with neon glow effects.
 * Features animated step transitions and Twilight Zinc theme.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import {
  KYC_COLORS,
  KYC_TYPOGRAPHY,
  KYC_SPRINGS,
  KYC_STEPS,
  getStepIndex,
} from './theme';

interface KYCProgressBarProps {
  /** Current step ID */
  currentStep: string;
  /** Show step labels */
  showLabels?: boolean;
}

interface StepDotProps {
  index: number;
  currentIndex: number;
  label: string;
  showLabel: boolean;
}

const StepDot: React.FC<StepDotProps> = ({
  index,
  currentIndex,
  label,
  showLabel,
}) => {
  const isCompleted = index < currentIndex;
  const isCurrent = index === currentIndex;
  const isActive = index <= currentIndex;

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, KYC_SPRINGS.gentle);

    if (isCurrent) {
      // Pulsing glow for current step
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
      scale.value = withSpring(1, KYC_SPRINGS.gentle);
    }
  }, [isActive, isCurrent, progress, glowOpacity, scale]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [KYC_COLORS.background.elevated, KYC_COLORS.neon.lime]
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0.3, 0.8], [1, 1.8]) }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.5, 1]),
    color: interpolateColor(
      progress.value,
      [0, 1],
      [KYC_COLORS.text.muted, isCurrent ? KYC_COLORS.neon.lime : KYC_COLORS.text.primary]
    ),
  }));

  return (
    <View style={styles.stepContainer}>
      <View style={styles.dotWrapper}>
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            { backgroundColor: KYC_COLORS.neon.lime },
            glowStyle,
          ]}
        />
        {/* Main dot */}
        <Animated.View style={[styles.dot, dotStyle]}>
          {isCompleted && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </Animated.View>
      </View>
      {showLabel && (
        <Animated.Text style={[styles.stepLabel, labelStyle]}>
          {label}
        </Animated.Text>
      )}
    </View>
  );
};

interface StepLineProps {
  isActive: boolean;
}

const StepLine: React.FC<StepLineProps> = ({ isActive }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, KYC_SPRINGS.gentle);
  }, [isActive, progress]);

  const lineStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [KYC_COLORS.background.elevated, KYC_COLORS.neon.lime]
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.5]),
  }));

  return (
    <View style={styles.lineContainer}>
      <Animated.View style={[styles.line, lineStyle]} />
      <Animated.View
        style={[
          styles.lineGlow,
          { backgroundColor: KYC_COLORS.neon.lime },
          glowStyle,
        ]}
      />
    </View>
  );
};

export const KYCProgressBar: React.FC<KYCProgressBarProps> = ({
  currentStep,
  showLabels = true,
}) => {
  const currentIndex = getStepIndex(currentStep);
  const currentStepData = KYC_STEPS[currentIndex];

  return (
    <View style={styles.container}>
      {/* Step indicator text */}
      <View style={styles.header}>
        <Text style={styles.stepText}>
          Adım {currentIndex + 1}/{KYC_STEPS.length}
        </Text>
        <Text style={styles.stepName}>{currentStepData?.label}</Text>
      </View>

      {/* Progress dots */}
      <View style={styles.stepsRow}>
        {KYC_STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <StepDot
              index={index}
              currentIndex={currentIndex}
              label={step.label}
              showLabel={showLabels}
            />
            {index < KYC_STEPS.length - 1 && (
              <StepLine isActive={index < currentIndex} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: KYC_COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepText: {
    ...KYC_TYPOGRAPHY.caption,
    color: KYC_COLORS.text.secondary,
  },
  stepName: {
    ...KYC_TYPOGRAPHY.stepLabel,
    color: KYC_COLORS.neon.lime,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    width: 48,
  },
  dotWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  glow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
      android: {},
    }),
  },
  checkmark: {
    fontSize: 8,
    fontWeight: '700',
    color: KYC_COLORS.background.primary,
  },
  stepLabel: {
    ...KYC_TYPOGRAPHY.caption,
    marginTop: 8,
    textAlign: 'center',
  },
  lineContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  line: {
    height: 2,
    borderRadius: 1,
  },
  lineGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    top: 9,
    borderRadius: 3,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
});

export default KYCProgressBar;
