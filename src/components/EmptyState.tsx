import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { radii } from '../constants/radii';
import type { IllustrationType } from './EmptyStateIllustration';
import { EmptyStateIllustration } from './EmptyStateIllustration';

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
  illustrationType?: IllustrationType;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'information-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
  illustration,
  illustrationType,
}) => {
  return (
    <View style={styles.container}>
      {illustration ? (
        illustration
      ) : illustrationType ? (
        <EmptyStateIllustration type={illustrationType} size={160} />
      ) : (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={80}
            color={COLORS.textTertiary}
          />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: radii.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  actionText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: radii.full,
    height: 140,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 140,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export type { EmptyStateProps };
export default EmptyState;
