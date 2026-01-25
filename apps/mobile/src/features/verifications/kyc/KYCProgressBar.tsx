// KYC Ceremony Progress Bar - Awwwards standard animated progress
// Features neon glow, step indicators, and silky animations
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { SPACING, RADIUS } from '@/constants/spacing';
import { getStepProgress } from './constants';

// Step configuration with icons
const CEREMONY_STEPS = [
  { id: 'document', icon: 'card-account-details-outline', label: 'Belge' },
  { id: 'upload', icon: 'cloud-upload-outline', label: 'Yükle' },
  { id: 'selfie', icon: 'camera-outline', label: 'Selfie' },
  { id: 'review', icon: 'check-circle-outline', label: 'Onay' },
];

interface KYCProgressBarProps {
  currentStep: string;
  /** Show step icons instead of simple bar */
  variant?: 'simple' | 'ceremony';
}

export const KYCProgressBar: React.FC<KYCProgressBarProps> = ({
  currentStep,
  variant = 'ceremony',
}) => {
  const { current, total, percentage } = getStepProgress(currentStep);

  // Animated progress value
  const progressAnim = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withTiming(percentage, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage, progressAnim]);

  // Glow pulse animation for active step
  useEffect(() => {
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glowPulse]);

  // Animated progress bar style
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  // Animated glow style
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.1]) }],
  }));

  if (variant === 'simple') {
    return (
      <View style={styles.simpleContainer}>
        <Text style={styles.progressText}>
          Adım {current} / {total}
        </Text>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, progressBarStyle]}>
            {/* Neon glow overlay */}
            <View style={styles.progressGlow} />
          </Animated.View>
        </View>
      </View>
    );
  }

  // Ceremony variant with step indicators
  return (
    <View style={styles.ceremonyContainer}>
      {/* Step label */}
      <Text style={styles.ceremonyLabel}>Seremoni İlerlemesi</Text>

      {/* Step indicators */}
      <View style={styles.stepsContainer}>
        {CEREMONY_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = current > stepNumber;
          const isActive = current === stepNumber;
          const isPending = current < stepNumber;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <View style={styles.stepWrapper}>
                {/* Active glow ring */}
                {isActive && (
                  <Animated.View style={[styles.activeGlow, glowStyle]} />
                )}

                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isActive && styles.stepCircleActive,
                    isPending && styles.stepCirclePending,
                  ]}
                >
                  {isCompleted ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color={COLORS.white}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={
                        step.icon as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={16}
                      color={
                        isActive
                          ? COLORS.primary
                          : isPending
                            ? COLORS.text.tertiary
                            : COLORS.white
                      }
                    />
                  )}
                </View>

                {/* Step label */}
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isActive && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {/* Connector line */}
              {index < CEREMONY_STEPS.length - 1 && (
                <View style={styles.connectorWrapper}>
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted && styles.connectorLineCompleted,
                    ]}
                  />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Progress percentage */}
      <View style={styles.percentageContainer}>
        <Animated.Text style={styles.percentageText}>
          {Math.round(percentage)}%
        </Animated.Text>
        <Text style={styles.percentageLabel}>tamamlandı</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Simple variant styles
  simpleContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.base,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.border.default,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    position: 'relative',
    overflow: 'hidden',
  },
  progressGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.6,
  },

  // Ceremony variant styles
  ceremonyContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface.muted,
    marginHorizontal: SPACING.base,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  ceremonyLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  activeGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    top: -8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface.base,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.trust.primary,
    borderColor: COLORS.trust.primary,
  },
  stepCircleActive: {
    backgroundColor: COLORS.surface.base,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  stepCirclePending: {
    backgroundColor: COLORS.surface.muted,
    borderColor: COLORS.border.light,
  },
  stepLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: COLORS.trust.primary,
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  connectorWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 14, // Align with center of circles
  },
  connectorLine: {
    height: 2,
    width: '100%',
    backgroundColor: COLORS.border.default,
    marginHorizontal: SPACING.xs,
  },
  connectorLineCompleted: {
    backgroundColor: COLORS.trust.primary,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  percentageText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: '700',
  },
  percentageLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
});

export default KYCProgressBar;
