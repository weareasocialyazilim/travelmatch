/**
 * Controlled Input for React Hook Form
 * React Hook Form ile entegre input component - Uses LiquidInput (Master Design)
 */

import React, { useState, useEffect, useCallback } from 'react';
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
}

export function ControlledInput<T extends FieldValues>({
  name,
  control,
  label,
  icon,
  containerStyle,
  isPassword,
  ...inputProps
}: ControlledInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showError, setShowError] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        // Progressive error reveal
        useEffect(() => {
          if (touched && error) {
            const timer = setTimeout(() => setShowError(true), 300);
            return () => clearTimeout(timer);
          }
          setShowError(false);
          return undefined;
        }, [touched, error]);

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
          <Animated.View entering={showError ? FadeIn.duration(300) : undefined}>
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
              autoCorrect={isPassword ? false : inputProps.autoCorrect}
              {...inputProps}
            />
          </Animated.View>
        );
      }}
    />
  );
}
