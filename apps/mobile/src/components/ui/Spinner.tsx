/**
 * @deprecated This component is deprecated. Use TMLoading with type="standard" instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { Spinner } from '@/components/ui/Spinner';
 *
 * <Spinner size="large" message="Loading..." fullScreen />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMLoading } from '@/components/ui/TMLoading';
 *
 * <TMLoading type="standard" size="large" message="Loading..." fullScreen />
 * ```
 *
 * This file re-exports from TMLoading for backward compatibility.
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { TMLoading } from './TMLoading';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

/**
 * @deprecated Use TMLoading with type="standard" instead
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'large',
  color,
  message,
  fullScreen = false,
  style,
}) => (
  <TMLoading
    type="standard"
    size={size}
    color={color}
    message={message}
    fullScreen={fullScreen}
    style={style}
  />
);

export default Spinner;
