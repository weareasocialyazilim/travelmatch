/**
 * DashboardStatCard - Summary metric card with trend indicators
 *
 * Implements UX best practices from Tranzacta design:
 * - Large value display with currency/unit support
 * - Trend indicator (up/down arrow with percentage)
 * - Progress bar for limits/quotas
 * - "Since last week" comparison text
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
import { COLORS, primitives } from '@/constants/colors';

type TrendDirection = 'up' | 'down' | 'neutral';

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  prefix?: string; // Currency symbol like "$", "₺"
  suffix?: string; // Unit like "k", "%"
  trend?: {
    direction: TrendDirection;
    value: number; // Percentage change
    label?: string; // "Son hafta", "Geçen ay", etc.
  };
  progress?: {
    current: number;
    max: number;
    label?: string; // "Günlük Limit", etc.
  };
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  variant?: 'default' | 'compact' | 'dark';
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const DashboardStatCard = memo<DashboardStatCardProps>(
  function DashboardStatCard({
    label,
    value,
    prefix,
    suffix,
    trend,
    progress,
    icon,
    iconColor,
    variant = 'default',
    onPress,
    style,
    testID,
  }) {
    // Trend colors based on direction
    const trendConfig = useMemo(() => {
      switch (trend?.direction) {
        case 'up':
          return {
            color: primitives.emerald[500],
            bgColor: primitives.emerald[50],
            icon: 'arrow-up' as const,
          };
        case 'down':
          return {
            color: primitives.red[500],
            bgColor: primitives.red[50],
            icon: 'arrow-down' as const,
          };
        default:
          return {
            color: primitives.stone[500],
            bgColor: primitives.stone[100],
            icon: 'minus' as const,
          };
      }
    }, [trend?.direction]);

    // Progress percentage
    const progressPercentage = useMemo(() => {
      if (!progress) return 0;
      return Math.min((progress.current / progress.max) * 100, 100);
    }, [progress]);

    // Progress bar color based on percentage
    const progressColor = useMemo(() => {
      if (progressPercentage >= 90) return primitives.red[500];
      if (progressPercentage >= 70) return primitives.amber[500];
      return primitives.emerald[500];
    }, [progressPercentage]);

    const isDark = variant === 'dark';
    const isCompact = variant === 'compact';

    const Container = onPress ? TouchableOpacity : View;
    const containerProps = onPress
      ? { onPress, activeOpacity: 0.7 }
      : {};

    return (
      <Container
        style={[
          styles.card,
          isDark && styles.cardDark,
          isCompact && styles.cardCompact,
          style,
        ]}
        testID={testID}
        {...containerProps}
      >
        {/* Header with icon and trend */}
        <View style={styles.header}>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                isDark && styles.iconContainerDark,
              ]}
            >
              <MaterialCommunityIcons
                name={icon}
                size={20}
                color={iconColor || (isDark ? COLORS.white : COLORS.text.secondary)}
              />
            </View>
          )}

          {trend && (
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : trendConfig.bgColor },
              ]}
            >
              <MaterialCommunityIcons
                name={trendConfig.icon}
                size={12}
                color={trendConfig.color}
              />
              <Text style={[styles.trendText, { color: trendConfig.color }]}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </Text>
            </View>
          )}
        </View>

        {/* Trend label (e.g., "Son hafta") */}
        {trend?.label && (
          <Text style={[styles.trendLabel, isDark && styles.textLight]}>
            {trend.label}
          </Text>
        )}

        {/* Label */}
        <Text
          style={[
            styles.label,
            isDark && styles.textLight,
            isCompact && styles.labelCompact,
          ]}
        >
          {label}
        </Text>

        {/* Value */}
        <View style={styles.valueRow}>
          {prefix && (
            <Text
              style={[
                styles.prefix,
                isDark && styles.textWhite,
              ]}
            >
              {prefix}
            </Text>
          )}
          <Text
            style={[
              styles.value,
              isDark && styles.textWhite,
              isCompact && styles.valueCompact,
            ]}
          >
            {value}
          </Text>
          {suffix && (
            <Text
              style={[
                styles.suffix,
                isDark && styles.textWhite,
              ]}
            >
              {suffix}
            </Text>
          )}
        </View>

        {/* Progress bar */}
        {progress && (
          <View style={styles.progressContainer}>
            {progress.label && (
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, isDark && styles.textLight]}>
                  {progress.label}
                </Text>
                <Text style={[styles.progressValue, isDark && styles.textLight]}>
                  {progress.current.toLocaleString('tr-TR')} / {progress.max.toLocaleString('tr-TR')}
                </Text>
              </View>
            )}
            <View style={[styles.progressBar, isDark && styles.progressBarDark]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Arrow indicator for clickable cards */}
        {onPress && (
          <View style={styles.arrowContainer}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={isDark ? 'rgba(255,255,255,0.5)' : COLORS.text.secondary}
            />
          </View>
        )}
      </Container>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: primitives.stone[900],
  },
  cardCompact: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: primitives.stone[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  labelCompact: {
    fontSize: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: 2,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    fontVariant: ['tabular-nums'],
  },
  valueCompact: {
    fontSize: 22,
  },
  suffix: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: 2,
  },
  textWhite: {
    color: COLORS.white,
  },
  textLight: {
    color: 'rgba(255,255,255,0.7)',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: primitives.stone[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  arrowContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
  },
});

export default DashboardStatCard;
