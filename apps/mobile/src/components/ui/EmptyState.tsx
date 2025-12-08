import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
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
            color={COLORS.gray[400]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 100,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    maxWidth: '80%',
  },
  button: {
    minWidth: 120,
  },
});
