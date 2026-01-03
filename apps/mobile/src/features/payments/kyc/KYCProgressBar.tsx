/**
 * KYCProgressBar Component
 *
 * Ceremony-focused silky progress bar with neon highlights.
 * Part of the Awwwards-standard KYC verification flow.
 *
 * Features:
 * - Glass-textured track
 * - Neon glow on active steps
 * - Mono font for step labels
 * - Animated transitions
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/typography';
import { getStepProgress } from './constants';

// Step labels for the ceremony progress bar
const STEPS = ['BELGE', 'TARAMA', 'LIVENESS', 'ONAY'];

interface KYCProgressBarProps {
  /** Current step identifier (from constants) */
  currentStep: string;
}

/**
 * Single step dot with neon glow animation
 */
const StepDot: React.FC<{
  isActive: boolean;
  isCurrent: boolean;
  label: string;
}> = ({ isActive, isCurrent, label }) => {
  const scale = useSharedValue(isCurrent ? 1 : 0.6);
  const glowOpacity = useSharedValue(isCurrent ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isCurrent ? 1 : 0.6, { damping: 15 });
    glowOpacity.value = withTiming(isCurrent ? 1 : 0, { duration: 300 });
  }, [isCurrent, scale, glowOpacity]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.stepItem}>
      {/* Neon glow layer */}
      <Animated.View style={[styles.dotGlow, glowStyle]} />

      {/* Dot */}
      <Animated.View
        style={[
          styles.dot,
          isActive && styles.activeDot,
          isCurrent && styles.currentDot,
          dotStyle,
        ]}
      >
        {isCurrent && <View style={styles.dotInner} />}
      </Animated.View>

      {/* Label */}
      <Text
        style={[
          styles.label,
          isActive && styles.activeLabel,
          isCurrent && styles.currentLabel,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

/**
 * Animated connecting line between steps
 */
const ConnectingLine: React.FC<{
  isActive: boolean;
}> = ({ isActive }) => {
  const fillWidth = useSharedValue(isActive ? 100 : 0);

  useEffect(() => {
    fillWidth.value = withTiming(isActive ? 100 : 0, { duration: 400 });
  }, [isActive, fillWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value}%`,
  }));

  return (
    <View style={styles.lineContainer}>
      <View style={styles.line} />
      <Animated.View style={[styles.lineFill, fillStyle]} />
    </View>
  );
};

/**
 * Ceremony-focused silky progress bar with neon highlights.
 * Displays steps as dots with connecting lines and mono-font labels.
 */
export const KYCProgressBar: React.FC<KYCProgressBarProps> = ({
  currentStep,
}) => {
  // Map step index to STEPS array index
  // intro=0, document=1, upload=2, selfie=3, review=4
  const stepMapping: Record<string, number> = {
    intro: -1, // Before first step
    document: 0, // BELGE
    upload: 1, // TARAMA
    selfie: 2, // LIVENESS
    review: 3, // ONAY
    pending: 4, // Complete
  };

  const currentStepIndex = stepMapping[currentStep] ?? 0;

  return (
    <View style={styles.container}>
      {/* Glass background */}
      <View style={styles.glassBackground} />

      {/* Track with steps */}
      <View style={styles.track}>
        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <React.Fragment key={step}>
              <StepDot isActive={isActive} isCurrent={isCurrent} label={step} />
              {index < STEPS.length - 1 && (
                <ConnectingLine isActive={index < currentStepIndex} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    position: 'relative',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  // Neon glow behind the dot
  dotGlow: {
    position: 'absolute',
    top: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  // Base dot style
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.text.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  currentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  // Label styles
  label: {
    fontSize: 9,
    fontFamily: FONTS.mono.regular,
    color: COLORS.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: COLORS.text.secondary,
  },
  currentLabel: {
    color: COLORS.primary,
    fontFamily: FONTS.mono.medium,
    fontWeight: '700',
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  // Connecting line
  lineContainer: {
    flex: 1,
    height: 2,
    marginTop: 4,
    marginHorizontal: 8,
    position: 'relative',
  },
  line: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
  },
  lineFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});

export default KYCProgressBar;
