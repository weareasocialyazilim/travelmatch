/**
 * CeremonyProgress Component
 *
 * Visual progress indicator for the proof ceremony flow.
 * Shows step dots with active/completed states.
 *
 * @example
 * ```tsx
 * <CeremonyProgress currentStep="capture" />
 * ```
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CEREMONY_STEP_ORDER, type CeremonyStep } from '@/constants/ceremony';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

interface CeremonyProgressProps {
  /** Current active step */
  currentStep: CeremonyStep;
  /** Test ID */
  testID?: string;
}

const STEP_ICONS: Record<CeremonyStep, string> = {
  intro: 'information',
  capture: 'camera',
  authenticate: 'shield-check',
  'thank-you': 'heart',
  celebrate: 'party-popper',
};

export const CeremonyProgress: React.FC<CeremonyProgressProps> = ({
  currentStep,
  testID,
}) => {
  // Filter out 'celebrate' step from progress display
  const displaySteps = CEREMONY_STEP_ORDER.slice(0, -1);
  const currentIndex = CEREMONY_STEP_ORDER.indexOf(currentStep);

  return (
    <View style={styles.container} testID={testID}>
      {displaySteps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <React.Fragment key={step}>
            {/* Step dot */}
            <ProgressDot
              isActive={isActive}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              icon={STEP_ICONS[step]}
            />

            {/* Connector line */}
            {index < displaySteps.length - 1 && (
              <ProgressLine isActive={index < currentIndex} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// Progress Dot Component
interface ProgressDotProps {
  isActive: boolean;
  isCurrent: boolean;
  isCompleted: boolean;
  icon: string;
}

const ProgressDot: React.FC<ProgressDotProps> = ({
  isActive,
  isCurrent,
  isCompleted,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isCurrent ? 1.2 : 1, { damping: 12 });

    return {
      transform: [{ scale }],
      backgroundColor: isActive ? COLORS.primary : COLORS.border.default,
    };
  });

  return (
    <Animated.View
      style={[styles.dot, animatedStyle, isCurrent && styles.dotCurrent]}
    >
      {isCompleted && (
        <MaterialCommunityIcons name="check" size={12} color={COLORS.white} />
      )}
    </Animated.View>
  );
};

// Progress Line Component
interface ProgressLineProps {
  isActive: boolean;
}

const ProgressLine: React.FC<ProgressLineProps> = ({ isActive }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isActive ? COLORS.primary : COLORS.border.default,
  }));

  return <Animated.View style={[styles.line, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xxs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCurrent: {
    width: 24,
    borderRadius: 12,
  },
  line: {
    width: 24,
    height: 2,
    borderRadius: 1,
  },
});

export default CeremonyProgress;
