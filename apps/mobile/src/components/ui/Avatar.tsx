/**
 * @deprecated This component is deprecated. Use TMAvatar instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { Avatar } from '@/components/ui/Avatar';
 *
 * <Avatar source="url" name="John" size="md" showBadge showVerified />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMAvatar } from '@/components/ui/TMAvatar';
 *
 * <TMAvatar source="url" name="John" size="md" showStatus status="online" showVerified />
 * ```
 *
 * Key changes:
 * - `showBadge` → `showStatus` with `status` prop ('online' | 'offline' | 'away')
 * - `badgeColor` → Use `status` prop instead (colors are automatic)
 * - More sizes available: 'xxs', 'hero', 'profile'
 * - `showBorder` and `borderColor` props added
 *
 * This file re-exports from TMAvatar for backward compatibility.
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { TMAvatar, AvatarSize as TMAvatarSize } from './TMAvatar';

// Map old size to new size
const SIZE_MAP: Record<string, TMAvatarSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

interface LegacyAvatarProps {
  source?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeColor?: string;
  showVerified?: boolean;
  style?: ViewStyle;
}

/**
 * @deprecated Use TMAvatar instead
 */
export const Avatar: React.FC<LegacyAvatarProps> = ({
  source,
  name,
  size = 'md',
  showBadge = false,
  showVerified = false,
  style,
}) => {
  return (
    <TMAvatar
      source={source}
      name={name}
      size={SIZE_MAP[size] || 'md'}
      showStatus={showBadge}
      status={showBadge ? 'online' : 'offline'}
      showVerified={showVerified}
      style={style}
    />
  );
};

export default Avatar;

// Re-export types from TMAvatar for any type usage
export type { AvatarSize } from './TMAvatar';
