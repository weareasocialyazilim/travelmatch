/**
 * GiftJourneyTimeline Component
 *
 * Visual timeline showing the gift journey through escrow.
 * Displays 5 stages: Sent → In Escrow → Accepted → Proof Pending → Completed
 * Part of iOS 26.3 design system for TravelMatch.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

export type GiftStatus =
  | 'sent'
  | 'in_escrow'
  | 'accepted'
  | 'proof_pending'
  | 'completed'
  | 'rejected'
  | 'refunded';

interface TimelineStep {
  key: GiftStatus;
  icon: string;
  label: string;
  description: string;
}

const STEPS: TimelineStep[] = [
  {
    key: 'sent',
    icon: 'gift',
    label: 'Hediye Gönderildi',
    description: 'Ödeme alındı',
  },
  {
    key: 'in_escrow',
    icon: 'lock',
    label: 'Güvenli Kasada',
    description: 'Para bekliyor',
  },
  {
    key: 'accepted',
    icon: 'check-circle',
    label: 'Kabul Edildi',
    description: 'Alıcı onayladı',
  },
  {
    key: 'proof_pending',
    icon: 'camera',
    label: 'Proof Bekleniyor',
    description: 'Kanıt yüklenmeli',
  },
  {
    key: 'completed',
    icon: 'cash-check',
    label: 'Tamamlandı',
    description: 'Transfer edildi',
  },
];

interface GiftJourneyTimelineProps {
  /** Current status of the gift */
  currentStatus: GiftStatus;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

/**
 * Get the step index for a given status
 */
const getStepIndex = (status: GiftStatus): number => {
  const index = STEPS.findIndex((s) => s.key === status);
  return index >= 0 ? index : 0;
};

/**
 * Get status description for display
 */
export const getStatusDescription = (status: GiftStatus): string => {
  const step = STEPS.find((s) => s.key === status);
  return step?.description || '';
};

/**
 * Individual step circle with animation for current step
 */
const StepCircle: React.FC<{
  step: TimelineStep;
  isCompleted: boolean;
  isCurrent: boolean;
  isPending: boolean;
}> = ({ step, isCompleted, isCurrent, _isPending }) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isCurrent) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isCurrent, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const backgroundColor = isCompleted
    ? COLORS.success
    : isCurrent
      ? COLORS.primary
      : COLORS.gray[200];

  const iconColor = isCompleted || isCurrent ? COLORS.white : COLORS.gray[400];

  return (
    <Animated.View
      style={[
        styles.circle,
        { backgroundColor },
        isCurrent && styles.circleCurrent,
        animatedStyle,
      ]}
    >
      <MaterialCommunityIcons
        name={step.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={20}
        color={iconColor}
      />
    </Animated.View>
  );
};

export const GiftJourneyTimeline: React.FC<GiftJourneyTimelineProps> = ({
  currentStatus,
  compact = false,
}) => {
  const currentIndex = getStepIndex(currentStatus);

  // Handle special statuses (rejected, refunded)
  if (currentStatus === 'rejected' || currentStatus === 'refunded') {
    return (
      <View style={styles.specialStatus}>
        <View style={[styles.specialCircle, styles.errorCircle]}>
          <MaterialCommunityIcons
            name={currentStatus === 'rejected' ? 'close-circle' : 'cash-refund'}
            size={24}
            color={COLORS.white}
          />
        </View>
        <Text style={styles.specialLabel}>
          {currentStatus === 'rejected' ? 'Reddedildi' : 'İade Edildi'}
        </Text>
        <Text style={styles.specialDescription}>
          {currentStatus === 'rejected'
            ? 'Alıcı hediyeyi reddetti'
            : 'Ödeme iade edildi'}
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={step.key}>
              {index > 0 && (
                <View
                  style={[
                    styles.compactConnector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
              <View
                style={[
                  styles.compactDot,
                  isCompleted && styles.compactDotCompleted,
                  isCurrent && styles.compactDotCurrent,
                ]}
              />
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <View key={step.key} style={styles.stepContainer}>
            {/* Connector Line */}
            {index > 0 && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}

            {/* Step Circle */}
            <StepCircle
              step={step}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isPending={isPending}
            />

            {/* Step Label */}
            <View style={styles.labelContainer}>
              <Text
                style={[
                  styles.label,
                  (isCompleted || isCurrent) && styles.labelActive,
                ]}
              >
                {step.label}
              </Text>
              <Text style={styles.description}>{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  connector: {
    position: 'absolute',
    left: 19,
    top: -24,
    width: 2,
    height: 24,
    backgroundColor: COLORS.gray[200],
  },
  connectorCompleted: {
    backgroundColor: COLORS.success,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  circleCurrent: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  labelContainer: {
    flex: 1,
    paddingTop: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[400],
  },
  labelActive: {
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  compactConnector: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.gray[200],
  },
  compactDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gray[200],
  },
  compactDotCompleted: {
    backgroundColor: COLORS.success,
  },
  compactDotCurrent: {
    backgroundColor: COLORS.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  // Special status styles
  specialStatus: {
    alignItems: 'center',
    padding: 24,
  },
  specialCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorCircle: {
    backgroundColor: COLORS.error,
  },
  specialLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  specialDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default GiftJourneyTimeline;
