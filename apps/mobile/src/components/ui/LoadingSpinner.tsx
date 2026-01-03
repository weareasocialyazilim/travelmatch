/**
 * @deprecated This component is deprecated. Use TMLoading with type="simple" instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
 *
 * <LoadingSpinner size="large" color="#FFF" />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMLoading } from '@/components/ui/TMLoading';
 *
 * <TMLoading type="simple" size="large" color="#FFF" />
 * ```
 *
 * This file re-exports from TMLoading for backward compatibility.
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { TMLoading } from './TMLoading';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

/**
 * @deprecated Use TMLoading with type="simple" instead
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  style,
}) => (
  <TMLoading
    type="simple"
    size={size}
    color={color}
    style={style}
  />
);

export default LoadingSpinner;
