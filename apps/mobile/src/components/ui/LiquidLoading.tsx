/**
 * @deprecated This component is deprecated. Use TMLoading with type="liquid" instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { LiquidLoading } from '@/components/ui/LiquidLoading';
 *
 * <LiquidLoading message="Loading..." blur size="md" variant="primary" />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMLoading } from '@/components/ui/TMLoading';
 *
 * <TMLoading type="liquid" message="Loading..." blur size="md" variant="primary" />
 * ```
 *
 * All props are the same, just add type="liquid".
 *
 * This file re-exports from TMLoading for backward compatibility.
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { TMLoading, LoadingSize, LoadingVariant } from './TMLoading';

interface LiquidLoadingProps {
  /** Loading message */
  message?: string;
  /** Custom messages array for rotation */
  messages?: string[];
  /** Show backdrop blur */
  blur?: boolean;
  /** Intensity of blur (1-100) */
  blurIntensity?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Show or hide the loading */
  visible?: boolean;
  /** Size variant */
  size?: LoadingSize;
  /** Color variant */
  variant?: LoadingVariant;
}

/**
 * @deprecated Use TMLoading with type="liquid" instead
 */
export const LiquidLoading: React.FC<LiquidLoadingProps> = ({
  message,
  messages,
  blur = true,
  blurIntensity = 20,
  style,
  visible = true,
  size = 'md',
  variant = 'primary',
}) => (
  <TMLoading
    type="liquid"
    message={message}
    messages={messages}
    blur={blur}
    blurIntensity={blurIntensity}
    style={style}
    visible={visible}
    size={size}
    variant={variant}
  />
);

export default LiquidLoading;
