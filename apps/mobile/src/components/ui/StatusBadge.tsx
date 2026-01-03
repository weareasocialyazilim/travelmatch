import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { GlassCard } from './GlassCard';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'live' | 'neutral';

interface StatusBadgeProps {
  /** Badge label text */
  label: string;
  /** Status type determines color scheme */
  type?: StatusType;
  /** Show animated dot indicator */
  showDot?: boolean;
  /** Container style override */
  style?: ViewStyle;
}

/**
 * Universal Liquid Status Badge - "Mikro Tipografi + Neon Vurgular"
 * Awwwards kalitesinde durum göstergesi.
 *
 * Features:
 * - GlassCard background with blur
 * - Glowing dot indicator with shadow
 * - Uppercase mono typography
 * - Neon accent colors for each status type
 */
export const StatusBadge: React.FC<StatusBadgeProps> = memo(
  ({ label, type = 'info', showDot = true, style }) => {
    // Get color based on status type
    const statusColor = useMemo(() => {
      switch (type) {
        case 'success':
          return COLORS.feedback.success;
        case 'warning':
          return COLORS.feedback.warning;
        case 'error':
          return COLORS.feedback.error;
        case 'live':
          return COLORS.feedback.success;
        case 'neutral':
          return COLORS.text.secondary;
        case 'info':
        default:
          return COLORS.feedback.info;
      }
    }, [type]);

    // Memoize dot style with glow effect
    const dotStyle = useMemo(
      () => [
        styles.dot,
        {
          backgroundColor: statusColor,
          shadowColor: statusColor,
        },
      ],
      [statusColor],
    );

    return (
      <GlassCard
        intensity={20}
        showBorder={false}
        padding={0}
        style={[styles.container, style]}
      >
        <View style={styles.content}>
          {showDot && <View style={dotStyle} />}
          <Text style={styles.text}>{label.toUpperCase()}</Text>
        </View>
      </GlassCard>
    );
  },
  (prevProps, nextProps) =>
    prevProps.label === nextProps.label &&
    prevProps.type === nextProps.type &&
    prevProps.showDot === nextProps.showDot,
);

StatusBadge.displayName = 'StatusBadge';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface.glass,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 4,
  },
  text: {
    fontSize: 9,
    fontFamily: FONTS.mono.medium,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.text.primary,
  },
});

export default StatusBadge;
