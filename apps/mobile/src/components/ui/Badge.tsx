/**
 * @deprecated This component is deprecated. Use TMBadge instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { Badge, NotificationBadge } from '@/components/ui/Badge';
 *
 * <Badge label="Active" variant="success" size="md" />
 * <NotificationBadge count={5} />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMBadge } from '@/components/ui/TMBadge';
 *
 * <TMBadge type="label" label="Active" variant="success" size="md" />
 * <TMBadge type="notification" count={5} />
 * ```
 *
 * This file re-exports from TMBadge for backward compatibility.
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TMBadge, LabelVariant, BadgeSize } from './TMBadge';

interface BadgeProps {
  label: string;
  variant?: LabelVariant;
  size?: BadgeSize;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  dot?: boolean;
  style?: ViewStyle;
}

/**
 * @deprecated Use TMBadge with type="label" instead
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  style,
}) => (
  <TMBadge
    type="label"
    label={label}
    variant={variant}
    size={size}
    icon={icon}
    showDot={dot}
    style={style}
  />
);

interface NotificationBadgeProps {
  count: number;
  max?: number;
  style?: ViewStyle;
}

/**
 * @deprecated Use TMBadge with type="notification" instead
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  style,
}) => (
  <TMBadge
    type="notification"
    count={count}
    maxCount={max}
    style={style}
  />
);

export default Badge;
