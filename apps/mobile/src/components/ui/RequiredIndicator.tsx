/**
 * RequiredIndicator Component
 * Lovendo Ultimate Design System 2026
 *
 * Provides clear visual indication for required form fields.
 * Follows accessibility best practices for form labeling.
 *
 * Usage:
 *   <FormLabel>
 *     Email <RequiredIndicator />
 *   </FormLabel>
 *
 *   <RequiredIndicator showText />
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

export interface RequiredIndicatorProps {
  /**
   * Show "Required" text instead of just asterisk
   * @default false
   */
  showText?: boolean;

  /**
   * Custom color for the indicator
   * @default COLORS.feedback.error (red)
   */
  color?: string;

  /**
   * Size of the asterisk
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Custom accessibility label
   * @default "required field"
   */
  accessibilityLabel?: string;
}

const SIZES = {
  sm: 12,
  md: 14,
  lg: 16,
};

/**
 * Visual indicator for required form fields
 *
 * Accessibility:
 * - Uses accessibilityRole="text" for screen readers
 * - Provides descriptive accessibilityLabel
 * - Uses semantic color (error/red) for visual distinction
 */
export const RequiredIndicator: React.FC<RequiredIndicatorProps> = ({
  showText = false,
  color = COLORS.feedback.error,
  size = 'md',
  accessibilityLabel = 'required field',
}) => {
  const fontSize = SIZES[size];

  if (showText) {
    return (
      <View style={styles.container}>
        <Text
          style={[styles.textIndicator, { color }]}
          accessibilityRole="text"
          accessibilityLabel={accessibilityLabel}
        >
          (Required)
        </Text>
      </View>
    );
  }

  return (
    <Text
      style={[styles.asterisk, { color, fontSize }]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      *
    </Text>
  );
};

/**
 * FormFieldLabel Component
 *
 * Combines label text with optional required indicator.
 * Use this for consistent form field labeling.
 */
export interface FormFieldLabelProps {
  /** Label text */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Show "Required" text instead of asterisk */
  showRequiredText?: boolean;
  /** Custom style for the label */
  style?: object;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const FormFieldLabel: React.FC<FormFieldLabelProps> = ({
  label,
  required = false,
  showRequiredText = false,
  style,
  size = 'md',
}) => {
  const fontSize = SIZES[size];

  return (
    <View style={styles.labelContainer}>
      <Text style={[styles.label, { fontSize }, style]}>
        {label}
        {required && (
          <>
            {' '}
            <RequiredIndicator showText={showRequiredText} size={size} />
          </>
        )}
      </Text>
    </View>
  );
};

/**
 * FormFieldHelper Component
 *
 * Helper text shown below form fields.
 * Supports error, warning, and info states.
 */
export interface FormFieldHelperProps {
  /** Helper text content */
  text: string;
  /** State variant */
  variant?: 'default' | 'error' | 'warning' | 'success';
  /** Whether this is for a required field (shows in error state) */
  isRequiredError?: boolean;
}

export const FormFieldHelper: React.FC<FormFieldHelperProps> = ({
  text,
  variant = 'default',
  isRequiredError = false,
}) => {
  const helperText = isRequiredError ? 'This field is required' : text;

  const getColor = () => {
    switch (variant) {
      case 'error':
        return COLORS.feedback.error;
      case 'warning':
        return COLORS.feedback.warning;
      case 'success':
        return COLORS.feedback.success;
      default:
        return COLORS.text.secondary;
    }
  };

  return (
    <Text
      style={[styles.helper, { color: getColor() }]}
      accessibilityRole="text"
      accessibilityLiveRegion={variant === 'error' ? 'polite' : 'none'}
    >
      {helperText}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  asterisk: {
    fontWeight: '700',
    lineHeight: 16,
  },
  textIndicator: {
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  helper: {
    fontSize: 12,
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
});

export default RequiredIndicator;
