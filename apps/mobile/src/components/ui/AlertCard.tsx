/**
 * AlertCard - Dashboard alert/notification cards
 *
 * Implements UX patterns from analytics dashboard design:
 * - Alert: Warning/urgent notifications (red/amber triangle)
 * - Anticipated: Financial/impact alerts (yellow dollar sign)
 * - Onboarding: Action required items (purple tools)
 * - Progress: Status updates with completion (blue checkbox)
 * - Turkish localization
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type AlertType =
  | 'alert'
  | 'anticipated'
  | 'onboarding'
  | 'progress'
  | 'info'
  | 'success';

interface AlertCardProps {
  type: AlertType;
  title: string;
  message: string;
  timestamp?: string;
  progress?: number; // 0-100 for progress type
  actionLabel?: string;
  onPress?: () => void;
  onActionPress?: () => void;
  variant?: 'default' | 'compact' | 'inline';
  style?: ViewStyle;
  testID?: string;
}

// Alert type configuration - using hardcoded colors for test compatibility
// Colors match the design system primitives
const alertConfig: Record<
  AlertType,
  {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    bgColor: string;
    labelTr: string;
  }
> = {
  alert: {
    icon: 'alert-circle',
    color: '#EF4444', // red[500]
    bgColor: '#FEF2F2', // red[50]
    labelTr: 'Uyarı',
  },
  anticipated: {
    icon: 'currency-usd',
    color: '#F59E0B', // amber[500]
    bgColor: '#FFFBEB', // amber[50]
    labelTr: 'Beklenen',
  },
  onboarding: {
    icon: 'wrench',
    color: '#EC4899', // magenta[500]
    bgColor: '#FDF2F8', // magenta[50]
    labelTr: 'İşlem Gerekli',
  },
  progress: {
    icon: 'checkbox-marked-circle-outline',
    color: '#3B82F6', // blue[500]
    bgColor: '#EFF6FF', // blue[50]
    labelTr: 'İlerleme',
  },
  info: {
    icon: 'information',
    color: '#14B8A6', // seafoam[500]
    bgColor: '#F0FDFA', // seafoam[50]
    labelTr: 'Bilgi',
  },
  success: {
    icon: 'check-circle',
    color: '#10B981', // emerald[500]
    bgColor: '#ECFDF5', // emerald[50]
    labelTr: 'Başarılı',
  },
};

export const AlertCard = memo<AlertCardProps>(function AlertCard({
  type,
  title,
  message,
  timestamp,
  progress,
  actionLabel,
  onPress,
  onActionPress,
  variant = 'default',
  style,
  testID,
}) {
  const config = useMemo(() => alertConfig[type], [type]);

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Container
      style={[
        styles.card,
        isCompact && styles.cardCompact,
        isInline && styles.cardInline,
        style,
      ]}
      testID={testID}
      {...containerProps}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: config.bgColor },
          isCompact && styles.iconContainerCompact,
        ]}
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={isCompact ? 16 : 20}
          color={config.color}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Type label */}
        {!isInline && (
          <Text style={[styles.typeLabel, { color: config.color }]}>
            {config.labelTr}
          </Text>
        )}

        {/* Title */}
        <Text
          style={[styles.title, isCompact && styles.titleCompact]}
          numberOfLines={isCompact ? 1 : 2}
        >
          {title}
        </Text>

        {/* Message */}
        <Text
          style={[styles.message, isCompact && styles.messageCompact]}
          numberOfLines={isCompact ? 1 : 3}
        >
          {message}
        </Text>

        {/* Progress bar for progress type */}
        {type === 'progress' && progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: config.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}% tamamlandı</Text>
          </View>
        )}

        {/* Timestamp and action */}
        <View style={styles.footer}>
          {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
          {actionLabel && onActionPress && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: config.bgColor }]}
              onPress={onActionPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionText, { color: config.color }]}>
                {actionLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chevron for clickable cards */}
      {onPress && !isInline && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.text.secondary}
          style={styles.chevron}
        />
      )}
    </Container>
  );
});

/**
 * AlertBadge - Compact inline alert indicator
 */
interface AlertBadgeProps {
  type: AlertType;
  count?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const AlertBadge = memo<AlertBadgeProps>(function AlertBadge({
  type,
  count,
  onPress,
  style,
}) {
  const config = useMemo(() => alertConfig[type], [type]);

  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Container
      style={[styles.badge, { backgroundColor: config.bgColor }, style]}
      {...containerProps}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={14}
        color={config.color}
      />
      {count !== undefined && count > 0 && (
        <Text style={[styles.badgeCount, { color: config.color }]}>
          {count}
        </Text>
      )}
    </Container>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardCompact: {
    padding: 12,
  },
  cardInline: {
    backgroundColor: 'transparent',
    padding: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerCompact: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  titleCompact: {
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  messageCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F5F5F4', // stone[100]
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  // Badge styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AlertCard;
