/**
 * Controlled Input for React Hook Form
 * React Hook Form ile entegre input component - Uses LiquidInput (Master Design)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { TextInputProps, ViewStyle } from 'react-native';
import { Controller } from 'react-hook-form';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LiquidInput } from './LiquidInput';
import type { Control, FieldValues, Path } from 'react-hook-form';
import type { Ionicons } from '@expo/vector-icons';

interface ControlledInputProps<T extends FieldValues> extends Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onChange' | 'onBlur'
> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  showSuccess?: boolean;
  /** Accessibility label for screen readers (defaults to label prop) */
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

export function ControlledInput<T extends FieldValues>({
  name,
  control,
  label,
  icon,
  containerStyle,
  isPassword,
  accessibilityLabel,
  accessibilityHint,
  ...inputProps
}: ControlledInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showError, setShowError] = useState(false);

  // Track error state for progressive reveal
  const errorRef = useRef<string | undefined>(undefined);
  const touchedRef = useRef(false);

  const _togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Progressive error reveal - MOVED OUTSIDE RENDER CALLBACK (Rules of Hooks)
  useEffect(() => {
    if (touchedRef.current && errorRef.current) {
      const timer = setTimeout(() => setShowError(true), 300);
      return () => clearTimeout(timer);
    }
    setShowError(false);
    return undefined;
  }, [touched]); // Re-run when touched changes

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        // Update refs for the useEffect above
        errorRef.current = error?.message;
        touchedRef.current = touched;

        const handleBlur = () => {
          setTouched(true);
          onBlur();
        };

        const handleChange = (text: string) => {
          if (showError) {
            setShowError(false);
          }
          onChange(text);
        };

        return (
          <Animated.View
            entering={showError ? FadeIn.duration(300) : undefined}
          >
            <LiquidInput
              value={(value as string) ?? ''}
              onChangeText={handleChange}
              onBlur={handleBlur}
              label={label}
              icon={isPassword ? 'lock-closed-outline' : icon}
              error={showError ? error?.message : undefined}
              containerStyle={containerStyle}
              secureTextEntry={isPassword && !showPassword}
              autoCapitalize={isPassword ? 'none' : inputProps.autoCapitalize}
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              accessibilityLabel={accessibilityLabel || label}
              accessibilityHint={accessibilityHint}
              {...inputProps}
            />
          </Animated.View>
        );
      }}
    />
  );
}
