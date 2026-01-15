/**
 * Lovendo Vibe Room - Neon Status Badge
 *
 * Glowing status badges with neon aesthetic.
 * Shows chat/transaction status at a glance.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { ChatStatus } from '../types/inbox.types';
import { STATUS_BADGE_CONFIG } from '../types/inbox.types';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatusBadgeProps {
  status: ChatStatus;
  amount?: number;
  currency?: string;
  compact?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = memo(
  ({ status, amount, currency = '$', compact = false }) => {
    const config = STATUS_BADGE_CONFIG[status];

    if (!config) return null;

    // Format amount display
    const displayLabel = amount
      ? `${config.label} ${currency}${amount}`
      : config.label;

    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: config.backgroundColor },
          compact && styles.badgeCompact,
        ]}
      >
        {config.icon && (
          <MaterialCommunityIcons
            name={config.icon as IconName}
            size={compact ? 10 : 12}
            color={config.textColor}
          />
        )}
        <Text
          style={[
            styles.badgeText,
            { color: config.textColor },
            compact && styles.badgeTextCompact,
          ]}
        >
          {displayLabel}
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badgeTextCompact: {
    fontSize: 9,
    fontWeight: '800',
  },
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
