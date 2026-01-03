import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

interface StrengthResult {
  score: number; // 0-4
  labelKey: string;
  color: string;
}

interface Requirement {
  labelKey: string;
  met: boolean;
}

const getPasswordStrength = (password: string): StrengthResult => {
  if (!password) {
    return { score: 0, labelKey: '', color: COLORS.border.default };
  }

  let score = 0;

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;

  // Cap at 4
  score = Math.min(score, 4);

  const strengthMap: Record<number, { labelKey: string; color: string }> = {
    0: { labelKey: 'passwordStrength.veryWeak', color: COLORS.feedback.error },
    1: { labelKey: 'passwordStrength.weak', color: '#FF6B6B' },
    2: { labelKey: 'passwordStrength.fair', color: COLORS.feedback.warning },
    3: { labelKey: 'passwordStrength.strong', color: '#4ECDC4' },
    4: {
      labelKey: 'passwordStrength.veryStrong',
      color: COLORS.feedback.success,
    },
  };

  return { score, ...strengthMap[score] };
};

const getRequirements = (password: string): Requirement[] => [
  {
    labelKey: 'passwordStrength.requirements.minLength',
    met: password.length >= 8,
  },
  {
    labelKey: 'passwordStrength.requirements.uppercase',
    met: /[A-Z]/.test(password),
  },
  {
    labelKey: 'passwordStrength.requirements.lowercase',
    met: /[a-z]/.test(password),
  },
  {
    labelKey: 'passwordStrength.requirements.number',
    met: /\d/.test(password),
  },
  {
    labelKey: 'passwordStrength.requirements.special',
    met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  },
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRequirements = true,
}) => {
  const { t } = useTranslation();
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const requirements = useMemo(() => getRequirements(password), [password]);

  const barWidthStyle = useAnimatedStyle(() => ({
    width: withSpring(`${(strength.score / 4) * 100}%`, {
      damping: 15,
      stiffness: 100,
    }),
  }));

  const barColorStyle = useAnimatedStyle(() => ({
    backgroundColor: strength.color,
  }));

  if (!password) return null;

  return (
    <View style={styles.container}>
      {/* Strength Bar */}
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[styles.barFill, barWidthStyle, barColorStyle]}
          />
        </View>
        {strength.labelKey && (
          <Text style={[styles.label, { color: strength.color }]}>
            {t(strength.labelKey)}
          </Text>
        )}
      </View>

      {/* Requirements List */}
      {showRequirements && (
        <View style={styles.requirementsContainer}>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirementRow}>
              <View
                style={[
                  styles.requirementDot,
                  req.met ? styles.requirementMet : styles.requirementUnmet,
                ]}
              />
              <Text
                style={[
                  styles.requirementText,
                  req.met && styles.requirementTextMet,
                ]}
              >
                {t(req.labelKey)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barBackground: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
  },
  requirementsContainer: {
    marginTop: 12,
    gap: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  requirementMet: {
    backgroundColor: COLORS.feedback.success,
  },
  requirementUnmet: {
    backgroundColor: COLORS.border.default,
  },
  requirementText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  requirementTextMet: {
    color: COLORS.text.primary,
  },
});

export default PasswordStrengthMeter;
