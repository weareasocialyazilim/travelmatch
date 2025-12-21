/**
 * Controlled Input for React Hook Form
 * React Hook Form ile entegre input component
 */

import React, { useState, useEffect } from 'react';
import type { TextInputProps } from 'react-native';
import { Controller } from 'react-hook-form';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Input } from './Input';
import { PasswordInput } from './PasswordInput';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface ControlledInputProps<T extends FieldValues> extends Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onChange' | 'onBlur'
> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  required?: boolean;
  showSuccess?: boolean;
  isPassword?: boolean;
  error?: string; // External error message (optional override)
}

interface InputWithValidationProps {
   
  InputComponent: React.ComponentType<any>;
  onChange: (text: string) => void;
  onBlur: () => void;
  error?: { message?: string };
  showSuccess?: boolean;
  value: string;
  touched?: boolean;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  required?: boolean;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  testID?: string;
}

// Internal component to handle validation state
function InputWithValidation({
  InputComponent,
  onChange,
  onBlur,
  error,
  showSuccess,
  value,
  touched: initialTouched,
  ...props
}: InputWithValidationProps) {
  const [touched, setTouched] = useState(initialTouched || false);
  const [showError, setShowError] = useState(false);

  // Progressive error reveal
  useEffect(() => {
    if (touched && error) {
      const timer = setTimeout(() => setShowError(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
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
      <InputComponent
        value={value}
        onChangeText={handleChange}
        onBlur={handleBlur}
        error={showError ? error?.message : undefined}
        showSuccess={showSuccess && !error && value && touched}
        {...props}
      />
    </Animated.View>
  );
}

export function ControlledInput<T extends FieldValues>({
  name,
  control,
  label,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required,
  showSuccess,
  isPassword,
  error: externalError,
  ...inputProps
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        const InputComponent = isPassword ? PasswordInput : Input;
        // Use external error if provided, otherwise use form error
        const finalError = externalError ? { message: externalError } : error;

        return (
          <InputWithValidation
            InputComponent={InputComponent}
            label={label}
            value={(value as string) ?? ''}
            onChange={(text: string) => onChange(text)}
            onBlur={() => onBlur()}
            error={finalError}
            hint={hint}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            onRightIconPress={onRightIconPress}
            required={required}
            showSuccess={showSuccess}
            {...inputProps}
          />
        );
      }}
    />
  );
}
