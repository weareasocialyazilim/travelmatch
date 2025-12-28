import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from './Button';
import { EmptyStateIllustration } from './EmptyStateIllustration';
import type { IllustrationType } from './EmptyStateIllustration';

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  subtitle?: string; // Alias for description to support both props
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: React.ReactNode;
  illustrationType?: IllustrationType;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  description,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
  illustrationType,
  style,
}) => {
  const desc = description || subtitle;

  return (
    <View style={[styles.container, style]}>
      {illustration ? (
        illustration
      ) : illustrationType ? (
        <EmptyStateIllustration type={illustrationType} size={160} />
      ) : (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={48}
            color={primitives.stone[400]}
          />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>
      {desc && <Text style={styles.description}>{desc}</Text>}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.button}
        />
      )}

      {secondaryActionLabel && onSecondaryAction && (
        <Button
          title={secondaryActionLabel}
          onPress={onSecondaryAction}
          variant="secondary"
          size="md"
          style={styles.secondaryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: primitives.stone[100],
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    width: 100,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    maxWidth: '80%',
  },
  button: {
    minWidth: 120,
  },
  secondaryButton: {
    minWidth: 120,
    marginTop: SPACING.sm,
  },
});
