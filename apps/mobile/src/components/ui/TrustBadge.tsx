/**
 * @deprecated This component is deprecated. Use TMBadge with type="trust" instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { TrustBadge } from '@/components/ui/TrustBadge';
 *
 * <TrustBadge score={85} size="medium" />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMBadge } from '@/components/ui/TMBadge';
 *
 * <TMBadge type="trust" trustScore={85} size="md" />
 * ```
 *
 * Size mapping:
 * - small → sm
 * - medium → md
 * - large → lg
 *
 * This file re-exports from TMBadge for backward compatibility.
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { TMBadge, BadgeSize } from './TMBadge';

// Map old sizes to new sizes
const SIZE_MAP: Record<string, BadgeSize> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

interface TrustBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

/**
 * @deprecated Use TMBadge with type="trust" instead
 */
export const TrustBadge: React.FC<TrustBadgeProps> = ({
  score,
  size = 'medium',
  style,
}) => (
  <TMBadge
    type="trust"
    trustScore={score}
    size={SIZE_MAP[size] || 'md'}
    style={style}
  />
);

export default TrustBadge;
